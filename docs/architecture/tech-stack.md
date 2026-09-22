# Tài Liệu Ngăn Xếp Công Nghệ (Tech Stack Specification)
# Dự Án GiaoVienHay (EduConnect)

---

## 1. Tổng quan ngăn xếp công nghệ (Technology Stack Summary)

Dự án GiaoVienHay lựa chọn ngăn xếp công nghệ hiện đại, đồng bộ hóa hệ sinh thái **TypeScript / JavaScript** từ Frontend đến Backend nhằm tối ưu hóa hiệu suất phát triển, khả năng tái sử dụng mô hình dữ liệu (DTO, Interfaces) và tính dễ bảo trì.

| Tầng kiến trúc (Layer) | Vai trò & Thành phần | Công nghệ chính | Ghi chú & Lý do lựa chọn |
| :--- | :--- | :--- | :--- |
| **Web Frontend** | Web Quản trị (Admin & Giáo viên) | **Next.js (React / TypeScript)** | Tối ưu Server-Side Rendering (SSR), App Router, tải trang nhanh, bảo mật client. |
| **Mobile Frontend** | Mobile App (Giáo viên & Phụ huynh) | **React Native (TypeScript)** | Ứng dụng di động đa nền tảng (iOS & Android), hiệu năng native, trải nghiệm mượt mà. |
| **Backend Core** | Server API chung | **NestJS (Node.js / TypeScript)** | Cấu trúc Modular chặt chẽ, Dependency Injection, chuẩn hóa Guards/Interceptors. |
| **Relational DB** | Dữ liệu giao dịch, tài khoản, điểm số | **PostgreSQL (v15+)** | Đảm bảo tính toàn vẹn dữ liệu (ACID), quan hệ phức tạp, hiệu năng cao. |
| **ORM / Query Builder** | Quản lý schema & migration PostgreSQL | **Prisma ORM / TypeORM** | Type-safe tuyệt đối, quản lý migration tự động và an toàn. |
| **NoSQL DB** | Bảng tin, tin tức trường học, activity log | **MongoDB (v6+)** | Cấu trúc tài liệu linh hoạt (JSON-like), tốc độ ghi đọc tin tức nhanh. |
| **NoSQL ODM** | Tích hợp MongoDB vào NestJS | **Mongoose (`@nestjs/mongoose`)** | Schema validation, hỗ trợ phân trang và pipeline aggregation mạnh mẽ. |
| **Caching & Queue** | Session, Rate Limiting, Task Queue | **Redis (v7+) & BullMQ** | Bộ nhớ đệm RAM tốc độ cực cao, quản lý hàng đợi gửi tin bất đồng bộ. |
| **Message Broker** | Xử lý sự kiện bất đồng bộ liên dịch vụ | **RabbitMQ** | Hỗ trợ mô hình Publish/Subscribe ổn định, đảm bảo không nghẽn tin nhắn. |
| **Push Notification** | Đẩy thông báo tức thì về điện thoại | **Firebase Cloud Messaging (FCM)** | Đáng tin cậy, hỗ trợ gửi push đa nền tảng (Android & iOS). |
| **Container & Deploy** | Đóng gói & Vận hành | **Docker & Kubernetes (K8s)** | Đóng gói container hóa độc lập, sẵn sàng mở rộng quy mô linh hoạt. |

---

## 2. Chi tiết từng tầng công nghệ (Component Breakdown)

### 2.1. Web Quản trị (Admin & Giáo viên) – Next.js
- **Framework:** Next.js 14+ (App Router).
- **Ngôn ngữ:** TypeScript.
- **State Management:** TanStack Query (React Query) cho Server State, Zustand cho Client State.
- **Form Handling:** React Hook Form kết hợp Zod schema validation.
- **UI Components & Styling:** Vanilla CSS / TailwindCSS kết hợp thư viện Headless UI / Lucide Icons.
- **HTTP Client:** Axios với interceptors xử lý tự động đính kèm JWT và Refresh Token.

### 2.2. Mobile App (Giáo viên & Phụ huynh) – React Native
- **Framework:** React Native 0.73+ (TypeScript).
- **Navigation:** React Navigation (Stack, Bottom Tabs).
- **Quản lý trạng thái:** Redux Toolkit hoặc Zustand.
- **Push Notification:** `@react-native-firebase/app` và `@react-native-firebase/messaging`.
- **Lưu trữ bảo mật:** `react-native-keychain` hoặc `expo-secure-store` để lưu JWT an toàn.

### 2.3. Backend Chung – NestJS
- **Framework:** NestJS 10+ (TypeScript).
- **Kiến trúc:** Modular Architecture kết hợp Event-Driven.
- **Xác thực & Ủy quyền:**
  - `@nestjs/passport`, `passport-jwt` để xác thực Access Token và Refresh Token.
  - Custom Decorator `@Roles()` kết hợp `RolesGuard` để kiểm soát phân quyền RBAC chặt chẽ (Admin, Teacher, Parent).
- **Validation:** `class-validator` và `class-transformer` xác thực dữ liệu đầu vào tại Controller level.
- **Hàng đợi công việc:** `@nestjs/bullmq` để quản lý các background jobs (gửi email, push notification, xử lý file).

### 2.4. Tầng Dữ liệu & Lưu trữ (Data & Storage Layer)
- **PostgreSQL:** Lưu trữ các bảng có cấu trúc quan hệ chặt chẽ:
  - `users`, `roles`, `permissions`
  - `academic_years`, `grades`, `classes`, `subjects`, `timetables`
  - `students`, `student_parent_relations`
  - `scores`, `score_types`, `attendance_records`
- **MongoDB:**
  - `news_feeds`: Bảng tin nhà trường, bài viết của ban giám hiệu/giáo viên, tương tác thích/bình luận.
  - `audit_logs`: Lịch sử thay đổi điểm số, lịch sử điểm danh, log thao tác của người dùng.
  - `notification_history`: Lịch sử các thông báo đã gửi cho phụ huynh.
- **Redis:**
  - Token blacklist (khi người dùng đăng xuất).
  - Caching danh mục ít thay đổi (danh sách môn học, thời khóa biểu).
  - Hàng đợi gửi thông báo tức thời.

---

## 3. Kiến trúc mạng & Bảo mật (Network & Security Architecture)

- **Giao thức mạng:** 100% kết nối giữa Client (Web Next.js / Mobile React Native) và Backend NestJS đi qua giao thức **HTTPS (TLS 1.3)**.
- **Bảo vệ API:**
  - **CORS:** Cấu hình Whitelist domain được phép truy cập.
  - **Helmet:** Bảo vệ chống các lỗ hổng Web phổ biến (XSS, Clickjacking, MIME sniffing).
  - **Rate Limiting:** Sử dụng `@nestjs/throttler` kết hợp Redis để ngăn chặn các cuộc tấn công Brute-force và DDoS.
- **Bảo vệ dữ liệu người dùng:**
  - Mật khẩu được băm bằng thuật toán **Argon2** hoặc **Bcrypt** với salt round an toàn.
  - Dữ liệu điểm số và thông tin cá nhân học sinh tuân thủ các quy định về an toàn dữ liệu giáo dục.
