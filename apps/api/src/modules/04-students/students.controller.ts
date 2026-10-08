import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Students & Parent Portal')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin hồ sơ lý lịch học sinh' })
  async getStudentProfile(@Param('id') studentId: string) {
    return this.studentsService.getStudentProfile(studentId);
  }

  @Get(':id/academic')
  @ApiOperation({ summary: 'Tra cứu Bảng điểm đa môn học (Cổng phụ huynh)' })
  async getAcademicRecord(@Param('id') studentId: string) {
    return this.studentsService.getAcademicRecord(studentId);
  }

  @Get(':id/attendance')
  @ApiOperation({ summary: 'Tra cứu Lịch sử chuyên cần & vắng học' })
  async getAttendanceHistory(
    @Param('id') studentId: string,
    @Query('month') month?: string,
  ) {
    return this.studentsService.getAttendanceHistory(studentId, month);
  }

  @Get(':id/fees-insurance')
  @ApiOperation({ summary: 'Xem tình trạng nộp Học phí & Bảo hiểm y tế (kèm ngày nộp)' })
  async getFeesInsuranceStatus(@Param('id') studentId: string) {
    return this.studentsService.getFeesInsuranceStatus(studentId);
  }

  @Get(':id/remarks')
  @ApiOperation({ summary: 'Xem Sổ liên lạc nhận xét từ thầy cô' })
  async getRemarks(@Param('id') studentId: string) {
    return this.studentsService.getRemarks(studentId);
  }

  @Get(':id/exam-reminders')
  @ApiOperation({ summary: 'Xem Lời nhắc Lịch kiểm tra sắp tới' })
  async getExamReminders(@Param('id') studentId: string) {
    return this.studentsService.getExamReminders(studentId);
  }
}
