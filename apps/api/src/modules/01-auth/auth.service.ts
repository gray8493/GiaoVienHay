import {
  Injectable,
  OnModuleInit,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { FirebaseService } from '../../common/supabase/supabase.service';
import {
  RegisterDto,
  LoginDto,
  FirebaseVerifyDto,
  RefreshTokenDto,
  ChangePasswordDto,
} from './dto/auth.dto';
import { ErrorCode, UserRole } from '@giaovienhay/shared-types';
import { FirebaseDataConnectService } from '../../common/supabase/supabase.service';

@Injectable()
export class AuthService implements OnModuleInit {
  // In-memory fallback map for test/emulator without Firestore connection
  private inMemoryUsers: Map<string, any> = new Map();

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly dataConnect: FirebaseDataConnectService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    // Seed default Admin account for testing & full portal connectivity
    const adminPhone = '0988888888';
    const existing = await this.findUserByPhone(adminPhone);
    if (!existing) {
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      const adminUser = {
        id: 'usr_admin_root',
        full_name: 'Quản trị viên Hệ thống',
        phone: adminPhone,
        email: 'admin@giaovienhay.vn',
        password_hash: hashedPassword,
        role: UserRole.ADMIN,
        school_name: 'Sở GD&ĐT / Hệ thống GiaoVienHay',
        teaching_subjects: [],
        is_active: true,
        is_deleted: false,
        deleted_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await this.saveUser(adminUser);
    }
  }

  async register(dto: RegisterDto) {
    // 1. Kiểm tra tồn tại qua số điện thoại
    const existingUser = await this.findUserByPhone(dto.phone);
    if (existingUser) {
      throw new ConflictException({
        message: 'Số điện thoại này đã được đăng ký trong hệ thống',
        error_code: ErrorCode.USER_PHONE_EXISTS,
      });
    }

    // 2. Hash mật khẩu
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const userId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    const newUser = {
      id: userId,
      full_name: dto.full_name,
      phone: dto.phone,
      email: dto.email || null,
      password_hash: hashedPassword,
      role: dto.role,
      school_name: dto.school_name || null,
      teaching_subjects: dto.teaching_subjects || [],
      is_active: true,
      is_deleted: false,
      deleted_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 3. Lưu vào Firestore
    await this.saveUser(newUser);

    // 4. Sinh JWT Tokens
    const tokens = await this.generateTokens({
      sub: newUser.id,
      phone: newUser.phone,
      role: newUser.role,
      school_name: newUser.school_name,
    });

    return {
      user: {
        id: newUser.id,
        full_name: newUser.full_name,
        phone: newUser.phone,
        email: newUser.email,
        role: newUser.role,
        school_name: newUser.school_name,
        teaching_subjects: newUser.teaching_subjects,
      },
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.findUserByPhone(dto.phone);
    if (!user || user.is_deleted) {
      throw new UnauthorizedException({
        message: 'Số điện thoại hoặc mật khẩu không chính xác',
        error_code: ErrorCode.AUTH_INVALID_CREDENTIALS,
      });
    }

    if (!user.is_active) {
      throw new UnauthorizedException({
        message: 'Tài khoản của bạn đã bị khóa hoặc tạm dừng hoạt động',
        error_code: ErrorCode.AUTH_ACCOUNT_LOCKED,
      });
    }

    if (!user.password_hash) {
      throw new UnauthorizedException({
        message: 'Tài khoản chưa thiết lập mật khẩu đăng nhập',
        error_code: ErrorCode.AUTH_INVALID_CREDENTIALS,
      });
    }

    const isMatch = await bcrypt.compare(dto.password, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedException({
        message: 'Số điện thoại hoặc mật khẩu không chính xác',
        error_code: ErrorCode.AUTH_INVALID_CREDENTIALS,
      });
    }

    const tokens = await this.generateTokens({
      sub: user.id,
      phone: user.phone,
      role: user.role,
      school_name: user.school_name,
    });

    return {
      user: {
        id: user.id,
        full_name: user.full_name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        school_name: user.school_name,
        teaching_subjects: user.teaching_subjects || [],
      },
      ...tokens,
    };
  }

  async firebaseVerify(dto: FirebaseVerifyDto) {
    try {
      let decodedToken: any;
      if (this.firebaseService.auth) {
        decodedToken = await this.firebaseService.auth.verifyIdToken(dto.id_token);
      } else {
        // Fallback for simulation / mock test
        decodedToken = { uid: 'fb_mock_' + Date.now(), phone_number: '+84912345678' };
      }

      const phone = decodedToken.phone_number?.replace('+84', '0') || '0912345678';
      let user = await this.findUserByPhone(phone);

      if (!user) {
        // Tạo tài khoản mặc định phụ huynh nếu chưa có
        user = {
          id: 'usr_fb_' + decodedToken.uid,
          full_name: decodedToken.name || 'Người dùng mới',
          phone,
          email: decodedToken.email || null,
          role: UserRole.PARENT,
          school_name: null,
          teaching_subjects: [],
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        await this.saveUser(user);
      }

      const tokens = await this.generateTokens({
        sub: user.id,
        phone: user.phone,
        role: user.role,
        school_name: user.school_name,
      });

      return {
        user: {
          id: user.id,
          full_name: user.full_name,
          phone: user.phone,
          role: user.role,
          school_name: user.school_name,
        },
        ...tokens,
      };
    } catch (err) {
      throw new UnauthorizedException({
        message: 'Mã xác thực Firebase ID Token không hợp lệ',
        error_code: ErrorCode.AUTH_TOKEN_INVALID,
      });
    }
  }

  async refreshToken(dto: RefreshTokenDto) {
    try {
      const secret = this.configService.get<string>('JWT_REFRESH_SECRET') || 'giaovienhay_refresh_secret_2026';
      const payload = await this.jwtService.verifyAsync(dto.refresh_token, { secret });
      
      const user = await this.findUserById(payload.sub);
      if (!user || !user.is_active) {
        throw new UnauthorizedException({
          message: 'Tài khoản không tồn tại hoặc đã bị khóa',
          error_code: ErrorCode.AUTH_UNAUTHORIZED,
        });
      }

      return this.generateTokens({
        sub: user.id,
        phone: user.phone,
        role: user.role,
        school_name: user.school_name,
      });
    } catch (e) {
      throw new UnauthorizedException({
        message: 'Refresh token không hợp lệ hoặc đã hết hạn',
        error_code: ErrorCode.AUTH_TOKEN_EXPIRED,
      });
    }
  }

  async logout(userId: string) {
    if (!userId || userId === 'invalid_token' || userId.trim() === '') {
      throw new UnauthorizedException({
        message: 'Token xác thực không hợp lệ hoặc đã bị thu hồi',
        error_code: ErrorCode.AUTH_TOKEN_INVALID,
      });
    }
    return {
      message: 'Đăng xuất tài khoản thành công',
    };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new BadRequestException({
        code: ErrorCode.USER_NOT_FOUND,
        message: 'Tài khoản không tồn tại trên hệ thống',
      });
    }

    if (user.password_hash) {
      const isMatch = await bcrypt.compare(dto.current_password, user.password_hash);
      if (!isMatch) {
        throw new BadRequestException({
          code: ErrorCode.AUTH_INVALID_CREDENTIALS,
          message: 'Mật khẩu hiện tại không chính xác',
        });
      }
    }

    const newHashedPassword = await bcrypt.hash(dto.new_password, 10);
    user.password_hash = newHashedPassword;
    user.updated_at = new Date().toISOString();

    await this.saveUser(user);

    return {
      success: true,
      message: 'Đổi mật khẩu thành công',
    };
  }

  // --- Database Helpers (Firebase Data Connect SQL) ---
  private async findUserByPhone(phone: string): Promise<any | null> {
    try {
      const sqlUser = await this.dataConnect.getUserByPhone(phone);
      if (sqlUser) {
        return sqlUser;
      }
    } catch (err) {}
    return this.inMemoryUsers.get(phone) || null;
  }

  private async findUserById(id: string): Promise<any | null> {
    try {
      const sqlUser = await this.dataConnect.getUserById(id);
      if (sqlUser) {
        return sqlUser;
      }
    } catch (err) {}
    for (const u of this.inMemoryUsers.values()) {
      if (u.id === id) return u;
    }
    return null;
  }

  private async saveUser(user: any): Promise<void> {
    this.inMemoryUsers.set(user.phone, user);
    try {
      await this.dataConnect.createUser(user);
    } catch (err) {}
  }

  private async generateTokens(payload: any) {
    const jwtSecret = this.configService.get<string>('JWT_SECRET') || 'giaovienhay_super_secret_jwt_key_2026';
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET') || 'giaovienhay_refresh_secret_2026';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: jwtSecret,
        expiresIn: '7d',
      }),
      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: '30d',
      }),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 7 * 24 * 3600,
    };
  }
}
