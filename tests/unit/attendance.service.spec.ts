import { NotFoundException, ForbiddenException, BadRequestException, ConflictException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { AttendanceService } from '../../apps/api/src/modules/05-attendance/attendance.service';
import { SubmitAttendanceDto, AttendanceRecordItemDto, UpdateAttendanceDto } from '../../apps/api/src/modules/05-attendance/dto/attendance.dto';
import { AttendanceStatus } from '@giaovienhay/shared-types';

describe('AttendanceService (Unit Tests UT05 - All 21 Cases)', () => {
  let service: AttendanceService;
  let mockDataConnect: any;
  let mockCacheManager: any;
  let mockEventEmitter: any;

  beforeEach(() => {
    mockDataConnect = {
      recordAttendance: jest.fn().mockResolvedValue(true),
      getAttendanceByClassDate: jest.fn().mockResolvedValue([]),
      createNotification: jest.fn().mockResolvedValue(true),
    };

    mockCacheManager = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn(),
      del: jest.fn(),
    };

    mockEventEmitter = {
      emit: jest.fn(),
    };

    service = new AttendanceService(mockDataConnect, mockCacheManager, mockEventEmitter);
  });

  // PHẦN I: Validation & Lỗi nghiệp vụ (TC01 - TC13)
  describe('UT05_Attendance_TC01: Từ chối điểm danh khi không nhập hoặc để trống mã lớp học (MISSING CLASS_ID)', () => {
    it('báo lỗi validation khi class_id rỗng', async () => {
      const dto = plainToInstance(SubmitAttendanceDto, {
        class_id: '',
        attendance_date: '2026-09-23',
        records: [{ student_id: 'stu_01', status: AttendanceStatus.PRESENT }],
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'class_id')).toBe(true);
    });
  });

  describe('UT05_Attendance_TC02: Từ chối điểm danh khi không nhập hoặc để trống ngày điểm danh (MISSING ATTENDANCE_DATE)', () => {
    it('báo lỗi validation khi attendance_date rỗng', async () => {
      const dto = plainToInstance(SubmitAttendanceDto, {
        class_id: 'cls_1a_2026',
        attendance_date: '',
        records: [{ student_id: 'stu_01', status: AttendanceStatus.PRESENT }],
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'attendance_date')).toBe(true);
    });
  });

  describe('UT05_Attendance_TC03: Từ chối điểm danh khi danh sách bản ghi rỗng (MISSING / EMPTY RECORDS)', () => {
    it('ném BadRequestException và báo lỗi validation khi records rỗng', async () => {
      const dto = plainToInstance(SubmitAttendanceDto, {
        class_id: 'cls_1a_2026',
        attendance_date: '2026-09-23',
        records: [],
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'records')).toBe(true);

      await expect(
        service.submitAttendance('usr_teacher_01', {
          class_id: 'cls_1a_2026',
          attendance_date: '2026-09-23',
          records: [],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT05_Attendance_TC04: Từ chối điểm danh khi bản ghi thiếu mã học sinh hoặc trạng thái chuyên cần', () => {
    it('báo lỗi validation khi student_id rỗng trong bản ghi', async () => {
      const item = plainToInstance(AttendanceRecordItemDto, {
        student_id: '',
        status: AttendanceStatus.PRESENT,
      });
      const errors = await validate(item);
      expect(errors.some((e) => e.property === 'student_id')).toBe(true);
    });
  });

  describe('UT05_Attendance_TC05: Từ chối cập nhật điểm danh khi thiếu trạng thái mới (PATCH ATTENDANCE)', () => {
    it('báo lỗi validation khi thiếu status và ném BadRequestException', async () => {
      const dto = plainToInstance(UpdateAttendanceDto, {
        note: 'Chỉ cập nhật ghi chú',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'status')).toBe(true);

      await expect(service.updateAttendanceRecord('att_01', undefined as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('UT05_Attendance_TC06: Từ chối điểm danh khi ngày không tồn tại trong lịch thực tế (ATTEND_DATE_INVALID)', () => {
    it('ném BadRequestException khi ngày = 2026-02-30', async () => {
      await expect(
        service.submitAttendance('usr_teacher_01', {
          class_id: 'cls_1a_2026',
          attendance_date: '2026-02-30',
          records: [{ student_id: 'stu_01', status: AttendanceStatus.PRESENT }],
        })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT05_Attendance_TC07: Từ chối điểm danh khi ngày điểm danh ở thời điểm tương lai (ATTEND_DATE_IN_FUTURE)', () => {
    it('ném BadRequestException khi ngày = 2026-12-31', async () => {
      await expect(
        service.submitAttendance('usr_teacher_01', {
          class_id: 'cls_1a_2026',
          attendance_date: '2026-12-31',
          records: [{ student_id: 'stu_01', status: AttendanceStatus.PRESENT }],
        })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT05_Attendance_TC08: Từ chối điểm danh khi ghi chú vượt quá giới hạn độ dài cho phép (MAX 255 KÝ TỰ)', () => {
    it('ném BadRequestException và báo lỗi validation khi note vượt quá 255 ký tự', async () => {
      const longNote = 'A'.repeat(300);
      const item = plainToInstance(AttendanceRecordItemDto, {
        student_id: 'stu_01',
        status: AttendanceStatus.ABSENT_EXCUSED,
        note: longNote,
      });
      const errors = await validate(item);
      expect(errors.some((e) => e.property === 'note')).toBe(true);

      await expect(
        service.submitAttendance('usr_teacher_01', {
          class_id: 'cls_1a_2026',
          attendance_date: '2026-09-23',
          records: [{ student_id: 'stu_01', status: AttendanceStatus.ABSENT_EXCUSED, note: longNote }],
        })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT05_Attendance_TC09: Từ chối điểm danh trùng lặp khi buổi học đã được điểm danh trước đó (ATTEND_ALREADY_EXISTS)', () => {
    it('ném ConflictException khi tiết học đã được điểm danh', async () => {
      mockDataConnect.getAttendanceByClassDate.mockResolvedValueOnce([
        { id: 'att_01', student_id: 'stu_01', period: 1, status: AttendanceStatus.PRESENT },
      ]);
      await expect(
        service.submitAttendance('usr_teacher_01', {
          class_id: 'cls_1a_2026',
          attendance_date: '2026-09-23',
          period: 1,
          records: [{ student_id: 'stu_01', status: AttendanceStatus.PRESENT }],
        })
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('UT05_Attendance_TC10: Báo lỗi khi cập nhật bản ghi điểm danh với mã ID không tồn tại (ATTEND_RECORD_NOT_FOUND)', () => {
    it('ném NotFoundException khi id = att_non_existent', async () => {
      await expect(
        service.updateAttendanceRecord('att_non_existent', AttendanceStatus.PRESENT)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('UT05_Attendance_TC11: Báo lỗi khi điểm danh cho lớp học không tồn tại trên hệ thống (CLASS_NOT_FOUND)', () => {
    it('ném NotFoundException khi class_id = cls_khong_ton_tai', async () => {
      await expect(
        service.submitAttendance('usr_teacher_01', {
          class_id: 'cls_khong_ton_tai',
          attendance_date: '2026-09-23',
          records: [{ student_id: 'stu_01', status: AttendanceStatus.PRESENT }],
        })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('UT05_Attendance_TC12: Chặn giáo viên không phải chủ nhiệm thực hiện điểm danh lớp học (CLASS_NOT_HOMEROOM_TEACHER)', () => {
    it('ném ForbiddenException khi không phải GVCN của lớp', async () => {
      await expect(
        service.submitAttendance('usr_teacher_other', {
          class_id: 'cls_1a_2026',
          attendance_date: '2026-09-23',
          records: [{ student_id: 'stu_01', status: AttendanceStatus.PRESENT }],
        })
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('UT05_Attendance_TC13: Xử lý ngoại lệ lỗi hệ thống khi mất kết nối database hoặc dịch vụ', () => {
    it('ném lỗi an toàn khi gọi cơ sở dữ liệu bị ngắt quãng', async () => {
      mockDataConnect.recordAttendance.mockRejectedValue(new Error('Firebase Deadline Exceeded'));
      await expect(
        service.submitAttendance('usr_teacher_01', {
          class_id: 'cls_1a_2026',
          attendance_date: '2026-09-23',
          records: [{ student_id: 'stu_01', status: AttendanceStatus.PRESENT }],
        })
      ).rejects.toThrow();
    });
  });

  // PHẦN II: Các trường hợp thành công (TC14 - TC21)
  describe('UT05_Attendance_TC14: GVCN điểm danh đầu giờ thành công có học sinh vắng và tự động bắn FCM', () => {
    it('ghi nhận điểm danh và phát sự kiện attendance.absent', async () => {
      const res = await service.submitAttendance('usr_teacher_01', {
        class_id: 'cls_1a_2026',
        attendance_date: '2026-09-23',
        records: [
          { student_id: 'stu_01', status: AttendanceStatus.PRESENT },
          { student_id: 'stu_02', status: AttendanceStatus.ABSENT_EXCUSED, note: 'Nghỉ ốm' },
          { student_id: 'stu_03', status: AttendanceStatus.ABSENT_UNEXCUSED },
        ],
      });
      expect(res.present_count).toBe(1);
      expect(res.absent_count).toBe(2);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('attendance.absent', expect.any(Object));
    });
  });

  describe('UT05_Attendance_TC15: GVCN điểm danh đầu giờ thành công khi 100% học sinh có mặt', () => {
    it('không phát sự kiện vắng khi tất cả có mặt', async () => {
      const res = await service.submitAttendance('usr_teacher_01', {
        class_id: 'cls_1a_2026',
        attendance_date: '2026-09-24',
        records: [
          { student_id: 'stu_01', status: AttendanceStatus.PRESENT },
          { student_id: 'stu_02', status: AttendanceStatus.PRESENT },
        ],
      });
      expect(res.present_count).toBe(2);
      expect(res.absent_count).toBe(0);
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
    });
  });

  describe('UT05_Attendance_TC16: Cập nhật trạng thái điểm danh khi học sinh đến muộn hoặc xin phép thành công', () => {
    it('cập nhật thành công trạng thái sang LATE', async () => {
      const res = await service.updateAttendanceRecord('att_02', AttendanceStatus.LATE, 'Đến muộn 15p do mưa lớn');
      expect(res.status).toBe(AttendanceStatus.LATE);
      expect(res.message).toContain('thành công');
    });
  });

  describe('UT05_Attendance_TC17: Xem lịch sử chuyên cần của lớp theo ngày hoặc theo tháng thành công', () => {
    it('trả về danh sách chuyên cần theo ngày', async () => {
      mockDataConnect.getAttendanceByClassDate.mockResolvedValueOnce([
        { id: 'att_01', student_id: 'stu_01', status: AttendanceStatus.PRESENT },
      ]);
      const list = await service.getClassAttendance('cls_1a_2026', '2026-09-23');
      expect(list.length).toBeGreaterThan(0);
    });
  });

  describe('UT05_Attendance_TC18: Trích xuất danh sách học sinh có mặt hôm nay phục vụ Vòng quay random thành công', () => {
    it('trả về danh sách học sinh có mặt hôm nay', async () => {
      mockDataConnect.getAttendanceByClassDate.mockResolvedValueOnce([
        { id: 'att_01', student_id: 'stu_01', status: AttendanceStatus.PRESENT },
      ]);
      const res = await service.getTodayPresentStudents('cls_1a_2026');
      expect(res.class_id).toBe('cls_1a_2026');
      expect(res.present_students.length).toBeGreaterThan(0);
    });
  });

  describe('UT05_Attendance_TC19: Tự động xóa bộ nhớ đệm RAM Cache khi điểm danh lại thành công', () => {
    it('xóa cache att_present khi submit điểm danh', async () => {
      await service.submitAttendance('usr_teacher_01', {
        class_id: 'cls_1a_2026',
        attendance_date: '2026-09-23',
        records: [{ student_id: 'stu_01', status: AttendanceStatus.PRESENT }],
      });
      expect(mockCacheManager.del).toHaveBeenCalledWith('att_present_cls_1a_2026_2026-09-23');
    });
  });

  describe('UT05_Attendance_TC20: Xử lý trạng thái rỗng an toàn khi lớp học chưa có dữ liệu lịch sử điểm danh (EMPTY STATE - 200 OK)', () => {
    it('trả về mảng rỗng khi lớp chưa từng có dữ liệu điểm danh', async () => {
      const res = await service.getClassAttendance('cls_new_2026', '2026-08-01');
      expect(res).toEqual([]);
    });
  });

  describe('UT05_Attendance_TC21: Xử lý trạng thái an toàn khi trích xuất danh sách có mặt nhưng chưa điểm danh hôm nay (EMPTY STATE - 200 OK)', () => {
    it('trả về present_students rỗng và is_attended_today = false', async () => {
      const res = await service.getTodayPresentStudents('cls_not_attended_today');
      expect(res.present_students).toEqual([]);
      expect(res.is_attended_today).toBe(false);
      expect(res.total_present).toBe(0);
    });
  });
});
