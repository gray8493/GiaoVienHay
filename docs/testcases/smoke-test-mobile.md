# Smoke Test — App Mobile (GiaoVienHay)

> Mục tiêu: chạy 1 lượt kiểm tra toàn bộ luồng chính sau đợt refactor (HTTP client, bỏ mock/hardcode,
> quiz lưu DB thật, xác nhận nhận xét, tháng chuyên cần).
> Cách dùng: làm theo thứ tự, tick `[x]` khi PASS, ghi chú FAIL kèm bước tái hiện.
> Mỗi bước có mục **"Đối chiếu DB"** để khẳng định dữ liệu đi thật vào Supabase, không phải chỉ hiện UI.

---

## 0. Chuẩn bị (10 phút)

- [ ] Backend chạy: `cd apps/api && pnpm dev` — mở `http://localhost:3000/api/v1/health` thấy OK
- [ ] DB đã chạy migration: `apps/api/db/migrations/001_classes_subject_teachers.sql`, `002_notifications_metadata.sql`
- [ ] Đã có dữ liệu seed (lớp/học sinh/accounts) qua `apps/api/src/scripts/seed.ts`
- [ ] `apps/mobile/.env` có đúng `EXPO_PUBLIC_API_URL` (emulator: `http://10.0.2.2:3000/api/v1`; máy thật: IP LAN)
- [ ] Khởi động mobile **xóa cache** để đọc lại .env: `cd apps/mobile && npx expo start -c`
- [ ] Chuẩn bị 2 tài khoản test:
  - **GV**: đã đăng ký, có 1 lớp chủ nhiệm có học sinh
  - **PH**: mới tinh (để test đăng ký + liên kết con)
- Ghi chú môi trường: Emulator Android / Web / máy thật: `....................`
- Ngày test, người test: `....................`

---

## A. Khởi động & Xác thực (test fix App.tsx + auth)

| # | Bước | Kỳ vọng | Kết quả |
|---|------|---------|---------|
| A1 | Mở app (chưa đăng nhập) | Vào thẳng **màn Login**, KHÔNG nháy màn lớp ảo `Lớp 1A` | ☐ |
| A2 | Đăng ký GV mới: SĐT `03x xxx xxx` (10 số), mật khẩu đủ mạnh (hoa + thường + số + ký tự đặc biệt) | Thành công → màn "Chưa có lớp" | ☐ |
| A3 | Thử đăng ký SĐT sai đầu số (vd `0112345678`) | Báo lỗi rõ: "Số điện thoại phải gồm đúng 10 chữ số..." | ☐ |
| A4 | Thử mật khẩu yếu (vd `abc123`) | Báo lỗi rõ về quy tắc mật khẩu | ☐ |
| A5 | Đăng xuất → đăng nhập lại tài khoản GV | Vào Teacher Home đúng lớp | ☐ |
| A6 | Kill app → mở lại | **Vẫn đăng nhập** (giữ phiên), không phải màn Login | ☐ |
| A7 | Để backend chạy, để app idle > 1 giờ rồi thao tác | Không bị văng ra / lỗi 401 — token tự refresh ngầm | ☐ |

## B. Giáo viên — Lớp học & Học sinh

| # | Bước | Kỳ vọng | Kết quả |
|---|------|---------|---------|
| B1 | Tạo lớp mới (vd `5A1`) | Xuất hiện trong "Lớp của tôi" | ☐ |
| B2 | Vào Quản lý lớp → Thêm HS (tên, ngày sinh `15/06/2014`, SĐT PH) | HS hiện trong DS, có mã HS tự sinh | ☐ |
| B3 | Thêm HS sai ngày sinh (`31/02/2014`) | Báo lỗi "Ngày sinh không tồn tại trong lịch thực tế" | ☐ |
| B4 | Sửa HS: đổi tên → Lưu | DS cập nhật đúng tên mới | ☐ |
| B5 | Xóa HS → confirm dialog → Xóa | HS biến mất khỏi DS | ☐ |
| B6 | Pull-to-refresh màn Quản lý lớp | DS load lại từ server | ☐ |
| B7 | Sinh lại mã mời | Mã mới hiện, copy được | ☐ |
| B8 | Phân công GVBM (cần 1 GV khác có trong DB) | Lưu thành công, GV xuất hiện ở mục phân công | ☐ |
| B9 | Bấm gọi / SMS phụ huynh 1 HS | Mở app điện thoại với số đúng | ☐ |

**Đối chiếu DB:** bảng `classes` có lớp mới; bảng `students` có HS mới (đúng tên/ngày sinh/SĐT PH);
xóa HS → dòng `is_deleted = true` (xóa mềm).

## C. Điểm danh

| # | Bước | Kỳ vọng | Kết quả |
|---|------|---------|---------|
| C1 | Điểm danh: đổi 1 HS sang "Vắng có phép" + nhập lý do (vd "Bị sốt") → Lưu | Màn kết quả đúng: Tổng / Có mặt / Vắng | ☐ |
| C2 | Thoát ra → vào lại màn Điểm danh hôm nay | Trạng thái đã lưu được **khôi phục** (HS vắng vẫn marked vắng + lý do) | ☐ |
| C3 | Lưu lại lần 2 (đổi 1 HS khác) | Không bị lỗi "đã tồn tại" — upsert êm | ☐ |
| C4 | Về Teacher Home | Số "có mặt hôm nay" khớp kết quả vừa lưu | ☐ |

**Đối chiếu DB:** bảng điểm danh có records hôm nay đúng trạng thái (`PRESENT` / `ABSENT_EXCUSED` + note),
không tạo dòng trùng khi lưu lại.

## D. Sổ điểm

| # | Bước | Kỳ vọng | Kết quả |
|---|------|---------|---------|
| D1 | Chọn môn → nhập điểm 15 phút cho 2–3 HS → Lưu | Pill điểm hiện số vừa nhập | ☐ |
| D2 | Vào lại màn Sổ điểm | Điểm vẫn còn (lưu DB thật) | ☐ |
| D3 | Bấm "Công bố sổ" → xác nhận | Thông báo thành công | ☐ |
| D4 | Xem Bảng vinh danh | Top HS khớp điểm vừa nhập | ☐ |
| D5 | Gõ điểm `11` vào modal nhập | Bị chặn (không nhận > 10) | ☐ |

**Đối chiếu DB:** bảng `scores` có dòng `score_type = TEST_15P`, `score_value` đúng, `is_published = true` sau D3.

## E. Quiz AI + Vòng quay (test các fix mới)

| # | Bước | Kỳ vọng | Kết quả |
|---|------|---------|---------|
| E1 | Soạn đề AI: chọn môn, 5 câu, độ khó TB → Tạo | Câu hỏi sinh thật từ AI (nội dung theo môn), có quiz ID | ☐ |
| E2 | Sửa câu 1 (đổi nội dung) → Xong | Card cập nhật ngay | ☐ |
| E3 | Xóa câu 2 | Số câu giảm 1 | ☐ |
| E4 | Tạo lại câu 3 | Nội dung **mới khác** (từ AI — không phải câu "hình chữ nhật" cứng cũ) | ☐ |
| E5 | Thoát màn → mở lại màn quiz (tạo đề khác hoặc tra DB) | Chỉnh sửa E2/E3/E4 **được lưu DB** | ☐ |
| E6 | Vòng quay: quay → chấm điểm miệng `8.5` + nhận xét → Lưu | Màn thành công "Đã lưu điểm miệng" | ☐ |
| E7 | Vào Sổ điểm → cột "Miệng" | HS trúng quay có điểm 8.5 | ☐ |
| E8 | Quay trúng lại HS đó, lưu điểm `9.0` | Cột Miệng cập nhật thành 9.0 (không sinh dòng trùng) | ☐ |
| E9 | Lớp chưa điểm danh hôm nay → bấm Vòng quay | Alert "Chưa có học sinh có mặt..." (không crash) | ☐ |

**Đối chiếu DB:** bảng `quizzes` — `questions_json` phản ánh đúng E2/E3/E4;
bảng `scores` có dòng `ORAL_TEST` đúng HS, giá trị bị **ghi đè** ở E8 (không thêm dòng).

## F. Nhận xét & Lịch kiểm tra (GV)

| # | Bước | Kỳ vọng | Kết quả |
|---|------|---------|---------|
| F1 | Gửi nhận xét cho 1 HS | Badge HS chuyển "đã gửi" | ☐ |
| F2 | Tạo lịch kiểm tra: loại "Kiểm tra 15 phút", ngày +7 ngày, nội dung | Xuất hiện trong danh sách + Teacher Home "Sắp kiểm tra" | ☐ |

**Đối chiếu DB:** bảng remarks có nhận xét (subject_code đúng), bảng exam_reminders có dòng mới.

## G. Học phí & BHYT (GV)

| # | Bước | Kỳ vọng | Kết quả |
|---|------|---------|---------|
| G1 | Toggle BHYT "Đã nộp" cho 1 HS, chọn ngày nộp | % thống kê cập nhật | ☐ |
| G2 | Gửi nhắc phí cho khoản chưa nộp | Thông báo thành công | ☐ |

**Đối chiếu DB:** dòng fees của HS đúng `is_paid/paid_date`; bảng notifications có item nhắc phí.

## H. Thông báo (GV)

| # | Bước | Kỳ vọng | Kết quả |
|---|------|---------|---------|
| H1 | Mở màn Thông báo | Icon theo đúng loại (lớp/kiểm tra/nhận xét) | ☐ |
| H2 | Bấm 1 thông báo chưa đọc | Badge chưa đọc giảm | ☐ |
| H3 | "Đánh dấu tất cả đã đọc" | Badge về 0 | ☐ |

## I. Phụ huynh (test acknowledge + tháng chuyên cần + semester — các fix mới)

| # | Bước | Kỳ vọng | Kết quả |
|---|------|---------|---------|
| I1 | Đăng xuất → **Đăng ký tài khoản PH mới** | Vào Parent Home (chưa có con) | ☐ |
| I2 | "+ Thêm con" → nhập **mã học sinh** của HS đã tạo ở B2 | Liên kết thành công, con hiện trong DS | ☐ |
| I3 | Dashboard con: thẻ điểm danh hôm nay | Khớp C1: "Vắng Có Phép" + lý do đúng | ☐ |
| I4 | Dashboard: Điểm mới | Điểm vừa nhập ở D1/E6 (môn + loại đúng) | ☐ |
| I5 | Dashboard: Nhận xét | Số lượng + nội dung nhận xét F1 | ☐ |
| I6 | Tab Học tập → Sổ điểm | Điểm khớp GV nhập; **đổi Học kỳ 1→2** | Dữ liệu đổi theo kỳ (không còn nút vô dụng) | ☐ |
| I7 | Tab Chuyên cần | Mặc định **tháng hiện tại** (không còn "Tháng 10" cứng); thống kê khớp | ☐ |
| I8 | Bấm pill chọn tháng → chọn tháng khác | Sheet mở, đổi tháng → logs thay đổi | ☐ |
| I9 | Tab Nhận xét → bấm "Xác Nhận" trên nhận xét | Thành công; nút đổi thành badge "Đã đọc" | ☐ |
| I10 | Đăng nhập lại PH → vào lại nhận xét đó | Vẫn "Đã đọc" (lưu DB, không phải state tạm) | ☐ |
| I11 | Tab Thu phí | BHYT "Đã nộp" khớp G1 | ☐ |
| I12 | Màn Thông báo PH | Có nhắc phí (G2) + lịch kiểm tra (F2); đánh đã đọc được | ☐ |
| I13 | Hồ sơ PH: sửa tên/email → Lưu → thoát vào lại | Thông tin mới được giữ | ☐ |

**Đối chiếu DB (quan trọng nhất — I9/I10):** bảng `remarks`, dòng nhận xét F1:
`parent_acknowledged = true` sau khi PH bấm Xác nhận. GV mở lại màn nhận xét lớp cũng thấy trạng thái đã đọc.

## J. Biên lỗi & mạng

| # | Bước | Kỳ vọng | Kết quả |
|---|------|---------|---------|
| J1 | Tắt backend → kill app → mở lại | Không crash; teacher rơi về "Chưa có lớp" / PH thấy trống *(đã biết: chưa có banner lỗi mạng — ghi nhận nếu thấy khó chịu)* | ☐ |
| J2 | Bật lại backend → pull-to-refresh Quản lý lớp | Dữ liệu trở lại bình thường | ☐ |
| J3 | Nhập sai mã mời khi liên kết con | Thông báo rõ "Mã học sinh không hợp lệ..." | ☐ |
| J4 | Tìm GVBM khi backend tắt | **Hiện Alert lỗi** (không còn danh sách 6 giáo viên mẫu ảo) | ☐ |

## K. Push notification (nếu đã có VAPID key / chạy native)

- [ ] K1: Log console có `[FCM] Đã đăng ký Device Token với Backend thành công` (không phải token fallback `fcm_web_...`)
- [ ] K2: Backend gửi nhắc phí (G2) → PH **đang mở app** nhận được Alert thông báo
- [ ] K3: PH để app nền / tắt → gửi thông báo → có push đến hệ điều hành *(chỉ native hoặc web có VAPID)*

---

## Tiêu chí "PASS" chung

- 100% mục A–I PASS là đủ confidence để dùng DB thật cho demo.
- Mục J–K được phép FAIL có điều kiện (đã biết hạn chế), nhưng phải ghi chú lại.
- Bất kỳ FAIL nào ở E (quiz DB), I9–I10 (acknowledge DB) → **dừng, báo lại ngay** vì đó là các fix vừa làm.

## Bảng tổng kết (điền sau khi chạy)

| Nhóm | PASS | FAIL | Ghi chú |
|------|------|------|---------|
| A — Auth | /7 | | |
| B — Lớp & HS | /9 | | |
| C — Điểm danh | /4 | | |
| D — Sổ điểm | /5 | | |
| E — Quiz + Vòng quay | /9 | | |
| F — Nhận xét/Lịch KT | /2 | | |
| G — Phí & BHYT | /2 | | |
| H — Thông báo | /3 | | |
| I — Phụ huynh | /13 | | |
| J — Biên lỗi | /4 | | |
| K — Push | /3 | | |
