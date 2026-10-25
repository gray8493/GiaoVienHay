import { api, apiFetch } from './http';
import { authService } from './auth.service';
import { EXAM_TYPE_LABELS, WEEKDAY_FULL_LABELS, WEEKDAY_SHORT_LABELS } from '../constants/academic';

export const PARENT_SCORE_COLUMNS: Array<{
  key: string;
  label: string;
  aliases: string[];
  weight: number;
}> = [
  { key: 'oral', label: 'Miệng', aliases: ['ORALTEST', 'ORAL', 'MIENG'], weight: 1 },
  { key: 'test15p', label: '15 phút', aliases: ['TEST15P', '15MIN', '15P'], weight: 2 },
  { key: 'test1p', label: '1 Tiết', aliases: ['TEST1P', '1TIET', '45MIN'], weight: 3 },
  { key: 'midTerm', label: 'Thi GK', aliases: ['MIDTERM', 'GK', 'GIUAKY'], weight: 2 },
  { key: 'final', label: 'Thi CK', aliases: ['FINAL', 'CK', 'CUOIKY'], weight: 3 },
];

const normalizeScoreType = (raw: any): string =>
  String(raw ?? '')
    .trim()
    .toUpperCase()
    .replace(/[\s_-]/g, '');

const canonicalSubjectKey = (name: string): string => {
  const normalized = String(name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]/g, '');
  const aliases: Record<string, string> = {
    toan: 'math',
    toanhoc: 'math',
    tiengviet: 'lit',
    nguvan: 'lit',
    tienganh: 'eng',
    tinhoc: 'it',
    daoduc: 'ethics',
  };
  if (aliases[normalized]) return aliases[normalized];
  const withoutSuffix = normalized.replace(/hoc$/, '');
  return aliases[withoutSuffix] || withoutSuffix;
};

const SUBJECT_DISPLAY_INFO: Record<string, { name: string; color: string }> = {
  math: { name: 'Toán', color: '#F58F4C' },
  lit: { name: 'Ngữ văn', color: '#EC6D8C' },
  eng: { name: 'Tiếng Anh', color: '#5B8DEF' },
  it: { name: 'Tin học', color: '#8B7CF6' },
  khoa: { name: 'Khoa học', color: '#10B981' },
  science: { name: 'Khoa học', color: '#10B981' },
  lichsu: { name: 'Lịch sử', color: '#D97706' },
  history: { name: 'Lịch sử', color: '#D97706' },
  diali: { name: 'Địa lí', color: '#0EA5E9' },
  geography: { name: 'Địa lí', color: '#0EA5E9' },
  ethics: { name: 'Đạo đức', color: '#A855F7' },
};

// Nhãn ngắn cho thẻ "Điểm mới" trên dashboard phụ huynh
const SHORT_TEST_TYPE_LABELS: Record<string, string> = {
  ORAL_TEST: 'Miệng',
  QUIZ: 'Kiểm tra',
  TEST_15P: '15 phút',
  TEST_1P: '1 tiết',
  MID_TERM: 'Giữa kỳ',
  FINAL: 'Cuối kỳ',
};

const getSubjectDisplay = (value: any): { name: string; color: string } => {
  const raw = String(value || '').trim();
  if (!raw) return { name: 'Môn học', color: '#F58F4C' };
  const key = canonicalSubjectKey(raw);
  const info = SUBJECT_DISPLAY_INFO[key];
  if (info) return info;
  return {
    name: raw.replace(/\s*học$/i, '').trim() || 'Môn học',
    color: '#F58F4C',
  };
};

const parseExamDate = (value: any): Date | null => {
  const raw = String(value || '').split('T')[0];
  if (!raw) return null;
  const date = new Date(`${raw}T00:00:00`);
  return isNaN(date.getTime()) ? null : date;
};

const deriveExamTypeLabel = (examType: any, title: any): string => {
  const code = String(examType || '').trim().toUpperCase();
  if (EXAM_TYPE_LABELS[code]) return EXAM_TYPE_LABELS[code];
  const rawTitle = String(title || '').trim();
  if (rawTitle) {
    const prefix = rawTitle.split(/\s*[-–]\s*Môn\s+/i)[0].trim();
    if (prefix) return prefix;
  }
  return code && code.length <= 30 ? code : 'Kiểm tra';
};

const subjectFromTitle = (title: any): string => {
  const match = String(title || '').match(/[-–]\s*Môn\s+(.+)$/i);
  return match ? match[1].trim() : '';
};

const pickLatestScoreValue = (scores: any[], aliases: string[]): number | null => {
  let latest: any = null;
  for (const score of scores) {
    if (!aliases.includes(normalizeScoreType(score.type ?? score.score_type))) continue;
    if (
      latest === null ||
      String(score.created_at ?? score.createdAt ?? '') >
        String(latest.created_at ?? latest.createdAt ?? '')
    ) {
      latest = score;
    }
  }
  if (!latest) return null;
  const raw = latest.value ?? latest.score_value ?? latest.scoreValue;
  const num = Number(raw);
  if (raw === null || raw === undefined || raw === '--' || isNaN(num)) return null;
  return num;
};

export interface ChildItem {
  id: string;
  student_code: string;
  full_name: string;
  avatar_letters: string;
  class_name: string;
  school_name?: string;
  attendance_status?: string;
  attendance_note?: string;
}

export interface ParentDashboardData {
  child: ChildItem;
  attendance: {
    status_title: string;
    note: string;
    date_str: string;
  };
  latest_grade: {
    subject: string;
    score: number;
    test_type: string;
  };
  latest_remark: {
    count_label: string;
    status_label: string;
    teacher_name?: string;
    content?: string;
  };
  fees_insurance: {
    type: string;
    status_label: string;
    amount?: number;
  };
  upcoming_exam: {
    subject: string;
    exam_date: string;
  };
}

const toChildItem = (student: any): ChildItem => {
  const fullName = student.full_name || student.fullName || 'Học sinh';
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .map((w: string) => w[0])
    .slice(-2)
    .join('')
    .toUpperCase();
  const rawClassName = student.class_name || student.className || '';
  const classNameFormatted = rawClassName
    ? rawClassName.startsWith('Lớp')
      ? rawClassName
      : `Lớp ${rawClassName}`
    : 'Lớp học';

  return {
    id: student.id || student.student_id || '',
    student_code: student.student_code || student.studentCode || '',
    full_name: fullName,
    avatar_letters: initials || 'HS',
    class_name: classNameFormatted,
    school_name: student.school_name || student.schoolName || '',
  };
};

export interface JoinClassChildPayload {
  invite_code: string;
  child_name?: string;
  dob?: string;
  gender?: 'MALE' | 'FEMALE';
  relationship?: string;
  student_code?: string;
}

export interface PreviewClassData {
  class_id: string;
  name: string;
  grade_level: number;
  academic_year: string;
  school_name: string;
  homeroom_teacher: string;
  student_count: number;
  invite_code: string;
}

export const parentService = {
  async getLinkedChildren(): Promise<ChildItem[]> {
    try {
      const me = await api<any>('/users/me');
      const linkedIds: string[] = Array.isArray(me?.linked_student_ids)
        ? me.linked_student_ids.map(String)
        : [];

      if (linkedIds.length === 0) return [];

      const children = await Promise.all(
        linkedIds.map(async (studentId) => {
          try {
            const student = await api<any>(`/students/${encodeURIComponent(studentId)}`);
            return student ? toChildItem(student) : null;
          } catch (e) {
            return null;
          }
        }),
      );

      return children.filter((child): child is ChildItem => Boolean(child && child.id));
    } catch (e) {
      console.warn('getLinkedChildren failed:', e);
      return [];
    }
  },

  async getChildDashboard(studentId: string): Promise<ParentDashboardData | null> {
    if (!studentId) {
      return null;
    }

    try {
      // 1. Fetch Student Profile (cần trước để lấy tên)
      const profile = await api<any>(`/students/${studentId}`);

      const initials = (profile.full_name || 'HS')
        .split(' ')
        .filter(Boolean)
        .map((w: string) => w[0])
        .slice(-2)
        .join('')
        .toUpperCase();

      const classNameFormatted = profile.class_name
        ? (profile.class_name.startsWith('Lớp') ? profile.class_name : `Lớp ${profile.class_name}`)
        : 'Lớp học';

      const dashboardData: ParentDashboardData = {
        child: {
          id: profile.id || studentId,
          student_code: profile.student_code || profile.code || '',
          full_name: profile.full_name || 'Học sinh',
          avatar_letters: initials || 'HS',
          class_name: classNameFormatted,
          school_name: profile.school_name || '',
        },
        attendance: {
          status_title: 'Chưa điểm danh',
          note: 'Chưa có ghi nhận hôm nay',
          date_str: 'HÔM NAY',
        },
        latest_grade: {
          subject: 'Chưa có',
          score: 0,
          test_type: '',
        },
        latest_remark: {
          count_label: '0 lời mới',
          status_label: 'Chưa có',
          teacher_name: '',
          content: 'Chưa có nhận xét nào từ giáo viên',
        },
        fees_insurance: {
          type: 'BHYT',
          status_label: 'Chưa có',
        },
        upcoming_exam: {
          subject: 'Không có',
          exam_date: '--/--',
        },
      };

      // 2. Các dữ liệu còn lại độc lập với nhau → gọi song song
      const [academic, attendance, remarks, fees, exams] = await Promise.all([
        api<any>(`/students/${studentId}/academic`).catch(() => null),
        api<any>(`/students/${studentId}/attendance`).catch(() => null),
        api<any>(`/students/${studentId}/remarks`).catch(() => null),
        api<any>(`/students/${studentId}/fees-insurance`).catch(() => null),
        api<any>(`/students/${studentId}/exam-reminders`).catch(() => null),
      ]);

      if (academic?.subjects && academic.subjects.length > 0) {
        const firstSubj = academic.subjects[0];
        if (firstSubj.scores && firstSubj.scores.length > 0) {
          const lastScore = firstSubj.scores[firstSubj.scores.length - 1];
          dashboardData.latest_grade = {
            subject: firstSubj.subject_name?.replace(' học', '') || 'Môn học',
            score: lastScore.value !== undefined ? Number(lastScore.value) : 0,
            // Map mã score_type (ORAL_TEST, TEST_15P...) sang nhãn ngắn tiếng Việt thay vì hiện mã gốc
            test_type:
              SHORT_TEST_TYPE_LABELS[String(lastScore.type || '').toUpperCase()] ||
              lastScore.label?.replace('Kiểm tra ', '') ||
              '15 phút',
          };
        }
        // KHÔNG bịa "lịch học hôm nay" từ danh sách môn nữa:
        // hệ thống không có bảng thời khóa biểu, giờ học 07:15-08:00 đều là số bịa
      }

      const latestRec = attendance?.records && attendance.records.length > 0 ? attendance.records[0] : null;
      if (latestRec) {
        let statusTitle = 'Đã Có Mặt';
        if (latestRec.status === 'ABSENT_EXCUSED') statusTitle = 'Vắng Có Phép';
        else if (latestRec.status === 'ABSENT_UNEXCUSED') statusTitle = 'Vắng Không Phép';

        dashboardData.attendance = {
          status_title: statusTitle,
          note: latestRec.note || (latestRec.status === 'PRESENT' ? 'Đi học đúng giờ' : 'Nghỉ học'),
          date_str: latestRec.date ? `HÔM NAY • ${latestRec.date}` : dashboardData.attendance.date_str,
        };
      }

      if (Array.isArray(remarks) && remarks.length > 0) {
        const latestRmk = remarks[remarks.length - 1];
        dashboardData.latest_remark = {
          count_label: `${remarks.length} lời mới`,
          status_label: 'Đã nhận',
          teacher_name: latestRmk.teacher_name || 'Giáo viên bộ môn',
          content: latestRmk.content || 'Đã gửi nhận xét rèn luyện',
        };
      }

      if (fees?.insurance) {
        dashboardData.fees_insurance = {
          type: 'BHYT',
          status_label: fees.insurance.is_paid ? 'Đã nộp' : 'Chưa nộp',
        };
      }

      if (Array.isArray(exams) && exams.length > 0) {
        // Chỉ nhận lịch kiểm tra CHƯA QUÁ KHỨ, lấy lịch gần nhất — trước đây
        // lấy exams[0] (thứ tự chèn) nên tài khoản mới nhận lịch seed từ 2024
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const upcoming = exams
          .map((e: any) => ({ ...e, _d: parseExamDate(e.exam_date) }))
          .filter((e: any) => e._d && e._d.getTime() >= today.getTime())
          .sort((a: any, b: any) => a._d.getTime() - b._d.getTime());

        const firstExam = upcoming[0];
        if (firstExam) {
          const d = firstExam._d;
          dashboardData.upcoming_exam = {
            subject: firstExam.subject_name?.replace(' học', '') || 'Môn học',
            // Định dạng DD/MM (trước đây substring(5) ra MM/DD bị ngược)
            exam_date: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`,
          };
        }
      }

      return dashboardData;
    } catch (e) {
      console.warn('Backend student portal error:', e);
      return null;
    }
  },

  async previewClassByInvite(code: string): Promise<PreviewClassData> {
    const cleanCode = String(code || '').trim().toUpperCase();
    if (!cleanCode) {
      throw new Error('Vui lòng nhập mã mời');
    }
    return api<PreviewClassData>(`/classes/preview-invite/${encodeURIComponent(cleanCode)}`, {
      errorMessage: 'Mã mời lớp học không hợp lệ hoặc đã hết hạn',
    });
  },

  async linkNewChild(input: string | JoinClassChildPayload): Promise<ChildItem> {
    const isPayload = typeof input === 'object' && input !== null;
    const code = String(isPayload ? input.invite_code : input || '').trim().toUpperCase();
    if (!code) {
      throw new Error('Vui lòng nhập mã học sinh hoặc mã mời do giáo viên cung cấp');
    }

    const initialPayload: Record<string, any> = isPayload
      ? {
          invite_code: code,
          child_name: input.child_name?.trim() || undefined,
          dob: input.dob?.trim() || undefined,
          gender: input.gender,
          relationship: input.relationship,
        }
      : { invite_code: code };

    const tryJoin = async (payload: Record<string, any>) => {
      const res = await apiFetch('/classes/join', {
        method: 'POST',
        body: payload,
        auth: true,
      }).catch(() => null);
      const json = res ? await res.json().catch(() => ({})) : {};
      return { res, json };
    };

    let attempt = await tryJoin(initialPayload);
    if (!isPayload && attempt.res && !attempt.res.ok && [400, 404].includes(attempt.res.status)) {
      const retry = await tryJoin({ student_code: code });
      if (retry.res && retry.res.ok) {
        attempt = retry;
      }
    }

    if (!attempt.res) {
      throw new Error('Không thể kết nối máy chủ. Vui lòng thử lại.');
    }

    if (!attempt.res.ok) {
      const message =
        attempt.json?.message ||
        'Không thể liên kết học sinh. Vui lòng kiểm tra lại thông tin đã nhập.';
      throw new Error(message);
    }

    const data = attempt.json.data || attempt.json;
    const firstStudent =
      (Array.isArray(data.students) && data.students.length > 0 ? data.students[0] : null) ||
      data.child;

    if (!firstStudent) {
      throw new Error('Không tìm thấy học sinh phù hợp với mã đã nhập.');
    }

    return toChildItem({
      ...firstStudent,
      class_name: firstStudent.class_name || data.class_name,
    });
  },

  async getFullAcademicRecord(studentId: string, semester?: number) {
    if (!studentId) return [];

    try {
      const semesterQuery = semester ? `?semester=${semester}` : '';
      const data = await api<any>(`/students/${studentId}/academic${semesterQuery}`);

      if (data?.subjects && Array.isArray(data.subjects) && data.subjects.length > 0) {
        const colors = ['#F58F4C', '#4A47D2', '#00875A', '#FF5630', '#7E57C2'];

        const mergedSubjects = new Map<string, { subject_name: string; scores: any[] }>();
        for (const sub of data.subjects) {
          const subjectName = sub.subject_name || 'Môn học';
          const key = canonicalSubjectKey(subjectName);
          if (!mergedSubjects.has(key)) {
            mergedSubjects.set(key, { subject_name: subjectName, scores: [] });
          }
          mergedSubjects.get(key)!.scores.push(...(Array.isArray(sub.scores) ? sub.scores : []));
        }

        return Array.from(mergedSubjects.values()).map((sub, idx: number) => {
          const scores = sub.scores.map((s: any) => ({
            type: normalizeScoreType(s.type ?? s.score_type),
            label: s.label?.replace('Kiểm tra ', '') || 'Điểm',
            value: s.value !== undefined && s.value !== null ? String(s.value) : '--',
            created_at: s.created_at ?? s.createdAt ?? '',
          }));

          let weightedSum = 0;
          let weightSum = 0;
          for (const col of PARENT_SCORE_COLUMNS) {
            const value = pickLatestScoreValue(scores, col.aliases);
            if (value !== null) {
              weightedSum += value * col.weight;
              weightSum += col.weight;
            }
          }

          let avg: string | null = null;
          if (weightSum > 0) {
            avg = (weightedSum / weightSum).toFixed(1);
          } else {
            const validScores = scores.filter(
              (s: any) => s.value !== '--' && !isNaN(Number(s.value)),
            );
            if (validScores.length > 0) {
              avg = (
                validScores.reduce((acc: number, curr: any) => acc + Number(curr.value), 0) /
                validScores.length
              ).toFixed(1);
            }
          }

          return {
            subject_name: sub.subject_name,
            dot_color: colors[idx % colors.length],
            average_score: avg !== null ? `TB ${avg}` : '--',
            scores,
          };
        });
      }
    } catch (e) {}

    return [];
  },

  async getRemarksAndExams(studentId: string) {
    if (!studentId) return { exams: [], remarks: [] };

    try {
      const [remarks, exams] = await Promise.all([
        api<any>(`/students/${studentId}/remarks`).catch(() => null),
        api<any>(`/students/${studentId}/exam-reminders`).catch(() => null),
      ]);

      let remarksList: any[] = [];
      let examsList: any[] = [];

      if (Array.isArray(remarks)) {
        remarksList = remarks.map((r: any) => ({
          id: r.remark_id || r.id,
          teacher_title: `${r.teacher_name || 'Giáo viên'} • ${r.subject || 'Rèn luyện'}`,
          date_str: r.created_at ? r.created_at.substring(5, 10).replace('-', '/') : 'Gần đây',
          content: r.content,
          is_read: r.parent_acknowledged === true,
        }));
      }

      if (Array.isArray(exams)) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const seen = new Set<string>();

        examsList = exams
          .map((e: any) => {
            const title = String(e.title || '').trim();
            const date = parseExamDate(e.exam_date ?? e.examDate ?? e.date);
            const subject = getSubjectDisplay(
              subjectFromTitle(title) || e.subject_name || e.subject_code || e.subject,
            );
            const rawNote = String(
              e.content_scope ?? e.note ?? e.message ?? e.instructions ?? '',
            ).trim();
            const diffDays = date
              ? Math.round((date.getTime() - today.getTime()) / 86400000)
              : null;

            return {
              id: e.reminder_id || e.id,
              title,
              exam_type_label: deriveExamTypeLabel(e.exam_type ?? e.examType, title),
              subject_name: subject.name,
              subject_color: subject.color,
              date_iso: date
                ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
                : '',
              date_label: date
                ? `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`
                : 'Sắp tới',
              weekday_label: date ? WEEKDAY_FULL_LABELS[date.getDay()] : '',
              weekday_short: date ? WEEKDAY_SHORT_LABELS[date.getDay()] : '',
              day_number: date ? String(date.getDate()).padStart(2, '0') : '',
              month_label: date ? `Th${date.getMonth() + 1}` : '',
              countdown_label:
                diffDays === null
                  ? 'Sắp tới'
                  : diffDays < 0
                  ? 'Đã qua'
                  : diffDays === 0
                  ? 'Hôm nay'
                  : diffDays === 1
                  ? 'Ngày mai'
                  : `Còn ${diffDays} ngày`,
              is_today: diffDays === 0,
              is_past: diffDays !== null && diffDays < 0,
              note: rawNote && rawNote !== title ? rawNote : '',
            };
          })
          .filter((e: any) => {
            if (e.is_past) return false;
            const key = `${e.date_iso}|${e.subject_name}|${e.exam_type_label}|${e.note}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          })
          .sort((a: any, b: any) => (a.date_iso || '9999').localeCompare(b.date_iso || '9999'));
      }

      return { exams: examsList, remarks: remarksList };
    } catch (e) {}

    return { exams: [], remarks: [] };
  },

  async getAttendanceDetails(studentId: string, month?: string) {
    if (!studentId) {
      return {
        summary: null,
        logs: [],
      };
    }

    const monthParam = month || (() => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    })();

    try {
      const data = await api<any>(`/students/${studentId}/attendance?month=${monthParam}`);
      const records = Array.isArray(data?.records) ? data.records : [];
      const presentCount = data?.total_present || records.filter((r: any) => r.status === 'PRESENT').length || 0;
      const absentCount = data?.total_absent_excused || records.filter((r: any) => r.status?.includes('ABSENT')).length || 0;
      const total = presentCount + absentCount;
      const rate = total > 0 ? Math.round((presentCount / total) * 100) : 100;

      const logs = records.map((r: any, idx: number) => ({
        id: `log_0${idx + 1}`,
        date_title: r.date || 'Hôm nay',
        status: r.status === 'PRESENT' ? 'PRESENT' : 'ABSENT',
        status_label: r.status === 'PRESENT' ? 'Có mặt' : 'Vắng',
        permit_status: r.status === 'ABSENT_EXCUSED' ? 'EXCUSED' : 'UNEXCUSED',
        permit_label: r.status === 'ABSENT_EXCUSED' ? 'Có phép' : undefined,
        reason: r.note || undefined,
      }));

      return {
        summary: {
          present_count: presentCount,
          absent_count: absentCount,
          rate_week: `${rate}%`,
          note: absentCount === 0 ? 'Chuyên cần đầy đủ' : 'Có phép nghỉ học',
        },
        logs,
      };
    } catch (e) {}

    return {
      summary: null,
      logs: [],
    };
  },

  async getChildFeesInsurance(studentId: string) {
    if (!studentId) return null;

    try {
      const data = await api<any>(`/students/${studentId}/fees-insurance`);
      if (!data || (!data.insurance && !data.tuition)) {
        return null;
      }

      const ins = data.insurance || {};
      const tui = data.tuition || {};
      const insPaid = !!ins.is_paid;
      const tuiPaid = !!tui.is_paid;
      const paidCount = (insPaid ? 1 : 0) + (tuiPaid ? 1 : 0);
      const remCount = 2 - paidCount;

      return {
        student_id: studentId,
        completed_ratio: `${paidCount}/2`,
        remaining_count: remCount === 0 ? 'Đã hoàn tất' : `Còn ${remCount} khoản`,
        term_label: data.term_name || 'Học kỳ 1',
        insurance: {
          type: 'BHYT',
          status: insPaid ? 'PAID' : 'UNPAID',
          status_label: insPaid ? 'Đã nộp' : 'Chưa nộp',
          deadline: ins.deadline ? `Hạn ${ins.deadline}` : 'Hạn nộp đợt 1',
          paid_date: ins.paid_date || undefined,
          payment_method: ins.payment_method || 'Chuyển khoản / Tiền mặt',
        },
        tuition: {
          type: 'Học phí',
          status: tuiPaid ? 'PAID' : 'UNPAID',
          status_label: tuiPaid ? 'Đã nộp' : 'Chưa nộp',
          paid_date: tui.paid_date || undefined,
          payment_method: tui.payment_method || 'Đã đóng online',
        },
      };
    } catch (e) {
      console.warn('getChildFeesInsurance error:', e);
    }

    return null;
  },
};
