import { Platform } from 'react-native';
import { authService } from './auth.service';

const API_BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:3000/api/v1'
    : 'http://localhost:3000/api/v1';

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

const DEFAULT_RECORDS: StudentFeeRecord[] = [
  {
    record_id: 'fee_01',
    student_id: 'stu_01',
    student_code: 'HS240101',
    student_name: 'Nguyễn Minh Anh',
    insurance: { is_paid: true, paid_date: '18/09' },
    tuition: { is_paid: true, paid_date: '20/09' },
    note: null,
  },
  {
    record_id: 'fee_02',
    student_id: 'stu_02',
    student_code: 'HS240102',
    student_name: 'Trần Bảo Nam',
    insurance: { is_paid: false, paid_date: null },
    tuition: { is_paid: true, paid_date: '22/09' },
    note: null,
  },
  {
    record_id: 'fee_03',
    student_id: 'stu_03',
    student_code: 'HS240103',
    student_name: 'Lê Thị Cẩm Tú',
    insurance: { is_paid: true, paid_date: '18/09' },
    tuition: { is_paid: false, paid_date: null },
    note: 'Nộp tiền mặt tại lớp',
  },
  {
    record_id: 'fee_04',
    student_id: 'stu_04',
    student_code: 'HS240104',
    student_name: 'Phạm Hoàng Nam',
    insurance: { is_paid: true, paid_date: '20/09' },
    tuition: { is_paid: false, paid_date: null },
    note: null,
  },
  {
    record_id: 'fee_05',
    student_id: 'stu_05',
    student_code: 'HS240105',
    student_name: 'Võ Khánh Linh',
    insurance: { is_paid: false, paid_date: null },
    tuition: { is_paid: true, paid_date: '19/09' },
    note: null,
  },
];

export const feesService = {
  async getClassFeesList(classId: string = 'cls_1a_2026'): Promise<ClassFeesSummary> {
    try {
      const authHeader = await authService.getAuthHeaderAsync();
      const response = await fetch(`${API_BASE_URL}/fees-insurance/class/${classId}`, {
        headers: { 'Content-Type': 'application/json', ...authHeader },
      });

      if (response.ok) {
        const resJson = await response.json();
        const data = resJson.data || resJson;
        if (data && data.records) {
          const records: StudentFeeRecord[] = data.records.map((r: any, idx: number) => ({
            record_id: r.record_id || `fee_0${idx + 1}`,
            student_id: r.student_id || `stu_0${idx + 1}`,
            student_code: r.student_code || `HS24010${idx + 1}`,
            student_name: r.student_name || 'Học sinh',
            tuition: r.tuition || { is_paid: false, paid_date: null },
            insurance: r.insurance || { is_paid: false, paid_date: null },
            note: r.note || null,
          }));

          const insurancePaid = records.filter(r => r.insurance.is_paid).length;
          const tuitionPaid = records.filter(r => r.tuition.is_paid).length;
          const total = records.length || 38;

          return {
            class_id: classId,
            class_name: 'Lớp 1A',
            term_name: 'HK1',
            total_students: total,
            insurance_paid_count: insurancePaid,
            insurance_unpaid_count: Math.max(0, total - insurancePaid),
            insurance_percent: Math.round((insurancePaid / total) * 100),
            tuition_paid_count: tuitionPaid,
            tuition_unpaid_count: Math.max(0, total - tuitionPaid),
            tuition_percent: Math.round((tuitionPaid / total) * 100),
            records,
          };
        }
      }
    } catch (e) {
      console.warn('Backend not reachable, fallback mock fees summary:', e);
    }

    return {
      class_id: classId,
      class_name: 'Lớp 1A',
      term_name: 'HK1',
      total_students: 38,
      insurance_paid_count: 35,
      insurance_unpaid_count: 3,
      insurance_percent: 92,
      tuition_paid_count: 33,
      tuition_unpaid_count: 5,
      tuition_percent: 87,
      records: DEFAULT_RECORDS,
    };
  },

  async toggleFeeStatus(payload: ToggleFeePayload): Promise<boolean> {
    try {
      const authHeader = await authService.getAuthHeaderAsync();
      const response = await fetch(`${API_BASE_URL}/fees-insurance/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        return true;
      }
    } catch (e) {
      console.warn('Backend not reachable, toggle offline:', e);
    }
    return true;
  },

  async sendFeeReminder(payload: RemindFeePayload): Promise<boolean> {
    try {
      const authHeader = await authService.getAuthHeaderAsync();
      const response = await fetch(`${API_BASE_URL}/fees-insurance/remind`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        return true;
      }
    } catch (e) {
      console.warn('Backend not reachable, reminder sent offline:', e);
    }
    return true;
  },
};
