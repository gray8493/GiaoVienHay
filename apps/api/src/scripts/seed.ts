/**
 * Kịch bản Seed Dữ Liệu SQL cho Hệ Thống GiaoVienHay qua Firebase Data Connect
 * (Cloud SQL PostgreSQL - Không sử dụng NoSQL Firestore)
 */

const API_KEY = "AIzaSyClBuj8koEYV2e57OrTyGdx6hrarrrwLNo";
const PROJECT_ID = "giaovienhay-511009";
const LOCATION = "us-east1";
const SERVICE_ID = "giaovienhay-511009-service";

const ENDPOINT = `https://firebasedataconnect.googleapis.com/v1alpha/projects/${PROJECT_ID}/locations/${LOCATION}/services/${SERVICE_ID}:executeGraphql?key=${API_KEY}`;

async function executeGraphql(query: string, variables: Record<string, any> = {}) {
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
    });
    return await res.json();
  } catch (err) {
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

  // 4. SystemLimits
  console.log('4. Đang nạp cấu hình giới hạn hệ thống SystemLimits...');
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

  console.log('🎉 Hoàn tất nạp dữ liệu mẫu vào SQL Firebase Data Connect (Cloud SQL PostgreSQL)!');
  process.exit(0);
}

seedData().catch((err) => {
  console.error('❌ Lỗi khi nạp dữ liệu vào SQL Data Connect:', err);
  process.exit(1);
});
