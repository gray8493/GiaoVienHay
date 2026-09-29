import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { GradeType } from '@giaovienhay/shared-types';

export class CreateExamReminderDto {
  @ApiProperty({ example: 'cls_1a_2026', description: 'Mã lớp học' })
  @IsString()
  @IsNotEmpty({ message: 'Mã lớp học không được để trống' })
  class_id: string;

  @ApiProperty({ example: 'MATH', description: 'Mã môn học' })
  @IsString()
  @IsNotEmpty({ message: 'Mã môn học không được để trống' })
  subject_code: string;

  @ApiProperty({
    enum: GradeType,
    example: GradeType.TEST_15P,
    description: 'Loại bài kiểm tra sắp tới',
  })
  @IsEnum(GradeType)
  exam_type: GradeType;

  @ApiProperty({ example: '2026-10-02', description: 'Ngày diễn ra kiểm tra (YYYY-MM-DD)' })
  @IsString()
  @IsNotEmpty({ message: 'Ngày diễn ra không được để trống' })
  exam_date: string;

  @ApiProperty({
    example: 'Thứ Sáu tới lớp có bài kiểm tra 15 phút Toán về phép cộng trong phạm vi 10. Kính nhờ phụ huynh đôn đốc con ôn bài.',
    description: 'Nội dung dặn dò chi tiết cho phụ huynh',
  })
  @IsString()
  @IsNotEmpty({ message: 'Lời dặn dò không được để trống' })
  message: string;
}
