import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GradesService } from './grades.service';
import {
  BatchInputScoresDto,
  PublishScoresDto,
  UpdateScoreDto,
  ParentLookupScoreDto,
} from './dto/grades.dto';
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
    @CurrentUser('sub') teacherId: string,
    @Param('classId') classId: string,
    @Query('subject_code') subjectCode: string,
    @Query('semester') semester?: number,
  ) {
    return this.gradesService.getClassGrades(
      classId,
      subjectCode,
      semester ? Number(semester) : 1,
      teacherId,
    );
  }

  @Get('parent/lookup')
  @ApiOperation({ summary: 'Phụ huynh tra cứu bảng điểm học sinh' })
  async parentLookup(
    @CurrentUser('sub') parentId: string,
    @Query() query: ParentLookupScoreDto,
  ) {
    return this.gradesService.parentLookup(parentId, {
      student_id: query.student_id,
      subject_code: query.subject_code,
      semester: query.semester ? Number(query.semester) : 1,
      score_type: query.score_type || 'FINAL',
    });
  }

  @Put('scores/:scoreId')
  @Roles('TEACHER_*', 'ADMIN')
  @ApiOperation({ summary: 'Cập nhật/đính chính bản ghi điểm của học sinh' })
  async updateScore(
    @CurrentUser('sub') teacherId: string,
    @Param('scoreId') scoreId: string,
    @Body() dto: UpdateScoreDto,
  ) {
    return this.gradesService.updateScore(teacherId, scoreId, dto);
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
