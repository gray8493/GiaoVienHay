# TÀI LIỆU KỊCH BẢN KIỂM THỬ ĐƠN VỊ - PHÂN HỆ THÔNG BÁO ĐẨY
# MÃ PHÂN HỆ: 11 - NOTIFICATIONS & FCM MODULE
# CẤP ĐỘ KIỂM THỬ: KIỂM THỬ ĐƠN VỊ (UNIT TEST)

---

## 1. THÔNG TIN CHUNG

- **PHÂN HỆ HỆ THỐNG:** `11` - Phân hệ Lịch sử thông báo đẩy FCM
- **MÔ TẢ MODULE API:** Quản lý lịch sử thông báo (`NotificationsService`, `NotificationsController`)
- **TẬP TIN KIỂM THỬ:** `apps/api/src/modules/11-notifications/notifications.service.spec.ts`, `apps/api/src/modules/11-notifications/notifications.controller.spec.ts`
- **NGƯỜI THỰC HIỆN:** Thái Bảo
- **MÔI TRƯỜNG KIỂM THỬ:** Testing

---

## 2. CHI TIẾT CÁC KỊCH BẢN KIỂM THỬ ĐƠN VỊ

---

### UT11_Notifications_TC01 : LẤY DANH SÁCH LỊCH SỬ THÔNG BÁO CỦA TÀI KHOẢN

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Người dùng (Giáo viên hoặc Phụ huynh) đã đăng nhập thành công vào hệ thống với token `usr_parent_01`.
  - Tài khoản hiện có 15 bản ghi thông báo trong cơ sở dữ liệu, trong đó có 2 thông báo ở trạng thái chưa đọc.

- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_usr_parent_01>`
  - **Tham số truy vấn (Query Params):**

  ```json
  {
    "page": 1,
    "limit": 10
  }
  ```

- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của người dùng vào mục **Headers** (`Authorization: Bearer <token_usr_parent_01>`).
  2. Chọn phương thức **`GET`**, nhập đường dẫn API kèm tham số: `/api/v1/notifications?page=1&limit=10`.
  3. Bấm nút **Gửi (Send)** để thực thi request.

- **KẾT QUẢ MONG ĐỢI:**

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

### UT11_Notifications_TC02 : LỌC DANH SÁCH THÔNG BÁO THEO TRẠNG THÁI CHƯA ĐỌC

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Người dùng đã đăng nhập hợp lệ với token `usr_parent_01`.
  - Hộp thư có tổng cộng 15 thông báo, trong đó chính xác 2 thông báo có `is_read = false`.

- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_usr_parent_01>`
  - **Tham số truy vấn (Query Params):**

  ```json
  {
    "is_read": false
  }
  ```

- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực vào **Headers**.
  2. Chọn phương thức **`GET`**, gọi API: `/api/v1/notifications?is_read=false`.
  3. Bấm nút **Gửi (Send)** để thực thi request.

- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": true,
    "status_code": 200,
    "data": {
      "unread_count": 2,
      "total": 2,
      "items": [
        {
          "id": "notif_01",
          "title": "Nhắc lịch kiểm tra môn Toán",
          "is_read": false,
          "created_at": "2026-09-23T10:30:00.000Z"
        },
        {
          "id": "notif_02",
          "title": "Bảng điểm học kỳ 1 môn Toán đã công bố",
          "is_read": false,
          "created_at": "2026-09-22T08:15:00.000Z"
        }
      ]
    }
  }
  ```

- **TRẠNG THÁI KIỂM THỬ:**

---

### UT11_Notifications_TC03 : TRUY XUẤT THÔNG BÁO CÓ ĐẦY ĐỦ METADATA ĐIỀU HƯỚNG SÂU (DEEP-LINKING)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Trong Firestore tồn tại thông báo phát sinh từ sự kiện nhận xét học sinh mới với mã `notif_remark_01`.

- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_usr_parent_01>`
  - **Tham số truy vấn (Query Params):**

  ```json
  {
    "page": 1,
    "limit": 1
  }
  ```

- **CÁC BƯỚC THỰC HIỆN:**
  1. Gửi request `GET /api/v1/notifications?page=1&limit=1`.
  2. Bấm nút **Gửi (Send)** để thực thi request.

- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": true,
    "status_code": 200,
    "data": {
      "unread_count": 1,
      "total": 1,
      "items": [
        {
          "id": "notif_remark_01",
          "title": "Lời nhận xét mới từ GVCN",
          "body": "Cô giáo đã gửi lời nhận xét tuần 4 cho học sinh Trần Bảo Nam.",
          "type": "REMARK_NEW",
          "is_read": false,
          "metadata": {
            "student_id": "stu_01",
            "screen": "REMARK_DETAIL",
            "ref_id": "rem_001"
          },
          "created_at": "2026-09-24T09:00:00.000Z"
        }
      ]
    }
  }
  ```

- **TRẠNG THÁI KIỂM THỬ:**

---

### UT11_Notifications_TC04 : XỬ LÝ AN TOÀN KHI BẤM VÀO THÔNG BÁO THÔNG TIN CHUNG KHÔNG CÓ METADATA ĐIỀU HƯỚNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Thông báo mã `notif_broadcast_01` là thông báo thông tin chung toàn trường (nghỉ bão, bảo trì hệ thống), không chứa metadata điều hướng màn hình (`metadata: null` hoặc không có `screen`).
  - Thông báo thuộc tài khoản `usr_parent_01` và đang có trạng thái `is_read = false`.

- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_usr_parent_01>`
  - **Tham số đường dẫn (Path Params):** `/api/v1/notifications/notif_broadcast_01/read`

- **CÁC BƯỚC THỰC HIỆN:**
  1. Người dùng chạm vào thông báo thông tin chung trên màn hình ứng dụng di động.
  2. Ứng dụng gửi request `PATCH /api/v1/notifications/notif_broadcast_01/read`.
  3. Bấm nút **Gửi (Send)** để thực thi request.

- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": true,
    "status_code": 200,
    "message": "Đã đánh dấu thông báo là đã đọc"
  }
  ```

- **TRẠNG THÁI KIỂM THỬ:**

---

### UT11_Notifications_TC05 : ĐÁNH DẤU MỘT THÔNG BÁO LÀ ĐÃ ĐỌC THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Người dùng đã đăng nhập hợp lệ với token `usr_parent_01`.
  - Thông báo có mã `notif_01` thuộc về tài khoản này và đang có cờ `is_read = false`.

- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_usr_parent_01>`
  - **Tham số đường dẫn (Path Params):** `/api/v1/notifications/notif_01/read`

- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của người dùng vào mục **Headers**.
  2. Chọn phương thức **`PATCH`**, nhập đường dẫn API: `/api/v1/notifications/notif_01/read`.
  3. Bấm nút **Gửi (Send)** để thực thi request.

- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": true,
    "status_code": 200,
    "message": "Đã đánh dấu thông báo là đã đọc"
  }
  ```

- **TRẠNG THÁI KIỂM THỬ:**

---

### UT11_Notifications_TC06 : ĐÁNH DẤU TOÀN BỘ THÔNG BÁO CỦA TÀI KHOẢN LÀ ĐÃ ĐỌC

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Người dùng đã đăng nhập hợp lệ và hiện có 5 thông báo chưa đọc trong hộp thư.

- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_usr_parent_01>`
  - **Dữ liệu thân (Body JSON):** `{}`

- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của người dùng vào mục **Headers**.
  2. Chọn phương thức **`PATCH`**, nhập đường dẫn API: `/api/v1/notifications/read-all`.
  3. Bấm nút **Gửi (Send)** để thực thi request.

- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": true,
    "status_code": 200,
    "message": "Đã đánh dấu toàn bộ thông báo là đã đọc",
    "data": {
      "updated_count": 5,
      "unread_count": 0
    }
  }
  ```

- **TRẠNG THÁI KIỂM THỬ:**

---

### UT11_Notifications_TC07 : TRUY XUẤT HỘP THƯ RỖNG CHO TÀI KHOẢN MỚI CHƯA CÓ THÔNG BÁO

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Tài khoản phụ huynh mới đăng ký vào hệ thống (`usr_parent_new`), chưa phát sinh bất kỳ thông báo nào.

- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_usr_parent_new>`
  - **Tham số truy vấn (Query Params):**

  ```json
  {
    "page": 1,
    "limit": 20
  }
  ```

- **CÁC BƯỚC THỰC HIỆN:**
  1. Gửi request `GET /api/v1/notifications`.
  2. Bấm nút **Gửi (Send)** để thực thi request.

- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": true,
    "status_code": 200,
    "data": {
      "unread_count": 0,
      "total": 0,
      "items": []
    }
  }
  ```

- **TRẠNG THÁI KIỂM THỬ:**

---

### UT11_Notifications_TC08 : TRUY VẤN SỐ TRANG VƯỢT QUÁ TỔNG SỐ BẢN GHI HIỆN CÓ

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Hộp thư người dùng chỉ có tổng cộng 15 thông báo.

- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_usr_parent_01>`
  - **Tham số truy vấn (Query Params):**

  ```json
  {
    "page": 9999,
    "limit": 20
  }
  ```

- **CÁC BƯỚC THỰC HIỆN:**
  1. Gửi request `GET /api/v1/notifications?page=9999&limit=20`.
  2. Bấm nút **Gửi (Send)** để thực thi request.

- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": true,
    "status_code": 200,
    "data": {
      "unread_count": 2,
      "total": 15,
      "items": []
    }
  }
  ```

- **TRẠNG THÁI KIỂM THỬ:**

---

### UT11_Notifications_TC09 : XỬ LÝ AN TOÀN KHI ĐÁNH DẤU ĐÃ ĐỌC CHO THÔNG BÁO ĐÃ ĐỌC RỒI (IDEMPOTENCY)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Thông báo `notif_01` vốn đã có cờ `is_read = true` từ thao tác trước đó.

- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_usr_parent_01>`
  - **Tham số đường dẫn (Path Params):** `/api/v1/notifications/notif_01/read`

- **CÁC BƯỚC THỰC HIỆN:**
  1. Người dùng chạm lại vào thông báo đã đọc, gửi request `PATCH /api/v1/notifications/notif_01/read`.
  2. Bấm nút **Gửi (Send)** để thực thi request.

- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": true,
    "status_code": 200,
    "message": "Đã đánh dấu thông báo là đã đọc"
  }
  ```

- **TRẠNG THÁI KIỂM THỬ:**

---

### UT11_Notifications_TC10 : CHẶN SỐ TRANG PHÂN TRANG KHÔNG HỢP LỆ (PAGE <= 0)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Người dùng đã đăng nhập hợp lệ.

- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_usr_parent_01>`
  - **Tham số truy vấn (Query Params):**

  ```json
  {
    "page": 0,
    "limit": 10
  }
  ```

- **CÁC BƯỚC THỰC HIỆN:**
  1. Gửi request `GET /api/v1/notifications?page=0&limit=10`.
  2. Bấm nút **Gửi (Send)** để thực thi request.

- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 400,
    "error_code": "COMMON_VALIDATION_ERROR",
    "message": "Số trang (page) phải là số nguyên dương lớn hơn hoặc bằng 1"
  }
  ```

- **TRẠNG THÁI KIỂM THỬ:**

---

### UT11_Notifications_TC11 : CHẶN SỐ LƯỢNG MỖI TRANG VƯỢT QUÁ GIỚI HẠN TỐI ĐA (LIMIT > 100)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giới hạn tối đa của hệ thống cho mỗi trang là 100 bản ghi (`max: 100`).

- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_usr_parent_01>`
  - **Tham số truy vấn (Query Params):**

  ```json
  {
    "page": 1,
    "limit": 150
  }
  ```

- **CÁC BƯỚC THỰC HIỆN:**
  1. Gửi request `GET /api/v1/notifications?page=1&limit=150`.
  2. Bấm nút **Gửi (Send)** để thực thi request.

- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 400,
    "error_code": "COMMON_VALIDATION_ERROR",
    "message": "Số lượng bản ghi mỗi trang (limit) không được vượt quá 100"
  }
  ```

- **TRẠNG THÁI KIỂM THỬ:**

---

### UT11_Notifications_TC12 : ĐẢM BẢO TÍNH CÔ LẬP DỮ LIỆU CHỈ TRẢ VỀ THÔNG BÁO CỦA CHÍNH TÀI KHOẢN ĐĂNG NHẬP

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Trong Firestore tồn tại các thông báo của `usr_parent_01` và `usr_parent_02`.

- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_usr_parent_01>`
  - **Tham số truy vấn (Query Params):**

  ```json
  {
    "page": 1,
    "limit": 10
  }
  ```

- **CÁC BƯỚC THỰC HIỆN:**
  1. Phụ huynh 1 gửi request `GET /api/v1/notifications`.
  2. Bấm nút **Gửi (Send)** để thực thi request.

- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": true,
    "status_code": 200,
    "data": {
      "unread_count": 1,
      "total": 1,
      "items": [
        {
          "id": "notif_01",
          "title": "Nhắc lịch kiểm tra môn Toán",
          "recipient_user_id": "usr_parent_01"
        }
      ]
    }
  }
  ```

- **TRẠNG THÁI KIỂM THỬ:**

---

### UT11_Notifications_TC13 : TỪ CHỐI THAO TÁC KHI MÃ THÔNG BÁO KHÔNG TỒN TẠI TRONG CƠ SỞ DỮ LIỆU

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Mã thông báo `notif_nonexistent_999` không tồn tại trong Firestore collection `/notifications`.

- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_usr_parent_01>`
  - **Tham số đường dẫn (Path Params):** `/api/v1/notifications/notif_nonexistent_999/read`

- **CÁC BƯỚC THỰC HIỆN:**
  1. Gửi request `PATCH /api/v1/notifications/notif_nonexistent_999/read`.
  2. Bấm nút **Gửi (Send)** để thực thi request.

- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 404,
    "error_code": "NOTI_NOT_FOUND",
    "message": "Không tìm thấy bản ghi thông báo trong hộp thư."
  }
  ```

- **TRẠNG THÁI KIỂM THỬ:**

---

### UT11_Notifications_TC14 : TRUY XUẤT HỘP THƯ KHI HỌC SINH ĐÃ LIÊN KẾT VÀ DỮ LIỆU ĐÃ CÔNG BỐ NHƯNG NGƯỜI DÙNG VẪN KHÔNG NHẬN ĐƯỢC THÔNG BÁO

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Học sinh `stu_01` đã liên kết hợp lệ với tài khoản phụ huynh `usr_parent_01` (`parent_uids` chứa `"usr_parent_01"`).
  - Giáo viên đã thực hiện thao tác công bố bảng điểm môn học thành công (`is_published = true`).
  - Tuy nhiên, do lỗi gián đoạn tiến trình lưu trữ nền (Background Worker / Task Queue Failure), bản ghi thông báo tương ứng cho phụ huynh `usr_parent_01` không được tạo thành công trong collection `/notifications`.

- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_usr_parent_01>`
  - **Tham số truy vấn (Query Params):**

  ```json
  {
    "page": 1,
    "limit": 20
  }
  ```

- **CÁC BƯỚC THỰC HIỆN:**
  1. Phụ huynh đăng nhập vào ứng dụng và truy cập vào màn hình Hộp thư thông báo.
  2. Gửi request `GET /api/v1/notifications?page=1&limit=20`.
  3. Bấm nút **Gửi (Send)** để thực thi request.

- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": true,
    "status_code": 200,
    "data": {
      "unread_count": 0,
      "total": 0,
      "items": []
    }
  }
  ```

- **TRẠNG THÁI KIỂM THỬ:**

---

### UT11_Notifications_TC15 : XỬ LÝ LỖI KHI DỊCH VỤ HẠ TẦNG GOOGLE FIREBASE FCM GẶP SỰ CỐ

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên phê duyệt công bố điểm hoặc gửi thông báo mới.
  - Dịch vụ Google Firebase FCM bị ngắt kết nối hoặc trả về lỗi `503 Service Unavailable`.

- **DỮ LIỆU ĐẦU VÀO:**
  - Sự kiện phát thông báo đẩy từ hệ thống Backend.

- **CÁC BƯỚC THỰC HIỆN:**
  1. Giả lập (Mock) Google Firebase Admin SDK ném ngoại lệ khi gọi hàm `sendEachForMulticast()`.
  2. Bấm nút **Gửi (Send)** để thực thi request.

- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 500,
    "error_code": "NOTI_DISPATCH_FAILED",
    "message": "Lỗi dịch vụ Google Firebase FCM khi gửi thông báo đẩy."
  }
  ```

- **TRẠNG THÁI KIỂM THỬ:**

---

### UT11_Notifications_TC16 : TỪ CHỐI THAO TÁC DO KHÔNG CÓ TOKEN XÁC THỰC HOẶC TOKEN ĐÃ HẾT HẠN (401 UNAUTHORIZED)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Người dùng chưa đăng nhập hoặc Firebase ID Token đã quá hạn 1800 giây.

- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** Không truyền header `Authorization` hoặc `Authorization: Bearer <token_het_han>`
  - **Tham số truy vấn (Query Params):** `page=1&limit=20`

- **CÁC BƯỚC THỰC HIỆN:**
  1. Gửi request `GET /api/v1/notifications?page=1&limit=20` mà không kèm token hợp lệ.
  2. Bấm nút **Gửi (Send)** để thực thi request.

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

### UT11_Notifications_TC17 : XỬ LÝ LỖI MÁY CHỦ CƠ SỞ DỮ LIỆU NỘI BỘ FIRESTORE (500 INTERNAL SERVER ERROR)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Người dùng gửi request truy xuất thông báo hợp lệ.
  - Cụm cơ sở dữ liệu Firestore bị mất kết nối hoặc quá thời gian chờ (Deadline Exceeded / Connection Refused).

- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_usr_parent_01>`
  - **Tham số truy vấn (Query Params):** `page=1&limit=20`

- **CÁC BƯỚC THỰC HIỆN:**
  1. Giả lập (Mock) Firestore ném ngoại lệ kết nối `UNAVAILABLE` hoặc `DEADLINE_EXCEEDED`.
  2. Gửi request `GET /api/v1/notifications?page=1&limit=20`.

- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 500,
    "error_code": "SYS_INTERNAL_ERROR",
    "message": "Lỗi máy chủ cơ sở dữ liệu nội bộ. Vui lòng thử lại sau giây lát."
  }
  ```

- **TRẠNG THÁI KIỂM THỬ:**

---

### UT11_Notifications_TC18 : TỪ CHỐI TRUY VẤN VỚI THAM SỐ LỌC TRẠNG THÁI ĐÃ ĐỌC SAI ĐỊNH DẠNG BOOLEAN (400 BAD REQUEST)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Người dùng đã đăng nhập hợp lệ vào hệ thống.

- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_usr_parent_01>`
  - **Tham số truy vấn (Query Params):**

  ```json
  {
    "is_read": "khong_hop_le"
  }
  ```

- **CÁC BƯỚC THỰC HIỆN:**
  1. Gửi request `GET /api/v1/notifications?is_read=khong_hop_le`.
  2. Bấm nút **Gửi (Send)** để thực thi request.

- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 400,
    "error_code": "COMMON_VALIDATION_ERROR",
    "message": "Tham số is_read phải là kiểu boolean (true hoặc false)"
  }
  ```

- **TRẠNG THÁI KIỂM THỬ:**

---
