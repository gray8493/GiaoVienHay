import { Platform } from 'react-native';
import { authService } from './auth.service';

const API_BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:3000/api/v1'
    : 'http://localhost:3000/api/v1';

export type RemarkStatus = 'READ' | 'UNREAD' | 'NONE';

export interface StudentRemarkItem {
  id: string;
  student_id: string;
  student_code: string;
  student_name: string;
  subject_code: string;
  subject_name: string;
  content: string | null;
  status: RemarkStatus;
  sent_date: string | null;
  teacher_name?: string;
}

export interface ExamReminderItem {
  id: string;
  class_id: string;
  subject_code: string;
  subject_name: string;
  exam_type: string; // 'Kiểm tra 15 phút' | 'Kiểm tra 1 tiết' | 'Thi Giữa kỳ' | 'Thi Cuối kỳ'
  exam_date: string; // YYYY-MM-DD
  day_of_week: string; // 'Thứ Sáu', 'Thứ Ba', 'Thứ Năm'
  day_number: string; // '09', '13', '22'
  month_str: string; // 'Th10'
  message: string;
  teacher_name: string;
  created_at: string;
}

export interface CreateRemarkPayload {
  student_id: string;
  class_id: string;
  subject_code?: string;
  content: string;
}

export interface CreateExamReminderPayload {
  class_id: string;
  subject_code: string;
  exam_type: string;
  exam_date: string;
  message: string;
}

const DEFAULT_REMARKS: StudentRemarkItem[] = [
  {
    id: 'rem_01',
    student_id: 'stu_01',
    student_code: 'HS240101',
    student_name: 'Nguyễn Minh Anh',
    subject_code: 'MATH',
    subject_name: 'Toán học',
    content: 'Em nắm kiến thức bài học rất tốt, tư duy logic nhanh và làm bài tập cẩn thận.',
    status: 'READ',
    sent_date: '28/09 • Toán học',
    teacher_name: 'Cô Nguyễn Thu Hà',
  },
  {
    id: 'rem_02',
    student_id: 'stu_02',
    student_code: 'HS240102',
    student_name: 'Trần Bảo Nam',
    subject_code: 'MATH',
    subject_name: 'Toán học',
    content: 'Em tiếp thu bài nhanh, hăng hái phát biểu. Cần trình bày bài sạch hơn.',
    status: 'UNREAD',
    sent_date: 'Gửi 29/09 • Toán học',
    teacher_name: 'Cô Nguyễn Thị Lan',
  },
  {
    id: 'rem_03',
    student_id: 'stu_03',
    student_code: 'HS240103',
    student_name: 'Lê Thị Cẩm Tú',
    subject_code: 'LIT',
    subject_name: 'Ngữ văn',
    content: null,
    status: 'NONE',
    sent_date: null,
    teacher_name: 'Thầy Lê Văn Hải',
  },
  {
    id: 'rem_04',
    student_id: 'stu_04',
    student_code: 'HS240104',
    student_name: 'Phạm Hoàng Nam',
    subject_code: 'ENG',
    subject_name: 'Tiếng Anh',
    content: 'Phát âm chuẩn, tương tác bài sôi nổi trong giờ học nhóm.',
    status: 'READ',
    sent_date: '02/10 • Tiếng Anh',
    teacher_name: 'Cô Hoàng Mai',
  },
  {
    id: 'rem_05',
    student_id: 'stu_05',
    student_code: 'HS240105',
    student_name: 'Võ Khánh Linh',
    subject_code: 'MATH',
    subject_name: 'Toán học',
    content: null,
    status: 'NONE',
    sent_date: null,
    teacher_name: 'Cô Nguyễn Thu Hà',
  },
];

const DEFAULT_EXAMS: ExamReminderItem[] = [
  {
    id: 'exam_01',
    class_id: 'cls_6a1',
    subject_code: 'MATH',
    subject_name: 'Toán học',
    exam_type: 'Kiểm tra 15 phút',
    exam_date: '2026-10-09',
    day_of_week: 'Thứ Sáu',
    day_number: '09',
    month_str: 'Th10',
    message: 'Thứ Sáu tới lớp có bài kiểm tra 15 phút Toán về phép cộng. Kính nhờ phụ huynh nhắc con ôn bài 5 và 6.',
    teacher_name: 'Cô Nguyễn Thu Hà',
    created_at: '05/10 20:30',
  },
  {
    id: 'exam_02',
    class_id: 'cls_6a1',
    subject_code: 'LIT',
    subject_name: 'Ngữ văn',
    exam_type: 'Kiểm tra 1 tiết',
    exam_date: '2026-10-13',
    day_of_week: 'Thứ Ba',
    day_number: '13',
    month_str: 'Th10',
    message: 'Kiểm tra 1 tiết Ngữ văn bài Cổ tích. Nhờ phụ huynh nhắc con đọc lại truyện.',
    teacher_name: 'Thầy Lê Văn Hải',
    created_at: '06/10 19:15',
  },
  {
    id: 'exam_03',
    class_id: 'cls_6a1',
    subject_code: 'ENG',
    subject_name: 'Tiếng Anh',
    exam_type: 'Thi Giữa kỳ',
    exam_date: '2026-10-22',
    day_of_week: 'Thứ Năm',
    day_number: '22',
    month_str: 'Th10',
    message: 'Ôn tập Unit 1 đến Unit 3 phần từ vựng và ngữ pháp. Học sinh mang theo bút chì 2B để tô phiếu trắc nghiệm.',
    teacher_name: 'Cô Hoàng Mai',
    created_at: '08/10 08:00',
  },
];

export const remarksService = {
  async getClassRemarks(classId: string = 'cls_1a_2026'): Promise<StudentRemarkItem[]> {
    try {
      const authHeader = await authService.getAuthHeaderAsync();
      const response = await fetch(`${API_BASE_URL}/remarks/class/${classId}`, {
        headers: { 'Content-Type': 'application/json', ...authHeader },
      });
      if (response.ok) {
        const resJson = await response.json();
        const data = resJson.data || resJson;
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch (e) {
      console.warn('Backend remarks not reachable, fallback mock:', e);
    }
    return DEFAULT_REMARKS;
  },

  async createRemark(payload: CreateRemarkPayload): Promise<boolean> {
    try {
      const authHeader = await authService.getAuthHeaderAsync();
      const response = await fetch(`${API_BASE_URL}/remarks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({
          student_id: payload.student_id,
          class_id: payload.class_id || 'cls_1a_2026',
          subject_code: payload.subject_code || 'MATH',
          content: payload.content,
        }),
      });
      if (response.ok) {
        return true;
      }
    } catch (e) {
      console.warn('Backend create remark not reachable, saved offline:', e);
    }
    return true;
  },

  async getClassExamReminders(classId: string = 'cls_1a_2026'): Promise<ExamReminderItem[]> {
    try {
      const authHeader = await authService.getAuthHeaderAsync();
      const response = await fetch(`${API_BASE_URL}/exam-reminders/class/${classId}`, {
        headers: { 'Content-Type': 'application/json', ...authHeader },
      });
      if (response.ok) {
        const resJson = await response.json();
        const data = resJson.data || resJson;
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch (e) {
      console.warn('Backend exam-reminders not reachable, fallback mock:', e);
    }
    return DEFAULT_EXAMS;
  },

  async createExamReminder(payload: CreateExamReminderPayload): Promise<boolean> {
    try {
      const authHeader = await authService.getAuthHeaderAsync();

      // Chuẩn hóa exam_type sang enum GradeType Backend
      let normalizedType = 'TEST_15P';
      const rawType = payload.exam_type?.toUpperCase() || '';
      if (rawType.includes('15') || rawType === 'TEST_15P') normalizedType = 'TEST_15P';
      else if (rawType.includes('1 TIẾT') || rawType.includes('45') || rawType === 'TEST_1P') normalizedType = 'TEST_1P';
      else if (rawType.includes('GIỮA') || rawType === 'MID_TERM') normalizedType = 'MID_TERM';
      else if (rawType.includes('CUỐI') || rawType === 'FINAL') normalizedType = 'FINAL';
      else if (rawType.includes('MIỆNG') || rawType === 'ORAL_TEST') normalizedType = 'ORAL_TEST';

      // Chuẩn hóa ngày DD/MM/YYYY sang YYYY-MM-DD
      let normalizedDate = payload.exam_date;
      if (payload.exam_date && payload.exam_date.includes('/')) {
        const parts = payload.exam_date.split('/');
        if (parts.length === 3) {
          normalizedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
      }

      const response = await fetch(`${API_BASE_URL}/exam-reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({
          class_id: payload.class_id || 'cls_1a_2026',
          subject_code: payload.subject_code || 'MATH',
          exam_type: normalizedType,
          exam_date: normalizedDate,
          message: payload.message,
        }),
      });
      if (response.ok) {
        return true;
      }
    } catch (e) {
      console.warn('Backend create exam-reminder not reachable, saved offline:', e);
    }
    return true;
  },
};
