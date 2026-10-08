import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsArray, ValidateNested, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { AttendanceStatus } from '@giaovienhay/shared-types';

export class AttendanceRecordItemDto {
  @ApiProperty({ example: 'stu_01', description: 'Mã học sinh' })
  @IsString()
  @IsNotEmpty()
  student_id: string;

  @ApiProperty({
    enum: AttendanceStatus,
    example: AttendanceStatus.PRESENT,
    description: 'Trạng thái điểm danh',
  })
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @ApiPropertyOptional({ example: 'Phụ huynh xin nghỉ ốm', description: 'Ghi chú lý do vắng' })
  @IsOptional()
  @IsString()
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
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttendanceRecordItemDto)
  records: AttendanceRecordItemDto[];
}
