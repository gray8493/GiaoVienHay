import { API_BASE_URL } from '../config/api';
import { authService } from './auth.service';

export interface ChildItem {
  id: string;
  student_code: string;
  full_name: string;
  avatar_letters: string;
  class_name: string;
  school_name?: string;
  attendance_status?: string; // 'Vắng Có Phép' | 'Có mặt'
  attendance_note?: string; // 'Bị sốt, mẹ xin phép'
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
  today_schedule: Array<{
    period_title: string;
    time_room: string;
  }>;
}

export const parentService = {
  async getLinkedChildren(): Promise<ChildItem[]> {
    const user = authService.getUser();
    const userId = user?.id || user?.phone || 'guest';

    // 1. Đọc danh sách con đã liên kết từ Storage
    let savedChildren: ChildItem[] = [];
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = window.localStorage.getItem(`gvh_linked_children_${userId}`);
        if (stored) savedChildren = JSON.parse(stored);
      } catch (e) {}
    }

    if (savedChildren.length > 0) {
      return savedChildren;
    }

    // Với tài khoản phụ huynh chưa liên kết con: hiển thị PAR-01.empty
    return [];
  },

  async getChildDashboard(studentId: string): Promise<ParentDashboardData | null> {
    if (!studentId) {
      return null;
    }

    try {
      const authHeader = await authService.getAuthHeaderAsync();

      // 1. Fetch Student Profile
      const profileRes = await fetch(`${API_BASE_URL}/students/${studentId}`, {
        headers: { 'Content-Type': 'application/json', ...authHeader },
      }).catch(() => null);

      if (!profileRes || !profileRes.ok) {
        return null;
      }

      const pJson = await profileRes.json();
      const profile = pJson.data || pJson;

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
          attendance_status: 'Có mặt',
          attendance_note: 'Đúng giờ',
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
        today_schedule: [],
      };

      // 2. Fetch Academic Record
      const academicRes = await fetch(`${API_BASE_URL}/students/${studentId}/academic`, {
        headers: { 'Content-Type': 'application/json', ...authHeader },
      }).catch(() => null);

      if (academicRes && academicRes.ok) {
        const resJson = await academicRes.json();
        const academic = resJson.data || resJson;
        if (academic.subjects && academic.subjects.length > 0) {
          const firstSubj = academic.subjects[0];
          if (firstSubj.scores && firstSubj.scores.length > 0) {
            const lastScore = firstSubj.scores[firstSubj.scores.length - 1];
            dashboardData.latest_grade = {
              subject: firstSubj.subject_name?.replace(' học', '') || 'Môn học',
              score: lastScore.value !== undefined ? Number(lastScore.value) : 0,
              test_type: lastScore.label?.replace('Kiểm tra ', '') || '15 phút',
            };
          }
          dashboardData.today_schedule = academic.subjects.slice(0, 3).map((sub: any, i: number) => ({
            period_title: `Tiết ${i + 1}: ${sub.subject_name}`,
            time_room: `${(7 + i).toString().padStart(2, '0')}:15 – ${(8 + i).toString().padStart(2, '0')}:00 • ${dashboardData.child.class_name}`,
          }));
        }
      }

      // 3. Fetch Real Attendance Status
      const attendanceRes = await fetch(`${API_BASE_URL}/students/${studentId}/attendance`, {
        headers: { 'Content-Type': 'application/json', ...authHeader },
      }).catch(() => null);

      if (attendanceRes && attendanceRes.ok) {
        const resJson = await attendanceRes.json();
        const attData = resJson.data || resJson;
        const latestRec = attData.records && attData.records.length > 0 ? attData.records[0] : null;
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
      }

      // 4. Fetch Real Remarks
      const remarksRes = await fetch(`${API_BASE_URL}/students/${studentId}/remarks`, {
        headers: { 'Content-Type': 'application/json', ...authHeader },
      }).catch(() => null);

      if (remarksRes && remarksRes.ok) {
        const resJson = await remarksRes.json();
        const remarks = resJson.data || resJson;
        if (Array.isArray(remarks) && remarks.length > 0) {
          const latestRmk = remarks[remarks.length - 1];
          dashboardData.latest_remark = {
            count_label: `${remarks.length} lời mới`,
            status_label: 'Đã nhận',
            teacher_name: latestRmk.teacher_name || 'Giáo viên bộ môn',
            content: latestRmk.content || 'Đã gửi nhận xét rèn luyện',
          };
        }
      }

      // 5. Fetch Fees Insurance status
      const feesRes = await fetch(`${API_BASE_URL}/students/${studentId}/fees-insurance`, {
        headers: { 'Content-Type': 'application/json', ...authHeader },
      }).catch(() => null);

      if (feesRes && feesRes.ok) {
        const resJson = await feesRes.json();
        const feesData = resJson.data || resJson;
        if (feesData && feesData.insurance) {
          dashboardData.fees_insurance = {
            type: 'BHYT',
            status_label: feesData.insurance.is_paid ? 'Đã nộp' : 'Chưa nộp',
          };
        }
      }

      // 6. Fetch Exam Reminders
      const examRes = await fetch(`${API_BASE_URL}/students/${studentId}/exam-reminders`, {
        headers: { 'Content-Type': 'application/json', ...authHeader },
      }).catch(() => null);

      if (examRes && examRes.ok) {
        const resJson = await examRes.json();
        const exams = resJson.data || resJson;
        if (Array.isArray(exams) && exams.length > 0) {
          const firstExam = exams[0];
          dashboardData.upcoming_exam = {
            subject: firstExam.subject_name?.replace(' học', '') || 'Môn học',
            exam_date: firstExam.exam_date ? firstExam.exam_date.substring(5).replace('-', '/') : '--/--',
          };
        }
      }

      return dashboardData;
    } catch (e) {
      console.warn('Backend student portal error:', e);
      return null;
    }
  },

  async linkNewChild(studentCode: string): Promise<ChildItem> {
    const user = authService.getUser();
    const userId = user?.id || user?.phone || 'guest';
    const authHeader = await authService.getAuthHeaderAsync();

    // 1. Thử tra cứu hồ sơ học sinh trực tiếp qua ID hoặc mã học sinh
    let foundStudent: any = null;
    try {
      const res = await fetch(`${API_BASE_URL}/students/${studentCode}`, {
        headers: { 'Content-Type': 'application/json', ...authHeader },
      }).catch(() => null);

      if (res && res.ok) {
        const resJson = await res.json();
        foundStudent = resJson.data || resJson;
      }
    } catch (e) {}

    // 2. Nếu không tìm thấy, thử qua mã mời lớp học
    if (!foundStudent) {
      try {
        const joinRes = await fetch(`${API_BASE_URL}/classes/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeader },
          body: JSON.stringify({ invite_code: studentCode }),
        }).catch(() => null);

        if (joinRes && joinRes.ok) {
          const joinJson = await joinRes.json();
          const joinData = joinJson.data || joinJson;
          foundStudent = {
            id: joinData.student_id || `stu_${Date.now()}`,
            student_code: studentCode,
            full_name: joinData.full_name || 'Học sinh',
            class_name: joinData.class_name || 'Lớp học',
          };
        }
      } catch (e) {}
    }

    if (!foundStudent || !foundStudent.id) {
      throw new Error(`Không tìm thấy học sinh với mã "${studentCode}". Vui lòng kiểm tra lại mã học sinh hoặc mã mời lớp học do giáo viên cung cấp.`);
    }

    const initials = (foundStudent.full_name || 'HS')
      .split(' ')
      .filter(Boolean)
      .map((w: string) => w[0])
      .slice(-2)
      .join('')
      .toUpperCase();

    const classNameFormatted = foundStudent.class_name
      ? (foundStudent.class_name.startsWith('Lớp') ? foundStudent.class_name : `Lớp ${foundStudent.class_name}`)
      : 'Lớp học';

    const childToReturn: ChildItem = {
      id: foundStudent.id,
      student_code: foundStudent.student_code || studentCode,
      full_name: foundStudent.full_name,
      avatar_letters: initials || 'HS',
      class_name: classNameFormatted,
      school_name: foundStudent.school_name || 'Trường học',
      attendance_status: 'Có mặt',
      attendance_note: 'Đúng giờ',
    };

    // Lưu vào LocalStorage của tài khoản phụ huynh hiện tại
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const key = `gvh_linked_children_${userId}`;
        const existingStr = window.localStorage.getItem(key);
        const existingList: ChildItem[] = existingStr ? JSON.parse(existingStr) : [];
        const updatedList = [...existingList.filter(c => c.student_code !== childToReturn.student_code), childToReturn];
        window.localStorage.setItem(key, JSON.stringify(updatedList));
      } catch (e) {}
    }

    return childToReturn;
  },

  async getFullAcademicRecord(studentId: string) {
    if (!studentId) return [];

    try {
      const authHeader = await authService.getAuthHeaderAsync();
      const res = await fetch(`${API_BASE_URL}/students/${studentId}/academic`, {
        headers: { 'Content-Type': 'application/json', ...authHeader },
      }).catch(() => null);

      if (res && res.ok) {
        const resJson = await res.json();
        const data = resJson.data || resJson;
        if (data.subjects && Array.isArray(data.subjects) && data.subjects.length > 0) {
          const colors = ['#F58F4C', '#4A47D2', '#00875A', '#FF5630', '#7E57C2'];
          return data.subjects.map((sub: any, idx: number) => {
            const scores = (sub.scores || []).map((s: any) => ({
              label: s.label?.replace('Kiểm tra ', '') || 'Điểm',
              value: s.value !== undefined ? String(s.value) : '--',
            }));
            const validScores = scores.filter((s: any) => s.value !== '--' && !isNaN(Number(s.value)));
            const avg = validScores.length > 0
              ? (validScores.reduce((acc: number, curr: any) => acc + Number(curr.value), 0) / validScores.length).toFixed(1)
              : '--';
            return {
              subject_name: sub.subject_name || 'Môn học',
              dot_color: colors[idx % colors.length],
              average_score: avg !== '--' ? `TB ${avg}` : '--',
              scores: scores.length > 0 ? scores : [
                { label: 'Miệng', value: '--' },
                { label: '15 phút', value: '--' },
                { label: '1 Tiết', value: '--' },
                { label: 'Thi GK', value: '--' },
              ],
            };
          });
        }
      }
    } catch (e) {}

    return [];
  },

  async getRemarksAndExams(studentId: string) {
    if (!studentId) return { exams: [], remarks: [] };

    try {
      const authHeader = await authService.getAuthHeaderAsync();
      const [remRes, examRes] = await Promise.all([
        fetch(`${API_BASE_URL}/students/${studentId}/remarks`, {
          headers: { 'Content-Type': 'application/json', ...authHeader },
        }).catch(() => null),
        fetch(`${API_BASE_URL}/students/${studentId}/exam-reminders`, {
          headers: { 'Content-Type': 'application/json', ...authHeader },
        }).catch(() => null),
      ]);

      let remarksList: any[] = [];
      let examsList: any[] = [];

      if (remRes && remRes.ok) {
        const rJson = await remRes.json();
        const list = rJson.data || rJson;
        if (Array.isArray(list)) {
          remarksList = list.map((r: any) => ({
            id: r.remark_id || r.id,
            teacher_title: `${r.teacher_name || 'Giáo viên'} • ${r.subject || 'Rèn luyện'}`,
            date_str: r.created_at ? r.created_at.substring(5, 10).replace('-', '/') : 'Gần đây',
            content: r.content,
            is_read: true,
          }));
        }
      }

      if (examRes && examRes.ok) {
        const eJson = await examRes.json();
        const list = eJson.data || eJson;
        if (Array.isArray(list)) {
          examsList = list.map((e: any) => ({
            id: e.reminder_id || e.id,
            title: `Kiểm tra ${e.subject_name || 'Môn học'}`,
            date_label: e.exam_date || 'Sắp tới',
            icon: 'calendar_month',
          }));
        }
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
      const authHeader = await authService.getAuthHeaderAsync();
      const res = await fetch(`${API_BASE_URL}/students/${studentId}/attendance?month=${monthParam}`, {
        headers: { 'Content-Type': 'application/json', ...authHeader },
      }).catch(() => null);

      if (res && res.ok) {
        const resJson = await res.json();
        const data = resJson.data || resJson;
        const records = Array.isArray(data.records) ? data.records : [];
        const presentCount = data.total_present || records.filter((r: any) => r.status === 'PRESENT').length || 0;
        const absentCount = data.total_absent_excused || records.filter((r: any) => r.status?.includes('ABSENT')).length || 0;
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
      }
    } catch (e) {}

    return {
      summary: null,
      logs: [],
    };
  },

  async getChildFeesInsurance(studentId: string) {
    if (!studentId) return null;

    try {
      const authHeader = await authService.getAuthHeaderAsync();
      const res = await fetch(`${API_BASE_URL}/students/${studentId}/fees-insurance`, {
        headers: { 'Content-Type': 'application/json', ...authHeader },
      }).catch(() => null);

      if (res && res.ok) {
        const resJson = await res.json();
        const data = resJson.data || resJson;
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
      }
    } catch (e) {
      console.warn('Backend not reachable, getChildFeesInsurance error:', e);
    }

    return null;
  },
};
