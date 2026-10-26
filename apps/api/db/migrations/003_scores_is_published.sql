-- 003: Delta publishing — theo dõi ô điểm nào đã gửi cho phụ huynh
-- is_published   = false: vừa nhập/sửa, CHƯA nằm trong lần gửi sổ liên lạc nào
-- is_published   = true : đã được gửi cho phụ huynh qua POST /grades/publish
-- published_once = true : ô này ĐÃ TỪNG được gửi ít nhất 1 lần (giữ dấu khi
--                         is_published bị reset về false sau khi sửa điểm)
--                         → lần gửi kế tiếp dùng loại thông báo "Đính chính"

ALTER TABLE scores ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT false;
ALTER TABLE scores ADD COLUMN IF NOT EXISTS published_once boolean NOT NULL DEFAULT false;
