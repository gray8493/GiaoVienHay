# Đặc Tả API Phân Hệ Quản Trị Nền Tảng (Platform Admin API Specification)
# Module: Admin (`/api/v1/admin`) - Dành Riêng Cho Web Next.js Admin Portal

---

## 1. Tổng Quan Phân Hệ
Phân hệ **Admin** được phát triển **chỉ dành riêng cho Quản trị viên Nền tảng (Platform Admin - "chúng tôi")** trên ứng dụng **Web Next.js**. Phân hệ tập trung vào 3 trụ cột kỹ thuật: **CRUD dữ liệu người dùng**, **Khóa/Mở khóa tài khoản (Ban/Unban)**, và **Cấu hình hạn ngạch tài nguyên hệ thống (Limit/Quota)**.

| Method | Endpoint | Quyền truy cập (RBAC) | Mô tả chức năng |
| :---: | :--- | :---: | :--- |
| `GET` | `/api/v1/admin/users` | `ADMIN` | Phân trang danh sách người dùng (lọc theo role, status) |
| `GET` | `/api/v1/admin/users/:id` | `ADMIN` | Xem chi tiết thông tin và hồ sơ người dùng |
| `PATCH` | `/api/v1/admin/users/:id/ban` | `ADMIN` | **Khóa tài khoản** người dùng vi phạm chính sách |
| `PATCH` | `/api/v1/admin/users/:id/unban` | `ADMIN` | **Mở khóa tài khoản** khôi phục quyền truy cập |
| `GET` | `/api/v1/admin/classes` | `ADMIN` | Giám sát danh sách toàn bộ lớp học trên nền tảng |
| `GET` | `/api/v1/admin/system/limits` | `ADMIN` | Xem cấu hình hạn mức tài nguyên (số lớp, học sinh, AI) |
| `PUT` | `/api/v1/admin/system/limits` | `ADMIN` | Cập nhật hạn mức tài nguyên và hạn ngạch toàn hệ thống |

---

## 2. Chi Tiết Từng API

### 2.1. GET `/api/v1/admin/users` - Danh Sách Người Dùng Toàn Hệ Thống
- **Query Params:** `page` (default: 1), `limit` (default: 20), `role` (`TEACHER_HOMEROOM`, `TEACHER_SUBJECT`, `PARENT`), `is_active` (`true`/`false`), `search` (tìm theo tên, email, SĐT).
- **Headers:** `Authorization: Bearer <admin_token>`

#### Response Thành Công (HTTP 200 OK)
```json
{
  "success": true,
  "status_code": 200,
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
  }
}
```

---

### 2.2. PATCH `/api/v1/admin/users/:id/ban` - Khóa Tài Khoản (Ban User)
- **Mô tả:** Vô hiệu hóa tài khoản trên Firebase Authentication (`disabled: true`) và cập nhật `is_active: false` trong Firestore collection `/users`. Ngay lập tức thu hồi mọi phiên đăng nhập của người dùng.
- **Request Body:**
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
  }
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
  "message": "Đã mở khóa tài khoản thành công"
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
  }
}
```
