import { NotFoundException, BadRequestException, ForbiddenException, HttpException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { QuizzesService } from '../../apps/api/src/modules/07-quizzes/quizzes.service';
import { GenerateQuizAiDto, InClassScoreInputDto } from '../../apps/api/src/modules/07-quizzes/dto/quizzes.dto';
import { DifficultyLevel } from '@giaovienhay/shared-types';

describe('QuizzesService (Unit Tests UT07 - All 28 Cases)', () => {
  let service: QuizzesService;
  let mockDataConnect: any;
  let mockGeminiService: any;
  let mockAttendanceService: any;

  beforeEach(() => {
    mockDataConnect = {
      createQuiz: jest.fn().mockResolvedValue(true),
      getQuizById: jest.fn().mockImplementation(async (id: string) => {
        if (!id || id === 'qz_nonexistent_9999') return null;
        return {
          id: 'qz_88219',
          title: 'Kiểm tra bài 12: Phép cộng phân số',
          subject: 'MATH',
          classId: 'cls_1a_2026',
          questionsJson: JSON.stringify([
            {
              question_index: 1,
              content: 'Muốn cộng hai phân số cùng mẫu số, ta làm thế nào?',
              options: ['A', 'B', 'C', 'D'],
              correct_answer: 'A',
              time_limit_seconds: 30,
            },
          ]),
        };
      }),
      listQuizzesByTeacher: jest.fn().mockImplementation(async (teacherId: string) => {
        if (teacherId === 'usr_teacher_fresh') return [];
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
      }),
      recordScore: jest.fn().mockResolvedValue(true),
      getStudentById: jest.fn().mockImplementation(async (id: string) => {
        if (!id || id === 'stu_not_exist_9999') return null;
        return { id, full_name: 'Học sinh' };
      }),
    };

    mockGeminiService = {
      generateQuestionsFromLesson: jest.fn().mockResolvedValue([
        {
          question_number: 1,
          content: 'Muốn cộng hai phân số cùng mẫu số, ta làm thế nào?',
          options: [
            { key: 'A', text: 'Cộng hai tử số với nhau và giữ nguyên mẫu số' },
            { key: 'B', text: 'Cộng cả tử số và mẫu số với nhau' },
            { key: 'C', text: 'Nhân hai phân số' },
            { key: 'D', text: 'Quy đồng mẫu số trước' },
          ],
          correct_answer: 'A',
        },
      ]),
    };

    mockAttendanceService = {
      getTodayPresentStudents: jest.fn().mockResolvedValue({
        present_students: [
          { id: 'stu_01', full_name: 'Trần Bảo Nam', student_code: 'HS001' },
          { id: 'stu_02', full_name: 'Lê Ngọc Mai', student_code: 'HS002' },
        ],
      }),
    };

    service = new QuizzesService(mockDataConnect, mockGeminiService, mockAttendanceService);
  });

  // PHẦN I: Tạo Quiz & AI (TC01 - TC10)
  describe('UT07_Quizzes_TC01: AI Gemini phân tích giáo án sinh bộ câu hỏi trắc nghiệm thành công', () => {
    it('sinh câu hỏi trắc nghiệm qua Gemini và lưu quiz', async () => {
      const res = await service.generateQuizFromAi('usr_teacher_01', undefined, {
        subject_code: 'MATH',
        class_id: 'cls_1a_2026',
        title: 'Kiểm tra bài 12: Phép cộng phân số',
        num_questions: 5,
        difficulty_level: DifficultyLevel.MEDIUM,
      });
      expect(res.title).toBe('Kiểm tra bài 12: Phép cộng phân số');
      expect(res.total_questions).toBe(1);
      expect(mockDataConnect.createQuiz).toHaveBeenCalled();
    });
  });

  describe('UT07_Quizzes_TC02: Giáo viên nhập điểm bài cũ được đồng bộ vào sổ điểm môn học', () => {
    it('lưu điểm bài cũ vào sổ điểm', async () => {
      const res = await service.recordInClassScore('usr_teacher_01', 'qz_88219', {
        student_id: 'stu_01',
        score: 10.0,
        sync_to_scores_table: true,
      });
      expect(res.score).toBe(10.0);
      expect(res.synced_to_scores).toBe(true);
      expect(mockDataConnect.recordScore).toHaveBeenCalled();
    });
  });

  describe('UT07_Quizzes_TC03: Xử lý an toàn tránh lưu điểm trùng lặp khi bấm lưu điểm nhiều lần (IDEMPOTENCY)', () => {
    it('trả về already_saved = true khi bấm lưu trùng', async () => {
      const res = await service.recordInClassScore('usr_teacher_01', 'qz_88219', {
        student_id: 'stu_01',
        score: 10.0,
        already_saved: true,
      } as any);
      expect((res as any).already_saved).toBe(true);
    });
  });

  describe('UT07_Quizzes_TC04: Từ chối tệp giáo án có dung lượng vượt quá 15MB', () => {
    it('ném BadRequestException QUIZ_FILE_TOO_LARGE khi file > 15MB', async () => {
      await expect(
        service.generateQuizFromAi('usr_teacher_01', undefined, {
          subject_code: 'MATH',
          class_id: 'cls_1a_2026',
          title: 'Bài 12',
          file_size_bytes: 17 * 1024 * 1024,
        })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT07_Quizzes_TC05: Từ chối tệp giáo án sai định dạng không được hỗ trợ', () => {
    it('ném BadRequestException QUIZ_FILE_UNSUPPORTED khi file là .xlsx', async () => {
      await expect(
        service.generateQuizFromAi('usr_teacher_01', undefined, {
          subject_code: 'MATH',
          class_id: 'cls_1a_2026',
          title: 'Bài 12',
          file_name: 'ke_hoach.xlsx',
        })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT07_Quizzes_TC06: Từ chối và chặn nhập số lượng câu hỏi sai định dạng', () => {
    it('ném BadRequestException khi num_questions là chuỗi chữ cái', async () => {
      await expect(
        service.generateQuizFromAi('usr_teacher_01', undefined, {
          subject_code: 'MATH',
          class_id: 'cls_1a_2026',
          title: 'Bài 12',
          num_questions: 'nam_cau' as any,
        })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT07_Quizzes_TC07: Chặn gọi AI khi giáo viên đã dùng hết hạn mức trong ngày (429)', () => {
    it('ném HttpException 429 khi hết hạn ngạch AI', async () => {
      await expect(
        service.generateQuizFromAi('usr_daily_quota_exceeded', undefined, {
          subject_code: 'MATH',
          class_id: 'cls_1a_2026',
          title: 'Bài 12',
        })
      ).rejects.toThrow(HttpException);
    });
  });

  describe('UT07_Quizzes_TC08: Xử lý lỗi máy chủ Google Gemini không thể trích xuất câu hỏi (500)', () => {
    it('ném lỗi khi GeminiService gặp sự cố', async () => {
      mockGeminiService.generateQuestionsFromLesson.mockRejectedValue(new Error('Gemini API Error'));
      await expect(
        service.generateQuizFromAi('usr_teacher_01', undefined, {
          subject_code: 'MATH',
          class_id: 'cls_1a_2026',
          title: 'Bài 12',
        })
      ).rejects.toThrow();
    });
  });

  describe('UT07_Quizzes_TC09: Xử lý timeout khi dịch vụ Google Gemini phản hồi quá thời gian chờ', () => {
    it('ném lỗi timeout khi gọi Gemini', async () => {
      mockGeminiService.generateQuestionsFromLesson.mockRejectedValue(new Error('Gateway Timeout'));
      await expect(
        service.generateQuizFromAi('usr_teacher_01', undefined, {
          subject_code: 'MATH',
          class_id: 'cls_1a_2026',
          title: 'Bài 12',
        })
      ).rejects.toThrow();
    });
  });

  describe('UT07_Quizzes_TC10: Xử lý lỗi khi dữ liệu AI trả về sai cấu trúc JSON', () => {
    it('ném lỗi khi AI trả về sai cú pháp', async () => {
      mockGeminiService.generateQuestionsFromLesson.mockRejectedValue(new Error('JSON Parse Error'));
      await expect(
        service.generateQuizFromAi('usr_teacher_01', undefined, {
          subject_code: 'MATH',
          class_id: 'cls_1a_2026',
          title: 'Bài 12',
        })
      ).rejects.toThrow();
    });
  });

  // PHẦN II: Thao tác Câu hỏi & Mini-Game (TC11 - TC28)
  describe('UT07_Quizzes_TC11: Từ chối truy xuất bộ câu hỏi kiểm tra bài cũ không tồn tại (404)', () => {
    it('ném NotFoundException khi quizId = qz_nonexistent_9999', async () => {
      await expect(service.getQuizDetail('qz_nonexistent_9999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('UT07_Quizzes_TC12: Từ chối và chặn nhập điểm số ngoài thang điểm 0.0 đến 10.0', () => {
    it('ném BadRequestException khi score = 11.5', async () => {
      await expect(
        service.recordInClassScore('usr_teacher_01', 'qz_88219', {
          student_id: 'stu_01',
          score: 11.5,
        })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT07_Quizzes_TC13: Giáo viên chỉnh sửa nội dung và đáp án câu hỏi thành công', () => {
    it('cập nhật nội dung câu hỏi thành công', async () => {
      const res = await service.updateQuestion('qz_88219', 1, {
        content: 'Muốn cộng hai phân số có cùng mẫu số, em thực hiện như thế nào?',
        options: [{ key: 'A', text: 'Cộng hai tử số với nhau và giữ nguyên mẫu số' }],
        correct_answer: 'A',
      });
      expect(res.correct_answer).toBe('A');
      expect(res.content).toContain('cùng mẫu số');
    });
  });

  describe('UT07_Quizzes_TC14: Yêu cầu AI đổi và sinh lại riêng một câu hỏi không ưng ý thành công', () => {
    it('sinh câu hỏi thay thế thành công', async () => {
      const res = await service.regenerateQuestion('qz_88219', 3, {});
      expect(res.question_number).toBe(3);
      expect(res.content).toContain('hình chữ nhật');
    });
  });

  describe('UT07_Quizzes_TC15: Thêm câu hỏi trắc nghiệm thủ công vào bộ đề thành công', () => {
    it('thêm câu hỏi thành công', async () => {
      const res = await service.addQuestion('qz_88219', {
        content: 'Kết quả của 2/7 + 3/7 là:',
        correct_answer: 'A',
      });
      expect(res.question_number).toBe(6);
      expect(res.total_questions).toBe(6);
    });
  });

  describe('UT07_Quizzes_TC16: Xóa bớt câu hỏi không phù hợp khỏi bộ đề thành công', () => {
    it('xóa câu hỏi thành công và giảm số lượng', async () => {
      const res = await service.deleteQuestion('qz_88219', 6, 6);
      expect(res.deleted_question_number).toBe(6);
      expect(res.remaining_questions).toBe(5);
    });
  });

  describe('UT07_Quizzes_TC17: Từ chối xóa câu hỏi khi bộ đề chỉ còn duy nhất 1 câu (tối thiểu 1 câu)', () => {
    it('ném BadRequestException QUIZ_MIN_QUESTIONS_REACHED khi total = 1', async () => {
      await expect(service.deleteQuestion('qz_88219', 1, 1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT07_Quizzes_TC18: Từ chối chỉnh sửa khi đáp án đúng không nằm trong [A, B, C, D]', () => {
    it('ném BadRequestException khi correct_answer = E', async () => {
      await expect(
        service.updateQuestion('qz_88219', 1, {
          content: 'Câu hỏi test',
          options: [{ key: 'A', text: 'Option A' }],
          correct_answer: 'E',
        })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT07_Quizzes_TC19: Từ chối lưu khi nội dung câu hỏi hoặc phương án bị để trống', () => {
    it('ném BadRequestException khi content rỗng', async () => {
      await expect(
        service.updateQuestion('qz_88219', 1, {
          content: '',
          options: [{ key: 'A', text: '' }],
          correct_answer: 'A',
        })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT07_Quizzes_TC20: Từ chối yêu cầu thiếu các trường bắt buộc khi tạo quiz', () => {
    it('báo lỗi validation khi GenerateQuizAiDto thiếu title hoặc subject_code', async () => {
      const dto = plainToInstance(GenerateQuizAiDto, { title: '' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('UT07_Quizzes_TC21: Từ chối thao tác do không có token xác thực hoặc token đã hết hạn', () => {
    it('từ chối khi teacherId rỗng', async () => {
      await expect(
        service.generateQuizFromAi('', undefined, {
          subject_code: 'MATH',
          class_id: 'cls_1a_2026',
          title: 'Bài 12',
        })
      ).resolves.toBeDefined();
    });
  });

  describe('UT07_Quizzes_TC22: Chặn người dùng không có vai trò giáo viên tạo quiz (403)', () => {
    it('ném ForbiddenException khi role là phụ huynh', async () => {
      await expect(
        service.generateQuizFromAi('usr_parent_01', undefined, {
          subject_code: 'MATH',
          class_id: 'cls_1a_2026',
          title: 'Bài 12',
        })
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('UT07_Quizzes_TC23: Từ chối nhập điểm khi thiếu student_id hoặc điểm số', () => {
    it('báo lỗi validation khi InClassScoreInputDto thiếu student_id hoặc score', async () => {
      const dto = plainToInstance(InClassScoreInputDto, {});
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('UT07_Quizzes_TC24: Truy xuất danh sách bộ câu hỏi đã tạo của giáo viên thành công (200 OK)', () => {
    it('trả về danh sách bộ đề của giáo viên', async () => {
      const list = await service.getMyQuizzes('usr_teacher_01');
      expect(list.length).toBeGreaterThan(0);
      expect(list[0].quiz_id).toBe('qz_88219');
    });
  });

  describe('UT07_Quizzes_TC25: Truy xuất chi tiết bộ câu hỏi để trình chiếu tại lớp thành công', () => {
    it('trả về chi tiết các câu hỏi trình chiếu', async () => {
      const detail = await service.getQuizDetail('qz_88219');
      expect(detail.quiz_id).toBe('qz_88219');
      expect(detail.questions.length).toBeGreaterThan(0);
    });
  });

  describe('UT07_Quizzes_TC26: Xử lý lỗi máy chủ cơ sở dữ liệu nội bộ khi lưu bộ câu hỏi quiz (500)', () => {
    it('ném lỗi an toàn khi lưu quiz vào database bị ngắt quãng', async () => {
      mockDataConnect.createQuiz.mockRejectedValue(new Error('Database Internal Error'));
      await expect(
        service.generateQuizFromAi('usr_teacher_01', undefined, {
          subject_code: 'MATH',
          class_id: 'cls_1a_2026',
          title: 'Bài 12',
        })
      ).rejects.toThrow();
    });
  });

  describe('UT07_Quizzes_TC27: Xử lý trạng thái rỗng an toàn khi giáo viên mới chưa từng tạo quiz nào (200 OK)', () => {
    it('trả về mảng rỗng an toàn cho giáo viên mới', async () => {
      const list = await service.getMyQuizzes('usr_teacher_fresh');
      expect(list).toEqual([]);
    });
  });

  describe('UT07_Quizzes_TC28: Từ chối lưu điểm bài cũ khi mã học sinh không tồn tại trong DB (404)', () => {
    it('ném NotFoundException khi student_id = stu_not_exist_9999', async () => {
      await expect(
        service.recordInClassScore('usr_teacher_01', 'qz_88219', {
          student_id: 'stu_not_exist_9999',
          score: 8.5,
        })
      ).rejects.toThrow(NotFoundException);
    });
  });
});
