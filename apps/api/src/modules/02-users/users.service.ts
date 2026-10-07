import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { FirebaseService } from '../../common/firebase/firebase.service';
import { UpdateProfileDto, RegisterDeviceTokenDto } from './dto/users.dto';
import {
  getAppFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from '../../common/firebase/firestore-client';

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

    try {
      const db = getAppFirestore();
      await updateDoc(doc(db, 'users', userId), updatedData);
    } catch (e) {}

    // Xóa cache cũ để dữ liệu mới được cập nhật tức thời
    await this.cacheManager.del(`user_profile_${userId}`);

    const { password_hash, ...safeUser } = updatedData;
    return safeUser;
  }

  async registerDeviceToken(userId: string, dto: RegisterDeviceTokenDto) {
    try {
      const db = getAppFirestore();
      await updateDoc(doc(db, 'users', userId), {
        fcm_token: dto.device_token,
        device_type: dto.device_type || 'ANDROID',
        token_updated_at: new Date().toISOString(),
      });
    } catch (e) {}

    return {
      message: 'Đăng ký Device Token FCM thành công',
      device_token: dto.device_token,
    };
  }

  /**
   * Xóa mềm tài khoản người dùng (is_deleted = 1/true)
   */
  async deleteUser(userId: string) {
    const now = new Date().toISOString();
    try {
      const db = getAppFirestore();
      await setDoc(
        doc(db, 'users', userId),
        {
          is_deleted: true,
          is_active: false,
          deleted_at: now,
        },
        { merge: true },
      );
    } catch (e) {}

    // Xóa cache profile
    await this.cacheManager.del(`user_profile_${userId}`);

    return {
      message: 'Xóa mềm tài khoản người dùng thành công',
      user_id: userId,
      is_deleted: true,
      deleted_at: now,
    };
  }

  private async getUserById(userId: string): Promise<any | null> {
    try {
      const db = getAppFirestore();
      const docSnap = await getDoc(doc(db, 'users', userId));
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data?.is_deleted) return null;
        return { id: docSnap.id, ...data };
      }
    } catch (e) {}
    return null;
  }
}

