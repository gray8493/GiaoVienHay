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

export interface AbsentEventPayload {
  classId: string;
  absentStudentIds: string[];
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
    const changedAbsentIds: string[] = [];
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
        if (isAbsent) changedAbsentIds.push(record.student_id);
      } else if (oldStatus !== record.status) {
        if (isAbsent) changedAbsentIds.push(record.student_id);
        else changedPresentIds.push(record.student_id);
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
    // - HS mới bị đánh vắng (kể cả lần đầu lưu) -> cảnh báo vắng học
    // - HS được sửa từ vắng -> có mặt -> thông báo cập nhật điểm danh
    if (changedAbsentIds.length > 0) {
      this.eventEmitter.emit('attendance.absent', {
        classId: dto.class_id,
        absentStudentIds: changedAbsentIds,
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
      notified_parents_queued: changedAbsentIds.length + changedPresentIds.length,
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
   * Listener xử lý ngầm (Event-Driven Worker) khi có học sinh vắng
   */
  @OnEvent('attendance.absent', { async: true })
  async handleAbsentNotificationEvent(payload: AbsentEventPayload) {
    const { classId, absentStudentIds, date } = payload;
    this.logger.log(`[Worker] Xử lý ngầm gửi thông báo cho ${absentStudentIds.length} học sinh vắng ngày ${date}`);

    for (const stuId of absentStudentIds) {
      const notifId = 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      const notifData = {
        id: notifId,
        recipient_id: stuId,
        recipientId: stuId,
        title: 'Cảnh báo vắng học',
        body: `Học sinh vắng mặt tại lớp ngày ${date}. Kính nhờ phụ huynh kiểm tra thông tin.`,
        type: NotificationType.ATTENDANCE_ABSENT,
        is_read: false,
        metadata: { student_id: stuId, class_id: classId },
        created_at: new Date().toISOString(),
      };

      await this.dataConnect.createNotification(notifData);
    }
    this.logger.log(`[Worker] Đã hoàn tất ghi thông báo vào SQL Data Connect.`);
  }

  /**
   * Listener xử lý ngầm khi có học sinh được sửa từ vắng -> có mặt
   * (phục vụ chỉnh sửa điểm danh: chỉ báo phụ huynh HS vừa thay đổi trạng thái)
   */
  @OnEvent('attendance.updated', { async: true })
  async handleAttendanceUpdatedEvent(payload: AttendanceUpdatedPayload) {
    const { updatedStudentIds, date } = payload;
    this.logger.log(`[Worker] Thông báo cập nhật điểm danh cho ${updatedStudentIds.length} học sinh ngày ${date}`);

    for (const stuId of updatedStudentIds) {
      const notifId = 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      const notifData = {
        id: notifId,
        recipient_id: stuId,
        recipientId: stuId,
        title: 'Điểm danh cập nhật',
        body: `Điểm danh của học sinh đã được cập nhật thành CÓ MẶT ngày ${date}. Xin thông báo đến phụ huynh.`,
        type: NotificationType.SYSTEM,
        is_read: false,
        metadata: { student_id: stuId, class_id: payload.classId, date },
        created_at: new Date().toISOString(),
      };

      await this.dataConnect.createNotification(notifData);
    }
    this.logger.log(`[Worker] Đã hoàn tất ghi thông báo cập nhật điểm danh.`);
  }
}
