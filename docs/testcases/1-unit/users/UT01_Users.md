# TÀI LIỆU KỊCH BẢN KIỂM THỬ ĐƠN VỊ - PHÂN HỆ NGƯỜI DÙNG & HỒ SƠ
# MÃ PHÂN HỆ: 01 - AUTH & USER PROFILE MODULE
# CẤP ĐỘ KIỂM THỬ: KIỂM THỬ ĐƠN VỊ (UNIT TEST)

---

## 1. THÔNG TIN CHUNG

- **PHÂN HỆ HỆ THỐNG:** `01` - Phân hệ Tài khoản, Xác thực & Hồ sơ người dùng
- **MÔ TẢ MODULE API:** Quản lý thông tin cá nhân và thiết bị nhận thông báo (`UsersService`, `UsersController`)
- **TẬP TIN KIỂM THỬ:** 
- **MÔI TRƯỜNG KIỂM THỬ:** Testing

---

## 2. CHI TIẾT CÁC KỊCH BẢN KIỂM THỬ ĐƠN VỊ

---

### UT01_Users_TC01 : LẤY THÔNG TIN HỒ SƠ CÁ NHÂN CỦA NGƯỜI DÙNG ĐANG ĐĂNG NHẬP

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên `usr_teacher_lan` đã đăng nhập thành công và sở hữu Firebase ID Token hợp lệ.
  - Bản ghi tài khoản đã được kích hoạt trong bộ sưu tập `/users`.

- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien_lan>`
  - **Tham số truy vấn (Query Params JSON):** `{}` (Không có)

- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của giáo viên vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/users/me`.
  3. Không cần truyền dữ liệu vào phần Body.
  4. Bấm nút **Gửi (Send)** để thực thi request.

- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Trả về chi tiết vai trò, họ tên và danh sách các môn trực tiếp giảng dạy.
  - Dữ liệu trả về đúng định dạng JSON chuẩn như sau:

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

### UT01_Users_TC02 : CẬP NHẬT HỒ SƠ VÀ DANH SÁCH MÔN HỌC GIẢNG DẠY HỢP LỆ

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
  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Bản ghi `/users/usr_teacher_lan` được cập nhật chính xác các trường thông tin mới.
  - Dữ liệu trả về đúng định dạng JSON chuẩn như sau:

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

### UT01_Users_TC03 : TỪ CHỐI CẬP NHẬT MÔN HỌC KHÔNG HỢP LỆ THEO CHƯƠNG TRÌNH GDPT

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
  - Hệ thống ném ra ngoại lệ yêu cầu không hợp lệ **HTTP 400 (BAD REQUEST - YÊU CẦU SAI)**.
  - Dữ liệu lỗi trả về đúng định dạng JSON chuẩn như sau:

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

### UT01_Users_TC04 : ĐĂNG KÝ VÀ LÀM MỚI THIẾT BỊ NHẬN THÔNG BÁO ĐẨY FCM

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
  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Mảng `fcm_tokens` của người dùng trong Firestore được cập nhật token thiết bị mới.
  - Dữ liệu trả về đúng định dạng JSON chuẩn như sau:

  ```json
  {
    "success": true,
    "status_code": 200,
    "message": "Đăng ký thiết bị nhận thông báo thành công"
  }
  ```

- **TRẠNG THÁI KIỂM THỬ:** 

---

### UT01_Users_TC05 : TỪ CHỐI ĐĂNG KÝ THIẾT BỊ KHI GỬI TOKEN RỖNG

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
  - Hệ thống ném ra ngoại lệ yêu cầu không hợp lệ **HTTP 400 (BAD REQUEST - YÊU CẦU SAI)**.
  - Dữ liệu lỗi trả về đúng định dạng JSON chuẩn như sau:

  ```json
  {
    "success": false,
    "status_code": 400,
    "error_code": "EMPTY_DEVICE_TOKEN",
    "message": "fcm_device_token không được để trống"
  }
  ```

- **TRẠNG THÁI KIỂM THỬ:** 
