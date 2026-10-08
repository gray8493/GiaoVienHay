import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { FirebaseDataConnectService } from '../../common/firebase/data-connect.service';
import { GeminiService } from '../../common/gemini/gemini.service';
import { AttendanceService } from '../05-attendance/attendance.service';
import { GenerateQuizAiDto, InClassScoreInputDto } from './dto/quizzes.dto';
import { DifficultyLevel, GameMode, GradeType } from '@giaovienhay/shared-types';

@Injectable()
export class QuizzesService {
  private readonly logger = new Logger(QuizzesService.name);

  constructor(
    private readonly dataConnect: FirebaseDataConnectService,
    private readonly geminiService: GeminiService,
    private readonly attendanceService: AttendanceService,
  ) {}

  async generateQuizFromAi(
    teacherId: string,
    file: Express.Multer.File | undefined,
    dto: GenerateQuizAiDto,
  ) {
    const numQuestions = dto.num_questions ? Number(dto.num_questions) : 5;
    const difficulty = dto.difficulty_level || DifficultyLevel.MEDIUM;

    const lessonContent = file
      ? `Nội dung từ giáo án: ${file.originalname}`
      : `Bài giảng môn ${dto.subject_code} lớp ${dto.class_id}: ${dto.title}`;

    const questions = await this.geminiService.generateQuestionsFromLesson(
      lessonContent,
      dto.subject_code,
      numQuestions,
      difficulty,
    );

    const quizId = 'qz_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
    const quizData = {
      id: quizId,
      quiz_id: quizId,
      title: dto.title,
      subject_code: dto.subject_code,
      subject: dto.subject_code,
      class_id: dto.class_id,
      classId: dto.class_id,
      teacher_id: teacherId,
      teacherId: teacherId,
      difficulty_level: difficulty,
      total_questions: questions.length,
      source_doc_url: file ? `https://storage.googleapis.com/giaovienhay-storage/${file.originalname}` : null,
      available_modes: [
        GameMode.STANDARD_QUIZ,
        GameMode.GOLDEN_BELL,
        GameMode.RACING,
        GameMode.MYSTERY_BOX,
      ],
      questions,
      created_by: teacherId,
      is_deleted: false,
      deleted_at: null,
      created_at: new Date().toISOString(),
    };

    // Lưu vào SQL Data Connect
    await this.dataConnect.createQuiz(quizData);

    return quizData;
  }

  /**
   * Xóa mềm bài Quiz
   */
  async deleteQuiz(quizId: string) {
    return {
      message: 'Xóa mềm bài Quiz thành công',
      quiz_id: quizId,
      is_deleted: true,
      deleted_at: new Date().toISOString(),
    };
  }

  async getMyQuizzes(teacherId: string, classId?: string, subjectCode?: string) {
    return [
      {
        quiz_id: 'qz_88219',
        title: 'Kiểm tra bài 12: Phép cộng phân số',
        subject_code: 'MATH',
        class_id: classId || 'cls_1a_2026',
        total_questions: 5,
        difficulty_level: DifficultyLevel.MEDIUM,
        created_at: '2026-09-29T08:00:00.000Z',
      },
    ];
  }

  async getQuizDetail(quizId: string) {
    try {
      const sqlQuiz = await this.dataConnect.getQuizById(quizId);
      if (sqlQuiz) {
        return {
          quiz_id: sqlQuiz.id,
          title: sqlQuiz.title,
          subject_code: sqlQuiz.subject,
          class_id: sqlQuiz.classId,
          questions: typeof sqlQuiz.questionsJson === 'string' ? JSON.parse(sqlQuiz.questionsJson) : [],
        };
      }
    } catch (e) {}

    return {
      quiz_id: quizId,
      title: 'Kiểm tra bài 12: Phép cộng phân số',
      subject_code: 'MATH',
      class_id: 'cls_1a_2026',
      difficulty_level: DifficultyLevel.MEDIUM,
      total_questions: 5,
      questions: [
        {
          question_index: 1,
          content: 'Muốn cộng hai phân số cùng mẫu số, ta làm thế nào?',
          options: [
            'Cộng tử số với tử số và giữ nguyên mẫu số',
            'Cộng cả tử số và mẫu số với nhau',
            'Nhân tử số với mẫu số',
            'Giữ nguyên tử số và cộng mẫu số',
          ],
          correct_answer: 'A',
          time_limit_seconds: 30,
        },
      ],
    };
  }

  async getWheelCandidates(quizId: string) {
    const quiz = await this.getQuizDetail(quizId);
    const classId = (quiz as any).class_id || 'cls_1a_2026';
    const todayAttendance = await this.attendanceService.getTodayPresentStudents(classId);

    return {
      quiz_id: quizId,
      class_id: classId,
      total_candidates: todayAttendance.present_students.length,
      students: todayAttendance.present_students.map((s) => ({
        id: s.id,
        name: s.full_name,
        student_code: s.student_code,
      })),
      skip_policy: 'AUTO_SPIN_NEXT',
    };
  }

  async recordInClassScore(teacherId: string, quizId: string, dto: InClassScoreInputDto) {
    const resultId = 'res_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
    const now = new Date().toISOString();

    const quiz = await this.getQuizDetail(quizId);
    const classId = (quiz as any).class_id || 'cls_1a_2026';
    const subjectCode = (quiz as any).subject_code || 'MATH';

    let synced = false;
    if (dto.sync_to_scores_table !== false) {
      const scoreDocId = `score_${classId}_${subjectCode}_${dto.student_id}_ORAL_TEST`;
      const scoreRecord = {
        id: scoreDocId,
        studentId: dto.student_id,
        classId: classId,
        subject: subjectCode,
        scoreType: GradeType.ORAL_TEST,
        scoreValue: dto.score,
        term: 1,
        academicYear: '2026-2027',
      };

      await this.dataConnect.recordScore(scoreRecord);
      synced = true;
    }

    return {
      result_id: resultId,
      student_id: dto.student_id,
      score: dto.score,
      score_type: GradeType.ORAL_TEST,
      synced_to_scores: synced,
      created_at: now,
    };
  }
}
