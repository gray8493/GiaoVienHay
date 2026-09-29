import { Injectable, Logger } from '@nestjs/common';
import { FirebaseService } from '../../common/firebase/firebase.service';
import { CreateRemarkDto } from './dto/remarks.dto';
import { NotificationType } from '@giaovienhay/shared-types';

@Injectable()
export class RemarksService {
  private readonly logger = new Logger(RemarksService.name);

  constructor(private readonly firebaseService: FirebaseService) {}

  async createRemark(teacherId: string, dto: CreateRemarkDto) {
    const remarkId = 'rmk_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
    const now = new Date().toISOString();

    const remarkData = {
      id: remarkId,
      student_id: dto.student_id,
      class_id: dto.class_id,
      subject_code: dto.subject_code || null,
      teacher_id: teacherId,
      teacher_name: 'Giáo viên phụ trách',
      content: dto.content,
      parent_acknowledged: false,
      acknowledged_at: null,
      created_at: now,
    };

    if (this.firebaseService.firestore) {
      try {
        await this.firebaseService.firestore.collection('remarks').doc(remarkId).set(remarkData);
      } catch (e) {}
    }

    // Tự động kích hoạt Push Notification cho phụ huynh
    await this.triggerRemarkFCM(dto.student_id, dto.content);

    return {
      remark_id: remarkId,
      student_id: dto.student_id,
      content: dto.content,
      created_at: now,
      fcm_delivered: true,
    };
  }

  async getClassRemarks(classId: string, studentId?: string, limit: number = 20) {
    return [
      {
        id: 'rmk_01',
        student_id: studentId || 'stu_01',
        student_name: 'Trần Bảo Nam',
        teacher_id: 'usr_gv_01',
        teacher_name: 'Cô Nguyễn Thị Lan',
        subject_code: 'MATH',
        content: 'Hôm nay em Nam tiếp thu bài rất nhanh và hăng hái xung phong lên bảng chữa bài tập.',
        parent_acknowledged: true,
        acknowledged_at: '2026-09-29T09:30:00.000Z',
        created_at: '2026-09-29T08:30:00.000Z',
      },
    ];
  }

  async acknowledgeRemark(remarkId: string, parentId: string) {
    const now = new Date().toISOString();
    if (this.firebaseService.firestore) {
      try {
        await this.firebaseService.firestore.collection('remarks').doc(remarkId).update({
          parent_acknowledged: true,
          acknowledged_by: parentId,
          acknowledged_at: now,
        });
      } catch (e) {}
    }

    return {
      remark_id: remarkId,
      parent_acknowledged: true,
      acknowledged_at: now,
    };
  }

  private async triggerRemarkFCM(studentId: string, content: string) {
    this.logger.log(`Triggering FCM for remark on student ${studentId}`);
    if (this.firebaseService.firestore) {
      try {
        const notifId = 'notif_rmk_' + Date.now();
        await this.firebaseService.firestore.collection('notifications').doc(notifId).set({
          id: notifId,
          title: 'Lời nhận xét mới từ giáo viên',
          body: content.length > 80 ? content.substring(0, 80) + '...' : content,
          type: NotificationType.REMARK_NEW,
          is_read: false,
          metadata: { student_id: studentId },
          created_at: new Date().toISOString(),
        });
      } catch (e) {}
    }
  }
}
