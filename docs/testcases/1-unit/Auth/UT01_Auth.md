# TÀI LIỆU KỊCH BẢN KIỂM THỬ ĐƠN VỊ - PHÂN HỆ XÁC THỰC & PHIÊN LÀM VIỆC (AUTH)

# MÃ PHÂN HỆ: 01 - AUTHENTICATION & SESSION MODULE

# CẤP ĐỘ KIỂM THỬ: KIỂM THỬ ĐƠN VỊ (UNIT TEST)

---

## 1. THÔNG TIN CHUNG

- **PHÂN HỆ HỆ THỐNG:** `01` - Phân hệ Xác thực & Quản lý Phiên làm việc (Auth Module - `/api/v1/auth`)
- **MÔ TẢ MODULE API:** Quản lý đăng ký tài khoản người dùng mới (Giáo viên, Phụ huynh), Đăng nhập bằng Email/SĐT và mật khẩu, Xác thực Firebase ID Token (OTP SMS / Social Login), Làm mới Access Token (Refresh Token) và Đăng xuất an toàn (`AuthService`, `AuthController`).
- **NGƯỜI THỰC HIỆN / VIẾT TESTCASE:** Kim Chi Ha
- **TẬP TIN ĐẶC TẢ API:** [API_Auth](https://github.com/gray8493/GiaoVienHay/tree/main/docs/apis/auth)
- **MÔI TRƯỜNG KIỂM THỬ:** Testing / Postman API Client / Jest Unit Testing

---

## 2. CHI TIẾT CÁC KỊCH BẢN KIỂM THỬ ĐƠN VỊ

---

### PHẦN I: CÁC KỊCH BẢN KIỂM THỬ THẤT BẠI & BÁO LỖI (NEGATIVE / FALSE CASES)

---

#### 1. Nhóm Kịch Bản Thiếu Các Trường Bắt Buộc (Missing Required Fields Validation)

---

##### UT01_Auth_TC01 : TỪ CHỐI ĐĂNG KÝ TÀI KHOẢN KHI KHÔNG NHẬP HOẶC ĐỂ TRỐNG HỌ TÊN (MISSING FULL_NAME)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Người dùng truy cập màn hình đăng ký tài khoản.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):** Để trống trường `full_name`:
  ```json
  {
    "full_name": "",
    "email": "teacher.lan@school.edu.vn",
    "phone": "0912345678",
    "password": "Password123@",
    "role": "TEACHER_HOMEROOM",
    "school_name": "Trường Tiểu Học Chu Văn An",
    "teaching_subjects": ["MATH"]
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Cấu hình tiêu đề `Content-Type: application/json` trong mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/auth/register`.
  3. Gửi payload thiếu trường `full_name`.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống ném ra ngoại lệ **HTTP 400 (BAD REQUEST - YÊU CẦU KHÔNG HỢP LỆ)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:
  ```json
  {
    "success": false,
    "status_code": 400,
    "message": "Dữ liệu gửi lên vi phạm quy tắc ràng buộc hoặc sai định dạng",
    "error_code": "COMMON_VALIDATION_ERROR",
    "details": [
      {
        "field": "full_name",
        "issue": "Họ và tên bắt buộc và không được để trống"
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT01_Auth_TC02 : TỪ CHỐI ĐĂNG KÝ TÀI KHOẢN KHI KHÔNG NHẬP HOẶC ĐỂ TRỐNG SỐ ĐIỆN THOẠI (MISSING PHONE)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Người dùng truy cập màn hình đăng ký tài khoản.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):** Không truyền hoặc để trống trường `phone`:
  ```json
  {
    "full_name": "Nguyễn Thị Lan",
    "email": "teacher.lan@school.edu.vn",
    "phone": "",
    "password": "Password123@",
    "role": "TEACHER_HOMEROOM",
    "school_name": "Trường Tiểu Học Chu Văn An",
    "teaching_subjects": ["MATH"]
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Cấu hình tiêu đề `Content-Type: application/json` trong mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/auth/register`.
  3. Gửi payload thiếu trường `phone`.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống ném ra ngoại lệ **HTTP 400 (BAD REQUEST - YÊU CẦU KHÔNG HỢP LỆ)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:
  ```json
  {
    "success": false,
    "status_code": 400,
    "message": "Dữ liệu gửi lên vi phạm quy tắc ràng buộc hoặc sai định dạng",
    "error_code": "COMMON_VALIDATION_ERROR",
    "details": [
      {
        "field": "phone",
        "issue": "Số điện thoại bắt buộc và không được để trống"
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT01_Auth_TC03 : TỪ CHỐI ĐĂNG KÝ TÀI KHOẢN KHI KHÔNG NHẬP HOẶC ĐỂ TRỐNG MẬT KHẨU (MISSING PASSWORD)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Người dùng truy cập màn hình đăng ký tài khoản.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):** Không truyền trường `password`:
  ```json
  {
    "full_name": "Nguyễn Thị Lan",
    "email": "teacher.lan@school.edu.vn",
    "phone": "0912345678",
    "role": "TEACHER_HOMEROOM",
    "school_name": "Trường Tiểu Học Chu Văn An",
    "teaching_subjects": ["MATH"]
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Cấu hình tiêu đề `Content-Type: application/json` trong mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/auth/register`.
  3. Gửi payload thiếu trường `password`.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống ném ra ngoại lệ **HTTP 400 (BAD REQUEST - YÊU CẦU KHÔNG HỢP LỆ)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:
  ```json
  {
    "success": false,
    "status_code": 400,
    "message": "Dữ liệu gửi lên vi phạm quy tắc ràng buộc hoặc sai định dạng",
    "error_code": "COMMON_VALIDATION_ERROR",
    "details": [
      {
        "field": "password",
        "issue": "Mật khẩu bắt buộc và không được để trống"
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT01_Auth_TC04 : TỪ CHỐI ĐĂNG KÝ TÀI KHOẢN GIÁO VIÊN KHI THIẾU TÊN TRƯỜNG HOẶC MÔN GIẢNG DẠY

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Người dùng đăng ký tài khoản với vai trò Giáo viên (`role: TEACHER_HOMEROOM` hoặc `TEACHER_SUBJECT`).
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):** Bỏ trống `school_name` và không truyền `teaching_subjects`:
  ```json
  {
    "full_name": "Nguyễn Thị Lan",
    "email": "teacher.lan@school.edu.vn",
    "phone": "0912345678",
    "password": "Password123@",
    "role": "TEACHER_HOMEROOM",
    "school_name": "",
    "teaching_subjects": []
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Cấu hình tiêu đề `Content-Type: application/json` trong mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/auth/register`.
  3. Gửi payload thiếu thông tin trường học và môn dạy của giáo viên.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống ném ra ngoại lệ **HTTP 400 (BAD REQUEST - YÊU CẦU KHÔNG HỢP LỆ)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:
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
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT01_Auth_TC05 : TỪ CHỐI ĐĂNG NHẬP KHI ĐỂ TRỐNG THÔNG TIN TÀI KHOẢN HOẶC MẬT KHẨU (MISSING IDENTIFIER / PASSWORD)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Người dùng truy cập màn hình đăng nhập.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):** Để trống trường `identifier` và `password`:
  ```json
  {
    "identifier": "",
    "password": ""
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Cấu hình tiêu đề `Content-Type: application/json` trong mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/auth/login`.
  3. Gửi payload để trống `identifier` và `password`.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống ném ra ngoại lệ **HTTP 400 (BAD REQUEST - YÊU CẦU KHÔNG HỢP LỆ)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:
  ```json
  {
    "success": false,
    "status_code": 400,
    "message": "Dữ liệu gửi lên vi phạm quy tắc ràng buộc hoặc sai định dạng",
    "error_code": "COMMON_VALIDATION_ERROR",
    "details": [
      {
        "field": "identifier",
        "issue": "Email hoặc số điện thoại không được để trống"
      },
      {
        "field": "password",
        "issue": "Mật khẩu không được để trống"
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT01_Auth_TC06 : TỪ CHỐI XÁC THỰC FIREBASE KHI KHÔNG TRUYỀN HOẶC ĐỂ TRỐNG CHUỖI ID_TOKEN (MISSING ID_TOKEN)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Client gọi API xác thực Firebase token.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):** Không truyền hoặc để trống trường `id_token`:
  ```json
  {
    "id_token": ""
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Cấu hình tiêu đề `Content-Type: application/json` trong mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/auth/firebase-verify`.
  3. Gửi payload thiếu chuỗi `id_token`.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống ném ra ngoại lệ **HTTP 400 (BAD REQUEST - YÊU CẦU KHÔNG HỢP LỆ)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:
  ```json
  {
    "success": false,
    "status_code": 400,
    "message": "Dữ liệu gửi lên vi phạm quy tắc ràng buộc hoặc sai định dạng",
    "error_code": "COMMON_VALIDATION_ERROR",
    "details": [
      {
        "field": "id_token",
        "issue": "Firebase ID Token bắt buộc và không được để trống"
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT01_Auth_TC07 : TỪ CHỐI LÀM MỚI PHIÊN KHI KHÔNG TRUYỀN HOẶC ĐỂ TRỐNG REFRESH_TOKEN (MISSING REFRESH_TOKEN)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Client gọi API làm mới Access Token.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):** Không truyền hoặc để trống trường `refresh_token`:
  ```json
  {
    "refresh_token": ""
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Cấu hình tiêu đề `Content-Type: application/json` trong mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/auth/refresh-token`.
  3. Gửi payload thiếu chuỗi `refresh_token`.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống ném ra ngoại lệ **HTTP 400 (BAD REQUEST - YÊU CẦU KHÔNG HỢP LỆ)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:
  ```json
  {
    "success": false,
    "status_code": 400,
    "message": "Dữ liệu gửi lên vi phạm quy tắc ràng buộc hoặc sai định dạng",
    "error_code": "COMMON_VALIDATION_ERROR",
    "details": [
      {
        "field": "refresh_token",
        "issue": "Refresh Token bắt buộc và không được để trống"
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

#### 2. Nhóm Kịch Bản Dữ Liệu Sai Quy Cách & Mã Lỗi Nghiệp Vụ (Business Errors)

---

##### UT01_Auth_TC08 : TỪ CHỐI ĐĂNG KÝ KHI MẬT KHẨU KHÔNG ĐỦ ĐỘ MẠNH THEO TIÊU CHUẨN BẢO MẬT

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Người dùng đăng ký tài khoản mới.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):** Mật khẩu quá ngắn hoặc thiếu ký tự đặc biệt (`pass123`):
  ```json
  {
    "full_name": "Trần Văn Bình",
    "phone": "0987654321",
    "email": "binh.tran@gmail.com",
    "password": "pass123",
    "role": "PARENT"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Cấu hình tiêu đề `Content-Type: application/json` trong mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/auth/register`.
  3. Gửi dữ liệu có mật khẩu yếu vào phần **Body**.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống ném ra ngoại lệ **HTTP 400 (BAD REQUEST - YÊU CẦU KHÔNG HỢP LỆ)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:
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
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT01_Auth_TC09 : TỪ CHỐI ĐĂNG KÝ KHI SỐ ĐIỆN THOẠI SAI ĐỊNH DẠNG MẠNG VIỄN THÔNG VIỆT NAM

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Người dùng đăng ký tài khoản mới.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):** Số điện thoại không đủ 10 chữ số hoặc sai đầu số (`0123456789`):
  ```json
  {
    "full_name": "Trần Văn Bình",
    "phone": "0123456789",
    "email": "binh.tran@gmail.com",
    "password": "Password123@",
    "role": "PARENT"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Cấu hình tiêu đề `Content-Type: application/json` trong mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/auth/register`.
  3. Gửi dữ liệu có SĐT sai định dạng vào phần **Body**.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống ném ra ngoại lệ **HTTP 400 (BAD REQUEST - YÊU CẦU KHÔNG HỢP LỆ)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:
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
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT01_Auth_TC10 : TỪ CHỐI ĐĂNG KÝ KHI EMAIL HOẶC SỐ ĐIỆN THOẠI ĐÃ TỒN TẠI TRÊN HỆ THỐNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Địa chỉ email `teacher.lan@school.edu.vn` hoặc số điện thoại `0912345678` đã được một tài khoản khác đăng ký trước đó trong hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):**
  ```json
  {
    "full_name": "Nguyễn Thị Lan",
    "email": "teacher.lan@school.edu.vn",
    "phone": "0912345678",
    "password": "Password123@",
    "role": "TEACHER_HOMEROOM",
    "school_name": "Trường Tiểu Học Chu Văn An",
    "teaching_subjects": ["MATH"]
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Cấu hình tiêu đề `Content-Type: application/json` trong mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/auth/register`.
  3. Gửi payload chứa email/SĐT trùng lặp.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống ném ra ngoại lệ xung đột dữ liệu **HTTP 409 (CONFLICT - DỮ LIỆU ĐÃ TỒN TẠI)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:
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
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT01_Auth_TC11 : TỪ CHỐI ĐĂNG NHẬP KHI SAI MẬT KHẨU HOẶC TÀI KHOẢN KHÔNG TỒN TẠI (AUTH_INVALID_CREDENTIALS)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Người dùng nhập mật khẩu không chính xác hoặc email/SĐT chưa từng được đăng ký trong hệ thống.
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
  1. Cấu hình tiêu đề `Content-Type: application/json` trong mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/auth/login`.
  3. Truyền thông tin đăng nhập với mật khẩu sai.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống ném ra ngoại lệ **HTTP 401 (UNAUTHORIZED - TỪ CHỐI XÁC THỰC)**.
  - Tuyệt đối không sinh bất kỳ token nào.
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

##### UT01_Auth_TC12 : CHẶN ĐĂNG NHẬP KHI TÀI KHOẢN NGƯỜI DÙNG ĐANG BỊ KHÓA (AUTH_ACCOUNT_LOCKED)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Tài khoản `banned.user@school.edu.vn` đã bị Quản trị viên khóa (`is_active: false` trong Firestore và bị vô hiệu hóa trên Firebase Auth).
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
  1. Cấu hình tiêu đề `Content-Type: application/json` trong mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/auth/login`.
  3. Gửi thông tin đăng nhập của tài khoản đang bị khóa.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống ném ra ngoại lệ **HTTP 403 (FORBIDDEN - TÀI KHOẢN BỊ KHÓA)**.
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

##### UT01_Auth_TC13 : TỪ CHỐI XÁC THỰC KHI FIREBASE ID TOKEN KHÔNG HỢP LỆ HOẶC BỊ LÀM GIẢ (AUTH_TOKEN_INVALID)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Chuỗi Firebase ID Token gửi lên bị làm giả, bị chỉnh sửa chữ ký số hoặc sai định dạng.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):**
  ```json
  {
    "id_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.token_gia_mao_hoac_bi_loi"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Cấu hình tiêu đề `Content-Type: application/json` trong mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/auth/firebase-verify`.
  3. Gửi chuỗi Token không hợp lệ vào phần **Body**.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống ném ra ngoại lệ **HTTP 401 (UNAUTHORIZED - TOKEN KHÔNG HỢP LỆ)** khi Firebase Admin SDK xác thực thất bại.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:
  ```json
  {
    "success": false,
    "status_code": 401,
    "message": "Token xác thực không hợp lệ hoặc đã bị thu hồi",
    "error_code": "AUTH_TOKEN_INVALID",
    "details": null,
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT01_Auth_TC14 : TỪ CHỐI LÀM MỚI PHIÊN KHI REFRESH TOKEN ĐÃ HẾT HẠN HOẶC KHÔNG TỒN TẠI (AUTH_TOKEN_EXPIRED)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Chuỗi `refresh_token` đã hết hạn lưu trữ hoặc không tồn tại trong bộ nhớ phiên làm việc.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):**
  ```json
  {
    "refresh_token": "expired-refresh-token-uuid-12345"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Cấu hình tiêu đề `Content-Type: application/json` trong mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/auth/refresh-token`.
  3. Gửi token đã hết hạn vào phần **Body**.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống ném ra ngoại lệ **HTTP 401 (UNAUTHORIZED - PHIÊN ĐĂNG NHẬP HẾT HẠN)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:
  ```json
  {
    "success": false,
    "status_code": 401,
    "message": "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại hoặc làm mới token",
    "error_code": "AUTH_TOKEN_EXPIRED",
    "details": null,
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT01_Auth_TC15 : TỪ CHỐI ĐĂNG XUẤT KHI BEARER ACCESS TOKEN KHÔNG HỢP LỆ (AUTH_TOKEN_INVALID)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Request đăng xuất truyền token xác thực không hợp lệ, bị thu hồi hoặc đã bị giả mạo.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer invalid_jwt_token`
  - **Dữ liệu thân (Body JSON):**
  ```json
  {}
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền chuỗi token không hợp lệ vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/auth/logout`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống ném ra ngoại lệ **HTTP 401 (UNAUTHORIZED - CHƯA XÁC THỰC)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:
  ```json
  {
    "success": false,
    "status_code": 401,
    "message": "Token xác thực không hợp lệ hoặc đã bị thu hồi",
    "error_code": "AUTH_TOKEN_INVALID",
    "details": null,
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT01_Auth_TC16 : XỬ LÝ NGOẠI LỆ LỖI HỆ THỐNG KHI DỊCH VỤ FIREBASE AUTH GẶP SỰ CỐ (SYS_INTERNAL_ERROR)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Dịch vụ Firebase Authentication hoặc Cloud Firestore tạm thời gặp sự cố kết nối, timeout mạng hoặc ném lỗi ngoại lệ chưa được kiểm soát.
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
  2. Giả lập / Mocking kết nối Firebase SDK ném ra ngoại lệ `FirebaseError: Service Unavailable / Network Timeout`.
  3. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/auth/login`.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Bộ lọc ngoại lệ toàn cục (Global Exception Filter) bắt lỗi và chuyển đổi thành mã trạng thái **HTTP 500 (INTERNAL SERVER ERROR - LỖI MÁY CHỦ NỘI BỘ)** mà không làm crash tiến trình ứng dụng.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:
  ```json
  {
    "success": false,
    "status_code": 500,
    "message": "Lỗi máy chủ nội bộ hoặc lỗi kết nối Firebase",
    "error_code": "SYS_INTERNAL_ERROR",
    "details": null,
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### PHẦN II: CÁC KỊCH BẢN KIỂM THỬ THÀNH CÔNG (POSITIVE / TRUE CASES)

---

#### UT01_Auth_TC17 : ĐĂNG KÝ TÀI KHOẢN GIÁO VIÊN MỚI ĐẦY ĐỦ THÔNG TIN THÀNH CÔNG VÀ TỰ ĐỘNG CẤP TOKEN

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Email `teacher.lan@school.edu.vn` và số điện thoại `0912345678` chưa từng tồn tại trong hệ thống.
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
    "teaching_subjects": ["MATH", "LIT", "ETHICS"]
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
  - Dữ liệu trả về đúng định dạng JSON chuẩn:
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
        "teaching_subjects": ["MATH", "LIT", "ETHICS"],
        "is_active": true,
        "created_at": "2026-09-27T10:00:00.000Z"
      }
    },
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

#### UT01_Auth_TC18 : ĐĂNG KÝ TÀI KHOẢN PHỤ HUYNH MỚI THÀNH CÔNG

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
  - Dữ liệu trả về đúng định dạng JSON chuẩn:
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
    },
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

#### UT01_Auth_TC19 : ĐĂNG NHẬP BẰNG EMAIL VÀ MẬT KHẨU CHÍNH XÁC THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Tài khoản `teacher.lan@school.edu.vn` đã đăng ký hợp lệ và đang hoạt động (`is_active: true`).
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
  3. Truyền Email và mật khẩu chính xác vào phần **Body**.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Cấp phát cặp Token truy cập hợp lệ kèm thông tin hồ sơ người dùng.
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
        "teaching_subjects": ["MATH", "LIT"]
      }
    },
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

#### UT01_Auth_TC20 : ĐĂNG NHẬP BẰNG SỐ ĐIỆN THOẠI VÀ MẬT KHẨU CHÍNH XÁC THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Tài khoản phụ huynh với số điện thoại `0987654321` đã đăng ký hợp lệ và đang hoạt động.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):**
  ```json
  {
    "identifier": "0987654321",
    "password": "Password123@"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Cấu hình tiêu đề `Content-Type: application/json` trong mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/auth/login`.
  3. Truyền Số điện thoại và mật khẩu chính xác vào phần **Body**.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Xác thực danh tính qua SĐT và cấp phát cặp Token truy cập hợp lệ.
  - Dữ liệu trả về đúng định dạng JSON chuẩn:
  ```json
  {
    "success": true,
    "status_code": 200,
    "message": "Đăng nhập thành công",
    "data": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token_hop_le",
      "refresh_token": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "expires_in": 3600,
      "user": {
        "uid": "usr_parent_binh_01",
        "phone": "0987654321",
        "full_name": "Trần Văn Bình",
        "role": "PARENT"
      }
    },
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

#### UT01_Auth_TC21 : XÁC THỰC FIREBASE ID TOKEN VÀ ĐỒNG BỘ CUSTOM CLAIMS THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Ứng dụng Client đã xác minh OTP SMS hoặc Social Login thành công qua Firebase SDK và nhận về chuỗi `id_token` hợp lệ.
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
  3. Thêm chuỗi Firebase ID Token hợp lệ vào phần **Body**.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Backend xác thực chữ ký token qua Firebase Admin SDK, kiểm tra và đồng bộ Custom Claims vai trò người dùng.
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
        "student_ids": ["stu_001"]
      }
    },
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

#### UT01_Auth_TC22 : LÀM MỚI PHIÊN LÀM VIỆC BẰNG REFRESH TOKEN HỢP LỆ THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Phiên làm việc của người dùng vẫn còn hợp lệ và sở hữu chuỗi `refresh_token` còn thời hạn.
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
  3. Thêm giá trị `refresh_token` hợp lệ vào phần **Body**.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Cấp phát Access Token mới có thời hạn 3600 giây để tiếp tục phiên làm việc.
  - Dữ liệu trả về đúng định dạng JSON chuẩn:
  ```json
  {
    "success": true,
    "status_code": 200,
    "message": "Làm mới phiên thành công",
    "data": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new_access_token",
      "expires_in": 3600
    },
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

#### UT01_Auth_TC23 : ĐĂNG XUẤT KHỎI HỆ THỐNG VÀ THU HỒI PHIÊN LÀM VIỆC THÀNH CÔNG

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
  1. Truyền mã `Bearer Token` hợp lệ vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/auth/logout`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Thu hồi phiên làm việc, vô hiệu hóa Access Token và xóa Refresh Token tương ứng trong hệ thống.
  - Dữ liệu trả về đúng định dạng JSON chuẩn:
  ```json
  {
    "success": true,
    "status_code": 200,
    "message": "Đăng xuất thành công",
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

#### UT01_Auth_TC24 : TỪ CHỐI ĐĂNG NHẬP KHI TÀI KHOẢN ĐÃ BỊ XÓA MỀM (IS_DELETED = TRUE)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Tài khoản người dùng có số điện thoại `0912345678` đã bị xóa mềm trong hệ thống (`is_deleted: true`).
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):**
  ```json
  {
    "phone": "0912345678",
    "password": "Password123@"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/auth/login`.
  2. Gửi request đăng nhập với thông tin tài khoản đã xóa mềm.
  3. Bấm nút **Gửi (Send)** trên Postman.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 401 (UNAUTHORIZED - TỪ CHỐI XÁC THỰC)**.
  - Phản hồi kèm Header `X-Response-Time`.
  - Cấu trúc lỗi:
  ```json
  {
    "success": false,
    "status_code": 401,
    "message": "Số điện thoại hoặc mật khẩu không chính xác",
    "error_code": "AUTH_INVALID_CREDENTIALS",
    "details": null,
    "timestamp": "2026-10-04T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**
