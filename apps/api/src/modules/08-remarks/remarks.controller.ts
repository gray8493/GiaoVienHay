import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RemarksService } from './remarks.service';
import { CreateRemarkDto } from './dto/remarks.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Remarks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('remarks')
export class RemarksController {
  constructor(private readonly remarksService: RemarksService) {}

  @Post()
  @Roles('TEACHER_*', 'ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Gửi lời nhận xét ngắn gọn cho học sinh',
    description: 'Sử dụng đoạn văn bản ngắn thuần túy (không dùng tags phức tạp) và tự động kích hoạt thông báo FCM tới phụ huynh.',
  })
  async createRemark(
    @CurrentUser() user: any,
    @Body() dto: CreateRemarkDto,
  ) {
    return this.remarksService.createRemark(user?.sub, dto, {
      role: user?.role,
      assignedSubjects: user?.teaching_subjects || user?.assignedSubjects,
    });
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Xem lịch sử nhận xét của học sinh' })
  async getStudentRemarks(
    @Param('studentId') studentId: string,
  ) {
    return this.remarksService.getStudentRemarks(studentId);
  }

  @Get('class/:classId')
  @Roles('TEACHER_*', 'ADMIN')
  @ApiOperation({ summary: 'Xem danh sách các nhận xét đã gửi trong lớp học' })
  async getClassRemarks(
    @Param('classId') classId: string,
    @Query('student_id') studentId?: string,
    @Query('limit') limit?: number,
  ) {
    return this.remarksService.getClassRemarks(classId, limit ? Number(limit) : 20, studentId);
  }

  @Patch(':id/acknowledge')
  @Roles('PARENT')
  @ApiOperation({ summary: 'Phụ huynh bấm "Xác nhận đã đọc" nhận xét của giáo viên' })
  async acknowledgeRemark(
    @Param('id') remarkId: string,
    @CurrentUser('sub') parentId: string,
  ) {
    return this.remarksService.acknowledgeRemark(remarkId, parentId);
  }
}
