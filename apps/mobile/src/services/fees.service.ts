import { api } from './http';
import { classService } from './class.service';

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

const detectFeeType = (row: any): FeeType | null => {
  const rawType = String(row.fee_type || row.type || '').toUpperCase();
  if (rawType === 'INSURANCE' || rawType === 'BHYT') return 'INSURANCE';
  if (rawType === 'TUITION' || rawType === 'FEE') return 'TUITION';
  const title = String(row.title || row.name || '').toLowerCase();
  if (
    title.includes('bảo hiểm') ||
    title.includes('bhyt') ||
    title.includes('insurance')
  ) {
    return 'INSURANCE';
  }
  if (title.includes('học phí') || title.includes('tuition')) return 'TUITION';
  return null;
};

const normalizePaidDate = (row: any): string | null => {
  const pd = row.paid_date || (row.paid_at ? String(row.paid_at).slice(0, 10) : null);
  return pd || null;
};

export const feesService = {
  async getClassFeesList(classId: string = ''): Promise<ClassFeesSummary> {
    const emptySummary: ClassFeesSummary = {
      class_id: classId,
      class_name: '',
      term_name: '',
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
      // Lấy danh sách học sinh của lớp song song với dữ liệu thu nộp
      const [classDetail, data] = await Promise.all([
        classService.getClassDetail(classId).catch(() => null),
        api<any>(`/fees-insurance/class/${classId}`).catch(() => null),
      ]);

      const rawFeeRows: any[] = data && Array.isArray(data.records) ? data.records : [];

      // Gom bản ghi phí theo student_id (hỗ trợ cả shape DB lẫn shape demo)
      const rowsByStudent = new Map<string, any[]>();
      for (const row of rawFeeRows) {
        if (row.is_deleted === true) continue;
        const sid = String(row.student_id || row.studentId || '');
        if (!sid) continue;
        const arr = rowsByStudent.get(sid) || [];
        arr.push(row);
        rowsByStudent.set(sid, arr);
      }

      const buildStudentFee = (studentId: string) => {
        const rows = rowsByStudent.get(studentId) || [];
        const tuition = { is_paid: false, paid_date: null as string | null };
        const insurance = { is_paid: false, paid_date: null as string | null };
        let recordId = '';
        let note: string | null = null;

        for (const row of rows) {
          recordId = recordId || String(row.record_id || row.id || '');
          note = note ?? (row.note ?? null);

          // Shape nested (bản ghi demo backend: tuition/insurance là object)
          if (row.tuition && typeof row.tuition === 'object') {
            if (row.tuition.is_paid) {
              tuition.is_paid = true;
              tuition.paid_date = row.tuition.paid_date || normalizePaidDate(row);
            }
          }
          if (row.insurance && typeof row.insurance === 'object') {
            if (row.insurance.is_paid) {
              insurance.is_paid = true;
              insurance.paid_date = row.insurance.paid_date || normalizePaidDate(row);
            }
          }

          // Shape DB thô: mỗi dòng một loại phí (title/fee_type + status PAID)
          const isPaid = row.is_paid === true || row.status === 'PAID';
          const feeType = detectFeeType(row);
          if (isPaid && feeType) {
            const pd = normalizePaidDate(row);
            if (feeType === 'INSURANCE') {
              insurance.is_paid = true;
              insurance.paid_date = pd;
            } else {
              tuition.is_paid = true;
              tuition.paid_date = pd;
            }
          }
        }

        return { recordId, note, tuition, insurance };
      };

      // Danh sách gốc là TOÀN BỘ học sinh của lớp — merge trạng thái nếu có dòng phí
      const students: any[] = classDetail?.students || [];

      const records: StudentFeeRecord[] =
        students.length > 0
          ? students.map((s: any) => {
              const sid = String(s.id || s.student_id || '');
              const feeInfo = buildStudentFee(sid);
              return {
                record_id: feeInfo.recordId || `fee_${sid}`,
                student_id: sid,
                student_code: s.student_code || '',
                student_name: s.full_name || s.name || 'Học sinh',
                tuition: feeInfo.tuition,
                insurance: feeInfo.insurance,
                note: feeInfo.note,
              };
            })
          : rawFeeRows.map((r: any) => ({
              record_id: String(r.record_id || r.id || ''),
              student_id: String(r.student_id || r.studentId || ''),
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
        class_name: classDetail?.name || data?.class_name || '',
        term_name: data?.term_name || '',
        total_students: total,
        insurance_paid_count: insurancePaid,
        insurance_unpaid_count: Math.max(0, total - insurancePaid),
        insurance_percent: total > 0 ? Math.round((insurancePaid / total) * 100) : 0,
        tuition_paid_count: tuitionPaid,
        tuition_unpaid_count: Math.max(0, total - tuitionPaid),
        tuition_percent: total > 0 ? Math.round((tuitionPaid / total) * 100) : 0,
        records,
      };
    } catch (e) {
      console.warn('getClassFeesList failed:', e);
    }

    return emptySummary;
  },

  async toggleFeeStatus(payload: ToggleFeePayload): Promise<boolean> {
    await api('/fees-insurance/toggle', {
      method: 'PATCH',
      body: payload,
      errorMessage: 'Không thể cập nhật trạng thái thu phí',
    });
    return true;
  },

  async sendFeeReminder(payload: RemindFeePayload): Promise<boolean> {
    await api('/fees-insurance/remind', {
      method: 'POST',
      body: payload,
      errorMessage: 'Không thể gửi thông báo nhắc đóng phí',
    });
    return true;
  },
};
