import { API_BASE_URL } from '../config/api';
import { authService } from './auth.service';
import { fcmService } from './fcm.service';

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
      console.warn('Backend not reachable:', e);
    }

    return { items: [], unreadCount: 0 };
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
      return false;
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
      return false;
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
