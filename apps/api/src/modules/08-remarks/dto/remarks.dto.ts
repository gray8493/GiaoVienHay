import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateRemarkDto {
  @ApiProperty({ example: 'stu_01', description: 'Mã học sinh nhận nhận xét' })
  @IsString()
  @IsNotEmpty({ message: 'Mã học sinh không được để trống' })
  student_id: string;

  @ApiProperty({ example: 'cls_1a_2026', description: 'Mã lớp học' })
  @IsString()
  @IsNotEmpty({ message: 'Mã lớp học không được để trống' })
  class_id: string;

  @ApiPropertyOptional({ example: 'MATH', description: 'Mã môn học' })
  @IsOptional()
  @IsString()
  subject_code?: string;

  @ApiProperty({
    example: 'Hôm nay em Nam tiếp thu bài rất nhanh và hăng hái xung phong lên bảng chữa bài tập.',
    description: 'Nội dung nhận xét ngắn gọn thuần văn bản (tối đa 500 ký tự)',
  })
  @IsString()
  @IsNotEmpty({ message: 'Nội dung nhận xét không được để trống' })
  @MaxLength(500, { message: 'Nội dung nhận xét không vượt quá 500 ký tự' })
  content: string;
}
