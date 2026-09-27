# Đặc Tả API Phân Hệ Quản Trị Nền Tảng (Platform Admin API Specification)
# Module: Admin (`/api/v1/admin`) - Dành Riêng Cho Web Next.js Admin Portal

---

## 1. Tổng Quan Phân Hệ
Phân hệ **Admin** được phát triển **chỉ dành riêng cho Quản trị viên Nền tảng (Platform Admin - "chúng tôi")** trên ứng dụng **Web Next.js**. Phân hệ tập trung vào 3 trụ cột kỹ thuật: **CRUD dữ liệu người dùng**, **Khóa/Mở khóa tài khoản (Ban/Unban)**, và **Cấu hình hạn ngạch tài nguyên hệ thống (Limit/Quota)**.

| Method | Endpoint | Quyền truy cập (RBAC) | Mô tả chức năng |
| :---: | :--- | :---: | :--- |
| `GET` | `/api/v1/admin/dashboard/stats` | `ADMIN` | Thống kê số lượng GV, PH, Lớp học, Học sinh & Lượt gọi AI hôm nay |
| `GET` | `/api/v1/admin/users` | `ADMIN` | Phân trang danh sách người dùng (lọc theo role, status) |
| `GET` | `/api/v1/admin/users/:id` | `ADMIN` | Xem chi tiết thông tin và hồ sơ người dùng |
| `PATCH` | `/api/v1/admin/users/:id/ban` | `ADMIN` | **Khóa tài khoản** người dùng vi phạm chính sách |
| `PATCH` | `/api/v1/admin/users/:id/unban` | `ADMIN` | **Mở khóa tài khoản** khôi phục quyền truy cập |
| `GET` | `/api/v1/admin/classes` | `ADMIN` | Giám sát danh sách toàn bộ lớp học trên nền tảng |
| `GET` | `/api/v1/admin/system/limits` | `ADMIN` | Xem cấu hình hạn mức tài nguyên (số lớp, học sinh, AI) |
| `PUT` | `/api/v1/admin/system/limits` | `ADMIN` | Cập nhật hạn mức tài nguyên và hạn ngạch toàn hệ thống |

---

## 2. Chi Tiết Từng API

### 2.0. GET `/api/v1/admin/dashboard/stats` - Thống Kê Tổng Quan Nền Tảng
- **Mô tả:** Cung cấp số liệu tổng quan thời gian thực cho màn hình Dashboard Quản trị Web Next.js.
- **Headers:** `Authorization: Bearer <admin_token>`

#### Response Thành Công (HTTP 200 OK)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Lấy số liệu thống kê thành công",
  "data": {
    "total_teachers": 350,
    "total_parents": 4500,
    "total_classes": 120,
    "total_students": 4200,
    "ai_calls_today": 850
  },
  "timestamp": "2026-09-27T08:30:00.000Z"
}
```

---

### 2.1. GET `/api/v1/admin/users` - Danh Sách Người Dùng Toàn Hệ Thống
- **Query Params:** `page` (default: 1), `limit` (default: 20), `role` (`TEACHER_HOMEROOM`, `TEACHER_SUBJECT`, `PARENT`), `is_active` (`true`/`false`), `search` (tìm theo tên, email, SĐT).
- **Headers:** `Authorization: Bearer <admin_token>`

#### Response Thành Công (HTTP 200 OK)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Lấy danh sách người dùng thành công",
  "data": {
    "total": 1250,
    "page": 1,
    "limit": 20,
    "items": [
      {
        "uid": "usr_t01",
        "full_name": "Nguyễn Văn An",
        "email": "an.nguyen@school.edu.vn",
        "phone": "0988776655",
        "role": "TEACHER_HOMEROOM",
        "is_active": true,
        "created_at": "2026-09-01T08:00:00.000Z"
      }
    ]
  },
  "timestamp": "2026-09-27T08:30:00.000Z"
}
```

#### Response Thất Bại (HTTP 403 Forbidden - Không phải Admin)
```json
{
  "success": false,
  "status_code": 403,
  "message": "Bạn không có quyền truy cập vào chức năng này",
  "error_code": "AUTH_ROLE_FORBIDDEN",
  "details": null,
  "timestamp": "2026-09-27T08:30:00.000Z"
}
```

---

### 2.2. PATCH `/api/v1/admin/users/:id/ban` - Khóa Tài Khoản (Ban User)
- **Mô tả:** Vô hiệu hóa tài khoản trên Firebase Authentication (`disabled: true`) và cập nhật `is_active: false` trong Firestore collection `/users`. Ngay lập tức thu hồi mọi phiên đăng nhập của người dùng.
- **Headers:** `Authorization: Bearer <admin_token>`, `Content-Type: application/json`

#### Bảng Quy Định Dữ Liệu Đầu Vào (Input Specification)

| Tên trường (Field) | Vị trí | Bắt buộc / Tùy chọn | Phương thức nhập liệu | Kiểu dữ liệu & Ràng buộc validation |
| :--- | :---: | :---: | :---: | :--- |
| `id` | Path | **Bắt buộc** | Hệ thống truyền từ dòng chọn | Mã UID người dùng cần khóa. |
| `reason` | Body | **Bắt buộc** | **Gõ tự do từ bàn phím** | Chuỗi lý do khóa tài khoản (từ `5` đến `500` ký tự). Tự động `trim()`. Không được rỗng hoặc chỉ khoảng trắng. |
| `note` | Body | **Tùy chọn** (Optional) | **Gõ tự do từ bàn phím** | Ghi chú nội bộ ban quản trị (tối đa 255 ký tự). |

#### Request Body Hợp Lệ
```json
{
  "reason": "Vi phạm quy tắc bảo mật hoặc chia sẻ tài liệu sai quy định",
  "note": "Tạm khóa 14 ngày theo yêu cầu kiểm tra"
}
```

#### Response Thành Công (HTTP 200 OK)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Đã khóa tài khoản người dùng thành công",
  "data": {
    "uid": "usr_t01",
    "is_active": false,
    "banned_at": "2026-09-23T09:00:00.000Z",
    "ban_reason": "Vi phạm quy tắc bảo mật..."
  },
  "timestamp": "2026-09-27T08:30:00.000Z"
}
```

#### Response Thất Bại (HTTP 403 Forbidden - Không được ban Admin)
```json
{
  "success": false,
  "status_code": 403,
  "message": "Không thể khóa tài khoản có vai trò Quản trị viên cấp cao (ADMIN)",
  "error_code": "ADM_CANNOT_BAN_ADMIN",
  "details": null,
  "timestamp": "2026-09-27T08:30:00.000Z"
}
```

---

### 2.3. PATCH `/api/v1/admin/users/:id/unban` - Mở Khóa Tài Khoản (Unban User)
- **Mô tả:** Mở lại quyền truy cập cho tài khoản (`is_active: true`, kích hoạt lại trên Firebase Auth).

#### Response Thành Công (HTTP 200 OK)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Đã mở khóa tài khoản thành công",
  "timestamp": "2026-09-27T08:30:00.000Z"
}
```

---

### 2.4. GET `/api/v1/admin/classes` - Giám Sát Danh Sách Lớp Học
- **Mô tả:** Xem danh sách toàn bộ các lớp học tổng do GVCN mở, hỗ trợ kỹ thuật tra cứu mã mời và link mời khi phụ huynh gặp sự cố kết nối.

---

### 2.5. GET & PUT `/api/v1/admin/system/limits` - Cấu Hình Hạn Mức Toàn Hệ Thống
- **Mô tả:** Quản lý hạn ngạch tài nguyên nền tảng, lưu vào Firestore `/system_configs/limits`.

#### Request Body (PUT)
```json
{
  "max_classes_per_teacher": 10,
  "max_students_per_class": 60,
  "gemini_ai_daily_quota_per_teacher": 30,
  "max_upload_size_mb": 20
}
```

#### Response Thành Công (HTTP 200 OK)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Cập nhật cấu hình hạn mức tài nguyên thành công",
  "data": {
    "max_classes_per_teacher": 10,
    "max_students_per_class": 60,
    "gemini_ai_daily_quota_per_teacher": 30,
    "max_upload_size_mb": 20,
    "updated_at": "2026-09-23T09:15:00.000Z"
  },
  "timestamp": "2026-09-27T08:30:00.000Z"
}
```

---

## 3. Bảng Tổng Hợp Mã Lỗi Phân Hệ Admin
Theo chuẩn [api-response-codes.md](file:///e:/GiaoVienHay/docs/architecture/api-response-codes.md):

| HTTP Code | Error Code | Mô tả & Nguyên nhân |
| :---: | :--- | :--- |
| `400` | `ADM_ACCOUNT_ALREADY_BANNED` | Tài khoản người dùng này đã ở trạng thái bị khóa từ trước. |
| `400` | `ADM_ACCOUNT_ALREADY_ACTIVE` | Tài khoản đang hoạt động bình thường, không thể mở khóa lại. |
| `400` | `ADM_INVALID_LIMITS` | Thông số cấu hình hạn mức tài nguyên không hợp lệ (phải là số nguyên dương > 0). |
| `401` | `AUTH_TOKEN_INVALID` | Token quản trị viên không hợp lệ hoặc đã hết hạn. |
| `403` | `AUTH_ROLE_FORBIDDEN` | Tài khoản không có vai trò ADMIN. |
| `403` | `ADM_CANNOT_BAN_ADMIN` | Không thể khóa tài khoản có vai trò Quản trị viên cấp cao (ADMIN). |
| `404` | `USER_NOT_FOUND` | Không tìm thấy tài khoản người dùng yêu cầu. |
| `422` | `REQ_VALIDATION_ERROR` | Dữ liệu cấu hình gửi lên sai quy cách DTO validation. |
| `500` | `SYS_INTERNAL_ERROR` | Lỗi máy chủ nội bộ hoặc lỗi kết nối Firebase. |
