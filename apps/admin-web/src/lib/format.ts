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
