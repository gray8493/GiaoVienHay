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
1. **Admin (Quản trị viên Nền tảng / Platform Admin):** Đội ngũ phát triển & quản trị hệ thống, phụ trách vận hành kỹ thuật với 3 quyền hạn chính:
   - **CRUD:** Quản lý tài nguyên dữ liệu, tài khoản người dùng và thông số hệ thống.
   - **Ban (Khóa tài khoản):** Khóa hoặc mở khóa tài khoản người dùng khi vi phạm chính sách hoặc có dấu hiệu bất thường.
   - **Limit (Hạn ngạch & Giới hạn):** Cấu hình hạn mức tài nguyên (số lớp học tối đa mỗi giáo viên, số học sinh tối đa/lớp, hạn ngạch lượt gọi AI Gemini hàng ngày/tháng, dung lượng lưu trữ).
2. **Giáo viên (Bao gồm GVCN & GV Bộ môn):**
   - **Chủ động quản lý lớp học:** Tự tạo lớp học mới, thêm danh sách học sinh và sinh **Link mời vào lớp (Class Invite Link)** gửi phụ huynh.
   - Đầy đủ quyền sư phạm: dò bài cũ, nhập điểm số, điểm danh chuyên cần.
   - **Tận dụng AI (Google Gemini API):** Tự động bóc tách giáo trình `.docx`/`.pdf` để sinh ngân hàng câu hỏi và **tự động chuyển đổi thành các Trò chơi tương tác lớp học (Gamification)** để Giáo viên trình chiếu lên bảng/máy chiếu.
   - Sử dụng công cụ **Random Học sinh có mặt hôm nay** kèm Vòng quay may mắn / Rút thẻ bài.
   - GVCN có thêm quyền quản trị lớp chủ nhiệm: theo dõi danh sách đóng Học phí & BHYT (cờ boolean), nhận xét hạnh kiểm.
3. **Phụ huynh (Parent):**
   - Tham gia vào lớp học dễ dàng bằng cách **bấm vào Link mời của Giáo viên**, đăng nhập và xác nhận con em mình.
   - Nhận thông báo đẩy tức thì (vắng học, điểm số, nhắc nộp BHYT), theo dõi sát sao sự tiến bộ của con qua ứng dụng di động.

> **NGUYÊN TẮC THIẾT KẾ & GIỚI HẠN PHẠM VI (SCOPE BOUNDARY):**  
> 1. **Phân định Nền tảng Ứng dụng (Frontend Boundaries):**
>    - **Web Next.js 14+:** Được phát triển **CHỈ DÀNH RIÊNG CHO PLATFORM ADMIN** ("chúng tôi" - Quản trị viên nền tảng). Web Admin Portal gói gọn trong 3 nhóm tính năng: **CRUD** (quản lý người dùng/lớp học), **Ban/Unban** (khóa/mở tài khoản), **Limit/Quota** (hạn ngạch tài nguyên & gọi AI). Tuyệt đối không chứa route nghiệp vụ sư phạm của giáo viên hay cổng phụ huynh.
>    - **Mobile & Tablet App (React Native):** Ứng dụng đa vai trò trên di động & máy tính bảng dành cho **Giáo viên (GVCN & GVBM)** và **Phụ huynh**. Giáo viên sử dụng Phone/Tablet để giảng dạy tại lớp, kết nối Máy chiếu/Smartboard (3 Mini-game, Vòng quay random, Sổ điểm, Điểm danh, Lời nhắc lịch kiểm tra...). Phụ huynh dùng Phone nhận thông báo đẩy FCM, tra cứu học tập, BHYT.
> 2. **Không có thi trực tuyến:** Hệ thống **hoàn toàn KHÔNG CUNG CẤP tính năng cho học sinh làm bài kiểm tra trực tuyến** (Không có tài khoản học sinh, không có cổng thi/làm trắc nghiệm online). Toàn bộ hoạt động kiểm tra bài cũ, hỏi đáp và mini-game đều do **Giáo viên trực tiếp tổ chức và trình chiếu trên bảng tại lớp học**. Sau đó, **Giáo viên là người trực tiếp chấm và nhập điểm số** của học sinh vào hệ thống.

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
- **Cả GVCN và GVBM đều sử dụng linh hoạt trong tiết học.**
- **Nút Bỏ qua thông minh (Skip):** Nếu quay trúng bạn nào nghỉ học hoặc vắng mặt/không thể lên bảng, Giáo viên chỉ cần bấm nút **"Bỏ qua (Skip)"**, hệ thống lập tức quay vòng mới để chọn học sinh khác.
- Giao diện quay số / lật thẻ bài ấn tượng, tạo sự công bằng, minh bạch và hào hứng trước khi vào bài học mới.
- Hỗ trợ giáo viên chấm và nhập điểm miệng trực tiếp lưu ngay vào CSDL môn học đang dạy.

### 2.3. Quản Lý Học Phí & Bảo Hiểm Y Tế (BHYT)
- Quản lý trạng thái bằng 2 cờ Boolean trực tiếp trong CSDL:
  - `is_paid_tuition`: Đã đóng học phí.
  - `is_paid_insurance`: Đã nộp tiền BHYT học sinh.
- GVCN theo dõi bằng checklist 1-chạm, lọc nhanh danh sách chưa nộp để gửi tin nhắn thông báo tự động (Push Notification FCM) đến phụ huynh.

### 2.4. Giáo Viên Chủ Nhiệm Tạo Lớp Tổng & Giáo Viên Bộ Môn Truy Cập Theo Môn (Class & Subject Access)
- **GVCN tạo 1 lớp tổng:** Duy nhất Giáo viên chủ nhiệm (GVCN) tạo lớp học tổng (Tên lớp, Khối 1-9, Năm học), nhập danh sách học sinh và phân công Giáo viên bộ môn (GVBM) theo từng môn học.
- **GVBM truy cập lớp tổng:** Các GVBM truy cập vào lớp học tổng này để quản lý và thay đổi/nhập điểm của chính bộ môn mình phụ trách (không cần tạo lớp riêng).
- **Cơ chế vào lớp 1-chạm qua Link mời:**
  - Hệ thống tự động sinh **Mã mời (`invite_code`)** và **Đường dẫn mời tham gia lớp học (`invite_link`)** kèm mã QR.
  - GVCN gửi link vào nhóm Phụ huynh (Zalo, tin nhắn SMS).
  - Phụ huynh mở link, đăng nhập nhanh (bằng SĐT nhận OTP), chọn đúng con mình trong danh sách học sinh của lớp để hoàn tất kết nối.

### 2.5. Nhận Xét Học Sinh Ngắn Gọn Gửi Phụ Huynh
- **Nhận xét bằng đoạn text ngắn:** Cả GVBM và GVCN đều có thể gửi lời nhận xét ngắn gọn (dưới dạng văn bản ngắn thuần túy, không dùng thẻ nhãn tags rườm rà) về tinh thần học tập, nề nếp hoặc bài làm của học sinh.
- **Kết nối tức thời tới Phụ huynh:** Nhận xét dạng text được lưu vào collection `/remarks` và bắn thông báo đẩy (FCM) tức thời đến điện thoại phụ huynh.

### 2.6. Thông Báo & Lời Nhắc Lịch Kiểm Tra Sắp Tới (GV Cho Phụ Huynh Đôn Đốc Học Sinh)
- **Tạo lời nhắc nhanh chóng:** Cả GVBM và GVCN đều có thể tạo thông báo nhắc lịch kiểm tra sắp tới (15 phút, 1 tiết, Giữa kỳ...) kèm theo môn học, ngày kiểm tra và nội dung dặn dò ôn tập bài giảng.
- **Đôn đốc con em tại nhà:** Hệ thống bắn thông báo đẩy tức thì (FCM) đến điện thoại của toàn bộ phụ huynh trong lớp, giúp bố mẹ chủ động nắm bắt lịch thi và đôn đốc con học bài, ôn tập kỹ lưỡng.

---

## 3. Kiến trúc CSDL Cốt Lõi (Firebase Cloud Firestore)
Hệ thống sử dụng **Google Cloud Firestore (NoSQL Document Store)** làm cơ sở dữ liệu duy nhất toàn diện:

1. `/users/{userId}`: Tài khoản, email, SĐT, vai trò (`ADMIN`, `TEACHER_HOMEROOM`, `TEACHER_SUBJECT`, `PARENT`), FCM Device Tokens.
2. `/classes/{classId}`: Khối lớp (1 đến 9), tên lớp, năm học, `homeroom_teacher_id`, `subject_teachers` (danh sách phân công GVBM theo môn), `invite_code`, `invite_link`.
3. `/students/{studentId}`: Hồ sơ học sinh, họ tên, ngày sinh, `classId`, danh sách phụ huynh liên kết (`parent_uids`).
4. `/attendances/{attendanceId}`: Điểm danh chuyên cần theo ngày (`classId`, `studentId`, `date`, `status = PRESENT/ABSENT_EXCUSED/ABSENT_UNEXCUSED`).
5. `/scores/{scoreId}`: Sổ điểm các môn học theo từng học sinh (`studentId`, `classId`, `subjectCode`, `semester`, `scoreType`, `scoreValue`, `teacherId`, `teacher_comment`, `isPublished`). Lưu trữ các cột điểm do giáo viên nhập, không tự động tính GPA môn.
6. `/remarks/{remarkId}`: Sổ nhận xét học sinh (đoạn text ngắn gọn gửi phụ huynh, không dùng nhãn tags).
7. `/fees_and_insurance/{recordId}`: Sổ theo dõi nộp Học phí & BHYT với 2 cờ boolean `is_paid_tuition`, `is_paid_insurance`, ghi nhận ngày nộp `tuition_paid_date`, `insurance_paid_date` (kèm mốc thời gian `tuition_paid_at`, `insurance_paid_at`) và ghi chú thu nộp.
8. `/quizzes/{quizId}`: Bộ câu hỏi / mini-game tạo từ giáo án phục vụ Giáo viên trình chiếu tương tác tại lớp.
   - Subcollection `/questions/{questionId}`: Câu hỏi, 4 lựa chọn, đáp án đúng, giải thích, thời gian đếm ngược.
9. `/quiz_results/{resultId}`: Điểm kiểm tra bài cũ / kết quả tham gia mini-game do Giáo viên trực tiếp nhập tại lớp (Bảng xếp hạng vinh danh tại lớp được lấy từ Sổ điểm môn học `/scores`).
10. `/exam_reminders/{reminderId}`: Thông báo lời nhắc lịch kiểm tra sắp tới (môn học, loại kiểm tra, ngày thi, lời dặn ôn tập) do GVBM/GVCN tạo gửi tới phụ huynh.
11. `/notifications/{notificationId}`: Nhật ký thông báo đẩy phát tới phụ huynh qua Firebase Cloud Messaging.

