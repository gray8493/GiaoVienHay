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

#### Request Body
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
