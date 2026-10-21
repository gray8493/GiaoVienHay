import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsInt,
  Min,
  Max,
  ArrayNotEmpty,
  ValidateNested,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ClassStudentItemDto {
  @ApiPropertyOptional({ example: 'HS001', description: 'Mã học sinh' })
  @IsOptional()
  @IsString({ message: 'Mã học sinh phải là chuỗi ký tự' })
  student_code?: string;

  @ApiProperty({ example: 'Trần Bảo Nam', description: 'Họ và tên học sinh' })
  @IsString({ message: 'Họ và tên học sinh phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Họ và tên học sinh bắt buộc và không được để trống' })
  full_name: string;

  @ApiPropertyOptional({ example: '2020-05-15', description: 'Ngày sinh (YYYY-MM-DD)' })
  @IsOptional()
  @IsString({ message: 'Ngày sinh phải là chuỗi ký tự YYYY-MM-DD' })
  dob?: string;

  @ApiPropertyOptional({ example: 'MALE', enum: ['MALE', 'FEMALE', 'OTHER'], description: 'Giới tính học sinh' })
  @IsOptional()
  @IsString({ message: 'Giới tính học sinh phải là chuỗi ký tự' })
  gender?: string;

  @ApiPropertyOptional({ example: '0912345678', description: 'SĐT Phụ huynh liên kết' })
  @IsOptional()
  @IsString({ message: 'SĐT phụ huynh phải là chuỗi ký tự' })
  parent_phone?: string;
}

export class ClassSubjectTeacherItemDto {
  @ApiProperty({ example: 'uid_gvbm_eng', description: 'Mã giáo viên bộ môn' })
  @IsString({ message: 'Mã giáo viên phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Mã giáo viên bộ môn bắt buộc và không được để trống' })
  teacher_id: string;

  @ApiProperty({ example: 'ENG', description: 'Mã môn học' })
  @IsString({ message: 'Mã môn học phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Mã môn học bắt buộc và không được để trống' })
  subject_code: string;
}

export class CreateClassDto {
  @ApiProperty({ example: '1A', description: 'Tên lớp học' })
  @IsString({ message: 'Tên lớp học phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên lớp học không được để trống' })
  name: string;

  @ApiProperty({ example: 1, description: 'Khối lớp (1 - 9)' })
  @IsInt({ message: 'Khối lớp phải là số nguyên' })
  @Min(1, { message: 'Khối lớp phải là số nguyên từ 1 đến 9 (Tiểu học & THCS)' })
  @Max(9, { message: 'Khối lớp phải là số nguyên từ 1 đến 9 (Tiểu học & THCS)' })
  grade_level: number;

  @ApiProperty({ example: '2026-2027', description: 'Niên khóa năm học' })
  @IsString({ message: 'Năm học phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Năm học không được để trống' })
  academic_year: string;

  @ApiPropertyOptional({ type: [ClassSubjectTeacherItemDto], description: 'Danh sách GVBM phân công ban đầu' })
  @IsOptional()
  @IsArray({ message: 'Danh sách GVBM phải là một mảng' })
  @ValidateNested({ each: true })
  @Type(() => ClassSubjectTeacherItemDto)
  subject_teachers?: ClassSubjectTeacherItemDto[];

  @ApiPropertyOptional({ type: [ClassStudentItemDto], description: 'Danh sách học sinh ban đầu' })
  @IsOptional()
  @IsArray({ message: 'Danh sách học sinh phải là một mảng' })
  @ValidateNested({ each: true })
  @Type(() => ClassStudentItemDto)
  students?: ClassStudentItemDto[];
}

export class AddStudentToClassDto {
  @ApiPropertyOptional({ type: [ClassStudentItemDto], description: 'Danh sách học sinh thêm mới' })
  @IsOptional()
  @IsArray({ message: 'Danh sách học sinh phải là một mảng' })
  @ArrayNotEmpty({ message: 'Danh sách học sinh thêm mới không được để trống (tối thiểu 1 học sinh)' })
  @ValidateNested({ each: true })
  @Type(() => ClassStudentItemDto)
  students?: ClassStudentItemDto[];

  @ApiPropertyOptional({ example: 'Trần Bảo Nam', description: 'Họ và tên học sinh' })
  @ValidateIf((o) => !o.students)
  @IsNotEmpty({ message: 'Họ và tên học sinh không được để trống' })
  @IsString({ message: 'Họ và tên học sinh phải là chuỗi ký tự' })
  full_name?: string;

  @ApiPropertyOptional({ example: 'HS001', description: 'Mã học sinh' })
  @IsOptional()
  @IsString({ message: 'Mã học sinh phải là chuỗi ký tự' })
  student_code?: string;

  @ApiPropertyOptional({ example: '2019-05-15', description: 'Ngày sinh (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  dob?: string;

  @ApiPropertyOptional({ example: 'MALE', enum: ['MALE', 'FEMALE', 'OTHER'] })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ example: '0912345678', description: 'SĐT Phụ huynh liên kết' })
  @IsOptional()
  @IsString()
  parent_phone?: string;
}

export { AddStudentToClassDto as AddStudentsToClassDto };

export class JoinClassDto {
  @ApiPropertyOptional({ example: 'INV-1A-9821', description: 'Mã mời tham gia lớp học' })
  @ValidateIf((o) => !o.student_code)
  @IsString({ message: 'Mã mời phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Mã mời tham gia lớp học không được để trống' })
  invite_code?: string;

  @ApiPropertyOptional({ example: 'HS-1A-01', description: 'Mã học sinh (dành cho phụ huynh liên kết con)' })
  @IsOptional()
  @IsString({ message: 'Mã học sinh phải là chuỗi ký tự' })
  student_code?: string;

  @ApiPropertyOptional({ example: 'stu_01', description: 'Mã định danh học sinh con em' })
  @IsOptional()
  @IsString({ message: 'Mã học sinh phải là chuỗi ký tự' })
  student_id?: string;
}

export class UpdateSubjectTeachersDto {
  @ApiProperty({ type: [ClassSubjectTeacherItemDto], description: 'Danh sách GVBM phân công' })
  @IsArray({ message: 'Danh sách phân công GVBM phải là một mảng' })
  @ArrayNotEmpty({ message: 'Danh sách phân công GVBM không được để trống' })
  @ValidateNested({ each: true })
  @Type(() => ClassSubjectTeacherItemDto)
  subject_teachers: ClassSubjectTeacherItemDto[];
}

