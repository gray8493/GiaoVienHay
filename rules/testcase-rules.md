# Quy Tắc Đặt Mã & Soạn Thảo Testcase (Testcase Specification Rules)
# Dự Án GiaoVienHay

Tài liệu này quy định chuẩn bắt buộc khi đặt mã định danh, phân loại và trình bày kịch bản kiểm thử (Testcase) cho toàn bộ dự án **GiaoVienHay**.

---

## 1. Cấu Trúc Đặt Mã Định Danh Testcase (Testcase ID Syntax)

Mọi testcase trong dự án bắt buộc phải tuân theo cấu trúc chuẩn:

```text
<Loại Test><Số phân hệ>_<Tên Module/API>_TC<Số thứ tự testcase>
```

### Chi tiết các thành phần:

1. **`<Loại Test>`**: 2 chữ cái viết hoa xác định cấp độ kiểm thử:
   - **`UT`**: Unit Test (Kiểm thử đơn vị hàm, controller, service, validator).
   - **`IT`**: Integration Test (Kiểm thử tích hợp giữa NestJS API, Cloud Firestore và Firebase Services).
   - **`ST`**: System Test (Kiểm thử luồng hệ thống xuyên suốt từ Client Web/App đến Backend).
   - **`AT`**: Acceptance Test (Kiểm thử chấp nhận người dùng UAT: Admin, Teacher, Parent).

2. **`<Số phân hệ>`**: 2 chữ số (`01`, `02`, `03`,...):
   - `01`: Auth & User Profile Module
   - `02`: School & Academic Structure Module
   - `03`: Gradebook & Assessment Module
   - `04`: Attendance & Chuyên Cần Module
   - `05`: Notification & FCM Module
   - `06`: Tuition & Billing Module

3. **`<Số thứ tự testcase>`**: 2 hoặc 3 chữ số (`01`, `02`, `03`,...).

### Ví dụ mã testcase hợp lệ:
- `UT01_AuthService_TC01`: Unit test kiểm tra xác thực Firebase ID Token khi đăng nhập.
- `IT03_GradePublish_TC01`: Integration test kiểm tra cập nhật điểm vào Firestore collection /scores và kích hoạt FCM.
- `ST04_AttendanceFlow_TC01`: System test kiểm tra giáo viên điểm danh trên Mobile và phụ huynh nhận Push Notification.

---

## 2. Bảng Mẫu Soạn Thảo Testcase (Testcase Template)

| Mã Testcase | Tên kịch bản | Điều kiện tiên quyết | Các bước thực hiện (Steps) | Dữ liệu đầu vào (Input) | Kết quả mong đợi (Expected Output) | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **UT01_Auth_TC01** | Đăng nhập với mật khẩu đúng | Tài khoản đã kích hoạt | 1. Gọi `authService.login()` | `email: "teacher@school.edu.vn"`, `password: "ValidPass123@"` | Trả về Access Token JWT hợp lệ chứa role TEACHER | **PASS** |
| **UT01_Auth_TC02** | Đăng nhập với mật khẩu sai | Tài khoản đã kích hoạt | 1. Gọi `authService.login()` | `email: "teacher@school.edu.vn"`, `password: "WrongPassword"` | Ném ngoại lệ `UnauthorizedException` (401) | **PASS** |

