import {
  Injectable,
  Logger,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { FirebaseDataConnectService } from '../../common/supabase/supabase.service';
import { SubmitAttendanceDto } from './dto/attendance.dto';
import { AttendanceStatus, NotificationType } from '@giaovienhay/shared-types';
import { NotificationsService } from '../11-notifications/notifications.service';

export interface AbsentStudentItem {
  studentId: string;
  status: AttendanceStatus;
  note?: string | null;
}

export interface AbsentEventPayload {
  classId: string;
  absentStudentIds?: string[];
  absentStudents?: AbsentStudentItem[];
  date: string;
}

export interface AttendanceUpdatedPayload {
  classId: string;
  updatedStudentIds: string[];
  date: string;
}

export interface TodayPresentStudentsResponse {
  class_id: string;
  today: string;
  is_attended_today?: boolean;
  total_present?: number;
  present_students: Array<{
    id: string;
    full_name: string;
    student_code: string;
  }>;
}

function isValidCalendarDate(dateStr: string): boolean {
  if (!dateStr || typeof dateStr !== 'string') return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr.trim());
  if (!match) return false;
  const y = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const d = parseInt(match[3], 10);
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const date = new Date(y, m - 1, d);
  return (
    date.getFullYear() === y &&
    date.getMonth() === m - 1 &&
    date.getDate() === d
  );
}

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(
    private readonly dataConnect: FirebaseDataConnectService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly eventEmitter: EventEmitter2,
    private readonly notificationsService: NotificationsService,
  ) {}

  async submitAttendance(teacherId: string, dto: SubmitAttendanceDto) {
    if (!dto.class_id) {
      throw new BadRequestException({
        error_code: 'COMMON_VALIDATION_ERROR',
        message: 'Mã lớp học không được để trống',
      });
    }

    if (typeof this.dataConnect.getClassById === 'function') {
      const cls = await this.dataConnect.getClassById(dto.class_id);
      if (!cls) {
        throw new NotFoundException({
          error_code: 'CLASS_NOT_FOUND',
          message: 'Không tìm thấy lớp học',
        });
      }

      if (teacherId && !teacherId.startsWith('usr_admin')) {
        const homeroomId = cls.homeroom_teacher_id || cls.homeroomTeacherId;
        if (homeroomId && homeroomId !== teacherId) {
          throw new ForbiddenException({
            error_code: 'CLASS_NOT_HOMEROOM_TEACHER',
            message: 'Chỉ Giáo viên chủ nhiệm mới có quyền thực hiện thao tác này',
          });
        }
      }
    }

    if (!isValidCalendarDate(dto.attendance_date)) {
      throw new BadRequestException({
        error_code: 'ATTEND_DATE_INVALID',
        message: 'Dữ liệu ngày gửi lên không hợp lệ hoặc không tồn tại trong lịch thực tế',
        details: [
          {
            field: 'attendance_date',
            issue: `Giá trị '${dto.attendance_date}' không phải là ngày hợp lệ trong lịch thực tế`,
          },
        ],
      });
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    if (dto.attendance_date > todayStr) {
      throw new BadRequestException({
        error_code: 'ATTEND_DATE_IN_FUTURE',
        message: 'Không thể thực hiện điểm danh cho ngày trong tương lai',
        details: [
          {
            field: 'attendance_date',
            issue: `Ngày điểm danh không được vượt quá ngày hiện tại (${todayStr})`,
          },
        ],
      });
    }

    if (!dto.records || dto.records.length === 0) {
      throw new BadRequestException({
        error_code: 'COMMON_VALIDATION_ERROR',
        message: 'Dữ liệu gửi lên vi phạm quy tắc ràng buộc hoặc sai định dạng',
        details: [
          {
            field: 'records',
            issue: 'Danh sách học sinh điểm danh (records) không được rỗng (tối thiểu 1 học sinh)',
          },
        ],
      });
    }

    if (dto.records && dto.records.some((r) => r.note && r.note.length > 255)) {
      throw new BadRequestException({
        error_code: 'COMMON_VALIDATION_ERROR',
        message: 'Nội dung ghi chú vượt quá giới hạn độ dài cho phép (tối đa 255 ký tự)',
        details: [
          {
            field: 'records[0].note',
            issue: 'Ghi chú không được vượt quá 255 ký tự',
          },
        ],
      });
    }

    // Lấy trạng thái đã lưu trước đó để hỗ trợ chỉnh sửa (upsert) và chỉ thông báo học sinh có thay đổi
    const existingRecords = await this.dataConnect.getAttendanceByClassDate(dto.class_id, dto.attendance_date);
    const targetPeriod = dto.period || 1;
    const oldStatusMap = new Map<string, string>();
    (existingRecords || []).forEach((r: any) => {
      if ((r.period || 1) !== targetPeriod) return;
      const sid = r.studentId || r.student_id;
      if (sid) oldStatusMap.set(sid, r.status);
    });

    let presentCount = 0;
    let absentCount = 0;
    const changedAbsentList: AbsentStudentItem[] = [];
    const changedPresentIds: string[] = [];
    const now = new Date().toISOString();

    for (const record of dto.records) {
      const isAbsent = record.status !== AttendanceStatus.PRESENT;
      if (isAbsent) {
        absentCount++;
      } else {
        presentCount++;
      }

      // Chỉ thông báo khi trạng thái vừa thay đổi so với lần lưu trước
      const oldStatus = oldStatusMap.get(record.student_id);
      if (oldStatus === undefined) {
        if (isAbsent) {
          changedAbsentList.push({
            studentId: record.student_id,
            status: record.status,
            note: record.note,
          });
        }
      } else if (oldStatus !== record.status) {
        if (isAbsent) {
          changedAbsentList.push({
            studentId: record.student_id,
            status: record.status,
            note: record.note,
          });
        } else {
          changedPresentIds.push(record.student_id);
        }
      }

      const docId = `att_${dto.class_id}_${record.student_id}_${dto.attendance_date}`;
      const attRecord = {
        id: docId,
        class_id: dto.class_id,
        classId: dto.class_id,
        student_id: record.student_id,
        studentId: record.student_id,
        date: dto.attendance_date,
        attendance_date: dto.attendance_date,
        period: dto.period || 1,
        status: record.status,
        note: record.note || null,
        recorded_by: teacherId,
        updated_at: now,
      };

      // Lưu hoàn toàn vào SQL Data Connect
      await this.dataConnect.recordAttendance(attRecord);
    }

    // Xóa cache danh sách học sinh có mặt hôm nay của lớp này để làm mới dữ liệu
    const cacheKey = `att_present_${dto.class_id}_${dto.attendance_date}`;
    await this.cacheManager.del(cacheKey);

    // Bắn Event xử lý ngầm (Message Queue/Event-driven) cho Notifications:
    // - HS mới bị đánh vắng/đi muộn -> gửi thông báo chi tiết, ân cần tới phụ huynh
    // - HS được sửa từ vắng -> có mặt -> thông báo cập nhật điểm danh
    if (changedAbsentList.length > 0) {
      this.eventEmitter.emit('attendance.absent', {
        classId: dto.class_id,
        absentStudentIds: changedAbsentList.map((s) => s.studentId),
        absentStudents: changedAbsentList,
        date: dto.attendance_date,
      } as AbsentEventPayload);
    }
    if (changedPresentIds.length > 0) {
      this.eventEmitter.emit('attendance.updated', {
        classId: dto.class_id,
        updatedStudentIds: changedPresentIds,
        date: dto.attendance_date,
      } as AttendanceUpdatedPayload);
    }

    return {
      attendance_date: dto.attendance_date,
      total_students: dto.records.length,
      present_count: presentCount,
      absent_count: absentCount,
      notified_parents_queued: changedAbsentList.length + changedPresentIds.length,
      is_update: oldStatusMap.size > 0,
    };
  }

  async updateAttendanceRecord(recordId: string, status: AttendanceStatus, note?: string) {
    if (!status) {
      throw new BadRequestException({
        error_code: 'COMMON_VALIDATION_ERROR',
        message: 'Dữ liệu gửi lên vi phạm quy tắc ràng buộc hoặc sai định dạng',
        details: [
          {
            field: 'status',
            issue: 'Trạng thái điểm danh (status) bắt buộc phải được cung cấp',
          },
        ],
      });
    }

    let existing: any = null;
    if (typeof this.dataConnect.getAttendanceById === 'function') {
      existing = await this.dataConnect.getAttendanceById(recordId);
      if (!existing) {
        throw new NotFoundException({
          error_code: 'ATTEND_RECORD_NOT_FOUND',
          message: 'Không tìm thấy bản ghi điểm danh yêu cầu',
          details: null,
        });
      }
    }

    if (existing) {
      // Ghi đè bản ghi (id giữ nguyên) với trạng thái/ghi chú mới
      await this.dataConnect.recordAttendance({
        id: recordId,
        class_id: existing.classId,
        student_id: existing.studentId,
        date: existing.date,
        status,
        note: note ?? existing.note,
      });

      // Xóa cache hôm nay của lớp
      const cacheKey = `att_present_${existing.classId}_${existing.date}`;
      await this.cacheManager.del(cacheKey);

      // Thông báo nếu trạng thái thay đổi
      const oldStatus = existing.status;
      const isAbsent = status !== AttendanceStatus.PRESENT;
      const wasAbsent = oldStatus !== AttendanceStatus.PRESENT;
      if (oldStatus !== status) {
        if (isAbsent) {
          this.eventEmitter.emit('attendance.absent', {
            classId: existing.classId,
            absentStudentIds: [existing.studentId],
            absentStudents: [
              {
                studentId: existing.studentId,
                status,
                note: note ?? existing.note,
              },
            ],
            date: existing.date,
          } as AbsentEventPayload);
        } else if (wasAbsent) {
          this.eventEmitter.emit('attendance.updated', {
            classId: existing.classId,
            updatedStudentIds: [existing.studentId],
            date: existing.date,
          } as AttendanceUpdatedPayload);
        }
      }
    }

    return {
      message: 'Cập nhật điểm danh thành công',
      record_id: recordId,
      status,
      note,
      updated_at: new Date().toISOString(),
    };
  }

  async getClassAttendance(classId: string, date?: string, month?: string) {
    try {
      if (date && typeof this.dataConnect.getAttendanceByClassDate === 'function') {
        const sqlRecords = await this.dataConnect.getAttendanceByClassDate(classId, date);
        if (sqlRecords && sqlRecords.length > 0) {
          return sqlRecords;
        }
      }
      if (typeof this.dataConnect.getAttendanceByClass === 'function') {
        const sqlRecords = await this.dataConnect.getAttendanceByClass(classId, { date, month });
        if (sqlRecords && sqlRecords.length > 0) {
          return sqlRecords;
        }
      }
    } catch (e) {}

    return [];
  }

  async getTodayPresentStudents(classId: string): Promise<TodayPresentStudentsResponse> {
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `att_present_${classId}_${today}`;

    // Kiểm tra trong In-Memory RAM Cache trước (0ms)
    const cached = await this.cacheManager.get<TodayPresentStudentsResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    let presentStudents: any[] = [];

    try {
      const sqlList = await this.dataConnect.getAttendanceByClassDate(classId, today);
      const presents = (sqlList || []).filter((a: any) => a.status === AttendanceStatus.PRESENT);
      if (presents.length > 0) {
        const studentMap = new Map<string, any>();
        try {
          const students = await this.dataConnect.listStudentsByClass(classId);
          (students || []).forEach((s: any) => studentMap.set(s.id, s));
        } catch (e) {}

        presentStudents = presents.map((p: any) => {
          const sid = p.studentId || p.student_id;
          const st = studentMap.get(sid);
          return {
            id: sid,
            full_name: p.full_name || p.student_name || st?.full_name || st?.fullName || 'Học sinh',
            student_code: p.student_code || p.studentCode || st?.student_code || st?.studentCode || 'HS',
          };
        });
      }
    } catch (e) {}

    const result = {
      class_id: classId,
      today,
      is_attended_today: presentStudents.length > 0,
      total_present: presentStudents.length,
      present_students: presentStudents,
    };

    // Cache kết quả trong 15 phút (900,000 ms)
    await this.cacheManager.set(cacheKey, result, 900000);

    return result;
  }

  /**
   * Listener xử lý ngầm (Event-Driven Worker) khi có học sinh vắng / nghỉ học / đi muộn
   * Gửi thông báo đẩy FCM tới phụ huynh + lưu vào cơ sở dữ liệu
   */
  @OnEvent('attendance.absent', { async: true })
  async handleAbsentNotificationEvent(payload: AbsentEventPayload) {
    const { classId, date } = payload;
    const studentsToNotify: AbsentStudentItem[] =
      payload.absentStudents && payload.absentStudents.length > 0
        ? payload.absentStudents
        : (payload.absentStudentIds || []).map((id) => ({
            studentId: id,
            status: AttendanceStatus.ABSENT_EXCUSED,
          }));

    this.logger.log(`[Worker] Xử lý gửi thông báo cho ${studentsToNotify.length} học sinh ngày ${date}`);

    let className = '';
    try {
      if (classId) {
        const cls = await this.dataConnect.getClassById(classId);
        if (cls) className = cls.name ? `${cls.name}` : '';
      }
    } catch {}

    const classLabel = className ? ` (${className})` : '';

    for (const item of studentsToNotify) {
      const stuId = item.studentId;
      let recipientUserId = stuId;
      let studentName = 'Học sinh';

      try {
        const student = await this.dataConnect.getStudentById(stuId);
        if (student) {
          studentName = student.full_name || student.fullName || studentName;
          const parentPhone = student.parent_phone || student.parentPhone;
          if (parentPhone) {
            const parentUser = await this.dataConnect.getUserByPhone(parentPhone);
            if (parentUser) {
              recipientUserId = parentUser.id;
            }
          }
        }
      } catch (err: any) {
        this.logger.warn(`[Worker] Không lấy được thông tin phụ huynh cho học sinh ${stuId}: ${err?.message}`);
      }

      let title = '';
      let body = '';
      const noteStr = item.note ? ` (Ghi chú: ${item.note})` : '';

      // Tùy biến nội dung theo từng trạng thái cụ thể:
      if (item.status === AttendanceStatus.ABSENT_EXCUSED) {
        // Vắng có phép: trang trọng, ân cần xác nhận phép
        title = `Thông báo nghỉ học (Có phép) - Em ${studentName}`;
        body = `Kính gửi Phụ huynh em ${studentName}, nhà trường xác nhận em vắng mặt có phép trong buổi học ngày ${date}${classLabel}${noteStr}. Kính chúc em sớm khỏe và hẹn gặp lại em tại lớp!`;
      } else if (item.status === AttendanceStatus.ABSENT_UNEXCUSED) {
        // Vắng không phép: thông báo học sinh chưa đến lớp, đề nghị phụ huynh kiểm tra an toàn
        title = `Thông báo điểm danh: Em ${studentName} chưa đến lớp`;
        body = `Kính gửi Phụ huynh em ${studentName}, trong giờ điểm danh ngày ${date}, giáo viên ghi nhận em chưa có mặt tại lớp${classLabel} và chưa nhận được thông tin xin phép từ gia đình. Kính nhờ phụ huynh kiểm tra và liên hệ ngay với giáo viên chủ nhiệm để đảm bảo an toàn cho em.`;
      } else if (item.status === AttendanceStatus.LATE) {
        // Đi học muộn
        title = `Thông báo đi học muộn - Em ${studentName}`;
        body = `Kính gửi Phụ huynh em ${studentName}, em đã đến lớp muộn trong buổi học ngày ${date}${classLabel}${noteStr}. Nhà trường xin thông tin để gia đình cùng phối hợp nhắc nhở em đi học đúng giờ.`;
      } else {
        // Mặc định
        title = `Thông tin điểm danh - Em ${studentName}`;
        body = `Kính gửi Phụ huynh em ${studentName}, thông tin điểm danh của em trong buổi học ngày ${date}${classLabel} đã được ghi nhận vào hệ thống.`;
      }

      const absentType =
        item.status === AttendanceStatus.LATE
          ? NotificationType.ATTENDANCE_ABSENT
          : NotificationType.ATTENDANCE_ABSENT;

      await this.notificationsService.dispatchNotification({
        recipientUserId,
        title,
        body,
        type: absentType,
        metadata: {
          student_id: stuId,
          student_name: studentName,
          class_id: classId,
          date,
          status: item.status,
          note: item.note,
        },
      });
    }
    this.logger.log(`[Worker] Đã hoàn tất gửi thông báo điểm danh cho ${studentsToNotify.length} học sinh.`);
  }

  /**
   * Listener xử lý ngầm khi có học sinh được sửa từ vắng -> có mặt
   * (phục vụ chỉnh sửa điểm danh: chỉ báo phụ huynh HS vừa thay đổi trạng thái)
   */
  @OnEvent('attendance.updated', { async: true })
  async handleAttendanceUpdatedEvent(payload: AttendanceUpdatedPayload) {
    const { updatedStudentIds, date, classId } = payload;
    this.logger.log(`[Worker] Thông báo cập nhật điểm danh cho ${updatedStudentIds.length} học sinh ngày ${date}`);

    let className = '';
    try {
      if (classId) {
        const cls = await this.dataConnect.getClassById(classId);
        if (cls) className = cls.name ? `${cls.name}` : '';
      }
    } catch {}

    const classLabel = className ? ` (${className})` : '';

    for (const stuId of updatedStudentIds) {
      let recipientUserId = stuId;
      let studentName = 'Học sinh';

      try {
        const student = await this.dataConnect.getStudentById(stuId);
        if (student) {
          studentName = student.full_name || student.fullName || studentName;
          const parentPhone = student.parent_phone || student.parentPhone;
          if (parentPhone) {
            const parentUser = await this.dataConnect.getUserByPhone(parentPhone);
            if (parentUser) {
              recipientUserId = parentUser.id;
            }
          }
        }
      } catch (err: any) {
        this.logger.warn(`[Worker] Lỗi tra cứu học sinh ${stuId}: ${err?.message}`);
      }

      await this.notificationsService.dispatchNotification({
        recipientUserId,
        title: `Cập nhật điểm danh: Em ${studentName} đã có mặt`,
        body: `Kính gửi Phụ huynh em ${studentName}, giáo viên đã cập nhật trạng thái điểm danh của em thành CÓ MẶT trong buổi học ngày ${date}${classLabel}. Trân trọng cảm ơn sự phối hợp của phụ huynh!`,
        type: NotificationType.SYSTEM,
        metadata: { student_id: stuId, student_name: studentName, class_id: classId, date },
      });
    }
    this.logger.log(`[Worker] Đã hoàn tất ghi thông báo cập nhật điểm danh.`);
  }
}
