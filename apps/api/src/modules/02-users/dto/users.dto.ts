import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Nguyễn Thị Lan', description: 'Họ và tên' })
  @IsOptional()
  @IsString()
  full_name?: string;

  @ApiPropertyOptional({ example: 'lan.nguyen@school.edu.vn', description: 'Email' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: 'Trường Tiểu Học Chu Văn An', description: 'Tên trường công tác' })
  @IsOptional()
  @IsString()
  school_name?: string;

  @ApiPropertyOptional({ example: ['MATH', 'LITERATURE'], description: 'Danh sách môn dạy' })
  @IsOptional()
  @IsArray()
  teaching_subjects?: string[];
}

export class RegisterDeviceTokenDto {
  @ApiProperty({ example: 'fcm_device_token_xyz123', description: 'FCM Device Token của thiết bị' })
  @IsString()
  device_token: string;

  @ApiPropertyOptional({ example: 'ANDROID', enum: ['IOS', 'ANDROID', 'WEB'] })
  @IsOptional()
  @IsString()
  device_type?: string;
}
