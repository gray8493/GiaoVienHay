// Tách khỏi màn hình để kiểm thử được logic đọc mã QR mời lớp
export const extractInviteCode = (raw: string): string | null => {
  const text = (raw || '').trim();
  if (!text) return null;
  const fromQuery = text.match(/[?&]code=([^&#]+)/i);
  if (fromQuery?.[1]) {
    try {
      return decodeURIComponent(fromQuery[1]).trim().toUpperCase();
    } catch (e) {
      return fromQuery[1].trim().toUpperCase();
    }
  }
  if (/^[A-Z0-9][A-Z0-9-]{3,30}$/i.test(text)) return text.toUpperCase();
  return null;
};
