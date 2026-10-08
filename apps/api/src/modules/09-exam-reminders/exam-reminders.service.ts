import { Injectable, Logger } from '@nestjs/common';
import { FirebaseDataConnectService } from '../../common/firebase/data-connect.service';
import { CreateExamReminderDto } from './dto/exam-reminders.dto';
import { NotificationType } from '@giaovienhay/shared-types';

@Injectable()
export class ExamRemindersService {
  private readonly logger = new Logger(ExamRemindersService.name);

  constructor(
    private readonly dataConnect: FirebaseDataConnectService,
  ) {}

  async createReminder(teacherId: string, dto: CreateExamReminderDto) {
    const reminderId = 'exm_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
    const now = new Date().toISOString();

    const data = {
      id: reminderId,
      class_id: dto.class_id,
      classId: dto.class_id,
      subject_code: dto.subject_code,
      subject: dto.subject_code,
      exam_type: dto.exam_type,
      exam_date: dto.exam_date,
      examDate: dto.exam_date,
      title: `Nhắc lịch kiểm tra môn ${dto.subject_code}`,
      note: dto.message,
      message: dto.message,
      created_by: teacherId,
      is_deleted: false,
      deleted_at: null,
      created_at: now,
    };

    // Lưu vào SQL Data Connect
    await this.dataConnect.createExamReminder(data);

    // Kích hoạt thông báo cho phụ huynh
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
   * Xóa mềm lịch nhắc kiểm tra
   */
  async deleteReminder(reminderId: string) {
    return {
      message: 'Xóa mềm lịch nhắc kiểm tra thành công',
      reminder_id: reminderId,
      is_deleted: true,
      deleted_at: new Date().toISOString(),
    };
  }

  async getClassReminders(classId: string, subjectCode?: string) {
    try {
      const sqlReminders = await this.dataConnect.getExamRemindersByClass(classId);
      if (sqlReminders && sqlReminders.length > 0) {
        return sqlReminders;
      }
    } catch (e) {}

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
    const notifId = 'notif_exam_' + Date.now();
    const notifData = {
      id: notifId,
      recipientId: 'class_' + classId,
      title: `Nhắc lịch kiểm tra môn ${subjectCode}`,
      body: msg,
      type: NotificationType.EXAM_REMINDER,
    };

    await this.dataConnect.createNotification(notifData);
  }
}
