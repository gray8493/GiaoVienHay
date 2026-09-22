# Tài Liệu Yêu Cầu Dự Án (Project Requirements Specification)
# Hệ Thống GiaoVienHay (EduConnect) – Quản Lý Học Sinh Cấp 1 & Cấp 2

---

## 1. Tổng quan & Định vị sản phẩm

**GiaoVienHay (EduConnect)** là giải pháp phần mềm chuyên biệt phục vụ công tác quản trị và giảng dạy tại các trường Tiểu học (Cấp 1) và THCS (Cấp 2). Hệ thống tập trung tối ưu năng suất cho **Giáo viên chủ nhiệm (GVCN)** và **Giáo viên bộ môn (GVBM)** trong các nghiệp vụ hàng ngày: kiểm tra bài cũ, điểm danh chuyên cần, đôn đốc BHYT/học phí và kết nối trực tiếp với phụ huynh.

---

## 2. Yêu Cầu Chức Năng Cốt Lõi (Functional Requirements - FR)

### FR-01: Quản lý Phân quyền Chi tiết (RBAC Guard in NestJS)
- **FR-01.1:** Phân quyền chuẩn xác giữa 4 nhóm vai trò:
  - `ADMIN`: Ban giám hiệu, quản lý toàn trường, danh mục khối lớp 1-9.
  - `TEACHER_HOMEROOM` (GVCN): Điểm danh nề nếp, quản lý BHYT & học phí lớp mình, viết nhận xét rèn luyện.
  - `TEACHER_SUBJECT` (GVBM): Nhập điểm bộ môn, tạo đề kiểm tra bài cũ bằng AI, quay random học sinh.
  - `PARENT`: Tra cứu sổ điểm, chuyên cần, BHYT của đúng học sinh liên kết.

### FR-02: Import Docs/PDF bằng AI (Gemini API) Sinh Câu Hỏi Kiểm Tra Bài Cũ
- **FR-02.1:** Cho phép giáo viên tải lên tài liệu giáo trình bài học (`.docx`, `.pdf`).
- **FR-02.2:** Backend NestJS tích hợp **Google Gemini API** (`gemini-1.5-flash`) tự động trích xuất nội dung và sinh từ 3-5 câu hỏi trắc nghiệm/tự luận ngắn phục vụ kiểm tra bài cũ 5-10 phút đầu giờ.
- **FR-02.3:** Lưu trữ câu hỏi vào các bảng `quizzes` và `questions`, hỗ trợ chế độ xem trước (preview) và chỉnh sửa nội dung/đáp án.
- **FR-02.4:** Cung cấp chế độ trình chiếu toàn màn hình (Classroom Presentation Mode) có đồng hồ đếm ngược, hiển thị đáp án sau khi học sinh trả lời.

### FR-03: Vòng Quay / Random Học Sinh Lên Bảng
- **FR-03.1:** Thuật toán lọc thông minh: Chỉ lấy danh sách học sinh có trạng thái **`PRESENT` (Có mặt)** trong bảng `attendances` của ngày hôm nay. Tự động loại trừ các em vắng mặt.
- **FR-03.2:** Giao diện Vòng quay may mắn (Lucky Wheel) sinh động trên Web Next.js có hiệu ứng âm thanh, tối ưu chiếu lên máy chiếu/bảng thông minh.
- **FR-03.3:** Cho phép giáo viên chấm điểm trực tiếp tại chỗ và tự động lưu vào bảng `scores` (cột điểm miệng).

### FR-04: Quản lý Học Phí & Bảo Hiểm Y Tế (BHYT)
- **FR-04.1:** Quản lý theo dõi trực tiếp trong bảng `fees_and_insurance` với 2 cờ boolean:
  - `is_paid_tuition`: Trạng thái đã nộp học phí.
  - `is_paid_insurance`: Trạng thái đã nộp tiền BHYT học sinh.
- **FR-04.2:** Giao diện tích chọn 1-chạm cho GVCN khi thu tiền mặt tại lớp hoặc tự động cập nhật khi phụ huynh đóng online.
- **FR-04.3:** Hỗ trợ tính năng lọc nhanh danh sách chưa nộp BHYT và phát thông báo nhắc nhở tức thời (Push Notification FCM) đến phụ huynh.

### FR-05: Điểm Danh Chuyên Cần & Báo Cáo Sĩ Số
- **FR-05.1:** Điểm danh nhanh trên Mobile App React Native theo các trạng thái: Có mặt, Vắng có phép, Vắng không phép.
- **FR-05.2:** Tự động gửi cảnh báo vắng học ngay lập tức đến điện thoại của phụ huynh qua FCM.

### FR-06: Sổ Điểm Điện Tử & Tính Điểm Trung Bình
- **FR-06.1:** Nhập điểm thành phần theo thang điểm 10 (bước nhảy 0.1).
- **FR-06.2:** Tự động tính điểm trung bình môn và điểm trung bình học kỳ theo quy chế đánh giá của Bộ Giáo Dục.

---

## 3. Kiến Trúc CSDL 10 Bảng Cốt Lõi (Database Schema)

Hệ thống triển khai trên PostgreSQL với 10 bảng thực thể:
1. `users` (Tài khoản, mật khẩu băm, role: Admin, GVCN, GVBM, Parent)
2. `classes` (Khối 1 -> 9, tên lớp, năm học, `homeroom_teacher_id`)
3. `students` (Mã học sinh, họ tên, ngày sinh, giới tính, `class_id`)
4. `student_parent_relations` (Quan hệ phụ huynh - học sinh)
5. `scores` (Điểm miệng, 15p, 1 tiết, giữa kỳ, cuối kỳ)
6. `attendances` (Điểm danh ngày, tiết, trạng thái, lý do vắng)
7. `fees_and_insurance` (`is_paid_tuition`, `is_paid_insurance`, số tiền, ngày nộp)
8. `quizzes` (Đề kiểm tra bài cũ tạo từ tài liệu)
9. `questions` (Câu hỏi, 4 đáp án A-B-C-D, đáp án đúng, giải thích)
10. `notifications` (Lịch sử thông báo đẩy gửi tới phụ huynh)
