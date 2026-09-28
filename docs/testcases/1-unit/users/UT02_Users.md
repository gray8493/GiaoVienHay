# TÀI LIỆU KỊCH BẢN KIỂM THỬ ĐƠN VỊ - PHÂN HỆ NGƯỜI DÙNG & HỒ SƠ

# MÃ PHÂN HỆ: 02 - USERS & PROFILE MODULE

# CẤP ĐỘ KIỂM THỬ: KIỂM THỬ ĐƠN VỊ (UNIT TEST)

---

## 1. THÔNG TIN CHUNG

- **PHÂN HỆ HỆ THỐNG:** `02` - Phân hệ Người dùng & Hồ sơ cá nhân
- **MÔ TẢ MODULE API:** Quản lý thông tin cá nhân và thiết bị nhận thông báo (`UsersService`, `UsersController`)
- **TẬP TIN KIỂM THỬ:** `apps/api/src/modules/02-users/users.service.spec.ts`, `apps/api/src/modules/02-users/users.controller.spec.ts`
- **NGƯỜI THỰC HIỆN:** Thái Bảo
- **MÔI TRƯỜNG KIỂM THỬ:** Testing

---

## 2. CHI TIẾT CÁC KỊCH BẢN KIỂM THỬ ĐƠN VỊ

---

### UT02_Users_TC01 : LẤY THÔNG TIN HỒ SƠ CÁ NHÂN CỦA NGƯỜI DÙNG ĐANG ĐĂNG NHẬP

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Giáo viên `usr_teacher_lan` đã đăng nhập thành công và sở hữu Firebase ID Token hợp lệ.
  - Bản ghi tài khoản đã được kích hoạt trong bộ sưu tập `/users`.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien_lan>`
  - **Tham số truy vấn (Query Params):** Không có
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` của giáo viên vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/users/me`.
  3. Không cần truyền dữ liệu vào phần Body.
  4. Bấm nút **Gửi (Send)** để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

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
      "teaching_subjects": [
        "MATH",
        "LIT",
        "ETHICS"
      ],
      "is_active": true,
      "created_at": "2026-09-01T08:00:00.000Z"
    }
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT02_Users_TC02 : CẬP NHẬT HỒ SƠ VÀ DANH SÁCH MÔN HỌC GIẢNG DẠY HỢP LỆ

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Giáo viên đã đăng nhập vào hệ thống.
  - Các mã môn học lựa chọn (`MATH`, `LIT`, `ETHICS`) đều thuộc danh mục môn học của Bộ Giáo dục & Đào tạo.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien_lan>`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "full_name": "Nguyễn Thị Lan",
    "school_name": "Trường Tiểu Học Chu Văn An",
    "avatar_url": "https://storage.googleapis.com/.../new_avatar.jpg",
    "teaching_subjects": [
      "MATH",
      "LIT",
      "ETHICS"
    ]
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` của giáo viên vào mục **Headers**.
  2. Chọn phương thức **`PATCH`**, nhập đường dẫn API: `/api/v1/users/profile`.
  3. Thêm dữ liệu cập nhật hồ sơ vào phần **Body** định dạng `raw (application/json)`.
  4. Bấm nút **Gửi (Send)** để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": true,
    "status_code": 200,
    "data": {
      "uid": "usr_teacher_lan",
      "full_name": "Nguyễn Thị Lan",
      "school_name": "Trường Tiểu Học Chu Văn An",
      "teaching_subjects": [
        "MATH",
        "LIT",
        "ETHICS"
      ]
    }
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT02_Users_TC03 : TỪ CHỐI CẬP NHẬT MÔN HỌC KHÔNG HỢP LỆ THEO CHƯƠNG TRÌNH GDPT

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Giáo viên đã đăng nhập vào hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "teaching_subjects": [
      "INVALID_CODE_XYZ"
    ]
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` của giáo viên vào mục **Headers**.
  2. Chọn phương thức **`PATCH`**, nhập đường dẫn API: `/api/v1/users/profile`.
  3. Thêm dữ liệu chứa mã môn học sai vào phần **Body** định dạng JSON.
  4. Bấm nút **Gửi (Send)** để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 400,
    "error_code": "INVALID_SUBJECT_CODE",
    "message": "Mã môn học INVALID_CODE_XYZ không nằm trong danh mục chương trình GDPT"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT02_Users_TC04 : ĐĂNG KÝ VÀ LÀM MỚI THIẾT BỊ NHẬN THÔNG BÁO ĐẨY FCM

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Người dùng đăng nhập trên điện thoại và cấp quyền nhận thông báo đẩy.
  - Thiết bị sinh ra FCM Token hợp lệ từ Google Firebase SDK.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_nguoi_dung>`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "fcm_device_token": "fcm_tok_abc123xyz789",
    "device_type": "ANDROID"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` của người dùng vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/users/device-token`.
  3. Thêm token thiết bị vào phần **Body** định dạng `raw (application/json)`.
  4. Bấm nút **Gửi (Send)** để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": true,
    "status_code": 200,
    "message": "Đăng ký thiết bị nhận thông báo thành công"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT02_Users_TC05 : TỪ CHỐI ĐĂNG KÝ THIẾT BỊ KHI GỬI TOKEN RỖNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Người dùng đã đăng nhập hợp lệ.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_nguoi_dung>`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "fcm_device_token": "",
    "device_type": "IOS"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/users/device-token`.
  3. Thêm payload có chuỗi token rỗng vào phần **Body**.
  4. Bấm nút **Gửi (Send)** để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 400,
    "error_code": "EMPTY_DEVICE_TOKEN",
    "message": "fcm_device_token không được để trống"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT02_Users_TC06 : TỪ CHỐI CẬP NHẬT KHI HỌ VÀ TÊN QUÁ NGẮN DƯỚI 2 KÝ TỰ HOẶC ĐỂ TRỐNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Người dùng đã đăng nhập vào hệ thống.
  - Người dùng gửi yêu cầu cập nhật hồ sơ với trường họ tên chỉ có 1 ký tự (`full_name = "A"`).
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_nguoi_dung>`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "full_name": "A"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực vào **Headers**.
  2. Chọn phương thức **`PATCH`**, nhập đường dẫn API: `/api/v1/users/profile`.
  3. Gửi payload có trường `full_name` dưới 2 ký tự.
  4. Bấm nút **Gửi (Send)** để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 400,
    "error_code": "COMMON_VALIDATION_ERROR",
    "message": "Họ và tên phải có độ dài từ 2 đến 100 ký tự"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT02_Users_TC07 : TỪ CHỐI CẬP NHẬT ẢNH ĐẠI DIỆN VỚI ĐƯỜNG DẪN URL SAI ĐỊNH DẠNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Người dùng đã đăng nhập vào hệ thống.
  - Chuỗi đường dẫn ảnh đại diện không tuân thủ định dạng URL hợp lệ.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_nguoi_dung>`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "avatar_url": "duong_dan_anh_khong_hop_le_123"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực vào **Headers**.
  2. Chọn phương thức **`PATCH`**, nhập URL: `/api/v1/users/profile`.
  3. Gửi payload chứa đường dẫn avatar sai quy cách.
  4. Bấm nút **Gửi (Send)** để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 400,
    "error_code": "COMMON_VALIDATION_ERROR",
    "message": "URL ảnh đại diện không đúng định dạng hợp lệ (yêu cầu https://...)"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT02_Users_TC08 : TỪ CHỐI THAO TÁC DO KHÔNG CÓ TOKEN XÁC THỰC HOẶC TOKEN ĐÃ HẾT HẠN

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Người dùng chưa đăng nhập hoặc Firebase ID Token đã quá hạn 1800 giây.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** Không truyền header `Authorization` hoặc `Authorization: Bearer <token_het_han>`
- **CÁC BƯỚC THỰC HIỆN:**

  1. Gửi request `GET /api/v1/users/me` mà không kèm token hợp lệ.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 401,
    "error_code": "AUTH_UNAUTHORIZED",
    "message": "Phiên làm việc không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại."
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT02_Users_TC09 : CHẶN NGƯỜI DÙNG THAO TÁC KHI TÀI KHOẢN ĐANG Ở TRẠNG THÁI BỊ TẠM KHÓA

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Tài khoản người dùng mang mã `usr_teacher_locked` đã bị Quản trị viên nhà trường tạm khóa (`is_active: false`).
  - Người dùng cố gắng gửi request cập nhật hồ sơ cá nhân.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_tai_khoan_khoa>`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "school_name": "Trường Tiểu Học Chu Văn An"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền token của tài khoản đang bị khóa vào **Headers**.
  2. Chọn phương thức **`PATCH`**, nhập URL: `/api/v1/users/profile`.
  3. Bấm nút **Gửi (Send)** để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 403,
    "error_code": "AUTH_FORBIDDEN",
    "message": "Tài khoản của bạn đã bị tạm khóa. Vui lòng liên hệ Quản trị viên để được hỗ trợ."
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT02_Users_TC10 : TỪ CHỐI YÊU CẦU KHI HỒ SƠ NGƯỜI DÙNG KHÔNG TỒN TẠI TRONG CƠ SỞ DỮ LIỆU

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Token Firebase xác thực thành công nhưng bản ghi tài khoản tương ứng đã bị xóa khỏi collection `/users`.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_uid_da_xoa>`
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền token vào **Headers**.
  2. Gửi request `GET /api/v1/users/me`.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 404,
    "error_code": "USER_NOT_FOUND",
    "message": "Không tìm thấy hồ sơ người dùng trong hệ thống."
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT02_Users_TC11 : XỬ LÝ LỖI HỆ THỐNG KHI CƠ SỞ DỮ LIỆU FIRESTORE MẤT KẾT NỐI HOẶC TIMEOUT (500 INTERNAL SERVER ERROR)

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Yêu cầu truy xuất thông tin cá nhân của người dùng hoàn toàn hợp lệ.
  - Kết nối giữa Backend API Server và Firestore DB Cluster bị ngắt quãng hoặc quá thời gian chờ (Deadline Exceeded).
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_nguoi_dung>`
- **CÁC BƯỚC THỰC HIỆN:**

  1. Giả lập cơ sở dữ liệu Firestore ném lỗi kết nối `DATABASE_SERVICE_UNAVAILABLE`.
  2. Gửi request `GET /api/v1/users/me`.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 500,
    "error_code": "SYS_INTERNAL_ERROR",
    "message": "Hệ thống cơ sở dữ liệu tạm thời gián đoạn. Vui lòng thử lại sau giây lát."
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---
