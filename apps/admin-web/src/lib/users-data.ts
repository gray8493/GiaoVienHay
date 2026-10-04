export interface TeacherUser {
  id: string;
  code: string;
  full_name: string;
  phone: string;
  email: string;
  role: 'TEACHER_HOMEROOM' | 'TEACHER_SUBJECT';
  school_name: string;
  subject: string;
  assigned_class: string;
  is_active: boolean;
  status_reason?: string;
  created_at: string;
}

export interface LinkedStudent {
  student_code: string;
  full_name: string;
  class_name: string;
}

export interface ParentUser {
  id: string;
  code: string;
  full_name: string;
  phone: string;
  email: string;
  school_name: string;
  students: LinkedStudent[];
  is_active: boolean;
  status_reason?: string;
  created_at: string;
}

export const INITIAL_TEACHERS: TeacherUser[] = [
  {
    id: 'usr_t01',
    code: 'GV-8821',
    full_name: 'Cô Nguyễn Thị Mai Lan',
    phone: '0912 345 678',
    email: 'mai.lan@thcslequydon.edu.vn',
    role: 'TEACHER_HOMEROOM',
    school_name: 'THCS Lê Quý Đôn',
    subject: 'Ngữ văn',
    assigned_class: 'Chủ nhiệm 7A',
    is_active: true,
    created_at: '2026-09-01T08:00:00.000Z',
  },
  {
    id: 'usr_t02',
    code: 'GV-3310',
    full_name: 'Thầy Hoàng Văn Đức',
    phone: '0988 776 543',
    email: 'duc.hoang@thcschuvanan.edu.vn',
    role: 'TEACHER_SUBJECT',
    school_name: 'THCS Chu Văn An',
    subject: 'Toán',
    assigned_class: 'Khối 7 & 8',
    is_active: true,
    created_at: '2026-09-02T08:00:00.000Z',
  },
  {
    id: 'usr_t03',
    code: 'GV-4912',
    full_name: 'Thầy Trần Văn Mạnh',
    phone: '0977 443 219',
    email: 'manh.tran@thcsphandinhphung.edu.vn',
    role: 'TEACHER_SUBJECT',
    school_name: 'THCS Phan Đình Phùng',
    subject: 'Hóa học',
    assigned_class: 'Khối 8 & 9',
    is_active: true,
    created_at: '2026-09-10T08:00:00.000Z',
  },
  {
    id: 'usr_t04',
    code: 'GV-2219',
    full_name: 'Cô Đỗ Thị Minh Châu',
    phone: '0934 998 112',
    email: 'chau.do@thcslequydon.edu.vn',
    role: 'TEACHER_SUBJECT',
    school_name: 'THCS Lê Quý Đôn',
    subject: 'Tiếng Anh',
    assigned_class: 'Khối 6 & 7',
    is_active: false,
    status_reason: 'Tạm ngưng công tác theo yêu cầu cá nhân',
    created_at: '2026-09-12T08:00:00.000Z',
  },
  {
    id: 'usr_t05',
    code: 'GV-5102',
    full_name: 'Thầy Hoàng Nhật Nam',
    phone: '0965 221 889',
    email: 'nam.hoang@thcschuvanan.edu.vn',
    role: 'TEACHER_SUBJECT',
    school_name: 'THCS Chu Văn An',
    subject: 'Tin học',
    assigned_class: 'Khối 6',
    is_active: true,
    created_at: '2026-09-20T08:00:00.000Z',
  },
  {
    id: 'usr_t06',
    code: 'GV-6701',
    full_name: 'Cô Phạm Thị Thu Hà',
    phone: '0943 118 902',
    email: 'ha.pham@thcslequydon.edu.vn',
    role: 'TEACHER_HOMEROOM',
    school_name: 'THCS Lê Quý Đôn',
    subject: 'Vật lý',
    assigned_class: 'Chủ nhiệm 8B',
    is_active: true,
    created_at: '2026-09-22T08:00:00.000Z',
  },
];

export const INITIAL_PARENTS: ParentUser[] = [
  {
    id: 'usr_p01',
    code: 'PH-1094',
    full_name: 'Lê Anh Tuấn',
    phone: '0903 112 233',
    email: 'tuan.le@gmail.com',
    school_name: 'THCS Lê Quý Đôn',
    students: [
      { student_code: 'HS-701', full_name: 'Lê Hoàng Long', class_name: '7A' },
    ],
    is_active: true,
    created_at: '2026-09-05T09:00:00.000Z',
  },
  {
    id: 'usr_p02',
    code: 'PH-2241',
    full_name: 'Trần Thị Thu Trang',
    phone: '0918 665 432',
    email: 'trang.tran@outlook.com',
    school_name: 'THCS Chu Văn An',
    students: [
      { student_code: 'HS-812', full_name: 'Trần Minh Quân', class_name: '8B' },
      { student_code: 'HS-604', full_name: 'Trần Thảo My', class_name: '6A' },
    ],
    is_active: true,
    created_at: '2026-09-08T10:30:00.000Z',
  },
  {
    id: 'usr_p03',
    code: 'PH-3158',
    full_name: 'Vũ Đức Thành',
    phone: '0972 554 119',
    email: 'thanh.vu@gmail.com',
    school_name: 'THCS Phan Đình Phùng',
    students: [
      { student_code: 'HS-905', full_name: 'Vũ Hải Đăng', class_name: '9C' },
    ],
    is_active: true,
    created_at: '2026-09-11T14:15:00.000Z',
  },
  {
    id: 'usr_p04',
    code: 'PH-4089',
    full_name: 'Ngô Thanh Hương',
    phone: '0938 221 776',
    email: 'huong.ngo@yahoo.com',
    school_name: 'THCS Lê Quý Đôn',
    students: [
      { student_code: 'HS-733', full_name: 'Đặng Ngọc Anh', class_name: '7A' },
    ],
    is_active: false,
    status_reason: 'Chuyển trường cho học sinh',
    created_at: '2026-09-15T09:45:00.000Z',
  },
  {
    id: 'usr_p05',
    code: 'PH-5210',
    full_name: 'Nguyễn Văn Hùng',
    phone: '0909 887 665',
    email: 'hung.nguyen@company.vn',
    school_name: 'THCS Chu Văn An',
    students: [
      { student_code: 'HS-618', full_name: 'Nguyễn Khánh Linh', class_name: '6C' },
    ],
    is_active: true,
    created_at: '2026-09-18T16:20:00.000Z',
  },
];
