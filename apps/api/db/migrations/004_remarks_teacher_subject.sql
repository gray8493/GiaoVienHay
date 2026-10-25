-- 004: Nhận xét lưu được MÔN HỌC và TÊN GIÁO VIÊN
-- Trước đây bảng remarks không có 2 cột này → PH không biết ai nhận xét,
-- môn gì; backend còn bịa teacher_name = 'Giáo viên phụ trách'.

ALTER TABLE remarks ADD COLUMN IF NOT EXISTS subject_code varchar;
ALTER TABLE remarks ADD COLUMN IF NOT EXISTS teacher_name varchar;

-- Backfill: điền tên giáo viên thật cho các dòng cũ theo teacher_id
UPDATE remarks
SET teacher_name = (SELECT u.full_name FROM users u WHERE u.id = remarks.teacher_id)
WHERE teacher_name IS NULL;
