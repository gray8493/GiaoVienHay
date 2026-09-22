# Kiến Trúc Ứng Dụng Di Động React Native (Mobile Frontend Architecture)
# Nền tảng: React Native (Cross-platform iOS & Android / TypeScript)

Tài liệu này đặc tả chi tiết cấu trúc, quy tắc điều hướng và giải pháp kỹ thuật cho ứng dụng di động **GiaoVienHay Mobile** phục vụ 2 nhóm tác nhân: **Giáo viên (Teacher)** và **Phụ huynh (Parent)**.

---

## 1. Mục Tiêu & Nhóm Người Dùng (Target Audience)

1. **Giáo viên (Teacher Mode):**
   - Mở app tại lớp học để điểm danh nhanh chóng (thao tác 1 chạm).
   - Xem thời khóa biểu cá nhân trong ngày.
   - Nhập nhận xét nhanh hoặc gửi thông báo khẩn tới lớp chủ nhiệm.
2. **Phụ huynh (Parent Mode):**
   - Hỗ trợ chuyển đổi linh hoạt giữa nhiều hồ sơ con em (Child Switcher).
   - Nhận thông báo đẩy (Push Notification) tức thì khi con vắng học hoặc có điểm mới.
   - Tra cứu kết quả học tập chi tiết, học bạ điện tử và lịch sử điểm danh.
   - Xem hóa đơn và bấm thanh toán học phí qua cổng thanh toán liên kết.

---

## 2. Cấu Trúc Thư Mục Chuẩn (Mobile Folder Structure)

```text
mobile-app/
├── src/
│   ├── assets/                             # Hình ảnh, vector icons, fonts
│   ├── navigation/                         # Cấu hình Navigation (React Navigation)
│   │   ├── RootNavigator.tsx               # Điều hướng tầng cao nhất (Auth vs App)
│   │   ├── AuthNavigator.tsx               # Stack đăng nhập, quên mật khẩu
│   │   ├── TeacherTabNavigator.tsx         # Bottom Tabs dành cho Giáo viên
│   │   └── ParentTabNavigator.tsx          # Bottom Tabs dành cho Phụ huynh
│   ├── screens/                            # Màn hình ứng dụng
│   │   ├── auth/                           # LoginScreen, ForgotPasswordScreen
│   │   ├── teacher/                        # Màn hình Giáo viên
│   │   │   ├── AttendanceScreen.tsx        # Điểm danh nhanh tại lớp
│   │   │   ├── TeacherScheduleScreen.tsx   # Lịch dạy cá nhân
│   │   │   ├── QuickGradingScreen.tsx      # Nhập điểm nhanh
│   │   │   └── TeacherProfileScreen.tsx    # Hồ sơ giáo viên
│   │   └── parent/                         # Màn hình Phụ huynh
│   │       ├── ParentHomeScreen.tsx        # Trang chủ phụ huynh & bảng tin
│   │       ├── ChildAcademicScreen.tsx     # Bảng điểm & tiến độ của con
│   │       ├── ChildAttendanceScreen.tsx   # Lịch sử chuyên cần của con
│   │       ├── TuitionPaymentScreen.tsx    # Hóa đơn & thanh toán học phí
│   │       └── NotificationsScreen.tsx     # Trung tâm thông báo
│   ├── components/                         # UI Components tái sử dụng
│   │   ├── common/                         # Button, Input, Card, Header, Avatar, Badge
│   │   ├── attendance/                     # StudentAttendanceRow, StatusChip
│   │   └── parent/                         # ChildSelectorHeader, ScoreCard
│   ├── services/                           # Tầng API & Network
│   │   ├── api.client.ts                   # Cấu hình Axios, Interceptors, Base URL
│   │   ├── auth.service.ts
│   │   ├── attendance.service.ts
│   │   └── notification.service.ts         # Tích hợp Firebase Cloud Messaging
│   ├── store/                              # Quản lý State (Redux Toolkit / Zustand)
│   │   ├── auth.slice.ts                   # Token, User Role, IsAuthenticated
│   │   ├── parent.slice.ts                 # Danh sách con, SelectedChildId
│   │   └── attendance.slice.ts             # Dữ liệu điểm danh tạm thời
│   ├── hooks/                              # Custom Hooks (useNotification, useAuth)
│   ├── utils/                              # Formatters (Date, Currency), Validation
│   └── constants/                          # Theme Colors, Font Sizes, API Endpoints
├── App.tsx                                 # Entry Point ứng dụng
├── index.js
├── tsconfig.json
└── package.json
```

---

## 3. Kiến Trúc Điều Hướng Theo Vai Trò (Role-Based Navigation)

Ứng dụng khởi động và xác định luồng điều hướng dựa trên trạng thái xác thực và quyền (`role`) của người dùng:

```mermaid
graph TD
    Start([Khởi Động App]) --> CheckAuth{Kiểm tra JWT trong Keychain?}
    CheckAuth -->|Chưa đăng nhập / Hết hạn| AuthStack[AuthNavigator\n- Login Screen\n- Forgot Password]
    CheckAuth -->|Hợp lệ| CheckRole{Role là gì?}
    
    CheckRole -->|TEACHER| TeacherTabs[TeacherTabNavigator\n1. Lịch dạy (Home)\n2. Điểm danh (Attendance)\n3. Nhập điểm (Grades)\n4. Cá nhân (Profile)]
    CheckRole -->|PARENT| ParentTabs[ParentTabNavigator\n1. Tổng quan con (Home)\n2. Điểm số (Academic)\n3. Chuyên cần (Attendance)\n4. Học phí (Tuition)\n5. Thông báo (Noti)]
```

---

## 4. Tích Hợp Thông Báo Đẩy Thời Gian Thực (FCM Integration Flow)

Để đảm bảo phụ huynh nhận thông báo tức thời (ngay cả khi app đang tắt), luồng xử lý FCM được thiết kế chuẩn mực:

1. **Khởi tạo & Cấp quyền:**
   - Ứng dụng yêu cầu quyền thông báo người dùng (`messaging().requestPermission()`).
   - Lấy FCM Device Token và gửi lên backend qua API `POST /api/v1/notifications/device-token`.
2. **Xử lý 3 trạng thái ứng dụng (App States):**
   - **Foreground (Đang mở app):** Lắng nghe qua `messaging().onMessage()`, hiển thị in-app toast/banner hoặc cập nhật badge số tin chưa đọc.
   - **Background (App chạy ngầm):** Lắng nghe qua `messaging().setBackgroundMessageHandler()`, hệ điều hành hiển thị notification native trên thanh trạng thái.
   - **Quit State (App bị đóng hoàn toàn):** Khi người dùng chạm vào notification, `messaging().getInitialNotification()` mở app và tự động điều hướng tới màn hình tương ứng (ví dụ: màn hình chi tiết điểm mới hoặc lịch sử vắng học).

---

## 5. Lưu Trữ Dữ Liệu & Hỗ Trợ Mạng Chập Chờn (Offline Tolerance)

- **Bảo mật Token:** Lưu trữ JWT Access Token và Refresh Token vào `react-native-keychain` (sử dụng Android Keystore và iOS Keychain), tuyệt đối không lưu vào `AsyncStorage` dạng plain text.
- **Hỗ trợ Điểm danh Ngoại tuyến nhẹ:**
  - Danh sách học sinh của lớp được cache cục bộ.
  - Nếu mạng chập chờn khi giáo viên bấm "Lưu điểm danh", ứng dụng lưu tạm vào hàng đợi cục bộ và tự động đồng bộ lại lên server ngay khi có kết nối Internet trở lại.
