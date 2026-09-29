import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../../common/firebase/firebase.service';
import { AdminCreateUserDto, UpdateUserStatusDto, QueryAdminUsersDto } from './dto/admin.dto';
import { UserRole } from '@giaovienhay/shared-types';

@Injectable()
export class AdminService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async getAllUsers(query: QueryAdminUsersDto) {
    const mockUsers = [
      {
        id: 'usr_01',
        full_name: 'Cô Nguyễn Thị Lan',
        phone: '0912345678',
        email: 'lan.nguyen@school.edu.vn',
        role: UserRole.TEACHER_HOMEROOM,
        school_name: 'Trường Tiểu Học Chu Văn An',
        is_active: true,
        created_at: '2026-09-01T08:00:00.000Z',
      },
      {
        id: 'usr_02',
        full_name: 'Anh Trần Văn Nam (PH em Nam)',
        phone: '0988112233',
        email: null,
        role: UserRole.PARENT,
        school_name: null,
        is_active: true,
        created_at: '2026-09-05T09:00:00.000Z',
      },
    ];

    let filtered = mockUsers;
    if (query.role) {
      filtered = filtered.filter((u) => u.role === query.role);
    }
    if (query.keyword) {
      filtered = filtered.filter((u) => u.full_name.includes(query.keyword) || u.phone.includes(query.keyword));
    }

    return {
      total: filtered.length,
      page: query.page || 1,
      limit: query.limit || 20,
      items: filtered,
    };
  }

  async createUser(dto: AdminCreateUserDto) {
    const userId = 'usr_adm_' + Date.now();
    const newUser = {
      id: userId,
      full_name: dto.full_name,
      phone: dto.phone,
      email: dto.email || null,
      role: dto.role,
      school_name: dto.school_name || null,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    if (this.firebaseService.firestore) {
      try {
        await this.firebaseService.firestore.collection('users').doc(userId).set(newUser);
      } catch (e) {}
    }

    return newUser;
  }

  async updateUserStatus(userId: string, dto: UpdateUserStatusDto) {
    if (this.firebaseService.firestore) {
      try {
        await this.firebaseService.firestore.collection('users').doc(userId).update({
          is_active: dto.is_active,
          status_reason: dto.reason || null,
          status_updated_at: new Date().toISOString(),
        });
      } catch (e) {}
    }

    return {
      user_id: userId,
      is_active: dto.is_active,
      message: dto.is_active ? 'Đã kích hoạt lại tài khoản' : 'Đã khóa tài khoản người dùng',
    };
  }

  async getAllClassesMonitoring() {
    return [
      {
        class_id: 'cls_1a_2026',
        name: '1A',
        grade_level: 1,
        homeroom_teacher: 'Cô Nguyễn Thị Lan',
        student_count: 35,
        academic_year: '2026-2027',
      },
      {
        class_id: 'cls_1b_2026',
        name: '1B',
        grade_level: 1,
        homeroom_teacher: 'Thầy Lê Văn Hùng',
        student_count: 34,
        academic_year: '2026-2027',
      },
    ];
  }

  async getSystemLimits() {
    return {
      max_students_per_class: 50,
      max_classes_per_teacher: 10,
      max_quiz_questions_per_gen: 20,
      max_upload_file_size_mb: 15,
      fcm_rate_limit_per_minute: 100,
    };
  }
}
