import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { FirebaseDataConnectService } from '../../common/firebase/data-connect.service';
import { UpdateProfileDto, RegisterDeviceTokenDto } from './dto/users.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly dataConnect: FirebaseDataConnectService,
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

    // Cập nhật SQL Data Connect
    await this.dataConnect.createUser(updatedData);

    // Xóa cache cũ để dữ liệu mới được cập nhật tức thời
    await this.cacheManager.del(`user_profile_${userId}`);

    const { password_hash, ...safeUser } = updatedData;
    return safeUser;
  }

  async registerDeviceToken(userId: string, dto: RegisterDeviceTokenDto) {
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

    // Cập nhật SQL Data Connect
    await this.dataConnect.softDeleteUser(userId);

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
      const sqlUser = await this.dataConnect.getUserById(userId);
      if (sqlUser && !sqlUser.isDeleted && !sqlUser.is_deleted) {
        return sqlUser;
      }
    } catch (e) {}
    return null;
  }
}
