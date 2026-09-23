# Đặc Tả API Phân Hệ Xác Thực & Phiên Làm Việc (Auth API Specification)
# Module: Auth (`/api/v1/auth`)

---

## 1. Tổng Quan Phân Hệ
Phân hệ **Auth** quản lý toàn bộ chu trình xác thực danh tính người dùng (Admin, Giáo viên chủ nhiệm, Giáo viên bộ môn, Phụ huynh) dựa trên nền tảng **Firebase Authentication** kết hợp Custom Claims và JWT Session.

| Method | Endpoint | Quyền truy cập (RBAC) | Mô tả chức năng |
| :---: | :--- | :---: | :--- |
| `POST` | `/api/v1/auth/register` | Public | Đăng ký tài khoản người dùng mới (Giáo viên / Phụ huynh) |
| `POST` | `/api/v1/auth/login` | Public | Đăng nhập bằng Email/Password hoặc SĐT nhận OTP |
| `POST` | `/api/v1/auth/firebase-verify` | Public (Token Firebase) | Xác thực Firebase ID Token & Đồng bộ Custom Claims |
| `POST` | `/api/v1/auth/refresh-token` | Public (Refresh Token) | Làm mới phiên làm việc khi Access Token hết hạn |
| `POST` | `/api/v1/auth/logout` | Authenticated | Đăng xuất khỏi hệ thống |

---

## 2. Chi Tiết Từng API

### 2.1. POST `/api/v1/auth/register` - Đăng Ký Tài Khoản Mới
- **Mô tả:** Cho phép **Giáo viên** (GVCN, GVBM) hoặc **Phụ huynh** khởi tạo tài khoản mới trên hệ thống. 
  - **Với Giáo viên:** Bắt buộc cung cấp **Tên trường giảng dạy (`school_name`)** và **Danh sách môn giảng dạy (`teaching_subjects`)**.
  - **Với Phụ huynh:** Đăng ký bằng Số điện thoại hoặc Email, không cần nhập trường lớp (trường và lớp sẽ tự động được liên kết khi Phụ huynh nhấp vào Link mời của GVCN).
- **Headers:** `Content-Type: application/json`

#### Bảng Quy Định Các Trường Dữ Liệu Khi Đăng Ký:

| Trường (Field) | Kiểu dữ liệu | Bắt buộc đối với | Mô tả & Quy tắc kiểm tra (Validation) |
| :--- | :---: | :---: | :--- |
| **`full_name`** | `string` | Cả GV & PH | Họ và tên đầy đủ của người đăng ký (Ví dụ: `"Nguyễn Thị Lan"`). |
| **`phone`** | `string` | Cả GV & PH | Số điện thoại nhận OTP / liên hệ khẩn cấp (10 số, định dạng chuẩn VN). |
| **`email`** | `string` | Bắt buộc với GV | Địa chỉ email đăng nhập và nhận thông báo công việc (Ví dụ: `"lan.nguyen@school.edu.vn"`). |
| **`password`** | `string` | Cả GV & PH | Mật khẩu tài khoản (tối thiểu 8 ký tự, gồm ít nhất 1 chữ hoa và 1 số). |
| **`school_name`** | `string` | **BẮT BUỘC VỚI GIÁO VIÊN** | **Tên trường nơi giáo viên đang trực tiếp công tác/giảng dạy** (Ví dụ: `"Trường Tiểu học Chu Văn An"`, `"Trường THCS Trần Hưng Đạo"`). |
| **`role`** | `string` | Cả GV & PH | Vai trò đăng ký: `"TEACHER_HOMEROOM"` (GVCN), `"TEACHER_SUBJECT"` (GVBM), hoặc `"PARENT"` (Phụ huynh). |
| **`teaching_subjects`** | `array of string` | Bắt buộc với GV | Danh sách **1 hoặc nhiều môn học trực tiếp giảng dạy**:<br>- *GV Cấp 1:* Chọn nhiều môn (`["MATH", "LIT", "ETHICS", "SCI"]`).<br>- *GV Cấp 2:* Chọn 1 hoặc nhiều môn chuyên môn (`["MATH"]` hoặc `["ENG"]`). |

---

#### Request Body Mẫu 1: Dành Cho Giáo Viên (Có Tên Trường & Môn Dạy)
```json
{
  "full_name": "Nguyễn Thị Lan",
  "email": "teacher.lan@school.edu.vn",
  "phone": "0912345678",
  "password": "Password123@",
  "school_name": "Trường Tiểu Học Chu Văn An",
  "role": "TEACHER_HOMEROOM",
  "teaching_subjects": ["MATH", "LIT", "ETHICS"]
}
```

#### Request Body Mẫu 2: Dành Cho Phụ Huynh
```json
{
  "full_name": "Trần Văn Bình",
  "phone": "0987654321",
  "email": "binh.tran@gmail.com",
  "password": "Password123@",
  "role": "PARENT"
}
```

#### Response Thành Công (HTTP 201 Created)
```json
{
  "success": true,
  "status_code": 201,
  "message": "Đăng ký tài khoản thành công",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "expires_in": 3600,
    "user": {
      "uid": "usr_teacher_lan_01",
      "full_name": "Nguyễn Thị Lan",
      "email": "teacher.lan@school.edu.vn",
      "phone": "0912345678",
      "school_name": "Trường Tiểu Học Chu Văn An",
      "role": "TEACHER_HOMEROOM",
      "teaching_subjects": ["MATH", "LIT", "ETHICS"],
      "is_active": true,
      "created_at": "2026-09-23T10:00:00.000Z"
    }
  }
}
```

#### Response Lỗi (HTTP 409 Conflict)
```json
{
  "success": false,
  "status_code": 409,
  "message": "Email hoặc số điện thoại đã được đăng ký trên hệ thống",
  "error_code": "AUTH_USER_ALREADY_EXISTS"
}
```

---

### 2.2. POST `/api/v1/auth/login` - Đăng Nhập Hệ Thống
- **Mô tả:** Xác thực danh tính người dùng bằng email hoặc số điện thoại.
- **Headers:** `Content-Type: application/json`

#### Request Body
```json
{
  "identifier": "teacher.lan@school.edu.vn",
  "password": "Password123@"
}
```

#### Response Thành Công (HTTP 200 OK)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Đăng nhập thành công",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "expires_in": 3600,
    "user": {
      "uid": "usr_teacher_01",
      "email": "teacher.lan@school.edu.vn",
      "phone": "0912345678",
      "full_name": "Nguyễn Thị Lan",
      "role": "TEACHER_HOMEROOM",
      "teaching_subjects": ["MATH", "LIT"]
    }
  }
}
```

#### Response Lỗi (HTTP 401 Unauthorized)
```json
{
  "success": false,
  "status_code": 401,
  "message": "Thông tin đăng nhập không chính xác hoặc tài khoản đã bị khóa",
  "error_code": "AUTH_INVALID_CREDENTIALS"
}
```

---

### 2.2. POST `/api/v1/auth/firebase-verify` - Xác Thực Firebase ID Token
- **Mô tả:** Client sau khi đăng nhập thành công qua Firebase SDK trên máy (SMS OTP hoặc Social Login) gửi ID Token lên NestJS để xác minh và đồng bộ vai trò RBAC.
- **Headers:** `Content-Type: application/json`

#### Request Body
```json
{
  "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEyMzQ1NiI..."
}
```

#### Response Thành Công (HTTP 200 OK)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Xác thực Firebase Token thành công",
  "data": {
    "uid": "usr_parent_99",
    "role": "PARENT",
    "custom_claims": {
      "role": "PARENT",
      "student_ids": ["stu_001"]
    }
  }
}
```

---

### 2.3. POST `/api/v1/auth/refresh-token` - Làm Mới Phiên Làm Việc
- **Mô tả:** Cấp lại Access Token mới khi token cũ hết hạn.
- **Request Body:**
```json
{
  "refresh_token": "f47ac10b-58cc-4372-a567-0e02b2c3d479"
}
```

#### Response Thành Công (HTTP 200 OK)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Làm mới phiên thành công",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9_NEW...",
    "expires_in": 3600
  }
}
```

---

### 2.4. POST `/api/v1/auth/logout` - Đăng Xuất
- **Mô tả:** Đăng xuất tài khoản và vô hiệu hóa phiên làm việc.
- **Headers:** `Authorization: Bearer <access_token>`

#### Response Thành Công (HTTP 200 OK)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Đăng xuất thành công"
}
```
