# TÀI LIỆU KỊCH BẢN KIỂM THỬ ĐƠN VỊ - PHÂN HỆ XÁC THỰC & PHIÊN LÀM VIỆC (AUTH)

# MÃ PHÂN HỆ: 01 - AUTHENTICATION & SESSION MODULE

# CẤP ĐỘ KIỂM THỬ: KIỂM THỬ ĐƠN VỊ (UNIT TEST)

---

## 1. THÔNG TIN CHUNG

- **PHÂN HỆ HỆ THỐNG:** `01` - Phân hệ Xác thực & Quản lý Phiên làm việc (Auth Module - `/api/v1/auth`)
- **MÔ TẢ MODULE API:** Quản lý đăng ký tài khoản mới (Giáo viên, Phụ huynh), Đăng nhập Email/SĐT và mật khẩu, Xác thực Firebase ID Token (OTP SMS / Social), Làm mới Access Token (Refresh Token) và Đăng xuất an toàn (`AuthService`, `AuthController`)
- **NGƯỜI THỰC HIỆN / VIẾT TESTCASE:** Kim Chi Ha
- **TẬP TIN KIỂM THỬ:** [API_Auth](https://github.com/gray8493/GiaoVienHay/tree/main/docs/apis/auth)
- **MÔI TRƯỜNG KIỂM THỬ:** Testing / Postman API Client

---

## 2. CHI TIẾT CÁC KỊCH BẢN KIỂM THỬ ĐƠN VỊ

---

### UT01_Auth_TC01 : ĐĂNG KÝ TÀI KHOẢN GIÁO VIÊN MỚI ĐẦY ĐỦ THÔNG TIN THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Email `teacher.lan@school.edu.vn` và số điện thoại `0912345678` chưa từng được đăng ký trong hệ thống.
  - Dịch vụ Firebase Authentication và Cloud Firestore hoạt động bình thường.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "full_name": "Nguyễn Thị Lan",
    "email": "teacher.lan@school.edu.vn",
    "phone": "0912345678",
    "password": "Password123@",
    "school_name": "Trường Tiểu Học Chu Văn An",
    "role": "TEACHER_HOMEROOM",
    "teaching_subjects": [
      "MATH",
      "LIT",
      "ETHICS"
    ]
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Cấu hình tiêu đề `Content-Type: application/json` trong mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/auth/register`.
  3. Thêm dữ liệu đăng ký giáo viên vào phần **Body** định dạng `raw (application/json)`.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  - Hệ thống phản hồi mã trạng thái **HTTP 201 (CREATED - ĐÃ TẠO THÀNH CÔNG)**.
  - Tạo tài khoản trên Firebase Authentication, gán Custom Claims `role: TEACHER_HOMEROOM`.
  - Khởi tạo tài liệu hồ sơ tại collection `/users/{uid}` trong Firestore với `is_active: true`.
  - Tự động sinh cặp `access_token` và `refresh_token` để người dùng vào thẳng màn hình chính.
  - Dữ liệu trả về đúng định dạng JSON chuẩn như sau:

  ```json
  {
    "success": true,
    "status_code": 201,
    "message": "Đăng ký tài khoản thành công",
    "data": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token_hop_le",
      "refresh_token": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "expires_in": 3600,
      "user": {
        "uid": "usr_teacher_lan_01",
        "full_name": "Nguyễn Thị Lan",
        "email": "teacher.lan@school.edu.vn",
        "phone": "0912345678",
        "school_name": "Trường Tiểu Học Chu Văn An",
        "role": "TEACHER_HOMEROOM",
        "teaching_subjects": [
          "MATH",
          "LIT",
          "ETHICS"
        ],
        "is_active": true,
        "created_at": "2026-09-27T10:00:00.000Z"
      }
    }
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT01_Auth_TC02 : ĐĂNG KÝ TÀI KHOẢN PHỤ HUYNH MỚI THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Số điện thoại `0987654321` và email `binh.tran@gmail.com` chưa tồn tại trong hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "full_name": "Trần Văn Bình",
    "phone": "0987654321",
    "email": "binh.tran@gmail.com",
    "password": "Password123@",
    "role": "PARENT"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Cấu hình tiêu đề `Content-Type: application/json` trong mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/auth/register`.
  3. Thêm dữ liệu đăng ký phụ huynh vào phần **Body**.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  - Hệ thống phản hồi mã trạng thái **HTTP 201 (CREATED - ĐÃ TẠO THÀNH CÔNG)**.
  - Tạo tài khoản phụ huynh trên Firebase Auth với vai trò `PARENT`.
  - Khởi tạo tài liệu tại `/users/{uid}` và cấp phát cặp Token truy cập.
  - Dữ liệu trả về đúng định dạng JSON chuẩn như sau:

  ```json
  {
    "success": true,
    "status_code": 201,
    "message": "Đăng ký tài khoản thành công",
    "data": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token_hop_le",
      "refresh_token": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "expires_in": 3600,
      "user": {
        "uid": "usr_parent_binh_01",
        "full_name": "Trần Văn Bình",
        "email": "binh.tran@gmail.com",
        "phone": "0987654321",
        "role": "PARENT",
        "is_active": true,
        "created_at": "2026-09-27T10:00:00.000Z"
      }
    }
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT01_Auth_TC03 : TỪ CHỐI ĐĂNG KÝ GIÁO VIÊN KHI THIẾU TÊN TRƯỜNG VÀ MÔN GIẢNG DẠY

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Người dùng chọn vai trò Giáo viên (`role: TEACHER_HOMEROOM` hoặc `TEACHER_SUBJECT`).
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "full_name": "Lê Văn Cường",
    "email": "cuong.le@school.edu.vn",
    "phone": "0933445566",
    "password": "Password123@",
    "role": "TEACHER_HOMEROOM"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Cấu hình tiêu đề `Content-Type: application/json` trong mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/auth/register`.
  3. Thêm dữ liệu đăng ký thiếu trường `school_name` và `teaching_subjects` vào phần **Body**.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  - Hệ thống ném ra ngoại lệ **HTTP 400 (BAD REQUEST - YÊU CẦU KHÔNG HỢP LỆ)**.
  - Tuyệt đối không tạo tài khoản trên Firebase Auth.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:

  ```json
  {
    "success": false,
    "status_code": 400,
    "message": "Thông tin hồ sơ chưa đầy đủ thông tin bắt buộc",
    "error_code": "USER_PROFILE_INCOMPLETE",
    "details": [
      {
        "field": "school_name",
        "issue": "Tên trường công tác là bắt buộc đối với giáo viên"
      },
      {
        "field": "teaching_subjects",
        "issue": "Danh sách môn giảng dạy không được để trống"
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT01_Auth_TC04 : TỪ CHỐI ĐĂNG KÝ KHI EMAIL HOẶC SỐ ĐIỆN THOẠI ĐÃ TỒN TẠI

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Email `teacher.lan@school.edu.vn` đã được đăng ký trước đó trong hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "full_name": "Nguyễn Thị Lan Trùng",
    "email": "teacher.lan@school.edu.vn",
    "phone": "0912345678",
    "password": "Password123@",
    "school_name": "Trường Tiểu Học Chu Văn An",
    "role": "TEACHER_HOMEROOM",
    "teaching_subjects": [
      "MATH"
    ]
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền thông tin đăng ký chứa Email trùng lặp vào phần **Body**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/auth/register`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  - Hệ thống phản hồi mã trạng thái **HTTP 409 (CONFLICT - XUNG ĐỘT DỮ LIỆU)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:

  ```json
  {
    "success": false,
    "status_code": 409,
    "message": "Địa chỉ email này đã được sử dụng cho một tài khoản khác",
    "error_code": "USER_EMAIL_EXISTS",
    "details": null,
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT01_Auth_TC05 : ĐĂNG NHẬP BẰNG EMAIL VÀ MẬT KHẨU CHÍNH XÁC THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Tài khoản `teacher.lan@school.edu.vn` tồn tại trên hệ thống và ở trạng thái kích hoạt (`is_active: true`).
  - Mật khẩu thiết lập là `Password123@`.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "identifier": "teacher.lan@school.edu.vn",
    "password": "Password123@"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Cấu hình tiêu đề `Content-Type: application/json` trong mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/auth/login`.
  3. Thêm thông tin đăng nhập vào phần **Body** định dạng `raw (application/json)`.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Xác thực mật khẩu thành công qua Firebase Auth.
  - Cấp phát Access Token (thời hạn 3600 giây) và Refresh Token kèm thông tin người dùng.
  - Dữ liệu trả về đúng định dạng JSON chuẩn:

  ```json
  {
    "success": true,
    "status_code": 200,
    "message": "Đăng nhập thành công",
    "data": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token_hop_le",
      "refresh_token": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "expires_in": 3600,
      "user": {
        "uid": "usr_teacher_lan_01",
        "email": "teacher.lan@school.edu.vn",
        "phone": "0912345678",
        "full_name": "Nguyễn Thị Lan",
        "role": "TEACHER_HOMEROOM",
        "teaching_subjects": [
          "MATH",
          "LIT"
        ]
      }
    }
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT01_Auth_TC06 : TỪ CHỐI ĐĂNG NHẬP KHI SAI MẬT KHẨU HOẶC TÀI KHOẢN KHÔNG TỒN TẠI

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Người dùng nhập mật khẩu không khớp hoặc tài khoản chưa từng đăng ký.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "identifier": "teacher.lan@school.edu.vn",
    "password": "SaiMatKhau123@"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền thông tin tài khoản kèm mật khẩu sai vào phần **Body**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/auth/login`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  - Hệ thống ném ra ngoại lệ **HTTP 401 (UNAUTHORIZED - TỪ CHỐI XÁC THỰC)**.
  - Tuyệt đối không cấp phát bất kỳ Token nào.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:

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
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT01_Auth_TC07 : CHẶN ĐĂNG NHẬP KHI TÀI KHOẢN NGƯỜI DÙNG ĐANG BỊ KHÓA

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Tài khoản `banned.user@school.edu.vn` đã bị Quản trị viên khóa (`is_active: false` trong Firestore).
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "identifier": "banned.user@school.edu.vn",
    "password": "Password123@"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền thông tin đăng nhập của tài khoản bị khóa vào phần **Body**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/auth/login`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  - Hệ thống ném ra ngoại lệ **HTTP 403 (FORBIDDEN - TÀI KHOẢN BỊ KHÓA)**.
  - Chặn đăng nhập và hiển thị thông báo tài khoản bị khóa.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:

  ```json
  {
    "success": false,
    "status_code": 403,
    "message": "Tài khoản của bạn đã bị khóa bởi Quản trị viên",
    "error_code": "AUTH_ACCOUNT_LOCKED",
    "details": null,
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT01_Auth_TC08 : XÁC THỰC FIREBASE ID TOKEN THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Ứng dụng Client đã xác minh OTP SMS thành công qua Firebase SDK và nhận về chuỗi `id_token` hợp lệ.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEyMzQ1NiIsInR5cCI6IkpXVCJ9.valid_firebase_id_token"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Cấu hình tiêu đề `Content-Type: application/json` trong mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/auth/firebase-verify`.
  3. Thêm chuỗi Firebase ID Token vào phần **Body**.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Backend xác thực chữ ký token qua Firebase Admin SDK, kiểm tra và đồng bộ Custom Claims vai trò.
  - Dữ liệu trả về đúng định dạng JSON chuẩn:

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
        "student_ids": [
          "stu_001"
        ]
      }
    }
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT01_Auth_TC09 : LÀM MỚI PHIÊN LÀM VIỆC BẰNG REFRESH TOKEN HỢP LỆ THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Phiên làm việc của người dùng vẫn còn hợp lệ trong hệ thống và sở hữu `refresh_token` còn thời hạn.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "refresh_token": "f47ac10b-58cc-4372-a567-0e02b2c3d479"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Cấu hình tiêu đề `Content-Type: application/json` trong mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/auth/refresh-token`.
  3. Thêm giá trị `refresh_token` vào phần **Body**.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Cấp phát một Access Token mới có thời hạn 3600 giây.
  - Dữ liệu trả về đúng định dạng JSON chuẩn:

  ```json
  {
    "success": true,
    "status_code": 200,
    "message": "Làm mới phiên thành công",
    "data": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new_access_token",
      "expires_in": 3600
    }
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT01_Auth_TC10 : ĐĂNG XUẤT KHỎI HỆ THỐNG VÀ THU HỒI PHIÊN LÀM VIỆC THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Người dùng đang đăng nhập với Bearer Access Token hợp lệ.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_nguoi_dung_dang_dang_nhap>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {}
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã `Bearer Token` vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/auth/logout`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Thu hồi phiên làm việc, vô hiệu hóa Access Token và xóa Refresh Token tương ứng.
  - Dữ liệu trả về đúng định dạng JSON chuẩn:

  ```json
  {
    "success": true,
    "status_code": 200,
    "message": "Đăng xuất thành công"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**
