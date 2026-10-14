import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Students & Parent Portal')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin hồ sơ lý lịch học sinh' })
  @ApiParam({ name: 'id', example: 'stu_mv6p272a_s2ab', description: 'Mã học sinh (ID) để tra cứu hồ sơ' })
  async getStudentProfile(
    @Param('id') studentId: string,
    @CurrentUser() user: any,
  ) {
    const parentUid = user?.role === 'PARENT' ? user?.sub : undefined;
    return this.studentsService.getStudentProfile(studentId, parentUid);
  }

  @Get(':id/academic')
  @ApiOperation({ summary: 'Tra cứu Bảng điểm đa môn học (Cổng phụ huynh)' })
  @ApiParam({ name: 'id', example: 'stu_mv6p272a_s2ab', description: 'Mã học sinh' })
  async getAcademicRecord(
    @Param('id') studentId: string,
    @Query('semester') semester?: any,
    @CurrentUser() user?: any,
  ) {
    const parentUid = user?.role === 'PARENT' ? user?.sub : undefined;
    return this.studentsService.getAcademicRecord(
      studentId,
      semester !== undefined ? Number(semester) : undefined,
      parentUid,
    );
  }

  @Get(':id/attendance')
  @ApiOperation({ summary: 'Tra cứu Lịch sử chuyên cần & vắng học' })
  @ApiParam({ name: 'id', example: 'stu_mv6p272a_s2ab', description: 'Mã học sinh' })
  async getAttendanceHistory(
    @Param('id') studentId: string,
    @Query('month') month?: string,
    @CurrentUser() user?: any,
  ) {
    const parentUid = user?.role === 'PARENT' ? user?.sub : undefined;
    return this.studentsService.getAttendanceHistory(studentId, month, parentUid);
  }

  @Get(':id/fees-insurance')
  @ApiOperation({ summary: 'Xem tình trạng nộp Học phí & Bảo hiểm y tế (kèm ngày nộp)' })
  @ApiParam({ name: 'id', example: 'stu_mv6p272a_s2ab', description: 'Mã học sinh' })
  async getFeesInsuranceStatus(
    @Param('id') studentId: string,
    @CurrentUser() user?: any,
  ) {
    const parentUid = user?.role === 'PARENT' ? user?.sub : undefined;
    return this.studentsService.getFeesInsuranceStatus(studentId, parentUid);
  }

  @Get(':id/remarks')
  @ApiOperation({ summary: 'Xem Sổ liên lạc nhận xét từ thầy cô' })
  @ApiParam({ name: 'id', example: 'stu_mv6p272a_s2ab', description: 'Mã học sinh' })
  async getRemarks(
    @Param('id') studentId: string,
    @Query('semester') semester?: any,
    @CurrentUser() user?: any,
  ) {
    const parentUid = user?.role === 'PARENT' ? user?.sub : undefined;
    const remarks = await this.studentsService.getRemarks(studentId, parentUid);
    return {
      student_id: studentId,
      semester: semester !== undefined ? Number(semester) : 1,
      remarks,
    };
  }

  @Get(':id/exam-reminders')
  @ApiOperation({ summary: 'Xem Lời nhắc Lịch kiểm tra sắp tới' })
  @ApiParam({ name: 'id', example: 'stu_mv6p272a_s2ab', description: 'Mã học sinh' })
  async getExamReminders(
    @Param('id') studentId: string,
    @CurrentUser() user?: any,
  ) {
    const parentUid = user?.role === 'PARENT' ? user?.sub : undefined;
    return this.studentsService.getExamReminders(studentId, parentUid);
  }
}
