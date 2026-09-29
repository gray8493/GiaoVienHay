import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class CreateClassDto {
  @ApiProperty({ example: '1A', description: 'Tên lớp học' })
  @IsString()
  @IsNotEmpty({ message: 'Tên lớp học không được để trống' })
  name: string;

  @ApiProperty({ example: 1, description: 'Khối lớp (1 - 9)' })
  @IsInt()
  @Min(1)
  @Max(9)
  grade_level: number;

  @ApiProperty({ example: '2026-2027', description: 'Niên khóa năm học' })
  @IsString()
  @IsNotEmpty({ message: 'Năm học không được để trống' })
  academic_year: string;
}

export class AddStudentToClassDto {
  @ApiProperty({ example: 'Trần Bảo Nam', description: 'Họ và tên học sinh' })
  @IsString()
  @IsNotEmpty({ message: 'Họ và tên học sinh không được để trống' })
  full_name: string;

  @ApiPropertyOptional({ example: '2019-05-15', description: 'Ngày sinh (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  dob?: string;

  @ApiPropertyOptional({ example: 'MALE', enum: ['MALE', 'FEMALE'] })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ example: '0912345678', description: 'SĐT Phụ huynh liên kết' })
  @IsOptional()
  @IsString()
  parent_phone?: string;
}

export class JoinClassDto {
  @ApiProperty({ example: 'INV-1A-9821', description: 'Mã mời tham gia lớp học' })
  @IsString()
  @IsNotEmpty({ message: 'Mã mời không được để trống' })
  invite_code: string;
}
