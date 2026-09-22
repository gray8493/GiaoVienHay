# Tài Liệu Yêu Cầu Dự Án (Project Requirements Specification)
# Hệ Thống GiaoVienHay (EduConnect) – Quản Lý Học Sinh Cấp 1 & Cấp 2

---

## 1. Tổng quan & Định vị sản phẩm

**GiaoVienHay (EduConnect)** là giải pháp phần mềm chuyên biệt phục vụ công tác quản trị và giảng dạy tại các trường Tiểu học (Cấp 1) và THCS (Cấp 2). Hệ thống tập trung tối ưu năng suất cho **Giáo viên chủ nhiệm (GVCN)** và **Giáo viên bộ môn (GVBM)** trong các nghiệp vụ hàng ngày: dò bài cũ, tạo mini-game tương tác lớp học bằng AI, điểm danh chuyên cần, đôn đốc BHYT/học phí và kết nối trực tiếp với phụ huynh.

---

## 2. Yêu Cầu Chức Năng Cốt Lõi (Functional Requirements - FR)

### FR-01: Quản lý Phân quyền Chi tiết (RBAC Guard in NestJS)
- **FR-01.1:** Phân quyền chuẩn xác giữa 4 nhóm vai trò:
  - `ADMIN`: Ban giám hiệu, quản lý toàn trường, danh mục khối lớp 1-9.
  - `TEACHER_HOMEROOM` (GVCN): **Sở hữu toàn bộ quyền giảng dạy (dò bài, nhập điểm, tạo game AI, quay random học sinh)** + Quản lý điểm danh nề nếp, BHYT & học phí, nhận xét hạnh kiểm lớp chủ nhiệm.
  - `TEACHER_SUBJECT` (GVBM): Nhập điểm bộ môn, tạo đề kiểm tra bài cũ bằng AI, quay random học sinh, tạo game lớp học.
  - `PARENT`: Tra cứu sổ điểm, chuyên cần, tình trạng BHYT/học phí của đúng học sinh liên kết.

### FR-02: Import Docs/PDF bằng AI (Gemini API) Sinh Câu Hỏi Kiểm Tra Bài Cũ
- **FR-02.1:** Cho phép giáo viên (cả GVCN và GVBM) tải lên tài liệu giáo trình bài học (`.docx`, `.pdf`).
- **FR-02.2:** Backend NestJS tích hợp **Google Gemini API** (`gemini-1.5-flash`) tự động trích xuất nội dung và sinh từ 3-5 câu hỏi trắc nghiệm/tự luận ngắn phục vụ kiểm tra bài cũ 5-10 phút đầu giờ.
- **FR-02.3:** Lưu trữ câu hỏi vào các bảng `quizzes` và `questions`, hỗ trợ chế độ xem trước (preview) và chỉnh sửa nội dung/đáp án.

### FR-03: Tạo & Vận Hành Mini-Game Tương Tác Lớp Học (Classroom Gamification)
- **FR-03.1:** Hỗ trợ tính năng 1-chạm: Chuyển đổi bộ câu hỏi AI thành trò chơi lớp học sinh động chiếu lên bảng tương tác / máy chiếu.
- **FR-03.2:** Cung cấp 4 chế độ game phổ biến cho học sinh Cấp 1 & Cấp 2:
  1. *Rung chuông vàng / Đấu trí:* Đếm ngược thời gian, học sinh giơ bảng chọn đáp án, loại trực tiếp hoặc tính điểm tích lũy.
  2. *Vượt chướng ngại vật / Đua xe:* Chia tổ thi đua, tổ trả lời đúng sẽ tiến về đích.
  3. *Hộp quà may mắn (Mystery Box):* Trả lời câu hỏi mở quà trúng sticker/điểm cộng.
  4. *Chạm nối ghép cặp trên bảng thông minh:* Kéo thả nối câu hỏi với đáp án đúng bằng cảm ứng chạm.
- **FR-03.3:** Hiệu ứng đồ họa bắt mắt, âm thanh reo hò kịch tính, tự động vinh danh bảng vàng cuối trò chơi.

### FR-04: Dò Bài Cũ & Vòng Quay / Random Học Sinh Lên Bảng
- **FR-04.1:** Thuật toán lọc thông minh: Chỉ lấy danh sách học sinh có trạng thái **`PRESENT` (Có mặt)** trong bảng `attendances` của ngày hôm nay. Tự động loại trừ các em vắng mặt.
- **FR-04.2:** Giao diện Vòng quay may mắn (Lucky Wheel) sinh động trên Web Next.js có hiệu ứng âm thanh, tối ưu chiếu lên máy chiếu/bảng thông minh.
- **FR-04.3:** Cho phép giáo viên chấm điểm trực tiếp tại chỗ và tự động lưu vào bảng `scores` (cột điểm miệng).

### FR-05: Quản lý Học Phí & Bảo Hiểm Y Tế (BHYT)
- **FR-05.1:** Quản lý theo dõi trực tiếp trong bảng `fees_and_insurance` với 2 cờ boolean:
  - `is_paid_tuition`: Trạng thái đã nộp học phí.
  - `is_paid_insurance`: Trạng thái đã nộp tiền BHYT học sinh.
- **FR-05.2:** Giao diện tích chọn 1-chạm cho GVCN khi thu tiền mặt tại lớp hoặc tự động cập nhật khi phụ huynh đóng online.
- **FR-05.3:** Hỗ trợ tính năng lọc nhanh danh sách chưa nộp BHYT và phát thông báo nhắc nhở tức thời (Push Notification FCM) đến phụ huynh.

### FR-06: Điểm Danh Chuyên Cần & Báo Cáo Sĩ Số
- **FR-06.1:** Điểm danh nhanh trên Mobile App React Native theo các trạng thái: Có mặt, Vắng có phép, Vắng không phép.
- **FR-06.2:** Tự động gửi cảnh báo vắng học ngay lập tức đến điện thoại của phụ huynh qua FCM.

### FR-07: Sổ Điểm Điện Tử & Tính Điểm Trung Bình
- **FR-07.1:** Nhập điểm thành phần theo thang điểm 10 (bước nhảy 0.1).
- **FR-07.2:** Tự động tính điểm trung bình môn và điểm trung bình học kỳ theo quy chế đánh giá của Bộ Giáo Dục.
