# Tài Liệu Đặc Tả Tác Nhân & Trường Hợp Sử Dụng (Actors & Use Cases Specification)
# Dự Án GiaoVienHay (EduConnect)

---

## 1. Giới thiệu & Phạm vi hệ thống (System Overview & Scope)

### 1.1. Mục đích tài liệu
Tài liệu này xác định và đặc tả toàn bộ các **Tác nhân (Actors)** cùng danh mục các **Trường hợp sử dụng (Use Cases)** cho nền tảng **GiaoVienHay (EduConnect)**. Đây là tài liệu nghiệp vụ cơ sở, trực tiếp định hướng cho việc vẽ các sơ đồ UML (Use Case Diagram, Activity Diagram, Sequence Diagram) cũng như thiết kế API Endpoints và cấu trúc Database.

### 1.2. Ranh giới hệ thống (System Boundary)
Hệ thống phục vụ 3 nhóm đối tượng người dùng cuối thông qua 2 giao diện client chính:
- **Web Quản trị (Next.js):** Dành cho Admin và Giáo viên.
- **Mobile App (React Native):** Dành cho Giáo viên và Phụ huynh.

---

## 2. Danh mục Tác nhân Hệ thống (System Actors)

| Mã Tác nhân | Tên Tác nhân | Vai trò | Giao diện sử dụng | Mô tả quyền hạn |
| :--- | :--- | :--- | :--- | :--- |
| **ACT-01** | **Admin** (Quản trị viên / BGH) | Quản trị viên hệ thống | Web Quản trị (Next.js) | Toàn quyền cấu hình trường học, năm học, quản lý tài khoản giáo viên, phụ huynh, phân lớp và giám sát vận hành. |
| **ACT-02** | **Teacher** (Giáo viên) | Người dùng nghiệp vụ sư phạm | Web (Next.js) & Mobile (React Native) | Nhập điểm, điểm danh chuyên cần, quản lý lớp chủ nhiệm/bộ môn, viết nhận xét và phát thông báo tới phụ huynh. |
| **ACT-03** | **Parent** (Phụ huynh) | Người dùng tra cứu & liên lạc | Mobile App (React Native) | Tra cứu kết quả học tập, chuyên cần của con em, nhận thông báo tức thời và thanh toán học phí trực tuyến. |
| **SYS-01** | **FCM Gateway** | Tác nhân hệ thống ngoài | Background Worker | Dịch vụ Firebase Cloud Messaging phụ trách chuyển phát thông báo đẩy tới thiết bị di động. |
| **SYS-02** | **Payment Gateway** | Tác nhân hệ thống ngoài | Webhook / Redirect | Cổng thanh toán trực tuyến (VNPAY / MoMo) xử lý giao dịch học phí an toàn. |

---

## 3. Ma trận Phân quyền Use Case (Use Case Matrix)

| Mã Use Case | Tên Use Case | ACT-01 (Admin) | ACT-02 (Teacher) | ACT-03 (Parent) |
| :--- | :--- | :---: | :---: | :---: |
| **UC-AUTH-01** | Đăng nhập hệ thống (Web / App) | ✔ | ✔ | ✔ |
| **UC-AUTH-02** | Đăng xuất & Thu hồi Token | ✔ | ✔ | ✔ |
| **UC-AUTH-03** | Đổi mật khẩu & Xem hồ sơ | ✔ | ✔ | ✔ |
| **UC-ADM-01** | Quản lý niên khóa, khối lớp, môn học | ✔ | ✖ | ✖ |
| **UC-ADM-02** | Quản lý hồ sơ giáo viên & Phân công chuyên môn | ✔ | ✖ | ✖ |
| **UC-ADM-03** | Quản lý hồ sơ học sinh & Liên kết phụ huynh | ✔ | Xem | ✖ |
| **UC-ADM-04** | Quản lý biểu phí & Khởi tạo đợt thu học phí | ✔ | ✖ | ✖ |
| **UC-ACA-01** | Xem thời khóa biểu giảng dạy | ✖ | ✔ | ✖ |
| **UC-ACA-02** | Điểm danh chuyên cần lớp học | ✖ | ✔ | ✖ |
| **UC-ACA-03** | Nhập điểm thành phần & Đánh giá môn học | ✖ | ✔ | ✖ |
| **UC-ACA-04** | Nhập nhận xét định kỳ học sinh | ✖ | ✔ | ✖ |
| **UC-PAR-01** | Tra cứu điểm số & Học bạ điện tử của con | ✖ | ✖ | ✔ |
| **UC-PAR-02** | Theo dõi lịch sử chuyên cần & Lịch học của con | ✖ | ✖ | ✔ |
| **UC-PAR-03** | Nhận thông báo đẩy thời gian thực từ nhà trường | ✖ | ✖ | ✔ |
| **UC-PAR-04** | Tra cứu học phí & Thanh toán trực tuyến | ✖ | ✖ | ✔ |
| **UC-FED-01** | Đăng bài viết thông báo lên bảng tin trường | ✔ | ✔ (Có duyệt) | ✖ |
| **UC-FED-02** | Xem bảng tin & Sự kiện nhà trường | ✔ | ✔ | ✔ |

---

## 4. Danh mục chi tiết các Use Case theo Phân hệ

### 4.1. Phân hệ Xác thực & Tài khoản (Authentication & Account)
- **UC-AUTH-01: Đăng nhập hệ thống**
  - Người dùng nhập Email/SĐT và Mật khẩu.
  - Hệ thống kiểm tra thông tin, tạo JWT Access Token (hạn 15-30 phút) và Refresh Token (hạn 7 ngày).
- **UC-AUTH-02: Đăng xuất hệ thống**
  - Hệ thống thu hồi Refresh Token trong DB và ghi Access Token vào Redis Blacklist.
- **UC-AUTH-03: Đổi mật khẩu & Cập nhật hồ sơ**
  - Cho phép người dùng cập nhật thông tin cá nhân và thay đổi mật khẩu định kỳ.

### 4.2. Phân hệ Quản trị Trường học (School Administration)
- **UC-ADM-01: Quản lý danh mục đào tạo:** Thiết lập năm học, học kỳ, khối lớp (10, 11, 12), danh sách môn học.
- **UC-ADM-02: Phân công chuyên môn:** Gán giáo viên làm chủ nhiệm lớp hoặc phụ trách dạy môn học cho từng lớp cụ thể.
- **UC-ADM-03: Quản lý học sinh & Phụ huynh:** Nhập danh sách học sinh từ Excel, tạo mối quan hệ ràng buộc giữa học sinh và tài khoản phụ huynh tương ứng.
- **UC-ADM-04: Quản lý biểu phí:** Cấu hình các khoản thu học phí, tiền ăn, phụ phí theo tháng/kỳ.

### 4.3. Phân hệ Nghiệp vụ Giảng dạy & Chuyên cần (Academic & Attendance)
- **UC-ACA-01: Xem thời khóa biểu:** Giáo viên tra cứu lịch dạy theo tuần trên Web hoặc App di động.
- **UC-ACA-02: Điểm danh lớp học:** Giáo viên điểm danh trạng thái học sinh (Có mặt / Vắng có phép / Vắng không phép). Khi bấm lưu, hệ thống tự động phát sinh event thông báo vắng học tới phụ huynh.
- **UC-ACA-03: Nhập điểm số:** Giáo viên bộ môn nhập điểm miệng, 15 phút, 1 tiết, học kỳ. Hệ thống tự động tính điểm trung bình môn.
- **UC-ACA-04: Nhập nhận xét định kỳ:** Giáo viên chủ nhiệm viết đánh giá hạnh kiểm và tiến độ rèn luyện của học sinh.

### 4.4. Phân hệ Phụ huynh (Parent Portal)
- **UC-PAR-01: Tra cứu học tập:** Phụ huynh xem chi tiết bảng điểm từng môn, thứ hạng và nhận xét của giáo viên.
- **UC-PAR-02: Theo dõi chuyên cần:** Xem lịch sử điểm danh ngày/tháng, nhận cảnh báo tức thời khi con vắng mặt tại trường.
- **UC-PAR-03: Nhận thông báo đẩy:** Tiếp nhận tin tức khẩn cấp, nhắc nhở họp phụ huynh, lịch thi qua Push Notification (FCM).
- **UC-PAR-04: Thanh toán học phí:** Xem danh sách hóa đơn học phí, bấm chuyển hướng sang cổng thanh toán trực tuyến để hoàn tất.

### 4.5. Phân hệ Bảng tin Trường học (School Feed)
- **UC-FED-01: Đăng tin tức nhà trường:** Admin đăng các bài viết hoạt động, lịch nghỉ lễ, kế hoạch hoạt động của nhà trường.
- **UC-FED-02: Xem bảng tin:** Cả 3 nhóm người dùng đều có thể đọc tin tức chính thức từ nhà trường.
