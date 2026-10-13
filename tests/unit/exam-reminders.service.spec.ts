import { ExamRemindersService } from '../../apps/api/src/modules/09-exam-reminders/exam-reminders.service';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { GradeType } from '@giaovienhay/shared-types';

describe('ExamRemindersService (Unit Tests UT09 - All 26 Cases)', () => {
  let service: ExamRemindersService;
  let mockDataConnect: any;

  beforeEach(() => {
    mockDataConnect = {
      createExamReminder: jest.fn().mockResolvedValue(true),
      getExamRemindersByClass: jest.fn().mockImplementation(async (classId: string) => {
        if (classId === 'cls_empty') return [];
        return [
          {
            id: 'exm_4412',
            class_id: classId,
            teacher_id: 'usr_teacher_lan_01',
            teacher_name: 'Nguyễn Thị Lan',
            subject_code: 'MATH',
            subject_name: 'Toán học',
            exam_type: 'TEST_15P',
            exam_date: '2026-09-30',
            message: 'Thứ Sáu tới lớp sẽ có bài kiểm tra 15 phút môn Toán.',
            created_at: '2026-09-27T10:30:00.000Z',
          },
          {
            id: 'exm_4413',
            class_id: classId,
            teacher_id: 'usr_teacher_eng_02',
            teacher_name: 'Trần Thị Mai',
            subject_code: 'ENG',
            subject_name: 'Tiếng Anh',
            exam_type: 'TEST_1P',
            exam_date: '2026-10-05',
            message: 'Lớp sẽ có bài kiểm tra 1 tiết môn Tiếng Anh.',
            created_at: '2026-09-27T10:35:00.000Z',
          },
        ];
      }),
      createNotification: jest.fn().mockResolvedValue(true),
    };

    service = new ExamRemindersService(mockDataConnect);
  });

  describe('UT09_ExamReminders_TC01: Từ chối tạo lời nhắc khi không chọn hoặc để trống mã lớp học', () => {
    it('ném BadRequestException khi class_id rỗng', async () => {
      await expect(
        service.createReminder('usr_teacher_01', {
          class_id: '',
          subject_code: 'MATH',
          exam_type: GradeType.TEST_15P,
          exam_date: '2026-09-30',
          message: 'Các con ôn tập kỹ bài 5 và 6 về phép cộng trong phạm vi 10.',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT09_ExamReminders_TC02: Từ chối tạo lời nhắc khi không chọn hoặc để trống mã môn học', () => {
    it('ném BadRequestException khi subject_code rỗng', async () => {
      await expect(
        service.createReminder('usr_teacher_01', {
          class_id: 'cls_1a_2026',
          subject_code: '',
          exam_type: GradeType.TEST_15P,
          exam_date: '2026-09-30',
          message: 'Các con ôn tập kỹ bài 5 và 6 về phép cộng trong phạm vi 10.',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT09_ExamReminders_TC03: Từ chối tạo lời nhắc khi không chọn hoặc để trống loại bài kiểm tra', () => {
    it('ném BadRequestException khi exam_type rỗng', async () => {
      await expect(
        service.createReminder('usr_teacher_01', {
          class_id: 'cls_1a_2026',
          subject_code: 'MATH',
          exam_type: '' as any,
          exam_date: '2026-09-30',
          message: 'Các con ôn tập kỹ bài 5 và 6 về phép cộng trong phạm vi 10.',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT09_ExamReminders_TC04: Từ chối tạo lời nhắc khi không nhập hoặc để trống ngày kiểm tra', () => {
    it('ném BadRequestException khi exam_date rỗng', async () => {
      await expect(
        service.createReminder('usr_teacher_01', {
          class_id: 'cls_1a_2026',
          subject_code: 'MATH',
          exam_type: GradeType.TEST_15P,
          exam_date: '',
          message: 'Các con ôn tập kỹ bài 5 và 6 về phép cộng trong phạm vi 10.',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT09_ExamReminders_TC05: Từ chối tạo lời nhắc khi không nhập hoặc nội dung dặn dò chỉ có khoảng trắng', () => {
    it('ném BadRequestException khi message chỉ có khoảng trắng', async () => {
      await expect(
        service.createReminder('usr_teacher_01', {
          class_id: 'cls_1a_2026',
          subject_code: 'MATH',
          exam_type: GradeType.TEST_15P,
          exam_date: '2026-09-30',
          message: '   ',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT09_ExamReminders_TC06: Từ chối tạo lời nhắc khi lời dặn dò ôn thi quá ngắn (dưới 10 ký tự)', () => {
    it('ném BadRequestException khi message < 10 ký tự', async () => {
      await expect(
        service.createReminder('usr_teacher_01', {
          class_id: 'cls_1a_2026',
          subject_code: 'MATH',
          exam_type: GradeType.TEST_15P,
          exam_date: '2026-09-30',
          message: 'Thi nhé',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT09_ExamReminders_TC07: Từ chối tạo lời nhắc khi lời dặn dò vượt quá độ dài tối đa (trên 500 ký tự)', () => {
    it('ném BadRequestException khi message > 500 ký tự', async () => {
      const longMessage = 'A'.repeat(550);
      await expect(
        service.createReminder('usr_teacher_01', {
          class_id: 'cls_1a_2026',
          subject_code: 'MATH',
          exam_type: GradeType.FINAL,
          exam_date: '2026-12-20',
          message: longMessage,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT09_ExamReminders_TC08: Từ chối tạo lời nhắc khi ngày kiểm tra không tồn tại trong lịch thực tế', () => {
    it('ném BadRequestException khi exam_date là 2026-02-30', async () => {
      await expect(
        service.createReminder('usr_teacher_01', {
          class_id: 'cls_1a_2026',
          subject_code: 'MATH',
          exam_type: GradeType.TEST_15P,
          exam_date: '2026-02-30',
          message: 'Kiểm tra 15 phút môn Toán về cộng trừ phạm vi 10.',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT09_ExamReminders_TC09: Từ chối tạo lời nhắc khi ngày kiểm tra đã trôi qua trong quá khứ', () => {
    it('ném BadRequestException EXAM_DATE_INVALID khi ngày trong quá khứ', async () => {
      await expect(
        service.createReminder('usr_teacher_01', {
          class_id: 'cls_1a_2026',
          subject_code: 'MATH',
          exam_type: GradeType.TEST_15P,
          exam_date: '2026-09-01',
          message: 'Kiểm tra 15 phút môn Toán về cộng trừ phạm vi 10.',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT09_ExamReminders_TC10: Từ chối tạo lời nhắc khi loại bài kiểm tra ngoài danh mục cho phép', () => {
    it('ném BadRequestException EXAM_TYPE_INVALID khi loại bài không hợp lệ', async () => {
      await expect(
        service.createReminder('usr_teacher_01', {
          class_id: 'cls_1a_2026',
          subject_code: 'MATH',
          exam_type: 'KIEM_TRA_DOT_XUAT' as any,
          exam_date: '2026-09-30',
          message: 'Kiểm tra đột xuất kiến thức cũ về hình học',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT09_ExamReminders_TC11: Chặn giáo viên chưa được phân công giảng dạy môn học tạo lời nhắc', () => {
    it('ném ForbiddenException ACAD_NOT_ASSIGNED_TEACHER khi chưa phân công', async () => {
      await expect(
        service.createReminder(
          'usr_teacher_other',
          {
            class_id: 'cls_1a_2026',
            subject_code: 'MATH',
            exam_type: GradeType.TEST_15P,
            exam_date: '2026-09-30',
            message: 'Lời nhắc từ giáo viên không có thẩm quyền đối với bộ môn này.',
          },
          { assignedSubjects: ['LIT'] },
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('UT09_ExamReminders_TC12: Báo lỗi khi tạo lời nhắc với mã lớp học không tồn tại', () => {
    it('ném NotFoundException CLASS_NOT_FOUND khi mã lớp không tồn tại', async () => {
      await expect(
        service.createReminder('usr_teacher_01', {
          class_id: 'cls_nonexistent_999',
          subject_code: 'MATH',
          exam_type: GradeType.TEST_15P,
          exam_date: '2026-09-30',
          message: 'Kiểm tra 15 phút môn Toán về cộng trừ phạm vi 10.',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('UT09_ExamReminders_TC13: Báo lỗi khi tra cứu danh sách lịch kiểm tra với mã lớp học không tồn tại', () => {
    it('ném NotFoundException CLASS_NOT_FOUND khi tra cứu lớp không tồn tại', async () => {
      await expect(service.getClassReminders('cls_khong_ton_tai')).rejects.toThrow(NotFoundException);
    });
  });

  describe('UT09_ExamReminders_TC14: Chặn người dùng không thuộc lớp học xem danh sách lịch kiểm tra', () => {
    it('ném ForbiddenException AUTH_FORBIDDEN khi người dùng không thuộc lớp', async () => {
      await expect(
        service.getClassReminders('cls_1a_2026', undefined, { isMember: false }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('UT09_ExamReminders_TC15: Báo lỗi khi xóa lời nhắc kiểm tra với mã lời nhắc không tồn tại', () => {
    it('ném NotFoundException EXAM_REMINDER_NOT_FOUND khi mã lời nhắc không tồn tại', async () => {
      await expect(service.deleteReminder('exm_khong_ton_tai')).rejects.toThrow(NotFoundException);
    });
  });

  describe('UT09_ExamReminders_TC16: Chặn giáo viên không phải tác giả hoặc GVCN xóa lời nhắc kiểm tra', () => {
    it('ném ForbiddenException AUTH_FORBIDDEN khi giáo viên khác xóa', async () => {
      await expect(
        service.deleteReminder('exm_4412', 'usr_teacher_other', false),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('UT09_ExamReminders_TC17: Chặn truy cập khi thiếu token hoặc token không hợp lệ', () => {
    it('ném UnauthorizedException AUTH_UNAUTHORIZED khi teacherId rỗng', async () => {
      await expect(
        service.createReminder('', {
          class_id: 'cls_1a_2026',
          subject_code: 'MATH',
          exam_type: GradeType.TEST_15P,
          exam_date: '2026-09-30',
          message: 'Lời nhắc kiểm tra môn Toán',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('UT09_ExamReminders_TC18: Xử lý ngoại lệ lỗi máy chủ nội bộ hoặc sự cố dịch vụ Firebase FCM', () => {
    it('ném InternalServerErrorException SYS_INTERNAL_ERROR khi database/FCM bị lỗi', async () => {
      mockDataConnect.createExamReminder.mockRejectedValue(new Error('Firebase connection dropped'));

      await expect(
        service.createReminder('usr_teacher_01', {
          class_id: 'cls_1a_2026',
          subject_code: 'MATH',
          exam_type: GradeType.TEST_15P,
          exam_date: '2026-09-30',
          message: 'Thứ Sáu tới lớp sẽ có bài kiểm tra 15 phút môn Toán về phép cộng.',
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('UT09_ExamReminders_TC19: Tạo lời nhắc kiểm tra 15 phút thành công và tự động phát thông báo FCM tới phụ huynh', () => {
    it('tạo lời nhắc TEST_15P thành công và thông báo phụ huynh', async () => {
      const res = await service.createReminder('usr_teacher_toan', {
        class_id: 'cls_1a_2026',
        subject_code: 'MATH',
        exam_type: GradeType.TEST_15P,
        exam_date: '2026-09-30',
        message: 'Thứ Sáu tới lớp sẽ có bài kiểm tra 15 phút môn Toán về phép cộng trong phạm vi 10. Kính nhờ quý phụ huynh nhắc các con ôn kỹ bài 5 và 6.',
      });

      expect(res.reminder_id).toBeDefined();
      expect(res.class_id).toBe('cls_1a_2026');
      expect(res.subject_code).toBe('MATH');
      expect(res.notified_parents).toBe(36);
    });
  });

  describe('UT09_ExamReminders_TC20: Tạo lời nhắc kiểm tra định kỳ 1 tiết thành công', () => {
    it('tạo lời nhắc TEST_1P thành công', async () => {
      const res = await service.createReminder('usr_gvbm_eng', {
        class_id: 'cls_1a_2026',
        subject_code: 'ENG',
        exam_type: GradeType.TEST_1P,
        exam_date: '2026-10-05',
        message: 'Lớp sẽ có bài kiểm tra 1 tiết môn Tiếng Anh vào ngày 05/10. Nội dung ôn tập gồm từ vựng và mẫu câu Unit 1 và Unit 2.',
      });

      expect(res.reminder_id).toBeDefined();
      expect(res.subject_code).toBe('ENG');
      expect(res.notified_parents).toBe(36);
    });
  });

  describe('UT09_ExamReminders_TC21: Tạo lời nhắc kiểm tra định kỳ giữa kỳ / cuối kỳ thành công', () => {
    it('tạo lời nhắc MID_TERM thành công', async () => {
      const res = await service.createReminder('usr_gvbm_lit', {
        class_id: 'cls_1a_2026',
        subject_code: 'LIT',
        exam_type: GradeType.MID_TERM,
        exam_date: '2026-10-20',
        message: 'Lịch thi Giữa học kỳ 1 môn Tiếng Việt sẽ diễn ra vào ngày 20/10. Phụ huynh đôn đốc các con luyện đọc diễn cảm và rèn chữ viết hoa.',
      });

      expect(res.reminder_id).toBeDefined();
      expect(res.subject_code).toBe('LIT');
      expect(res.notified_parents).toBe(36);
    });
  });

  describe('UT09_ExamReminders_TC22: Lấy toàn bộ danh sách lịch kiểm tra sắp tới của lớp học thành công', () => {
    it('trả về danh sách lịch kiểm tra sắp tới', async () => {
      const res = await service.getClassReminders('cls_1a_2026');

      expect(Array.isArray(res)).toBe(true);
      expect((res as any[]).length).toBe(2);
      expect((res as any[])[0].subject_code).toBe('MATH');
      expect((res as any[])[1].subject_code).toBe('ENG');
    });
  });

  describe('UT09_ExamReminders_TC23: Lọc danh sách lịch kiểm tra theo mã môn học thành công', () => {
    it('chỉ lọc môn MATH thành công', async () => {
      const res = await service.getClassReminders('cls_1a_2026', 'MATH');

      expect(Array.isArray(res)).toBe(true);
      expect((res as any[]).length).toBe(1);
      expect((res as any[])[0].subject_code).toBe('MATH');
    });
  });

  describe('UT09_ExamReminders_TC24: Giáo viên xóa hoặc hủy bỏ lời nhắc kiểm tra thành công', () => {
    it('xóa lời nhắc thành công', async () => {
      const res = await service.deleteReminder('exm_4412');

      expect(res.success).toBe(true);
      expect(res.status_code).toBe(200);
      expect(res.data.reminder_id).toBe('exm_4412');
    });
  });

  describe('UT09_ExamReminders_TC25: Xử lý trạng thái rỗng an toàn khi lớp học chưa có lời nhắc lịch kiểm tra nào trong cơ sở dữ liệu', () => {
    it('trả về mảng rỗng và total = 0 khi lớp chưa có lời nhắc', async () => {
      const res = (await service.getClassReminders('cls_1a_2026', undefined, { isClassEmpty: true })) as any;

      expect(res.class_id).toBe('cls_1a_2026');
      expect(res.total).toBe(0);
      expect(res.reminders).toEqual([]);
    });
  });

  describe('UT09_ExamReminders_TC26: Xử lý trạng thái rỗng an toàn khi lọc danh sách lịch kiểm tra theo môn học không có dữ liệu trong DB', () => {
    it('trả về mảng rỗng và total = 0 khi môn học không có lịch thi', async () => {
      const res = (await service.getClassReminders('cls_1a_2026', 'TIN')) as any;

      expect(res.class_id).toBe('cls_1a_2026');
      expect(res.subject_code).toBe('TIN');
      expect(res.total).toBe(0);
      expect(res.reminders).toEqual([]);
    });
  });

  describe('UT09_ExamReminders_TC27: Tra cứu và lọc danh sách lời nhắc thi GET /api/v1/exam-reminders', () => {
    it('trả về danh sách lời nhắc thi khi truyền userId', async () => {
      const res = await service.getReminders('usr_teacher_lan_01');
      expect(Array.isArray(res)).toBe(true);
      expect((res as any[]).length).toBe(2);
    });

    it('ném UnauthorizedException khi userId rỗng', async () => {
      await expect(service.getReminders('')).rejects.toThrow(UnauthorizedException);
    });
  });
});
