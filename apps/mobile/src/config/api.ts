import { Platform } from 'react-native';

// Ưu tiên biến môi trường EXPO_PUBLIC_API_URL; fallback cho môi trường dev
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === 'android'
    ? 'http://10.0.2.2:3000/api/v1'
    : 'http://localhost:3000/api/v1');
