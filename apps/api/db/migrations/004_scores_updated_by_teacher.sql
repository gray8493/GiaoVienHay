-- 004: Truy vết ô điểm nào giáo viên nhập/sửa gần nhất
-- Giáo viên bộ môn bị gỡ khỏi lớp rồi có cô khác vào dạy tiếp thì ô điểm vẫn là
-- một bản ghi duy nhất (id = score_{class}_{subject}_{student}_{score_type}), cô sau
-- ghi đè lên dữ liệu cô cũ. Hai cột dưới cho sổ điểm biết "ai vừa sửa, sửa lúc nào"
-- để GVCN phân biệt được phần nào do cô cũ chấm, phần nào cô mới đính chính.

ALTER TABLE scores ADD COLUMN IF NOT EXISTS updated_by_teacher_id text;
ALTER TABLE scores ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone;
