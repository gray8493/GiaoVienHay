import {
  Controller,
  Get,
  Post,
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
import { GenerateQuizAiDto, InClassScoreInputDto } from './dto/quizzes.dto';
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
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload giáo án, chọn số câu, độ khó -> Gemini AI sinh câu hỏi trắc nghiệm',
    description: 'Giáo viên chủ động chọn số lượng câu hỏi và độ khó (EASY, MEDIUM, HARD, MIXED). AI phân tích và trả về bộ câu hỏi chỉ trong vài giây.',
  })
  async generateQuizFromAi(
    @CurrentUser('sub') teacherId: string,
    @UploadedFile() file: Express.Multer.File,
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
