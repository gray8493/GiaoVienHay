// Năm học Việt Nam bắt đầu từ tháng 9 (month index 8)
export const getCurrentAcademicYear = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const startYear = now.getMonth() >= 8 ? year : year - 1;
  return `${startYear}-${startYear + 1}`;
};
