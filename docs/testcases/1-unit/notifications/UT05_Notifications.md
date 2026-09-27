# TÀI LIỆU KỊCH BẢN KIỂM THỬ ĐƠN VỊ - PHÂN HỆ THÔNG BÁO ĐẨY
# MÃ PHÂN HỆ: 05 - NOTIFICATION & FCM MODULE
# CẤP ĐỘ KIỂM THỬ: KIỂM THỬ ĐƠN VỊ (UNIT TEST)

---

## 1. THÔNG TIN CHUNG

- **PHÂN HỆ HỆ THỐNG:** `05` - Phân hệ Thông báo đẩy & Nhật ký FCM
- **MÔ TẢ MODULE API:** Quản lý lịch sử thông báo (`NotificationsService`, `NotificationsController`)
- **TẬP TIN KIỂM THỬ:** 
- **MÔI TRƯỜNG KIỂM THỬ:** Testing

---

## 2. CHI TIẾT CÁC KỊCH BẢN KIỂM THỬ ĐƠN VỊ

---

### UT05_Notifications_TC01 : LẤY DANH SÁCH LỊCH SỬ THÔNG BÁO CỦA TÀI KHOẢN

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Người dùng (Giáo viên hoặc Phụ huynh) đã đăng nhập thành công vào hệ thống.
  - Tài khoản hiện có 15 bản ghi thông báo trong cơ sở dữ liệu, trong đó có 2 thông báo ở trạng thái chưa đọc.

- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_nguoi_dung>`
  - **Tham số truy vấn (Query Params JSON):**

  ```json
  {
    "page": 1,
    "limit": 10
  }
  ```

- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của người dùng vào mục **Headers** (`Authorization: Bearer <token_nguoi_dung>`).
  2. Chọn phương thức **`GET`**, nhập đường dẫn API kèm tham số: `/api/v1/notifications?page=1&limit=10`.
  3. Không cần truyền dữ liệu vào phần Body.
  4. Bấm nút **Gửi (Send)** để thực thi request.

- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Danh sách trả về được sắp xếp theo thời gian tạo giảm dần (`created_at DESC`).
  - Dữ liệu trả về đúng định dạng JSON chuẩn như sau:

  ```json
  {
    "success": true,
    "status_code": 200,
    "data": {
      "unread_count": 2,
      "total": 15,
      "items": [
        {
          "id": "notif_01",
          "title": "Nhắc lịch kiểm tra môn Toán",
          "body": "Thứ Sáu tới lớp có bài kiểm tra 15 phút Toán. Kính nhờ phụ huynh đôn đốc con ôn bài.",
          "type": "EXAM_REMINDER",
          "is_read": false,
          "metadata": {
            "student_id": "stu_01",
            "screen": "EXAM_REMINDER_DETAIL"
          },
          "created_at": "2026-09-23T10:30:00.000Z"
        }
      ]
    }
  }
  ```

- **TRẠNG THÁI KIỂM THỬ:** 

---

### UT05_Notifications_TC02 : ĐÁNH DẤU MỘT THÔNG BÁO LÀ ĐÃ ĐỌC

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Người dùng đã đăng nhập hợp lệ.
  - Thông báo có mã `notif_01` thuộc về tài khoản này và đang có cờ `is_read = false`.

- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_nguoi_dung>`
  - **Tham số đường dẫn (Path Params JSON):**

  ```json
  {
    "id": "notif_01"
  }
  ```

- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của người dùng vào mục **Headers**.
  2. Chọn phương thức **`PATCH`**, nhập đường dẫn API: `/api/v1/notifications/notif_01/read`.
  3. Không cần truyền dữ liệu vào phần Body.
  4. Bấm nút **Gửi (Send)** để thực thi request.

- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Trường `is_read` của document `notif_01` trên Firestore được cập nhật thành `true`.
  - Dữ liệu trả về đúng định dạng JSON chuẩn như sau:

  ```json
  {
    "success": true,
    "status_code": 200,
    "message": "Đã đánh dấu thông báo là đã đọc"
  }
  ```

- **TRẠNG THÁI KIỂM THỬ:** 

---

### UT05_Notifications_TC03 : ĐÁNH DẤU TOÀN BỘ THÔNG BÁO CỦA TÀI KHOẢN LÀ ĐÃ ĐỌC

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Người dùng đã đăng nhập hợp lệ và hiện có các thông báo chưa đọc trong hộp thư.

- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_nguoi_dung>`
  - **Dữ liệu thân (Body JSON):** `{}` (Rỗng)

- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của người dùng vào mục **Headers**.
  2. Chọn phương thức **`PATCH`**, nhập đường dẫn API: `/api/v1/notifications/read-all`.
  3. Không cần truyền dữ liệu vào phần Body.
  4. Bấm nút **Gửi (Send)** để thực thi request.

- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Toàn bộ thông báo thuộc sở hữu của user được cập nhật `is_read = true`, số đếm `unread_count` giảm về `0`.
  - Dữ liệu trả về đúng định dạng JSON chuẩn như sau:

  ```json
  {
    "success": true,
    "status_code": 200,
    "message": "Đã đánh dấu toàn bộ thông báo là đã đọc",
    "data": {
      "updated_count": 2,
      "unread_count": 0
    }
  }
  ```

- **TRẠNG THÁI KIỂM THỬ:** 

---

### UT05_Notifications_TC04 : CHẶN NGƯỜI DÙNG ĐÁNH DẤU ĐÃ ĐỌC THÔNG BÁO CỦA NGƯỜI KHÁC

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Thông báo có mã định danh `notif_other` thuộc về một người dùng khác trong hệ thống.
  - Người dùng hiện tại không có quyền truy cập vào thông báo này.

- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_nguoi_dung_hien_tai>`
  - **Tham số đường dẫn (Path Params JSON):**

  ```json
  {
    "id": "notif_other"
  }
  ```

- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của người dùng vào mục **Headers**.
  2. Chọn phương thức **`PATCH`**, nhập đường dẫn API: `/api/v1/notifications/notif_other/read`.
  3. Bấm nút **Gửi (Send)** để thực thi request.

- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống ném ra ngoại lệ từ chối quyền truy cập **HTTP 403 (FORBIDDEN - CẤM TRUY CẬP)**.
  - Dữ liệu lỗi trả về đúng định dạng JSON chuẩn như sau:

  ```json
  {
    "success": false,
    "status_code": 403,
    "error_code": "FORBIDDEN_NOTIFICATION_ACCESS",
    "message": "Người dùng không có quyền chỉnh sửa thông báo này"
  }
  ```

- **TRẠNG THÁI KIỂM THỬ:** 
