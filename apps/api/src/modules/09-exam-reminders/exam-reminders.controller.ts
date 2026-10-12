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
import { ExamRemindersService } from './exam-reminders.service';
import { CreateExamReminderDto } from './dto/exam-reminders.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Exam Reminders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('exam-reminders')
export class ExamRemindersController {
  constructor(private readonly examRemindersService: ExamRemindersService) {}

  @Post()
  @Roles('TEACHER_*', 'ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Tạo lời nhắc lịch kiểm tra sắp tới',
    description: 'Tạo thông tin bài kiểm tra và tự động phát thông báo đẩy FCM tới toàn thể phụ huynh trong lớp.',
  })
  async createReminder(
    @CurrentUser('sub') teacherId: string,
    @Body() dto: CreateExamReminderDto,
  ) {
    return this.examRemindersService.createReminder(teacherId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Tra cứu và lọc danh sách lịch kiểm tra' })
  async getReminders(
    @CurrentUser('sub') userId: string,
    @Query('class_id') classId?: string,
    @Query('subject_code') subjectCode?: string,
    @Query('academic_year') academicYear?: string,
    @Query('term') term?: number,
  ) {
    return this.examRemindersService.getReminders(userId, { classId, subjectCode, academicYear, term });
  }

  @Get('class/:classId')
  @ApiOperation({ summary: 'Lấy danh sách các lịch kiểm tra sắp tới của lớp học' })
  async getClassReminders(
    @CurrentUser('sub') userId: string,
    @Param('classId') classId: string,
    @Query('subject_code') subjectCode?: string,
  ) {
    return this.examRemindersService.getClassReminders(classId, subjectCode, undefined, userId);
  }

  @Delete(':reminderId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xóa hoặc hủy bỏ lời nhắc kiểm tra' })
  async deleteReminder(
    @CurrentUser('sub') teacherId: string,
    @Param('reminderId') reminderId: string,
  ) {
    return this.examRemindersService.deleteReminder(reminderId, teacherId);
  }
}
