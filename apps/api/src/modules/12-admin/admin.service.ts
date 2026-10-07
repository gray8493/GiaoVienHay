import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../../common/firebase/firebase.service';
import {
  AdminCreateUserDto,
  UpdateUserStatusDto,
  QueryAdminUsersDto,
  UpdateSystemLimitsDto,
  AdminCreateClassDto,
  QueryLogsDto,
  AdminCreateSchoolDto,
  AdminUpdateSchoolDto,
} from './dto/admin.dto';
import { UserRole } from '@giaovienhay/shared-types';
import {
  getAppFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  updateDoc,
} from '../../common/firebase/firestore-client';

@Injectable()
export class AdminService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async getAllUsers(query: QueryAdminUsersDto) {
    try {
      const db = getAppFirestore();
      const snap = await getDocs(collection(db, 'users'));
      let users: any[] = [];
      snap.forEach((d) => {
        const data = d.data();
        if (!data.is_deleted) {
          users.push({ id: d.id, ...data });
        }
      });

      if (query.role && (query.role as string) !== 'ALL') {
        users = users.filter((u) => u.role === query.role);
      }
      if (query.keyword) {
        const kw = query.keyword.toLowerCase();
        users = users.filter(
          (u) =>
            (u.full_name || '').toLowerCase().includes(kw) ||
            (u.phone || '').includes(kw) ||
            (u.email || '').toLowerCase().includes(kw)
        );
      }

      return {
        total: users.length,
        page: query.page || 1,
        limit: query.limit || 20,
        items: users,
      };
    } catch (e) {
      return {
        total: 0,
        page: 1,
        limit: 20,
        items: [],
      };
    }
  }

  async createUser(dto: AdminCreateUserDto) {
    const userId = 'usr_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
    const rolePrefix = dto.role?.includes('TEACHER') ? 'GV-' : dto.role === 'PARENT' ? 'PH-' : 'USR-';
    const newUser = {
      id: userId,
      code: rolePrefix + Math.floor(1000 + Math.random() * 9000),
      full_name: dto.full_name,
      phone: dto.phone,
      email: dto.email || null,
      role: dto.role,
      school_name: dto.school_name || null,
      assigned_info: dto.role?.includes('TEACHER') ? 'Chưa phân công' : null,
      is_active: true,
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      const db = getAppFirestore();
      await setDoc(doc(db, 'users', userId), newUser);
    } catch (e) {}

    await this.recordActivity({
      category: 'SYSTEM_ADMIN',
      categoryLabel: 'Quản trị Người dùng',
      action: `Thêm tài khoản mới: ${dto.full_name} (${dto.phone})`,
      target: dto.school_name || 'Hệ thống GiaoVienHay',
      details: `Vai trò: ${dto.role}. Kích hoạt thành công.`,
      status: 'SUCCESS',
      statusLabel: 'Hoàn tất',
      metadata: { user_id: userId, role: dto.role },
    });

    return newUser;
  }

  async updateUserStatus(userId: string, dto: UpdateUserStatusDto) {
    try {
      const db = getAppFirestore();
      await updateDoc(doc(db, 'users', userId), {
        is_active: dto.is_active,
        status_reason: dto.reason || null,
        status_updated_at: new Date().toISOString(),
      });
    } catch (e) {}

    await this.recordActivity({
      category: 'SYSTEM_ADMIN',
      categoryLabel: 'Quản trị Người dùng',
      action: dto.is_active ? `Kích hoạt lại tài khoản: ${userId}` : `Khóa tài khoản: ${userId}`,
      target: 'Tài khoản người dùng',
      details: dto.reason ? `Lý do: ${dto.reason}` : (dto.is_active ? 'Kích hoạt lại' : 'Tạm dừng hoạt động'),
      status: 'SUCCESS',
      statusLabel: 'Hoàn tất',
      metadata: { user_id: userId, is_active: dto.is_active },
    });

    return {
      user_id: userId,
      is_active: dto.is_active,
      message: dto.is_active ? 'Đã kích hoạt lại tài khoản' : 'Đã khóa tài khoản người dùng',
    };
  }

  async getAllClassesMonitoring() {
    try {
      const db = getAppFirestore();
      const snap = await getDocs(collection(db, 'classes'));
      const items: any[] = [];
      snap.forEach((d) => {
        const data = d.data();
        if (!data.is_deleted) {
          items.push({ class_id: d.id, ...data });
        }
      });
      return items;
    } catch (e) {
      return [];
    }
  }

  async createClass(dto: AdminCreateClassDto) {
    const classId = 'cls_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
    const newClass = {
      class_id: classId,
      name: dto.name,
      grade_level: dto.grade_level,
      homeroom_teacher: dto.homeroom_teacher || 'Chưa phân công',
      student_count: 0,
      academic_year: dto.academic_year,
      school_name: dto.school_name || 'Nhà trường',
      is_deleted: false,
      deleted_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      const db = getAppFirestore();
      await setDoc(doc(db, 'classes', classId), newClass);
    } catch (e) {}

    this.recordActivity({
      category: 'CLASS_STUDENT',
      categoryLabel: 'Lớp học & Học sinh',
      action: `Admin tạo Lớp học mới: ${dto.name} (Khối ${dto.grade_level})`,
      target: `${dto.school_name || 'Nhà trường'} - Niên khóa ${dto.academic_year}`,
      details: `GVCN: ${newClass.homeroom_teacher}. Sẵn sàng tiếp nhận học sinh và kết nối phụ huynh.`,
      status: 'SUCCESS',
      statusLabel: 'Hoàn tất',
      metadata: {
        class_id: classId,
        academic_year: dto.academic_year,
      },
    });

    return newClass;
  }

  private defaultSystemLimits = {
    gemini_ai_daily_quota_per_teacher: 25,
    max_quiz_questions_per_gen: 20,
    max_upload_size_mb: 15,
    max_students_per_class: 55,
    max_classes_per_teacher: 5,
    ai_model: 'gemini-1.5-flash',
    allow_subject_teacher_create_class: true,
    enable_fallback_cache: true,
    fcm_rate_limit_per_minute: 100,
  };

  async getSystemLimits() {
    try {
      const db = getAppFirestore();
      const snap = await getDoc(doc(db, 'system_configs', 'limits'));
      if (snap.exists()) {
        return { ...this.defaultSystemLimits, ...snap.data() };
      }
    } catch (e) {}
    return this.defaultSystemLimits;
  }

  async updateSystemLimits(dto: UpdateSystemLimitsDto) {
    const current = await this.getSystemLimits();
    const limits = { ...current, ...dto };
    try {
      const db = getAppFirestore();
      await setDoc(doc(db, 'system_configs', 'limits'), limits, { merge: true });
    } catch (e) {}

    await this.recordActivity({
      category: 'SYSTEM_ADMIN',
      categoryLabel: 'Quản trị Nền tảng',
      action: 'Cập nhật cấu hình Giới hạn Hệ thống & AI Quota',
      target: 'Cấu hình toàn hệ thống',
      details: `Model: ${limits.ai_model}, Quota giáo viên: ${limits.gemini_ai_daily_quota_per_teacher}/ngày`,
      status: 'SUCCESS',
      statusLabel: 'Hoàn tất',
    });

    return {
      message: 'Đã lưu thành công cấu hình hạn mức tài nguyên & AI',
      data: limits,
    };
  }

  async getDashboardStats() {
    let totalUsers = 0;
    let totalTeachers = 0;
    let totalParents = 0;
    let activeUsers = 0;

    try {
      const db = getAppFirestore();
      const userSnap = await getDocs(collection(db, 'users'));
      totalUsers = userSnap.size;
      userSnap.forEach((d) => {
        const data = d.data();
        if (data.is_active !== false) activeUsers++;
        const role = data.role || '';
        if (role.includes('TEACHER') || role === 'ADMIN') totalTeachers++;
        if (role === 'PARENT') totalParents++;
      });
    } catch (e) {}

    const schools = await this.getSchools();
    const monitoringClasses = await this.getAllClassesMonitoring();
    const totalSchools = schools.length;
    const totalClasses = monitoringClasses.length;
    const totalStudents = monitoringClasses.reduce((sum, c) => sum + (c.student_count || 0), 0);

    const limits = await this.getSystemLimits();
    const activityLogs = await this.getActivityLogs({ limit: 100 });
    const aiCallsCount = activityLogs.filter((a) => a.category === 'AI_QUIZ').length;

    return {
      kpi: {
        total_users: {
          value: totalUsers,
          teachers_count: totalTeachers,
          parents_count: totalParents,
          active_count: activeUsers,
          growth_rate: totalUsers > 0 ? '+100%' : '0%',
          comparison_period: 'Tài khoản trên hệ thống',
        },
        active_classes: {
          value: totalClasses,
          total_students: totalStudents,
          schools_count: totalSchools,
          growth_rate: totalClasses > 0 ? '+100%' : '0%',
          comparison_period: totalSchools > 0 ? `Thuộc ${totalSchools} trường liên kết` : 'Chưa có trường liên kết',
        },
        gemini_ai_calls: {
          value: aiCallsCount,
          daily_quota: totalTeachers > 0 ? totalTeachers * limits.gemini_ai_daily_quota_per_teacher : 5000,
          used_percent: totalTeachers > 0 ? Math.round((aiCallsCount / (totalTeachers * limits.gemini_ai_daily_quota_per_teacher)) * 100) : 0,
          growth_rate: '0%',
          model: limits.ai_model,
          comparison_period: 'Giáo án & trích xuất đề thi',
        },
        tuition_revenue: {
          collected_vnd: 0,
          target_vnd: 0,
          paid_rate: 0,
          growth_rate: '0%',
          comparison_period: 'Chưa phát sinh học phí',
        },
        attendance_today: {
          present_rate: totalStudents > 0 ? 100 : 0,
          absent_count: 0,
          total_checked: totalStudents,
          comparison_period: 'Toàn trường hôm nay',
        },
      },
      charts: {
        ai_weekly: [
          { day: 'T2', calls: 0 },
          { day: 'T3', calls: 0 },
          { day: 'T4', calls: 0 },
          { day: 'T5', calls: 0 },
          { day: 'T6', calls: 0 },
          { day: 'T7', calls: 0 },
          { day: 'CN', calls: 0 },
        ],
        tuition_progress: [],
      },
      system_health: {
        status: 'UP',
        uptime_seconds: Math.round(process.uptime()),
        memory_rss_mb: Math.round(process.memoryUsage().rss / (1024 * 1024)),
        memory_heap_mb: Math.round(process.memoryUsage().heapUsed / (1024 * 1024)),
        firebase_connected: true,
        fcm_rate_limit: limits.fcm_rate_limit_per_minute,
        timestamp: new Date().toISOString(),
      },
    };
  }

  async recordActivity(item: Partial<any>) {
    const actId = 'ACT-' + Math.floor(77400 + Math.random() * 900);
    const newAct = {
      id: actId,
      time: 'Vừa xong',
      timestampISO: new Date().toISOString(),
      status: 'SUCCESS',
      statusLabel: 'Hoàn tất',
      ...item,
    };
    try {
      const db = getAppFirestore();
      await setDoc(doc(db, 'activity_logs', actId), newAct);
    } catch (e) {}
    return newAct;
  }

  async getActivityLogs(query: QueryLogsDto) {
    try {
      const db = getAppFirestore();
      const snap = await getDocs(collection(db, 'activity_logs'));
      let items: any[] = [];
      snap.forEach((d) => {
        items.push({ id: d.id, ...d.data() });
      });

      items.sort((a, b) => new Date(b.timestampISO || 0).getTime() - new Date(a.timestampISO || 0).getTime());

      if (query.category && query.category !== 'ALL') {
        items = items.filter((a) => a.category === query.category);
      }
      if (query.status && query.status !== 'ALL') {
        items = items.filter((a) => a.status === query.status);
      }
      const limit = query.limit || 50;
      return items.slice(0, limit);
    } catch (e) {
      return [];
    }
  }

  async getTransactionLogs(query: QueryLogsDto) {
    try {
      const db = getAppFirestore();
      const snap = await getDocs(collection(db, 'transactions'));
      let items: any[] = [];
      snap.forEach((d) => {
        items.push({ id: d.id, ...d.data() });
      });

      items.sort((a, b) => new Date(b.timestampISO || 0).getTime() - new Date(a.timestampISO || 0).getTime());

      if (query.type && query.type !== 'ALL') {
        items = items.filter((t) => t.type === query.type);
      }
      if (query.status && query.status !== 'ALL') {
        items = items.filter((t) => t.status === query.status);
      }
      const limit = query.limit || 50;
      return items.slice(0, limit);
    } catch (e) {
      return [];
    }
  }

  async getSchools() {
    try {
      const db = getAppFirestore();
      const snap = await getDocs(collection(db, 'schools'));
      const items: any[] = [];
      snap.forEach((d) => {
        const data = d.data();
        if (!data.is_deleted) {
          items.push({ id: d.id, ...data });
        }
      });
      return items;
    } catch (e) {
      return [];
    }
  }

  async createSchool(dto: AdminCreateSchoolDto) {
    const schoolId = 'TR-' + Math.floor(100 + Math.random() * 900);
    const newSchool = {
      id: schoolId,
      name: dto.name,
      type: dto.type,
      typeLabel:
        dto.typeLabel ||
        (dto.type === 'SECONDARY'
          ? 'Cấp 2 THCS'
          : dto.type === 'PRIMARY'
          ? 'Cấp 1 Tiểu học'
          : 'Cấp 3 THPT'),
      district: dto.district || 'Chưa cập nhật',
      city: dto.city || 'TP. Hà Nội',
      grades:
        dto.grades ||
        (dto.type === 'SECONDARY' ? [6, 7, 8, 9] : [1, 2, 3, 4, 5]),
      isNationalStandard: !!dto.isNationalStandard,
      totalClasses: 0,
      totalStudents: 0,
      appLinkedPercent: 0,
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const db = getAppFirestore();
    await setDoc(doc(db, 'schools', schoolId), newSchool);
    return newSchool;
  }

  async updateSchool(id: string, dto: AdminUpdateSchoolDto) {
    const db = getAppFirestore();
    const docRef = doc(db, 'schools', id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      throw new NotFoundException(`Không tìm thấy trường học với ID ${id}`);
    }

    const current = snap.data();
    const updatePayload: any = {
      updated_at: new Date().toISOString(),
    };

    if (dto.name !== undefined) updatePayload.name = dto.name;
    if (dto.type !== undefined) {
      updatePayload.type = dto.type;
      updatePayload.typeLabel =
        dto.typeLabel ||
        (dto.type === 'SECONDARY'
          ? 'Cấp 2 THCS'
          : dto.type === 'PRIMARY'
          ? 'Cấp 1 Tiểu học'
          : 'Cấp 3 THPT');
    }
    if (dto.typeLabel !== undefined) updatePayload.typeLabel = dto.typeLabel;
    if (dto.district !== undefined) updatePayload.district = dto.district;
    if (dto.city !== undefined) updatePayload.city = dto.city;
    if (dto.grades !== undefined) updatePayload.grades = dto.grades;
    if (dto.isNationalStandard !== undefined) updatePayload.isNationalStandard = dto.isNationalStandard;
    if (dto.totalClasses !== undefined) updatePayload.totalClasses = dto.totalClasses;
    if (dto.totalStudents !== undefined) updatePayload.totalStudents = dto.totalStudents;
    if (dto.appLinkedPercent !== undefined) updatePayload.appLinkedPercent = dto.appLinkedPercent;

    await updateDoc(docRef, updatePayload);
    return { ...current, ...updatePayload, id };
  }

  async deleteSchool(id: string) {
    const db = getAppFirestore();
    const docRef = doc(db, 'schools', id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      throw new NotFoundException(`Không tìm thấy trường học với ID ${id}`);
    }

    await updateDoc(docRef, {
      is_deleted: true,
      deleted_at: new Date().toISOString(),
    });

    return {
      message: 'Xóa trường học thành công',
      deleted_id: id,
    };
  }
}


