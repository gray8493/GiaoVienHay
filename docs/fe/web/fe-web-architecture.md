# Kiến Trúc Web Quản Trị Next.js (Web Frontend Architecture)
# Nền tảng: Next.js 14+ (App Router / TypeScript)
# Hệ thống Quản lý Học sinh Cấp 1 & Cấp 2

Tài liệu này đặc tả chi tiết cấu trúc, giao diện và tính năng đặc thù trên ứng dụng **Web Quản trị Next.js** phục vụ Admin, Giáo viên Chủ nhiệm (GVCN) và Giáo viên Bộ môn (GVBM).

---

## 1. Các Tính Năng Giao Diện Đặc Thù

### 1.1. AI Quiz Generator & Bộ 4 Mini-Game Tương Tác Lớp Học
- **Import Giáo án/Docs/PDF:** Giáo viên kéo thả file bài giảng vào khu vực upload, hệ thống hiển thị tiến trình bóc tách AI (Google Gemini API).
- **Bộ 4 Chế Độ Mini-Game Trình Chiếu Lớp Học (Fullscreen Canvas/Animation):**
  1. **Golden Bell (Rung chuông vàng):** Hiển thị câu hỏi đếm ngược 30s, âm thanh kịch tính, hiển thị tỉ lệ chọn đáp án và loại trực tiếp học sinh trả lời sai.
  2. **Class Racing (Vượt chướng ngại vật / Đua xe):** Chia lớp thành các tổ (Tổ 1 -> Tổ 4), tổ trả lời đúng xe sẽ tăng tốc về đích.
  3. **Mystery Box (Hộp quà bí mật):** Màn hình hiển thị các hộp quà nhiều màu sắc, học sinh trả lời đúng câu hỏi bài cũ được mở hộp quà may mắn (điểm cộng, tràng pháo tay).
  4. **Smartboard Match (Chạm nối đáp án):** Giao diện cảm ứng cho phép học sinh Cấp 1 lên bảng kéo thả nối từ/hình ảnh trực tiếp bằng tay/bút tương tác.

### 1.2. Dò Bài Cũ & Vòng Quay May Mắn (Lucky Wheel)
- **Giao diện Vòng quay Canvas / CSS Animation:** Mô phỏng vòng quay bánh xe may mắn rực rỡ sắc màu kèm âm thanh quay số hồi hộp.
- **Dữ liệu thời gian thực:** Tự động gọi API lấy danh sách học sinh **có mặt hôm nay** (dựa vào dữ liệu điểm danh thực tế vừa lưu, tự động loại bỏ học sinh vắng).
- **Pop-up Chấm điểm nhanh:** Khi kim dừng lại ở học sinh nào, pop-up hiển thị ngay tên học sinh kèm ô nhập điểm miệng và nút "Lưu vào sổ điểm".

### 1.3. Bảng Quản Lý Học Phí & Bảo Hiểm Y Tế (BHYT) của GVCN
- Bảng danh sách học sinh của lớp chủ nhiệm với 2 cột checkbox trạng thái nhanh:
  - Cột `Học phí` (cờ boolean `is_paid_tuition`).
  - Cột `BHYT` (cờ boolean `is_paid_insurance`).
- Bộ lọc 1-chạm: "Xem các em chưa nộp BHYT", "Xem các em chưa nộp Học phí".
- Nút "Gửi thông báo nhắc nhở": Tự động mở hộp thoại gửi push notification tới riêng phụ huynh của các học sinh được lọc.

---

## 2. Cấu Trúc Thư Mục Chuẩn (Project Folder Structure)

```text
web-admin/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   ├── (dashboard)/
│   │   │   ├── admin/                      # Dành cho Ban Giám Hiệu
│   │   │   │   ├── classes/                # Quản lý lớp, khối 1-9
│   │   │   │   ├── assignments/            # Phân công GVCN & GVBM
│   │   │   │   └── fee-config/             # Cấu hình biểu phí & BHYT
│   │   │   ├── teacher/                    # Dành cho Giáo viên (Cả GVCN & GVBM đều truy cập)
│   │   │   │   ├── gradebook/              # Sổ điểm môn học
│   │   │   │   ├── attendance/             # Điểm danh lớp học
│   │   │   │   ├── fees-insurance/         # Quản lý cờ thu Học phí & BHYT (chỉ lớp chủ nhiệm)
│   │   │   │   ├── oral-test/              # Dò bài cũ & Vòng quay Random học sinh có mặt
│   │   │   │   ├── ai-quiz/                # Import Docs/PDF sinh câu hỏi AI
│   │   │   │   │   ├── upload/
│   │   │   │   │   └── games/              # 4 Mini-games: GoldenBell, Racing, MysteryBox, Matching
│   │   │   │   └── conduct/                # Nhận xét hạnh kiểm
│   │   │   └── layout.tsx
│   ├── components/
│   │   ├── games/                          # GoldenBellBoard, RacingTrack, MysteryBoxes, MatchBoard
│   │   ├── classroom/                      # LuckyWheel, CountdownTimer, ScoreCelebration
│   │   ├── fees/                           # FeeStatusBadge, FeeChecklistTable
│   │   └── ui/                             # Table, Modal, Button, Checkbox
│   └── services/
│       ├── gemini-quiz.service.ts          # Gọi API trích xuất và sinh câu hỏi
│       ├── attendance.service.ts
│       └── fees.service.ts
```
