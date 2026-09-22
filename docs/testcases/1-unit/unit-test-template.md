# Mẫu Kịch Bản Kiểm Thử Đơn Vị (Unit Test Template)
# Cấp độ: Unit Test (UT) - Framework: Jest / NestJS Testing

---

## 1. Thông Tin Chung

- **Module:** Auth & User Management (`AuthService`, `JwtStrategy`)
- **Tập tin kiểm thử:** `src/auth/auth.service.spec.ts`
- **Người thực hiện:** QA / Developer
- **Môi trường:** Isolated Unit Testing (Mock Repository, Mock Redis)

---

## 2. Bảng Danh Sách Unit Test Cases

| Mã Testcase | Tên Kịch Bản | Mục Tiêu Kiểm Thử | Dữ Liệu Đầu Vào (Mock Input) | Kết Quả Mong Đợi (Assertion) | Trạng Thái |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **UT01_Auth_TC01** | `login()` thành công | Kiểm tra sinh đúng Access Token và Refresh Token khi tài khoản hợp lệ | Email: `teacher@school.edu.vn`<br>Password: `CorrectPass123` | `result.access_token` tồn tại và là chuỗi JWT hợp lệ; `result.user.role === 'TEACHER'` | **PASS** |
| **UT01_Auth_TC02** | `login()` thất bại do sai mật khẩu | Kiểm tra ném ngoại lệ 401 khi mật khẩu không khớp băm Argon2 | Email: `teacher@school.edu.vn`<br>Password: `WrongPass` | Ném `UnauthorizedException` với mã lỗi `AUTH_INVALID_CREDENTIALS` | **PASS** |
| **UT01_Auth_TC03** | `login()` thất bại do không tìm thấy email | Kiểm tra ném ngoại lệ 401 khi email không tồn tại trong DB | Email: `nonexist@school.edu.vn`<br>Password: `AnyPass` | Ném `UnauthorizedException` với mã lỗi `AUTH_INVALID_CREDENTIALS` | **PASS** |
| **UT01_Auth_TC04** | `refreshToken()` thành công | Kiểm tra cấp Access Token mới khi Refresh Token còn hạn trong Redis | RefreshToken: `valid_uuid_token` | Trả về Access Token mới có thời hạn 1800 giây | **PASS** |
| **UT01_Auth_TC05** | `logout()` thành công | Kiểm tra ghi Access Token vào Redis Blacklist và xóa Refresh Token | AccessToken: `valid_jwt`<br>UserId: `usr_01` | Gọi `redis.set(token, 'blacklisted', 'EX', 1800)` đúng 1 lần | **PASS** |
