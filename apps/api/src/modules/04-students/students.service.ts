import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../../common/firebase/firebase.service';

@Injectable()
export class StudentsService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async getStudentProfile(studentId: string) {
    const student = await this.findStudent(studentId);
    return student;
  }

  async getAcademicRecord(studentId: string) {
    const student = await this.findStudent(studentId);
    return {
      student_id: studentId,
      full_name: student.full_name,
      class_name: '1A',
      semester: 1,
      subjects: [
        {
          subject_code: 'MATH',
          subject_name: 'Toán học',
          scores: [
            { type: 'ORAL_TEST', label: 'Kiểm tra miệng', value: 9.0, comment: 'Học thuộc bảng cộng' },
            { type: 'TEST_15P', label: 'Kiểm tra 15 phút', value: 8.5 },
            { type: 'MID_TERM', label: 'Thi Giữa kỳ', value: 9.5 },
          ],
        },
        {
          subject_code: 'LITERATURE',
          subject_name: 'Tiếng Việt',
          scores: [
            { type: 'ORAL_TEST', label: 'Đọc bài cũ', value: 8.0 },
            { type: 'TEST_15P', label: 'Chính tả 15 phút', value: 9.0 },
          ],
        },
      ],
    };
  }

  async getAttendanceHistory(studentId: string, month?: string) {
    return {
      student_id: studentId,
      total_present: 20,
      total_absent_excused: 1,
      total_absent_unexcused: 0,
      records: [
        { date: '2026-09-23', status: 'PRESENT', note: null },
        { date: '2026-09-22', status: 'PRESENT', note: null },
        { date: '2026-09-21', status: 'ABSENT_EXCUSED', note: 'Phụ huynh xin nghỉ ốm' },
      ],
    };
  }

  async getFeesInsuranceStatus(studentId: string) {
    return {
      student_id: studentId,
      term_name: 'Học kỳ 1 năm học 2026-2027',
      tuition: {
        is_paid: true,
        amount: 1200000,
        paid_date: '2026-09-15',
        status_label: 'ĐÃ HOÀN THÀNH',
      },
      insurance: {
        is_paid: false,
        amount: 880000,
        paid_date: null,
        deadline: '2026-10-15',
        status_label: 'CHƯA NỘP (Hạn chót: 15/10/2026)',
      },
      teacher_note: 'Phụ huynh vui lòng nộp BHYT trực tiếp tại lớp cho cô Lan.',
    };
  }

  async getRemarks(studentId: string) {
    return [
      {
        remark_id: 'rmk_01',
        teacher_name: 'Cô Nguyễn Thị Lan',
        subject: 'Toán học',
        content: 'Hôm nay Nam làm bài tập rất nhanh và hăng hái phát biểu xây dựng bài.',
        created_at: new Date().toISOString(),
        parent_acknowledged: true,
      },
    ];
  }

  async getExamReminders(studentId: string) {
    return [
      {
        id: 'exm_01',
        subject_name: 'Toán học',
        exam_type: 'TEST_15P',
        exam_date: '2026-10-02',
        content_scope: 'Phép cộng trong phạm vi 10 (Bài 5 và Bài 6)',
      },
    ];
  }

  private async findStudent(studentId: string) {
    if (this.firebaseService.firestore) {
      try {
        const doc = await this.firebaseService.firestore.collection('students').doc(studentId).get();
        if (doc.exists) {
          return { id: doc.id, ...doc.data() };
        }
      } catch (e) {}
    }
    return {
      id: studentId,
      full_name: 'Trần Bảo Nam',
      dob: '2019-05-15',
      gender: 'MALE',
      class_id: 'cls_1a_2026',
      class_name: '1A',
      parent_uids: [],
    };
  }
}
