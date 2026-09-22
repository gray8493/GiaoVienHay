# Đặc Tả API Phân Hệ Xác Thực & Phân Quyền (Auth API Specification)
# Module: Auth & Users (`/api/v1/auth`)

---

## 1. POST `/api/v1/auth/login` - Đăng nhập hệ thống

- **Mô tả:** Xác thực danh tính người dùng (Admin, Giáo viên, Phụ huynh) và cấp phát Access Token (JWT), Refresh Token.
- **Quyền truy cập:** Public (Không yêu cầu Token).
- **Rate Limit:** Tối đa 5 lần thử trong 1 phút trên mỗi IP.

### Request Body
```json
{
  "email": "teacher.an@school.edu.vn",
  "password": "SecurePassword123@"
}
```

### Response Thành Công (HTTP 200 OK)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Đăng nhập thành công",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "d98f7e2a-1b4c-45a8-9d32-8f921ab07e81",
    "expires_in": 1800,
    "user": {
      "id": "usr_10293847",
      "email": "teacher.an@school.edu.vn",
      "full_name": "Nguyễn Văn An",
      "role": "TEACHER",
      "school_id": "sch_01"
    }
  },
  "timestamp": "2026-09-22T08:00:00.000Z"
}
```

### Response Thất Bại (HTTP 401 Unauthorized)
```json
{
  "success": false,
  "status_code": 401,
  "message": "Email hoặc mật khẩu không chính xác",
  "error_code": "AUTH_INVALID_CREDENTIALS",
  "details": null,
  "timestamp": "2026-09-22T08:00:00.000Z"
}
```

---

## 2. POST `/api/v1/auth/refresh-token` - Làm mới Access Token

- **Mô tả:** Sử dụng Refresh Token hợp lệ để lấy Access Token mới khi token cũ hết hạn.
- **Quyền truy cập:** Public (Kèm Refresh Token hợp lệ).

### Request Body
```json
{
  "refresh_token": "d98f7e2a-1b4c-45a8-9d32-8f921ab07e81"
}
```

### Response Thành Công (HTTP 200 OK)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Làm mới phiên làm việc thành công",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 1800
  },
  "timestamp": "2026-09-22T08:30:00.000Z"
}
```

---

## 3. POST `/api/v1/auth/logout` - Đăng xuất khỏi hệ thống

- **Mô tả:** Hủy Refresh Token và ghi Access Token hiện tại vào Redis Blacklist.
- **Quyền truy cập:** Đã đăng nhập (`Bearer <access_token>`).

### Header
```text
Authorization: Bearer <access_token>
```

### Response Thành Công (HTTP 200 OK)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Đăng xuất thành công",
  "data": null,
  "timestamp": "2026-09-22T09:00:00.000Z"
}
```
