import { Platform } from 'react-native';

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
    full_name: 'Trần Gia Bảo',
    avatar_letters: 'GB',
    class_name: 'Lớp 6A1',
    school_name: 'THCS Lê Quý Đôn',
    attendance_status: 'Vắng Có Phép',
    attendance_note: 'Bị sốt, mẹ xin phép',
  },
  {
    id: 'stu_08',
    student_code: 'HS240108',
    full_name: 'Trần Gia Hân',
    avatar_letters: 'GH',
    class_name: 'Lớp 8A2',
    school_name: 'THCS Lê Quý Đôn',
    attendance_status: 'Có mặt',
    attendance_note: 'Đúng giờ',
  },
];

export const parentService = {
  async getLinkedChildren(): Promise<ChildItem[]> {
    return DEFAULT_CHILDREN;
  },

  async getChildDashboard(studentId: string = 'stu_02'): Promise<ParentDashboardData> {
    const defaultData: ParentDashboardData = {
      child:
        studentId === 'stu_08'
          ? DEFAULT_CHILDREN[1]
          : DEFAULT_CHILDREN[0],
      attendance: {
        status_title: studentId === 'stu_08' ? 'Đã Có Mặt' : 'Vắng Có Phép',
        note: studentId === 'stu_08' ? 'Đi học đúng giờ' : 'Bị sốt, mẹ xin phép',
        date_str: 'HÔM NAY • THỨ NĂM, 08/10',
      },
      latest_grade: {
        subject: 'Toán',
        score: studentId === 'stu_08' ? 8.5 : 9.0,
        test_type: '15 phút',
      },
      latest_remark: {
        count_label: '1 lời mới',
        status_label: 'Chưa đọc',
        teacher_name: 'Cô Nguyễn Thu Hà',
        content: 'Hôm nay con chăm chỉ làm bài tập và phát biểu tốt.',
      },
      fees_insurance: {
        type: 'BHYT',
        status_label: 'Chưa nộp',
      },
      upcoming_exam: {
        subject: 'Toán',
        exam_date: '16/10',
      },
      today_schedule: [
        {
          period_title: 'Tiết 2: Toán Hình',
          time_room: '08:15 – 09:00 • Phòng 204',
        },
        {
          period_title: 'Tiết 4: Sinh hoạt lớp',
          time_room: '10:15 – 11:00 • Phòng 204',
        },
      ],
    };

    try {
      // 1. Fetch Student Profile
      const profileRes = await fetch(`${API_BASE_URL}/students/${studentId}`, {
        headers: { 'Content-Type': 'application/json' },
      }).catch(() => null);

      if (profileRes && profileRes.ok) {
        const profile = await profileRes.json();
        if (profile.full_name) {
          defaultData.child.full_name = profile.full_name;
        }
      }

      // 2. Fetch Academic Record (latest grade)
      const academicRes = await fetch(`${API_BASE_URL}/students/${studentId}/academic`, {
        headers: { 'Content-Type': 'application/json' },
      }).catch(() => null);

      if (academicRes && academicRes.ok) {
        const academic = await academicRes.json();
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
        }
      }

      // 3. Fetch Fees Insurance status
      const feesRes = await fetch(`${API_BASE_URL}/students/${studentId}/fees-insurance`, {
        headers: { 'Content-Type': 'application/json' },
      }).catch(() => null);

      if (feesRes && feesRes.ok) {
        const feesData = await feesRes.json();
        if (feesData.insurance) {
          defaultData.fees_insurance = {
            type: 'BHYT',
            status_label: feesData.insurance.is_paid ? 'Đã nộp' : 'Chưa nộp',
          };
        }
      }

      // 4. Fetch Exam Reminders
      const examRes = await fetch(`${API_BASE_URL}/students/${studentId}/exam-reminders`, {
        headers: { 'Content-Type': 'application/json' },
      }).catch(() => null);

      if (examRes && examRes.ok) {
        const exams = await examRes.json();
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
    try {
      const res = await fetch(`${API_BASE_URL}/classes/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invite_code: studentCode }),
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        return {
          id: data.student_id || `stu_${Date.now()}`,
          student_code: studentCode,
          full_name: data.full_name || 'Học sinh mới',
          avatar_letters: 'HS',
          class_name: data.class_name ? `Lớp ${data.class_name}` : 'Lớp 6A2',
        };
      }
    } catch (e) {}

    // Fallback local create
    return {
      id: `stu_${Date.now()}`,
      student_code: studentCode.toUpperCase(),
      full_name: 'Nguyễn Minh Quân',
      avatar_letters: 'MQ',
      class_name: 'Lớp 7A3',
      attendance_status: 'Có mặt',
      attendance_note: 'Đúng giờ',
    };
  },

  async getFullAcademicRecord(studentId: string = 'stu_02') {
    try {
      const res = await fetch(`${API_BASE_URL}/students/${studentId}/academic`, {
        headers: { 'Content-Type': 'application/json' },
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        if (data.subjects && data.subjects.length > 0) {
          return data.subjects;
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
      {
        subject_name: 'Tiếng Anh',
        dot_color: '#22C087',
        average_score: 'TB 9.2',
        scores: [
          { label: 'Miệng', value: '9.5' },
          { label: '15 phút', value: '9.0' },
          { label: '1 Tiết', value: '--' },
          { label: 'Thi GK', value: '--' },
        ],
      },
    ];
  },

  async getRemarksAndExams(studentId: string = 'stu_02') {
    return {
      exams: [
        {
          id: 'exm_01',
          title: 'Kiểm tra 1 tiết Toán',
          date_label: 'Thứ Sáu, 16/10',
          icon: 'calendar_month',
        },
        {
          id: 'exm_02',
          title: 'Kiểm tra 15 phút Ngữ Văn',
          date_label: 'Thứ Hai, 19/10',
          icon: 'edit_note',
        },
      ],
      remarks: [
        {
          id: 'rmk_01',
          teacher_title: 'Cô Nguyễn Thu Hà • Toán',
          date_str: '07/10',
          content: 'Con tiến bộ, cần luyện thêm hình học.',
          is_read: false,
        },
        {
          id: 'rmk_02',
          teacher_title: 'Cô Nguyễn Thu Hà • Sinh hoạt lớp',
          date_str: '05/10',
          content: 'Con hòa đồng, tích cực phát biểu.',
          is_read: true,
        },
      ],
    };
  },

  async getAttendanceDetails(studentId: string = 'stu_02', month: string = '2026-10') {
    try {
      const res = await fetch(`${API_BASE_URL}/students/${studentId}/attendance?month=${month}`, {
        headers: { 'Content-Type': 'application/json' },
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (e) {}

    return {
      summary: {
        present_count: 4,
        absent_count: 2,
        rate_week: '66.7%',
        note: 'Cần nộp giấy xác nhận khám bệnh vào Thứ Hai',
      },
      logs: [
        {
          id: 'log_01',
          date_title: 'Thứ Năm, 08/10',
          status: 'ABSENT',
          status_label: 'Vắng',
          permit_status: 'EXCUSED',
          permit_label: 'Có phép',
          reason: 'Bị sốt cao',
        },
        {
          id: 'log_02',
          date_title: 'Thứ Tư, 07/10',
          status: 'PRESENT',
          status_label: 'Có mặt',
        },
        {
          id: 'log_03',
          date_title: 'Thứ Ba, 06/10',
          status: 'PRESENT',
          status_label: 'Có mặt',
        },
        {
          id: 'log_04',
          date_title: 'Thứ Hai, 05/10',
          status: 'ABSENT',
          status_label: 'Vắng',
          permit_status: 'UNEXCUSED',
          permit_label: 'Không phép',
        },
      ],
    };
  },
};
