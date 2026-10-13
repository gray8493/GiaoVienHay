import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsArray,
  ArrayNotEmpty,
  ValidateNested,
  IsInt,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AttendanceStatus } from '@giaovienhay/shared-types';

export class AttendanceRecordItemDto {
  @ApiProperty({ example: 'stu_01', description: 'Mã học sinh' })
  @IsString()
  @IsNotEmpty({ message: 'Mã học sinh không được để trống' })
  student_id: string;

  @ApiProperty({
    enum: AttendanceStatus,
    example: AttendanceStatus.PRESENT,
    description: 'Trạng thái điểm danh',
  })
  @IsEnum(AttendanceStatus, { message: 'Trạng thái điểm danh không hợp lệ' })
  status: AttendanceStatus;

  @ApiPropertyOptional({ example: 'Phụ huynh xin nghỉ ốm', description: 'Ghi chú lý do vắng' })
  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi ký tự' })
  @MaxLength(255, { message: 'Nội dung ghi chú vượt quá giới hạn độ dài cho phép (tối đa 255 ký tự)' })
  note?: string;
}

export class SubmitAttendanceDto {
  @ApiProperty({ example: 'cls_1a_2026', description: 'Mã lớp học' })
  @IsString()
  @IsNotEmpty({ message: 'Mã lớp học không được để trống' })
  class_id: string;

  @ApiProperty({ example: '2026-09-29', description: 'Ngày điểm danh (YYYY-MM-DD)' })
  @IsString()
  @IsNotEmpty({ message: 'Ngày điểm danh không được để trống' })
  attendance_date: string;

  @ApiPropertyOptional({ example: 1, description: 'Tiết học (mặc định tiết 1)' })
  @IsOptional()
  @IsInt()
  period?: number;

  @ApiProperty({ type: [AttendanceRecordItemDto], description: 'Danh sách bản ghi điểm danh học sinh' })
  @IsArray({ message: 'Danh sách bản ghi điểm danh phải là một mảng' })
  @ArrayNotEmpty({ message: 'Danh sách học sinh điểm danh (records) không được rỗng (tối thiểu 1 học sinh)' })
  @ValidateNested({ each: true })
  @Type(() => AttendanceRecordItemDto)
  records: AttendanceRecordItemDto[];
}

export class UpdateAttendanceDto {
  @ApiProperty({
    enum: AttendanceStatus,
    example: AttendanceStatus.PRESENT,
    description: 'Trạng thái điểm danh mới',
  })
  @IsNotEmpty({ message: 'Trạng thái điểm danh (status) bắt buộc phải được cung cấp' })
  @IsEnum(AttendanceStatus, { message: 'Trạng thái điểm danh không hợp lệ' })
  status: AttendanceStatus;

  @ApiPropertyOptional({ example: 'Đến muộn 15p do mưa lớn', description: 'Ghi chú cập nhật' })
  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi ký tự' })
  @MaxLength(255, { message: 'Ghi chú không được vượt quá 255 ký tự' })
  note?: string;
}
