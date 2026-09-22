# Tài Liệu Tổng Quan Hệ Thống (System Overview)
# GiaoVienHay (EduConnect) – Nền Tảng Quản Lý & Kết Nối Giáo Dục Toàn Diện

---

## 1. Giới thiệu & Bối cảnh dự án (Project Background)

### 1.1. Bối cảnh bài toán
Trong công tác quản lý giáo dục phổ thông và các trung tâm đào tạo, việc kết nối thông tin giữa ba bên cốt lõi: **Ban giám hiệu/Quản trị viên (Admin) – Giáo viên (Teacher) – Phụ huynh (Parent)** hiện còn nhiều bất cập:
- Thông tin phân mảnh qua nhiều kênh phi chính thức (sổ liên lạc giấy, gọi điện thoại, mạng xã hội).
- Giáo viên tốn nhiều thời gian cho các công tác hành chính: ghi sổ điểm danh, tổng hợp điểm số thủ công, viết nhận xét từng học sinh.
- Phụ huynh nắm bắt thông tin học tập, chuyên cần và các khoản thu học phí của con em chậm trễ, thiếu minh bạch.
- Dữ liệu điểm số và học bạ thiếu tính đồng bộ, khó theo dõi tiến trình học tập xuyên suốt.

### 1.2. Mục tiêu hệ thống GiaoVienHay (EduConnect)
**GiaoVienHay** là nền tảng quản lý giáo dục hiện đại, đa nền tảng, tập trung tối ưu trải nghiệm và luồng thông tin giữa 3 đối tượng người dùng chính:
1. **Quản trị viên (Admin / Ban giám hiệu):** Quản lý toàn diện cấu hình trường, danh mục năm học, khối lớp, phân công giảng dạy và kiểm soát chất lượng đào tạo.
2. **Giáo viên (Teacher):** Số hóa quy trình chấm điểm, điểm danh chuyên cần, quản lý lớp học và gửi thông báo nhận xét định kỳ đến phụ huynh.
3. **Phụ huynh (Parent):** Theo dõi tức thì tình hình học tập, chuyên cần của con em qua ứng dụng di động, nhận thông báo đẩy thời gian thực và đóng học phí trực tuyến.

---

## 2. Tiêu chuẩn kiến trúc (Architectural Quality Attributes)

- **Tính sẵn sàng cao (High Availability):** Hệ thống đạt độ sẵn sàng tối thiểu 99.9%, đảm bảo không gián đoạn vào các thời điểm cao điểm (giờ vào lớp điểm danh, kỳ công bố điểm thi).
- **Khả năng mở rộng theo chiều ngang (Horizontal Scalability):** Sẵn sàng mở rộng cụm dịch vụ (Web, Backend API, Message Consumer) khi số lượng trường học và người dùng tăng trưởng.
- **Bảo mật & Toàn vẹn dữ liệu (Security & Data Integrity):** 
  - Mã hóa chuẩn HTTPS/TLS 1.3 cho toàn bộ dữ liệu truyền tải (Data in transit).
  - Mã hóa AES-256 đối với mật khẩu, thông tin cá nhân và dữ liệu nhạy cảm (Data at rest).
  - Phân quyền nghiêm ngặt theo mô hình RBAC (Role-Based Access Control) cho 3 nhóm đối tượng.
- **Hiệu năng cao & Phản hồi nhanh (High Performance):** Tận dụng Redis Caching để giảm tải truy vấn DB và RabbitMQ để xử lý bất đồng bộ các tác vụ nặng (thông báo hàng loạt, xuất bảng điểm).

---

## 3. Kiến trúc tổng thể 3 tầng (3-Tier Architecture Overview)

Hệ thống được thiết kế đồng bộ với sự phân tách rõ ràng giữa các tầng:

```text
+----------------------------------------------------+  +----------------------------------------------------+
|         WEB QUẢN TRỊ (Next.js Framework)           |  |       MOBILE APP (React Native - iOS & Android)    |
|  - Dành cho: Admin & Giáo viên                     |  |  - Dành cho: Giáo viên & Phụ huynh                 |
|  - SSR/SSG tối ưu hiệu năng, bảo mật client        |  |  - Push Notification (FCM), điểm danh, tra cứu điểm|
+----------------------------------------------------+  +----------------------------------------------------+
                           │                                                       │
                           └───────────────────────┬───────────────────────────────┘
                                                   ▼ (HTTPS / RESTful APIs)
+------------------------------------------------------------------------------------------------------------+
|                               API GATEWAY & LOAD BALANCER (Kong / Reverse Proxy)                           |
|  - Rate Limiting, SSL Termination, Request Routing, Centralized Logging                                    |
+------------------------------------------------------------------------------------------------------------+
                                                   │
                                                   ▼
+------------------------------------------------------------------------------------------------------------+
|                                  BACKEND CHUNG (NestJS Framework / TypeScript)                             |
|  ┌───────────────────┐  ┌───────────────────┐  ┌─────────────────────────┐  ┌───────────────────────────┐  |
|  │    Auth Module    │  │    User Module    │  │     Academic Module     │  │    Notification Module    │  |
|  │ (JWT, RBAC Guard) │  │(Profiles, Linkage)│  │(Classes, Grades, Attend)│  │ (FCM, Email, SMS Queues)  │  |
|  └───────────────────┘  └───────────────────┘  └─────────────────────────┘  └───────────────────────────┘  |
+------------------------------------------------------------------------------------------------------------+
                           │                               │                               │
                           ▼                               ▼                               ▼
+------------------------------------+  +------------------------------------+  +----------------------------+
|      PostgreSQL (Prisma/TypeORM)   |  |        MongoDB (Mongoose)          |  |   Redis Cache & BullMQ     |
| - Users, Roles, Academic, Grades   |  | - News Feed, School Announcements  |  | - Session, Token Blacklist |
| - Dữ liệu quan hệ, giao dịch ACID  |  | - Activity Logs, Audit Trails      |  | - Message Queuing Task     |
+------------------------------------+  +------------------------------------+  +----------------------------+
                                                           │
                                                           ▼
                                         +-----------------------------------+
                                         |     Message Broker (RabbitMQ)     |
                                         | - Event-driven async workflows    |
                                         +-----------------------------------+
```

---

## 4. Phạm vi chức năng cốt lõi (Core Feature Scope)

1. **Quản lý Tài khoản & Phân quyền (Authentication & Authorization):**
   - Đăng nhập, cấp phát Access Token (JWT) và Refresh Token.
   - RBAC Guards phân cấp chính xác 3 vai trò: `ADMIN`, `TEACHER`, `PARENT`.
2. **Quản trị Trường học & Lớp học (School & Academic Management):**
   - Quản lý năm học, học kỳ, khối lớp, danh sách môn học.
   - Phân công giáo viên chủ nhiệm và giáo viên bộ môn.
3. **Quản lý Hồ sơ & Liên kết Học sinh - Phụ huynh (Student - Parent Linkage):**
   - Quản lý hồ sơ học sinh, gắn kết mối quan hệ với tài khoản phụ huynh để theo dõi.
4. **Sổ Điểm & Đánh giá (Grades & Assessments):**
   - Giáo viên nhập điểm thành phần (miệng, 15 phút, 1 tiết, học kỳ).
   - Tự động tính điểm trung bình và xuất báo cáo kết quả học tập.
5. **Điểm danh Chuyên cần (Attendance Management):**
   - Giáo viên điểm danh có mặt, vắng phép, vắng không phép trực tiếp trên ứng dụng React Native hoặc Web Next.js.
   - Tự động phát sinh thông báo tới phụ huynh khi học sinh vắng mặt.
6. **Bảng tin & Thông báo Nhà trường (School Feed & Real-time Notifications):**
   - Đăng thông báo, kế hoạch tuần của nhà trường lên bảng tin chung.
   - Bắn thông báo đẩy tức thì (Push Notification qua Firebase Cloud Messaging) về thiết bị di động của phụ huynh khi có biến động về điểm số, chuyên cần hoặc học phí.
7. **Thanh toán Học phí (Tuition Fee & Billing):**
   - Lập hóa đơn học phí theo kỳ, hỗ trợ phụ huynh xem biểu phí và thanh toán trực tuyến qua cổng thanh toán (VNPAY / MoMo).
