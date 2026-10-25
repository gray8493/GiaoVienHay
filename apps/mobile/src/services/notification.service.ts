import { api } from './http';
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

      const data = await api<any>('/notifications');
      const items = (data?.items || []).map((item: any) => ({
        ...item,
        timeAgo: this.formatTimeAgo(item.created_at),
      }));
      return {
        items,
        unreadCount: data?.unread_count || 0,
      };
    } catch (e) {
      console.warn('Backend not reachable:', e);
    }

    return { items: [], unreadCount: 0 };
  }

  async markAsRead(id: string): Promise<boolean> {
    try {
      await api(`/notifications/${id}/read`, { method: 'PATCH' });
      return true;
    } catch (e) {
      return false;
    }
  }

  async markAllAsRead(): Promise<boolean> {
    try {
      await api('/notifications/read-all', { method: 'PATCH' });
      return true;
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
