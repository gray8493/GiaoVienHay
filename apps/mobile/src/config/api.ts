import { Platform } from 'react-native';

/**
 * Địa chỉ Backend Production chính thức trên Render Cloud
 */
export const PRODUCTION_API_URL = 'https://giaovienhay.onrender.com/api/v1';

/**
 * Chọn địa chỉ backend API:
 * 1. Ưu tiên biến môi trường EXPO_PUBLIC_API_URL (nếu được khai báo rõ ràng, dùng khi dev local)
 * 2. Mặc định tự động kết nối trực tiếp tới máy chủ Render Cloud: https://giaovienhay.onrender.com/api/v1
 */
function resolveApiBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;

  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.trim();
  }

  return PRODUCTION_API_URL;
}

export const API_BASE_URL = resolveApiBaseUrl();

