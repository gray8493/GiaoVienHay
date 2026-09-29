import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { FirebaseService } from '../../common/firebase/firebase.service';
import { GeminiService } from '../../common/gemini/gemini.service';
import { AttendanceService } from '../05-attendance/attendance.service';
import { GenerateQuizAiDto, InClassScoreInputDto } from './dto/quizzes.dto';
import { DifficultyLevel, GameMode, GradeType } from '@giaovienhay/shared-types';

@Injectable()
export class QuizzesService {
  private readonly logger = new Logger(QuizzesService.name);

  constructor(
    private readonly firebaseService: FirebaseService,
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

    // Giả lập đọc nội dung file giáo án hoặc text
    const lessonContent = file
      ? `Nội dung từ giáo án: ${file.originalname}`
      : `Bài giảng môn ${dto.subject_code} lớp ${dto.class_id}: ${dto.title}`;

    // Gọi Gemini AI sinh câu hỏi trắc nghiệm
    const questions = await this.geminiService.generateQuestionsFromLesson(
      lessonContent,
      dto.subject_code,
      numQuestions,
      difficulty,
    );

    const quizId = 'qz_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
    const quizData = {
      quiz_id: quizId,
      title: dto.title,
      subject_code: dto.subject_code,
      class_id: dto.class_id,
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
      created_at: new Date().toISOString(),
    };

    if (this.firebaseService.firestore) {
      try {
        await this.firebaseService.firestore.collection('quizzes').doc(quizId).set(quizData);
      } catch (e) {}
    }

    return quizData;
  }

  async getMyQuizzes(teacherId: string, classId?: string, subjectCode?: string) {
    return [
      {
        quiz_id: 'qz_88219',
        title: 'Kiểm tra bài 12: Phép cộng phân số',
        subject_code: 'MATH',
        class_id: 'cls_1a_2026',
        total_questions: 5,
        difficulty_level: DifficultyLevel.MEDIUM,
        created_at: '2026-09-29T08:00:00.000Z',
      },
    ];
  }

  async getQuizDetail(quizId: string) {
    if (this.firebaseService.firestore) {
      try {
        const doc = await this.firebaseService.firestore.collection('quizzes').doc(quizId).get();
        if (doc.exists) {
          return doc.data();
        }
      } catch (e) {}
    }

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
    // 1. Lấy thông tin lớp của bài quiz
    const quiz = await this.getQuizDetail(quizId);
    const classId = (quiz as any).class_id || 'cls_1a_2026';

    // 2. Lấy danh sách học sinh CÓ MẶT HÔM NAY từ phân hệ Attendance
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
      skip_policy: 'AUTO_SPIN_NEXT', // Nút Bỏ qua - Skip cho phép quay tiếp bạn khác
    };
  }

  async recordInClassScore(teacherId: string, quizId: string, dto: InClassScoreInputDto) {
    const resultId = 'res_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
    const now = new Date().toISOString();

    const quiz = await this.getQuizDetail(quizId);
    const classId = (quiz as any).class_id || 'cls_1a_2026';
    const subjectCode = (quiz as any).subject_code || 'MATH';

    // 1. Lưu vào /quiz_results
    if (this.firebaseService.firestore) {
      try {
        await this.firebaseService.firestore.collection('quiz_results').doc(resultId).set({
          id: resultId,
          quiz_id: quizId,
          student_id: dto.student_id,
          score: dto.score,
          mode_played: dto.mode_played || GameMode.STANDARD_QUIZ,
          teacher_note: dto.teacher_note || null,
          graded_by: teacherId,
          created_at: now,
        });
      } catch (e) {}
    }

    // 2. Tự động đồng bộ vào cột điểm miệng trong Sổ điểm môn học (/scores)
    let synced = false;
    if (dto.sync_to_scores_table !== false) {
      if (this.firebaseService.firestore) {
        try {
          const scoreDocId = `score_${classId}_${subjectCode}_${dto.student_id}_ORAL_TEST`;
          await this.firebaseService.firestore.collection('scores').doc(scoreDocId).set(
            {
              class_id: classId,
              subject_code: subjectCode,
              student_id: dto.student_id,
              semester: 1,
              score_type: GradeType.ORAL_TEST,
              score_value: dto.score,
              teacher_comment: dto.teacher_note || 'Điểm kiểm tra bài cũ',
              is_published: true,
              updated_at: now,
            },
            { merge: true },
          );
          synced = true;
        } catch (e) {}
      } else {
        synced = true;
      }
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
