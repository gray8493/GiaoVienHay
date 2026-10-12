import { Platform } from 'react-native';
import { authService } from './auth.service';

const API_BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:3000/api/v1'
    : 'http://localhost:3000/api/v1';

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

const DEFAULT_CHILDREN: ChildItem[] = [
  {
    id: 'stu_02',
    student_code: 'HS240102',
    full_name: 'Trần Bảo Nam',
    avatar_letters: 'BN',
    class_name: 'Lớp 1A',
    school_name: 'Trường Tiểu Học Chu Văn An',
    attendance_status: 'Có mặt',
    attendance_note: 'Đúng giờ',
  },
];

export const parentService = {
  async getLinkedChildren(): Promise<ChildItem[]> {
    const user = authService.getUser();
    const userId = user?.id || user?.phone || 'guest';

    // Đọc danh sách con đã liên kết từ Storage
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

    // Nếu là tài khoản phụ huynh demo seed trong DB (0912345678)
    if (user?.phone === '0912345678') {
      try {
        const authHeader = await authService.getAuthHeaderAsync();
        const res = await fetch(`${API_BASE_URL}/students/stu_02`, {
          headers: { 'Content-Type': 'application/json', ...authHeader },
        }).catch(() => null);

        if (res && res.ok) {
          const resJson = await res.json();
          const student = resJson.data || resJson;
          if (student && student.id) {
            const initials = (student.full_name || 'BN')
              .split(' ')
              .filter(Boolean)
              .map((w: string) => w[0])
              .slice(-2)
              .join('')
              .toUpperCase();

            return [
              {
                id: student.id,
                student_code: student.student_code || student.code || 'HS240102',
                full_name: student.full_name,
                avatar_letters: initials || 'BN',
                class_name: student.class_name ? `Lớp ${student.class_name}` : 'Lớp 1A',
                school_name: student.school_name || 'Trường Tiểu Học Chu Văn An',
                attendance_status: 'Có mặt',
                attendance_note: 'Đúng giờ',
              },
            ];
          }
        }
      } catch (e) {}
      return DEFAULT_CHILDREN;
    }

    // Với tài khoản phụ huynh mới đăng ký: ban đầu chưa có con liên kết
    return [];
  },

  async getChildDashboard(studentId: string = 'stu_02'): Promise<ParentDashboardData> {
    const defaultData: ParentDashboardData = {
      child:
        studentId === 'stu_08'
          ? DEFAULT_CHILDREN[1]
          : DEFAULT_CHILDREN[0],
      attendance: {
        status_title: 'Đã Có Mặt',
        note: 'Đi học đúng giờ',
        date_str: 'HÔM NAY • 23/09/2026',
      },
      latest_grade: {
        subject: 'Toán học',
        score: 9.0,
        test_type: '15 phút',
      },
      latest_remark: {
        count_label: '1 lời mới',
        status_label: 'Chưa đọc',
        teacher_name: 'Cô Nguyễn Thị Lan',
        content: 'Hôm nay Nam làm bài tập rất nhanh và hăng hái phát biểu xây dựng bài.',
      },
      fees_insurance: {
        type: 'BHYT',
        status_label: 'Chưa nộp',
      },
      upcoming_exam: {
        subject: 'Toán học',
        exam_date: '02/10',
      },
      today_schedule: [
        {
          period_title: 'Tiết 1: Toán học',
          time_room: '07:15 – 08:00 • Lớp 1A',
        },
        {
          period_title: 'Tiết 2: Tiếng Việt',
          time_room: '08:15 – 09:00 • Lớp 1A',
        },
      ],
    };

    try {
      const authHeader = await authService.getAuthHeaderAsync();

      // 1. Fetch Student Profile
      const profileRes = await fetch(`${API_BASE_URL}/students/${studentId}`, {
        headers: { 'Content-Type': 'application/json', ...authHeader },
      }).catch(() => null);

      if (profileRes && profileRes.ok) {
        const resJson = await profileRes.json();
        const profile = resJson.data || resJson;
        if (profile.full_name) {
          defaultData.child.full_name = profile.full_name;
        }
        if (profile.class_name) {
          defaultData.child.class_name = `Lớp ${profile.class_name}`;
        }
      }

      // 2. Fetch Academic Record (latest grade & schedule)
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
            defaultData.latest_grade = {
              subject: firstSubj.subject_name?.replace(' học', '') || 'Toán',
              score: lastScore.value || 9.0,
              test_type: lastScore.label?.replace('Kiểm tra ', '') || '15 phút',
            };
          }
          // Dynamically populate schedule from enrolled subjects
          defaultData.today_schedule = academic.subjects.slice(0, 3).map((sub: any, i: number) => ({
            period_title: `Tiết ${i + 1}: ${sub.subject_name}`,
            time_room: `${(7 + i).toString().padStart(2, '0')}:15 – ${(8 + i).toString().padStart(2, '0')}:00 • Lớp ${defaultData.child.class_name}`,
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

          defaultData.attendance = {
            status_title: statusTitle,
            note: latestRec.note || (latestRec.status === 'PRESENT' ? 'Đi học đúng giờ' : 'Nghỉ học'),
            date_str: latestRec.date ? `HÔM NAY • ${latestRec.date}` : defaultData.attendance.date_str,
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
          defaultData.latest_remark = {
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
        if (feesData.insurance) {
          defaultData.fees_insurance = {
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
          defaultData.upcoming_exam = {
            subject: firstExam.subject_name?.replace(' học', '') || 'Toán',
            exam_date: firstExam.exam_date ? firstExam.exam_date.substring(5).replace('-', '/') : '16/10',
          };
        }
      }
    } catch (e) {
      console.warn('Backend students parent portal offline, using mockup data:', e);
    }

    return defaultData;
  },

  async linkNewChild(studentCode: string): Promise<ChildItem> {
    const user = authService.getUser();
    const userId = user?.id || user?.phone || 'guest';
    let childToReturn: ChildItem;

    try {
      const authHeader = await authService.getAuthHeaderAsync();
      const res = await fetch(`${API_BASE_URL}/classes/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({ invite_code: studentCode }),
      }).catch(() => null);

      if (res && res.ok) {
        const resJson = await res.json();
        const data = resJson.data || resJson;
        childToReturn = {
          id: data.student_id || `stu_${Date.now()}`,
          student_code: studentCode,
          full_name: data.full_name || 'Học sinh mới',
          avatar_letters: 'HS',
          class_name: data.class_name ? `Lớp ${data.class_name}` : 'Lớp 1A',
          attendance_status: 'Có mặt',
          attendance_note: 'Đúng giờ',
        };
      } else {
        childToReturn = {
          id: `stu_${Date.now()}`,
          student_code: studentCode.toUpperCase(),
          full_name: 'Nguyễn Minh Quân',
          avatar_letters: 'MQ',
          class_name: 'Lớp 1A',
          attendance_status: 'Có mặt',
          attendance_note: 'Đúng giờ',
        };
      }
    } catch (e) {
      childToReturn = {
        id: `stu_${Date.now()}`,
        student_code: studentCode.toUpperCase(),
        full_name: 'Nguyễn Minh Quân',
        avatar_letters: 'MQ',
        class_name: 'Lớp 1A',
        attendance_status: 'Có mặt',
        attendance_note: 'Đúng giờ',
      };
    }

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

  async getFullAcademicRecord(studentId: string = 'stu_02') {
    try {
      const authHeader = await authService.getAuthHeaderAsync();
      const res = await fetch(`${API_BASE_URL}/students/${studentId}/academic`, {
        headers: { 'Content-Type': 'application/json', ...authHeader },
      }).catch(() => null);

      if (res && res.ok) {
        const resJson = await res.json();
        const data = resJson.data || resJson;
        if (data.subjects && data.subjects.length > 0) {
          const colors = ['#F58F4C', '#4A47D2', '#00875A', '#FF5630'];
          return data.subjects.map((sub: any, idx: number) => {
            const scores = (sub.scores || []).map((s: any) => ({
              label: s.label?.replace('Kiểm tra ', '') || '15 phút',
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

    return [
      {
        subject_name: 'Toán',
        dot_color: '#F58F4C',
        average_score: 'TB 9.2',
        scores: [
          { label: 'Miệng', value: '9.0' },
          { label: '15 phút', value: '9.5' },
          { label: '1 Tiết', value: '--' },
          { label: 'Thi GK', value: '--' },
        ],
      },
      {
        subject_name: 'Ngữ Văn',
        dot_color: '#4A47D2',
        average_score: 'TB 8.5',
        scores: [
          { label: 'Miệng', value: '8.0' },
          { label: '15 phút', value: '8.5' },
          { label: '1 Tiết', value: '9.0' },
          { label: 'Thi GK', value: '--' },
        ],
      },
    ];
  },

  async getRemarksAndExams(studentId: string = 'stu_02') {
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
            date_str: r.created_at ? r.created_at.substring(5, 10).replace('-', '/') : 'Hôm nay',
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
            title: `Kiểm tra ${e.subject_name || 'Toán'}`,
            date_label: e.exam_date || 'Sắp tới',
            icon: 'calendar_month',
          }));
        }
      }

      if (remarksList.length > 0 || examsList.length > 0) {
        return { exams: examsList, remarks: remarksList };
      }
    } catch (e) {}

    return {
      exams: [
        {
          id: 'exm_01',
          title: 'Kiểm tra 15 phút Toán',
          date_label: '02/10/2026',
          icon: 'calendar_month',
        },
      ],
      remarks: [
        {
          id: 'rmk_01',
          teacher_title: 'Cô Nguyễn Thị Lan • Toán',
          date_str: 'Hôm nay',
          content: 'Hôm nay Nam làm bài tập rất nhanh và hăng hái phát biểu.',
          is_read: true,
        },
      ],
    };
  },

  async getAttendanceDetails(studentId: string = 'stu_02', month: string = '2026-10') {
    try {
      const authHeader = await authService.getAuthHeaderAsync();
      const res = await fetch(`${API_BASE_URL}/students/${studentId}/attendance?month=${month}`, {
        headers: { 'Content-Type': 'application/json', ...authHeader },
      }).catch(() => null);

      if (res && res.ok) {
        const resJson = await res.json();
        const data = resJson.data || resJson;
        const records = Array.isArray(data.records) ? data.records : [];
        const presentCount = data.total_present || records.filter((r: any) => r.status === 'PRESENT').length || 20;
        const absentCount = data.total_absent_excused || 0;
        const total = presentCount + absentCount || 22;
        const rate = Math.round((presentCount / total) * 100);

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
            note: absentCount === 0 ? 'Chuyên cần xuất sắc' : 'Có phép nghỉ ốm',
          },
          logs: logs.length > 0 ? logs : [
            {
              id: 'log_01',
              date_title: 'Hôm nay',
              status: 'PRESENT',
              status_label: 'Có mặt',
            },
          ],
        };
      }
    } catch (e) {}

    return {
      summary: {
        present_count: 20,
        absent_count: 1,
        rate_week: '95%',
        note: 'Chuyên cần tốt',
      },
      logs: [
        {
          id: 'log_01',
          date_title: 'Hôm nay',
          status: 'PRESENT',
          status_label: 'Có mặt',
        },
      ],
    };
  },

  async getChildFeesInsurance(studentId: string = 'stu_02') {
    try {
      const authHeader = await authService.getAuthHeaderAsync();
      const res = await fetch(`${API_BASE_URL}/students/${studentId}/fees-insurance`, {
        headers: { 'Content-Type': 'application/json', ...authHeader },
      }).catch(() => null);

      if (res && res.ok) {
        const resJson = await res.json();
        const data = resJson.data || resJson;
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
          term_label: data.term_name || 'Học kỳ 1 • 2026–2027',
          insurance: {
            type: 'BHYT',
            status: insPaid ? 'PAID' : 'UNPAID',
            status_label: insPaid ? 'Đã nộp' : 'Chưa nộp',
            deadline: ins.deadline ? `Hạn ${ins.deadline}` : 'Hạn 15/10/2026',
            paid_date: ins.paid_date || undefined,
            payment_method: ins.payment_method || 'Chuyển khoản / Tiền mặt',
          },
          tuition: {
            type: 'Học phí',
            status: tuiPaid ? 'PAID' : 'UNPAID',
            status_label: tuiPaid ? 'Đã nộp' : 'Chưa nộp',
            paid_date: tui.paid_date || '15/09',
            payment_method: tui.payment_method || 'Đã đóng online',
          },
        };
      }
    } catch (e) {
      console.warn('Backend not reachable, fallback fees data:', e);
    }

    return {
      student_id: studentId,
      completed_ratio: '1/2',
      remaining_count: 'Còn 1 khoản',
      term_label: 'Học kỳ 1 • 2026–2027',
      insurance: {
        type: 'BHYT',
        status: 'UNPAID',
        status_label: 'Chưa nộp',
        deadline: 'Hạn 15/10/2026',
      },
      tuition: {
        type: 'Học phí',
        status: 'PAID',
        status_label: 'Đã nộp',
        paid_date: '22/09',
        payment_method: 'Nộp tiền mặt tại lớp',
      },
    };
  },
};
