# Tài Liệu Tổng Quan Hệ Thống (System Overview)
# GiaoVienHay (EduConnect) – Hệ Thống Quản Lý Học Sinh Cấp 1 & Cấp 2

---

## 1. Giới thiệu & Bối cảnh dự án (Project Background)

### 1.1. Bối cảnh bài toán
Trong các trường Tiểu học (Cấp 1) và Trung học Cơ sở (Cấp 2), công tác giảng dạy và quản trị lớp học có nhiều đặc thù:
- Giáo viên phải quản lý chặt chẽ sĩ số học sinh từng buổi, mối liên hệ giữa nhà trường và phụ huynh đòi hỏi tính tức thời cao.
- Đầu mỗi tiết học, giáo viên thường xuyên phải **kiểm tra bài cũ** bằng cách đặt câu hỏi và gọi học sinh lên bảng. Việc soạn câu hỏi kiểm tra bài cũ từ giáo án/tài liệu và chọn học sinh thường mang tính cảm tính, tốn thời gian.
- Công tác thu nộp **Học phí và Bảo hiểm Y tế (BHYT)** của học sinh cấp 1 & 2 phần lớn do Giáo viên chủ nhiệm (GVCN) theo dõi, đôn đốc phụ huynh đóng đúng hạn.
- Sự phân định rõ ràng giữa quyền hạn của **Giáo viên chủ nhiệm (GVCN)** (quản lý toàn diện lớp, điểm danh, nề nếp, BHYT) và **Giáo viên bộ môn (GVBM)** (nhập điểm bộ môn, kiểm tra bài cũ môn phụ trách).

### 1.2. Mục tiêu hệ thống GiaoVienHay (EduConnect)
**GiaoVienHay** là nền tảng quản lý giáo dục hiện đại, chuyên biệt cho khối Cấp 1 & Cấp 2, phục vụ:
1. **Admin (Ban Giám Hiệu):** Quản trị trường học, khối lớp, phân công GVCN và GV Bộ môn, giám sát tiến độ thu học phí & BHYT toàn trường.
2. **Giáo viên Chủ nhiệm (GVCN):** Quản lý hồ sơ học sinh của lớp, điểm danh hàng ngày, quản lý trạng thái đóng Học phí & BHYT, gửi thông báo và nhận xét hạnh kiểm.
3. **Giáo viên Bộ môn (GVBM):** Nhập điểm số môn học phụ trách, sử dụng AI bóc tách tài liệu bài học để sinh câu hỏi kiểm tra bài cũ, và sử dụng công cụ **Quay Random Học sinh** lên bảng.
4. **Phụ huynh (Parent):** Nhận thông báo tức thì khi con vắng học, tra cứu điểm số, theo dõi tình trạng đóng Học phí & BHYT của con qua ứng dụng di động.

---

## 2. Các Tính Năng Đặc Thù Cốt Lõi (Signature Features)

### 2.1. Import Docs/PDF bằng AI (Gemini API) Sinh Câu Hỏi Kiểm Tra Bài Cũ
- Giáo viên tải lên tài liệu bài giảng hoặc giáo trình định dạng `.docx`, `.pdf`.
- Backend NestJS gửi nội dung trích xuất tới **Google Gemini API** kèm prompt phân tích sư phạm để tự động sinh ngân hàng câu hỏi trắc nghiệm hoặc tự luận ngắn phục vụ kiểm tra 5-10 phút đầu giờ.
- Hỗ trợ chiếu câu hỏi lên bảng thông minh/máy chiếu lớp học.

### 2.2. Vòng Quay / Chọn Ngẫu Nhiên Học Sinh (Random Student Wheel)
- Thuật toán tự động lọc ra **danh sách các học sinh CÓ MẶT trong buổi học hôm nay** (dựa trên dữ liệu điểm danh thực tế vừa lưu).
- Giao diện cung cấp vòng quay may mắn / chọn ngẫu nhiên trực quan để gọi học sinh lên bảng trả lời câu hỏi bài cũ, tạo không khí hứng thú, công bằng, minh bạch trong lớp học.

### 2.3. Quản Lý Học Phí & Bảo hiểm Y tế (BHYT)
- Theo dõi trạng thái hoàn thành nghĩa vụ tài chính của từng học sinh thông qua các cờ trạng thái boolean:
  - `is_paid_tuition`: Trạng thái đóng học phí định kỳ.
  - `is_paid_insurance`: Trạng thái tham gia và nộp tiền Bảo hiểm Y tế học sinh.
- GVCN và Admin có thể lọc nhanh danh sách các học sinh chưa nộp để gửi thông báo nhắc nhở tự động đến phụ huynh.

---

## 3. Kiến trúc CSDL Cốt Lõi (Core Database Schema - PostgreSQL)

Hệ thống thiết kế cơ sở dữ liệu quan hệ chặt chẽ trên **PostgreSQL**:

1. **`users`**: Quản lý tài khoản (Admin, GVCN, GV Bộ môn, Phụ huynh), hash mật khẩu, email, số điện thoại, vai trò (`role`).
2. **`classes`**: Danh sách lớp học (Khối 1 -> 9), niên khóa, giáo viên chủ nhiệm (`homeroom_teacher_id`).
3. **`students`**: Hồ sơ học sinh (Mã định danh, họ tên, ngày sinh, giới tính, `class_id`).
4. **`student_parent_relations`**: Liên kết quan hệ giữa học sinh và tài khoản phụ huynh.
5. **`scores`**: Lưu trữ điểm thành phần (miệng, 15p, 1 tiết, giữa kỳ, cuối kỳ), môn học, học kỳ, học sinh.
6. **`attendances`**: Dữ liệu điểm danh theo ngày/tiết, trạng thái (`PRESENT`, `ABSENT_EXCUSED`, `ABSENT_UNEXCUSED`).
7. **`fees_and_insurance`**: Quản lý đợt thu, `student_id`, cờ `is_paid_tuition` (boolean), cờ `is_paid_insurance` (boolean), số tiền, ngày thanh toán.
8. **`quizzes`**: Bộ đề kiểm tra bài cũ (tên bài học, ngày tạo, giáo viên tạo, tài liệu nguồn).
9. **`questions`**: Danh sách câu hỏi thuộc bộ quiz (nội dung, 4 đáp án, đáp án đúng, giải thích).
10. **`notifications`**: Lịch sử thông báo gửi tới phụ huynh (loại thông báo, nội dung, thời gian đọc).

---

## 4. Phân Quyền Chi Tiết (RBAC Guards in NestJS)

Hệ thống thiết lập phân quyền chi tiết giữa các nhóm người dùng:
- **`ADMIN`:** Toàn quyền cấu hình trường, quản lý toàn bộ lớp, phân công GVCN và GVBM, xem thống kê toàn trường.
- **`TEACHER_HOMEROOM` (GVCN):** Điểm danh lớp chủ nhiệm, theo dõi & cập nhật cờ `fees_and_insurance`, viết nhận xét hạnh kiểm, gửi thông báo toàn lớp.
- **`TEACHER_SUBJECT` (GVBM):** Nhập điểm môn phụ trách, tạo Quiz AI từ docs/pdf, sử dụng công cụ Random học sinh có mặt hôm nay.
- **`PARENT`:** Chỉ xem thông tin học tập, chuyên cần, trạng thái học phí & BHYT của đúng các học sinh liên kết.
