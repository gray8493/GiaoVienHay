import { Platform, Alert } from 'react-native';
import { app } from '../config/firebase';
import { authService } from './auth.service';
import { api } from './http';

type NotificationListener = (payload: any) => void;

class FCMService {
  private deviceToken: string | null = null;
  private listeners: NotificationListener[] = [];
  private isInitialized = false;

  /**
   * Khởi tạo dịch vụ Firebase Cloud Messaging (FCM)
   */
  async initFCM(): Promise<string | null> {
    if (this.isInitialized && this.deviceToken) {
      return this.deviceToken;
    }

    try {
      // 1. Thử khởi tạo Firebase Messaging Web SDK nếu môi trường hỗ trợ
      const { isSupported, getMessaging, getToken, onMessage } = await import('firebase/messaging');
      const supported = await isSupported().catch(() => false);

      if (supported && typeof window !== 'undefined' && 'Notification' in window) {
        const permission = await Notification.requestPermission().catch(() => 'denied');
        if (permission === 'granted') {
          const messaging = getMessaging(app);
          try {
            const token = await getToken(messaging);
            if (token) {
              this.deviceToken = token;
            }
          } catch (tokenErr) {
            console.log('[FCM] Chưa có ServiceWorker Web push, dùng fallback device token:', tokenErr);
          }

          // Lắng nghe thông báo khi ứng dụng đang mở (Foreground)
          onMessage(messaging, (payload) => {
            console.log('[FCM Foreground Push]:', payload);
            this.handleIncomingNotification(payload);
          });
        }
      }
    } catch (e) {
      console.log('[FCM] Khởi tạo Firebase Messaging native/web fallback:', e);
    }

    // 2. Tạo Fallback Device Token định danh thiết bị nếu chưa có token trực tiếp từ FCM Web
    if (!this.deviceToken) {
      const user = authService.getUser();
      const userPrefix = user?.id || 'guest';
      this.deviceToken = `fcm_${Platform.OS}_${userPrefix}_${Date.now().toString(36)}`;
    }

    this.isInitialized = true;

    // 3. Đăng ký Device Token lên Backend NestJS
    await this.registerDeviceTokenWithBackend(this.deviceToken);

    return this.deviceToken;
  }

  /**
   * Gửi Device Token lên Backend lưu trữ trong Database
   */
  async registerDeviceTokenWithBackend(token: string): Promise<boolean> {
    try {
      await api('/users/device-token', {
        method: 'POST',
        body: {
          device_token: token,
          device_type: Platform.OS.toUpperCase(),
        },
        errorMessage: 'Không thể đăng ký thiết bị',
      });
      console.log('[FCM] Đã đăng ký Device Token với Backend thành công:', token);
      return true;
    } catch (err) {
      console.log('[FCM] Chưa kết nối được token với backend (offline/dev):', err);
    }
    return false;
  }

  /**
   * Lấy Device Token hiện tại
   */
  getDeviceToken(): string | null {
    return this.deviceToken;
  }

  /**
   * Đăng ký callback khi nhận được thông báo đẩy thời gian thực
   */
  onNotificationReceived(listener: NotificationListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Xử lý thông báo đẩy đến
   */
  private handleIncomingNotification(payload: any) {
    // Kích hoạt tất cả các listeners đã đăng ký
    this.listeners.forEach((listener) => {
      try {
        listener(payload);
      } catch (e) {
        console.error('[FCM] Lỗi thực thi listener:', e);
      }
    });

    // Hiển thị Alert nếu có nội dung notification
    const title = payload?.notification?.title || payload?.data?.title;
    const body = payload?.notification?.body || payload?.data?.body;
    if (title && body) {
      Alert.alert(title, body);
    }
  }
}

export const fcmService = new FCMService();
