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

/**
 * Chuẩn hóa ngày nộp/thanh toán về dd/MM/yyyy.
 * API có thể trả ISO date, ISO datetime đầy đủ (rất dài) hoặc dd/MM/yyyy sẵn.
 */
export const formatPaidDate = (rawDate?: string | null): string => {
  if (!rawDate) return '';
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(rawDate)) return rawDate;
  const matchIso = String(rawDate).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (matchIso) return `${matchIso[3]}/${matchIso[2]}/${matchIso[1]}`;
  const d = new Date(rawDate);
  if (!isNaN(d.getTime())) {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${dd}/${mm}/${d.getFullYear()}`;
  }
  return String(rawDate);
};
