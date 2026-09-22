# Tài Liệu Đặc Tả Chi Tiết Trường Hợp Sử Dụng (Use Case Descriptions)
# Dự Án GiaoVienHay (EduConnect)

---

## 1. Giới thiệu & Mục đích tài liệu

Tài liệu này cung cấp bản đặc tả chi tiết từng bước (**Use Case Descriptions / Specifications**) cho các Use Cases cốt lõi của nền tảng **GiaoVienHay (EduConnect)**.

Mỗi trường hợp sử dụng được đặc tả theo cấu trúc chuẩn quốc tế (RUP / IEEE 830 Template) bao gồm:
1. **Mã & Tên Use Case**.
2. **Tác nhân chính & Hỗ trợ**.
3. **Mô tả tóm tắt**.
4. **Tiền điều kiện (Preconditions)** & **Hậu điều kiện (Postconditions)**.
5. **Luồng sự kiện chính (Main Flow)**.
6. **Luồng rẽ nhánh & Ngoại lệ (Alternative & Exception Flows)**.

---

## 2. Chi tiết các Use Case Cốt Lõi

### UC-AUTH-01: Đăng nhập & Xác thực hệ thống (Login & Authentication)
- **Tác nhân chính:** Admin, Giáo viên, Phụ huynh.
- **Tác nhân hỗ trợ:** Backend NestJS (Auth Module), Redis.
- **Mô tả:** Người dùng nhập thông tin định danh (Email hoặc Số điện thoại) và Mật khẩu để truy cập vào hệ thống trên Web Quản trị (Next.js) hoặc Mobile App (React Native).
- **Tiền điều kiện:** Tài khoản người dùng đã được kích hoạt trong cơ sở dữ liệu PostgreSQL.
- **Hậu điều kiện:** Người dùng nhận được Access Token (JWT) và Refresh Token, được điều hướng về đúng trang chủ tương ứng với vai trò (Role).
- **Luồng sự kiện chính (Main Flow):**
  1. Người dùng mở giao diện Đăng nhập trên Web Next.js hoặc App React Native.
  2. Người dùng nhập Email/SĐT và Mật khẩu, nhấn "Đăng nhập".
  3. Client gửi request `POST /api/v1/auth/login` tới API Gateway và chuyển tiếp vào Backend NestJS.
  4. Backend NestJS tìm kiếm tài khoản trong PostgreSQL, xác thực mật khẩu băm (Argon2/Bcrypt).
  5. Backend tạo JWT Access Token (chứa `userId`, `role`, `schoolId`) và Refresh Token.
  6. Backend trả về payload token cho Client.
  7. Client lưu token an toàn (HttpOnly Cookie trên Web, SecureStorage trên Mobile) và chuyển hướng vào Dashboard theo quyền.
- **Luồng ngoại lệ (Exceptions):**
  - *4a. Sai tài khoản hoặc mật khẩu:* Hệ thống trả về lỗi `401 Unauthorized`. Client hiển thị thông báo "Email hoặc mật khẩu không chính xác".
  - *4b. Tài khoản bị vô hiệu hóa:* Hệ thống trả về `403 Forbidden`, thông báo tài khoản đang bị khóa.

---

### UC-ACA-02: Điểm danh chuyên cần lớp học (Class Attendance)
- **Tác nhân chính:** Giáo viên (Teacher).
- **Tác nhân hỗ trợ:** Backend NestJS (Academic Module, Notification Module), RabbitMQ, FCM.
- **Mô tả:** Giáo viên thực hiện điểm danh học sinh của lớp theo buổi học/tiết học trên Web Next.js hoặc Mobile App React Native.
- **Tiền điều kiện:** Giáo viên đã đăng nhập và được phân công phụ trách lớp học trong thời khóa biểu hiện tại.
- **Hậu điều kiện:** Dữ liệu điểm danh được ghi nhận vào PostgreSQL; hệ thống tự động bắn thông báo đẩy (Push Notification) đến phụ huynh của các học sinh vắng mặt.
- **Luồng sự kiện chính (Main Flow):**
  1. Giáo viên mở màn hình "Điểm danh", chọn lớp học và ngày/tiết học.
  2. Hệ thống hiển thị danh sách học sinh của lớp với trạng thái mặc định là "Có mặt".
  3. Giáo viên chuyển đổi trạng thái của các học sinh vắng mặt ("Vắng có phép" hoặc "Vắng không phép") và nhập lý do (nếu có).
  4. Giáo viên nhấn "Lưu điểm danh".
  5. Client gửi `POST /api/v1/attendance/submit` tới Backend NestJS.
  6. Backend NestJS lưu bản ghi điểm danh vào PostgreSQL trong một Database Transaction.
  7. Nếu có học sinh vắng mặt, Academic Module phát sự kiện `StudentAbsentEvent` vào RabbitMQ.
  8. Notification Module tiêu thụ event từ RabbitMQ, tra cứu thiết bị phụ huynh tương ứng và gọi FCM đẩy cảnh báo tới điện thoại phụ huynh.
  9. Hệ thống phản hồi thành công về giao diện của Giáo viên.
- **Luồng rẽ nhánh (Alternative Flows):**
  - *3a. Giáo viên chỉnh sửa lại điểm danh:* Nếu buổi điểm danh đã tồn tại trong ngày, hệ thống cho phép cập nhật lại trạng thái và ghi log vào MongoDB Audit Log.

---

### UC-ACA-03: Nhập & Phê duyệt điểm số môn học (Grade Entry & Approval)
- **Tác nhân chính:** Giáo viên (Teacher).
- **Tác nhân hỗ trợ:** Backend NestJS (Academic Module), PostgreSQL, RabbitMQ.
- **Mô tả:** Giáo viên bộ môn nhập các đầu điểm thành phần (miệng, 15 phút, 1 tiết, giữa kỳ, cuối kỳ) cho học sinh trong lớp phụ trách.
- **Tiền điều kiện:** Môn học và danh sách học sinh của lớp đã được phân công cho giáo viên.
- **Hậu điều kiện:** Điểm số được lưu trữ toàn vẹn, điểm trung bình môn được tự động tính toán lại, thông báo điểm mới được gửi tới phụ huynh khi được duyệt.
- **Luồng sự kiện chính (Main Flow):**
  1. Giáo viên chọn Lớp, Môn học, Học kỳ và Cột điểm cần nhập trên Web Next.js.
  2. Bảng nhập điểm hiển thị danh sách học sinh theo số thứ tự và họ tên.
  3. Giáo viên nhập điểm (thang điểm từ 0 đến 10 với bước nhảy 0.1).
  4. Giáo viên nhấn "Lưu tạm" hoặc "Phê duyệt công bố".
  5. Backend NestJS kiểm tra hợp lệ dữ liệu (giá trị điểm hợp lệ từ 0 đến 10).
  6. Backend cập nhật bảng `grades` trong PostgreSQL và tự động tính lại điểm trung bình môn.
  7. Khi chọn "Phê duyệt công bố", sự kiện `GradePublishedEvent` được gửi vào RabbitMQ để thông báo phụ huynh.
  8. Hệ thống hiển thị thông báo "Cập nhật điểm thành công".

---

### UC-PAR-01: Tra cứu học tập & Chuyên cần của con (Student Progress Inquiry)
- **Tác nhân chính:** Phụ huynh (Parent).
- **Tác nhân hỗ trợ:** Mobile App React Native, Backend NestJS, Redis Cache, PostgreSQL.
- **Mô tả:** Phụ huynh theo dõi kết quả học tập, điểm số chi tiết từng môn, lịch sử điểm danh và nhận xét của giáo viên.
- **Tiền điều kiện:** Phụ huynh đã đăng nhập vào ứng dụng React Native và tài khoản đã được liên kết với ít nhất một học sinh.
- **Hậu điều kiện:** Thông tin kết quả học tập được hiển thị trực quan, có biểu đồ đánh giá xu hướng tiến bộ.
- **Luồng sự kiện chính (Main Flow):**
  1. Phụ huynh mở ứng dụng React Native trên điện thoại.
  2. Nếu có nhiều con đang theo học, phụ huynh chọn hồ sơ con em cần theo dõi từ thanh chọn.
  3. Ứng dụng gửi `GET /api/v1/students/:id/academic-summary` tới Backend NestJS.
  4. Backend kiểm tra quyền truy cập (đảm bảo phụ huynh sở hữu học sinh này qua liên kết `student_parent_relations`).
  5. Backend trả về dữ liệu điểm trung bình, bảng điểm các môn, số buổi vắng học và nhận xét mới nhất.
  6. Ứng dụng hiển thị giao diện báo cáo học tập rõ ràng, trực quan.

---

### UC-PAR-04: Tra cứu biểu phí & Thanh toán học phí trực tuyến (Tuition Payment)
- **Tác nhân chính:** Phụ huynh (Parent).
- **Tác nhân hỗ trợ:** Payment Gateway (VNPAY / MoMo), Backend NestJS, PostgreSQL.
- **Mô tả:** Phụ huynh xem thông báo học phí của học sinh và thanh toán trực tiếp qua cổng thanh toán liên kết.
- **Tiền điều kiện:** Nhà trường (Admin) đã tạo hóa đơn học phí cho học sinh.
- **Hậu điều kiện:** Trạng thái hóa đơn chuyển sang "Đã thanh toán" (Paid), hệ thống ghi nhận biên lai và gửi thông báo xác nhận.
- **Luồng sự kiện chính (Main Flow):**
  1. Phụ huynh vào tab "Học phí" trên Mobile App React Native.
  2. Hệ thống hiển thị các khoản phí cần nộp (học phí chính khóa, tiền bán trú, đồng phục...).
  3. Phụ huynh chọn các khoản phí cần nộp và nhấn "Thanh toán ngay".
  4. Phụ huynh chọn phương thức thanh toán (VNPAY / MoMo / Thẻ ngân hàng).
  5. Backend NestJS tạo mã giao dịch và gọi API của Cổng thanh toán để tạo URL thanh toán.
  6. Ứng dụng điều hướng sang cổng thanh toán hoặc mở App thanh toán ngân hàng.
  7. Phụ huynh thực hiện xác thực thanh toán thành công (OTP / Biometric).
  8. Cổng thanh toán gọi Webhook `POST /api/v1/payments/webhook` về Backend NestJS.
  9. Backend kiểm tra chữ ký số (Checksum), cập nhật trạng thái hóa đơn sang `PAID` trong PostgreSQL.
  10. Hệ thống gửi thông báo đẩy xác nhận thanh toán thành công về điện thoại phụ huynh.
