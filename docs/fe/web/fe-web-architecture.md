# Kiến Trúc Web Quản Trị Next.js (Web Frontend Architecture)
# Nền tảng: Next.js 14+ (App Router / TypeScript)
# Hệ thống Quản lý Học sinh Cấp 1 & Cấp 2

Tài liệu này đặc tả chi tiết cấu trúc, giao diện và tính năng đặc thù trên ứng dụng **Web Quản trị Next.js** phục vụ Admin, Giáo viên Chủ nhiệm (GVCN) và Giáo viên Bộ môn (GVBM).

---

## 1. Các Tính Năng Giao Diện Đặc Thù

### 1.1. Chế Độ Trình Chiếu Lớp Học & AI Quiz Generator
- **Import Giáo án/Docs/PDF:** Giáo viên kéo thả file bài giảng vào khu vực upload, hệ thống hiển thị tiến trình bóc tách AI (Google Gemini API).
- **Xem trước & Tinh chỉnh câu hỏi:** Bảng hiển thị danh sách câu hỏi trắc nghiệm A-B-C-D kèm lời giải thích, cho phép chỉnh sửa trực tiếp.
- **Classroom Presentation Mode (Toàn màn hình):**
  - Giao diện Fullscreen, nền tối hoặc tương phản cao, font chữ to rõ nét phục vụ máy chiếu và TV/Bảng thông minh trong lớp.
  - Tích hợp bộ đếm giờ (Timer) đếm ngược 30s/45s/60s.
  - Nút bấm ẩn/hiện đáp án từng bước.

### 1.2. Vòng Quay May Mắn / Random Học Sinh Lên Bảng
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
│   │   │   ├── homeroom/                   # Dành cho GVCN
│   │   │   │   ├── attendance/             # Điểm danh lớp chủ nhiệm
│   │   │   │   ├── fees-insurance/         # Quản lý cờ thu Học phí & BHYT
│   │   │   │   └── conduct/                # Nhận xét hạnh kiểm
│   │   │   └── subject/                    # Dành cho GVBM
│   │   │       ├── gradebook/              # Sổ điểm bộ môn
│   │   │       ├── ai-quiz/                # Import Docs/PDF & Sinh câu hỏi bằng Gemini
│   │   │       │   ├── upload/             # Tải tài liệu
│   │   │       │   └── presentation/       # Chế độ trình chiếu lên bảng
│   │   │       └── random-student/         # Vòng quay học sinh có mặt hôm nay
│   │   │           └── page.tsx
│   ├── components/
│   │   ├── classroom/                      # LuckyWheel, QuizSlide, CountdownTimer
│   │   ├── fees/                           # FeeStatusBadge, FeeChecklistTable
│   │   └── ui/                             # Table, Modal, Button, Checkbox
│   └── services/
│       ├── gemini-quiz.service.ts          # Gọi API trích xuất và sinh câu hỏi
│       ├── attendance.service.ts
│       └── fees.service.ts
```
