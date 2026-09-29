import { Injectable, Logger } from '@nestjs/common';
import { FirebaseService } from '../../common/firebase/firebase.service';
import { BatchInputScoresDto, PublishScoresDto } from './dto/grades.dto';
import { NotificationType } from '@giaovienhay/shared-types';

@Injectable()
export class GradesService {
  private readonly logger = new Logger(GradesService.name);

  constructor(private readonly firebaseService: FirebaseService) {}

  async getClassGrades(classId: string, subjectCode: string, semester: number = 1) {
    return [
      {
        student_id: 'stu_01',
        student_name: 'Trần Bảo Nam',
        scores: [
          { type: 'ORAL_TEST', value: 9.5, comment: 'Thuộc bảng cửu chương', is_published: true },
          { type: 'TEST_15P', value: 8.5, comment: null, is_published: true },
          { type: 'MID_TERM', value: 9.5, comment: null, is_published: false },
        ],
      },
      {
        student_id: 'stu_02',
        student_name: 'Lê Ngọc Mai',
        scores: [
          { type: 'ORAL_TEST', value: 8.0, comment: 'Cần tính nhanh hơn', is_published: true },
          { type: 'TEST_15P', value: 9.0, comment: null, is_published: true },
        ],
      },
    ];
  }

  async batchInputScores(teacherId: string, dto: BatchInputScoresDto) {
    const now = new Date().toISOString();

    for (const item of dto.scores) {
      if (this.firebaseService.firestore) {
        try {
          const docId = `score_${dto.class_id}_${dto.subject_code}_${item.student_id}_${dto.score_type}`;
          await this.firebaseService.firestore.collection('scores').doc(docId).set({
            class_id: dto.class_id,
            subject_code: dto.subject_code,
            student_id: item.student_id,
            semester: dto.semester || 1,
            score_type: dto.score_type,
            score_value: item.score_value,
            teacher_comment: item.teacher_comment || null,
            is_published: false, // Mặc định chưa công bố
            recorded_by: teacherId,
            updated_at: now,
          });
        } catch (e) {}
      }
    }

    return {
      class_id: dto.class_id,
      subject_code: dto.subject_code,
      score_type: dto.score_type,
      updated_count: dto.scores.length,
    };
  }

  async publishScores(teacherId: string, dto: PublishScoresDto) {
    const now = new Date().toISOString();

    if (this.firebaseService.firestore) {
      try {
        const snap = await this.firebaseService.firestore
          .collection('scores')
          .where('class_id', '==', dto.class_id)
          .where('subject_code', '==', dto.subject_code)
          .where('score_type', '==', dto.score_type)
          .get();

        const batch = this.firebaseService.firestore.batch();
        snap.docs.forEach((doc) => {
          batch.update(doc.ref, { is_published: true, published_at: now });
        });
        await batch.commit();
      } catch (e) {}
    }

    // Gửi thông báo đẩy FCM tới phụ huynh
    await this.triggerGradePublishedFCM(dto.class_id, dto.subject_code, dto.score_type);

    return {
      notified_parents_count: 35,
      published_at: now,
    };
  }

  async getLeaderboard(classId: string, subjectCode: string, semester: number = 1, limit: number = 5) {
    return {
      subject_code: subjectCode,
      subject_name: subjectCode === 'MATH' ? 'Toán học' : 'Môn học',
      top_students: [
        { rank: 1, student_name: 'Trần Bảo Nam', score: 9.8, badge: 'GOLD' },
        { rank: 2, student_name: 'Lê Ngọc Mai', score: 9.5, badge: 'SILVER' },
        { rank: 3, student_name: 'Hoàng Minh Khôi', score: 9.2, badge: 'BRONZE' },
      ],
    };
  }

  private async triggerGradePublishedFCM(classId: string, subjectCode: string, scoreType: string) {
    this.logger.log(`Triggering FCM grade published for class ${classId}, subject: ${subjectCode}`);
    if (this.firebaseService.firestore) {
      try {
        const notifId = 'notif_grade_' + Date.now();
        await this.firebaseService.firestore.collection('notifications').doc(notifId).set({
          id: notifId,
          title: 'Điểm số mới môn học',
          body: `Đã công bố cột điểm ${scoreType} môn ${subjectCode}. Mời phụ huynh vào Sổ liên lạc để xem chi tiết.`,
          type: NotificationType.GRADE_PUBLISHED,
          is_read: false,
          created_at: new Date().toISOString(),
        });
      } catch (e) {}
    }
  }
}
