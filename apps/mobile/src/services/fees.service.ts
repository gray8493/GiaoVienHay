import { API_BASE_URL } from '../config/api';
import { authService } from './auth.service';

export type FeeType = 'TUITION' | 'INSURANCE';

export interface FeeItemStatus {
  is_paid: boolean;
  paid_date: string | null;
}

export interface StudentFeeRecord {
  record_id: string;
  student_id: string;
  student_code: string;
  student_name: string;
  tuition: FeeItemStatus;
  insurance: FeeItemStatus;
  note: string | null;
}

export interface ClassFeesSummary {
  class_id: string;
  class_name: string;
  term_name: string;
  total_students: number;
  insurance_paid_count: number;
  insurance_unpaid_count: number;
  insurance_percent: number;
  tuition_paid_count: number;
  tuition_unpaid_count: number;
  tuition_percent: number;
  records: StudentFeeRecord[];
}

export interface ToggleFeePayload {
  record_id: string;
  fee_type: FeeType;
  is_paid: boolean;
  paid_date?: string;
  note?: string;
}

export interface RemindFeePayload {
  class_id: string;
  fee_type: FeeType;
  custom_message?: string;
}

export const feesService = {
  async getClassFeesList(classId: string = ''): Promise<ClassFeesSummary> {
    const emptySummary: ClassFeesSummary = {
      class_id: classId,
      class_name: '',
      term_name: 'HK1',
      total_students: 0,
      insurance_paid_count: 0,
      insurance_unpaid_count: 0,
      insurance_percent: 0,
      tuition_paid_count: 0,
      tuition_unpaid_count: 0,
      tuition_percent: 0,
      records: [],
    };

    if (!classId || classId === 'cls_empty') return emptySummary;

    try {
      const authHeader = await authService.getAuthHeaderAsync();
      const response = await fetch(`${API_BASE_URL}/fees-insurance/class/${classId}`, {
        headers: { 'Content-Type': 'application/json', ...authHeader },
      });

      if (response.ok) {
        const resJson = await response.json();
        const data = resJson.data || resJson;
        if (data && Array.isArray(data.records)) {
          const records: StudentFeeRecord[] = data.records.map((r: any) => ({
            record_id: r.record_id || '',
            student_id: r.student_id || '',
            student_code: r.student_code || '',
            student_name: r.student_name || 'Học sinh',
            tuition: r.tuition || { is_paid: false, paid_date: null },
            insurance: r.insurance || { is_paid: false, paid_date: null },
            note: r.note || null,
          }));

          const insurancePaid = records.filter(r => r.insurance.is_paid).length;
          const tuitionPaid = records.filter(r => r.tuition.is_paid).length;
          const total = records.length;

          return {
            class_id: classId,
            class_name: data.class_name || 'Lớp học',
            term_name: data.term_name || 'HK1',
            total_students: total,
            insurance_paid_count: insurancePaid,
            insurance_unpaid_count: Math.max(0, total - insurancePaid),
            insurance_percent: total > 0 ? Math.round((insurancePaid / total) * 100) : 0,
            tuition_paid_count: tuitionPaid,
            tuition_unpaid_count: Math.max(0, total - tuitionPaid),
            tuition_percent: total > 0 ? Math.round((tuitionPaid / total) * 100) : 0,
            records,
          };
        }
      }
    } catch (e) {
      console.warn('Backend not reachable:', e);
    }

    return emptySummary;
  },

  async toggleFeeStatus(payload: ToggleFeePayload): Promise<boolean> {
    const authHeader = await authService.getAuthHeaderAsync();
    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}/fees-insurance/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify(payload),
      });
    } catch (e: any) {
      throw new Error('Không thể kết nối máy chủ. Vui lòng kiểm tra kết nối mạng.');
    }

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Không thể cập nhật trạng thái thu phí');
    }
    return true;
  },

  async sendFeeReminder(payload: RemindFeePayload): Promise<boolean> {
    const authHeader = await authService.getAuthHeaderAsync();
    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}/fees-insurance/remind`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify(payload),
      });
    } catch (e: any) {
      throw new Error('Không thể kết nối máy chủ. Vui lòng kiểm tra kết nối mạng.');
    }

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Không thể gửi thông báo nhắc đóng phí');
    }
    return true;
  },
};
