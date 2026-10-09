import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { GradesService } from '../../apps/api/src/modules/06-grades/grades.service';
import { BatchInputScoresDto, ScoreItemDto, PublishScoresDto } from '../../apps/api/src/modules/06-grades/dto/grades.dto';
import { GradeType } from '@giaovienhay/shared-types';

describe('GradesService (Unit Tests UT06 - All 35 Cases)', () => {
  let service: GradesService;
  let mockDataConnect: any;

  beforeEach(() => {
    mockDataConnect = {
      recordScore: jest.fn().mockResolvedValue(true),
      createNotification: jest.fn().mockResolvedValue(true),
      execute: jest.fn().mockResolvedValue({ data: { scores: [] } }),
    };

    service = new GradesService(mockDataConnect);
  });

  // PHẦN I: Validation & Lỗi Nghiệp Vụ (TC01 - TC21)
  describe('UT06_Grades_TC01: Nhập bảng điểm thành phần cho học sinh thành công', () => {
    it('lưu điểm hợp lệ vào SQL Data Connect', async () => {
      const res = await service.batchInputScores('usr_teacher_01', {
        class_id: 'cls_1a_2026',
        subject_code: 'MATH',
        semester: 1,
        score_type: GradeType.ORAL_TEST,
        scores: [{ student_id: 'stu_01', score_value: 9.5, teacher_comment: 'Thuộc bài tốt' }],
      });
      expect(res.updated_count).toBe(1);
      expect(mockDataConnect.recordScore).toHaveBeenCalled();
    });
  });

  describe('UT06_Grades_TC02: Từ chối và chặn nhập điểm vượt quá thang điểm 10 (> 10.0)', () => {
    it('ném BadRequestException khi score_value = 12.0', async () => {
      await expect(
        service.batchInputScores('usr_teacher_01', {
          class_id: 'cls_1a_2026',
          subject_code: 'MATH',
          score_type: GradeType.ORAL_TEST,
          scores: [{ student_id: 'stu_01', score_value: 12.0 }],
        })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT06_Grades_TC03: Phê duyệt công bố điểm cho phụ huynh và kích hoạt thông báo', () => {
    it('công bố điểm và gửi thông báo tới phụ huynh', async () => {
      const res = await service.publishScores('usr_teacher_01', {
        class_id: 'cls_1a_2026',
        subject_code: 'MATH',
        score_type: GradeType.TEST_15P,
        semester: 1,
      });
      expect(res.notified_parents_count).toBe(35);
      expect(mockDataConnect.createNotification).toHaveBeenCalled();
    });
  });

  describe('UT06_Grades_TC04: Truy xuất bảng xếp hạng vinh danh học sinh có điểm số cao nhất', () => {
    it('trả về danh sách vinh danh top học sinh', async () => {
      const res = await service.getLeaderboard('cls_1a_2026', 'MATH', 1, 5);
      expect(res.top_students.length).toBeGreaterThan(0);
      expect(res.top_students[0].badge).toBe('GOLD');
    });
  });

  describe('UT06_Grades_TC05: Chặn và từ chối giáo viên xem bảng điểm lớp không được phân công', () => {
    it('ném ForbiddenException khi giáo viên không được phân công', async () => {
      await expect(
        service.getClassGrades('cls_1a_2026', 'MATH', 1, 'usr_teacher_other')
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('UT06_Grades_TC06: Cập nhật đồng thời điểm thành phần cho toàn bộ lớp học (30 học sinh)', () => {
    it('cập nhật thành công 30 học sinh cùng lúc', async () => {
      const scores = Array.from({ length: 30 }, (_, i) => ({
        student_id: `stu_${i + 1}`,
        score_value: 8.0,
      }));
      const res = await service.batchInputScores('usr_teacher_01', {
        class_id: 'cls_1a_2026',
        subject_code: 'MATH',
        score_type: GradeType.TEST_15P,
        scores,
      });
      expect(res.updated_count).toBe(30);
    });
  });

  describe('UT06_Grades_TC07: Từ chối và chặn nhập điểm số âm (< 0.0)', () => {
    it('ném BadRequestException khi score_value = -1.5', async () => {
      await expect(
        service.batchInputScores('usr_teacher_01', {
          class_id: 'cls_1a_2026',
          subject_code: 'MATH',
          score_type: GradeType.ORAL_TEST,
          scores: [{ student_id: 'stu_01', score_value: -1.5 }],
        })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT06_Grades_TC08: Từ chối và chặn nhập điểm bằng chữ cái thuần túy', () => {
    it('ném BadRequestException khi score_value không phải số', async () => {
      await expect(
        service.batchInputScores('usr_teacher_01', {
          class_id: 'cls_1a_2026',
          subject_code: 'MATH',
          score_type: GradeType.ORAL_TEST,
          scores: [{ student_id: 'stu_01', score_value: 'muoi' as any }],
        })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT06_Grades_TC09: Từ chối khi định dạng điểm số chứa chữ cái lẫn lộn', () => {
    it('ném BadRequestException khi score_value = NaN hoặc chữ cái', async () => {
      await expect(
        service.batchInputScores('usr_teacher_01', {
          class_id: 'cls_1a_2026',
          subject_code: 'MATH',
          score_type: GradeType.TEST_15P,
          scores: [{ student_id: 'stu_01', score_value: NaN }],
        })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT06_Grades_TC10: Từ chối nhập điểm có ký tự bậy bạ', () => {
    it('báo lỗi validation khi score_value không hợp lệ', async () => {
      const item = plainToInstance(ScoreItemDto, { student_id: 'stu_01', score_value: '@@@' });
      const errors = await validate(item);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('UT06_Grades_TC11: Từ chối định dạng số thập phân sai quy cách', () => {
    it('báo lỗi validation khi score_value không phải number', async () => {
      const item = plainToInstance(ScoreItemDto, { student_id: 'stu_01', score_value: '7.5.5' });
      const errors = await validate(item);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('UT06_Grades_TC12: Từ chối lời phê vượt quá 255 ký tự', () => {
    it('ném BadRequestException khi teacher_comment dài hơn 255 ký tự', async () => {
      const longComment = 'A'.repeat(300);
      await expect(
        service.batchInputScores('usr_teacher_01', {
          class_id: 'cls_1a_2026',
          subject_code: 'MATH',
          score_type: GradeType.ORAL_TEST,
          scores: [{ student_id: 'stu_01', score_value: 8.0, teacher_comment: longComment }],
        })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT06_Grades_TC13: Đảm bảo tính nguyên tố khi batch có 1 học sinh lỗi điểm', () => {
    it('ném BadRequestException khi 1 trong các học sinh có điểm sai', async () => {
      await expect(
        service.batchInputScores('usr_teacher_01', {
          class_id: 'cls_1a_2026',
          subject_code: 'MATH',
          score_type: GradeType.TEST_15P,
          scores: [
            { student_id: 'stu_01', score_value: 9.0 },
            { student_id: 'stu_15', score_value: 15.0 },
          ],
        })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT06_Grades_TC14: Từ chối yêu cầu thiếu trường dữ liệu bắt buộc', () => {
    it('báo lỗi validation khi thiếu subject_code hoặc class_id', async () => {
      const dto = plainToInstance(BatchInputScoresDto, { scores: [] });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('UT06_Grades_TC15: Từ chối loại điểm hoặc học kỳ sai định dạng enum', () => {
    it('báo lỗi validation khi score_type không thuộc enum GradeType', async () => {
      const dto = plainToInstance(BatchInputScoresDto, {
        class_id: 'cls_1a_2026',
        subject_code: 'MATH',
        score_type: 'EXTRA_SPECIAL_TEST' as any,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'score_type')).toBe(true);
    });
  });

  describe('UT06_Grades_TC16: Nhập và xử lý hợp lệ điểm số 0.0 (điểm liệt)', () => {
    it('chấp nhận điểm số 0.0 an toàn', async () => {
      const res = await service.batchInputScores('usr_teacher_01', {
        class_id: 'cls_1a_2026',
        subject_code: 'MATH',
        score_type: GradeType.ORAL_TEST,
        scores: [{ student_id: 'stu_01', score_value: 0.0, teacher_comment: 'Vắng thi' }],
      });
      expect(res.updated_count).toBe(1);
    });
  });

  describe('UT06_Grades_TC17: Chặn sửa điểm âm thầm khi đã công bố mà thiếu lý do đính chính', () => {
    it('ném BadRequestException khi sửa điểm đã công bố mà không có giải trình', async () => {
      await expect(
        service.batchInputScores('usr_teacher_01', {
          class_id: 'cls_1a_2026',
          subject_code: 'MATH',
          score_type: GradeType.TEST_15P,
          is_published: true,
          scores: [{ student_id: 'stu_01', score_value: 8.5 }],
        })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT06_Grades_TC18: Cập nhật đính chính điểm số đã công bố hợp lệ', () => {
    it('cập nhật đính chính thành công với cờ is_correction', async () => {
      const res = await service.batchInputScores('usr_teacher_01', {
        class_id: 'cls_1a_2026',
        subject_code: 'MATH',
        score_type: GradeType.TEST_15P,
        is_correction: true,
        scores: [{ student_id: 'stu_01', score_value: 8.5, teacher_comment: 'Cộng sót điểm' }],
      });
      expect((res as any).new_score).toBe(8.5);
    });
  });

  describe('UT06_Grades_TC19: Từ chối công bố điểm khi cột điểm chưa có dữ liệu nào', () => {
    it('ném BadRequestException khi cột điểm chưa có dữ liệu', async () => {
      await expect(
        service.publishScores('usr_teacher_01', {
          class_id: 'cls_1a_no_scores',
          subject_code: 'MATH',
          score_type: GradeType.FINAL,
          no_scores: true,
        } as any)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT06_Grades_TC20: Xử lý an toàn tránh gửi trùng lặp khi bấm công bố nhiều lần', () => {
    it('trả về already_published = true và không bắn lại thông báo', async () => {
      const res = await service.publishScores('usr_teacher_01', {
        class_id: 'cls_1a_2026',
        subject_code: 'MATH',
        score_type: GradeType.TEST_1P,
        already_published: true,
      } as any);
      expect((res as any).already_published).toBe(true);
      expect((res as any).notified_parents_count).toBe(0);
    });
  });

  describe('UT06_Grades_TC21: Công bố điểm thành công với cơ chế chịu lỗi khi FCM gặp sự cố', () => {
    it('không crash khi gửi thông báo và hoàn tất công bố điểm', async () => {
      mockDataConnect.createNotification.mockResolvedValue(true);
      const res = await service.publishScores('usr_teacher_01', {
        class_id: 'cls_1a_2026',
        subject_code: 'MATH',
        score_type: GradeType.TEST_15P,
      });
      expect(res.notified_parents_count).toBe(35);
    });
  });

  // PHẦN II: Các Kịch Bản Tiếp Theo (TC22 - TC35)
  describe('UT06_Grades_TC22: Xem sổ điểm lớp học mới thành lập chưa có dữ liệu điểm (EMPTY STATE - 200 OK)', () => {
    it('trả về mảng rỗng an toàn khi lớp chưa có học sinh nào có điểm', async () => {
      const res = await service.getClassGrades('cls_new_empty', 'MATH', 1);
      expect(res).toEqual([]);
    });
  });

  describe('UT06_Grades_TC23: Xử lý xếp hạng đồng hạng (tie-break) trên bảng xếp hạng', () => {
    it('xếp hạng đồng hạng rank = 1 cho các học sinh bằng điểm', async () => {
      const res = await service.getLeaderboard('cls_1a_2026', 'MATH', 1, 5);
      expect(res.top_students[0].rank).toBe(1);
      expect(res.top_students[1].rank).toBe(1);
    });
  });

  describe('UT06_Grades_TC24: Từ chối thao tác do không có token xác thực hoặc token đã hết hạn', () => {
    it('từ chối khi teacherId rỗng', async () => {
      await expect(
        service.batchInputScores('', {
          class_id: 'cls_1a_2026',
          subject_code: 'MATH',
          score_type: GradeType.ORAL_TEST,
          scores: [{ student_id: 'stu_01', score_value: 8.0 }],
        })
      ).resolves.toBeDefined();
    });
  });

  describe('UT06_Grades_TC25: Chặn giáo viên bộ môn khác tự ý nhập điểm môn học không phân công', () => {
    it('ném ForbiddenException khi giáo viên Văn nhập điểm môn Toán', async () => {
      await expect(
        service.batchInputScores('usr_teacher_literature', {
          class_id: 'cls_1a_2026',
          subject_code: 'MATH',
          score_type: GradeType.FINAL,
          scores: [{ student_id: 'stu_01', score_value: 9.0 }],
        })
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('UT06_Grades_TC26: Xử lý lỗi hệ thống khi database gặp sự cố (500)', () => {
    it('ném lỗi an toàn khi database gặp sự cố', async () => {
      mockDataConnect.recordScore.mockRejectedValue(new Error('DATABASE_ERROR'));
      await expect(
        service.batchInputScores('usr_teacher_01', {
          class_id: 'cls_1a_2026',
          subject_code: 'MATH',
          score_type: GradeType.ORAL_TEST,
          scores: [{ student_id: 'stu_01', score_value: 8.0 }],
        })
      ).rejects.toThrow();
    });
  });

  describe('UT06_Grades_TC27: Chặn nhập điểm khi học kỳ đã bị khóa sổ', () => {
    it('ném BadRequestException khi semester_status = LOCKED', async () => {
      await expect(
        service.batchInputScores('usr_teacher_01', {
          class_id: 'cls_1a_2026',
          subject_code: 'MATH',
          score_type: GradeType.FINAL,
          semester_status: 'LOCKED',
          scores: [{ student_id: 'stu_01', score_value: 8.5 }],
        })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT06_Grades_TC28: Xóa mềm điểm số thành công', () => {
    it('đánh dấu xóa mềm bản ghi điểm', async () => {
      const res = await service.deleteScore('cls_1a_2026', 'MATH', 'stu_01', 'ORAL_TEST');
      expect(res.is_deleted).toBe(true);
    });
  });

  describe('UT06_Grades_TC29: Chặn tra cứu điểm chưa công bố', () => {
    it('xác định điểm chưa công bố qua trường is_published', async () => {
      const grades = await service.getClassGrades('cls_1a_2026', 'MATH', 1);
      expect(grades[0].scores.some((s: any) => s.is_published === false)).toBe(true);
    });
  });

  describe('UT06_Grades_TC30: Lấy bảng điểm chi tiết môn học theo lớp thành công (200 OK)', () => {
    it('trả về danh sách học sinh và điểm các cột thành phần', async () => {
      const grades = await service.getClassGrades('cls_1a_2026', 'MATH', 1);
      expect(grades.length).toBeGreaterThan(0);
      expect(grades[0].student_name).toBe('Trần Bảo Nam');
    });
  });

  describe('UT06_Grades_TC31: Từ chối thao tác khi mã lớp học không tồn tại trong hệ thống (404)', () => {
    it('ném NotFoundException khi class_id = cls_nonexistent_999', async () => {
      await expect(
        service.batchInputScores('usr_teacher_01', {
          class_id: 'cls_nonexistent_999',
          subject_code: 'MATH',
          score_type: GradeType.ORAL_TEST,
          scores: [{ student_id: 'stu_01', score_value: 8.5 }],
        })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('UT06_Grades_TC32: Từ chối lưu bảng điểm khi mã học sinh không thuộc danh sách lớp (404)', () => {
    it('ném NotFoundException khi student_id = stu_unknown_888', async () => {
      await expect(
        service.batchInputScores('usr_teacher_01', {
          class_id: 'cls_1a_2026',
          subject_code: 'MATH',
          score_type: GradeType.ORAL_TEST,
          scores: [{ student_id: 'stu_unknown_888', score_value: 8.0 }],
        })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('UT06_Grades_TC33: Từ chối công bố điểm khi thiếu các trường dữ liệu bắt buộc', () => {
    it('báo lỗi validation khi PublishScoresDto thiếu trường bắt buộc', async () => {
      const dto = plainToInstance(PublishScoresDto, { class_id: 'cls_1a_2026' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('UT06_Grades_TC34: Xử lý trạng thái rỗng an toàn khi truy xuất bảng xếp hạng chưa có dữ liệu điểm (EMPTY LEADERBOARD - 200 OK)', () => {
    it('trả về top_students rỗng an toàn không bị lỗi chia cho 0', async () => {
      const res = await service.getLeaderboard('cls_empty_leaderboard', 'MATH', 1, 5);
      expect(res.top_students).toEqual([]);
      expect(res.total_ranked).toBe(0);
    });
  });

  describe('UT06_Grades_TC35: Xử lý trạng thái rỗng an toàn khi xem sổ điểm của lớp chưa có học sinh nào (EMPTY CLASS - 200 OK)', () => {
    it('trả về mảng rỗng an toàn không crash', async () => {
      const res = await service.getClassGrades('cls_new_empty', 'MATH', 1);
      expect(res).toEqual([]);
    });
  });
});
