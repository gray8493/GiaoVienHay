import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsArray,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { UserRole, Subject } from '@giaovienhay/shared-types';

export class RegisterDto {
  @ApiProperty({ example: 'Nguyễn Thị Lan', description: 'Họ và tên người dùng' })
  @IsString({ message: 'Họ và tên phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Họ và tên bắt buộc và không được để trống' })
  full_name: string;

  @ApiProperty({ example: '0912345678', description: 'Số điện thoại đăng ký' })
  @IsString()
  @IsNotEmpty({ message: 'Số điện thoại bắt buộc và không được để trống' })
  phone: string;

  @ApiPropertyOptional({ example: 'teacher.lan@school.edu.vn', description: 'Địa chỉ Email' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ example: 'MatKhau123@', description: 'Mật khẩu đăng nhập' })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải chứa ít nhất 6 ký tự' })
  password: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.TEACHER_HOMEROOM,
    description: 'Vai trò người dùng trong hệ thống',
  })
  @IsEnum(UserRole, { message: 'Vai trò người dùng không hợp lệ' })
  role: UserRole;

  @ApiPropertyOptional({
    example: 'Trường Tiểu Học Chu Văn An',
    description: 'Tên trường công tác (Bắt buộc đối với Giáo viên)',
  })
  @ValidateIf((o) => o.role === UserRole.TEACHER || o.role === UserRole.TEACHER_HOMEROOM || o.role === UserRole.TEACHER_SUBJECT)
  @IsNotEmpty({ message: 'Tên trường giảng dạy (school_name) là bắt buộc đối với Giáo viên' })
  @IsString()
  school_name?: string;

  @ApiPropertyOptional({
    example: ['MATH'],
    enum: Subject,
    isArray: true,
    description: 'Danh sách môn học phụ trách (Bắt buộc đối với Giáo viên)',
  })
  @ValidateIf((o) => o.role === UserRole.TEACHER || o.role === UserRole.TEACHER_HOMEROOM || o.role === UserRole.TEACHER_SUBJECT)
  @IsArray({ message: 'Danh sách môn học phụ trách phải là một mảng' })
  @IsNotEmpty({ message: 'Giáo viên bắt buộc phải chọn ít nhất một môn học phụ trách' })
  teaching_subjects?: string[];
}

export class LoginDto {
  @ApiProperty({ example: '0912345678', description: 'Số điện thoại đăng nhập' })
  @IsString()
  @IsNotEmpty({ message: 'Số điện thoại đăng nhập không được để trống' })
  phone: string;

  @ApiProperty({ example: 'MatKhau123@', description: 'Mật khẩu' })
  @IsString()
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  password: string;
}

export class FirebaseVerifyDto {
  @ApiProperty({ example: 'firebase_id_token_string', description: 'Firebase ID Token từ SDK Client' })
  @IsString()
  @IsNotEmpty({ message: 'Mã xác thực Firebase ID Token không được để trống' })
  id_token: string;
}

export class RefreshTokenDto {
  @ApiProperty({ example: 'refresh_token_jwt_string', description: 'Refresh Token' })
  @IsString()
  @IsNotEmpty({ message: 'Refresh token không được để trống' })
  refresh_token: string;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'Admin@123', description: 'Mật khẩu hiện tại' })
  @IsString()
  @IsNotEmpty({ message: 'Mật khẩu hiện tại không được để trống' })
  current_password: string;

  @ApiProperty({ example: 'NewSecret@2026', description: 'Mật khẩu mới' })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu mới phải chứa ít nhất 6 ký tự' })
  new_password: string;
}

