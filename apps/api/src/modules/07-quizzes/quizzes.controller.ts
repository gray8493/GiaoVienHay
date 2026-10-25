import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { QuizzesService } from './quizzes.service';
import {
  GenerateQuizAiDto,
  InClassScoreInputDto,
  UpdateQuizQuestionDto,
  RegenerateQuizQuestionDto,
  CreateQuizQuestionDto,
} from './dto/quizzes.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Quizzes & Gamification')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Post('generate-ai')
  @Roles('TEACHER_*', 'ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 15 * 1024 * 1024 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload giáo án, chọn số câu, độ khó -> NVIDIA AI sinh câu hỏi trắc nghiệm',
    description: 'Giáo viên chủ động chọn số lượng câu hỏi và độ khó (EASY, MEDIUM, HARD, MIXED). AI phân tích và trả về bộ câu hỏi chỉ trong vài giây.',
  })
  async generateQuizFromAi(
    @CurrentUser('sub') teacherId: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() dto: GenerateQuizAiDto,
  ) {
    return this.quizzesService.generateQuizFromAi(teacherId, file, dto);
  }

  @Get()
  @Roles('TEACHER_*', 'ADMIN')
  @ApiOperation({ summary: 'Lấy danh sách các bộ bài kiểm tra/game đã tạo của giáo viên' })
  async getMyQuizzes(
    @CurrentUser('sub') teacherId: string,
    @Query('class_id') classId?: string,
    @Query('subject_code') subjectCode?: string,
  ) {
    return this.quizzesService.getMyQuizzes(teacherId, classId, subjectCode);
  }

  @Get(':id')
  @Roles('TEACHER_*', 'ADMIN')
  @ApiOperation({ summary: 'Lấy chi tiết bộ câu hỏi kèm đáp án (để trình chiếu Quiz hoặc nạp vào 3 Mini-game)' })
  async getQuizDetail(@Param('id') quizId: string) {
    return this.quizzesService.getQuizDetail(quizId);
  }

  @Get(':id/wheel-candidates')
  @Roles('TEACHER_*', 'ADMIN')
  @ApiOperation({
    summary: 'Lấy danh sách học sinh CÓ MẶT HÔM NAY cho Vòng quay may mắn (hỗ trợ nút Bỏ qua - Skip)',
    description: 'Tự động lọc những em có mặt hôm nay. Hỗ trợ nút Skip để nếu trúng bạn vắng mặt thì tự động quay tiếp bạn khác.',
  })
  async getWheelCandidates(@Param('id') quizId: string) {
    return this.quizzesService.getWheelCandidates(quizId);
  }

  @Put(':id/questions/:questionNumber')
  @Roles('TEACHER_*', 'ADMIN')
  @ApiOperation({ summary: 'Chỉnh sửa nội dung và đáp án câu hỏi trong bộ đề' })
  async updateQuestion(
    @CurrentUser('sub') teacherId: string,
    @Param('id') quizId: string,
    @Param('questionNumber') questionNumber: string,
    @Body() dto: UpdateQuizQuestionDto,
  ) {
    return this.quizzesService.updateQuestion(quizId, Number(questionNumber), dto, teacherId);
  }

  @Post(':id/questions/:questionNumber/regenerate')
  @Roles('TEACHER_*', 'ADMIN')
  @ApiOperation({ summary: 'Yêu cầu AI đổi và sinh lại riêng 1 câu hỏi' })
  async regenerateQuestion(
    @CurrentUser('sub') teacherId: string,
    @Param('id') quizId: string,
    @Param('questionNumber') questionNumber: string,
    @Body() dto: RegenerateQuizQuestionDto,
  ) {
    return this.quizzesService.regenerateQuestion(quizId, Number(questionNumber), dto, teacherId);
  }

  @Post(':id/questions')
  @Roles('TEACHER_*', 'ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Thêm câu hỏi trắc nghiệm thủ công vào bộ đề' })
  async addQuestion(
    @CurrentUser('sub') teacherId: string,
    @Param('id') quizId: string,
    @Body() dto: CreateQuizQuestionDto,
  ) {
    return this.quizzesService.addQuestion(quizId, dto, teacherId);
  }

  @Delete(':id/questions/:questionNumber')
  @Roles('TEACHER_*', 'ADMIN')
  @ApiOperation({ summary: 'Xóa bớt câu hỏi khỏi bộ đề' })
  async deleteQuestion(
    @CurrentUser('sub') teacherId: string,
    @Param('id') quizId: string,
    @Param('questionNumber') questionNumber: string,
  ) {
    return this.quizzesService.deleteQuestion(quizId, Number(questionNumber), undefined, teacherId);
  }

  @Post(':id/in-class-scores')
  @Roles('TEACHER_*', 'ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Giáo viên trực tiếp chấm và nhập điểm bài cũ tại lớp',
    description: 'Chấm điểm sau khi học sinh trả lời (dù qua Quiz hay 3 Mini-game); tự động đồng bộ vào cột điểm miệng trong Sổ điểm môn học.',
  })
  async recordInClassScore(
    @CurrentUser('sub') teacherId: string,
    @Param('id') quizId: string,
    @Body() dto: InClassScoreInputDto,
  ) {
    return this.quizzesService.recordInClassScore(teacherId, quizId, dto);
  }
}
