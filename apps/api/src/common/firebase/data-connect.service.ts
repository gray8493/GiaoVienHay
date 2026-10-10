import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { GoogleAuth } from 'google-auth-library';

export interface DataConnectUserRecord {
  id: string;
  code: string;
  fullName: string;
  phone: string;
  email?: string | null;
  role: string;
  schoolName?: string | null;
  assignedInfo?: string | null;
  isActive: boolean;
  isDeleted: boolean;
  aiDailyQuota: number;
  aiUsedToday: number;
  aiModelTier: string;
  createdAt: string;
  updatedAt: string;
}

export interface DataConnectClassRecord {
  id: string;
  name: string;
  gradeLevel: number;
  academicYear: string;
  schoolName?: string | null;
  homeroomTeacherId?: string | null;
  inviteCode: string;
  studentCount: number;
  isDeleted: boolean;
  createdAt: string;
}

export interface DataConnectStudentRecord {
  id: string;
  classId: string;
  studentCode: string;
  fullName: string;
  dob?: string | null;
  gender: string;
  parentPhone?: string | null;
  isDeleted: boolean;
  createdAt: string;
}

export interface DataConnectAttendanceRecord {
  id: string;
  classId: string;
  studentId: string;
  date: string;
  status: string;
  note?: string | null;
  createdAt: string;
}

export interface DataConnectScoreRecord {
  id: string;
  studentId: string;
  classId: string;
  subject: string;
  scoreType: string;
  scoreValue: number;
  term: number;
  academicYear: string;
  createdAt: string;
}

export interface DataConnectQuizRecord {
  id: string;
  teacherId: string;
  classId: string;
  subject: string;
  title: string;
  questionsJson: string;
  createdAt: string;
}

export interface DataConnectRemarkRecord {
  id: string;
  studentId: string;
  teacherId: string;
  date: string;
  content: string;
  category: string;
  createdAt: string;
}

export interface DataConnectExamReminderRecord {
  id: string;
  classId: string;
  subject: string;
  examDate: string;
  title: string;
  note?: string | null;
  createdAt: string;
}

export interface DataConnectFeeRecord {
  id: string;
  studentId: string;
  title: string;
  amount: number;
  status: string;
  dueDate: string;
  paidAt?: string | null;
  createdAt: string;
}

export interface DataConnectNotificationRecord {
  id: string;
  recipientId: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface DataConnectSchoolRecord {
  id: string;
  code: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  createdAt: string;
}

export interface DataConnectSystemLimitRecord {
  id: string;
  geminiQuotaPerTeacher: number;
  maxQuizQuestions: number;
  maxUploadSizeMb: number;
  maxStudentsPerClass: number;
  maxClassesPerTeacher: number;
  aiModel: string;
  allowSubjectTeacherCreateClass: boolean;
  enableFallbackCache: boolean;
  updatedAt: string;
}

@Injectable()
export class FirebaseDataConnectService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseDataConnectService.name);
  private endpoint: string | null = null;
  private isConfigured: boolean = false;

  // In-memory SQL cache store để hỗ trợ chạy mượt mà ngay cả khi chưa kết nối Cloud SQL thực tế
  private memoryStore: {
    users: Map<string, any>;
    schools: Map<string, any>;
    classes: Map<string, any>;
    students: Map<string, any>;
    attendances: Map<string, any>;
    scores: Map<string, any>;
    quizzes: Map<string, any>;
    remarks: Map<string, any>;
    examReminders: Map<string, any>;
    fees: Map<string, any>;
    notifications: Map<string, any>;
    systemLimits: any | null;
  } = {
    users: new Map(),
    schools: new Map(),
    classes: new Map(),
    students: new Map(),
    attendances: new Map(),
    scores: new Map(),
    quizzes: new Map(),
    remarks: new Map(),
    examReminders: new Map(),
    fees: new Map(),
    notifications: new Map(),
    systemLimits: null,
  };

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    let projectId = this.configService.get<string>('FIREBASE_PROJECT_ID') || 'giaovienhay-511009';
    
    // Tự động đọc project_id chuẩn từ Service Account JSON nếu có
    const serviceAccountJson = this.configService.get<string>('FIREBASE_SERVICE_ACCOUNT_JSON');
    if (serviceAccountJson) {
      try {
        const parsed = JSON.parse(serviceAccountJson);
        if (parsed.project_id) {
          projectId = parsed.project_id;
        }
      } catch (e) {}
    }

    // Nếu cấu hình chỉ là 'giaovienhay', chuẩn hóa về 'giaovienhay-511009'
    if (projectId === 'giaovienhay') {
      projectId = 'giaovienhay-511009';
    }

    const location = this.configService.get<string>('FIREBASE_LOCATION') || 'us-east1';
    const serviceId = 'giaovienhay-511009-service';

    // URL endpoint của Firebase Data Connect (Cloud SQL PostgreSQL)
    this.endpoint = `https://firebasedataconnect.googleapis.com/v1/projects/${projectId}/locations/${location}/services/${serviceId}:executeGraphql`;
    this.isConfigured = true;

    this.logger.log(
      `[Firebase Data Connect] Đã khởi tạo kết nối SQL (Cloud SQL PostgreSQL - Project: ${projectId}, Service: ${serviceId}, Location: ${location})`
    );
  }

  /**
   * Lấy Google Cloud OAuth2 Access Token từ credentials môi trường hoặc firebase-tools CLI
   */
  private async getAccessToken(): Promise<string | null> {
    try {
      // 1. Xác thực bằng Firebase Service Account Key (Dành cho Production / Render / Docker)
      let clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
      let privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY');

      const serviceAccountJson = this.configService.get<string>('FIREBASE_SERVICE_ACCOUNT_JSON');
      if (serviceAccountJson) {
        try {
          const parsed = JSON.parse(serviceAccountJson);
          if (parsed.client_email && parsed.private_key) {
            clientEmail = parsed.client_email;
            privateKey = parsed.private_key;
          }
        } catch (e) {}
      }

      if (privateKey) {
        privateKey = privateKey.trim();
        if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
          privateKey = privateKey.slice(1, -1);
        }
        privateKey = privateKey.replace(/\\n/g, '\n');
      }

      if (clientEmail && privateKey) {
        try {
          const auth = new GoogleAuth({
            credentials: {
              client_email: clientEmail,
              private_key: privateKey,
            },
            scopes: ['https://www.googleapis.com/auth/cloud-platform'],
          });
          const client = await auth.getClient();
          const tokenRes = await client.getAccessToken();
          if (tokenRes.token) {
            return tokenRes.token;
          }
        } catch (e: any) {
          this.logger.error(`[Firebase Data Connect] Lỗi xác thực Service Account: ${e?.message || e}`);
        }
      } else {
        this.logger.warn(`[Firebase Data Connect] Chưa có cấu hình Service Account (clientEmail: ${!!clientEmail}, privateKey: ${!!privateKey})`);
      }

      // 2. Kiểm tra biến môi trường Token trực tiếp
      const envToken = process.env.GOOGLE_OAUTH_ACCESS_TOKEN || process.env.FIREBASE_ACCESS_TOKEN;
      if (envToken) return envToken;

      // 2. Đọc token từ session firebase-tools CLI đã đăng nhập trên máy
      const home = os.homedir();
      const configPath = path.join(home, '.config', 'configstore', 'firebase-tools.json');
      if (fs.existsSync(configPath)) {
        let raw = fs.readFileSync(configPath, 'utf-8');
        let data = JSON.parse(raw);
        let tokens = data?.tokens;
        if (!tokens) return null;

        const isExpired = !tokens.expires_at || Date.now() >= tokens.expires_at - 60000;
        if (!isExpired && tokens.access_token) {
          return tokens.access_token;
        }

        // Tự động kích hoạt firebase-tools CLI để refresh token
        try {
          const { execSync } = require('child_process');
          execSync('npx firebase-tools login:list', { stdio: 'ignore', timeout: 8000 });
          raw = fs.readFileSync(configPath, 'utf-8');
          data = JSON.parse(raw);
          tokens = data?.tokens;
        } catch (_) {}

        return tokens?.access_token || null;
      }
    } catch (e) {
      this.logger.debug(`[Firebase Data Connect] Không đọc được token OAuth: ${e}`);
    }
    return null;
  }


  /**
   * Thực thi câu lệnh truy vấn / mutation GraphQL trên Firebase Data Connect (Cloud SQL PostgreSQL)
   */
  async execute<T = any>(query: string, variables: Record<string, any> = {}): Promise<{ data?: T; errors?: any[] }> {
    try {
      const apiKey = this.configService.get<string>('FIREBASE_API_KEY');
      if (!this.endpoint) {
        return { data: undefined };
      }

      const accessToken = await this.getAccessToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const url = apiKey ? `${this.endpoint}?key=${apiKey}` : this.endpoint;
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query,
          variables,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.warn(`[Firebase Data Connect] Phản hồi lỗi SQL: ${errorText}`);
        return { errors: [{ message: errorText }] };
      }

      const json = await response.json();
      return json;
    } catch (error: any) {
      this.logger.warn(`[Firebase Data Connect] Ngoại lệ kết nối SQL: ${error?.message || error}`);
      return { errors: [{ message: error?.message || 'Lỗi kết nối Data Connect' }] };
    }
  }

  get configured(): boolean {
    return this.isConfigured;
  }

  // =========================================================================
  // 1. USER SQL METHODS
  // =========================================================================

  async listUsers(filter?: { role?: string; isActive?: boolean; keyword?: string }) {
    const whereFields = ['isDeleted: { eq: false }'];
    const variableDefinitions: string[] = [];
    const variables: Record<string, unknown> = {};
    if (filter?.role && filter.role !== 'ALL') {
      whereFields.push('role: { eq: $role }');
      variableDefinitions.push('$role: String');
      variables.role = filter.role;
    }
    if (filter?.isActive !== undefined) {
      whereFields.push('isActive: { eq: $isActive }');
      variableDefinitions.push('$isActive: Boolean');
      variables.isActive = filter.isActive;
    }
    const query = `
      query ListUsers${variableDefinitions.length ? `(${variableDefinitions.join(', ')})` : ''} {
        users(
          where: {
            ${whereFields.join('\n            ')}
          }
          orderBy: [{ createdAt: DESC }]
        ) {
          id code fullName phone email role schoolName assignedInfo isActive aiDailyQuota aiUsedToday aiModelTier createdAt
        }
      }
    `;

    const res = await this.execute<{ users: any[] }>(query, {
      ...variables,
    });

    if (res.data?.users && res.data.users.length > 0) {
      return res.data.users;
    }

    // Fallback qua cache bộ nhớ SQL
    let list = Array.from(this.memoryStore.users.values()).filter((u) => !u.is_deleted);
    if (filter?.role && filter.role !== 'ALL') {
      list = list.filter((u) => u.role === filter.role);
    }
    if (filter?.isActive !== undefined) {
      list = list.filter((u) => u.is_active === filter.isActive);
    }
    if (filter?.keyword) {
      const kw = filter.keyword.toLowerCase();
      list = list.filter(
        (u) =>
          (u.full_name || '').toLowerCase().includes(kw) ||
          (u.phone || '').includes(kw) ||
          (u.email || '').toLowerCase().includes(kw)
      );
    }
    return list;
  }

  async getUserById(id: string) {
    const query = `
      query GetUserById($id: String!) {
        user(id: $id) {
          id code fullName phone email role schoolName assignedInfo isActive isDeleted aiDailyQuota aiUsedToday aiModelTier createdAt
        }
      }
    `;
    const res = await this.execute<{ user: any }>(query, { id });
    if (res.data?.user) return res.data.user;
    return this.memoryStore.users.get(id) || null;
  }

  async getUserByPhone(phone: string) {
    const query = `
      query GetUserByPhone($phone: String!) {
        users(where: { phone: { eq: $phone }, isDeleted: { eq: false } }, limit: 1) {
          id code fullName phone email role schoolName assignedInfo isActive aiDailyQuota aiUsedToday aiModelTier createdAt
        }
      }
    `;
    const res = await this.execute<{ users: any[] }>(query, { phone });
    if (res.data?.users && res.data.users.length > 0) {
      return res.data.users[0];
    }
    return Array.from(this.memoryStore.users.values()).find((u) => u.phone === phone && !u.is_deleted) || null;
  }

  async createUser(user: any) {
    const mutation = `
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

    await this.execute(mutation, {
      id: user.id,
      code: user.code,
      fullName: user.full_name || user.fullName,
      phone: user.phone,
      email: user.email || null,
      role: user.role,
      schoolName: user.school_name || user.schoolName || null,
      assignedInfo: user.assigned_info || user.assignedInfo || null,
      aiDailyQuota: user.ai_daily_quota ?? user.aiDailyQuota ?? 25,
      aiModelTier: user.ai_model_tier || user.aiModelTier || 'AUTO',
    });

    this.memoryStore.users.set(user.id, user);
    return user;
  }

  async updateUserStatus(id: string, isActive: boolean, reason?: string) {
    const mutation = `
      mutation UpdateUserStatus($id: String!, $isActive: Boolean!) {
        user_update(id: $id, data: { isActive: $isActive })
      }
    `;
    await this.execute(mutation, { id, isActive });
    const existing = this.memoryStore.users.get(id);
    if (existing) {
      existing.is_active = isActive;
      if (reason) existing.status_reason = reason;
      this.memoryStore.users.set(id, existing);
    }
    return true;
  }

  async updateUserProfile(id: string, user: {
    full_name?: string;
    phone?: string;
    email?: string;
    role?: string;
    school_name?: string;
  }) {
    const mutation = `
      mutation UpdateAdminUser(
        $id: String!
        $fullName: String
        $phone: String
        $email: String
        $role: String
        $schoolName: String
      ) {
        user_update(
          id: $id
          data: {
            fullName: $fullName
            phone: $phone
            email: $email
            role: $role
            schoolName: $schoolName
          }
        )
      }
    `;
    await this.execute(mutation, {
      id,
      fullName: user.full_name,
      phone: user.phone,
      email: user.email ?? null,
      role: user.role,
      schoolName: user.school_name ?? null,
    });

    const existing = this.memoryStore.users.get(id);
    if (existing) {
      if (user.full_name !== undefined) {
        existing.full_name = user.full_name;
        existing.fullName = user.full_name;
      }
      if (user.phone !== undefined) existing.phone = user.phone;
      if (user.email !== undefined) existing.email = user.email || null;
      if (user.role !== undefined) existing.role = user.role;
      if (user.school_name !== undefined) {
        existing.school_name = user.school_name;
        existing.schoolName = user.school_name;
      }
      this.memoryStore.users.set(id, existing);
      return existing;
    }

    return { id, ...user };
  }

  async updateTeacherAiQuota(id: string, quota: number, tier: string = 'AUTO', usedToday?: number) {
    const usedTodayInput = usedToday === undefined ? '' : 'aiUsedToday: $aiUsedToday';
    const usedTodayVariable = usedToday === undefined ? '' : ', $aiUsedToday: Int';
    const mutation = `
      mutation UpdateTeacherAiQuota($id: String!, $aiDailyQuota: Int!, $aiModelTier: String${usedTodayVariable}) {
        user_update(
          id: $id
          data: {
            aiDailyQuota: $aiDailyQuota
            aiModelTier: $aiModelTier
            ${usedTodayInput}
          }
        )
      }
    `;
    await this.execute(mutation, {
      id,
      aiDailyQuota: quota,
      aiModelTier: tier,
      ...(usedToday !== undefined ? { aiUsedToday: usedToday } : {}),
    });

    const existing = this.memoryStore.users.get(id);
    if (existing) {
      existing.ai_daily_quota = quota;
      existing.ai_model_tier = tier;
      if (usedToday !== undefined) existing.ai_used_today = usedToday;
      this.memoryStore.users.set(id, existing);
    }
    return true;
  }

  async softDeleteUser(id: string) {
    const mutation = `
      mutation SoftDeleteUser($id: String!) {
        user_update(id: $id, data: { isDeleted: true })
      }
    `;
    await this.execute(mutation, { id });
    const existing = this.memoryStore.users.get(id);
    if (existing) {
      existing.is_deleted = true;
      this.memoryStore.users.set(id, existing);
    }
    return true;
  }

  // =========================================================================
  // 2. SCHOOL SQL METHODS
  // =========================================================================

  async listSchools() {
    const query = `
      query ListSchools {
        schools(orderBy: [{ name: ASC }]) {
          id code name address phone email createdAt
        }
      }
    `;
    const res = await this.execute<{ schools: any[] }>(query);
    if (res.data?.schools && res.data.schools.length > 0) return res.data.schools;
    return Array.from(this.memoryStore.schools.values());
  }

  async createSchool(school: any) {
    const mutation = `
      mutation CreateSchool($id: String!, $code: String!, $name: String!, $address: String, $phone: String, $email: String) {
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
    await this.execute(mutation, school);
    this.memoryStore.schools.set(school.id, school);
    return school;
  }

  // =========================================================================
  // 3. CLASS SQL METHODS
  // =========================================================================

  async listClasses(schoolName?: string) {
    const query = `
      query ListClasses($schoolName: String) {
        classes(where: { schoolName: { eq: $schoolName }, isDeleted: { eq: false } }, orderBy: [{ gradeLevel: ASC }]) {
          id name gradeLevel academicYear schoolName homeroomTeacherId inviteCode studentCount createdAt
        }
      }
    `;
    const res = await this.execute<{ classes: any[] }>(query, { schoolName });
    if (res.data?.classes && res.data.classes.length > 0) return res.data.classes;
    let list = Array.from(this.memoryStore.classes.values()).filter((c) => !c.is_deleted);
    if (schoolName) list = list.filter((c) => c.school_name === schoolName);
    return list;
  }

  async listClassesByTeacher(teacherId: string) {
    const query = `
      query ListClassesByTeacher($teacherId: String!) {
        classes(where: { homeroomTeacherId: { eq: $teacherId }, isDeleted: { eq: false } }, orderBy: [{ gradeLevel: ASC }]) {
          id name gradeLevel academicYear schoolName homeroomTeacherId inviteCode studentCount createdAt
        }
      }
    `;
    const res = await this.execute<{ classes: any[] }>(query, { teacherId });
    if (res.data?.classes && res.data.classes.length > 0) return res.data.classes;
    return Array.from(this.memoryStore.classes.values()).filter(
      (c) => c.homeroom_teacher_id === teacherId && !c.is_deleted
    );
  }

  async getClassById(id: string) {
    const query = `
      query GetClassById($id: String!) {
        class(id: $id) {
          id name gradeLevel academicYear schoolName homeroomTeacherId inviteCode studentCount createdAt
        }
      }
    `;
    const res = await this.execute<{ class: any }>(query, { id });
    if (res.data?.class) return res.data.class;
    return this.memoryStore.classes.get(id) || null;
  }

  async createClass(classData: any) {
    const mutation = `
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
    await this.execute(mutation, {
      id: classData.id,
      name: classData.name,
      gradeLevel: classData.grade_level || classData.gradeLevel,
      academicYear: classData.academic_year || classData.academicYear,
      schoolName: classData.school_name || classData.schoolName || null,
      homeroomTeacherId: classData.homeroom_teacher_id || classData.homeroomTeacherId || null,
      inviteCode: classData.invite_code || classData.inviteCode,
      studentCount: classData.student_count || classData.studentCount || 0,
    });

    this.memoryStore.classes.set(classData.id, classData);
    return classData;
  }

  async softDeleteClass(id: string) {
    const mutation = `
      mutation SoftDeleteClass($id: String!) {
        class_update(id: $id, data: { isDeleted: true })
      }
    `;
    await this.execute(mutation, { id });
    const existing = this.memoryStore.classes.get(id);
    if (existing) {
      existing.is_deleted = true;
      this.memoryStore.classes.set(id, existing);
    }
    return true;
  }

  // =========================================================================
  // 4. STUDENT SQL METHODS
  // =========================================================================

  async listStudentsByClass(classId: string) {
    const query = `
      query ListStudentsByClass($classId: String!) {
        students(where: { classId: { eq: $classId }, isDeleted: { eq: false } }, orderBy: [{ fullName: ASC }]) {
          id classId studentCode fullName dob gender parentPhone createdAt
        }
      }
    `;
    const res = await this.execute<{ students: any[] }>(query, { classId });
    if (res.data?.students && res.data.students.length > 0) return res.data.students;
    return Array.from(this.memoryStore.students.values()).filter(
      (s) => s.class_id === classId && !s.is_deleted
    );
  }

  async getStudentById(id: string) {
    const query = `
      query GetStudentById($id: String!) {
        student(id: $id) {
          id classId studentCode fullName dob gender parentPhone createdAt
        }
      }
    `;
    const res = await this.execute<{ student: any }>(query, { id });
    if (res.data?.student) return res.data.student;
    return this.memoryStore.students.get(id) || null;
  }

  async createStudent(student: any) {
    const mutation = `
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
    await this.execute(mutation, {
      id: student.id,
      classId: student.class_id || student.classId,
      studentCode: student.student_code || student.studentCode,
      fullName: student.full_name || student.fullName,
      dob: student.dob || null,
      gender: student.gender,
      parentPhone: student.parent_phone || student.parentPhone || null,
    });
    this.memoryStore.students.set(student.id, student);
    return student;
  }

  async softDeleteStudent(id: string) {
    const mutation = `
      mutation SoftDeleteStudent($id: String!) {
        student_update(id: $id, data: { isDeleted: true })
      }
    `;
    await this.execute(mutation, { id });
    const existing = this.memoryStore.students.get(id);
    if (existing) {
      existing.is_deleted = true;
      this.memoryStore.students.set(id, existing);
    }
    return true;
  }

  // =========================================================================
  // 5. ATTENDANCE SQL METHODS
  // =========================================================================

  async getAttendanceByClassDate(classId: string, date: string) {
    const query = `
      query GetAttendanceByClassDate($classId: String!, $date: String!) {
        attendances(where: { classId: { eq: $classId }, date: { eq: $date } }) {
          id classId studentId date status note createdAt
        }
      }
    `;
    const res = await this.execute<{ attendances: any[] }>(query, { classId, date });
    if (res.data?.attendances && res.data.attendances.length > 0) return res.data.attendances;
    return Array.from(this.memoryStore.attendances.values()).filter(
      (a) => a.class_id === classId && a.date === date
    );
  }

  async getAttendanceByStudent(studentId: string) {
    const query = `
      query GetAttendanceByStudent($studentId: String!) {
        attendances(where: { studentId: { eq: $studentId } }, orderBy: [{ date: DESC }]) {
          id classId studentId date status note createdAt
        }
      }
    `;
    const res = await this.execute<{ attendances: any[] }>(query, { studentId });
    if (res.data?.attendances && res.data.attendances.length > 0) return res.data.attendances;
    return Array.from(this.memoryStore.attendances.values()).filter(
      (a) => a.student_id === studentId || a.studentId === studentId
    );
  }

  async recordAttendance(attendance: any) {
    const mutation = `
      mutation RecordAttendance(
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
    await this.execute(mutation, {
      id: attendance.id,
      classId: attendance.class_id || attendance.classId,
      studentId: attendance.student_id || attendance.studentId,
      date: attendance.date,
      status: attendance.status,
      note: attendance.note || null,
    });
    this.memoryStore.attendances.set(attendance.id, attendance);
    return attendance;
  }

  // =========================================================================
  // 6. SCORE SQL METHODS
  // =========================================================================

  async getScoresByStudent(studentId: string, term?: number, academicYear?: string) {
    const query = `
      query GetScoresByStudent($studentId: String!, $term: Int, $academicYear: String) {
        scores(
          where: {
            studentId: { eq: $studentId }
            term: { eq: $term }
            academicYear: { eq: $academicYear }
          }
          orderBy: [{ createdAt: DESC }]
        ) {
          id studentId classId subject scoreType scoreValue term academicYear createdAt
        }
      }
    `;
    const res = await this.execute<{ scores: any[] }>(query, { studentId, term, academicYear });
    if (res.data?.scores && res.data.scores.length > 0) return res.data.scores;
    return Array.from(this.memoryStore.scores.values()).filter(
      (s) => s.student_id === studentId && (!term || s.term === term)
    );
  }

  async recordScore(score: any) {
    const mutation = `
      mutation RecordScore(
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
    await this.execute(mutation, {
      id: score.id,
      studentId: score.student_id || score.studentId,
      classId: score.class_id || score.classId,
      subject: score.subject,
      scoreType: score.score_type || score.scoreType,
      scoreValue: score.score_value || score.scoreValue,
      term: score.term,
      academicYear: score.academic_year || score.academicYear,
    });
    this.memoryStore.scores.set(score.id, score);
    return score;
  }

  // =========================================================================
  // 7. QUIZ SQL METHODS
  // =========================================================================

  async getQuizById(id: string) {
    const query = `
      query GetQuizById($id: String!) {
        quiz(id: $id) {
          id teacherId classId subject title questionsJson createdAt
        }
      }
    `;
    const res = await this.execute<{ quiz: any }>(query, { id });
    if (res.data?.quiz) return res.data.quiz;
    return this.memoryStore.quizzes.get(id) || null;
  }

  async createQuiz(quiz: any) {
    const mutation = `
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
    await this.execute(mutation, {
      id: quiz.id,
      teacherId: quiz.teacher_id || quiz.teacherId,
      classId: quiz.class_id || quiz.classId,
      subject: quiz.subject,
      title: quiz.title,
      questionsJson: typeof quiz.questions === 'string' ? quiz.questions : JSON.stringify(quiz.questions || []),
    });
    this.memoryStore.quizzes.set(quiz.id, quiz);
    return quiz;
  }

  // =========================================================================
  // 8. REMARK SQL METHODS
  // =========================================================================

  async getRemarksByStudent(studentId: string) {
    const query = `
      query ListRemarksByStudent($studentId: String!) {
        remarks(where: { studentId: { eq: $studentId } }, orderBy: [{ date: DESC }]) {
          id studentId teacherId date content category createdAt
        }
      }
    `;
    const res = await this.execute<{ remarks: any[] }>(query, { studentId });
    if (res.data?.remarks && res.data.remarks.length > 0) return res.data.remarks;
    return Array.from(this.memoryStore.remarks.values()).filter((r) => r.student_id === studentId);
  }

  async createRemark(remark: any) {
    const mutation = `
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
    await this.execute(mutation, {
      id: remark.id,
      studentId: remark.student_id || remark.studentId,
      teacherId: remark.teacher_id || remark.teacherId,
      date: remark.date,
      content: remark.content,
      category: remark.category,
    });
    this.memoryStore.remarks.set(remark.id, remark);
    return remark;
  }

  // =========================================================================
  // 9. EXAM REMINDER SQL METHODS
  // =========================================================================

  async getExamRemindersByClass(classId: string) {
    const query = `
      query ListExamRemindersByClass($classId: String!) {
        examReminders(where: { classId: { eq: $classId } }, orderBy: [{ examDate: ASC }]) {
          id classId subject examDate title note createdAt
        }
      }
    `;
    const res = await this.execute<{ examReminders: any[] }>(query, { classId });
    if (res.data?.examReminders && res.data.examReminders.length > 0) return res.data.examReminders;
    return Array.from(this.memoryStore.examReminders.values()).filter((e) => e.class_id === classId);
  }

  async createExamReminder(reminder: any) {
    const mutation = `
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
    await this.execute(mutation, {
      id: reminder.id,
      classId: reminder.class_id || reminder.classId,
      subject: reminder.subject,
      examDate: reminder.exam_date || reminder.examDate,
      title: reminder.title,
      note: reminder.note || null,
    });
    this.memoryStore.examReminders.set(reminder.id, reminder);
    return reminder;
  }

  // =========================================================================
  // 10. FEE SQL METHODS
  // =========================================================================

  async getFeesByStudent(studentId: string) {
    const query = `
      query ListFeesByStudent($studentId: String!) {
        fees(where: { studentId: { eq: $studentId } }, orderBy: [{ dueDate: DESC }]) {
          id studentId title amount status dueDate paidAt createdAt
        }
      }
    `;
    const res = await this.execute<{ fees: any[] }>(query, { studentId });
    if (res.data?.fees && res.data.fees.length > 0) return res.data.fees;
    return Array.from(this.memoryStore.fees.values()).filter((f) => f.student_id === studentId);
  }

  async createFee(fee: any) {
    const mutation = `
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
    await this.execute(mutation, {
      id: fee.id,
      studentId: fee.student_id || fee.studentId,
      title: fee.title,
      amount: fee.amount,
      status: fee.status,
      dueDate: fee.due_date || fee.dueDate,
    });
    this.memoryStore.fees.set(fee.id, fee);
    return fee;
  }

  async updateFeeStatus(id: string, status: string) {
    const mutation = `
      mutation UpdateFeeStatus($id: String!, $status: String!) {
        fee_update(id: $id, data: { status: $status })
      }
    `;
    await this.execute(mutation, { id, status });
    const existing = this.memoryStore.fees.get(id);
    if (existing) {
      existing.status = status;
      this.memoryStore.fees.set(id, existing);
    }
    return true;
  }

  // =========================================================================
  // 11. NOTIFICATION SQL METHODS
  // =========================================================================

  async getNotificationsByRecipient(recipientId: string) {
    const query = `
      query ListNotificationsByRecipient($recipientId: String!) {
        notifications(where: { recipientId: { eq: $recipientId } }, orderBy: [{ createdAt: DESC }]) {
          id recipientId title body type isRead createdAt
        }
      }
    `;
    const res = await this.execute<{ notifications: any[] }>(query, { recipientId });
    if (res.data?.notifications && res.data.notifications.length > 0) return res.data.notifications;
    return Array.from(this.memoryStore.notifications.values()).filter((n) => n.recipient_id === recipientId);
  }

  async createNotification(notif: any) {
    const mutation = `
      mutation CreateNotification(
        $id: String!
        $recipientId: String!
        $title: String!
        $body: String!
        $type: String!
      ) {
        notification_insert(
          data: {
            id: $id
            recipientId: $recipientId
            title: $title
            body: $body
            type: $type
            isRead: false
          }
        )
      }
    `;
    await this.execute(mutation, {
      id: notif.id,
      recipientId: notif.recipient_id || notif.recipientId,
      title: notif.title,
      body: notif.body,
      type: notif.type,
    });
    this.memoryStore.notifications.set(notif.id, notif);
    return notif;
  }

  async markNotificationRead(id: string) {
    const mutation = `
      mutation MarkNotificationRead($id: String!) {
        notification_update(id: $id, data: { isRead: true })
      }
    `;
    await this.execute(mutation, { id });
    const existing = this.memoryStore.notifications.get(id);
    if (existing) {
      existing.is_read = true;
      this.memoryStore.notifications.set(id, existing);
    }
    return true;
  }

  // =========================================================================
  // 12. SYSTEM LIMITS SQL METHODS
  // =========================================================================

  async getSystemLimits() {
    const query = `
      query GetSystemLimits {
        systemLimits(limit: 1) {
          id geminiQuotaPerTeacher maxQuizQuestions maxUploadSizeMb maxStudentsPerClass maxClassesPerTeacher aiModel allowSubjectTeacherCreateClass enableFallbackCache updatedAt
        }
      }
    `;
    const res = await this.execute<{ systemLimits: any[] }>(query);
    if (res.data?.systemLimits && res.data.systemLimits.length > 0) {
      return res.data.systemLimits[0];
    }
    return this.memoryStore.systemLimits || {
      id: 'sys_limits_default',
      geminiQuotaPerTeacher: 25,
      maxQuizQuestions: 20,
      maxUploadSizeMb: 15,
      maxStudentsPerClass: 55,
      maxClassesPerTeacher: 5,
      aiModel: 'gemini-1.5-flash',
      allowSubjectTeacherCreateClass: true,
      enableFallbackCache: true,
    };
  }

  async upsertSystemLimits(limits: any) {
    const mutation = `
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
    await this.execute(mutation, {
      id: limits.id || 'sys_limits_default',
      geminiQuotaPerTeacher: limits.geminiQuotaPerTeacher ?? 25,
      maxQuizQuestions: limits.maxQuizQuestions ?? 20,
      maxUploadSizeMb: limits.maxUploadSizeMb ?? 15,
      maxStudentsPerClass: limits.maxStudentsPerClass ?? 55,
      maxClassesPerTeacher: limits.maxClassesPerTeacher ?? 5,
      aiModel: limits.aiModel || 'gemini-1.5-flash',
      allowSubjectTeacherCreateClass: limits.allowSubjectTeacherCreateClass ?? true,
      enableFallbackCache: limits.enableFallbackCache ?? true,
    });
    this.memoryStore.systemLimits = { ...limits, id: limits.id || 'sys_limits_default' };
    return this.memoryStore.systemLimits;
  }
}
