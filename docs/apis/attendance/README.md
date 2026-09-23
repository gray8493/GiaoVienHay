# Đặc Tả API Phân Hệ Điểm Danh & Chuyên Cần (Attendance API Specification)
# Module: Attendance (`/api/v1/attendance`)

---

## 1. Tổng Quan Phân Hệ
Phân hệ **Attendance** phục vụ công tác điểm danh nhanh 1-chạm của Giáo viên chủ nhiệm (GVCN) vào đầu mỗi buổi học. Khi có học sinh vắng mặt, hệ thống tự động kích hoạt thông báo đẩy tức thời (FCM) đến điện thoại của phụ huynh. Ngoài ra, phân hệ cung cấp danh sách học sinh **CÓ MẶT HÔM NAY** để phục vụ Vòng quay kiểm tra bài cũ.

| Method | Endpoint | Quyền truy cập (RBAC) | Mô tả chức năng |
| :---: | :--- | :---: | :--- |
| `POST` | `/api/v1/attendance/submit` | `TEACHER_HOMEROOM` | Điểm danh chuyên cần đầu giờ $\rightarrow$ Tự động bắn FCM cảnh báo vắng |
| `GET` | `/api/v1/attendance/class/:classId` | `TEACHER_*` | Xem lịch sử điểm danh của lớp theo ngày/tháng |
| `GET` | `/api/v1/attendance/today/:classId` | `TEACHER_*` | Lấy danh sách học sinh **CÓ MẶT HÔM NAY** (cho Vòng quay random) |

---

## 2. Chi Tiết Từng API

### 2.1. POST `/api/v1/attendance/submit` - Điểm Danh Chuyên Cần Đầu Giờ
- **Headers:** `Authorization: Bearer <token_gvcn>`, `Content-Type: application/json`

#### Request Body
```json
{
  "class_id": "cls_1a_2026",
  "attendance_date": "2026-09-23",
  "period": 1,
  "records": [
    { "student_id": "stu_01", "status": "PRESENT", "note": null },
    { "student_id": "stu_02", "status": "ABSENT_EXCUSED", "note": "Phụ huynh xin nghỉ ốm" },
    { "student_id": "stu_03", "status": "ABSENT_UNEXCUSED", "note": null }
  ]
}
```

#### Response Thành Công (HTTP 201 Created)
```json
{
  "success": true,
  "status_code": 201,
  "message": "Điểm danh hoàn tất và đã gửi thông báo vắng tới phụ huynh",
  "data": {
    "attendance_date": "2026-09-23",
    "total_students": 3,
    "present_count": 1,
    "absent_count": 2,
    "notified_parents": 2
  }
}
```
- **Ràng buộc Firestore:** Lưu các document vào collection `/attendances`.
- **Trigger sự kiện:** Nếu `status` là `ABSENT_*`, hệ thống tra cứu `parent_uids` và gửi Push Notification tức thì qua Firebase Cloud Messaging.

---

### 2.2. GET `/api/v1/attendance/today/:classId` - Danh Sách Học Sinh Có Mặt Hôm Nay
- **Mô tả:** Truy xuất cực nhanh danh sách học sinh có mặt hôm nay kết hợp Composite Index Firestore `(class_id, attendance_date, status)` để nạp vào Vòng quay kiểm tra bài cũ.

#### Response Thành Công (HTTP 200 OK)
```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "class_id": "cls_1a_2026",
    "today": "2026-09-23",
    "present_students": [
      { "id": "stu_01", "full_name": "Trần Bảo Nam", "student_code": "HS001" },
      { "id": "stu_04", "full_name": "Hoàng Minh Khôi", "student_code": "HS004" }
    ]
  }
}
```
