# TÀI LIỆU KỊCH BẢN KIỂM THỬ ĐƠN VỊ - PHÂN HỆ QUẢN TRỊ NỀN TẢNG (PLATFORM ADMIN)

# MÃ PHÂN HỆ: 12 - PLATFORM ADMIN PORTAL MODULE

# CẤP ĐỘ KIỂM THỬ: KIỂM THỬ ĐƠN VỊ (UNIT TEST)

---

## 1. THÔNG TIN CHUNG

- **PHÂN HỆ HỆ THỐNG:** `12` - Phân hệ Quản trị Nền tảng (Platform Admin Module - Dành riêng Web Next.js Admin Portal - `/api/v1/admin`)
- **MÔ TẢ MODULE API:** Quản lý tài khoản người dùng, Khóa/Mở khóa tài khoản (Ban/Unban), Giám sát lớp học & Cấu hình hạn mức tài nguyên hệ thống (`AdminService`, `AdminController`)
- **NGƯỜI THỰC HIỆN / VIẾT TESTCASE:** Kim Chi Ha
- **TẬP TIN KIỂM THỬ:** [API_Admin](https://github.com/gray8493/GiaoVienHay/tree/main/docs/apis/admin)
- **MÔI TRƯỜNG KIỂM THỬ:** Testing / Postman API Client


## 2. CHI TIẾT CÁC KỊCH BẢN KIỂM THỬ ĐƠN VỊ

---

### UT12_Admin_TC01 : LẤY DANH SÁCH NGƯỜI DÙNG TOÀN HỆ THỐNG CÓ PHÂN TRANG VÀ BỘ LỌC THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Quản trị viên (Platform Admin) đã đăng nhập thành công và sở hữu Firebase ID Token hợp lệ mang vai trò `role: ADMIN`.
  - Cơ sở dữ liệu Firestore bộ sưu tập `/users` chứa dữ liệu các tài khoản giáo viên và phụ huynh.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_admin_hop_le>`
  - **Tham số truy vấn (Query Params JSON):**

  ```json
  {
    "page": 1,
    "limit": 20,
    "role": "TEACHER_HOMEROOM",
    "is_active": true,
    "search": "Nguyễn"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` của Quản trị viên vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/admin/users?page=1&limit=20&role=TEACHER_HOMEROOM&is_active=true&search=Nguyễn`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Trả về danh sách người dùng thỏa mãn điều kiện lọc và thông tin phân trang chuẩn xác.
  - Dữ liệu trả về đúng định dạng JSON chuẩn:

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
          "school_name": "THPT Chuyên Hà Nội - Amsterdam",
          "role": "TEACHER_HOMEROOM",
          "is_active": true,
          "created_at": "2026-09-01T08:00:00.000Z"
        }
      ]
    }
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT12_Admin_TC02 : CHẶN VÀ TỪ CHỐI TRUY CẬP KHI NGƯỜI DÙNG KHÔNG CÓ VAI TRÒ ADMIN

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Người dùng là Giáo viên hoặc Phụ huynh (`role: TEACHER_HOMEROOM` hoặc `role: PARENT`) đã đăng nhập nhưng không có vai trò `ADMIN`.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien_hoac_phu_huynh>`
  - **Tham số truy vấn (Query Params JSON):**

  ```json
  {
    "page": 1,
    "limit": 20
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` của tài khoản không phải Admin vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/admin/users?page=1&limit=20`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  - Hệ thống ném ra ngoại lệ từ chối quyền truy cập **HTTP 403 (FORBIDDEN - CẤM TRUY CẬP)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:

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
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT12_Admin_TC03 : KHÓA TÀI KHOẢN NGƯỜI DÙNG VI PHẠM CHÍNH SÁCH THÀNH CÔNG (BAN USER)

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Quản trị viên đã đăng nhập hợp lệ với vai trò `ADMIN`.
  - Tài khoản người dùng mục tiêu có định danh `usr_t01` đang ở trạng thái hoạt động (`is_active: true`) trong Firestore và Firebase Auth.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_admin_hop_le>`
    - `Content-Type: application/json`
  - **Tham số đường dẫn (Path Params):** `id = usr_t01`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "reason": "Vi phạm chia sẻ tài liệu sai quy định",
    "note": "Khóa tài khoản 14 ngày để kiểm tra xác minh"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` của Quản trị viên vào mục **Headers**.
  2. Chọn phương thức **`PATCH`**, nhập đường dẫn API: `/api/v1/admin/users/usr_t01/ban`.
  3. Thêm dữ liệu lý do khóa vào phần **Body** định dạng `raw (application/json)`.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Firebase Authentication gọi lệnh vô hiệu hóa tài khoản (`disabled: true`) và lập tức thu hồi mọi phiên đăng nhập (`revokeRefreshTokens`).
  - Cập nhật trạng thái `is_active: false`, lưu lý do khóa `ban_reason` và mốc thời gian `banned_at` vào Firestore `/users/usr_t01`.
  - Dữ liệu trả về đúng định dạng JSON chuẩn:

  ```json
  {
    "success": true,
    "status_code": 200,
    "message": "Đã khóa tài khoản người dùng thành công",
    "data": {
      "uid": "usr_t01",
      "is_active": false,
      "banned_at": "2026-09-27T10:00:00.000Z",
      "ban_reason": "Vi phạm chia sẻ tài liệu sai quy định"
    }
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT12_Admin_TC04 : TỪ CHỐI KHÓA TÀI KHOẢN KHI THIẾU LÝ DO BẮT BUỘC

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Quản trị viên đã đăng nhập hợp lệ với vai trò `ADMIN`.
  - Tài khoản người dùng mục tiêu `usr_t01` tồn tại trên hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_admin_hop_le>`
    - `Content-Type: application/json`
  - **Tham số đường dẫn (Path Params):** `id = usr_t01`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "note": "Khóa không có lý do"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` của Quản trị viên vào mục **Headers**.
  2. Chọn phương thức **`PATCH`**, nhập đường dẫn API: `/api/v1/admin/users/usr_t01/ban`.
  3. Truyền dữ liệu thiếu trường `reason` bắt buộc vào phần **Body**.
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
        "field": "reason",
        "issue": "Lý do khóa tài khoản không được để trống"
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT12_Admin_TC05 : BÁO LỖI KHI THỰC HIỆN KHÓA TÀI KHOẢN NGƯỜI DÙNG KHÔNG TỒN TẠI

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Quản trị viên đã đăng nhập hợp lệ với vai trò `ADMIN`.
  - Mã người dùng `usr_non_existent` hoàn toàn không tồn tại trong hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_admin_hop_le>`
    - `Content-Type: application/json`
  - **Tham số đường dẫn (Path Params):** `id = usr_non_existent`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "reason": "Tài khoản spam"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` của Quản trị viên vào mục **Headers**.
  2. Chọn phương thức **`PATCH`**, nhập đường dẫn API: `/api/v1/admin/users/usr_non_existent/ban`.
  3. Thêm nội dung Body JSON hợp lệ.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  - Hệ thống phản hồi mã trạng thái **HTTP 404 (NOT FOUND - KHÔNG TÌM THẤY)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:

  ```json
  {
    "success": false,
    "status_code": 404,
    "message": "Không tìm thấy người dùng trong hệ thống",
    "error_code": "USER_NOT_FOUND",
    "details": null,
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT12_Admin_TC06 : MỞ KHÓA TÀI KHOẢN NGƯỜI DÙNG THÀNH CÔNG (UNBAN USER)

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Quản trị viên đã đăng nhập hợp lệ với vai trò `ADMIN`.
  - Tài khoản người dùng mục tiêu `usr_t01` đang ở trạng thái bị khóa (`is_active: false` và `disabled: true` trên Firebase Auth).
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_admin_hop_le>`
  - **Tham số đường dẫn (Path Params):** `id = usr_t01`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {}
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` của Quản trị viên vào mục **Headers**.
  2. Chọn phương thức **`PATCH`**, nhập đường dẫn API: `/api/v1/admin/users/usr_t01/unban`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Firebase Authentication kích hoạt lại trạng thái hoạt động của tài khoản (`disabled: false`).
  - Firestore cập nhật trạng thái `is_active: true`, xóa bỏ cảnh báo khóa tài khoản.
  - Dữ liệu trả về đúng định dạng JSON chuẩn:

  ```json
  {
    "success": true,
    "status_code": 200,
    "message": "Đã mở khóa tài khoản thành công"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT12_Admin_TC07 : GIÁM SÁT TOÀN BỘ DANH SÁCH LỚP HỌC TRÊN NỀN TẢNG THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Quản trị viên đã đăng nhập hợp lệ với vai trò `ADMIN`.
  - Hệ thống đã có các lớp học được khởi tạo bởi Giáo viên Chủ nhiệm.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_admin_hop_le>`
  - **Tham số truy vấn (Query Params JSON):**

  ```json
  {}
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` của Quản trị viên vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/admin/classes`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Trả về danh sách chi tiết các lớp học toàn nền tảng.
  - Dữ liệu trả về đúng định dạng JSON chuẩn:

  ```json
  {
    "success": true,
    "status_code": 200,
    "data": {
      "total_classes": 85,
      "items": [
        {
          "class_id": "cls_1a_2026",
          "class_name": "Lớp 1A",
          "academic_year": "2026-2027",
          "homeroom_teacher": {
            "uid": "usr_t01",
            "full_name": "Nguyễn Văn An"
          },
          "student_count": 35,
          "invite_code": "GVH-1A-9821",
          "created_at": "2026-09-01T08:00:00.000Z"
        }
      ]
    }
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT12_Admin_TC08 : LẤY CẤU HÌNH HẠN MỨC TÀI NGUYÊN HIỆN TẠI CỦA HỆ THỐNG THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Quản trị viên đã đăng nhập hợp lệ với vai trò `ADMIN`.
  - Tài liệu cấu hình `/system_configs/limits` đã được khởi tạo trong Cloud Firestore.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_admin_hop_le>`
  - **Tham số truy vấn (Query Params JSON):**

  ```json
  {}
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` của Quản trị viên vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/admin/system/limits`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Trả về đầy đủ các thông số giới hạn tài nguyên hệ thống.
  - Dữ liệu trả về đúng định dạng JSON chuẩn:

  ```json
  {
    "max_classes_per_teacher": 10,
    "max_students_per_class": 60,
    "gemini_ai_daily_quota_per_teacher": 30,
    "max_upload_size_mb": 20
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT12_Admin_TC09 : CẬP NHẬT CẤU HÌNH HẠN MỨC TÀI NGUYÊN TOÀN HỆ THỐNG THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Quản trị viên đã đăng nhập hợp lệ với vai trò `ADMIN`.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_admin_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "max_classes_per_teacher": 12,
    "max_students_per_class": 65,
    "gemini_ai_daily_quota_per_teacher": 50,
    "max_upload_size_mb": 25
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` của Quản trị viên vào mục **Headers**.
  2. Chọn phương thức **`PUT`**, nhập đường dẫn API: `/api/v1/admin/system/limits`.
  3. Thêm cấu hình hạn ngạch mới vào phần **Body** định dạng `raw (application/json)`.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Ghi nhận và lưu cấu hình hạn ngạch mới vào tài liệu Firestore `/system_configs/limits`.
  - Dữ liệu trả về đúng định dạng JSON chuẩn:

  ```json
  {
    "success": true,
    "status_code": 200,
    "message": "Cập nhật cấu hình hạn mức tài nguyên thành công",
    "data": {
      "max_classes_per_teacher": 12,
      "max_students_per_class": 65,
      "gemini_ai_daily_quota_per_teacher": 50,
      "max_upload_size_mb": 25,
      "updated_at": "2026-09-27T10:30:00.000Z"
    }
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT12_Admin_TC10 : TỪ CHỐI CẬP NHẬT KHI GIÁ TRỊ HẠN MỨC TÀI NGUYÊN KHÔNG HỢP LỆ

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Quản trị viên đã đăng nhập hợp lệ với vai trò `ADMIN`.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_admin_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "max_classes_per_teacher": -5,
    "max_students_per_class": 0,
    "gemini_ai_daily_quota_per_teacher": -10,
    "max_upload_size_mb": 20
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` của Quản trị viên vào mục **Headers**.
  2. Chọn phương thức **`PUT`**, nhập đường dẫn API: `/api/v1/admin/system/limits`.
  3. Thêm dữ liệu chứa các giá trị số âm không hợp lệ vào phần **Body**.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  - Hệ thống ném ra ngoại lệ **HTTP 400 (BAD REQUEST - DỮ LIỆU KHÔNG HỢP LỆ)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:

  ```json
  {
    "success": false,
    "status_code": 400,
    "message": "Thông số cấu hình hạn mức tài nguyên không hợp lệ (phải là số nguyên dương)",
    "error_code": "ADM_INVALID_LIMITS",
    "details": null,
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT12_Admin_TC11 : TỪ CHỐI THỰC HIỆN KHI KHÔNG TRUYỀN HOẶC ĐỂ TRỐNG MÃ ĐỊNH DANH NGƯỜI DÙNG (ID RỖNG)

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Quản trị viên đã đăng nhập hợp lệ với vai trò `ADMIN`.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_admin_hop_le>`
    - `Content-Type: application/json`
  - **Tham số đường dẫn (Path Params):** `id = ""` (để chuỗi rỗng hoặc chỉ khoảng trắng)
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "reason": "Vi phạm chia sẻ tài liệu sai quy định",
    "note": "Khóa tài khoản kiểm tra"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` của Quản trị viên vào mục **Headers**.
  2. Chọn phương thức **`PATCH`**, nhập đường dẫn API không truyền mã định danh: `/api/v1/admin/users//ban` hoặc truyền param rỗng.
  3. Thêm nội dung Body JSON hợp lệ.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  - Bộ lọc kiểm tra dữ liệu đầu vào (Validation Pipe / Middleware) chặn lại và ném ra ngoại lệ **HTTP 400 (BAD REQUEST - YÊU CẦU KHÔNG HỢP LỆ)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:

  ```json
  {
    "success": false,
    "status_code": 400,
    "message": "Dữ liệu gửi lên vi phạm quy tắc ràng buộc hoặc sai định dạng",
    "error_code": "COMMON_VALIDATION_ERROR",
    "details": [
      {
        "field": "id",
        "issue": "Mã định danh người dùng (id) bắt buộc và không được để trống"
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT12_Admin_TC12 : BÁO LỖI KHI THỰC HIỆN MỞ KHÓA TÀI KHOẢN NGƯỜI DÙNG KHÔNG TỒN TẠI

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Quản trị viên đã đăng nhập hợp lệ với vai trò `ADMIN`.
  - Mã người dùng `usr_non_existent` hoàn toàn không tồn tại trong Firestore `/users` và Firebase Auth.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_admin_hop_le>`
  - **Tham số đường dẫn (Path Params):** `id = usr_non_existent`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {}
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` của Quản trị viên vào mục **Headers**.
  2. Chọn phương thức **`PATCH`**, nhập đường dẫn API: `/api/v1/admin/users/usr_non_existent/unban`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  - Hệ thống phản hồi mã trạng thái **HTTP 404 (NOT FOUND - KHÔNG TÌM THẤY)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:

  ```json
  {
    "success": false,
    "status_code": 404,
    "message": "Không tìm thấy người dùng trong hệ thống",
    "error_code": "USER_NOT_FOUND",
    "details": null,
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT12_Admin_TC13 : TỪ CHỐI KHÓA TÀI KHOẢN KHI ĐỘ DÀI LÝ DO KHÔNG THỎA MÃN RÀNG BUỘC (VALIDATION DƯỚI 5 KÝ TỰ HOẶC VƯỢT QUÁ 500 KÝ TỰ)

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Quản trị viên đã đăng nhập hợp lệ với vai trò `ADMIN`.
  - Tài khoản người dùng mục tiêu `usr_t01` tồn tại trên hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_admin_hop_le>`
    - `Content-Type: application/json`
  - **Tham số đường dẫn (Path Params):** `id = usr_t01`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "reason": "Spam"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` của Quản trị viên vào mục **Headers**.
  2. Chọn phương thức **`PATCH`**, nhập đường dẫn API: `/api/v1/admin/users/usr_t01/ban`.
  3. Nhập giá trị trường `reason` có độ dài chỉ 4 ký tự (vi phạm quy định tối thiểu 5 ký tự) vào phần **Body**.
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
        "field": "reason",
        "issue": "Lý do khóa tài khoản phải có độ dài từ 5 đến 500 ký tự"
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT12_Admin_TC14 : TỪ CHỐI CẬP NHẬT HẠN MỨC TÀI NGUYÊN KHI DỮ LIỆU ĐẦU VÀO SAI KIỂU DỮ LIỆU (DTO VALIDATION)

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Quản trị viên đã đăng nhập hợp lệ với vai trò `ADMIN`.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_admin_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "max_classes_per_teacher": "khong_gioi_han",
    "max_students_per_class": 60,
    "gemini_ai_daily_quota_per_teacher": 30,
    "max_upload_size_mb": 20
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` của Quản trị viên vào mục **Headers**.
  2. Chọn phương thức **`PUT`**, nhập đường dẫn API: `/api/v1/admin/system/limits`.
  3. Nhập dữ liệu trong đó `max_classes_per_teacher` là chuỗi văn bản thay vì số nguyên (Integer).
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  - Hệ thống ném ra ngoại lệ kiểm tra kiểu dữ liệu DTO **HTTP 422 (UNPROCESSABLE ENTITY - LỖI ĐỊNH DẠNG DTO)** (hoặc HTTP 400 Bad Request tùy cấu hình ValidationPipe).
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:

  ```json
  {
    "success": false,
    "status_code": 422,
    "message": "Dữ liệu đầu vào sai quy cách định dạng DTO Validation",
    "error_code": "REQ_VALIDATION_ERROR",
    "details": [
      {
        "field": "max_classes_per_teacher",
        "issue": "Giá trị hạn mức lớp học phải là số nguyên (integer)"
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT12_Admin_TC15 : XỬ LÝ NGOẠI LỆ LỖI HỆ THỐNG KHI KẾT NỐI FIREBASE / CƠ SỞ DỮ LIỆU THẤT BẠI (500 INTERNAL SERVER ERROR)

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Quản trị viên đã đăng nhập hợp lệ với vai trò `ADMIN`.
  - Dịch vụ Firebase Authentication SDK hoặc Cloud Firestore tạm thời mất kết nối mạng, timeout hoặc ném lỗi ngoại lệ nội bộ chưa được kiểm soát.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_admin_hop_le>`
    - `Content-Type: application/json`
  - **Tham số đường dẫn (Path Params):** `id = usr_t01`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "reason": "Vi phạm chia sẻ tài liệu sai quy định",
    "note": "Khóa tài khoản kiểm tra"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` của Quản trị viên vào mục **Headers**.
  2. Giả lập / Mocking kết nối Firebase Admin SDK hoặc Firestore ném ra lỗi ngoại lệ `FirebaseError: Deadline Exceeded / Service Unavailable`.
  3. Chọn phương thức **`PATCH`**, nhập đường dẫn API: `/api/v1/admin/users/usr_t01/ban`.
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

### UT12_Admin_TC16 : CHẶN HÀNH ĐỘNG KHÓA TÀI KHOẢN KHI NGƯỜI DÙNG MỤC TIÊU CÓ VAI TRÒ QUẢN TRỊ VIÊN CẤP CAO (ADMIN)

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Quản trị viên đã đăng nhập hợp lệ với vai trò `ADMIN`.
  - Tài khoản người dùng mục tiêu `usr_admin_senior` có vai trò `role: ADMIN` trong hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_admin_hop_le>`
    - `Content-Type: application/json`
  - **Tham số đường dẫn (Path Params):** `id = usr_admin_senior`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "reason": "Khóa thử nghiệm tài khoản quản trị",
    "note": "Kiểm tra cơ chế tự bảo vệ của hệ thống"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` của Quản trị viên vào mục **Headers**.
  2. Chọn phương thức **`PATCH`**, nhập đường dẫn API: `/api/v1/admin/users/usr_admin_senior/ban`.
  3. Thêm nội dung Body JSON hợp lệ.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  - Hệ thống kiểm tra vai trò tài khoản mục tiêu và ném ra ngoại lệ cấm thực thi **HTTP 403 (FORBIDDEN - CẤM TRUY CẬP)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:

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
- **TRẠNG THÁI KIỂM THỬ:**
