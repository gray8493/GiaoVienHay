# Đặc Tả API Phân Hệ Lời Nhắc Lịch Kiểm Tra (Exam Reminders API Specification)
# Module: Exam Reminders (`/api/v1/exam-reminders`)

---

## 1. Tổng Quan Phân Hệ
Phân hệ **Exam Reminders** hỗ trợ Giáo viên (cả GVBM và GVCN) gửi thông báo về các bài kiểm tra sắp tới:
- **Nội dung nhắc nhở:** Môn học, Loại bài kiểm tra (15 phút, 1 tiết, Giữa kỳ, Cuối kỳ), Ngày giờ diễn ra, và Lời dặn dò trọng tâm bài học.
- **Kích hoạt thông báo tức thì (FCM):** Toàn bộ phụ huynh trong lớp nhận được thông báo đẩy trên điện thoại để đồng hành, đôn đốc con em ôn tập kỹ lưỡng ở nhà.

| Method | Endpoint | Quyền truy cập (RBAC) | Mô tả chức năng |
| :---: | :--- | :---: | :--- |
| `POST` | `/api/v1/exam-reminders` | `TEACHER_*` | Tạo lời nhắc lịch kiểm tra $\rightarrow$ Bắn FCM tới toàn bộ PH trong lớp |
| `GET` | `/api/v1/exam-reminders/class/:classId` | `TEACHER_*`, `PARENT` | Lấy danh sách các lịch kiểm tra sắp tới của lớp học |

---

## 2. Chi Tiết Từng API

### 2.1. POST `/api/v1/exam-reminders` - Tạo Lời Nhắc Kiểm Tra
- **Headers:** `Authorization: Bearer <token_gv>`, `Content-Type: application/json`

#### Request Body
```json
{
  "class_id": "cls_1a_2026",
  "subject_code": "MATH",
  "exam_type": "TEST_15P",
  "exam_date": "2026-09-25",
  "message": "Thứ Sáu tới lớp sẽ có bài kiểm tra 15 phút môn Toán về phép cộng trong phạm vi 10. Kính nhờ quý phụ huynh nhắc các con ôn kỹ bài 5 và 6."
}
```

#### Response Thành Công (HTTP 201 Created)
```json
{
  "success": true,
  "status_code": 201,
  "message": "Đã tạo lời nhắc kiểm tra và phát thông báo tới toàn thể phụ huynh",
  "data": {
    "reminder_id": "exm_4412",
    "class_id": "cls_1a_2026",
    "subject_code": "MATH",
    "exam_date": "2026-09-25",
    "notified_parents": 36,
    "created_at": "2026-09-23T10:30:00.000Z"
  }
}
```
- **Ràng buộc Firestore:** Lưu bản ghi vào collection `/exam_reminders`.
- **Trigger sự kiện:** Truy xuất danh sách phụ huynh trong lớp từ `/students` và gửi Multicast Message qua Firebase Cloud Messaging.
