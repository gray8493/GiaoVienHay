import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { FirebaseService } from '../../common/firebase/firebase.service';
import { SubmitAttendanceDto } from './dto/attendance.dto';
import { AttendanceStatus, NotificationType } from '@giaovienhay/shared-types';

export interface AbsentEventPayload {
  classId: string;
  absentStudentIds: string[];
  date: string;
}

export interface TodayPresentStudentsResponse {
  class_id: string;
  today: string;
  present_students: Array<{
    id: string;
    full_name: string;
    student_code: string;
  }>;
}

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(
    private readonly firebaseService: FirebaseService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async submitAttendance(teacherId: string, dto: SubmitAttendanceDto) {
    let presentCount = 0;
    let absentCount = 0;
    const absentStudentIds: string[] = [];

    const now = new Date().toISOString();

    for (const record of dto.records) {
      if (record.status === AttendanceStatus.PRESENT) {
        presentCount++;
      } else {
        absentCount++;
        absentStudentIds.push(record.student_id);
      }

      // Lưu document vào Firestore
      if (this.firebaseService.firestore) {
        try {
          const docId = `att_${dto.class_id}_${record.student_id}_${dto.attendance_date}`;
          await this.firebaseService.firestore.collection('attendances').doc(docId).set({
            class_id: dto.class_id,
            student_id: record.student_id,
            attendance_date: dto.attendance_date,
            period: dto.period || 1,
            status: record.status,
            note: record.note || null,
            recorded_by: teacherId,
            updated_at: now,
          });
        } catch (e) {}
      }
    }

    // Xóa cache danh sách học sinh có mặt hôm nay của lớp này để làm mới dữ liệu
    const cacheKey = `att_present_${dto.class_id}_${dto.attendance_date}`;
    await this.cacheManager.del(cacheKey);

    // Bắn Event xử lý ngầm (Message Queue/Event-driven) cho FCM Notifications
    // Không làm block luồng HTTP response của giáo viên!
    if (absentStudentIds.length > 0) {
      this.eventEmitter.emit('attendance.absent', {
        classId: dto.class_id,
        absentStudentIds,
        date: dto.attendance_date,
      } as AbsentEventPayload);
    }

    return {
      attendance_date: dto.attendance_date,
      total_students: dto.records.length,
      present_count: presentCount,
      absent_count: absentCount,
      notified_parents_queued: absentStudentIds.length,
    };
  }

  async getClassAttendance(classId: string, date?: string, month?: string) {
    return [
      {
        id: 'att_01',
        class_id: classId,
        student_id: 'stu_01',
        student_name: 'Trần Bảo Nam',
        attendance_date: date || '2026-09-29',
        status: AttendanceStatus.PRESENT,
        note: null,
      },
      {
        id: 'att_02',
        class_id: classId,
        student_id: 'stu_02',
        student_name: 'Lê Ngọc Mai',
        attendance_date: date || '2026-09-29',
        status: AttendanceStatus.ABSENT_EXCUSED,
        note: 'Phụ huynh xin nghỉ ốm',
      },
    ];
  }

  async getTodayPresentStudents(classId: string): Promise<TodayPresentStudentsResponse> {
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `att_present_${classId}_${today}`;

    // Kiểm tra trong In-Memory RAM Cache trước (0ms)
    const cached = await this.cacheManager.get<TodayPresentStudentsResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    // Trích xuất danh sách học sinh CÓ MẶT HÔM NAY để nạp vào Vòng quay may mắn
    let presentStudents = [
      { id: 'stu_01', full_name: 'Trần Bảo Nam', student_code: 'HS001' },
      { id: 'stu_03', full_name: 'Hoàng Minh Khôi', student_code: 'HS003' },
    ];

    if (this.firebaseService.firestore) {
      try {
        const snap = await this.firebaseService.firestore
          .collection('attendances')
          .where('class_id', '==', classId)
          .where('attendance_date', '==', today)
          .where('status', '==', AttendanceStatus.PRESENT)
          .get();

        if (!snap.empty) {
          presentStudents = snap.docs.map((doc) => {
            const data = doc.data();
            return {
              id: data.student_id,
              full_name: data.student_name || 'Học sinh',
              student_code: data.student_code || 'HS',
            };
          });
        }
      } catch (e) {}
    }

    const result = {
      class_id: classId,
      today,
      present_students: presentStudents,
    };

    // Cache kết quả trong 15 phút (900,000 ms)
    await this.cacheManager.set(cacheKey, result, 900000);

    return result;
  }

  /**
   * Listener xử lý ngầm (Event-Driven Worker) khi có học sinh vắng
   * Hoạt động như một queue worker phi tập trung không tốn tiền server
   */
  @OnEvent('attendance.absent', { async: true })
  async handleAbsentNotificationEvent(payload: AbsentEventPayload) {
    const { classId, absentStudentIds, date } = payload;
    this.logger.log(`[Worker] Xử lý ngầm gửi thông báo FCM cho ${absentStudentIds.length} học sinh vắng ngày ${date}`);

    if (this.firebaseService.firestore) {
      try {
        for (const stuId of absentStudentIds) {
          const notifId = 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
          await this.firebaseService.firestore.collection('notifications').doc(notifId).set({
            id: notifId,
            title: 'Cảnh báo vắng học',
            body: `Học sinh vắng mặt tại lớp ngày ${date}. Kính nhờ phụ huynh kiểm tra thông tin.`,
            type: NotificationType.ATTENDANCE_ABSENT,
            is_read: false,
            metadata: { student_id: stuId, class_id: classId },
            created_at: new Date().toISOString(),
          });
        }
        this.logger.log(`[Worker] Đã tạo thành công ${absentStudentIds.length} thông báo FCM phụ huynh.`);
      } catch (e: any) {
        this.logger.error(`[Worker] Lỗi tạo thông báo: ${e?.message}`);
      }
    }
  }
}
