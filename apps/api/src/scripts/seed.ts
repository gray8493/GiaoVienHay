/**
 * Kịch bản Seed Dữ Liệu SQL cho Hệ Thống GiaoVienHay qua Firebase Data Connect
 * (Cloud SQL PostgreSQL - Không sử dụng NoSQL Firestore)
 */

const API_KEY = "AIzaSyClBuj8koEYV2e57OrTyGdx6hrarrrwLNo";
const PROJECT_ID = "giaovienhay-511009";
const LOCATION = "us-east1";
const SERVICE_ID = "giaovienhay-511009-service";

const ENDPOINT = `https://firebasedataconnect.googleapis.com/v1alpha/projects/${PROJECT_ID}/locations/${LOCATION}/services/${SERVICE_ID}:executeGraphql?key=${API_KEY}`;

async function executeGraphql(query: string, variables: Record<string, any> = {}, accessToken?: string) {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables }),
    });
    const json = await res.json();
    if (!res.ok || json.error || json.errors) {
      console.error(`⚠️ Firebase Data Connect trả về lỗi HTTP ${res.status}:`, JSON.stringify(json.error || json.errors || json));
      return { error: json.error || json.errors || json };
    }
    return json;
  } catch (err: any) {
    console.error('❌ Lỗi kết nối tới endpoint Data Connect:', err?.message || err);
    return { error: err };
  }
}

async function seedData() {
  console.log('🚀 Bắt đầu nạp dữ liệu mẫu vào Firebase Data Connect (Cloud SQL PostgreSQL)...');

  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toISOString();

  // 1. Users
  console.log('1. Đang nạp dữ liệu Users vào bảng SQL User...');
  const users = [
    {
      id: 'usr_admin_01',
      code: 'ADM-1001',
      fullName: 'Thầy Trần Văn Bình',
      phone: '0988001122',
      email: 'hieutruong.binh@school.edu.vn',
      role: 'ADMIN',
      schoolName: 'Trường Tiểu Học Chu Văn An',
      assignedInfo: 'Quản trị viên',
      aiDailyQuota: 100,
      aiModelTier: 'PRO',
    },
    {
      id: 'usr_gv_01',
      code: 'GV-1001',
      fullName: 'Cô Nguyễn Thị Lan',
      phone: '0912345678',
      email: 'lan.nguyen@school.edu.vn',
      role: 'TEACHER_HOMEROOM',
      schoolName: 'Trường Tiểu Học Chu Văn An',
      assignedInfo: 'Lớp 1A (Chủ nhiệm)',
      aiDailyQuota: 35,
      aiModelTier: 'AUTO',
    },
    {
      id: 'usr_ph_01',
      code: 'PH-1001',
      fullName: 'Bác Trần Văn Hùng (Bố Bảo Nam)',
      phone: '0977112233',
      email: 'hung.tran@gmail.com',
      role: 'PARENT',
      schoolName: 'Trường Tiểu Học Chu Văn An',
      assignedInfo: 'Phụ huynh em Trần Bảo Nam',
      aiDailyQuota: 10,
      aiModelTier: 'FLASH',
    },
  ];

  const createUserMutation = `
    mutation CreateUser(
      $id: String!
      $code: String!
      $fullName: String!
      $phone: String!
      $email: String
      $role: String!
      $schoolName: String
      $assignedInfo: String
      $aiDailyQuota: Int
      $aiModelTier: String
    ) {
      user_insert(
        data: {
          id: $id
          code: $code
          fullName: $fullName
          phone: $phone
          email: $email
          role: $role
          schoolName: $schoolName
          assignedInfo: $assignedInfo
          aiDailyQuota: $aiDailyQuota
          aiModelTier: $aiModelTier
        }
      )
    }
  `;

  for (const u of users) {
    await executeGraphql(createUserMutation, u);
  }

  // 2. Classes
  console.log('2. Đang nạp dữ liệu Classes vào bảng SQL Class...');
  const createClassMutation = `
    mutation CreateClass(
      $id: String!
      $name: String!
      $gradeLevel: Int!
      $academicYear: String!
      $schoolName: String
      $homeroomTeacherId: String
      $inviteCode: String!
      $studentCount: Int
    ) {
      class_insert(
        data: {
          id: $id
          name: $name
          gradeLevel: $gradeLevel
          academicYear: $academicYear
          schoolName: $schoolName
          homeroomTeacherId: $homeroomTeacherId
          inviteCode: $inviteCode
          studentCount: $studentCount
        }
      )
    }
  `;

  await executeGraphql(createClassMutation, {
    id: 'cls_1a_2026',
    name: '1A',
    gradeLevel: 1,
    academicYear: '2026-2027',
    schoolName: 'Trường Tiểu Học Chu Văn An',
    homeroomTeacherId: 'usr_gv_01',
    inviteCode: 'INV-1A-2026',
    studentCount: 35,
  });

  // 3. Students
  console.log('3. Đang nạp dữ liệu Students vào bảng SQL Student...');
  const createStudentMutation = `
    mutation CreateStudent(
      $id: String!
      $classId: String!
      $studentCode: String!
      $fullName: String!
      $dob: String
      $gender: String!
      $parentPhone: String
    ) {
      student_insert(
        data: {
          id: $id
          classId: $classId
          studentCode: $studentCode
          fullName: $fullName
          dob: $dob
          gender: $gender
          parentPhone: $parentPhone
        }
      )
    }
  `;

  const students = [
    {
      id: 'stu_01',
      classId: 'cls_1a_2026',
      studentCode: 'HS001',
      fullName: 'Trần Bảo Nam',
      dob: '2019-05-15',
      gender: 'MALE',
      parentPhone: '0977112233',
    },
    {
      id: 'stu_02',
      classId: 'cls_1a_2026',
      studentCode: 'HS002',
      fullName: 'Lê Ngọc Mai',
      dob: '2019-08-20',
      gender: 'FEMALE',
      parentPhone: '0966445566',
    },
  ];

  for (const s of students) {
    await executeGraphql(createStudentMutation, s);
  }

  // 4. Schools
  console.log('4. Đang nạp dữ liệu Schools vào bảng SQL School...');
  const createSchoolMutation = `
    mutation CreateSchool(
      $id: String!
      $code: String!
      $name: String!
      $address: String
      $phone: String
      $email: String
    ) {
      school_insert(
        data: {
          id: $id
          code: $code
          name: $name
          address: $address
          phone: $phone
          email: $email
        }
      )
    }
  `;

  await executeGraphql(createSchoolMutation, {
    id: 'sch_chuvanan',
    code: 'CHUVANAN',
    name: 'Trường Tiểu Học Chu Văn An',
    address: '115 Thụy Khuê, Tây Hồ, Hà Nội',
    phone: '02438471122',
    email: 'c1chuvanan@edu.vn',
  });

  // Thêm các Users bổ sung cho các test case
  console.log('1.1. Đang nạp bổ sung các Users phục vụ testcase...');
  const extraUsers = [
    {
      id: 'usr_teacher_lan',
      code: 'GV-1001-ALT',
      fullName: 'Cô Nguyễn Thị Lan',
      phone: '0912345670',
      email: 'teacher.lan@school.edu.vn',
      role: 'TEACHER_HOMEROOM',
      schoolName: 'Trường Tiểu Học Chu Văn An',
      assignedInfo: 'Lớp 1A (Chủ nhiệm & Toán)',
      aiDailyQuota: 35,
      aiModelTier: 'AUTO',
    },
    {
      id: 'usr_teacher_other',
      code: 'GV-1002',
      fullName: 'Thầy Nguyễn Văn Nam',
      phone: '0912345679',
      email: 'nam.nguyen@school.edu.vn',
      role: 'TEACHER_SUBJECT',
      schoolName: 'Trường Tiểu Học Chu Văn An',
      assignedInfo: 'Bộ môn Thể dục & Lớp 2B',
      aiDailyQuota: 25,
      aiModelTier: 'FLASH',
    },
    {
      id: 'usr_parent_01',
      code: 'PH-1001-ALT',
      fullName: 'Bác Trần Văn Hùng',
      phone: '0977112230',
      email: 'hung.tran.ph@gmail.com',
      role: 'PARENT',
      schoolName: 'Trường Tiểu Học Chu Văn An',
      assignedInfo: 'Phụ huynh em Trần Bảo Nam',
      aiDailyQuota: 10,
      aiModelTier: 'FLASH',
    },
    {
      id: 'usr_parent_02',
      code: 'PH-1002',
      fullName: 'Bác Lê Văn Dũng',
      phone: '0966445566',
      email: 'dung.le@gmail.com',
      role: 'PARENT',
      schoolName: 'Trường Tiểu Học Chu Văn An',
      assignedInfo: 'Phụ huynh em Lê Ngọc Mai',
      aiDailyQuota: 10,
      aiModelTier: 'FLASH',
    },
    {
      id: 'usr_teacher_locked',
      code: 'GV-9999',
      fullName: 'Giáo viên Đang Bị Khóa',
      phone: '0999888777',
      email: 'locked.teacher@school.edu.vn',
      role: 'TEACHER_SUBJECT',
      schoolName: 'Trường Tiểu Học Chu Văn An',
      assignedInfo: 'Đình chỉ công tác',
      aiDailyQuota: 0,
      aiModelTier: 'FLASH',
    },
  ];

  for (const u of extraUsers) {
    await executeGraphql(createUserMutation, u);
  }

  // Khóa tài khoản usr_teacher_locked
  await executeGraphql(`
    mutation LockUser($id: String!) {
      user_update(id: $id, data: { isActive: false })
    }
  `, { id: 'usr_teacher_locked' });

  // Thêm lớp bổ sung cls_2b_2026
  await executeGraphql(createClassMutation, {
    id: 'cls_2b_2026',
    name: '2B',
    gradeLevel: 2,
    academicYear: '2026-2027',
    schoolName: 'Trường Tiểu Học Chu Văn An',
    homeroomTeacherId: 'usr_teacher_other',
    inviteCode: 'INV-2B-2026',
    studentCount: 30,
  });

  // Thêm học sinh stu_03
  await executeGraphql(createStudentMutation, {
    id: 'stu_03',
    classId: 'cls_1a_2026',
    studentCode: 'HS003',
    fullName: 'Nguyễn Hoàng Long',
    dob: '2019-03-10',
    gender: 'MALE',
    parentPhone: '0988223344',
  });

  // 5. Attendances
  console.log('5. Đang nạp dữ liệu Điểm danh vào bảng SQL Attendance...');
  const createAttendanceMutation = `
    mutation CreateAttendance(
      $id: String!
      $classId: String!
      $studentId: String!
      $date: String!
      $status: String!
      $note: String
    ) {
      attendance_insert(
        data: {
          id: $id
          classId: $classId
          studentId: $studentId
          date: $date
          status: $status
          note: $note
        }
      )
    }
  `;

  const attendances = [
    {
      id: 'att_01',
      classId: 'cls_1a_2026',
      studentId: 'stu_01',
      date: '2026-09-23',
      status: 'PRESENT',
      note: 'Đi học đúng giờ',
    },
    {
      id: 'att_02',
      classId: 'cls_1a_2026',
      studentId: 'stu_02',
      date: '2026-09-23',
      status: 'LATE',
      note: 'Đến muộn 15 phút do tắc đường',
    },
    {
      id: 'att_03',
      classId: 'cls_1a_2026',
      studentId: 'stu_03',
      date: '2026-09-23',
      status: 'ABSENT_EXCUSED',
      note: 'Phụ huynh đã xin phép do ốm',
    },
    {
      id: 'att_today_01',
      classId: 'cls_1a_2026',
      studentId: 'stu_01',
      date: today,
      status: 'PRESENT',
      note: 'Có mặt đầy đủ',
    },
    {
      id: 'att_today_02',
      classId: 'cls_1a_2026',
      studentId: 'stu_02',
      date: today,
      status: 'PRESENT',
      note: 'Có mặt đầy đủ',
    },
  ];

  for (const a of attendances) {
    await executeGraphql(createAttendanceMutation, a);
  }

  // 6. Scores (Bảng điểm)
  console.log('6. Đang nạp dữ liệu Điểm số vào bảng SQL Score...');
  const createScoreMutation = `
    mutation CreateScore(
      $id: String!
      $studentId: String!
      $classId: String!
      $subject: String!
      $scoreType: String!
      $scoreValue: Float!
      $term: Int!
      $academicYear: String!
    ) {
      score_insert(
        data: {
          id: $id
          studentId: $studentId
          classId: $classId
          subject: $subject
          scoreType: $scoreType
          scoreValue: $scoreValue
          term: $term
          academicYear: $academicYear
        }
      )
    }
  `;

  const scores = [
    {
      id: 'score_01',
      studentId: 'stu_01',
      classId: 'cls_1a_2026',
      subject: 'MATH',
      scoreType: 'ORAL',
      scoreValue: 9.5,
      term: 1,
      academicYear: '2026-2027',
    },
    {
      id: 'score_02',
      studentId: 'stu_01',
      classId: 'cls_1a_2026',
      subject: 'MATH',
      scoreType: '15MIN',
      scoreValue: 9.0,
      term: 1,
      academicYear: '2026-2027',
    },
    {
      id: 'score_03',
      studentId: 'stu_02',
      classId: 'cls_1a_2026',
      subject: 'MATH',
      scoreType: 'ORAL',
      scoreValue: 8.5,
      term: 1,
      academicYear: '2026-2027',
    },
    {
      id: 'score_04',
      studentId: 'stu_01',
      classId: 'cls_1a_2026',
      subject: 'LIT',
      scoreType: 'ORAL',
      scoreValue: 9.0,
      term: 1,
      academicYear: '2026-2027',
    },
  ];

  for (const sc of scores) {
    await executeGraphql(createScoreMutation, sc);
  }

  // 7. Quizzes
  console.log('7. Đang nạp dữ liệu Đề trắc nghiệm vào bảng SQL Quiz...');
  const createQuizMutation = `
    mutation CreateQuiz(
      $id: String!
      $teacherId: String!
      $classId: String!
      $subject: String!
      $title: String!
      $questionsJson: String!
    ) {
      quiz_insert(
        data: {
          id: $id
          teacherId: $teacherId
          classId: $classId
          subject: $subject
          title: $title
          questionsJson: $questionsJson
        }
      )
    }
  `;

  await executeGraphql(createQuizMutation, {
    id: 'quiz_01',
    teacherId: 'usr_gv_01',
    classId: 'cls_1a_2026',
    subject: 'MATH',
    title: 'Đề kiểm tra 15 phút Toán - Bảng cộng trong phạm vi 10',
    questionsJson: JSON.stringify([
      { question: '5 + 3 = ?', options: ['7', '8', '9', '10'], answer: 1 },
      { question: '9 - 4 = ?', options: ['4', '5', '6', '7'], answer: 1 },
      { question: 'Số liền sau của số 7 là số nào?', options: ['6', '7', '8', '9'], answer: 2 },
    ]),
  });

  // 8. Remarks
  console.log('8. Đang nạp dữ liệu Lời nhận xét vào bảng SQL Remark...');
  const createRemarkMutation = `
    mutation CreateRemark(
      $id: String!
      $studentId: String!
      $teacherId: String!
      $date: String!
      $content: String!
      $category: String!
    ) {
      remark_insert(
        data: {
          id: $id
          studentId: $studentId
          teacherId: $teacherId
          date: $date
          content: $content
          category: $category
        }
      )
    }
  `;

  const remarks = [
    {
      id: 'rmk_01',
      studentId: 'stu_01',
      teacherId: 'usr_gv_01',
      date: today,
      content: 'Hôm nay em Nam tiếp thu bài rất nhanh và hăng hái xung phong lên bảng chữa bài tập.',
      category: 'ACADEMIC',
    },
    {
      id: 'rmk_02',
      studentId: 'stu_02',
      teacherId: 'usr_gv_01',
      date: today,
      content: 'Em Mai viết chữ sạch đẹp, có ý thức giúp đỡ bạn bè trong giờ học.',
      category: 'BEHAVIOR',
    },
    {
      id: 'rmk_9912',
      studentId: 'stu_01',
      teacherId: 'usr_gv_01',
      date: '2026-09-23',
      content: 'Em Nam hăng hái tham gia phát biểu xây dựng bài học môn Toán.',
      category: 'ACADEMIC',
    },
  ];

  for (const rm of remarks) {
    await executeGraphql(createRemarkMutation, rm);
  }

  // 9. Exam Reminders
  console.log('9. Đang nạp dữ liệu Lời nhắc lịch thi vào bảng SQL ExamReminder...');
  const createExamReminderMutation = `
    mutation CreateExamReminder(
      $id: String!
      $classId: String!
      $subject: String!
      $examDate: String!
      $title: String!
      $note: String
    ) {
      examReminder_insert(
        data: {
          id: $id
          classId: $classId
          subject: $subject
          examDate: $examDate
          title: $title
          note: $note
        }
      )
    }
  `;

  const examReminders = [
    {
      id: 'rem_01',
      classId: 'cls_1a_2026',
      subject: 'MATH',
      examDate: '2026-10-15',
      title: 'Kiểm tra giữa Học kỳ 1 môn Toán',
      note: 'Ôn tập phép cộng trừ trong phạm vi 10 và nhận biết các hình học cơ bản.',
    },
    {
      id: 'rem_02',
      classId: 'cls_1a_2026',
      subject: 'LIT',
      examDate: '2026-10-18',
      title: 'Kiểm tra giữa Học kỳ 1 môn Tiếng Việt',
      note: 'Ôn tập bảng chữ cái, quy tắc viết hoa và chính tả đoạn ngắn.',
    },
  ];

  for (const er of examReminders) {
    await executeGraphql(createExamReminderMutation, er);
  }

  // 10. Fees (Các khoản thu)
  console.log('10. Đang nạp dữ liệu Khoản thu/Học phí vào bảng SQL Fee...');
  const createFeeMutation = `
    mutation CreateFee(
      $id: String!
      $studentId: String!
      $title: String!
      $amount: Float!
      $status: String!
      $dueDate: String!
    ) {
      fee_insert(
        data: {
          id: $id
          studentId: $studentId
          title: $title
          amount: $amount
          status: $status
          dueDate: $dueDate
        }
      )
    }
  `;

  const fees = [
    {
      id: 'fee_01',
      studentId: 'stu_01',
      title: 'Tiền ăn bán trú & Chăm sóc bán trú Tháng 10/2026',
      amount: 850000,
      status: 'PENDING',
      dueDate: '2026-10-25',
    },
    {
      id: 'fee_02',
      studentId: 'stu_01',
      title: 'Bảo hiểm y tế học sinh năm học 2026-2027',
      amount: 680400,
      status: 'PAID',
      dueDate: '2026-09-30',
    },
    {
      id: 'fee_03',
      studentId: 'stu_02',
      title: 'Tiền ăn bán trú & Chăm sóc bán trú Tháng 10/2026',
      amount: 850000,
      status: 'PENDING',
      dueDate: '2026-10-25',
    },
  ];

  for (const f of fees) {
    await executeGraphql(createFeeMutation, f);
  }

  // 11. Notifications
  console.log('11. Đang nạp dữ liệu Thông báo vào bảng SQL Notification...');
  const createNotificationMutation = `
    mutation CreateNotification(
      $id: String!
      $recipientId: String!
      $title: String!
      $body: String!
      $type: String!
      $isRead: Boolean
    ) {
      notification_insert(
        data: {
          id: $id
          recipientId: $recipientId
          title: $title
          body: $body
          type: $type
          isRead: $isRead
        }
      )
    }
  `;

  const notifications = [
    {
      id: 'notif_01',
      recipientId: 'usr_parent_01',
      title: 'Thông báo chuyên cần',
      body: 'Em Trần Bảo Nam đã có mặt tại lớp 1A đúng giờ hôm nay.',
      type: 'ATTENDANCE',
      isRead: false,
    },
    {
      id: 'notif_02',
      recipientId: 'usr_parent_01',
      title: 'Công bố điểm kiểm tra',
      body: 'Giáo viên vừa cập nhật điểm môn Toán cho em Trần Bảo Nam: 9.5 điểm.',
      type: 'SCORE',
      isRead: true,
    },
    {
      id: 'notif_remark_01',
      recipientId: 'usr_parent_01',
      title: 'Lời nhận xét mới từ giáo viên',
      body: 'Hôm nay em Nam tiếp thu bài rất nhanh và hăng hái xung phong lên bảng chữa bài tập.',
      type: 'SYSTEM',
      isRead: false,
    },
  ];

  for (const n of notifications) {
    await executeGraphql(createNotificationMutation, n);
  }

  // 12. SystemLimits
  console.log('12. Đang nạp cấu hình giới hạn hệ thống SystemLimits...');
  const upsertLimitsMutation = `
    mutation UpsertSystemLimits(
      $id: String!
      $geminiQuotaPerTeacher: Int!
      $maxQuizQuestions: Int!
      $maxUploadSizeMb: Int!
      $maxStudentsPerClass: Int!
      $maxClassesPerTeacher: Int!
      $aiModel: String!
      $allowSubjectTeacherCreateClass: Boolean!
      $enableFallbackCache: Boolean!
    ) {
      systemLimit_upsert(
        data: {
          id: $id
          geminiQuotaPerTeacher: $geminiQuotaPerTeacher
          maxQuizQuestions: $maxQuizQuestions
          maxUploadSizeMb: $maxUploadSizeMb
          maxStudentsPerClass: $maxStudentsPerClass
          maxClassesPerTeacher: $maxClassesPerTeacher
          aiModel: $aiModel
          allowSubjectTeacherCreateClass: $allowSubjectTeacherCreateClass
          enableFallbackCache: $enableFallbackCache
        }
      )
    }
  `;

  await executeGraphql(upsertLimitsMutation, {
    id: 'sys_limits_default',
    geminiQuotaPerTeacher: 25,
    maxQuizQuestions: 20,
    maxUploadSizeMb: 15,
    maxStudentsPerClass: 55,
    maxClassesPerTeacher: 5,
    aiModel: 'gemini-1.5-flash',
    allowSubjectTeacherCreateClass: true,
    enableFallbackCache: true,
  });

  console.log('🎉 Hoàn tất nạp dữ liệu mẫu toàn diện cho cả 12 phân hệ vào SQL Firebase Data Connect (Cloud SQL PostgreSQL)!');
  process.exit(0);
}

seedData().catch((err) => {
  console.error('❌ Lỗi khi nạp dữ liệu vào SQL Data Connect:', err);
  process.exit(1);
});
