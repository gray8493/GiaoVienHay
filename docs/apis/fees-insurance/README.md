# Đặc Tả API Phân Hệ Quản Lý Học Phí & BHYT (Fees & Insurance API Specification)
# Module: Fees & Insurance (`/api/v1/fees-insurance`)

---

## 1. Tổng Quan Phân Hệ
Phân hệ **Fees & Insurance** quản lý công tác thu nộp nghĩa vụ tài chính của lớp chủ nhiệm:
- **Theo dõi qua 2 cờ Boolean kèm Ngày nộp thực tế:**
  - `is_paid_tuition` & `tuition_paid_date` (YYYY-MM-DD)
  - `is_paid_insurance` & `insurance_paid_date` (YYYY-MM-DD)
- **Tuyệt đối không có cổng thanh toán online:** Học sinh/phụ huynh hoàn thành trực tiếp tại lớp cho GVCN; GVCN dùng điện thoại/tablet để tích chọn trạng thái.
- **Đôn đốc thông minh:** GVCN lọc nhanh danh sách các em chưa nộp BHYT và bấm **"Gửi lời nhắc"** để hệ thống tự động bắn FCM tới điện thoại phụ huynh.

| Method | Endpoint | Quyền truy cập (RBAC) | Mô tả chức năng |
| :---: | :--- | :---: | :--- |
| `GET` | `/api/v1/fees-insurance/class/:classId` | `TEACHER_HOMEROOM` | GVCN xem danh sách thu nộp Học phí & BHYT của lớp |
| `PATCH` | `/api/v1/fees-insurance/toggle` | `TEACHER_HOMEROOM` | Tích chọn cờ đã nộp kèm cập nhật ngày nộp thực tế |
| `POST` | `/api/v1/fees-insurance/remind` | `TEACHER_HOMEROOM` | Gửi thông báo đẩy FCM nhắc các phụ huynh chưa nộp |

---

## 2. Chi Tiết Từng API

### 2.1. GET `/api/v1/fees-insurance/class/:classId` - Danh Sách Thu Nộp Của Lớp
- **Headers:** `Authorization: Bearer <token_gvcn>`

#### Response Thành Công (HTTP 200 OK)
```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "class_id": "cls_1a_2026",
    "term_name": "Học kỳ 1 năm học 2026-2027",
    "records": [
      {
        "record_id": "fee_01",
        "student_id": "stu_01",
        "student_name": "Trần Bảo Nam",
        "tuition": { "is_paid": true, "paid_date": "2026-09-15" },
        "insurance": { "is_paid": true, "paid_date": "2026-09-18" },
        "note": "Đã nộp đủ cả năm"
      },
      {
        "record_id": "fee_02",
        "student_id": "stu_02",
        "student_name": "Lê Ngọc Mai",
        "tuition": { "is_paid": true, "paid_date": "2026-09-16" },
        "insurance": { "is_paid": false, "paid_date": null },
        "note": null
      }
    ]
  }
}
```

---

### 2.2. PATCH `/api/v1/fees-insurance/toggle` - Cập Nhật Trạng Thái & Ngày Nộp
- **Headers:** `Authorization: Bearer <token_gvcn>`, `Content-Type: application/json`

#### Bảng Quy Định Dữ Liệu Đầu Vào (Input Specification)

| Tên trường (Field) | Vị trí | Bắt buộc / Tùy chọn | Phương thức nhập liệu | Kiểu dữ liệu & Ràng buộc validation |
| :--- | :---: | :---: | :---: | :--- |
| `record_id` | Body | **Bắt buộc** | Hệ thống nạp tự động | Chuỗi ID bản ghi theo dõi học phí/BHYT của học sinh. |
| `fee_type` | Body | **Bắt buộc** | **Chọn nút bấm UI (Tab/Chip)** | Enum khoản thu: `TUITION` (Học phí) hoặc `INSURANCE` (BHYT). |
| `is_paid` | Body | **Bắt buộc** | **Gạt nút bật/tắt (UI Switch Toggle)** | `true` (Đã nộp) hoặc `false` (Chưa nộp). |
| `paid_date` | Body | **Bắt buộc nếu is_paid = true** | **Gõ bàn phím / Chọn DatePicker** | Chuỗi ngày ISO `YYYY-MM-DD`.<br>1. Phải là ngày tồn tại trong lịch thực tế (loại bỏ `2026-02-30`).<br>2. Không được vượt quá ngày hiện tại (`<= today`). |
| `note` | Body | **Tùy chọn** (Optional) | **Gõ tự do từ bàn phím** | Ghi chú thêm (VD: "Đã nộp tiền mặt", "Chuyển khoản qua ngân hàng"). Tối đa 255 ký tự. Tự động `trim()`. |

#### Request Body Hợp Lệ
```json
{
  "record_id": "fee_02",
  "fee_type": "INSURANCE",
  "is_paid": true,
  "paid_date": "2026-09-23",
  "note": "Đã nộp tiền mặt tại lớp"
}
```

#### Response Thành Công (HTTP 200 OK)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Cập nhật trạng thái nộp tiền thành công",
  "data": {
    "record_id": "fee_02",
    "is_paid_insurance": true,
    "insurance_paid_date": "2026-09-23",
    "insurance_paid_at": "2026-09-23T10:45:00.000Z"
  }
}
```

#### Các Response Thất Bại & Lỗi Validation Chi Tiết

##### 1. Ngày nộp tiền không có thật trên lịch (HTTP 400 Bad Request)
> **Tình huống:** Người dùng gõ tay ngày `2026-02-30`:
```json
{
  "success": false,
  "status_code": 400,
  "message": "Ngày nộp tiền không hợp lệ hoặc không tồn tại trong lịch thực tế",
  "error_code": "COMMON_VALIDATION_ERROR",
  "details": [
    {
      "field": "paid_date",
      "issue": "Giá trị '2026-02-30' không phải là ngày hợp lệ trong lịch thực tế (tháng 2 năm 2026 chỉ có 28 ngày)"
    }
  ],
  "timestamp": "2026-09-27T08:30:00.000Z"
}
```

##### 2. Ngày nộp tiền ở tương lai (HTTP 400 Bad Request)
> **Tình huống:** Chọn ngày nộp tiền vượt quá ngày hôm nay:
```json
{
  "success": false,
  "status_code": 400,
  "message": "Ngày nộp tiền không thể ở tương lai",
  "error_code": "COMMON_VALIDATION_ERROR",
  "details": [
    {
      "field": "paid_date",
      "issue": "Ngày hoàn thành nộp tiền không được vượt quá ngày hiện tại (2026-09-27)"
    }
  ],
  "timestamp": "2026-09-27T08:30:00.000Z"
}
```

##### 3. Đợt thu phí đã kết thúc/khóa sổ (HTTP 400 Bad Request)
```json
{
  "success": false,
  "status_code": 400,
  "message": "Đợt thu này đã được kế toán trường khóa sổ, không thể điều chỉnh",
  "error_code": "FEE_TERM_LOCKED",
  "details": null,
  "timestamp": "2026-09-27T08:30:00.000Z"
}
```

##### Không phải GVCN của lớp (HTTP 403 Forbidden)
```json
{
  "success": false,
  "status_code": 403,
  "message": "Chỉ giáo viên chủ nhiệm mới có quyền quản lý và thu nộp học phí, BHYT của lớp này",
  "error_code": "AUTH_FORBIDDEN",
  "details": null,
  "timestamp": "2026-09-27T08:30:00.000Z"
}
```

##### Bản ghi thu nộp không tồn tại (HTTP 404 Not Found)
```json
{
  "success": false,
  "status_code": 404,
  "message": "Không tìm thấy hồ sơ theo dõi học phí này",
  "error_code": "FEE_RECORD_NOT_FOUND",
  "details": null,
  "timestamp": "2026-09-27T08:30:00.000Z"
}
```

---

## 3. Bảng Tổng Hợp Mã Lỗi Phân Hệ Fees & Insurance

| HTTP Status | Mã Lỗi (`error_code`) | Ý nghĩa & Tình huống xảy ra |
| :---: | :--- | :--- |
| `400` | `FEE_TERM_LOCKED` | Kỳ thu học phí/BHYT đã được nhà trường đóng sổ, không thể chỉnh sửa. |
| `400` | `COMMON_VALIDATION_ERROR` | Thiếu trường bắt buộc (`record_id`, `fee_type`, `is_paid`,...). |
| `401` | `AUTH_UNAUTHORIZED` | Bearer token không hợp lệ hoặc đã hết hạn. |
| `403` | `AUTH_FORBIDDEN` | Tài khoản không phải GVCN của lớp học tương ứng. |
| `404` | `FEE_RECORD_NOT_FOUND` | `record_id` không tồn tại trong hệ thống. |
| `404` | `CLASS_NOT_FOUND` | Lớp học không tồn tại. |
| `500` | `SYS_INTERNAL_ERROR` | Lỗi máy chủ cơ sở dữ liệu nội bộ. |

