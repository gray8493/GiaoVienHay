# Đặc Tả API Phân Hệ Thông Báo Đẩy (Notification API Specification)
# Module: Notifications (`/api/v1/notifications`)

---

## 1. POST `/api/v1/notifications/device-token` - Đăng ký Device Token (FCM)

- **Mô tả:** Mobile App React Native gửi FCM Token của thiết bị sau khi đăng nhập để nhận thông báo đẩy.
- **Quyền truy cập:** `PARENT` hoặc `TEACHER` (`Bearer <access_token>`).

### Request Body
```json
{
  "device_token": "fcm_token_example_dK9sL2_mZ...",
  "platform": "ANDROID",
  "device_model": "Samsung Galaxy S22"
}
```

### Response Thành Công (HTTP 200 OK)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Cập nhật mã thiết bị FCM thành công",
  "data": {
    "registered": true
  },
  "timestamp": "2026-09-22T08:05:00.000Z"
}
```

---

## 2. GET `/api/v1/notifications` - Danh sách thông báo của người dùng

- **Mô tả:** Lấy danh sách lịch sử thông báo đã gửi cho tài khoản (có phân trang).
- **Quyền truy cập:** Đã đăng nhập (`Bearer <access_token>`).

### Query Parameters
- `page` (number, default: 1)
- `limit` (number, default: 20)

### Response Thành Công (HTTP 200 OK)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Lấy danh sách thông báo thành công",
  "data": {
    "items": [
      {
        "id": "noti_6728a9b",
        "title": "Thông báo điểm thi mới",
        "body": "Đã có điểm kiểm tra 1 tiết môn Toán của học sinh Nguyễn Văn An",
        "type": "GRADE_ALERT",
        "is_read": false,
        "created_at": "2026-09-22T09:30:15.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20
  },
  "timestamp": "2026-09-22T09:35:00.000Z"
}
```
