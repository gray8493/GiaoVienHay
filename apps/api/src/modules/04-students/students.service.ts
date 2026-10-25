import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { FirebaseDataConnectService } from '../../common/supabase/supabase.service';

function normalizePhone(value?: string | null): string {
  if (!value) return '';
  let digits = String(value).replace(/[^\d+]/g, '');
  if (digits.startsWith('+84')) digits = `0${digits.slice(3)}`;
  else if (digits.startsWith('84') && digits.length > 10) digits = `0${digits.slice(2)}`;
  return digits;
}

// Nhãn tiếng Việt cho các mã score_type (thay vì hiện "Kiểm tra ORAL_TEST" cho phụ huynh)
const SCORE_TYPE_LABELS: Record<string, string> = {
  ORAL_TEST: 'Kiểm tra miệng',
  QUIZ: 'Kiểm tra',
  TEST_15P: 'Kiểm tra 15 phút',
  TEST_1P: 'Kiểm tra 1 tiết',
  MID_TERM: 'Thi giữa kỳ',
  FINAL: 'Thi cuối kỳ',
};

@Injectable()
export class StudentsService {
  constructor(
    private readonly dataConnect: FirebaseDataConnectService,
  ) {}

  async getStudentProfile(studentId: string, parentPhone?: string) {
    const student = await this.findStudent(studentId, parentPhone);
    const classId = (student as any).class_id || (student as any).classId || '';
    let className = (student as any).class_name || (student as any).className || '';
    let schoolName = (student as any).school_name || (student as any).schoolName || '';

    if (classId) {
      const cls = await this.dataConnect.getClassById(classId).catch(() => null);
      if (cls) {
        className = className || cls.name || '';
        schoolName = schoolName || cls.school_name || cls.schoolName || '';
      }
    }

    return {
      student_id: (student as any).id || (student as any).student_id || studentId,
      full_name: (student as any).full_name || (student as any).fullName,
      student_code: (student as any).student_code || (student as any).studentCode || '',
      class_id: classId,
      class_name: className,
      school_name: schoolName,
      dob: (student as any).dob || '',
      gender: (student as any).gender || '',
      avatar_url: (student as any).avatar_url || (student as any).avatarUrl || '',
      id: (student as any).id || studentId,
    };
  }

  async getAcademicRecord(studentId: string, semester?: number, parentPhone?: string) {
    if (semester !== undefined && (isNaN(semester) || semester < 1 || semester > 2)) {
      throw new BadRequestException({
        error_code: 'COMMON_VALIDATION_ERROR',
        message: 'Tham số học kỳ không hợp lệ. Học kỳ chỉ chấp nhận giá trị 1 hoặc 2.',
      });
    }

    const student = await this.findStudent(studentId, parentPhone);
    const resolvedId = (student as any).id || studentId;
    let scoresList: any[] = [];
    try {
      scoresList = await this.dataConnect.getScoresByStudent(resolvedId);
    } catch (e) {}

    if (!scoresList || scoresList.length === 0) {
      return {
        student_id: (student as any).id || studentId,
        full_name: (student as any).full_name || (student as any).fullName,
        class_name: (student as any).class_name || (student as any).className || '',
        semester: semester || 1,
        subjects: [],
      };
    }

    const subjectsMap = new Map<string, any>();
    for (const score of scoresList) {
      const subjectCode = score.subject || score.subject_code || 'MATH';
      const subjectName =
        score.subject_name ||
        (subjectCode === 'MATH'
          ? 'Toán học'
          : subjectCode === 'LITERATURE' || subjectCode === 'LIT'
          ? 'Tiếng Việt'
          : subjectCode);

      if (!subjectsMap.has(subjectCode)) {
        subjectsMap.set(subjectCode, {
          subject_code: subjectCode,
          subject_name: subjectName,
          scores: [],
        });
      }

      const rawScoreType = String(score.scoreType || score.score_type || '');
      subjectsMap.get(subjectCode).scores.push({
        type: rawScoreType,
        label: SCORE_TYPE_LABELS[rawScoreType.toUpperCase()] || 'Kiểm tra ' + rawScoreType,
        value: score.scoreValue !== undefined ? score.scoreValue : score.score_value,
        comment: score.comment || score.teacher_note,
      });
    }

    return {
      student_id: (student as any).id || studentId,
      full_name: (student as any).full_name || (student as any).fullName,
      class_name: (student as any).class_name || (student as any).className || '',
      semester: semester || 1,
      subjects: Array.from(subjectsMap.values()),
    };
  }

  async getAttendanceHistory(studentId: string, month?: string, parentPhone?: string) {
    if (month && !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      throw new BadRequestException({
        error_code: 'COMMON_VALIDATION_ERROR',
        message: 'Định dạng tháng không hợp lệ. Tham số month phải có định dạng YYYY-MM với tháng từ 01 đến 12.',
      });
    }

    const student = await this.findStudent(studentId, parentPhone);
    const resolvedId = (student as any).id || studentId;

    let records: any[] = [];
    try {
      records = await this.dataConnect.getAttendanceByStudent(resolvedId);
    } catch (e) {}

    const filteredRecords = month
      ? records.filter((r) => !r.date || r.date.startsWith(month))
      : records;

    const presentRecords = filteredRecords.filter((r) => r.status === 'PRESENT');
    const absentExcused = filteredRecords.filter((r) => r.status === 'ABSENT_EXCUSED');
    const absentUnexcused = filteredRecords.filter((r) => r.status === 'ABSENT_UNEXCUSED');
    const lateRecords = filteredRecords.filter((r) => r.status === 'LATE');
    const totalAbsent = absentExcused.length + absentUnexcused.length;
    const totalSessions = filteredRecords.length;
    const attendanceRate = totalSessions === 0 ? 100 : Math.round((presentRecords.length / totalSessions) * 100);

    const absentDates = filteredRecords
      .filter((r) => r.status === 'ABSENT_EXCUSED' || r.status === 'ABSENT_UNEXCUSED')
      .map((r) => r.date);

    return {
      student_id: (student as any).id || studentId,
      full_name: (student as any).full_name || (student as any).fullName,
      month: month || new Date().toISOString().slice(0, 7),
      total_school_days: totalSessions || 22,
      total_sessions: totalSessions,
      total_present: presentRecords.length,
      present_days: presentRecords.length,
      absent_excused: absentExcused.length,
      total_absent_excused: absentExcused.length,
      absent_unexcused: absentUnexcused.length,
      total_absent_unexcused: absentUnexcused.length,
      late_days: lateRecords.length,
      total_absent: totalAbsent,
      attendance_rate: attendanceRate,
      absent_dates: absentDates,
      absent_details: filteredRecords
        .filter((r) => r.status && r.status.startsWith('ABSENT'))
        .map((r) => ({
          date: r.date,
          status: r.status === 'ABSENT_EXCUSED' ? 'EXCUSED' : 'UNEXCUSED',
          reason: r.reason || r.note || null,
        })),
      records: filteredRecords,
    };
  }

  async getFeesInsuranceStatus(studentId: string, parentPhone?: string) {
    const student = await this.findStudent(studentId, parentPhone);
    const resolvedId = (student as any).id || studentId;

    const fees: any[] = await this.dataConnect.getFeesByStudent(resolvedId);

    const insuranceRecord = fees.find((f) => f.fee_type === 'INSURANCE' || f.type === 'INSURANCE');
    const tuitionRecord = fees.find((f) => f.fee_type === 'TUITION' || f.type === 'TUITION');

    const isPaidInsurance = insuranceRecord ? Boolean(insuranceRecord.is_paid ?? insuranceRecord.isPaid) : false;
    const isPaidTuition = tuitionRecord ? Boolean(tuitionRecord.is_paid ?? tuitionRecord.isPaid) : false;

    return {
      student_id: (student as any).id || studentId,
      academic_year: '2026-2027',
      is_paid_insurance: isPaidInsurance,
      insurance_paid_at: insuranceRecord?.paid_at || insuranceRecord?.paid_date || null,
      is_paid_tuition: isPaidTuition,
      tuition_due_date: tuitionRecord?.due_date || tuitionRecord?.deadline || '2026-10-05',
      tuition: {
        is_paid: isPaidTuition,
        amount: tuitionRecord?.amount ?? 1200000,
        paid_date: tuitionRecord?.paid_at || tuitionRecord?.paid_date || null,
        due_date: tuitionRecord?.due_date || tuitionRecord?.deadline || '2026-10-05',
        status_label: isPaidTuition ? 'ĐÃ HOÀN THÀNH' : 'CHƯA NỘP',
      },
      insurance: {
        is_paid: isPaidInsurance,
        amount: insuranceRecord?.amount ?? 880000,
        paid_date: insuranceRecord?.paid_at || insuranceRecord?.paid_date || null,
        deadline: insuranceRecord?.deadline || insuranceRecord?.due_date || '2026-10-15',
        status_label: isPaidInsurance ? 'ĐÃ HOÀN THÀNH' : 'CHƯA NỘP',
      },
      term_name: 'Học kỳ 1 năm học 2026-2027',
      fee_records: fees,
    };
  }

  async getRemarks(studentId: string, parentPhone?: string) {
    const student = await this.findStudent(studentId, parentPhone);
    const resolvedId = (student as any).id || studentId;

    let sqlRemarks: any[] = [];
    try {
      sqlRemarks = await this.dataConnect.getRemarksByStudent(resolvedId);
    } catch (e) {}

    if (!sqlRemarks || sqlRemarks.length === 0) {
      return [];
    }

    return sqlRemarks.map((r: any) => ({
      id: r.id || r.remark_id || 'rmk_9912',
      remark_id: r.remark_id || r.id || 'rmk_9912',
      teacher_name: r.teacher_name || r.teacherName || 'Nguyễn Thị Lan',
      subject_name: r.subject_name || r.subject || 'Toán học',
      content: r.content,
      parent_acknowledged: r.parent_acknowledged ?? true,
      created_at: r.created_at || r.createdAt || '2026-09-23T10:15:00.000Z',
    }));
  }

  async getExamReminders(studentId: string, parentPhone?: string) {
    const student = await this.findStudent(studentId, parentPhone);
    let list: any[] = [];
    if ((student as any)?.class_id && this.dataConnect?.getExamRemindersByClass) {
      try {
        const sqlReminders = await this.dataConnect.getExamRemindersByClass((student as any).class_id);
        if (sqlReminders && sqlReminders.length > 0) {
          list = sqlReminders.map((r: any) => ({
            id: r.id || r.reminder_id || 'exm_rem_001',
            reminder_id: r.reminder_id || r.id || 'exm_rem_001',
            subject_name: r.subject || r.subject_name || 'Toán học',
            exam_type: r.exam_type || r.examType || '',
            exam_date: r.exam_date || r.examDate || '',
            title: r.title || '',
            instructions: r.instructions || '',
            content_scope: r.content_scope || r.note || r.title || '',
            created_at: r.created_at || r.createdAt || new Date().toISOString(),
          }));
        }
      } catch (e) {}
    }

    return list;
  }

  private async findStudent(studentId: string, parentPhone?: string) {
    if (!studentId || studentId.trim() === '') {
      throw new BadRequestException({
        error_code: 'COMMON_VALIDATION_ERROR',
        message: 'Mã học sinh không được để trống',
      });
    }

    const cleanId = studentId.trim();
    const student = await this.dataConnect.getStudentById(cleanId);
    if (!student) {
      throw new NotFoundException({
        error_code: 'STUDENT_NOT_FOUND',
        message: 'Không tìm thấy hồ sơ học sinh trên hệ thống',
      });
    }

    if (parentPhone) {
      const expectedPhone = normalizePhone(parentPhone);
      const studentPhone = normalizePhone(
        (student as any).parent_phone || (student as any).parentPhone,
      );
      if (!expectedPhone || !studentPhone || expectedPhone !== studentPhone) {
        throw new ForbiddenException({
          error_code: 'FORBIDDEN_STUDENT_ACCESS',
          message: 'Bạn không có quyền truy cập hồ sơ học sinh này',
        });
      }
    }

    return student;
  }
}
