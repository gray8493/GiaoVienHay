# Đặc Tả API Phân Hệ Thông Báo Đẩy (Notifications API Specification)
# Module: Notifications (`/api/v1/notifications`)

---

## 1. Tổng Quan Phân Hệ
Phân hệ **Notifications** quản lý toàn bộ nhật ký các thông báo đẩy đã phát tới người dùng qua **Firebase Cloud Messaging (FCM)**:
- Cảnh báo vắng học (từ phân hệ điểm danh).
- Thông báo điểm mới / bảng điểm được công bố (từ phân hệ sổ điểm).
- Lời nhận xét mới từ giáo viên (từ phân hệ nhận xét).
- Lời nhắc lịch kiểm tra sắp tới (từ phân hệ lịch thi).
- Lời nhắc nộp tiền BHYT / Học phí (từ phân hệ học phí).

| Method | Endpoint | Quyền truy cập (RBAC) | Mô tả chức năng |
| :---: | :--- | :---: | :--- |
| `GET` | `/api/v1/notifications` | Authenticated | Lấy danh sách lịch sử thông báo của tài khoản |
| `PATCH` | `/api/v1/notifications/:id/read` | Authenticated | Đánh dấu 1 thông báo là đã đọc |
| `PATCH` | `/api/v1/notifications/read-all` | Authenticated | Đánh dấu toàn bộ thông báo của tài khoản là đã đọc |

---

## 2. Chi Tiết Từng API

### 2.1. GET `/api/v1/notifications` - Danh Sách Thông Báo
- **Headers:** `Authorization: Bearer <access_token>`

#### Bảng Quy Định Dữ Liệu Đầu Vào (Input Specification)

| Tên tham số (Parameter) | Vị trí | Bắt buộc / Tùy chọn | Phương thức nhập liệu | Kiểu dữ liệu & Ràng buộc validation |
| :--- | :---: | :---: | :---: | :--- |
| `page` | Query | **Tùy chọn** (Default: 1) | Hệ thống tự phân trang | Số nguyên dương `>= 1`. |
| `limit` | Query | **Tùy chọn** (Default: 20) | Hệ thống tự cấu hình | Số nguyên từ `1` đến `100`. |
| `is_read` | Query | **Tùy chọn** | **Bấm chọn Tab (Tất cả / Chưa đọc)** | Boolean: `true` hoặc `false`. |

#### Response Thành Công (HTTP 200 OK)
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

---

### 2.2. PATCH `/api/v1/notifications/:id/read` - Đánh Dấu Đã Đọc
- **Mô tả:** Cập nhật trường `is_read = true` trong collection `/notifications/{id}`.

#### Response Thành Công (HTTP 200 OK)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Đã đánh dấu thông báo là đã đọc"
}
```

#### Response Thất Bại Thường Gặp
##### Thông báo không tồn tại hoặc không thuộc tài khoản (HTTP 404 Not Found)
```json
{
  "success": false,
  "status_code": 404,
  "message": "Không tìm thấy thông báo này trên hệ thống",
  "error_code": "NOTI_NOT_FOUND",
  "details": null,
  "timestamp": "2026-09-27T08:30:00.000Z"
}
```

---

## 3. Bảng Tổng Hợp Mã Lỗi Phân Hệ Notifications

| HTTP Status | Mã Lỗi (`error_code`) | Ý nghĩa & Tình huống xảy ra |
| :---: | :--- | :--- |
| `400` | `COMMON_VALIDATION_ERROR` | Tham số query pagination không hợp lệ. |
| `401` | `AUTH_UNAUTHORIZED` | Bearer token không hợp lệ hoặc đã hết hạn. |
| `403` | `AUTH_FORBIDDEN` | Người dùng cố tình đánh dấu đã đọc thông báo của tài khoản khác. |
| `404` | `NOTI_NOT_FOUND` | `id` thông báo không tồn tại trong Firestore. |
| `500` | `SYS_INTERNAL_ERROR` | Lỗi máy chủ cơ sở dữ liệu nội bộ. |

