/**
 * Lấy 2 chữ cái đầu làm avatar (chữ đầu họ + chữ đầu tên).
 * Trước đây bị nhân bản ở 5 màn hình với cùng một thuật toán.
 */
export const getInitials = (name?: string | null, fallback = 'HS'): string => {
  const trimmed = String(name || '').trim();
  if (!trimmed) return fallback;
  const parts = trimmed.split(' ').filter(Boolean);
  if (parts.length >= 2 && parts[0][0] && parts[parts.length - 1][0]) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (trimmed.slice(0, 2) || fallback).toUpperCase();
};
