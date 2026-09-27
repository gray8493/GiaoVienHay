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

#### Bảng Quy Định Dữ Liệu Đầu Vào (Input Specification)

| Tên trường (Field) | Vị trí | Bắt buộc / Tùy chọn | Phương thức nhập liệu | Kiểu dữ liệu & Ràng buộc validation |
| :--- | :---: | :---: | :---: | :--- |
| `full_name` | Body | **Bắt buộc** | **Gõ tự do từ bàn phím** | Chuỗi `2 - 100` ký tự. Tự động `trim()`. Không chứa ký tự đặc biệt nguy hiểm hoặc số. |
| `phone` | Body | **Bắt buộc** | **Gõ bàn phím** | Chuỗi `10` chữ số chuẩn Việt Nam (Bắt đầu bằng `03`, `05`, `07`, `08`, `09` - Regex: `^0[35789]\d{8}$`). |
| `email` | Body | **Bắt buộc với GV**, Tùy chọn với PH | **Gõ bàn phím** | Chuỗi email hợp lệ theo chuẩn RFC 5322 (Regex: `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`). |
| `password` | Body | **Bắt buộc** | **Gõ bàn phím (Ẩn ký tự)** | Chuỗi `8 - 64` ký tự. Tối thiểu: 1 chữ hoa, 1 chữ thường, 1 chữ số, 1 ký tự đặc biệt (`@$!%*?&`). |
| `school_name` | Body | **Bắt buộc với GV**, Không áp dụng với PH | **Gõ bàn phím / Chọn gợi ý** | Tên trường đang công tác (Chuỗi `5 - 150` ký tự). |
| `role` | Body | **Bắt buộc** | **Chọn nút bấm UI (Radio Chip)** | Enum chỉ định: `TEACHER_HOMEROOM` (GVCN), `TEACHER_SUBJECT` (GVBM), hoặc `PARENT` (Phụ huynh). |
| `teaching_subjects` | Body | **Bắt buộc với GV**, Không áp dụng với PH | **Chọn danh sách UI (Multi-Select)** | Mảng mã môn học hợp lệ (`minItems: 1` đối với GV). Ví dụ: `["MATH", "LIT"]`. |

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

#### Các Response Thất Bại & Lỗi Validation Chi Tiết

##### 1. Mật khẩu không đủ mạnh (HTTP 400 Bad Request)
> **Tình huống:** Người dùng gõ mật khẩu quá ngắn hoặc thiếu ký tự đặc biệt (`pass123`):
```json
{
  "success": false,
  "status_code": 400,
  "message": "Mật khẩu không đáp ứng tiêu chuẩn an toàn bảo mật",
  "error_code": "COMMON_VALIDATION_ERROR",
  "details": [
    {
      "field": "password",
      "issue": "Mật khẩu phải từ 8 ký tự trở lên, gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt (@$!%*?&)"
    }
  ],
  "timestamp": "2026-09-27T08:30:00.000Z"
}
```

##### 2. Số điện thoại sai định dạng mạng viễn thông Việt Nam (HTTP 400 Bad Request)
> **Tình huống:** Gõ số điện thoại không đúng 10 số hoặc đầu số không tồn tại (`0123456789`):
```json
{
  "success": false,
  "status_code": 400,
  "message": "Số điện thoại không hợp lệ",
  "error_code": "COMMON_VALIDATION_ERROR",
  "details": [
    {
      "field": "phone",
      "issue": "Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng các đầu số di động hợp lệ (03, 05, 07, 08, 09)"
    }
  ],
  "timestamp": "2026-09-27T08:30:00.000Z"
}
```

##### 3. Giáo viên không nhập tên trường hoặc môn giảng dạy (HTTP 400 Bad Request)
```json
{
  "success": false,
  "status_code": 400,
  "message": "Thông tin hồ sơ giáo viên chưa đầy đủ",
  "error_code": "COMMON_VALIDATION_ERROR",
  "details": [
    {
      "field": "school_name",
      "issue": "Tên trường công tác là bắt buộc đối với tài khoản Giáo viên"
    },
    {
      "field": "teaching_subjects",
      "issue": "Giáo viên phải chọn ít nhất 1 môn học trực tiếp giảng dạy"
    }
  ],
  "timestamp": "2026-09-27T08:30:00.000Z"
}
```

##### 4. Email đã tồn tại trong hệ thống (HTTP 409 Conflict)
```json
{
  "success": false,
  "status_code": 409,
  "message": "Địa chỉ email này đã được sử dụng cho một tài khoản khác",
  "error_code": "USER_EMAIL_EXISTS",
  "details": [
    {
      "field": "email",
      "issue": "Email đã tồn tại trong hệ thống"
    }
  ],
  "timestamp": "2026-09-27T08:30:00.000Z"
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
  },
  "timestamp": "2026-09-27T08:30:00.000Z"
}
```

#### Response Lỗi (HTTP 401 Unauthorized)
```json
{
  "success": false,
  "status_code": 401,
  "message": "Email hoặc mật khẩu không chính xác",
  "error_code": "AUTH_INVALID_CREDENTIALS",
  "details": null,
  "timestamp": "2026-09-27T08:30:00.000Z"
}
```

---

### 2.3. POST `/api/v1/auth/firebase-verify` - Xác Thực Firebase ID Token
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
  },
  "timestamp": "2026-09-27T08:30:00.000Z"
}
```

---

### 2.4. POST `/api/v1/auth/refresh-token` - Làm Mới Phiên Làm Việc
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
  },
  "timestamp": "2026-09-27T08:30:00.000Z"
}
```

---

### 2.5. POST `/api/v1/auth/logout` - Đăng Xuất
- **Mô tả:** Đăng xuất tài khoản và vô hiệu hóa phiên làm việc.
- **Headers:** `Authorization: Bearer <access_token>`

#### Response Thành Công (HTTP 200 OK)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Đăng xuất thành công",
  "timestamp": "2026-09-27T08:30:00.000Z"
}
```

---

## 3. Bảng Tổng Hợp Mã Lỗi Phân Hệ Auth
Theo chuẩn [api-response-codes.md](file:///e:/GiaoVienHay/docs/architecture/api-response-codes.md):

| HTTP Code | Error Code | Mô tả gợi ý |
| :---: | :--- | :--- |
| `400` | `REQ_VALIDATION_ERROR` | Thiếu trường bắt buộc hoặc sai định dạng DTO. |
| `401` | `AUTH_INVALID_CREDENTIALS` | Email hoặc mật khẩu không chính xác. |
| `401` | `AUTH_TOKEN_EXPIRED` | Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại hoặc làm mới token. |
| `401` | `AUTH_TOKEN_INVALID` | Token xác thực không hợp lệ hoặc đã bị thu hồi. |
| `403` | `AUTH_ACCOUNT_LOCKED` | Tài khoản của bạn đã bị khóa bởi Quản trị viên. |
| `403` | `AUTH_ROLE_FORBIDDEN` | Bạn không có quyền truy cập vào chức năng này. |
| `409` | `USER_EMAIL_EXISTS` | Địa chỉ email này đã được sử dụng cho một tài khoản khác. |
| `409` | `USER_PHONE_EXISTS` | Số điện thoại này đã được sử dụng. |
| `500` | `SYS_INTERNAL_ERROR` | Lỗi máy chủ nội bộ hoặc lỗi kết nối Firebase Auth. |
