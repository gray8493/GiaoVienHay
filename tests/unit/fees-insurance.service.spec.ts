import { FeesInsuranceService } from '../../apps/api/src/modules/10-fees-insurance/fees-insurance.service';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { FeeType } from '@giaovienhay/shared-types';

describe('FeesInsuranceService (Unit Tests UT10 - All 31 Cases)', () => {
  let service: FeesInsuranceService;
  let mockDataConnect: any;

  beforeEach(() => {
    mockDataConnect = {
      updateFeeStatus: jest.fn().mockResolvedValue(true),
      createNotification: jest.fn().mockResolvedValue(true),
    };

    service = new FeesInsuranceService(mockDataConnect);
  });

  describe('UT10_FeesInsurance_TC01: Từ chối cập nhật khi không truyền hoặc để trống mã bản ghi', () => {
    it('ném BadRequestException khi record_id rỗng', async () => {
      await expect(
        service.toggleFeeStatus('usr_gvcn_01', {
          record_id: '',
          fee_type: FeeType.INSURANCE,
          is_paid: true,
          paid_date: '2026-09-27',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT10_FeesInsurance_TC02: Từ chối cập nhật khi không chọn hoặc để trống loại khoản thu', () => {
    it('ném BadRequestException khi fee_type rỗng', async () => {
      await expect(
        service.toggleFeeStatus('usr_gvcn_01', {
          record_id: 'fee_02',
          fee_type: '' as any,
          is_paid: true,
          paid_date: '2026-09-27',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT10_FeesInsurance_TC03: Từ chối cập nhật khi thiếu trạng thái cờ đã nộp', () => {
    it('ném BadRequestException khi is_paid không có', async () => {
      await expect(
        service.toggleFeeStatus('usr_gvcn_01', {
          record_id: 'fee_02',
          fee_type: FeeType.INSURANCE,
          is_paid: undefined as any,
          paid_date: '2026-09-27',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT10_FeesInsurance_TC04: Từ chối cập nhật đã nộp tiền nhưng thiếu ngày nộp thực tế', () => {
    it('ném BadRequestException khi is_paid=true nhưng paid_date rỗng', async () => {
      await expect(
        service.toggleFeeStatus('usr_gvcn_01', {
          record_id: 'fee_02',
          fee_type: FeeType.INSURANCE,
          is_paid: true,
          paid_date: '',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT10_FeesInsurance_TC05: Từ chối gửi thông báo nhắc nhở khi thiếu hoặc để trống mã lớp', () => {
    it('ném BadRequestException khi class_id rỗng trong remind', async () => {
      await expect(
        service.sendFeeReminder('usr_gvcn_01', {
          class_id: '',
          fee_type: FeeType.INSURANCE,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT10_FeesInsurance_TC06: Từ chối gửi thông báo nhắc nhở khi thiếu hoặc để trống loại khoản thu', () => {
    it('ném BadRequestException khi fee_type rỗng trong remind', async () => {
      await expect(
        service.sendFeeReminder('usr_gvcn_01', {
          class_id: 'cls_1a_2026',
          fee_type: '' as any,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT10_FeesInsurance_TC07: Từ chối cập nhật khi ngày nộp tiền không tồn tại trong lịch thực tế', () => {
    it('ném BadRequestException khi paid_date là 2026-02-30', async () => {
      await expect(
        service.toggleFeeStatus('usr_gvcn_01', {
          record_id: 'fee_02',
          fee_type: FeeType.INSURANCE,
          is_paid: true,
          paid_date: '2026-02-30',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT10_FeesInsurance_TC08: Từ chối cập nhật khi ngày nộp tiền ở tương lai', () => {
    it('ném BadRequestException khi paid_date ở tương lai', async () => {
      await expect(
        service.toggleFeeStatus('usr_gvcn_01', {
          record_id: 'fee_02',
          fee_type: FeeType.INSURANCE,
          is_paid: true,
          paid_date: '2026-12-31',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT10_FeesInsurance_TC09: Từ chối cập nhật khi ghi chú vượt quá độ dài tối đa (trên 255 ký tự)', () => {
    it('ném BadRequestException khi note > 255 ký tự', async () => {
      const longNote = 'A'.repeat(280);
      await expect(
        service.toggleFeeStatus('usr_gvcn_01', {
          record_id: 'fee_02',
          fee_type: FeeType.INSURANCE,
          is_paid: true,
          paid_date: '2026-09-27',
          note: longNote,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT10_FeesInsurance_TC10: Từ chối cập nhật khi loại khoản thu không nằm trong enum chuẩn', () => {
    it('ném BadRequestException khi fee_type là TIEN_QUY_LOP', async () => {
      await expect(
        service.toggleFeeStatus('usr_gvcn_01', {
          record_id: 'fee_02',
          fee_type: 'TIEN_QUY_LOP' as any,
          is_paid: true,
          paid_date: '2026-09-27',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT10_FeesInsurance_TC11: Từ chối gửi lời nhắc khi loại khoản thu nhắc nhở ngoài danh mục cho phép', () => {
    it('ném BadRequestException khi fee_type là DONG_PHUC', async () => {
      await expect(
        service.sendFeeReminder('usr_gvcn_01', {
          class_id: 'cls_1a_2026',
          fee_type: 'DONG_PHUC' as any,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT10_FeesInsurance_TC12: Từ chối cập nhật khi đợt thu phí đã được nhà trường đóng khóa sổ', () => {
    it('ném BadRequestException FEE_TERM_LOCKED khi isLocked=true', async () => {
      await expect(
        service.toggleFeeStatus(
          'usr_gvcn_01',
          {
            record_id: 'fee_02',
            fee_type: FeeType.INSURANCE,
            is_paid: true,
            paid_date: '2026-09-27',
          },
          { isLocked: true },
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT10_FeesInsurance_TC13: Báo lỗi khi tra cứu danh sách thu nộp với mã lớp học không tồn tại', () => {
    it('ném NotFoundException CLASS_NOT_FOUND khi lớp không tồn tại', async () => {
      await expect(service.getClassFeesList('usr_gvcn_01', 'cls_khong_ton_tai')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('UT10_FeesInsurance_TC14: Chặn giáo viên không phải GVCN truy cập danh sách thu nộp của lớp', () => {
    it('ném ForbiddenException AUTH_FORBIDDEN khi không phải GVCN', async () => {
      await expect(
        service.getClassFeesList('usr_teacher_other', 'cls_1a_2026', {}, { isHomeroom: false }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('UT10_FeesInsurance_TC15: Báo lỗi khi cập nhật bản ghi thu nộp không tồn tại', () => {
    it('ném NotFoundException FEE_RECORD_NOT_FOUND khi bản ghi không tồn tại', async () => {
      await expect(
        service.toggleFeeStatus('usr_gvcn_01', {
          record_id: 'fee_non_existent',
          fee_type: FeeType.INSURANCE,
          is_paid: true,
          paid_date: '2026-09-27',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('UT10_FeesInsurance_TC16: Chặn giáo viên không phải GVCN của lớp cập nhật bản ghi thu nộp', () => {
    it('ném ForbiddenException AUTH_FORBIDDEN khi giáo viên khác sửa bản ghi', async () => {
      await expect(
        service.toggleFeeStatus(
          'usr_teacher_other',
          {
            record_id: 'fee_02',
            fee_type: FeeType.INSURANCE,
            is_paid: true,
            paid_date: '2026-09-27',
          },
          { isHomeroom: false },
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('UT10_FeesInsurance_TC17: Báo lỗi khi gửi lời nhắc cho lớp học không tồn tại', () => {
    it('ném NotFoundException CLASS_NOT_FOUND khi remind lớp không tồn tại', async () => {
      await expect(
        service.sendFeeReminder('usr_gvcn_01', {
          class_id: 'cls_khong_ton_tai',
          fee_type: FeeType.INSURANCE,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('UT10_FeesInsurance_TC18: Chặn giáo viên không phải GVCN gửi thông báo nhắc nhở phụ huynh', () => {
    it('ném ForbiddenException AUTH_FORBIDDEN khi không phải GVCN gửi nhắc nhở', async () => {
      await expect(
        service.sendFeeReminder(
          'usr_teacher_other',
          {
            class_id: 'cls_1a_2026',
            fee_type: FeeType.INSURANCE,
          },
          { isHomeroom: false },
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('UT10_FeesInsurance_TC19: Chặn truy cập khi thiếu token hoặc token không hợp lệ', () => {
    it('ném UnauthorizedException AUTH_UNAUTHORIZED khi teacherId rỗng', async () => {
      await expect(service.getClassFeesList('', 'cls_1a_2026')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('UT10_FeesInsurance_TC20: Xử lý ngoại lệ lỗi máy chủ nội bộ hoặc sự cố dịch vụ Firebase FCM', () => {
    it('ném InternalServerErrorException SYS_INTERNAL_ERROR khi gửi thông báo bị lỗi', async () => {
      mockDataConnect.createNotification.mockRejectedValue(new Error('Firebase network timeout'));

      await expect(
        service.sendFeeReminder('usr_gvcn_01', {
          class_id: 'cls_1a_2026',
          fee_type: FeeType.INSURANCE,
          custom_message: 'Nhắc nhở nộp BHYT',
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('UT10_FeesInsurance_TC21: GVCN xem toàn bộ danh sách thu nộp học phí & BHYT của lớp chủ nhiệm thành công', () => {
    it('trả về danh sách chi tiết học phí và BHYT', async () => {
      const res = await service.getClassFeesList('usr_gvcn_01', 'cls_1a_2026', {
        fee_type: 'ALL',
        unpaid_only: false,
      });

      expect(res.class_id).toBe('cls_1a_2026');
      expect(res.records.length).toBe(3);
      expect(res.records[0].student_id).toBe('stu_01');
    });
  });

  describe('UT10_FeesInsurance_TC22: Lọc danh sách học sinh chưa nộp BHYT của lớp thành công', () => {
    it('chỉ lọc học sinh chưa nộp BHYT', async () => {
      const res = await service.getClassFeesList('usr_gvcn_01', 'cls_1a_2026', {
        fee_type: 'INSURANCE',
        unpaid_only: true,
      });

      expect(res.records.every((r) => !r.insurance.is_paid)).toBe(true);
      expect(res.records.length).toBe(1);
      expect(res.records[0].student_id).toBe('stu_02');
    });
  });

  describe('UT10_FeesInsurance_TC23: Lọc danh sách học sinh chưa nộp học phí của lớp thành công', () => {
    it('chỉ lọc học sinh chưa nộp Học phí', async () => {
      const res = await service.getClassFeesList('usr_gvcn_01', 'cls_1a_2026', {
        fee_type: 'TUITION',
        unpaid_only: true,
      });

      expect(res.records.every((r) => !r.tuition.is_paid)).toBe(true);
      expect(res.records.length).toBe(1);
      expect(res.records[0].student_id).toBe('stu_03');
    });
  });

  describe('UT10_FeesInsurance_TC24: Cập nhật trạng thái đã nộp BHYT kèm ngày nộp thực tế thành công', () => {
    it('cập nhật BHYT thành công', async () => {
      const res = await service.toggleFeeStatus('usr_gvcn_01', {
        record_id: 'fee_02',
        fee_type: FeeType.INSURANCE,
        is_paid: true,
        paid_date: '2026-09-27',
        note: 'Đã nộp tiền mặt tại lớp',
      });

      expect(res.record_id).toBe('fee_02');
      expect(res.is_paid).toBe(true);
      expect(res.paid_date).toBe('2026-09-27');
    });
  });

  describe('UT10_FeesInsurance_TC25: Cập nhật trạng thái đã nộp học phí kèm ngày nộp thực tế thành công', () => {
    it('cập nhật Học phí thành công', async () => {
      const res = await service.toggleFeeStatus('usr_gvcn_01', {
        record_id: 'fee_03',
        fee_type: FeeType.TUITION,
        is_paid: true,
        paid_date: '2026-09-27',
        note: 'Nộp học phí tháng 9',
      });

      expect(res.record_id).toBe('fee_03');
      expect(res.is_paid).toBe(true);
      expect(res.paid_date).toBe('2026-09-27');
    });
  });

  describe('UT10_FeesInsurance_TC26: Hoàn tác cập nhật trạng thái từ đã nộp về chưa nộp thành công', () => {
    it('hoàn tác về is_paid: false thành công', async () => {
      const res = await service.toggleFeeStatus('usr_gvcn_01', {
        record_id: 'fee_02',
        fee_type: FeeType.INSURANCE,
        is_paid: false,
        paid_date: undefined,
        note: 'Điều chỉnh do nhầm lẫn học sinh',
      });

      expect(res.record_id).toBe('fee_02');
      expect(res.is_paid).toBe(false);
      expect(res.paid_date).toBeNull();
    });
  });

  describe('UT10_FeesInsurance_TC27: GVCN gửi thông báo FCM đôn đốc phụ huynh chưa nộp BHYT thành công', () => {
    it('gửi thông báo cho 12 phụ huynh chưa nộp BHYT', async () => {
      const res = await service.sendFeeReminder('usr_gvcn_01', {
        class_id: 'cls_1a_2026',
        fee_type: FeeType.INSURANCE,
        custom_message: 'Kính nhờ quý phụ huynh chưa hoàn thành BHYT năm học 2026-2027 vui lòng nộp tiền mặt cho GVCN trước ngày 15/10.',
      });

      expect(res.class_id).toBe('cls_1a_2026');
      expect(res.notified_parents_count).toBe(12);
    });
  });

  describe('UT10_FeesInsurance_TC28: GVCN gửi thông báo FCM nhắc phụ huynh chưa nộp cả 2 nghĩa vụ (BOTH) thành công', () => {
    it('gửi thông báo cho 18 phụ huynh chưa nộp BOTH', async () => {
      const res = await service.sendFeeReminder('usr_gvcn_01', {
        class_id: 'cls_1a_2026',
        fee_type: 'BOTH' as any,
        custom_message: 'Kính nhờ quý phụ huynh kiểm tra và hoàn thành các khoản nghĩa vụ Học phí và BHYT của con trước hạn chót của nhà trường.',
      });

      expect(res.class_id).toBe('cls_1a_2026');
      expect(res.notified_parents_count).toBe(18);
    });
  });

  describe('UT10_FeesInsurance_TC29: Xử lý trạng thái rỗng an toàn khi lớp học chưa khởi tạo bản ghi thu nộp nào trong cơ sở dữ liệu', () => {
    it('trả về rỗng và 0 thống kê khi lớp mới', async () => {
      const res = await service.getClassFeesList('usr_gvcn_01', 'cls_new_2026');

      expect(res.class_id).toBe('cls_new_2026');
      expect(res.total_students).toBe(0);
      expect(res.records).toEqual([]);
    });
  });

  describe('UT10_FeesInsurance_TC30: Xử lý trạng thái rỗng an toàn khi lọc danh sách chưa nộp nhưng 100% học sinh đã hoàn thành nghĩa vụ', () => {
    it('trả về records rỗng và unpaid_count = 0', async () => {
      const res = await service.getClassFeesList('usr_gvcn_01', 'cls_1a_2026', {
        status: 'UNPAID',
        fee_type: 'TUITION',
      });

      expect(res.class_id).toBe('cls_1a_2026');
      expect(res.unpaid_count).toBe(0);
      expect(res.records).toEqual([]);
    });
  });

  describe('UT10_FeesInsurance_TC31: Xử lý an toàn khi gửi thông báo đôn đốc nhưng cơ sở dữ liệu không có phụ huynh nào còn nợ tiền', () => {
    it('trả về notified_parents_count = 0 khi 100% đã đóng', async () => {
      const res = await service.sendFeeReminder(
        'usr_gvcn_01',
        {
          class_id: 'cls_1a_2026',
          fee_type: FeeType.INSURANCE,
          custom_message: 'Nhắc nhở nộp BHYT.',
        },
        { allPaid: true },
      );

      expect(res.notified_parents_count).toBe(0);
      expect(mockDataConnect.createNotification).not.toHaveBeenCalled();
    });
  });
});
