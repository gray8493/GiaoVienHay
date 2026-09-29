import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsBoolean, IsOptional, IsInt } from 'class-validator';
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

export class UpdateUserStatusDto {
  @ApiProperty({ example: false, description: 'true: Kích hoạt, false: Khóa tài khoản' })
  @IsBoolean()
  is_active: boolean;

  @ApiPropertyOptional({ example: 'Vi phạm quy chế giáo dục', description: 'Lý do khóa tài khoản' })
  @IsOptional()
  @IsString()
  reason?: string;
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
