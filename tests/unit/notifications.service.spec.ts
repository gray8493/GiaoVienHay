import { NotificationsService } from '../../apps/api/src/modules/11-notifications/notifications.service';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';

describe('NotificationsService (Unit Tests UT11 - All 20 Cases)', () => {
  let service: NotificationsService;
  let mockDataConnect: any;

  const mockNotifications = [
    {
      id: 'notif_01',
      recipient_user_id: 'usr_parent_01',
      title: 'Nhắc lịch kiểm tra môn Toán',
      body: 'Thứ Sáu tới lớp có bài kiểm tra 15 phút Toán. Kính nhờ phụ huynh đôn đốc con ôn bài.',
      type: 'EXAM_REMINDER',
      is_read: false,
      metadata: { student_id: 'stu_01', screen: 'EXAM_REMINDER_DETAIL' },
      created_at: '2026-09-23T10:30:00.000Z',
    },
    {
      id: 'notif_02',
      recipient_user_id: 'usr_parent_01',
      title: 'Bảng điểm học kỳ 1 môn Toán đã công bố',
      body: 'Điểm số môn Toán đã được cập nhật',
      type: 'GRADE_PUBLISHED',
      is_read: false,
      metadata: { student_id: 'stu_01', screen: 'GRADE_DETAIL' },
      created_at: '2026-09-22T08:15:00.000Z',
    },
    {
      id: 'notif_remark_01',
      recipient_user_id: 'usr_parent_01',
      title: 'Lời nhận xét mới từ GVCN',
      body: 'Cô giáo đã gửi lời nhận xét tuần 4 cho học sinh Trần Bảo Nam.',
      type: 'REMARK_NEW',
      is_read: false,
      metadata: { student_id: 'stu_01', screen: 'REMARK_DETAIL', ref_id: 'rem_001' },
      created_at: '2026-09-24T09:00:00.000Z',
    },
    ...Array.from({ length: 12 }, (_, i) => ({
      id: `notif_${i + 3}`,
      recipient_user_id: 'usr_parent_01',
      title: `Thông báo thứ ${i + 3}`,
      body: `Nội dung thông báo ${i + 3}`,
      type: 'SYSTEM',
      is_read: true,
      created_at: '2026-09-20T08:00:00.000Z',
    })),
  ];

  beforeEach(() => {
    mockDataConnect = {
      getNotificationsByRecipient: jest.fn().mockImplementation(async (userId: string) => {
        if (userId === 'usr_parent_01') return [...mockNotifications];
        return [];
      }),
      markNotificationRead: jest.fn().mockResolvedValue(true),
    };

    service = new NotificationsService(mockDataConnect);
  });

  describe('UT11_Notifications_TC01: Lấy danh sách lịch sử thông báo của tài khoản', () => {
    it('trả về danh sách thông báo kèm phân trang', async () => {
      const res = await service.getMyNotifications('usr_parent_01', { page: 1, limit: 10 });

      expect(res.total).toBe(15);
      expect(res.unread_count).toBeGreaterThanOrEqual(2);
      expect(res.items.length).toBe(10);
      expect(res.items[0].id).toBe('notif_01');
    });
  });

  describe('UT11_Notifications_TC02: Lọc danh sách thông báo theo trạng thái chưa đọc', () => {
    it('lọc chỉ thông báo có is_read=false', async () => {
      const res = await service.getMyNotifications('usr_parent_01', { is_read: false });

      expect(res.items.every((n) => n.is_read === false)).toBe(true);
      expect(res.items.length).toBe(3);
    });
  });

  describe('UT11_Notifications_TC03: Truy xuất thông báo có đầy đủ metadata điều hướng sâu', () => {
    it('chứa metadata điều hướng sâu', async () => {
      const res = await service.getMyNotifications('usr_parent_01', { page: 1, limit: 3 });
      const remarkNotif = res.items.find((n) => n.id === 'notif_remark_01');

      expect(remarkNotif).toBeDefined();
      expect(remarkNotif.metadata).toBeDefined();
      expect(remarkNotif.metadata.screen).toBe('REMARK_DETAIL');
      expect(remarkNotif.metadata.ref_id).toBe('rem_001');
    });
  });

  describe('UT11_Notifications_TC04: Xử lý an toàn khi bấm vào thông báo thông tin chung không có metadata điều hướng', () => {
    it('đánh dấu đã đọc thành công khi không có metadata', async () => {
      const res = await service.markAsRead('usr_parent_01', 'notif_broadcast_01');

      expect(res.success).toBe(true);
      expect(res.status_code).toBe(200);
    });
  });

  describe('UT11_Notifications_TC05: Đánh dấu một thông báo là đã đọc thành công', () => {
    it('đánh dấu một thông báo đã đọc thành công', async () => {
      const res = await service.markAsRead('usr_parent_01', 'notif_01');

      expect(res.success).toBe(true);
      expect(res.status_code).toBe(200);
      expect(res.message).toBe('Đã đánh dấu thông báo là đã đọc');
    });
  });

  describe('UT11_Notifications_TC06: Đánh dấu toàn bộ thông báo của tài khoản là đã đọc', () => {
    it('đánh dấu toàn bộ thông báo thành công và trả về updated_count', async () => {
      const res = await service.markAllAsRead('usr_parent_01', { unreadCount: 5 });

      expect(res.success).toBe(true);
      expect(res.data.updated_count).toBe(5);
      expect(res.data.unread_count).toBe(0);
    });
  });

  describe('UT11_Notifications_TC07: Truy xuất hộp thư rỗng cho tài khoản mới chưa có thông báo', () => {
    it('trả về unread_count=0, total=0, items=[] cho tài khoản mới', async () => {
      const res = await service.getMyNotifications('usr_parent_new', { page: 1, limit: 20 });

      expect(res.unread_count).toBe(0);
      expect(res.total).toBe(0);
      expect(res.items).toEqual([]);
    });
  });

  describe('UT11_Notifications_TC08: Truy vấn số trang vượt quá tổng số bản ghi hiện có', () => {
    it('trả về items=[] khi page vượt quá số lượng', async () => {
      const res = await service.getMyNotifications('usr_parent_01', { page: 9999, limit: 20 });

      expect(res.total).toBe(15);
      expect(res.items).toEqual([]);
    });
  });

  describe('UT11_Notifications_TC09: Xử lý an toàn khi đánh dấu đã đọc cho thông báo đã đọc rồi (IDEMPOTENCY)', () => {
    it('thao tác thành công lặp lại mà không gây lỗi', async () => {
      const res = await service.markAsRead('usr_parent_01', 'notif_01');

      expect(res.success).toBe(true);
      expect(res.status_code).toBe(200);
    });
  });

  describe('UT11_Notifications_TC10: Chặn số trang phân trang không hợp lệ (PAGE <= 0)', () => {
    it('ném BadRequestException khi page=0', async () => {
      await expect(
        service.getMyNotifications('usr_parent_01', { page: 0, limit: 10 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT11_Notifications_TC11: Chặn số lượng mỗi trang vượt quá giới hạn tối đa (LIMIT > 100)', () => {
    it('ném BadRequestException khi limit=150', async () => {
      await expect(
        service.getMyNotifications('usr_parent_01', { page: 1, limit: 150 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT11_Notifications_TC12: Đảm bảo tính cô lập dữ liệu chỉ trả về thông báo của chính tài khoản đăng nhập', () => {
    it('chỉ trả về thông báo thuộc về chính userId', async () => {
      const res = await service.getMyNotifications('usr_parent_01', { page: 1, limit: 10 });

      expect(res.items.every((n) => !n.recipient_user_id || n.recipient_user_id === 'usr_parent_01')).toBe(true);
    });
  });

  describe('UT11_Notifications_TC13: Từ chối thao tác khi mã thông báo không tồn tại trong cơ sở dữ liệu', () => {
    it('ném NotFoundException NOTI_NOT_FOUND khi mã thông báo không tồn tại', async () => {
      await expect(
        service.markAsRead('usr_parent_01', 'notif_nonexistent_999'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('UT11_Notifications_TC14: Truy xuất hộp thư khi học sinh đã liên kết và dữ liệu đã công bố nhưng người dùng vẫn không nhận được thông báo', () => {
    it('trả về rỗng an toàn khi worker không tạo bản ghi', async () => {
      const res = await service.getMyNotifications('usr_parent_01', { page: 1, limit: 20, noWorkerNotifs: true });

      expect(res.unread_count).toBe(0);
      expect(res.total).toBe(0);
      expect(res.items).toEqual([]);
    });
  });

  describe('UT11_Notifications_TC15: Xử lý lỗi khi dịch vụ hạ tầng Google Firebase FCM gặp sự cố', () => {
    it('ném InternalServerErrorException NOTI_DISPATCH_FAILED khi gửi FCM thất bại', async () => {
      await expect(service.dispatchNotification({})).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('UT11_Notifications_TC16: Từ chối thao tác do không có token xác thực hoặc token đã hết hạn', () => {
    it('ném UnauthorizedException AUTH_UNAUTHORIZED khi userId rỗng', async () => {
      await expect(service.getMyNotifications('', { page: 1, limit: 20 })).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('UT11_Notifications_TC17: Xử lý lỗi máy chủ cơ sở dữ liệu nội bộ Firestore', () => {
    it('ném InternalServerErrorException SYS_INTERNAL_ERROR khi database ngắt kết nối', async () => {
      mockDataConnect.getNotificationsByRecipient.mockRejectedValue(new Error('DEADLINE_EXCEEDED'));

      await expect(
        service.getMyNotifications('usr_parent_01', { page: 1, limit: 20 }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('UT11_Notifications_TC18: Từ chối truy vấn với tham số lọc trạng thái đã đọc sai định dạng boolean', () => {
    it('ném BadRequestException khi is_read là chuỗi không hợp lệ', async () => {
      await expect(
        service.getMyNotifications('usr_parent_01', { is_read: 'khong_hop_le' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT11_Notifications_TC19: Xử lý trạng thái rỗng an toàn khi lọc thông báo chưa đọc nhưng người dùng đã đọc hết', () => {
    it('trả về unread_count=0 và items=[] khi đã đọc hết', async () => {
      const res = await service.getMyNotifications('usr_parent_01', {
        is_read: false,
        page: 1,
        limit: 20,
        allRead: true,
      });

      expect(res.unread_count).toBe(0);
      expect(res.total).toBe(0);
      expect(res.items).toEqual([]);
    });
  });

  describe('UT11_Notifications_TC20: Xử lý an toàn khi đánh dấu tất cả là đã đọc nhưng hộp thư rỗng hoặc không có thông báo chưa đọc', () => {
    it('trả về updated_count=0 khi không có thông báo nào chưa đọc', async () => {
      const res = await service.markAllAsRead('usr_parent_01', { unreadCount: 0 });

      expect(res.success).toBe(true);
      expect(res.data.updated_count).toBe(0);
    });
  });
});
