import { Platform } from 'react-native';
import { authService } from './auth.service';
import { fcmService } from './fcm.service';

const API_BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:3000/api/v1'
    : 'http://localhost:3000/api/v1';

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: string;
  is_read: boolean;
  timeAgo: string;
  created_at: string;
  metadata?: any;
}

export class NotificationService {
  async getNotifications(): Promise<{ items: NotificationItem[]; unreadCount: number }> {
    try {
      // Tự động khởi tạo Firebase Cloud Messaging (FCM) ngầm
      fcmService.initFCM().catch(() => null);

      const authHeader = await authService.getAuthHeaderAsync();
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
      });

      if (response.ok) {
        const resJson = await response.json();
        const data = resJson.data || resJson;
        const items = (data.items || []).map((item: any) => ({
          ...item,
          timeAgo: this.formatTimeAgo(item.created_at),
        }));
        return {
          items,
          unreadCount: data.unread_count || 0,
        };
      }
    } catch (e) {
      console.warn('Backend not reachable, fallback to mock notifications:', e);
    }

    // Mock fallback matching Stitch TEA-12
    const mockItems: NotificationItem[] = [
      {
        id: 'notif_01',
        title: 'Phụ huynh Minh Anh đã đọc nhận xét',
        body: 'Phụ huynh em Nguyễn Minh Anh lớp 6A1 đã xem lời nhận xét tuần này.',
        type: 'REMARK_READ',
        is_read: false,
        timeAgo: '10 phút trước',
        created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      },
      {
        id: 'notif_02',
        title: 'Bạn đã vào lớp 6A2',
        body: 'Giáo viên chủ nhiệm lớp 6A2 đã duyệt bạn vào danh sách GVBM.',
        type: 'CLASS_JOINED',
        is_read: true,
        timeAgo: 'Hôm qua',
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'notif_03',
        title: 'Lịch kiểm tra Toán 6A2',
        body: 'Lịch kiểm tra 15 phút Toán Đại đã được lên lịch lúc 09:15 ngày mai.',
        type: 'EXAM_SCHEDULED',
        is_read: true,
        timeAgo: 'Hôm qua',
        created_at: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'notif_04',
        title: 'Phụ huynh Bảo Nam đã đọc nhận xét',
        body: 'Phụ huynh em Trần Bảo Nam lớp 1A đã xác nhận đã đọc.',
        type: 'REMARK_READ',
        is_read: true,
        timeAgo: '2 ngày trước',
        created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      },
    ];

    return {
      items: mockItems,
      unreadCount: mockItems.filter(i => !i.is_read).length,
    };
  }

  async markAsRead(id: string): Promise<boolean> {
    try {
      const authHeader = await authService.getAuthHeaderAsync();
      const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
      });
      return response.ok;
    } catch (e) {
      return true;
    }
  }

  async markAllAsRead(): Promise<boolean> {
    try {
      const authHeader = await authService.getAuthHeaderAsync();
      const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
      });
      return response.ok;
    } catch (e) {
      return true;
    }
  }

  private formatTimeAgo(isoDate: string): string {
    if (!isoDate) return 'Vừa xong';
    const diffMs = Date.now() - new Date(isoDate).getTime();
    const diffMins = Math.floor(diffMs / (60 * 1000));
    if (diffMins < 60) return `${Math.max(1, diffMins)} phút trước`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Hôm qua';
    return `${diffDays} ngày trước`;
  }
}

export const notificationService = new NotificationService();
export { fcmService };
