import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
  Max,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { GradeType } from '@giaovienhay/shared-types';

export class ScoreItemDto {
  @ApiProperty({ example: 'stu_01', description: 'Mã học sinh' })
  @IsString()
  @IsNotEmpty()
  student_id: string;

  @ApiProperty({ example: 9.5, description: 'Điểm số thành phần (thang điểm 10)' })
  @IsNumber()
  score_value: number;

  @ApiPropertyOptional({ example: 'Thuộc bảng cửu chương', description: 'Nhận xét của giáo viên' })
  @IsOptional()
  @IsString()
  teacher_comment?: string;
}

export class BatchInputScoresDto {
  @ApiProperty({ example: 'cls_1a_2026', description: 'Mã lớp học' })
  @IsString()
  @IsNotEmpty()
  class_id: string;

  @ApiProperty({ example: 'MATH', description: 'Mã môn học' })
  @IsString()
  @IsNotEmpty()
  subject_code: string;

  @ApiPropertyOptional({ example: 1, description: 'Học kỳ (1 hoặc 2)' })
  @IsOptional()
  @IsInt()
  semester?: number;

  @ApiProperty({
    enum: GradeType,
    example: GradeType.ORAL_TEST,
    description: 'Loại điểm thành phần',
  })
  @IsEnum(GradeType)
  score_type: GradeType;

  @ApiProperty({ type: [ScoreItemDto], description: 'Danh sách điểm số từng học sinh' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScoreItemDto)
  scores: ScoreItemDto[];

  @ApiPropertyOptional({ example: 'OPEN', description: 'Trạng thái học kỳ (OPEN hoặc LOCKED)' })
  @IsOptional()
  @IsString()
  semester_status?: string;

  @ApiPropertyOptional({ example: false, description: 'Cờ đính chính điểm đã công bố' })
  @IsOptional()
  is_correction?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Cờ cột điểm đã công bố' })
  @IsOptional()
  is_published?: boolean;
}

export class PublishScoresDto {
  @ApiProperty({ example: 'cls_1a_2026', description: 'Mã lớp học' })
  @IsString()
  @IsNotEmpty()
  class_id: string;

  @ApiProperty({ example: 'MATH', description: 'Mã môn học' })
  @IsString()
  @IsNotEmpty()
  subject_code: string;

  @ApiProperty({ enum: GradeType, example: GradeType.TEST_15P })
  @IsEnum(GradeType)
  score_type: GradeType;

  @ApiPropertyOptional({
    type: [String],
    enum: GradeType,
    description: 'Công bố nhiều cột điểm trong một lần gọi — gom thành 1 thông báo/học sinh',
  })
  @IsOptional()
  @IsArray()
  score_types?: GradeType[];

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  semester?: number;
}

export class UpdateScoreDto {
  @ApiProperty({ example: 9.0, description: 'Điểm số đính chính' })
  @IsNumber()
  score_value: number;

  @ApiPropertyOptional({ example: 'Đính chính do chấm phúc khảo', description: 'Lý do đính chính' })
  @IsOptional()
  @IsString()
  correction_reason?: string;
}

export class ParentLookupScoreDto {
  @ApiProperty({ example: 'stu_01', description: 'Mã học sinh' })
  @IsString()
  @IsNotEmpty()
  student_id: string;

  @ApiProperty({ example: 'MATH', description: 'Mã môn học' })
  @IsString()
  @IsNotEmpty()
  subject_code: string;

  @ApiPropertyOptional({ example: 1, description: 'Học kỳ' })
  @IsOptional()
  semester?: number;

  @ApiPropertyOptional({ enum: GradeType, example: GradeType.FINAL, description: 'Loại điểm' })
  @IsOptional()
  score_type?: string;
}
