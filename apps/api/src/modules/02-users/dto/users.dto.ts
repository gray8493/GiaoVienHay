import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, MinLength, IsUrl, IsNotEmpty } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Nguyễn Thị Lan', description: 'Họ và tên' })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Họ và tên phải có độ dài từ 2 đến 100 ký tự' })
  full_name?: string;

  @ApiPropertyOptional({ example: 'lan.nguyen@school.edu.vn', description: 'Email' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: 'https://storage.googleapis.com/.../avatar.jpg', description: 'URL ảnh đại diện' })
  @IsOptional()
  @IsUrl({}, { message: 'URL ảnh đại diện không đúng định dạng hợp lệ (yêu cầu https://...)' })
  avatar_url?: string;

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
  @ApiPropertyOptional({ example: 'fcm_device_token_xyz123', description: 'FCM Device Token của thiết bị' })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'fcm_device_token không được để trống' })
  device_token?: string;

  @ApiPropertyOptional({ example: 'fcm_tok_abc123xyz789', description: 'FCM Device Token của thiết bị' })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'fcm_device_token không được để trống' })
  fcm_device_token?: string;

  @ApiPropertyOptional({ example: 'ANDROID', enum: ['IOS', 'ANDROID', 'WEB'] })
  @IsOptional()
  @IsString()
  device_type?: string;
}
