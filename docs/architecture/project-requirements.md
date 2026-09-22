# Tài Liệu Yêu Cầu Dự Án (Project Requirements Specification)
# Hệ Thống GiaoVienHay – Quản Lý Học Sinh Cấp 1 & Cấp 2

---

## 1. Tổng quan & Định vị sản phẩm

**GiaoVienHay** là giải pháp phần mềm chuyên biệt phục vụ công tác quản trị và giảng dạy tại các trường Tiểu học (Cấp 1) và THCS (Cấp 2). Hệ thống tập trung tối ưu năng suất cho **Giáo viên chủ nhiệm (GVCN)** và **Giáo viên bộ môn (GVBM)** trong các nghiệp vụ hàng ngày: dò bài cũ, tạo mini-game tương tác lớp học bằng AI, điểm danh chuyên cần, đôn đốc BHYT/học phí và kết nối trực tiếp với phụ huynh.

---

## 2. Yêu Cầu Chức Năng Cốt Lõi (Functional Requirements - FR)

### FR-01: Quản lý Phân quyền Chi tiết (RBAC Guard in NestJS)
- **FR-01.1:** Phân quyền chuẩn xác giữa 4 nhóm vai trò:
  - `ADMIN`: Quản trị viên nền tảng (Platform Admin), chỉ đảm nhiệm CRUD dữ liệu/tài khoản, Ban (khóa/mở khóa tài khoản) và cấu hình Limit (hạn mức tạo lớp, số học sinh, hạn ngạch AI).
  - `TEACHER_HOMEROOM` (GVCN): **Tự tạo lớp, thêm học sinh, chia sẻ link mời vào lớp** + Toàn bộ quyền giảng dạy (dò bài, nhập điểm, tạo game AI, quay random) + Quản lý điểm danh nề nếp, BHYT & học phí, nhận xét hạnh kiểm lớp chủ nhiệm.
  - `TEACHER_SUBJECT` (GVBM): Nhập điểm bộ môn, tạo câu hỏi bằng AI, quay random học sinh, tạo game lớp học.
  - `PARENT`: Nhận link mời của giáo viên, đăng nhập và xác nhận con em mình; Tra cứu sổ điểm, chuyên cần, tình trạng BHYT/học phí.
- **FR-01.2 (GVCN tạo lớp tổng & phân công GVBM):**
  - Duy nhất Giáo viên chủ nhiệm (GVCN) tạo Lớp học tổng (Tên lớp, Khối 1-9, Năm học) và thêm danh sách học sinh.
  - GVCN phân công Giáo viên bộ môn (GVBM) theo từng môn học của lớp. GVBM truy cập vào lớp tổng này để quản lý và nhập/sửa điểm cho chính bộ môn mình phụ trách.
- **FR-01.3 (Link mời tham gia lớp & Onboarding Phụ huynh):**
  - Hệ thống tự động sinh `invite_code` và `invite_link` (kèm mã QR) cho mỗi lớp học.
  - Phụ huynh nhấp vào link mời do GVCN chia sẻ, đăng nhập ứng dụng qua SMS OTP/Email, chọn đúng tên con em mình trong danh sách lớp để hoàn tất liên kết.

### FR-02: Import Docs/PDF bằng AI (Gemini API) Sinh Câu Hỏi Kiểm Tra Bài Cũ
- **FR-02.1:** Cho phép giáo viên (cả GVCN và GVBM) tải lên tài liệu giáo trình bài học (`.docx`, `.pdf`).
- **FR-02.2:** Backend NestJS tích hợp **Google Gemini API** (`gemini-1.5-flash`) tự động trích xuất nội dung và sinh từ 3-5 câu hỏi trắc nghiệm/tự luận ngắn phục vụ kiểm tra bài cũ 5-10 phút đầu giờ.
- **FR-02.3:** Lưu trữ câu hỏi vào Firestore collections `/quizzes` và subcollection `/questions`, hỗ trợ chế độ xem trước (preview) và chỉnh sửa nội dung/đáp án.

### FR-03: Tạo & Vận Hành Mini-Game Tương Tác Lớp Học (Classroom Gamification)
- **FR-03.1:** Hỗ trợ tính năng 1-chạm: Chuyển đổi bộ câu hỏi AI thành trò chơi lớp học sinh động chiếu lên bảng tương tác / máy chiếu.
- **FR-03.2:** Cung cấp 3 chế độ game phổ biến cho học sinh Cấp 1 & Cấp 2:
  1. *Rung chuông vàng / Đấu trí:* Đếm ngược thời gian, học sinh giơ bảng chọn đáp án, loại trực tiếp hoặc tính điểm tích lũy.
  2. *Vượt chướng ngại vật / Đua xe:* Chia tổ thi đua, tổ trả lời đúng sẽ tiến về đích.
  3. *Hộp quà may mắn (Mystery Box):* Trả lời câu hỏi mở quà trúng sticker/điểm cộng.
- **FR-03.3:** Hiệu ứng đồ họa bắt mắt, âm thanh reo hò kịch tính, tạo không khí học tập sôi nổi (không đua hạng điểm game).
- **FR-03.4:** **Trình Chiếu Bảng Xếp Hạng (Leaderboard) Điểm Môn Học:**
  - Bảng xếp hạng (Leaderboard) tại lớp được thiết kế **chuyên biệt và duy nhất cho Điểm Môn Học** (Toán, Tiếng Việt, Tiếng Anh, Khoa học...).
  - Sau khi Giáo viên nhập điểm môn học, hệ thống sắp xếp thứ hạng điểm cao nhất và cho phép Giáo viên trình chiếu **Bảng Xếp Hạng Điểm Môn Học** lên máy chiếu / bảng lớp:
    + Vinh danh Top học sinh đạt điểm cao nhất của môn học (Top 1, Top 2, Top 3) kèm hiệu ứng chúc mừng hoa điểm mười.
    + Thống kê phổ điểm và danh sách thứ hạng môn học trong lớp để học sinh cùng cố gắng học tập.
  - Giáo viên có quyền điều chỉnh điểm và phê duyệt công bố điểm vào sổ điểm chính thức (`/scores`) để phụ huynh xem được.

### FR-04: Dò Bài Cũ & Vòng Quay / Random Học Sinh Lên Bảng
- **FR-04.1:** Giao diện Vòng quay may mắn (Lucky Wheel) sinh động trên Web Next.js có hiệu ứng âm thanh, tối ưu chiếu lên máy chiếu/bảng thông minh.
- **FR-04.2 (Nút Bỏ qua thông minh):** Nếu quay trúng bạn nào nghỉ học hoặc vắng mặt/không thể lên bảng, Giáo viên chỉ cần bấm nút **"Bỏ qua (Skip)"**, hệ thống lập tức quay vòng mới để chọn học sinh khác.
- **FR-04.3:** Cho phép giáo viên chấm điểm trực tiếp tại chỗ và lưu vào collection `/scores` của môn học đang dạy.

### FR-05: Quản lý Học Phí & Bảo Hiểm Y Tế (BHYT) - Không có cổng thanh toán online
- **FR-05.1:** Quản lý theo dõi trực tiếp trong collection `/fees_and_insurance` với 2 cờ boolean:
  - `is_paid_tuition`: Trạng thái đã nộp học phí.
  - `is_paid_insurance`: Trạng thái đã nộp tiền BHYT học sinh.
- **FR-05.2:** Giao diện tích chọn 1-chạm (checkbox) cho GVCN/Nhà trường khi phụ huynh nộp trực tiếp tại trường/lớp. Hệ thống hoàn toàn không tích hợp cổng thanh toán trực tuyến.
- **FR-05.3:** Hỗ trợ tính năng lọc nhanh danh sách chưa nộp BHYT và phát thông báo nhắc nhở tức thời (Push Notification FCM) đến phụ huynh.

### FR-06: Điểm Danh Chuyên Cần & Báo Cáo Sĩ Số
- **FR-06.1:** Điểm danh nhanh trên Mobile App React Native theo các trạng thái: Có mặt, Vắng có phép, Vắng không phép.
- **FR-06.2:** Tự động gửi cảnh báo vắng học ngay lập tức đến điện thoại của phụ huynh qua FCM.

### FR-07: Sổ Điểm Điện Tử Đa Môn Học & Đa Cột Điểm Thành Phần
- **FR-07.1 (Quản lý đa môn học Cấp 1 & 2):** Quản lý sổ điểm theo từng môn học trong chương trình: Toán, Tiếng Việt/Ngữ văn, Tiếng Anh, Tự nhiên - Xã hội / KHTN, Lịch sử - Địa lý, Tin học, Đạo đức/GDCD, Nghệ thuật, Thể dục.
- **FR-07.2 (Đa dạng các đầu điểm thành phần):** Cung cấp giao diện nhập điểm linh hoạt cho nhiều loại điểm khác nhau theo thang điểm 10 (bước nhảy 0.1):
  - Điểm kiểm tra miệng / Dò bài cũ đầu giờ.
  - Điểm kiểm tra 15 phút thường xuyên.
  - Điểm kiểm tra 1 tiết / Định kỳ.
  - Điểm thi Giữa học kỳ.
  - Điểm thi Cuối học kỳ.
- **FR-07.3 (Lưu trữ điểm thành phần, không tính GPA):** Hệ thống lưu trữ trung thực các cột điểm thành phần do Giáo viên trực tiếp nhập, không tự động tính Điểm trung bình môn (GPA môn).
- **FR-07.4 (Công bố điểm có kiểm soát):** Giáo viên chủ động kiểm tra và bấm "Công bố điểm" (theo từng môn học hoặc theo đợt kiểm tra) để gửi thông báo tức thời qua FCM cho phụ huynh tra cứu.

### FR-08: Đánh Giá & Nhận Xét Học Sinh Ngắn Gọn Gửi Phụ Huynh
- **FR-08.1 (Nhận xét văn bản ngắn):**
  - Cho phép Giáo viên (cả GVCN và GVBM) nhập lời nhận xét ngắn gọn (đoạn text ngắn) cho từng học sinh về tinh thần học tập, nề nếp hoặc kết quả bài làm.
  - Hệ thống thuần túy sử dụng văn bản ngắn, không dùng hệ thống thẻ nhãn tags rườm rà.
- **FR-08.2 (Đồng bộ tức thì tới Sổ liên lạc Phụ huynh):**
  - Nhận xét dạng text được lưu vào collection `/remarks` và tự động gửi thông báo đẩy (FCM) đến ứng dụng của Phụ huynh.
  - Phụ huynh có thể xem lời nhận xét chi tiết và xác nhận đã đọc trên ứng dụng di động.

