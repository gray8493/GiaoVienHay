# Tài Liệu Tổng Quan Hệ Thống (System Overview)
# GiaoVienHay – Hệ Thống Quản Lý & Tương Tác Học Sinh Cấp 1 & Cấp 2

---

## 1. Giới thiệu & Bối cảnh dự án (Project Background)

### 1.1. Bối cảnh bài toán Cấp 1 & Cấp 2
Trong các trường Tiểu học (Cấp 1) và THCS (Cấp 2), công tác giảng dạy và nề nếp lớp học có những đặc trưng rất rõ rệt:
- **Giáo viên chủ nhiệm (GVCN)** ở Cấp 1 trực tiếp giảng dạy đa số các môn học cốt lõi (Toán, Tiếng Việt, Tự nhiên - Xã hội...), còn ở Cấp 2 GVCN cũng là một giáo viên bộ môn chủ chốt. Do đó, **GVCN hoàn toàn thực hiện toàn bộ nghiệp vụ sư phạm: dò bài cũ, kiểm tra, nhập điểm, tạo bài tập như GVBM**, đồng thời kiêm nhiệm thêm công tác quản lý sĩ số, nề nếp, hạnh kiểm và đôn đốc các khoản thu (Học phí, BHYT).
- Học sinh Cấp 1 và Cấp 2 có tâm lý hiếu động, thích khám phá và dễ tiếp thu qua các hoạt động tương tác thị giác. Các hình thức kiểm tra bài cũ truyền thống (gọi tên khô khan, trả lời miệng thụ động) dễ gây căng thẳng, áp lực.
- Nhu cầu cấp thiết về **Game hóa lớp học (Classroom Gamification)**: Giáo viên mong muốn chỉ với 1 cú click chuột từ tài liệu giáo án có sẵn, AI có thể tự động biến hóa thành các **Mini-game tương tác sinh động** (Rung chuông vàng, Vượt chướng ngại vật, Mở hộp quà bí mật, Ghép nối từ) để chiếu lên bảng tương tác/máy chiếu cho cả lớp cùng tham gia hào hứng đầu giờ.

### 1.2. Mục tiêu hệ thống GiaoVienHay
**GiaoVienHay** là nền tảng quản lý và trợ giảng thông minh chuyên biệt cho Cấp 1 & Cấp 2:
1. **Admin (Ban Giám Hiệu):** Quản trị cơ cấu trường, năm học, phân công giảng dạy và giám sát chất lượng học vụ, tài chính toàn trường.
2. **Giáo viên (Bao gồm GVCN & GV Bộ môn):**
   - Đầy đủ quyền sư phạm: dò bài cũ, nhập điểm số, điểm danh chuyên cần.
   - **Tận dụng AI (Google Gemini API):** Tự động bóc tách giáo trình `.docx`/`.pdf` để sinh ngân hàng câu hỏi và **tự động chuyển đổi thành các Trò chơi tương tác lớp học (Gamification)** để Giáo viên trình chiếu lên bảng/máy chiếu.
   - Sử dụng công cụ **Random Học sinh có mặt hôm nay** kèm Vòng quay may mắn / Rút thẻ bài.
   - GVCN có thêm quyền quản trị lớp chủ nhiệm: theo dõi danh sách đóng Học phí & BHYT (cờ boolean), nhận xét hạnh kiểm.
3. **Phụ huynh (Parent):** Nhận thông báo đẩy tức thì (vắng học, điểm số, nhắc nộp BHYT), theo dõi sát sao sự tiến bộ của con qua ứng dụng di động.

> **NGUYÊN TẮC THIẾT KẾ & GIỚI HẠN PHẠM VI (SCOPE BOUNDARY):**  
> Hệ thống **hoàn toàn KHÔNG CUNG CẤP tính năng cho học sinh làm bài kiểm tra trực tuyến** (Không có tài khoản học sinh, không có cổng thi/làm trắc nghiệm online). Toàn bộ hoạt động kiểm tra bài cũ, hỏi đáp và mini-game đều do **Giáo viên trực tiếp tổ chức và trình chiếu trên bảng tại lớp học**. Sau đó, **Giáo viên là người trực tiếp chấm và nhập điểm số** của học sinh vào hệ thống.

---

## 2. Các Tính Năng Đột Phá & Đặc Thù (Signature Features)

### 2.1. AI Trợ Giảng: Sinh Câu Hỏi & Tạo Game Tương Tác Lớp Học Tự Động (Trình chiếu tại lớp)
- **Từ Tài liệu đến Trò chơi chỉ trong 10 giây:**
  - Giáo viên tải file giáo án bài học (`.docx`, `.pdf`).
  - Backend NestJS tích hợp **Google Gemini API** bóc tách kiến thức trọng tâm và tự động sinh cấu trúc câu hỏi.
  - Hệ thống tự động chuyển hóa ngân hàng câu hỏi này thành **3 chế độ Mini-game tương tác lớp học** để Giáo viên trình chiếu lên máy chiếu / bảng tương tác:
    1. **Rung Chuông Vàng / Đấu Trí (Quiz Show):** Đếm ngược 30s, hiển thị câu hỏi trắc nghiệm với âm thanh hiệu ứng kịch tính, học sinh giơ bảng chọn đáp án tại chỗ, giáo viên bấm công bố và trao điểm thưởng.
    2. **Đua Xe / Vượt Chướng Ngại Vật (Classroom Racing):** Chia lớp thành các tổ/đội thi đua, đội trả lời đúng sẽ được tăng tốc về đích.
    3. **Hộp Quà Bí Mật / Vòng Quay May Mắn (Mystery Boxes):** Học sinh trả lời đúng câu hỏi bài cũ sẽ được tự tay chọn hộp quà chứa điểm cộng hoặc tràng pháo tay.
- **Không có thi trực tuyến:** Học sinh không sử dụng app để làm bài kiểm tra cá nhân. Toàn bộ là trải nghiệm tương tác tập thể tại lớp học dưới sự điều phối của Giáo viên.

### 2.2. Dò Bài Cũ & Vòng Quay / Random Học Sinh Lên Bảng
- **Cả GVCN và GVBM đều sử dụng linh hoạt:**
- **Thuật toán thông minh:** Tự động đối chiếu với dữ liệu điểm danh của ngày hôm nay, **chỉ lọc các học sinh ĐANG CÓ MẶT (`status = 'PRESENT'`)**, tự động loại trừ học sinh vắng để không bị gián đoạn giờ học.
- Giao diện quay số / lật thẻ bài ấn tượng, tạo sự công bằng, minh bạch và hào hứng trước khi vào bài học mới.
- Hỗ trợ giáo viên chấm và nhập điểm miệng trực tiếp lưu ngay vào CSDL.

### 2.3. Quản Lý Học Phí & Bảo Hiểm Y Tế (BHYT)
- Quản lý trạng thái bằng 2 cờ Boolean trực tiếp trong CSDL:
  - `is_paid_tuition`: Đã đóng học phí.
  - `is_paid_insurance`: Đã nộp tiền BHYT học sinh.
- GVCN theo dõi bằng checklist 1-chạm, lọc nhanh danh sách chưa nộp để gửi tin nhắn thông báo tự động (Push Notification FCM) đến phụ huynh.

---

## 3. Kiến trúc CSDL Cốt Lõi (Firebase Cloud Firestore)
Hệ thống sử dụng **Google Cloud Firestore (NoSQL Document Store)** làm cơ sở dữ liệu duy nhất toàn diện:

1. `/users/{userId}`: Tài khoản, email, SĐT, vai trò (`ADMIN`, `TEACHER_HOMEROOM`, `TEACHER_SUBJECT`, `PARENT`), FCM Device Tokens.
2. `/classes/{classId}`: Khối lớp (1 đến 9), tên lớp, năm học, `homeroom_teacher_id`.
3. `/students/{studentId}`: Hồ sơ học sinh, mã số định danh, `classId`, danh sách phụ huynh liên kết.
4. `/attendances/{attendanceId}`: Điểm danh chuyên cần theo ngày (`classId`, `studentId`, `date`, `status = PRESENT/ABSENT_EXCUSED/ABSENT_UNEXCUSED`).
5. `/scores/{scoreId}`: Sổ điểm thành phần (`studentId`, `subjectCode`, `semester`, `scoreType`, `scoreValue`, `teacherId`, `isPublished`).
6. `/fees_and_insurance/{recordId}`: Sổ theo dõi nộp Học phí & BHYT với 2 cờ boolean `is_paid_tuition`, `is_paid_insurance`, ghi chú thu nộp.
7. `/quizzes/{quizId}`: Bộ câu hỏi / mini-game tạo từ giáo án phục vụ Giáo viên trình chiếu tương tác tại lớp.
   - Subcollection `/questions/{questionId}`: Câu hỏi, 4 lựa chọn, đáp án đúng, giải thích, thời gian đếm ngược.
8. `/quiz_results/{resultId}`: Điểm kiểm tra bài cũ / kết quả mini-game do Giáo viên trực tiếp nhập tại lớp, thứ hạng trong lớp (`rank_position`) phục vụ hiển thị Bảng xếp hạng cho lớp xem.
9. `/notifications/{notificationId}`: Nhật ký thông báo đẩy phát tới phụ huynh qua Firebase Cloud Messaging.

