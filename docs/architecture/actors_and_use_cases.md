# Tài Liệu Đặc Tả Tác Nhân & Trường Hợp Sử Dụng (Actors & Use Cases Specification)
# Hệ Thống GiaoVienHay (EduConnect) – Quản Lý Học Sinh Cấp 1 & Cấp 2

---

## 1. Giới thiệu & Ranh giới phân quyền hệ thống

Hệ thống phục vụ công tác quản lý học sinh khối **Cấp 1 & Cấp 2** với cơ chế phân quyền RBAC phân cấp rõ rệt giữa:
- **Ban Giám Hiệu (Admin)**
- **Giáo viên Chủ nhiệm (GVCN - Homeroom Teacher)**
- **Giáo viên Bộ môn (GVBM - Subject Teacher)**
- **Phụ huynh học sinh (Parent)**

---

## 2. Danh mục Tác nhân Chi tiết (System Actors)

| Mã Tác nhân | Tên Tác nhân | Vai trò chi tiết | Quyền hạn nghiệp vụ |
| :--- | :--- | :--- | :--- |
| **ACT-01** | **Admin** | Ban Giám Hiệu / Quản trị viên trường | Quản lý niên khóa, khối lớp, phân công GVCN và GVBM, cấu hình biểu phí & BHYT, giám sát toàn trường. |
| **ACT-02A** | **GVCN** (Teacher Homeroom) | Giáo viên Chủ nhiệm | Điểm danh lớp chủ nhiệm, theo dõi & cập nhật trạng thái đóng Học phí & BHYT (`fees_and_insurance`), nhập nhận xét hạnh kiểm, gửi thông báo họp. |
| **ACT-02B** | **GVBM** (Teacher Subject) | Giáo viên Bộ môn | Nhập điểm môn học phụ trách, upload tài liệu Docs/PDF để AI sinh câu hỏi kiểm tra bài cũ, quay random học sinh có mặt lên bảng. |
| **ACT-03** | **Parent** (Phụ huynh) | Phụ huynh học sinh | Nhận thông báo đẩy (vắng học, điểm mới), theo dõi sổ liên lạc, tra cứu tình trạng đóng Học phí & BHYT của con em. |
| **SYS-01** | **Gemini AI Engine** | Dịch vụ AI (Google Gemini API) | Tiếp nhận văn bản trích xuất từ Docs/PDF, tự động sinh ngân hàng câu hỏi kiểm tra bài cũ có cấu trúc. |
| **SYS-02** | **Firebase FCM** | Dịch vụ Push Notification | Gửi thông báo tức thì tới ứng dụng di động React Native của Phụ huynh. |

---

## 3. Ma Trận Phân Quyền Use Case Chi Tiết

| Mã Use Case | Tên Trường hợp sử dụng | Admin | GVCN | GVBM | Phụ huynh |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **UC-AUTH-01** | Đăng nhập hệ thống (Web / Mobile App) | ✔ | ✔ | ✔ | ✔ |
| **UC-AUTH-02** | Đổi mật khẩu & Xem hồ sơ cá nhân | ✔ | ✔ | ✔ | ✔ |
| **UC-ADM-01** | Quản lý Niên khóa, Khối lớp (Cấp 1 & 2), Môn học | ✔ | ✖ | ✖ | ✖ |
| **UC-ADM-02** | Phân công chuyên môn (Gán GVCN & GVBM) | ✔ | ✖ | ✖ | ✖ |
| **UC-ADM-03** | Quản lý hồ sơ học sinh & Liên kết phụ huynh | ✔ | Xem | ✖ | ✖ |
| **UC-ADM-04** | Cấu hình mức thu Học phí & BHYT theo năm | ✔ | ✖ | ✖ | ✖ |
| **UC-ACA-01** | Điểm danh chuyên cần lớp chủ nhiệm | ✖ | ✔ | ✖ | ✖ |
| **UC-ACA-02** | Nhập & Phê duyệt điểm số môn học phụ trách | ✖ | ✖ | ✔ | ✖ |
| **UC-ACA-03** | Nhập nhận xét rèn luyện, hạnh kiểm định kỳ | ✖ | ✔ | ✖ | ✖ |
| **UC-ACA-04** | Import Docs/PDF bằng AI (Gemini) sinh câu hỏi bài cũ | ✖ | ✔ | ✔ | ✖ |
| **UC-ACA-05** | Quay Random học sinh có mặt hôm nay lên bảng | ✖ | ✔ | ✔ | ✖ |
| **UC-FEE-01** | Quản lý cờ thu Học phí & BHYT (`fees_and_insurance`)| Xem | ✔ | ✖ | ✖ |
| **UC-PAR-01** | Tra cứu điểm số & Học bạ điện tử của con | ✖ | ✖ | ✖ | ✔ |
| **UC-PAR-02** | Theo dõi lịch sử chuyên cần & Cảnh báo vắng | ✖ | ✖ | ✖ | ✔ |
| **UC-PAR-03** | Xem trạng thái đóng Học phí & BHYT của con | ✖ | ✖ | ✖ | ✔ |
| **UC-PAR-04** | Nhận thông báo đẩy thời gian thực từ nhà trường | ✖ | ✖ | ✖ | ✔ |

---

## 4. Mô Tả Chi Tiết Các Tính Năng Đặc Thù

### 4.1. Tính năng AI Sinh Câu Hỏi Kiểm Tra Bài Cũ từ Docs/PDF (UC-ACA-04)
- **Đầu vào:** Giáo viên tải lên file tài liệu bài giảng (`.docx` hoặc `.pdf`) của bài học trước hoặc bài học hiện tại.
- **Xử lý:** Backend NestJS trích xuất nội dung văn bản (Text Parser) $\rightarrow$ gọi Google Gemini API với prompt sư phạm:
  *"Hãy tạo 3-5 câu hỏi kiểm tra bài cũ trắc nghiệm hoặc ngắn gọn bám sát nội dung văn bản sau, kèm đáp án và thang điểm."*
- **Đầu ra:** Tạo bản ghi trong bảng `quizzes` và các câu hỏi trong bảng `questions`. Giáo viên có thể duyệt, sửa và bật chế độ trình chiếu lên bảng.

### 4.2. Tính năng Vòng Quay / Random Học Sinh Lên Bảng (UC-ACA-05)
- **Thuật toán cốt lõi:**
  1. Lấy `class_id` hiện tại và ngày hôm nay.
  2. Truy vấn bảng `attendances`: Lọc ra danh sách `student_id` có trạng thái `status = 'PRESENT'` (có mặt). **Tự động loại bỏ học sinh vắng mặt.**
  3. Lọc tiếp những học sinh chưa được kiểm tra bài cũ trong các tiết gần nhất (nếu bật tùy chọn ưu tiên).
  4. Hiển thị giao diện Vòng quay may mắn / Rút thăm ngẫu nhiên sinh động trên Web Next.js để chiếu lên bảng trước lớp.

### 4.3. Quản Lý Học Phí & Bảo Hiểm Y Tế (UC-FEE-01)
- Bảng `fees_and_insurance` theo dõi trực tiếp cho từng học sinh với 2 cờ boolean:
  - `is_paid_tuition` (`true`/`false`): Đã nộp học phí hay chưa.
  - `is_paid_insurance` (`true`/`false`): Đã nộp tiền BHYT học sinh hay chưa.
- GVCN có giao diện checklist nhanh để tích chọn khi nhận tiền trực tiếp từ phụ huynh hoặc hệ thống tự động gán `true` khi phụ huynh thanh toán online.
- Bộ lọc thông minh cho phép GVCN lọc danh sách: *"Các học sinh chưa đóng BHYT"* để gửi tin nhắn nhắc nhở một chạm đến đúng các phụ huynh đó.
