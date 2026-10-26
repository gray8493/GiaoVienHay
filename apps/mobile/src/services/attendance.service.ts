import { api } from './http';

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT_EXCUSED = 'ABSENT_EXCUSED',
  ABSENT_UNEXCUSED = 'ABSENT_UNEXCUSED',
  LATE = 'LATE',
}

export interface AttendanceRecordItem {
  student_id: string;
  status: AttendanceStatus;
  note?: string;
}

export interface SubmitAttendancePayload {
  class_id: string;
  attendance_date: string; // YYYY-MM-DD
  period?: number;
  records: AttendanceRecordItem[];
}

export interface SubmitAttendanceResponse {
  attendance_date: string;
  total_students: number;
  present_count: number;
  absent_count: number;
  notified_parents_queued: number;
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

export class AttendanceService {
  /**
   * Điểm danh 1-chạm (GVCN)
   * POST /attendance/submit
   */
  async submitAttendance(
    payload: SubmitAttendancePayload,
    _token?: string
  ): Promise<SubmitAttendanceResponse> {
    return api<SubmitAttendanceResponse>('/attendance/submit', {
      method: 'POST',
      body: payload,
      errorMessage: 'Không thể lưu điểm danh',
    });
  }

  /**
   * Lấy danh sách học sinh CÓ MẶT HÔM NAY (cho Vòng quay / Quiz)
   * GET /attendance/today/:classId
   */
  async getTodayPresentStudents(
    classId: string,
    _token?: string
  ): Promise<TodayPresentStudentsResponse> {
    try {
      return await api<TodayPresentStudentsResponse>(`/attendance/today/${classId}`, {
        errorMessage: 'Lỗi tải danh sách có mặt',
      });
    } catch (err: any) {
      console.warn('[AttendanceService] getTodayPresentStudents failed:', err?.message);
      return {
        class_id: classId,
        today: new Date().toISOString().split('T')[0],
        is_attended_today: false,
        total_present: 0,
        present_students: [],
      };
    }
  }

  /**
   * Xem lịch sử điểm danh của lớp theo ngày/tháng
   * GET /attendance/class/:classId
   */
  async getClassAttendance(
    classId: string,
    date?: string,
    month?: string,
    _token?: string
  ) {
    try {
      const queryParams = new URLSearchParams();
      if (date) queryParams.append('date', date);
      if (month) queryParams.append('month', month);

      const payload = await api<any>(
        `/attendance/class/${classId}?${queryParams.toString()}`,
        { errorMessage: 'Lỗi tải lịch sử điểm danh' },
      );
      // API trả về dạng wrapper { class_id, date, total_records, records: [...] }
      // Chuẩn hoá luôn thành mảng bản ghi để caller không phải bóc wrapper
      if (Array.isArray(payload?.records)) return payload.records;
      return Array.isArray(payload) ? payload : [];
    } catch (err: any) {
      console.warn('[AttendanceService] getClassAttendance fallback:', err?.message);
      return [];
    }
  }
}

export const attendanceService = new AttendanceService();
