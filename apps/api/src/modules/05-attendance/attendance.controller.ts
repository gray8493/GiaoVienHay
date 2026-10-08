import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { SubmitAttendanceDto } from './dto/attendance.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('submit')
  @Roles('TEACHER_HOMEROOM', 'TEACHER_*', 'ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Điểm danh chuyên cần đầu giờ (GVCN)',
    description: 'Điểm danh 1-chạm, tự động kích hoạt thông báo đẩy FCM tới phụ huynh của những học sinh vắng.',
  })
  async submitAttendance(
    @CurrentUser('sub') teacherId: string,
    @Body() dto: SubmitAttendanceDto,
  ) {
    return this.attendanceService.submitAttendance(teacherId, dto);
  }

  @Get('class/:classId')
  @Roles('TEACHER_*', 'ADMIN')
  @ApiOperation({ summary: 'Xem lịch sử điểm danh của lớp theo ngày/tháng' })
  async getClassAttendance(
    @Param('classId') classId: string,
    @Query('date') date?: string,
    @Query('month') month?: string,
  ) {
    return this.attendanceService.getClassAttendance(classId, date, month);
  }

  @Get('today/:classId')
  @Roles('TEACHER_*', 'ADMIN')
  @ApiOperation({
    summary: 'Lấy danh sách học sinh CÓ MẶT HÔM NAY',
    description: 'Trích xuất cực nhanh danh sách học sinh có mặt để nạp vào Vòng quay may mắn kiểm tra bài cũ.',
  })
  async getTodayPresentStudents(@Param('classId') classId: string) {
    return this.attendanceService.getTodayPresentStudents(classId);
  }
}
