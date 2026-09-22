# Tài Liệu Đặc Tả Tác Nhân & Trường Hợp Sử Dụng (Actors & Use Cases Specification)
# Hệ Thống GiaoVienHay – Quản Lý Học Sinh Cấp 1 & Cấp 2

---

## 1. Giới thiệu & Ranh giới phân quyền hệ thống

Hệ thống phân định rõ rệt quyền hạn giữa các nhóm tác nhân, trong đó **Giáo viên chủ nhiệm (GVCN)** sở hữu toàn bộ các quyền giảng dạy sư phạm của **Giáo viên bộ môn (GVBM)** và có thêm các quyền quản trị riêng cho lớp chủ nhiệm:

```text
               ┌───────────────────────────────┐
               │    Giáo viên Bộ môn (GVBM)    │
               │ - Nhập điểm môn phụ trách     │
               │ - Dò bài cũ, Random học sinh  │
               │ - Dùng AI tạo đề & tạo Game   │
               └───────────────┬───────────────┘
                               │ (Kế thừa toàn bộ quyền giảng dạy)
                               ▼
               ┌───────────────────────────────┐
               │  Giáo viên Chủ nhiệm (GVCN)   │
               │ + Điểm danh lớp chủ nhiệm     │
               │ + Quản lý Học phí & BHYT      │
               │ + Nhận xét hạnh kiểm cả kỳ    │
               │ + Phát thông báo toàn lớp     │
               └───────────────────────────────┘
```

---

## 2. Danh mục Tác nhân Chi tiết (System Actors)

| Mã Tác nhân | Tên Tác nhân | Vai trò chi tiết | Quyền hạn nghiệp vụ |
| :--- | :--- | :--- | :--- |
| **ACT-01** | **Admin** | Ban Giám Hiệu / Quản trị viên trường | Quản lý niên khóa, khối lớp 1-9, phân công chuyên môn, cấu hình biểu phí & BHYT, giám sát toàn trường. |
| **ACT-02A** | **GVCN** (Teacher Homeroom) | Giáo viên Chủ nhiệm | **Toàn quyền giảng dạy (dò bài, chấm điểm, tạo game AI, random học sinh)** + Quản lý nề nếp, điểm danh, theo dõi cờ nộp Học phí & BHYT (`fees_and_insurance`), nhận xét rèn luyện. |
| **ACT-02B** | **GVBM** (Teacher Subject) | Giáo viên Bộ môn | Nhập điểm môn học phụ trách, upload tài liệu Docs/PDF để AI sinh câu hỏi kiểm tra bài cũ, quay random học sinh có mặt hôm nay, tổ chức mini-game lớp học. |
| **ACT-03** | **Parent** (Phụ huynh) | Phụ huynh học sinh | Nhận thông báo đẩy (vắng học, điểm mới, nhắc BHYT), theo dõi sổ liên lạc, tra cứu tình trạng đóng Học phí & BHYT của con em. |
| **SYS-01** | **Gemini AI Engine** | Dịch vụ AI (Google Gemini API) | Trích xuất văn bản từ Docs/PDF, tự động tạo câu hỏi trắc nghiệm/tự luận ngắn và cấu hình luật chơi mini-game tương tác. |
| **SYS-02** | **Firebase FCM** | Dịch vụ Push Notification | Gửi thông báo tức thì tới ứng dụng di động React Native của Phụ huynh. |

> **LƯU Ý VỀ PHẠM VI TÁC NHÂN (ACTOR SCOPE):**  
> Hệ thống GiaoVienHay **KHÔNG CÓ TÁC NHÂN HỌC SINH (Student)**. Học sinh không được cấp tài khoản và không có chức năng/giao diện làm bài kiểm tra trực tuyến. Mọi hoạt động khởi động, ôn tập, mini-game diễn ra trực tiếp tại phòng học (chiếu bảng, giơ bảng đáp án, thao tác bảng thông minh); Giáo viên là người duy nhất thực hiện chấm và nhập điểm lên hệ thống.

---

## 3. Ma Trận Phân Quyền Use Case Toàn Diện

| Mã Use Case | Tên Trường hợp sử dụng | Admin | GVCN | GVBM | Phụ huynh |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **UC-AUTH-01** | Đăng nhập hệ thống (Web / Mobile App) | ✔ | ✔ | ✔ | ✔ |
| **UC-AUTH-02** | Đổi mật khẩu & Xem hồ sơ cá nhân | ✔ | ✔ | ✔ | ✔ |
| **UC-ADM-01** | Quản lý Niên khóa, Khối lớp (Cấp 1 & 2), Môn học | ✔ | ✖ | ✖ | ✖ |
| **UC-ADM-02** | Phân công chuyên môn (Gán GVCN & GVBM) | ✔ | ✖ | ✖ | ✖ |
| **UC-ADM-03** | Quản lý hồ sơ học sinh & Liên kết phụ huynh | ✔ | Xem | ✖ | ✖ |
| **UC-ADM-04** | Cấu hình mức thu Học phí & BHYT theo năm | ✔ | ✖ | ✖ | ✖ |
| **UC-ACA-01** | Điểm danh chuyên cần lớp chủ nhiệm | ✖ | ✔ | ✖ | ✖ |
| **UC-ACA-02** | Nhập & Phê duyệt điểm số môn học phụ trách | ✖ | ✔ | ✔ | ✖ |
| **UC-ACA-03** | Nhập nhận xét rèn luyện, hạnh kiểm định kỳ | ✖ | ✔ | ✖ | ✖ |
| **UC-ACA-04** | Dò bài cũ & Quay Random học sinh có mặt hôm nay | ✖ | ✔ | ✔ | ✖ |
| **UC-ACA-05** | Import Docs/PDF bằng AI (Gemini) sinh câu hỏi bài cũ | ✖ | ✔ | ✔ | ✖ |
| **UC-ACA-06** | Tạo & Khởi chạy Mini-game tương tác lớp học | ✖ | ✔ | ✔ | ✖ |
| **UC-ACA-07** | Nhập điểm kiểm tra tại lớp & Xem Bảng xếp hạng | ✖ | ✔ | ✔ | ✖ |
| **UC-FEE-01** | Quản lý cờ thu Học phí & BHYT (`fees_and_insurance`)| Xem | ✔ | ✖ | ✖ |
| **UC-PAR-01** | Tra cứu điểm số & Học bạ điện tử của con | ✖ | ✖ | ✖ | ✔ |
| **UC-PAR-02** | Theo dõi lịch sử chuyên cần & Cảnh báo vắng | ✖ | ✖ | ✖ | ✔ |
| **UC-PAR-03** | Xem trạng thái đóng Học phí & BHYT của con | ✖ | ✖ | ✖ | ✔ |
| **UC-PAR-04** | Nhận thông báo đẩy thời gian thực từ nhà trường | ✖ | ✖ | ✖ | ✔ |

---

## 4. Mô Tả Các Nghiệp Vụ Tương Tác Giảng Dạy Mới

### 4.1. Tạo & Vận Hành Mini-game Tương Tác Lớp Học (UC-ACA-06)
- **Tác nhân thực hiện:** GVCN hoặc GVBM.
- **Mô tả:** Sau khi AI sinh bộ câu hỏi từ file giáo trình `.docx`/`.pdf`, giáo viên chọn kiểu game để biến tiết học thành sân chơi sôi nổi:
  - **Game 1 - Rung Chuông Vàng:** Học sinh trong lớp cùng giơ bảng chọn A/B/C/D, giáo viên bấm đáp án trên màn hình để kiểm tra ai ở lại sàn thi đấu.
  - **Game 2 - Vượt Chướng Ngại Vật (Đua xe):** Chia lớp thành các tổ thi đua, trả lời đúng câu hỏi thì xe của đội tiến 1 ô.
  - **Game 3 - Mở Hộp Quà May Mắn:** Chọn câu hỏi bất kỳ, trả lời đúng mở được phần thưởng điểm số hoặc sticker khen thưởng.

### 4.2. Dò Bài Cũ & Vòng Quay Random Học Sinh (UC-ACA-04)
- Áp dụng cho cả **GVCN** và **GVBM** đầu mỗi tiết học.
- Thuật toán tự động đọc bảng `attendances` và **chỉ nạp các học sinh CÓ MẶT (`status = 'PRESENT'`)** vào vòng quay, đảm bảo không bao giờ quay trúng học sinh đang vắng.
- Kết hợp hiển thị câu hỏi do AI tạo ra để học sinh trả lời, giáo viên cho điểm trực tiếp tại chỗ.

