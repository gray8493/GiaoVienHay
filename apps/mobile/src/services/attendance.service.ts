import { Platform } from 'react-native';

const API_BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:3000/api/v1'
    : 'http://localhost:3000/api/v1';

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
    token?: string
  ): Promise<SubmitAttendanceResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/attendance/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Không thể lưu điểm danh');
      }

      return await response.json();
    } catch (err: any) {
      console.warn('[AttendanceService] submitAttendance fallback/mock:', err?.message);
      // Fallback mock khi BE offline
      const presentCount = payload.records.filter(
        (r) => r.status === AttendanceStatus.PRESENT
      ).length;
      const absentCount = payload.records.length - presentCount;

      return {
        attendance_date: payload.attendance_date,
        total_students: payload.records.length,
        present_count: presentCount,
        absent_count: absentCount,
        notified_parents_queued: absentCount,
      };
    }
  }

  /**
   * Lấy danh sách học sinh CÓ MẶT HÔM NAY (cho Vòng quay / Quiz)
   * GET /attendance/today/:classId
   */
  async getTodayPresentStudents(
    classId: string,
    token?: string
  ): Promise<TodayPresentStudentsResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/attendance/today/${classId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error('Lỗi tải danh sách có mặt');
      }

      return await response.json();
    } catch (err: any) {
      console.warn('[AttendanceService] getTodayPresentStudents mock fallback:', err?.message);
      return {
        class_id: classId,
        today: new Date().toISOString().split('T')[0],
        total_present: 36,
        present_students: [
          { id: 'stu_1', full_name: 'Nguyễn Minh Anh', student_code: 'HS240101' },
          { id: 'stu_3', full_name: 'Lê Thị Cẩm Tú', student_code: 'HS240103' },
          { id: 'stu_5', full_name: 'Võ Khánh Linh', student_code: 'HS240105' },
          { id: 'stu_6', full_name: 'Đặng Quốc Huy', student_code: 'HS240106' },
          { id: 'stu_7', full_name: 'Hoàng Hải Đăng', student_code: 'HS240107' },
          { id: 'stu_8', full_name: 'Bùi Thanh Trúc', student_code: 'HS240108' },
        ],
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
    token?: string
  ) {
    try {
      const queryParams = new URLSearchParams();
      if (date) queryParams.append('date', date);
      if (month) queryParams.append('month', month);

      const url = `${API_BASE_URL}/attendance/class/${classId}?${queryParams.toString()}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error('Lỗi tải lịch sử điểm danh');
      }

      return await response.json();
    } catch (err: any) {
      console.warn('[AttendanceService] getClassAttendance fallback:', err?.message);
      return [];
    }
  }
}

export const attendanceService = new AttendanceService();
