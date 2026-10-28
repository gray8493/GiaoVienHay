/**
 * Định dạng số với dấu chấm phân cách hàng nghìn (chuẩn Việt Nam)
 * Đảm bảo 100% giống nhau giữa Server (SSR) và Client, chống triệt để lỗi Hydration Mismatch.
 */
export function formatNumber(num: number | string | undefined | null): string {
  if (num === undefined || num === null) return '0';
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n)) return '0';
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function readAssignedText(value: unknown, depth = 0): string {
  if (typeof value !== 'string') return '';
  const raw = value.trim();
  if (!raw) return '';
  if (!raw.startsWith('{')) return raw;
  if (depth > 3) return '';
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      if (typeof parsed.text === 'string' && parsed.text.trim()) return parsed.text.trim();
      if (parsed.assigned_info) return readAssignedText(parsed.assigned_info, depth + 1);
    }
  } catch {}
  return '';
}

/**
 * Rút trích nội dung hiển thị từ assigned_info (plain text hoặc JSON có trường text),
 * tránh render JSON thô và các trường nội bộ như password_hash ra giao diện.
 */
export function extractAssignedInfoText(
  value: string | null | undefined,
  fallback = '',
): string {
  const text = readAssignedText(value);
  if (!text) return fallback;
  const cleaned = text.replace(/^Phụ huynh em\s+/i, '').trim();
  return cleaned || fallback;
}
