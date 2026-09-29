import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { DifficultyLevel, GameMode } from '@giaovienhay/shared-types';

export class GenerateQuizAiDto {
  @ApiProperty({ example: 'MATH', description: 'Mã môn học' })
  @IsString()
  @IsNotEmpty()
  subject_code: string;

  @ApiProperty({ example: 'cls_1a_2026', description: 'Mã lớp học áp dụng' })
  @IsString()
  @IsNotEmpty()
  class_id: string;

  @ApiProperty({ example: 'Kiểm tra bài 12: Phép cộng phân số', description: 'Tiêu đề bài kiểm tra bài cũ' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 5, description: 'Số lượng câu hỏi cần sinh (mặc định 5)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  num_questions?: number;

  @ApiPropertyOptional({
    enum: DifficultyLevel,
    example: DifficultyLevel.MEDIUM,
    description: 'Độ khó câu hỏi do giáo viên chọn',
  })
  @IsOptional()
  @IsEnum(DifficultyLevel)
  difficulty_level?: DifficultyLevel;

  @ApiPropertyOptional({
    enum: GameMode,
    example: GameMode.STANDARD_QUIZ,
    description: 'Chế độ trình chiếu mặc định',
  })
  @IsOptional()
  @IsEnum(GameMode)
  preferred_mode?: GameMode;
}

export class InClassScoreInputDto {
  @ApiProperty({ example: 'stu_01', description: 'Mã học sinh được chấm điểm' })
  @IsString()
  @IsNotEmpty()
  student_id: string;

  @ApiProperty({ example: 9.0, description: 'Điểm số bài cũ (thang điểm 10)' })
  @IsNumber()
  @Min(0)
  @Max(10)
  score: number;

  @ApiPropertyOptional({
    enum: GameMode,
    example: GameMode.GOLDEN_BELL,
    description: 'Chế độ đã chơi khi trả lời',
  })
  @IsOptional()
  @IsEnum(GameMode)
  mode_played?: GameMode;

  @ApiPropertyOptional({
    example: 'Trả lời dứt khoát, giải thích đúng quy tắc toán học',
    description: 'Lời phê của giáo viên',
  })
  @IsOptional()
  @IsString()
  teacher_note?: string;

  @ApiPropertyOptional({ example: true, description: 'Tự động đồng bộ vào cột điểm miệng trong Sổ điểm môn học' })
  @IsOptional()
  @IsBoolean()
  sync_to_scores_table?: boolean;
}
