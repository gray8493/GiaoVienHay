import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FeesInsuranceService } from './fees-insurance.service';
import { ToggleFeeDto, RemindFeesDto } from './dto/fees-insurance.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Fees & Insurance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('fees-insurance')
export class FeesInsuranceController {
  constructor(private readonly feesInsuranceService: FeesInsuranceService) {}

  @Get('class/:classId')
  @Roles('TEACHER_HOMEROOM', 'ADMIN')
  @ApiOperation({
    summary: 'GVCN xem danh sách thu nộp Học phí & BHYT của lớp',
    description: 'Theo dõi qua 2 cờ boolean kèm ngày nộp thực tế (không có cổng thanh toán online).',
  })
  async getClassFeesList(
    @Param('classId') classId: string,
    @Query('fee_type') feeType?: string,
    @Query('unpaid_only') unpaidOnly?: boolean,
  ) {
    return this.feesInsuranceService.getClassFeesList(classId, feeType, unpaidOnly);
  }

  @Patch('toggle')
  @Roles('TEACHER_HOMEROOM', 'ADMIN')
  @ApiOperation({ summary: 'Tích chọn cờ đã nộp kèm cập nhật ngày nộp thực tế' })
  async toggleFeeStatus(
    @CurrentUser('sub') teacherId: string,
    @Body() dto: ToggleFeeDto,
  ) {
    return this.feesInsuranceService.toggleFeeStatus(teacherId, dto);
  }

  @Post('remind')
  @Roles('TEACHER_HOMEROOM', 'ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Gửi thông báo đẩy FCM nhắc các phụ huynh chưa nộp' })
  async sendFeeReminder(
    @CurrentUser('sub') teacherId: string,
    @Body() dto: RemindFeesDto,
  ) {
    return this.feesInsuranceService.sendFeeReminder(teacherId, dto);
  }
}
