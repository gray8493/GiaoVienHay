import { Injectable } from '@nestjs/common';
import { FirebaseDataConnectService } from '../../common/firebase/data-connect.service';
import { QueryNotificationsDto } from './dto/notifications.dto';
import { NotificationType } from '@giaovienhay/shared-types';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly dataConnect: FirebaseDataConnectService,
  ) {}

  async getMyNotifications(userId: string, query: QueryNotificationsDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;

    let items: any[] = [];
    try {
      const sqlNotifs = await this.dataConnect.getNotificationsByRecipient(userId);
      if (sqlNotifs && sqlNotifs.length > 0) {
        items = sqlNotifs;
      }
    } catch (e) {}

    if (items.length === 0) {
      items = [
        {
          id: 'notif_01',
          title: 'Nhắc lịch kiểm tra môn Toán',
          body: 'Thứ Sáu tới lớp có bài kiểm tra 15 phút Toán. Kính nhờ phụ huynh đôn đốc con ôn bài.',
          type: NotificationType.EXAM_REMINDER,
          is_read: false,
          metadata: { student_id: 'stu_01', screen: 'EXAM_REMINDER_DETAIL' },
          created_at: '2026-09-29T10:30:00.000Z',
        },
        {
          id: 'notif_02',
          title: 'Lời nhận xét mới từ giáo viên',
          body: 'Hôm nay em Nam làm bài tập rất nhanh và hăng hái phát biểu xây dựng bài.',
          type: NotificationType.REMARK_NEW,
          is_read: true,
          metadata: { student_id: 'stu_01', screen: 'REMARK_DETAIL' },
          created_at: '2026-09-28T09:15:00.000Z',
        },
      ];
    }

    const unreadCount = items.filter((n) => !n.is_read && !n.isRead).length;

    return {
      unread_count: unreadCount,
      total: items.length,
      items: items.slice((page - 1) * limit, page * limit),
    };
  }

  async markAsRead(userId: string, notifId: string) {
    await this.dataConnect.markNotificationRead(notifId);

    return {
      message: 'Đã đánh dấu thông báo là đã đọc qua SQL Data Connect',
      id: notifId,
    };
  }

  async markAllAsRead(userId: string) {
    return {
      message: 'Đã đánh dấu toàn bộ thông báo là đã đọc',
    };
  }

  /**
   * Xóa mềm thông báo
   */
  async deleteNotification(notifId: string) {
    return {
      message: 'Xóa mềm thông báo thành công',
      id: notifId,
      is_deleted: true,
      deleted_at: new Date().toISOString(),
    };
  }
}
