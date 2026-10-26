import { Platform, Alert } from 'react-native';
import { app } from '../config/firebase';
import { authService } from './auth.service';
import { api } from './http';

type NotificationListener = (payload: any) => void;

class FCMService {
  private deviceToken: string | null = null;
  private listeners: NotificationListener[] = [];
  private isInitialized = false;
  private isListening = false;
  private permissionRequested = false;

  /**
   * Khởi tạo dịch vụ Firebase Cloud Messaging (FCM)
   * Chỉ dùng token thật do FCM cấp — không tạo token giả để tránh gửi push thất bại.
   */
  async initFCM(): Promise<string | null> {
    if (this.isInitialized && this.deviceToken) {
      return this.deviceToken;
    }

    // Native đọc phiên đăng nhập bất đồng bộ — chờ khôi phục xong mới đăng ký token
    await authService.hydrateAuth();

    try {
      // 1. Thử khởi tạo Firebase Messaging Web SDK nếu môi trường hỗ trợ.
      // Trên native, Firebase JS SDK không cấp FCM token (cần SDK native + cấu hình
      // google-services.json/GoogleService-Info.plist), nên bỏ qua thay vì bịa token.
      if (Platform.OS === 'web' && typeof window !== 'undefined' && 'Notification' in window) {
        try {
          const { isSupported, getMessaging, getToken, onMessage } = await import('firebase/messaging');
          const supported = await isSupported().catch(() => false);

          if (supported) {
            if (!this.permissionRequested) {
              this.permissionRequested = true;
              await Notification.requestPermission().catch(() => 'denied');
            }
            if (Notification.permission === 'granted') {
              const messaging = getMessaging(app);
              try {
                // Web push cần VAPID key (đặt trong .env)
                const vapidKey = process.env.EXPO_PUBLIC_FCM_VAPID_KEY;
                const token = await getToken(messaging, vapidKey ? { vapidKey } : undefined);
                if (token) {
                  this.deviceToken = token;
                }
              } catch (tokenErr) {
                console.log('[FCM] Chưa lấy được web push token (thiếu Service Worker/VAPID key)');
              }

              // Lắng nghe thông báo khi ứng dụng đang mở (Foreground)
              if (!this.isListening) {
                this.isListening = true;
                onMessage(messaging, (payload) => {
                  console.log('[FCM Foreground Push]:', payload);
                  this.handleIncomingNotification(payload);
                });
              }
            }
          }
        } catch (webFcmErr) {
          // Bỏ qua lỗi nạp Firebase Web Messaging trên Metro bundler
        }
      }
    } catch (e) {
      console.log('[FCM] Khởi tạo Firebase Messaging native/web thất bại:', e);
    }

    this.isInitialized = true;

    // 2. Chỉ đăng ký khi có token thật từ FCM và người dùng đã đăng nhập
    if (this.deviceToken && authService.getToken()) {
      await this.registerDeviceTokenWithBackend(this.deviceToken);
    }

    return this.deviceToken;
  }

  /**
   * Gửi Device Token lên Backend lưu trữ trong Database
   */
  async registerDeviceTokenWithBackend(token: string): Promise<boolean> {
    // Chỉ đăng ký khi người dùng đã có phiên đăng nhập hợp lệ
    const authToken = authService.getToken();
    if (!authToken) {
      return false;
    }

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
