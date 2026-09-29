import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyATfD-5iZn_2X9eAMU9dl1t6WcDT_xA34M",
  authDomain: "giaovienhay.firebaseapp.com",
  projectId: "giaovienhay",
  storageBucket: "giaovienhay.firebasestorage.app",
  messagingSenderId: "15041699969",
  appId: "1:15041699969:web:7e8d4728499d656cb0ed80",
  measurementId: "G-9TF55K3ZRF"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

async function seedData() {
  console.log('🚀 Bắt đầu nạp dữ liệu mẫu vào Firebase Firestore (Project: giaovienhay)...');

  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toISOString();

  // 1. Users Collection
  console.log('1. Đang nạp dữ liệu Users...');
  const users = [
    {
      id: 'usr_admin_01',
      full_name: 'Thầy Trần Văn Bình',
      phone: '0988001122',
      email: 'hieutruong.binh@school.edu.vn',
      role: 'ADMIN',
      school_name: 'Trường Tiểu Học Chu Văn An',
      teaching_subjects: [],
      is_active: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'usr_gv_01',
      full_name: 'Cô Nguyễn Thị Lan',
      phone: '0912345678',
      email: 'lan.nguyen@school.edu.vn',
      role: 'TEACHER_HOMEROOM',
      school_name: 'Trường Tiểu Học Chu Văn An',
      teaching_subjects: ['MATH'],
      is_active: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'usr_gv_02',
      full_name: 'Thầy Lê Văn Hùng',
      phone: '0912334455',
      email: 'hung.le@school.edu.vn',
      role: 'TEACHER_SUBJECT',
      school_name: 'Trường Tiểu Học Chu Văn An',
      teaching_subjects: ['LITERATURE'],
      is_active: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'usr_ph_01',
      full_name: 'Anh Trần Văn Nam (Bố em Nam)',
      phone: '0988112233',
      email: 'ph.nam@gmail.com',
      role: 'PARENT',
      school_name: null,
      teaching_subjects: [],
      is_active: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'usr_ph_02',
      full_name: 'Chị Lê Thị Mai (Mẹ em Mai)',
      phone: '0988445566',
      email: 'ph.mai@gmail.com',
      role: 'PARENT',
      school_name: null,
      teaching_subjects: [],
      is_active: true,
      created_at: now,
      updated_at: now,
    },
  ];

  for (const u of users) {
    await setDoc(doc(db, 'users', u.id), u);
  }

  // 2. Classes Collection
  console.log('2. Đang nạp dữ liệu Classes...');
  const class1A = {
    id: 'cls_1a_2026',
    name: '1A',
    grade_level: 1,
    academic_year: '2026-2027',
    school_name: 'Trường Tiểu Học Chu Văn An',
    homeroom_teacher_id: 'usr_gv_01',
    subject_teacher_ids: ['usr_gv_01', 'usr_gv_02'],
    invite_code: 'INV-1A-2026',
    student_count: 5,
    created_at: now,
    updated_at: now,
  };
  await setDoc(doc(db, 'classes', class1A.id), class1A);

  // 3. Students Collection
  console.log('3. Đang nạp dữ liệu Students...');
  const students = [
    {
      id: 'stu_01',
      class_id: 'cls_1a_2026',
      class_name: '1A',
      student_code: 'HS001',
      full_name: 'Trần Bảo Nam',
      dob: '2019-05-15',
      gender: 'MALE',
      parent_phone: '0988112233',
      parent_uids: ['usr_ph_01'],
      created_at: now,
    },
    {
      id: 'stu_02',
      class_id: 'cls_1a_2026',
      class_name: '1A',
      student_code: 'HS002',
      full_name: 'Lê Ngọc Mai',
      dob: '2019-08-20',
      gender: 'FEMALE',
      parent_phone: '0988445566',
      parent_uids: ['usr_ph_02'],
      created_at: now,
    },
    {
      id: 'stu_03',
      class_id: 'cls_1a_2026',
      class_name: '1A',
      student_code: 'HS003',
      full_name: 'Hoàng Minh Khôi',
      dob: '2019-11-10',
      gender: 'MALE',
      parent_phone: null,
      parent_uids: [],
      created_at: now,
    },
    {
      id: 'stu_04',
      class_id: 'cls_1a_2026',
      class_name: '1A',
      student_code: 'HS004',
      full_name: 'Đỗ Gia Hưng',
      dob: '2019-03-25',
      gender: 'MALE',
      parent_phone: null,
      parent_uids: [],
      created_at: now,
    },
    {
      id: 'stu_05',
      class_id: 'cls_1a_2026',
      class_name: '1A',
      student_code: 'HS005',
      full_name: 'Phạm Thảo Linh',
      dob: '2019-07-12',
      gender: 'FEMALE',
      parent_phone: null,
      parent_uids: [],
      created_at: now,
    },
  ];

  for (const s of students) {
    await setDoc(doc(db, 'students', s.id), s);
  }

  // 4. Attendances Collection
  console.log('4. Đang nạp dữ liệu Attendances...');
  const attendances = [
    { student_id: 'stu_01', student_name: 'Trần Bảo Nam', status: 'PRESENT', note: null },
    { student_id: 'stu_02', student_name: 'Lê Ngọc Mai', status: 'ABSENT_EXCUSED', note: 'Phụ huynh xin nghỉ ốm' },
    { student_id: 'stu_03', student_name: 'Hoàng Minh Khôi', status: 'PRESENT', note: null },
    { student_id: 'stu_04', student_name: 'Đỗ Gia Hưng', status: 'PRESENT', note: null },
    { student_id: 'stu_05', student_name: 'Phạm Thảo Linh', status: 'PRESENT', note: null },
  ];

  for (const att of attendances) {
    const docId = `att_cls_1a_2026_${att.student_id}_${today}`;
    await setDoc(doc(db, 'attendances', docId), {
      class_id: 'cls_1a_2026',
      student_id: att.student_id,
      student_name: att.student_name,
      attendance_date: today,
      period: 1,
      status: att.status,
      note: att.note,
      recorded_by: 'usr_gv_01',
      updated_at: now,
    });
  }

  // 5. Scores Collection (Grades)
  console.log('5. Đang nạp dữ liệu Scores...');
  const scores = [
    // Em Nam
    { student_id: 'stu_01', subject_code: 'MATH', score_type: 'ORAL_TEST', score_value: 9.5, comment: 'Học thuộc bảng cộng' },
    { student_id: 'stu_01', subject_code: 'MATH', score_type: 'TEST_15P', score_value: 8.5, comment: null },
    { student_id: 'stu_01', subject_code: 'MATH', score_type: 'MID_TERM', score_value: 9.5, comment: null },
    { student_id: 'stu_01', subject_code: 'LITERATURE', score_type: 'ORAL_TEST', score_value: 8.0, comment: 'Đọc diễn cảm tốt' },
    { student_id: 'stu_01', subject_code: 'LITERATURE', score_type: 'TEST_15P', score_value: 9.0, comment: 'Chính tả sạch đẹp' },
    // Em Mai
    { student_id: 'stu_02', subject_code: 'MATH', score_type: 'ORAL_TEST', score_value: 8.0, comment: 'Cần tính nhẩm nhanh hơn' },
    { student_id: 'stu_02', subject_code: 'MATH', score_type: 'TEST_15P', score_value: 9.0, comment: null },
    // Em Khôi
    { student_id: 'stu_03', subject_code: 'MATH', score_type: 'ORAL_TEST', score_value: 9.0, comment: null },
    { student_id: 'stu_03', subject_code: 'MATH', score_type: 'TEST_15P', score_value: 9.2, comment: null },
  ];

  for (const sc of scores) {
    const docId = `score_cls_1a_2026_${sc.subject_code}_${sc.student_id}_${sc.score_type}`;
    await setDoc(doc(db, 'scores', docId), {
      class_id: 'cls_1a_2026',
      student_id: sc.student_id,
      subject_code: sc.subject_code,
      semester: 1,
      score_type: sc.score_type,
      score_value: sc.score_value,
      teacher_comment: sc.comment,
      is_published: true,
      recorded_by: 'usr_gv_01',
      updated_at: now,
    });
  }

  // 6. Quizzes Collection
  console.log('6. Đang nạp dữ liệu Quizzes (Kiểm tra bài cũ & Gamification)...');
  const sampleQuiz = {
    quiz_id: 'qz_88219',
    title: 'Kiểm tra bài 12: Phép cộng phân số',
    subject_code: 'MATH',
    class_id: 'cls_1a_2026',
    difficulty_level: 'MEDIUM',
    total_questions: 5,
    available_modes: ['STANDARD_QUIZ', 'GOLDEN_BELL', 'RACING', 'MYSTERY_BOX'],
    questions: [
      {
        question_index: 1,
        content: 'Muốn cộng hai phân số cùng mẫu số, ta thực hiện như thế nào?',
        options: [
          'Cộng tử số với tử số và giữ nguyên mẫu số',
          'Cộng cả tử số và mẫu số với nhau',
          'Nhân tử số với mẫu số',
          'Giữ nguyên tử số và cộng mẫu số',
        ],
        correct_answer: 'A',
        explanation: 'Quy tắc: Muốn cộng hai phân số cùng mẫu số, ta cộng hai tử số và giữ nguyên mẫu số.',
        time_limit_seconds: 30,
      },
      {
        question_index: 2,
        content: 'Kết quả của phép tính: 2/7 + 3/7 là bao nhiêu?',
        options: ['5/14', '5/7', '6/7', '1/7'],
        correct_answer: 'B',
        explanation: '2/7 + 3/7 = (2+3)/7 = 5/7.',
        time_limit_seconds: 30,
      },
    ],
    created_by: 'usr_gv_01',
    created_at: now,
  };
  await setDoc(doc(db, 'quizzes', sampleQuiz.quiz_id), sampleQuiz);

  // 7. Remarks Collection
  console.log('7. Đang nạp dữ liệu Remarks...');
  const remark = {
    id: 'rmk_01',
    student_id: 'stu_01',
    class_id: 'cls_1a_2026',
    subject_code: 'MATH',
    teacher_id: 'usr_gv_01',
    teacher_name: 'Cô Nguyễn Thị Lan',
    content: 'Hôm nay Nam làm bài tập rất nhanh và hăng hái phát biểu xây dựng bài.',
    parent_acknowledged: true,
    acknowledged_at: now,
    created_at: now,
  };
  await setDoc(doc(db, 'remarks', remark.id), remark);

  // 8. Exam Reminders Collection
  console.log('8. Đang nạp dữ liệu Exam Reminders...');
  const reminder = {
    id: 'exm_01',
    class_id: 'cls_1a_2026',
    subject_code: 'MATH',
    exam_type: 'TEST_15P',
    exam_date: '2026-10-02',
    message: 'Thứ Sáu tới lớp có bài kiểm tra 15 phút môn Toán về phép cộng trong phạm vi 10. Kính nhờ quý phụ huynh đôn đốc con ôn bài.',
    created_by: 'usr_gv_01',
    created_at: now,
  };
  await setDoc(doc(db, 'exam_reminders', reminder.id), reminder);

  // 9. Fees & Insurance Collection
  console.log('9. Đang nạp dữ liệu Fees & Insurance...');
  const fees = [
    {
      id: 'fee_01',
      student_id: 'stu_01',
      student_name: 'Trần Bảo Nam',
      class_id: 'cls_1a_2026',
      term_name: 'Học kỳ 1 năm học 2026-2027',
      tuition: { is_paid: true, paid_date: '2026-09-15', amount: 1200000 },
      insurance: { is_paid: true, paid_date: '2026-09-18', amount: 880000 },
      note: 'Đã nộp đủ cả năm',
      updated_at: now,
    },
    {
      id: 'fee_02',
      student_id: 'stu_02',
      student_name: 'Lê Ngọc Mai',
      class_id: 'cls_1a_2026',
      term_name: 'Học kỳ 1 năm học 2026-2027',
      tuition: { is_paid: true, paid_date: '2026-09-16', amount: 1200000 },
      insurance: { is_paid: false, paid_date: null, amount: 880000, deadline: '2026-10-15' },
      note: null,
      updated_at: now,
    },
  ];

  for (const f of fees) {
    await setDoc(doc(db, 'fees_insurance', f.id), f);
  }

  // 10. Notifications Collection
  console.log('10. Đang nạp dữ liệu Notifications...');
  const notifs = [
    {
      id: 'notif_01',
      title: 'Nhắc lịch kiểm tra môn Toán',
      body: 'Thứ Sáu tới lớp có bài kiểm tra 15 phút Toán. Kính nhờ phụ huynh đôn đốc con ôn bài.',
      type: 'EXAM_REMINDER',
      is_read: false,
      metadata: { student_id: 'stu_01', class_id: 'cls_1a_2026' },
      created_at: now,
    },
    {
      id: 'notif_02',
      title: 'Cảnh báo vắng học',
      body: `Học sinh Lê Ngọc Mai vắng mặt tại lớp ngày ${today}. Kính nhờ phụ huynh xác nhận thông tin.`,
      type: 'ATTENDANCE_ABSENT',
      is_read: false,
      metadata: { student_id: 'stu_02', class_id: 'cls_1a_2026' },
      created_at: now,
    },
  ];

  for (const n of notifs) {
    await setDoc(doc(db, 'notifications', n.id), n);
  }

  console.log('🎉 Hoàn tất 100% nạp dữ liệu mẫu vào Firebase Firestore!');
  process.exit(0);
}

seedData().catch((err) => {
  console.error('❌ Lỗi khi nạp dữ liệu vào Firestore:', err);
  process.exit(1);
});
