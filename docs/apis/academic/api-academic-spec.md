# Đặc Tả API Phân Hệ Học Vụ & Điểm Số (Academic API Specification)
# Module: Academic & Grades (`/api/v1/academic`)

---

## 1. POST `/api/v1/attendance/submit` - Điểm danh chuyên cần lớp học

- **Mô tả:** Giáo viên gửi danh sách trạng thái điểm danh của lớp học theo tiết/ngày.
- **Quyền truy cập:** `TEACHER` hoặc `ADMIN`.
- **Sự kiện phát sinh:** Nếu có học sinh vắng, hệ thống phát `StudentAbsentEvent` vào RabbitMQ để gửi thông báo cho phụ huynh.

### Headers
```text
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Request Body
```json
{
  "class_id": "cls_10A1",
  "date": "2026-09-22",
  "period": 1,
  "records": [
    {
      "student_id": "stu_001",
      "status": "PRESENT",
      "note": null
    },
    {
      "student_id": "stu_002",
      "status": "ABSENT_EXCUSED",
      "note": "Phụ huynh xin nghỉ ốm"
    },
    {
      "student_id": "stu_003",
      "status": "ABSENT_UNEXCUSED",
      "note": null
    }
  ]
}
```

### Response Thành Công (HTTP 201 Created)
```json
{
  "success": true,
  "status_code": 201,
  "message": "Lưu dữ liệu điểm danh thành công",
  "data": {
    "attendance_session_id": "att_sess_89123",
    "total_students": 3,
    "present_count": 1,
    "absent_count": 2
  },
  "timestamp": "2026-09-22T08:15:00.000Z"
}
```

---

## 2. POST `/api/v1/grades/publish` - Phê duyệt & Công bố điểm số

- **Mô tả:** Giáo viên bộ môn công bố cột điểm thành phần. Hệ thống tính lại điểm trung bình môn và phát `GradePublishedEvent` vào RabbitMQ.
- **Quyền truy cập:** `TEACHER` (phụ trách môn học của lớp).

### Request Body
```json
{
  "class_id": "cls_10A1",
  "subject_id": "sub_MATH",
  "semester": 1,
  "grade_type": "1_PERIOD",
  "scores": [
    {
      "student_id": "stu_001",
      "score": 8.5
    },
    {
      "student_id": "stu_002",
      "score": 9.0
    }
  ]
}
```

### Response Thành Công (HTTP 200 OK)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Phê duyệt và công bố bảng điểm thành công",
  "data": {
    "class_id": "cls_10A1",
    "subject_id": "sub_MATH",
    "published_count": 2
  },
  "timestamp": "2026-09-22T09:30:00.000Z"
}
```
