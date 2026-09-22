# Tài Liệu Yêu Cầu Dự Án (Project Requirements Specification)
# Dự Án GiaoVienHay (EduConnect)

---

## 1. Tổng quan & Mục tiêu dự án (Project Overview & Objectives)

**GiaoVienHay (EduConnect)** là nền tảng số hóa quản lý giáo dục toàn diện, kết nối 3 nhóm tác nhân cốt lõi trong trường học: **Ban giám hiệu / Quản trị viên (Admin) – Giáo viên (Teacher) – Phụ huynh (Parent)**. Hệ thống loại bỏ các hình thức sổ sách thủ công rời rạc, đem lại luồng dữ liệu minh bạch, tức thời và an toàn.

---

## 2. Yêu cầu Chức năng (Functional Requirements - FR)

### FR-01: Quản lý Xác thực & Phân quyền đa cấp (Authentication & RBAC)
- **FR-01.1:** Hỗ trợ đăng nhập đa kênh (Web Quản trị Next.js và Mobile App React Native) bằng Email/SĐT và Mật khẩu.
- **FR-01.2:** Cấp phát Access Token (JWT) có thời hạn 30 phút và Refresh Token có thời hạn 7 ngày lưu trữ bảo mật.
- **FR-01.3:** Thực thi phân quyền nghiêm ngặt 3 vai trò: `ADMIN`, `TEACHER`, `PARENT` thông qua NestJS Guards.
- **FR-01.4:** Hỗ trợ tính năng đổi mật khẩu, quên mật khẩu (xác thực OTP qua Email/SMS) và đăng xuất khỏi thiết bị.

### FR-02: Quản trị Cơ cấu Trường học & Học vụ (School Administration)
- **FR-02.1:** Khởi tạo và quản lý niên khóa (Academic Years), học kỳ (Semesters), khối lớp (Grades 10, 11, 12) và danh sách lớp học.
- **FR-02.2:** Quản lý danh mục môn học và cấu hình hệ số tính điểm từng môn.
- **FR-02.3:** Phân công chuyên môn: gán giáo viên chủ nhiệm cho từng lớp và phân công giáo viên bộ môn theo thời khóa biểu.

### FR-03: Quản lý Hồ sơ Học sinh & Liên kết Gia đình (Student & Parent Linkage)
- **FR-03.1:** Quản lý thông tin hồ sơ lý lịch học sinh (Mã học sinh, Họ tên, Ngày sinh, Giới tính, Địa chỉ).
- **FR-03.2:** Thiết lập mối quan hệ liên kết 1-n hoặc n-n giữa Học sinh và tài khoản Phụ huynh, đảm bảo một phụ huynh có thể theo dõi nhiều con cùng lúc.
- **FR-03.3:** Hỗ trợ nhập danh sách học sinh và phụ huynh hàng loạt từ file Excel.

### FR-04: Điểm danh & Theo dõi Chuyên cần (Attendance Management)
- **FR-04.1:** Giáo viên điểm danh học sinh theo ngày và buổi học (Có mặt, Vắng có phép, Vắng không phép) trên Mobile App hoặc Web.
- **FR-04.2:** Khi lưu điểm danh, hệ thống tự động phát hiện các học sinh vắng mặt và gửi thông báo tức thời đến điện thoại của phụ huynh.
- **FR-04.3:** Thống kê tỷ lệ chuyên cần theo tuần, tháng, học kỳ phục vụ công tác xếp loại hạnh kiểm.

### FR-05: Sổ điểm & Đánh giá Học tập (Gradebook & Assessment)
- **FR-05.1:** Giáo viên bộ môn nhập các cột điểm thành phần: Miệng, 15 phút, 1 tiết, Giữa kỳ, Cuối kỳ.
- **FR-05.2:** Tự động tính toán điểm trung bình môn học và điểm trung bình chung học kỳ dựa trên hệ số quy định.
- **FR-05.3:** Cơ chế "Phê duyệt điểm": điểm sau khi được giáo viên xác nhận phê duyệt mới được công bố công khai cho phụ huynh tra cứu.
- **FR-05.4:** Giáo viên chủ nhiệm nhập nhận xét, đánh giá rèn luyện và xếp loại học lực định kỳ.

### FR-06: Thông báo Thời gian thực (Real-time Push Notifications)
- **FR-06.1:** Bắn thông báo đẩy (Push Notification) qua Firebase Cloud Messaging (FCM) tới ứng dụng React Native của Phụ huynh khi:
  - Có cập nhật điểm số mới được phê duyệt.
  - Học sinh vắng mặt tại buổi điểm danh.
  - Có thông báo khẩn cấp hoặc kế hoạch tuần từ nhà trường.
- **FR-06.2:** Xử lý hàng đợi phát thông báo bất đồng bộ qua RabbitMQ & Redis BullMQ để không gây trễ giao dịch chính.

### FR-07: Quản lý Học phí & Thanh toán Trực tuyến (Tuition & Billing)
- **FR-07.1:** Admin tạo danh mục khoản thu và phát hành hóa đơn học phí theo tháng/kỳ cho từng lớp/học sinh.
- **FR-07.2:** Phụ huynh tra cứu chi tiết các khoản phí trên ứng dụng di động.
- **FR-07.3:** Tích hợp cổng thanh toán trực tuyến (VNPAY / MoMo), tự động cập nhật trạng thái hóa đơn sau khi nhận Webhook xác thực giao dịch.

---

## 3. Yêu cầu Phi Chức năng (Non-Functional Requirements - NFR)

### NFR-01: Hiệu năng & Khả năng chịu tải (Performance)
- **NFR-01.1:** Thời gian phản hồi API trung bình dưới 200ms đối với 95% các yêu cầu thông thường (P95 < 200ms).
- **NFR-01.2:** Tận dụng Redis Caching cho các dữ liệu tra cứu tần suất cao (thời khóa biểu, danh sách môn học, phiên đăng nhập).
- **NFR-01.3:** Tải trang Web Quản trị Next.js ban đầu (First Contentful Paint) dưới 1.5 giây.

### NFR-02: Tính sẵn sàng & Mở rộng (Availability & Scalability)
- **NFR-02.1:** Độ sẵn sàng của hệ thống đạt tối thiểu **99.9%** (Uptime).
- **NFR-02.2:** Hỗ trợ mở rộng theo chiều ngang (Horizontal Scaling) cho các container NestJS Backend và Next.js Frontend thông qua Kubernetes (K8s) HPA.

### NFR-03: Bảo mật & Riêng tư Dữ liệu (Security & Privacy)
- **NFR-03.1:** Toàn bộ luồng truyền tải mạng sử dụng chuẩn **HTTPS (TLS 1.3)**.
- **NFR-03.2:** Mật khẩu người dùng được băm bằng thuật toán an toàn **Argon2** hoặc **Bcrypt** (Salt rounds >= 10).
- **NFR-03.3:** Cơ chế bảo vệ chống các cuộc tấn công Brute-force và DDoS thông qua Rate Limiting (Throttler) tại API Gateway.
- **NFR-03.4:** Phụ huynh chỉ có quyền truy xuất thông tin của học sinh mà tài khoản đó được liên kết hợp lệ.

### NFR-04: Tính Tương thích & Trải nghiệm (Compatibility & Usability)
- **NFR-04.1:** Web Quản trị hiển thị tối ưu trên các trình duyệt hiện đại (Chrome, Edge, Firefox, Safari) trên màn hình máy tính và máy tính bảng.
- **NFR-04.2:** Ứng dụng Mobile React Native tương thích mượt mà với Android 8.0+ và iOS 13.0 trở lên.
