# Kiến Trúc Ứng Dụng Di Động React Native (Mobile Frontend Architecture)
# Nền tảng: React Native (Cross-platform iOS & Android / TypeScript)

Tài liệu này đặc tả chi tiết cấu trúc, quy tắc điều hướng và giải pháp kỹ thuật cho ứng dụng di động **GiaoVienHay Mobile** phục vụ 2 nhóm tác nhân: **Giáo viên (Teacher)** và **Phụ huynh (Parent)**.

---

## 1. Mục Tiêu & Nhóm Người Dùng (Target Audience)

1. **Giáo viên (Teacher Mode - Hỗ trợ Phone & Tablet để kết nối máy chiếu/bảng lớp):**
   - Thiết lập hồ sơ cá nhân: Chọn 1 hoặc nhiều môn trực tiếp giảng dạy (`teaching_subjects`).
   - GVCN tạo lớp tổng, thêm học sinh, phân công GVBM và sinh Invite Link cho phụ huynh.
   - Điểm danh chuyên cần đầu giờ (thao tác 1 chạm).
   - Quản lý Sổ điểm môn học phụ trách (nhiều đầu điểm, không tính GPA) & Trình chiếu Leaderboard điểm môn học.
   - Tải file giáo án bài học (`.docx`, `.pdf`) để AI sinh câu hỏi kiểm tra bài cũ (Quiz).
   - Khởi chạy bộ 3 Mini-game tương tác tại lớp: Rung chuông vàng, Đua xe, Hộp quà bí mật (chiếu lên bảng từ iPad/Tablet).
   - Vòng quay Random học sinh lên bảng kiểm tra bài cũ (nút Bỏ qua khi vắng).
   - Nhập lời nhận xét ngắn gọn (đoạn text ngắn gửi phụ huynh).
   - Tạo lời nhắc lịch kiểm tra sắp tới gửi phụ huynh đôn đốc học sinh.
   - Theo dõi cờ nộp Học phí & BHYT của lớp chủ nhiệm.
2. **Phụ huynh (Parent Mode):**
   - Tham gia vào lớp học bằng Link mời / Quét mã QR do GVCN gửi.
   - Đăng nhập bằng SĐT nhận OTP, xác nhận con em mình (hỗ trợ chuyển đổi giữa nhiều con).
   - Nhận thông báo đẩy (Push Notification) tức thì: vắng học đầu giờ, điểm mới, nhận xét, lời nhắc bài kiểm tra, nhắc nộp BHYT.
   - Tra cứu Sổ điểm điện tử chi tiết các môn học.
   - Xem lịch sử chuyên cần và tình trạng nộp BHYT của con.

---

## 2. Cấu Trúc Thư Mục Chuẩn (Mobile Folder Structure)

```text
mobile-app/
├── src/
│   ├── assets/                             # Hình ảnh, vector icons, sound effects, fonts
│   ├── navigation/                         # Cấu hình Navigation (React Navigation)
│   │   ├── RootNavigator.tsx               # Điều hướng tầng cao nhất (Auth vs App)
│   │   ├── AuthNavigator.tsx               # Stack đăng nhập OTP / Link mời lớp
│   │   ├── TeacherTabNavigator.tsx         # Bottom Tabs & Drawer dành cho Giáo viên
│   │   └── ParentTabNavigator.tsx          # Bottom Tabs dành cho Phụ huynh
│   ├── screens/                            # Màn hình ứng dụng
│   │   ├── auth/                           # LoginScreen, JoinClassByLinkScreen
│   │   ├── teacher/                        # Nghiệp vụ Sư phạm Giáo viên (Phone & Tablet)
│   │   │   ├── ClassManagementScreen.tsx   # GVCN tạo lớp tổng, gán GVBM, chia sẻ Invite Link
│   │   │   ├── AttendanceScreen.tsx        # Điểm danh nhanh tại lớp
│   │   │   ├── GradebookScreen.tsx         # Sổ điểm môn học phụ trách
│   │   │   ├── LeaderboardScreen.tsx       # Trình chiếu Bảng xếp hạng Điểm Môn Học
│   │   │   ├── LuckyWheelScreen.tsx        # Vòng quay Random học sinh (nút Bỏ qua)
│   │   │   ├── AIQuizUploadScreen.tsx      # Tải giáo án để AI Gemini sinh câu hỏi
│   │   │   ├── MiniGamesScreen.tsx         # Chạy 3 Mini-game: Rung chuông, Đua xe, Hộp quà
│   │   │   ├── RemarksScreen.tsx           # Nhập lời nhận xét text ngắn gửi phụ huynh
│   │   │   ├── ExamReminderScreen.tsx      # Tạo lời nhắc lịch kiểm tra gửi phụ huynh
│   │   │   ├── FeesInsuranceScreen.tsx     # Theo dõi cờ BHYT lớp chủ nhiệm
│   │   │   └── TeacherProfileScreen.tsx    # Thiết lập hồ sơ (chọn 1 hoặc nhiều môn dạy)
│   │   └── parent/                         # Màn hình Phụ huynh
│   │       ├── ParentHomeScreen.tsx        # Trang chủ phụ huynh & bảng tin lớp
│   │       ├── ChildAcademicScreen.tsx     # Sổ điểm chi tiết các môn của con
│   │       ├── ChildAttendanceScreen.tsx   # Lịch sử chuyên cần & ngày vắng
│   │       ├── ExamRemindersScreen.tsx     # Lịch kiểm tra sắp tới để đôn đốc con
│   │       ├── ChildRemarksScreen.tsx      # Lời nhận xét của thầy cô (nút xác nhận đã đọc)
│   │       ├── FeesInsuranceStatusScreen.tsx # Tra cứu tình trạng nộp BHYT
│   │       └── NotificationsScreen.tsx     # Hộp thư thông báo đẩy thời gian thực
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
    CheckRole -->|PARENT| ParentTabs[ParentTabNavigator\n1. Tổng quan con (Home)\n2. Điểm số (Academic)\n3. Chuyên cần (Attendance)\n4. Học phí & BHYT (Fees & Insurance)\n5. Thông báo (Noti)]
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
