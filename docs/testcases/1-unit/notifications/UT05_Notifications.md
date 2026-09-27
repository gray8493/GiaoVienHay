# Kịch Bản Kiểm Thử Đơn Vị (Unit Test Specification) - Phân Hệ Thông Báo Đẩy (FCM)
# Module: Notifications (`/api/v1/notifications`)
# Cấp Độ: Unit Test (UT) - Framework: Jest / NestJS Testing
# Quy Tắc Tuân Thủ: rules/testcase-rules.md

---

## 1. Thông Tin Chung

- **Phân hệ:** `05` - Notification & FCM Module (Theo rules/testcase-rules.md)
- **Module API:** Notifications (`NotificationsService`, `NotificationsController`)
- **Tập tin kiểm thử:** `src/features/notifications/notifications.service.spec.ts`
- **Người thực hiện:** QA / Developer
- **Môi trường:** Isolated Unit Testing (Mock Firestore Notification Collection)

---

## 2. Bảng Danh Sách Unit Test Cases

| Mã Testcase | Tên Kịch Bản | Mục Tiêu Kiểm Thử | Dữ Liệu Đầu Vào (Mock Input) | Kết Quả Mong Đợi (Assertion) | Trạng Thái |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **UT05_Notifications_TC01** | `getNotifications()` danh sách thông báo | Lấy danh sách lịch sử thông báo phân trang của tài khoản hiện tại | Headers: `Bearer user_token`<br>Query: `page = 1`, `limit = 10` | Trả về HTTP 200, `unread_count`, mảng `items` gồm danh sách thông báo đẩy sắp xếp `created_at DESC` | **PASS** |
| **UT05_Notifications_TC02** | `markAsRead()` đánh dấu 1 tin đã đọc | Cập nhật `is_read = true` cho 1 thông báo cụ thể | Param: `id = notif_01` | Trả về HTTP 200, Firestore document `notif_01` cập nhật `is_read = true` | **PASS** |
| **UT05_Notifications_TC03** | `markAllAsRead()` đánh dấu đọc tất cả | Chuyển toàn bộ thông báo chưa đọc của user thành đã đọc | Headers: `Bearer user_token` | Trả về HTTP 200, `unread_count` trả về bằng 0 | **PASS** |
| **UT05_Notifications_TC04** | `markAsRead()` chặn cập nhật tin người khác | Chặn người dùng đánh dấu đã đọc thông báo không thuộc về mình | Param: `id = notif_other`<br>Headers: `Bearer user_token` | Ném `ForbiddenException` (403), mã lỗi `FORBIDDEN_NOTIFICATION_ACCESS` | **PASS** |
