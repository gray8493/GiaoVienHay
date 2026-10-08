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
import { GradesService } from './grades.service';
import { BatchInputScoresDto, PublishScoresDto } from './dto/grades.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Grades & Leaderboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('grades')
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Get('class/:classId')
  @Roles('TEACHER_*', 'ADMIN')
  @ApiOperation({ summary: 'Xem sổ điểm môn học theo lớp, môn, học kỳ' })
  async getClassGrades(
    @Param('classId') classId: string,
    @Query('subject_code') subjectCode: string,
    @Query('semester') semester?: number,
  ) {
    return this.gradesService.getClassGrades(classId, subjectCode, semester ? Number(semester) : 1);
  }

  @Post('batch')
  @Roles('TEACHER_*', 'ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Nhập/cập nhật danh sách điểm thành phần (thang điểm 10)',
    description: 'Lưu trữ các đầu điểm do giáo viên nhập, không tự động tính GPA môn.',
  })
  async batchInputScores(
    @CurrentUser('sub') teacherId: string,
    @Body() dto: BatchInputScoresDto,
  ) {
    return this.gradesService.batchInputScores(teacherId, dto);
  }

  @Post('publish')
  @Roles('TEACHER_*', 'ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Phê duyệt & công bố cột điểm cho phụ huynh xem',
    description: 'Cập nhật is_published = true và kích hoạt thông báo đẩy FCM tới phụ huynh.',
  })
  async publishScores(
    @CurrentUser('sub') teacherId: string,
    @Body() dto: PublishScoresDto,
  ) {
    return this.gradesService.publishScores(teacherId, dto);
  }

  @Get('leaderboard/:classId')
  @Roles('TEACHER_*', 'ADMIN')
  @ApiOperation({ summary: 'Lấy dữ liệu Bảng xếp hạng điểm môn học để vinh danh tại lớp' })
  async getLeaderboard(
    @Param('classId') classId: string,
    @Query('subject_code') subjectCode: string,
    @Query('semester') semester?: number,
    @Query('limit') limit?: number,
  ) {
    return this.gradesService.getLeaderboard(
      classId,
      subjectCode,
      semester ? Number(semester) : 1,
      limit ? Number(limit) : 5,
    );
  }
}
