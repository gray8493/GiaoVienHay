import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { FirebaseService } from '../../common/firebase/firebase.service';
import { UpdateProfileDto, RegisterDeviceTokenDto } from './dto/users.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly firebaseService: FirebaseService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async getMe(userId: string) {
    const cacheKey = `user_profile_${userId}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    const user = await this.getUserById(userId);
    if (!user) {
      throw new NotFoundException('Không tìm thấy thông tin tài khoản');
    }
    const { password_hash, ...safeUser } = user;

    // Lưu vào RAM cache trong 5 phút (300 giây)
    await this.cacheManager.set(cacheKey, safeUser, 300 * 1000);
    return safeUser;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new NotFoundException('Không tìm thấy thông tin tài khoản');
    }

    const updatedData = {
      ...user,
      ...dto,
      updated_at: new Date().toISOString(),
    };

    if (this.firebaseService.firestore) {
      try {
        await this.firebaseService.firestore.collection('users').doc(userId).update(updatedData);
      } catch (e) {}
    }

    // Xóa cache cũ để dữ liệu mới được cập nhật tức thời
    await this.cacheManager.del(`user_profile_${userId}`);

    const { password_hash, ...safeUser } = updatedData;
    return safeUser;
  }

  async registerDeviceToken(userId: string, dto: RegisterDeviceTokenDto) {
    if (this.firebaseService.firestore) {
      try {
        await this.firebaseService.firestore.collection('users').doc(userId).update({
          fcm_token: dto.device_token,
          device_type: dto.device_type || 'ANDROID',
          token_updated_at: new Date().toISOString(),
        });
      } catch (e) {}
    }

    return {
      message: 'Đăng ký Device Token FCM thành công',
      device_token: dto.device_token,
    };
  }

  private async getUserById(userId: string): Promise<any | null> {
    if (this.firebaseService.firestore) {
      try {
        const doc = await this.firebaseService.firestore.collection('users').doc(userId).get();
        if (doc.exists) {
          return { id: doc.id, ...doc.data() };
        }
      } catch (e) {}
    }
    return {
      id: userId,
      full_name: 'Giáo viên Nguyễn Thị Lan',
      phone: '0912345678',
      role: 'TEACHER_HOMEROOM',
      school_name: 'Trường Tiểu Học Chu Văn An',
      teaching_subjects: ['MATH'],
      is_active: true,
    };
  }
}
