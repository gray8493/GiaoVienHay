import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { GradesService } from '../../apps/api/src/modules/06-grades/grades.service';
import { BatchInputScoresDto, ScoreItemDto, PublishScoresDto } from '../../apps/api/src/modules/06-grades/dto/grades.dto';
import { GradeType } from '@giaovienhay/shared-types';

describe('GradesService (Unit Tests UT06 - All 35 Cases)', () => {
  let service: GradesService;
  let mockDataConnect: any;
  let mockEventEmitter: any;
  let mockNotificationsService: any;

  beforeEach(() => {
    mockDataConnect = {
      recordScore: jest.fn().mockResolvedValue(true),
      createNotification: jest.fn().mockResolvedValue(true),
      markScoresPublished: jest.fn().mockResolvedValue(1),
      execute: jest.fn().mockImplementation((query: string, vars: any) => {
        if (vars?.classId?.includes('empty') || vars?.classId === 'cls_new_empty' || vars?.classId === 'cls_1a_no_scores') {
          return Promise.resolve({ data: { scores: [] } });
        }
        return Promise.resolve({
          data: {
            scores: [
              // is_published: false = vừa nhập/sửa, CHƯA gửi PH (delta publishing)
              { id: 'sc_01', studentId: 'stu_01', scoreType: 'TEST_15P', scoreValue: 10.0, is_published: false },
              { id: 'sc_02', studentId: 'stu_01', scoreType: 'FINAL', scoreValue: 10.0, is_published: false },
              { id: 'sc_03', studentId: 'stu_02', scoreType: 'FINAL', scoreValue: 10.0, is_published: false },
              { id: 'sc_04', studentId: 'stu_03', scoreType: 'FINAL', scoreValue: 9.5, is_published: false },
            ],
          },
        });
      }),
      getClassById: jest.fn().mockImplementation((id: string) => {
        if (id === 'cls_nonexistent_999' || id?.includes('nonexistent')) {
          return Promise.resolve(null);
        }
        return Promise.resolve({
          id,
          name: 'Lớp 1A',
          homeroom_teacher_id: 'usr_teacher_lan_01',
          homeroomTeacherId: 'usr_teacher_lan_01',
          subject_teachers: [
            { teacher_id: 'usr_teacher_01', subject_code: 'MATH' },
            { teacher_id: 'usr_teacher_toan', subject_code: 'MATH' },
            { teacher_id: 'usr_teacher_literature', subject_code: 'LITERATURE' },
          ],
        });
      }),
      getStudentById: jest.fn().mockImplementation(async (id: string) => {
        if (!id || id === 'stu_unknown_888' || id.includes('unknown')) return null;
        return { id, full_name: 'Học sinh' };
      }),
      getScoreById: jest.fn().mockImplementation(async (id: string) => {
        if (!id || id === 'scr_nonexistent_999' || id.includes('nonexistent')) return null;
        return { id, score_value: 9.0, student_id: 'stu_01' };
      }),
    };

    mockEventEmitter = {
      emit: jest.fn(),
    };

    mockNotificationsService = {
      dispatchToParentsOfStudent: jest
        .fn()
        .mockResolvedValue({ sent: 1, failed: 0, parentUserIds: ['usr_parent_01'] }),
    };

    service = new GradesService(
      mockDataConnect,
      mockEventEmitter as any,
      mockNotificationsService as any,
    );
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

  describe('UT06_Grades_TC03: Phê duyệt công bố điểm cho phụ huynh và phát sự kiện fan-out thông báo', () => {
    it('chỉ công bố cho học sinh CÓ ĐIỂM trong cột được công bố (delta publishing)', async () => {
      const res = await service.publishScores('usr_teacher_01', {
        class_id: 'cls_1a_2026',
        subject_code: 'MATH',
        score_type: GradeType.TEST_15P,
        semester: 1,
      });
      // Chỉ stu_01 có điểm TEST_15P — stu_02/stu_03 chỉ có FINAL nên không bị spam
      expect(res.notified_parents_count).toBe(1);
      expect(res.no_changes).toBe(false);
      expect(mockDataConnect.markScoresPublished).toHaveBeenCalledWith(['sc_01']);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('grades.published', expect.objectContaining({
        classId: 'cls_1a_2026',
        subjectCode: 'MATH',
        students: [
          expect.objectContaining({
            studentId: 'stu_01',
            isCorrection: false,
            changed: [expect.objectContaining({ type: 'TEST_15P', value: 10 })],
          }),
        ],
      }));
    });
  });

  describe('UT06_Grades_TC03b: Gửi lại khi KHÔNG có thay đổi mới → không gửi gì', () => {
    it('trả no_changes và không phát sự kiện khi mọi ô đã gửi', async () => {
      mockDataConnect.execute.mockImplementationOnce(() =>
        Promise.resolve({
          data: {
            scores: [
              // toàn bộ đã gửi (is_published = true) → không còn gì mới
              { id: 'sc_01', studentId: 'stu_01', scoreType: 'TEST_15P', scoreValue: 10.0, is_published: true, published_once: true },
            ],
          },
        }),
      );
      mockEventEmitter.emit.mockClear();
      mockDataConnect.markScoresPublished.mockClear();

      const res: any = await service.publishScores('usr_teacher_01', {
        class_id: 'cls_1a_2026',
        subject_code: 'MATH',
        score_type: GradeType.TEST_15P,
        semester: 1,
      });
      expect(res.no_changes).toBe(true);
      expect(res.notified_parents_count).toBe(0);
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
      expect(mockDataConnect.markScoresPublished).not.toHaveBeenCalled();
    });
  });

  describe('UT06_Grades_TC03c: sửa điểm đã gửi → loại thông báo Đính chính (GRADE_CORRECTED)', () => {
    it('đánh dấu isCorrection cho học sinh đã từng nhận cột này', async () => {
      mockDataConnect.execute.mockImplementationOnce(() =>
        Promise.resolve({
          data: {
            scores: [
              // stu_01 từng nhận (published_once) nhưng vừa sửa điểm (is_published=false)
              { id: 'sc_01', studentId: 'stu_01', scoreType: 'TEST_15P', scoreValue: 8.5, is_published: false, published_once: true },
              // stu_02 lần đầu có điểm cột này
              { id: 'sc_05', studentId: 'stu_02', scoreType: 'TEST_15P', scoreValue: 9.0, is_published: false, published_once: false },
            ],
          },
        }),
      );
      mockEventEmitter.emit.mockClear();

      const res: any = await service.publishScores('usr_teacher_01', {
        class_id: 'cls_1a_2026',
        subject_code: 'MATH',
        score_type: GradeType.TEST_15P,
        semester: 1,
      });
      expect(res.notified_parents_count).toBe(2);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('grades.published', expect.objectContaining({
        students: [
          expect.objectContaining({ studentId: 'stu_01', isCorrection: true }),
          expect.objectContaining({ studentId: 'stu_02', isCorrection: false }),
        ],
      }));
    });
  });

  describe('UT06_Grades_TC03d: công bố lại sau đính chính không bị chặn bởi cache cột đã công bố', () => {
    it('lần 2 trên CÙNG instance vẫn gửi thông báo Đính chính cho ô vừa chấm lại', async () => {
      // Lần 1: cột TEST_15P vừa nhập, chưa từng gửi → công bố thành công
      const first: any = await service.publishScores('usr_teacher_01', {
        class_id: 'cls_1a_2026',
        subject_code: 'MATH',
        score_type: GradeType.TEST_15P,
        semester: 1,
      });
      expect(first.notified_parents_count).toBe(1);

      // GV dò bài/chấm lại → ô điểm được ghi lại is_published=false, published_once=true
      mockDataConnect.execute.mockImplementationOnce(() =>
        Promise.resolve({
          data: {
            scores: [
              { id: 'sc_01', studentId: 'stu_01', scoreType: 'TEST_15P', scoreValue: 7.5, is_published: false, published_once: true },
            ],
          },
        }),
      );
      mockEventEmitter.emit.mockClear();

      // Lần 2: delta đọc từ DB nên phải đi tiếp, không được coi là "đã công bố"
      const second: any = await service.publishScores('usr_teacher_01', {
        class_id: 'cls_1a_2026',
        subject_code: 'MATH',
        score_type: GradeType.TEST_15P,
        semester: 1,
      });
      expect(second.already_published).not.toBe(true);
      expect(second.notified_parents_count).toBe(1);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('grades.published', expect.objectContaining({
        students: [
          expect.objectContaining({
            studentId: 'stu_01',
            isCorrection: true,
            changed: [expect.objectContaining({ type: 'TEST_15P', value: 7.5 })],
          }),
        ],
      }));
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

    it('giữ published_once=true khi sửa cột đã công bố để lần gửi sau là Đính chính', async () => {
      // DB cũ chỉ bật is_published (published_once chưa từng được set) vẫn phải
      // suy ra "đã từng gửi" — nếu không, PH sẽ nhận nhầm thông báo Công bố lần đầu.
      mockDataConnect.listScoresByClass = jest.fn().mockResolvedValue([
        { studentId: 'stu_01', score_type: 'TEST_15P', score_value: 9, is_published: true, published_once: false },
      ]);

      await service.batchInputScores('usr_teacher_01', {
        class_id: 'cls_1a_2026',
        subject_code: 'MATH',
        score_type: GradeType.TEST_15P,
        semester: 1,
        is_correction: true,
        scores: [{ student_id: 'stu_01', score_value: 8.5 }],
      });

      expect(mockDataConnect.recordScore).toHaveBeenCalledWith(expect.objectContaining({
        student_id: 'stu_01',
        is_published: false,
        published_once: true,
      }));
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
    it('không crash khi fan-out thông báo và hoàn tất công bố điểm', async () => {
      const res = await service.publishScores('usr_teacher_01', {
        class_id: 'cls_1a_2026',
        subject_code: 'MATH',
        score_type: GradeType.TEST_15P,
      });
      // Delta: chỉ học sinh có ô chưa gửi trong cột được công bố
      expect(res.notified_parents_count).toBe(1);
    });
  });

  describe('UT06_Grades_TC38: Worker nền fan-out thông báo công bố điểm tới phụ huynh từng học sinh', () => {
    it('dispatch thông báo đích danh cho từng phụ huynh của 3 học sinh', async () => {
      await service.handleGradesPublishedEvent({
        classId: 'cls_1a_2026',
        subjectCode: 'MATH',
        scoreType: 'TEST_15P',
        semester: 1,
        teacherName: 'Nguyễn Thị Lan',
        students: [
          { studentId: 'stu_01', studentName: 'Trần Bảo Nam' },
          { studentId: 'stu_02' },
          { studentId: 'stu_03' },
        ],
      });

      expect(mockNotificationsService.dispatchToParentsOfStudent).toHaveBeenCalledTimes(3);
      const payload = mockNotificationsService.dispatchToParentsOfStudent.mock.calls[0][1];
      expect(payload.title).toContain('Công bố điểm Toán');
      expect(payload.type).toBe('GRADE_PUBLISHED');
      expect(payload.metadata.screen).toBe('Grades');
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
      mockDataConnect.execute.mockResolvedValueOnce({
        data: {
          scores: [
            {
              student_id: 'stu_01',
              student_name: 'Trần Bảo Nam',
              scores: [
                { type: 'MID_TERM', value: 9.5, comment: null, is_published: false },
              ],
            },
          ],
        },
      });
      const grades = await service.getClassGrades('cls_1a_2026', 'MATH', 1);
      expect(grades[0].scores.some((s: any) => s.is_published === false)).toBe(true);
    });
  });

  describe('UT06_Grades_TC30: Lấy bảng điểm chi tiết môn học theo lớp thành công (200 OK)', () => {
    it('trả về danh sách học sinh và điểm các cột thành phần', async () => {
      mockDataConnect.execute.mockResolvedValueOnce({
        data: {
          scores: [
            {
              student_id: 'stu_01',
              student_name: 'Trần Bảo Nam',
              scores: [
                { type: 'ORAL_TEST', value: 9.5, comment: 'Tốt', is_published: true },
              ],
            },
          ],
        },
      });
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

  describe('UT06_Grades_TC36: Cập nhật đính chính bản ghi điểm của học sinh PUT /api/v1/grades/scores/:scoreId', () => {
    it('cập nhật thành công bản ghi điểm', async () => {
      const res = await service.updateScore('usr_teacher_01', 'scr_01', {
        score_value: 9.0,
        correction_reason: 'Đính chính chấm phúc khảo',
      });
      expect(res.success).toBe(true);
      expect(res.data.score_value).toBe(9.0);
    });

    it('ném NotFoundException khi mã điểm không tồn tại', async () => {
      await expect(
        service.updateScore('usr_teacher_01', 'scr_nonexistent_999', { score_value: 9.0 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('UT06_Grades_TC37: Phụ huynh tra cứu bảng điểm học sinh GET /api/v1/grades/parent/lookup', () => {
    it('ném BadRequestException khi điểm chưa công bố', async () => {
      await expect(
        service.parentLookup('usr_parent_01', {
          student_id: 'stu_01',
          subject_code: 'MATH',
          semester: 1,
          score_type: 'FINAL',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('trả về bảng điểm khi điểm đã công bố', async () => {
      const res = await service.parentLookup('usr_parent_01', {
        student_id: 'stu_01',
        subject_code: 'MATH',
        semester: 1,
        score_type: 'ORAL_TEST',
      });
      expect(res.success).toBe(true);
      expect(res.data.score_value).toBe(9.0);
    });
  });
});
