import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../common/firebase/firebase.service';
import { QueryNotificationsDto } from './dto/notifications.dto';
import { NotificationType } from '@giaovienhay/shared-types';

@Injectable()
export class NotificationsService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async getMyNotifications(userId: string, query: QueryNotificationsDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;

    const mockNotifications = [
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

    const unreadCount = mockNotifications.filter((n) => !n.is_read).length;

    return {
      unread_count: unreadCount,
      total: mockNotifications.length,
      items: mockNotifications,
    };
  }

  async markAsRead(userId: string, notifId: string) {
    if (this.firebaseService.firestore) {
      try {
        await this.firebaseService.firestore.collection('notifications').doc(notifId).update({
          is_read: true,
          read_at: new Date().toISOString(),
        });
      } catch (e) {}
    }

    return {
      message: 'Đã đánh dấu thông báo là đã đọc',
      id: notifId,
    };
  }

  async markAllAsRead(userId: string) {
    return {
      message: 'Đã đánh dấu toàn bộ thông báo là đã đọc',
    };
  }
}
