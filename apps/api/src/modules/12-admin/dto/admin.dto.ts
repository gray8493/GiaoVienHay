import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsBoolean, IsOptional, IsInt, IsArray, Length, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from '@giaovienhay/shared-types';

export class AdminCreateUserDto {
  @ApiProperty({ example: 'Thầy Trần Văn Bình' })
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @ApiProperty({ example: '0988776655' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({ example: 'binh.tran@school.edu.vn' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ enum: UserRole, example: UserRole.TEACHER_SUBJECT })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiPropertyOptional({ example: 'Trường Tiểu Học Chu Văn An' })
  @IsOptional()
  @IsString()
  school_name?: string;
}

export class UpdateAdminUserDto extends PartialType(AdminCreateUserDto) {}

export class UpdateUserStatusDto {
  @ApiProperty({ example: false, description: 'true: Kích hoạt, false: Khóa tài khoản' })
  @IsBoolean()
  is_active: boolean;

  @ApiPropertyOptional({ example: 'Vi phạm quy chế giáo dục', description: 'Lý do khóa tài khoản' })
  @IsOptional()
  @IsString()
  @Length(5, 500, { message: 'Lý do khóa tài khoản phải có độ dài từ 5 đến 500 ký tự' })
  reason?: string;
}

export class UpdateTeacherAiQuotaDto {
  @ApiProperty({ example: 35, description: 'Hạn mức lượt gọi Gemini AI hàng ngày của giáo viên' })
  @IsInt()
  ai_daily_quota: number;

  @ApiPropertyOptional({ example: 'AUTO', description: 'Gói mô hình AI: FLASH | PRO | AUTO' })
  @IsOptional()
  @IsString()
  ai_model_tier?: string;

  @ApiPropertyOptional({ example: false, description: 'Có reset số lượt đã dùng hôm nay về 0 không' })
  @IsOptional()
  @IsBoolean()
  reset_used?: boolean;
}

export class QueryAdminUsersDto {
  @ApiPropertyOptional({ enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ example: 'Nguyễn' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number;
}

export class QueryAdminClassesDto {
  @ApiPropertyOptional({ example: '2026-2027', description: 'Năm học cần lọc' })
  @IsOptional()
  @IsString()
  academic_year?: string;

  @ApiPropertyOptional({ example: 'Trường Tiểu Học Chu Văn An' })
  @IsOptional()
  @IsString()
  school_name?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number;
}

export class UpdateSystemLimitsDto {
  @ApiPropertyOptional({ example: 55 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'Thông số cấu hình hạn mức tài nguyên không hợp lệ (phải là số nguyên dương)' })
  max_students_per_class?: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'Thông số cấu hình hạn mức tài nguyên không hợp lệ (phải là số nguyên dương)' })
  max_classes_per_teacher?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'Thông số cấu hình hạn mức tài nguyên không hợp lệ (phải là số nguyên dương)' })
  max_quiz_questions_per_gen?: number;

  @ApiPropertyOptional({ example: 15 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'Thông số cấu hình hạn mức tài nguyên không hợp lệ (phải là số nguyên dương)' })
  max_upload_file_size_mb?: number;

  @ApiPropertyOptional({ example: 15 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'Thông số cấu hình hạn mức tài nguyên không hợp lệ (phải là số nguyên dương)' })
  max_upload_size_mb?: number;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'Thông số cấu hình hạn mức tài nguyên không hợp lệ (phải là số nguyên dương)' })
  fcm_rate_limit_per_minute?: number;

  @ApiPropertyOptional({ example: 25 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'Thông số cấu hình hạn mức tài nguyên không hợp lệ (phải là số nguyên dương)' })
  gemini_ai_daily_quota_per_teacher?: number;

  @ApiPropertyOptional({ example: 'gemini-1.5-flash' })
  @IsOptional()
  @IsString()
  ai_model?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  allow_subject_teacher_create_class?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  enable_fallback_cache?: boolean;
}

export class AdminCreateClassDto {
  @ApiProperty({ example: '7A', description: 'Tên lớp học' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 7, description: 'Khối lớp (1 - 12)' })
  @Type(() => Number)
  @IsInt()
  grade_level: number;

  @ApiProperty({ example: '2026-2027', description: 'Năm học' })
  @IsString()
  @IsNotEmpty()
  academic_year: string;

  @ApiPropertyOptional({ example: 'Trường THCS Lê Quý Đôn' })
  @IsOptional()
  @IsString()
  school_name?: string;

  @ApiPropertyOptional({ example: 'Cô Nguyễn Thị Lan' })
  @IsOptional()
  @IsString()
  homeroom_teacher?: string;
}

export class QueryLogsDto {
  @ApiPropertyOptional({ example: 'ALL' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 'ALL' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 'ALL' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number;
}

export class AdminCreateSchoolDto {
  @ApiProperty({ example: 'THCS Lê Quý Đôn', description: 'Tên trường học' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'SECONDARY', enum: ['PRIMARY', 'SECONDARY', 'HIGH'], description: 'Cấp học' })
  @IsString()
  type: 'PRIMARY' | 'SECONDARY' | 'HIGH';

  @ApiPropertyOptional({ example: 'Cấp 2 THCS' })
  @IsOptional()
  @IsString()
  typeLabel?: string;

  @ApiPropertyOptional({ example: 'Quận Cầu Giấy' })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional({ example: 'TP. Hà Nội' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: [6, 7, 8, 9] })
  @IsOptional()
  @IsArray()
  grades?: number[];

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isNationalStandard?: boolean;
}

export class AdminUpdateSchoolDto extends PartialType(AdminCreateSchoolDto) {
  @ApiPropertyOptional({ example: 35 })
  @IsOptional()
  totalClasses?: number;

  @ApiPropertyOptional({ example: 1400 })
  @IsOptional()
  totalStudents?: number;

  @ApiPropertyOptional({ example: 96.5 })
  @IsOptional()
  appLinkedPercent?: number;
}

