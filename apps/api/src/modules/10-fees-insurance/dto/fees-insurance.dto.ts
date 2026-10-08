import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { FeeType } from '@giaovienhay/shared-types';

export class ToggleFeeDto {
  @ApiProperty({ example: 'fee_02', description: 'Mã bản ghi thu nộp' })
  @IsString()
  @IsNotEmpty({ message: 'Mã bản ghi không được để trống' })
  record_id: string;

  @ApiProperty({
    enum: FeeType,
    example: FeeType.INSURANCE,
    description: 'Khoản thu (TUITION hoặc INSURANCE)',
  })
  @IsEnum(FeeType)
  fee_type: FeeType;

  @ApiProperty({ example: true, description: 'Trạng thái đã hoàn thành hay chưa' })
  @IsBoolean()
  is_paid: boolean;

  @ApiPropertyOptional({ example: '2026-09-29', description: 'Ngày nộp thực tế (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  paid_date?: string;

  @ApiPropertyOptional({ example: 'Đã nộp tiền mặt tại lớp', description: 'Ghi chú của giáo viên' })
  @IsOptional()
  @IsString()
  note?: string;
}

export class RemindFeesDto {
  @ApiProperty({ example: 'cls_1a_2026', description: 'Mã lớp học' })
  @IsString()
  @IsNotEmpty({ message: 'Mã lớp không được để trống' })
  class_id: string;

  @ApiProperty({ enum: FeeType, example: FeeType.INSURANCE, description: 'Khoản thu cần đôn đốc' })
  @IsEnum(FeeType)
  fee_type: FeeType;

  @ApiPropertyOptional({
    example: 'Kính nhờ quý phụ huynh chưa hoàn thành BHYT năm học 2026-2027 vui lòng nộp trước ngày 15/10.',
    description: 'Lời dặn dò tùy chỉnh gửi kèm thông báo đẩy',
  })
  @IsOptional()
  @IsString()
  custom_message?: string;
}
