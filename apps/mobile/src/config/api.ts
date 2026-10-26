import { Platform } from 'react-native';

/**
 * Chọn địa chỉ backend theo nền tảng:
 * - Android Emulator: 10.0.2.2 = máy host (đặc thù emulator)
 * - Web: 10.0.2.2 KHÔNG có nghĩa với trình duyệt → dùng hostname đang mở
 *   (localhost khi mở trên chính máy chạy backend)
 * - Thiết bị thật: đặt EXPO_PUBLIC_API_URL thành IP LAN của máy chạy backend
 */
function resolveApiBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;

  if (Platform.OS === 'web') {
    if (envUrl && !envUrl.includes('10.0.2.2')) return envUrl;
    if (typeof window !== 'undefined' && window.location?.hostname) {
      return `http://${window.location.hostname}:3000/api/v1`;
    }
    return 'http://localhost:3000/api/v1';
  }

  if (envUrl) return envUrl;
  return Platform.OS === 'android'
    ? 'http://10.0.2.2:3000/api/v1'
    : 'http://localhost:3000/api/v1';
}

export const API_BASE_URL = resolveApiBaseUrl();
