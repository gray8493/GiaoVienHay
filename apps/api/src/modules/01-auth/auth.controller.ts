import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  FirebaseVerifyDto,
  RefreshTokenDto,
} from './dto/auth.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Đăng ký tài khoản mới',
    description: 'Giáo viên bắt buộc nhập Tên trường (school_name) và Môn giảng dạy (teaching_subjects). Phụ huynh chỉ cần SĐT và Mật khẩu.',
  })
  @ApiResponse({ status: 201, description: 'Đăng ký thành công và trả về JWT Access Token' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng nhập tài khoản bằng SĐT & Mật khẩu' })
  @ApiResponse({ status: 200, description: 'Đăng nhập thành công' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('firebase-verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xác thực tài khoản qua Firebase ID Token (OTP SMS / Social Login)' })
  async firebaseVerify(@Body() dto: FirebaseVerifyDto) {
    return this.authService.firebaseVerify(dto);
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Làm mới Access Token khi hết hạn' })
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng xuất khỏi hệ thống' })
  async logout(@CurrentUser('sub') userId: string) {
    return this.authService.logout(userId);
  }
}
