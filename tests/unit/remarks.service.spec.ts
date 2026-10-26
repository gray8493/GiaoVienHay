import { RemarksService } from '../../apps/api/src/modules/08-remarks/remarks.service';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateRemarkDto } from '../../apps/api/src/modules/08-remarks/dto/remarks.dto';

describe('RemarksService (Unit Tests UT08 - All 16 Cases)', () => {
  let service: RemarksService;
  let mockDataConnect: any;
  let mockNotificationsService: any;

  beforeEach(() => {
    mockDataConnect = {
      createRemark: jest.fn().mockResolvedValue(true),
      getRemarksByStudent: jest.fn().mockResolvedValue([]),
      createNotification: jest.fn().mockResolvedValue(true),
      getStudentById: jest.fn().mockImplementation(async (id: string) => {
        if (!id || id === 'stu_nonexistent_9999') return null;
        return { id, class_id: 'cls_1a_2026', full_name: 'Trần Bảo Nam', parent_uids: ['usr_parent_01'] };
      }),
      getRemarksByClass: jest.fn().mockImplementation(async (classId: string) => {
        if (classId === 'cls_new_2026') return [];
        return [
          {
            remark_id: 'rmk_9912',
            student_id: 'stu_01',
            subject_code: 'MATH',
            content: 'Hôm nay em Nam tiếp thu bài rất nhanh và hăng hái xung phong lên bảng chữa bài tập.',
            created_at: '2026-09-23T10:15:00.000Z',
          },
        ];
      }),
    };

    mockNotificationsService = {
      dispatchToParentsOfStudent: jest
        .fn()
        .mockResolvedValue({ sent: 1, failed: 0, parentUserIds: ['usr_parent_01'] }),
    };

    service = new RemarksService(mockDataConnect, mockNotificationsService as any);
  });

  describe('UT08_Remarks_TC01: Gửi lời nhận xét ngắn gọn và bắn thông báo FCM cho phụ huynh', () => {
    it('lưu nhận xét và fan-out thông báo đúng tới phụ huynh', async () => {
      const res = await service.createRemark('usr_teacher_01', {
        student_id: 'stu_01',
        class_id: 'cls_1a_2026',
        subject_code: 'MATH',
        content: 'Hôm nay em Nam tiếp thu bài rất nhanh và hăng hái xung phong lên bảng chữa bài tập.',
      });

      expect(res.student_id).toBe('stu_01');
      expect(res.remark_id).toBeDefined();
      expect(res.fcm_delivered).toBe(true);
      expect(mockDataConnect.createRemark).toHaveBeenCalled();
      expect(mockNotificationsService.dispatchToParentsOfStudent).toHaveBeenCalled();
      const fanoutPayload = mockNotificationsService.dispatchToParentsOfStudent.mock.calls[0][1];
      expect(fanoutPayload.title).toContain('Em Trần Bảo Nam');
      expect(fanoutPayload.type).toBe('REMARK_NEW');
      expect(fanoutPayload.metadata.screen).toBe('Remarks');
    });
  });

  describe('UT08_Remarks_TC02: Từ chối lời nhận xét vượt quá giới hạn 500 ký tự', () => {
    it('ném BadRequestException REMARK_TEXT_TOO_LONG khi content > 500 ký tự', async () => {
      const longText = 'A'.repeat(505);
      await expect(
        service.createRemark('usr_teacher_01', {
          student_id: 'stu_01',
          class_id: 'cls_1a_2026',
          subject_code: 'MATH',
          content: longText,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT08_Remarks_TC03: Xem danh sách lịch sử nhận xét trong lớp học', () => {
    it('trả về danh sách nhận xét của lớp kèm phân trang', async () => {
      const res = await service.getClassRemarks('cls_1a_2026', 20);

      expect(res.class_id).toBe('cls_1a_2026');
      expect(res.total).toBe(1);
      expect(res.items.length).toBe(1);
      expect(res.items[0].subject_code).toBe('MATH');
    });
  });

  describe('UT08_Remarks_TC04: Chặn giáo viên bộ môn tự ý gửi nhận xét môn học mình không được phân công', () => {
    it('ném ForbiddenException ACAD_NOT_ASSIGNED_TEACHER khi nhận xét sai môn', async () => {
      await expect(
        service.createRemark(
          'usr_teacher_math',
          {
            student_id: 'stu_01',
            class_id: 'cls_1a_2026',
            subject_code: 'LIT',
            content: 'Em làm bài văn miêu tả rất giàu cảm xúc và chữ viết nắn nót.',
          },
          { role: 'TEACHER_SUBJECT', assignedSubjects: ['MATH'] },
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('UT08_Remarks_TC05: Giáo viên chủ nhiệm gửi nhận xét nề nếp chung không kèm môn học thành công', () => {
    it('lưu nhận xét nề nếp chung thành công khi subject_code là null', async () => {
      const res = await service.createRemark('usr_teacher_homeroom', {
        student_id: 'stu_01',
        class_id: 'cls_1a_2026',
        subject_code: undefined,
        content: 'Hôm nay em Nam đi học đúng giờ, đồng phục chỉnh tề và rất tích cực tham gia trực nhật lớp.',
      });

      expect(res.is_homeroom_remark).toBe(true);
      expect(res.fcm_delivered).toBe(true);
      expect(res.subject_code).toBeNull();
    });
  });

  describe('UT08_Remarks_TC06: Từ chối lời nhận xét rỗng hoặc chỉ toàn khoảng trắng', () => {
    it('ném BadRequestException REMARK_CONTENT_EMPTY khi content toàn khoảng trắng', async () => {
      await expect(
        service.createRemark('usr_teacher_01', {
          student_id: 'stu_01',
          class_id: 'cls_1a_2026',
          subject_code: 'MATH',
          content: '       ',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT08_Remarks_TC07: Từ chối lời nhận xét quá ngắn dưới 3 ký tự', () => {
    it('ném BadRequestException REMARK_CONTENT_TOO_SHORT khi content dưới 3 ký tự', async () => {
      await expect(
        service.createRemark('usr_teacher_01', {
          student_id: 'stu_01',
          class_id: 'cls_1a_2026',
          subject_code: 'MATH',
          content: 'ok',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT08_Remarks_TC08: Từ chối lời nhận xét chứa ký tự đặc biệt độc hại hoặc mã script XSS', () => {
    it('ném BadRequestException INVALID_INPUT_PAYLOAD khi content chứa script XSS', async () => {
      await expect(
        service.createRemark('usr_teacher_01', {
          student_id: 'stu_01',
          class_id: 'cls_1a_2026',
          subject_code: 'MATH',
          content: "<script>alert('XSS_ATTACK')</script>@@@###$$$%%%",
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT08_Remarks_TC09: Gửi nhận xét thành công với cơ chế chịu lỗi khi dịch vụ Google FCM gián đoạn tạm thời', () => {
    it('lưu thành công và đánh dấu QUEUED_FOR_RETRY khi FCM gặp sự cố', async () => {
      mockNotificationsService.dispatchToParentsOfStudent.mockRejectedValue(
        new Error('FirebaseMessagingError: UNAVAILABLE'),
      );

      const res = await service.createRemark('usr_teacher_01', {
        student_id: 'stu_01',
        class_id: 'cls_1a_2026',
        subject_code: 'MATH',
        content: 'Em Nam làm bài tập về nhà rất đầy đủ và sạch đẹp.',
      });

      expect(res.remark_id).toBeDefined();
      expect(res.fcm_status).toBe('QUEUED_FOR_RETRY');
      expect(res.fcm_delivered).toBe(false);
    });
  });

  describe('UT08_Remarks_TC10: Từ chối thao tác do không có token xác thực hoặc token đã hết hạn', () => {
    it('ném UnauthorizedException AUTH_UNAUTHORIZED khi teacherId rỗng', async () => {
      await expect(
        service.createRemark('', {
          student_id: 'stu_01',
          class_id: 'cls_1a_2026',
          subject_code: 'MATH',
          content: 'Em học tốt',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('UT08_Remarks_TC11: Từ chối gửi nhận xét cho học sinh không tồn tại trong lớp', () => {
    it('ném NotFoundException STUDENT_NOT_FOUND khi student_id không tồn tại', async () => {
      await expect(
        service.createRemark('usr_teacher_01', {
          student_id: 'stu_nonexistent_9999',
          class_id: 'cls_1a_2026',
          subject_code: 'MATH',
          content: 'Em học bài tốt.',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('UT08_Remarks_TC12: Từ chối yêu cầu thiếu các trường dữ liệu bắt buộc khi gửi nhận xét', () => {
    it('DTO validation phát hiện thiếu student_id và class_id', async () => {
      const dto = plainToInstance(CreateRemarkDto, {
        content: 'Em tiếp thu bài nhanh và chăm chú nghe giảng.',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const props = errors.map((e) => e.property);
      expect(props).toContain('student_id');
      expect(props).toContain('class_id');
    });
  });

  describe('UT08_Remarks_TC13: Chặn giáo viên bộ môn gửi nhận xét nhưng thiếu mã môn học bắt buộc', () => {
    it('ném BadRequestException COMMON_VALIDATION_ERROR khi GV bộ môn không chọn môn học', async () => {
      await expect(
        service.createRemark(
          'usr_teacher_subject_01',
          {
            student_id: 'stu_01',
            class_id: 'cls_1a_2026',
            subject_code: undefined,
            content: 'Em hoàn thành bài tập về nhà rất tốt.',
          },
          { role: 'TEACHER_SUBJECT' },
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT08_Remarks_TC14: Xử lý lỗi máy chủ cơ sở dữ liệu Firestore mất kết nối hoặc timeout', () => {
    it('ném InternalServerErrorException SYS_INTERNAL_ERROR khi database lỗi', async () => {
      mockDataConnect.createRemark.mockRejectedValue(new Error('DEADLINE_EXCEEDED'));

      await expect(
        service.createRemark('usr_teacher_01', {
          student_id: 'stu_01',
          class_id: 'cls_1a_2026',
          subject_code: 'MATH',
          content: 'Em tiếp thu bài tốt.',
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('UT08_Remarks_TC15: Xử lý trạng thái rỗng an toàn khi lớp học chưa có lời nhận xét nào trong cơ sở dữ liệu', () => {
    it('trả về danh sách rỗng an toàn total = 0 khi lớp mới', async () => {
      const res = await service.getClassRemarks('cls_new_2026');

      expect(res.class_id).toBe('cls_new_2026');
      expect(res.total).toBe(0);
      expect(res.items).toEqual([]);
    });
  });

  describe('UT08_Remarks_TC16: Xử lý trạng thái rỗng an toàn khi xem lịch sử nhận xét của học sinh chưa từng nhận được nhận xét nào', () => {
    it('trả về danh sách rỗng an toàn total = 0 cho học sinh chưa có nhận xét', async () => {
      const res = await service.getStudentRemarks('stu_03');

      expect(res.student_id).toBe('stu_03');
      expect(res.total).toBe(0);
      expect(res.items).toEqual([]);
    });
  });
});
