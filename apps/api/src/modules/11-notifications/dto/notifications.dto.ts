import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class QueryNotificationsDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean({ message: 'Tham số is_read phải là kiểu boolean (true hoặc false)' })
  is_read?: boolean;
}
