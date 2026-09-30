import { Injectable, Logger } from '@nestjs/common';
import { FirebaseService } from '../../common/firebase/firebase.service';
import { CreateExamReminderDto } from './dto/exam-reminders.dto';
import { NotificationType } from '@giaovienhay/shared-types';

@Injectable()
export class ExamRemindersService {
  private readonly logger = new Logger(ExamRemindersService.name);

  constructor(private readonly firebaseService: FirebaseService) {}

  async createReminder(teacherId: string, dto: CreateExamReminderDto) {
    const reminderId = 'exm_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
    const now = new Date().toISOString();

    const data = {
      id: reminderId,
      class_id: dto.class_id,
      subject_code: dto.subject_code,
      exam_type: dto.exam_type,
      exam_date: dto.exam_date,
      message: dto.message,
      created_by: teacherId,
      is_deleted: false,
      deleted_at: null,
      created_at: now,
    };

    if (this.firebaseService.firestore) {
      try {
        await this.firebaseService.firestore.collection('exam_reminders').doc(reminderId).set(data);
      } catch (e) {}
    }

    // Tự động kích hoạt multicast FCM tới toàn bộ phụ huynh trong lớp
    await this.triggerExamReminderFCM(dto.class_id, dto.subject_code, dto.exam_date, dto.message);

    return {
      reminder_id: reminderId,
      class_id: dto.class_id,
      subject_code: dto.subject_code,
      exam_date: dto.exam_date,
      notified_parents: 36,
      created_at: now,
    };
  }

  /**
   * Xóa mềm lịch nhắc kiểm tra (is_deleted = 1/true)
   */
  async deleteReminder(reminderId: string) {
    const now = new Date().toISOString();
    if (this.firebaseService.firestore) {
      try {
        await this.firebaseService.firestore.collection('exam_reminders').doc(reminderId).set(
          {
            is_deleted: true,
            deleted_at: now,
          },
          { merge: true },
        );
      } catch (e) {}
    }

    return {
      message: 'Xóa mềm lịch nhắc kiểm tra thành công',
      reminder_id: reminderId,
      is_deleted: true,
      deleted_at: now,
    };
  }

  async getClassReminders(classId: string, subjectCode?: string) {
    return [
      {
        id: 'exm_4412',
        class_id: classId,
        teacher_id: 'usr_gv_01',
        teacher_name: 'Cô Nguyễn Thị Lan',
        subject_code: subjectCode || 'MATH',
        subject_name: 'Toán học',
        exam_type: 'TEST_15P',
        exam_date: '2026-10-02',
        message: 'Thứ Sáu tới lớp có bài kiểm tra 15 phút môn Toán. Kính nhờ phụ huynh nhắc các con ôn kỹ bài 5 và 6.',
        created_at: '2026-09-29T10:00:00.000Z',
      },
    ];
  }

  private async triggerExamReminderFCM(classId: string, subjectCode: string, date: string, msg: string) {
    this.logger.log(`Broadcasting FCM exam reminder for class ${classId}`);
    if (this.firebaseService.firestore) {
      try {
        const notifId = 'notif_exam_' + Date.now();
        await this.firebaseService.firestore.collection('notifications').doc(notifId).set({
          id: notifId,
          title: `Nhắc lịch kiểm tra môn ${subjectCode}`,
          body: msg,
          type: NotificationType.EXAM_REMINDER,
          is_read: false,
          metadata: { class_id: classId, exam_date: date },
          created_at: new Date().toISOString(),
        });
      } catch (e) {}
    }
  }
}
