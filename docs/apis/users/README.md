# Đặc Tả API Phân Hệ Người Dùng & Hồ Sơ (Users API Specification)
# Module: Users (`/api/v1/users`)

---

## 1. Tổng Quan Phân Hệ
Phân hệ **Users** cung cấp các API quản lý thông tin tài khoản, cập nhật hồ sơ cá nhân của Giáo viên và Phụ huynh, cấu hình môn học trực tiếp giảng dạy (`teaching_subjects`), và đăng ký thiết bị nhận thông báo đẩy qua Firebase Cloud Messaging.

| Method | Endpoint | Quyền truy cập (RBAC) | Mô tả chức năng |
| :---: | :--- | :---: | :--- |
| `GET` | `/api/v1/users/me` | Authenticated | Lấy thông tin chi tiết của người dùng đang đăng nhập |
| `PATCH` | `/api/v1/users/profile` | Authenticated | Cập nhật hồ sơ cá nhân; chọn môn giảng dạy (`teaching_subjects`) |
| `POST` | `/api/v1/users/device-token` | Authenticated | Đăng ký hoặc làm mới FCM Device Token để nhận Push Notification |

---

## 2. Chi Tiết Từng API

### 2.1. GET `/api/v1/users/me` - Lấy Thông Tin Cá Nhân
- **Mô tả:** Truy xuất toàn bộ thông tin tài khoản, vai trò và quyền hạn của người dùng hiện tại từ Firestore collection `/users/{uid}`.
- **Headers:** `Authorization: Bearer <access_token>`

#### Response Thành Công (HTTP 200 OK)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Lấy thông tin tài khoản thành công",
  "data": {
    "uid": "usr_teacher_lan",
    "email": "teacher.lan@school.edu.vn",
    "phone": "0912345678",
    "full_name": "Nguyễn Thị Lan",
    "school_name": "Trường Tiểu Học Chu Văn An",
    "role": "TEACHER_HOMEROOM",
    "avatar_url": "https://storage.googleapis.com/.../avatar.jpg",
    "teaching_subjects": ["MATH", "LIT", "ETHICS"],
    "is_active": true,
    "created_at": "2026-09-01T08:00:00.000Z"
  }
}
```

---

### 2.2. PATCH `/api/v1/users/profile` - Cập Nhật Hồ Sơ & Môn Học Giảng Dạy
- **Mô tả:** Cho phép người dùng cập nhật họ tên, trường công tác (`school_name`), ảnh đại diện. Đặc biệt đối với Giáo viên (GVCN & GVBM), cho phép **chọn 1 hoặc nhiều môn học trực tiếp giảng dạy** (`teaching_subjects`).
  - *GVCN Cấp 1:* Thường chọn nhiều môn (Toán, Tiếng Việt, TNXH...).
  - *GVCN Cấp 2 hoặc GVBM:* Chọn môn chuyên môn của mình.
- **Headers:** `Authorization: Bearer <access_token>`, `Content-Type: application/json`

#### Bảng Quy Định Dữ Liệu Đầu Vào (Input Specification)

| Tên trường (Field) | Vị trí | Bắt buộc / Tùy chọn | Phương thức nhập liệu | Kiểu dữ liệu & Ràng buộc validation |
| :--- | :---: | :---: | :---: | :--- |
| `full_name` | Body | **Tùy chọn** (Optional) | **Gõ tự do từ bàn phím** | Chuỗi `2 - 100` ký tự. Tự động `trim()`. Không chứa ký tự đặc biệt nguy hiểm. |
| `school_name` | Body | **Tùy chọn** (Optional) | **Gõ bàn phím / Chọn gợi ý** | Chuỗi `5 - 150` ký tự. Tên trường công tác của giáo viên. |
| `avatar_url` | Body | **Tùy chọn** (Optional) | **Chọn ảnh từ máy tải lên Storage** | Chuỗi URL hợp lệ định dạng `https://storage.googleapis.com/...` |
| `teaching_subjects` | Body | **Tùy chọn** (Optional) | **Chọn danh sách UI Multi-Select** | Mảng mã môn học giảng dạy (VD: `["MATH", "LIT"]`). Các mã môn phải nằm trong danh mục đào tạo của trường. |

#### Request Body Hợp Lệ
```json
{
  "full_name": "Nguyễn Thị Lan",
  "school_name": "Trường Tiểu Học Chu Văn An",
  "avatar_url": "https://storage.googleapis.com/.../new_avatar.jpg",
  "teaching_subjects": ["MATH", "LIT", "ETHICS"]
}
```

#### Response Thành Công (HTTP 200 OK)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Cập nhật hồ sơ thành công",
  "data": {
    "uid": "usr_teacher_lan",
    "full_name": "Nguyễn Thị Lan",
    "teaching_subjects": ["MATH", "LIT", "ETHICS"],
    "updated_at": "2026-09-23T08:30:00.000Z"
  }
}
```

---

### 2.3. POST `/api/v1/users/device-token` - Đăng Ký Thiết Bị Nhận FCM
- **Mô tả:** Thiết bị di động (React Native App) sau khi khởi tạo Firebase Messaging SDK sẽ gửi FCM Device Token lên máy chủ để nhận thông báo đẩy.
- **Headers:** `Authorization: Bearer <access_token>`, `Content-Type: application/json`

#### Request Body
```json
{
  "fcm_token": "eX_910...fcm_device_token_here",
  "device_platform": "IOS",
  "device_name": "iPhone 15 Pro"
}
```

#### Response Thành Công (HTTP 200 OK)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Đăng ký thiết bị nhận thông báo thành công"
}
```
- **Ràng buộc Firestore:** Token được thêm vào mảng `fcm_tokens` trong document `/users/{uid}` bằng toán tử `FieldValue.arrayUnion()`.

#### Response Thất Bại Thường Gặp
##### Danh sách môn dạy không hợp lệ (HTTP 400 Bad Request)
```json
{
  "success": false,
  "status_code": 400,
  "message": "Dữ liệu hồ sơ cập nhật không hợp lệ",
  "error_code": "COMMON_VALIDATION_ERROR",
  "details": [
    {
      "field": "teaching_subjects",
      "issue": "Mã môn học 'INVALID_SUBJECT' không tồn tại trong hệ thống chương trình đào tạo"
    }
  ],
  "timestamp": "2026-09-27T08:30:00.000Z"
}
```

##### Token hết hạn hoặc không hợp lệ (HTTP 401 Unauthorized)
```json
{
  "success": false,
  "status_code": 401,
  "message": "Phiên đăng nhập đã hết hạn hoặc không hợp lệ",
  "error_code": "AUTH_TOKEN_EXPIRED",
  "details": null,
  "timestamp": "2026-09-27T08:30:00.000Z"
}
```

---

## 3. Bảng Tổng Hợp Mã Lỗi Phân Hệ Users

| HTTP Status | Mã Lỗi (`error_code`) | Ý nghĩa & Tình huống xảy ra |
| :---: | :--- | :--- |
| `400` | `COMMON_VALIDATION_ERROR` | Dữ liệu cập nhật hồ sơ hoặc FCM token không đúng định dạng. |
| `401` | `AUTH_UNAUTHORIZED` | Bearer token không tồn tại. |
| `401` | `AUTH_TOKEN_EXPIRED` | Bearer token đã quá thời hạn hiệu lực. |
| `403` | `AUTH_FORBIDDEN` | Tài khoản bị tạm khóa hoặc không có quyền thao tác. |
| `404` | `USER_NOT_FOUND` | Không tìm thấy hồ sơ người dùng trong Firestore. |
| `500` | `SYS_INTERNAL_ERROR` | Lỗi máy chủ cơ sở dữ liệu nội bộ. |

