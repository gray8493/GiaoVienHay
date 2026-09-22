# Tài Liệu Tổng Quan Hệ Thống (System Overview)
# GiaoVienHay (EduConnect) – Hệ Thống Quản Lý & Tương Tác Học Sinh Cấp 1 & Cấp 2

---

## 1. Giới thiệu & Bối cảnh dự án (Project Background)

### 1.1. Bối cảnh bài toán Cấp 1 & Cấp 2
Trong các trường Tiểu học (Cấp 1) và THCS (Cấp 2), công tác giảng dạy và nề nếp lớp học có những đặc trưng rất rõ rệt:
- **Giáo viên chủ nhiệm (GVCN)** ở Cấp 1 trực tiếp giảng dạy đa số các môn học cốt lõi (Toán, Tiếng Việt, Tự nhiên - Xã hội...), còn ở Cấp 2 GVCN cũng là một giáo viên bộ môn chủ chốt. Do đó, **GVCN hoàn toàn thực hiện toàn bộ nghiệp vụ sư phạm: dò bài cũ, kiểm tra, nhập điểm, tạo bài tập như GVBM**, đồng thời kiêm nhiệm thêm công tác quản lý sĩ số, nề nếp, hạnh kiểm và đôn đốc các khoản thu (Học phí, BHYT).
- Học sinh Cấp 1 và Cấp 2 có tâm lý hiếu động, thích khám phá và dễ tiếp thu qua các hoạt động tương tác thị giác. Các hình thức kiểm tra bài cũ truyền thống (gọi tên khô khan, trả lời miệng thụ động) dễ gây căng thẳng, áp lực.
- Nhu cầu cấp thiết về **Game hóa lớp học (Classroom Gamification)**: Giáo viên mong muốn chỉ với 1 cú click chuột từ tài liệu giáo án có sẵn, AI có thể tự động biến hóa thành các **Mini-game tương tác sinh động** (Rung chuông vàng, Vượt chướng ngại vật, Mở hộp quà bí mật, Ghép nối từ) để chiếu lên bảng tương tác/máy chiếu cho cả lớp cùng tham gia hào hứng đầu giờ.

### 1.2. Mục tiêu hệ thống GiaoVienHay (EduConnect)
**GiaoVienHay** là nền tảng quản lý và trợ giảng thông minh chuyên biệt cho Cấp 1 & Cấp 2:
1. **Admin (Ban Giám Hiệu):** Quản trị cơ cấu trường, năm học, phân công giảng dạy và giám sát chất lượng học vụ, tài chính toàn trường.
2. **Giáo viên (Bao gồm GVCN & GV Bộ môn):**
   - Đầy đủ quyền sư phạm: dò bài cũ, nhập điểm số, điểm danh chuyên cần.
   - **Tận dụng AI (Google Gemini API):** Tự động bóc tách giáo trình `.docx`/`.pdf` để sinh đề kiểm tra và **tự động chuyển đổi thành các Trò chơi tương tác lớp học (Gamification)**.
   - Sử dụng công cụ **Random Học sinh có mặt hôm nay** kèm Vòng quay may mắn / Rút thẻ bài.
   - GVCN có thêm quyền quản trị lớp chủ nhiệm: theo dõi danh sách đóng Học phí & BHYT (cờ boolean), nhận xét hạnh kiểm.
3. **Phụ huynh (Parent):** Nhận thông báo đẩy tức thì (vắng học, điểm số, nhắc nộp BHYT), theo dõi sát sao sự tiến bộ của con qua ứng dụng di động.

---

## 2. Các Tính Năng Đột Phá & Đặc Thù (Signature Features)

### 2.1. AI Trợ Giảng: Sinh Câu Hỏi Kiểm Tra & Tạo Game Lớp Học Tự Động
- **Từ Tài liệu đến Trò chơi chỉ trong 10 giây:**
  - Giáo viên tải file giáo án bài học (`.docx`, `.pdf`).
  - Backend NestJS tích hợp **Google Gemini API** bóc tách kiến thức trọng tâm và tự động sinh cấu trúc câu hỏi.
  - Hệ thống tự động chuyển hóa ngân hàng câu hỏi này thành **4 chế độ Mini-game tương tác lớp học**:
    1. **Rung Chuông Vàng / Đấu Trí (Quiz Show):** Đếm ngược 30s, hiển thị câu hỏi trắc nghiệm với âm thanh hiệu ứng kịch tính, hiển thị tỉ lệ đáp án và trao điểm thưởng.
    2. **Đua Xe / Vượt Chướng Ngại Vật (Classroom Racing):** Chia lớp thành các tổ/đội thi đua, đội trả lời đúng sẽ được tăng tốc về đích.
    3. **Hộp Quà Bí Mật / Vòng Quay May Mắn (Mystery Boxes):** Học sinh trả lời đúng câu hỏi bài cũ sẽ được tự tay chọn hộp quà chứa điểm cộng hoặc tràng pháo tay.
    4. **Chạm Nối Bảng Tương Tác (Smartboard Matching):** Dành riêng cho học sinh Cấp 1 lên bảng kéo thả nối định nghĩa với hình ảnh hoặc đáp án đúng.

### 2.2. Dò Bài Cũ & Vòng Quay / Random Học Sinh Lên Bảng
- **Cả GVCN và GVBM đều sử dụng linh hoạt:**
- **Thuật toán thông minh:** Tự động đối chiếu với dữ liệu điểm danh của ngày hôm nay, **chỉ lọc các học sinh ĐANG CÓ MẶT (`status = 'PRESENT'`)**, tự động loại trừ học sinh vắng để không bị gián đoạn giờ học.
- Giao diện quay số / lật thẻ bài ấn tượng, tạo sự công bằng, minh bạch và hào hứng trước khi vào bài học mới.
- Hỗ trợ nhập điểm miệng trực tiếp lưu ngay vào CSDL.

### 2.3. Quản Lý Học Phí & Bảo Hiểm Y Tế (BHYT)
- Quản lý trạng thái bằng 2 cờ Boolean trực tiếp trong CSDL:
  - `is_paid_tuition`: Đã đóng học phí.
  - `is_paid_insurance`: Đã nộp tiền BHYT học sinh.
- GVCN theo dõi bằng checklist 1-chạm, lọc nhanh danh sách chưa nộp để gửi tin nhắn thông báo tự động (Push Notification FCM) đến phụ huynh.

---

## 3. Kiến trúc CSDL Cốt Lõi (PostgreSQL)

1. `users`: Tài khoản, hash mật khẩu, email, SĐT, vai trò (`ADMIN`, `TEACHER_HOMEROOM`, `TEACHER_SUBJECT`, `PARENT`).
2. `classes`: Khối lớp (1 đến 9), tên lớp, năm học, `homeroom_teacher_id`.
3. `students`: Hồ sơ học sinh, mã số định danh, lớp học.
4. `student_parent_relations`: Quan hệ phụ huynh - học sinh.
5. `scores`: Điểm số thành phần (miệng, 15p, 1 tiết, giữa kỳ, cuối kỳ).
6. `attendances`: Điểm danh chuyên cần (Có mặt, Vắng có phép, Vắng không phép).
7. `fees_and_insurance`: Quản lý đợt thu, cờ `is_paid_tuition`, cờ `is_paid_insurance`.
8. `quizzes`: Bộ đề kiểm tra/trò chơi tạo từ tài liệu bài giảng.
9. `questions`: Câu hỏi, 4 phương án, đáp án đúng, gợi ý, thời gian làm bài, cấu hình mini-game (`game_type`, `game_config`).
10. `notifications`: Lịch sử thông báo đẩy gửi tới phụ huynh.
