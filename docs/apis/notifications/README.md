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
- **Query Params:** `page` (default: 1), `limit` (default: 20), `is_read` (`true`/`false`)

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
