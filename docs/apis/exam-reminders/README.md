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

#### Bảng Quy Định Dữ Liệu Đầu Vào (Input Specification)

| Tên trường (Field) | Vị trí | Bắt buộc / Tùy chọn | Phương thức nhập liệu | Kiểu dữ liệu & Ràng buộc validation |
| :--- | :---: | :---: | :---: | :--- |
| `class_id` | Body | **Bắt buộc** | Chọn từ Menu Lớp | Chuỗi ID lớp học hợp lệ. |
| `subject_code` | Body | **Bắt buộc** | **Chọn Dropdown Môn Học** | Mã môn học áp dụng bài kiểm tra (VD: `MATH`, `LIT`). |
| `exam_type` | Body | **Bắt buộc** | **Chọn Dropdown Loại Bài Thi** | Enum loại bài kiểm tra: `TEST_15P` (15 phút), `TEST_1P` (1 tiết), `MID_TERM` (Giữa kỳ), `FINAL` (Cuối kỳ). |
| `exam_date` | Body | **Bắt buộc** | **Gõ bàn phím / Chọn DatePicker** | Chuỗi ngày ISO `YYYY-MM-DD`.<br>1. Phải là ngày tồn tại trong lịch thực tế (loại bỏ `2026-02-30`).<br>2. Phải từ ngày hiện tại trở đi (`>= today`). |
| `message` | Body | **Bắt buộc** | **Gõ tự do từ bàn phím** | Chuỗi văn bản dặn dò ôn thi (từ `10` đến `500` ký tự). Tự động `trim()`. Không được rỗng hoặc chỉ toàn khoảng trắng. |

#### Request Body Hợp Lệ
```json
{
  "class_id": "cls_1a_2026",
  "subject_code": "MATH",
  "exam_type": "TEST_15P",
  "exam_date": "2026-09-30",
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
    "exam_date": "2026-09-30",
    "notified_parents": 36,
    "created_at": "2026-09-23T10:30:00.000Z"
  }
}
```
- **Ràng buộc Firestore:** Lưu bản ghi vào collection `/exam_reminders`.
- **Trigger sự kiện:** Truy xuất danh sách phụ huynh trong lớp từ `/students` và gửi Multicast Message qua Firebase Cloud Messaging.

#### Các Response Thất Bại & Lỗi Validation Chi Tiết

##### 1. Ngày kiểm tra không có thật trên lịch (HTTP 400 Bad Request)
> **Tình huống:** Người dùng gõ tay `2026-02-30`:
```json
{
  "success": false,
  "status_code": 400,
  "message": "Dữ liệu ngày kiểm tra không hợp lệ hoặc không tồn tại trong lịch thực tế",
  "error_code": "COMMON_VALIDATION_ERROR",
  "details": [
    {
      "field": "exam_date",
      "issue": "Giá trị '2026-02-30' không phải là ngày hợp lệ trong lịch thực tế (tháng 2 năm 2026 chỉ có 28 ngày)"
    }
  ],
  "timestamp": "2026-09-27T08:30:00.000Z"
}
```

##### 2. Ngày kiểm tra đã trôi qua trong quá khứ (HTTP 400 Bad Request)
> **Tình huống:** Chọn ngày kiểm tra là ngày hôm qua hoặc ngày đã qua (`2026-09-01`):
```json
{
  "success": false,
  "status_code": 400,
  "message": "Ngày kiểm tra không hợp lệ hoặc đã trôi qua trong quá khứ",
  "error_code": "EXAM_DATE_INVALID",
  "details": [
    {
      "field": "exam_date",
      "issue": "Ngày kiểm tra phải từ ngày hiện tại trở đi (>= 2026-09-27)"
    }
  ],
  "timestamp": "2026-09-27T08:30:00.000Z"
}
```

##### 3. Nội dung dặn dò quá ngắn (HTTP 400 Bad Request)
```json
{
  "success": false,
  "status_code": 400,
  "message": "Nội dung lời dặn dò quá ngắn",
  "error_code": "COMMON_VALIDATION_ERROR",
  "details": [
    {
      "field": "message",
      "issue": "Lời dặn dò phải có tối thiểu 10 ký tự để cung cấp đủ thông tin ôn thi cho phụ huynh"
    }
  ],
  "timestamp": "2026-09-27T08:30:00.000Z"
}
```


---

### 2.2. DELETE `/api/v1/exam-reminders/:id` - Xóa Lời Nhắc Kiểm Tra
- **Mô tả:** Giáo viên hủy bỏ lời nhắc kiểm tra đã tạo.
- **Headers:** `Authorization: Bearer <token_gv>`

#### Response Thành Công (HTTP 200 OK)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Đã xóa lịch nhắc kiểm tra thành công",
  "data": {
    "reminder_id": "exm_4412"
  }
}
```

#### Response Thất Bại Thường Gặp
##### Ngày kiểm tra trong quá khứ (HTTP 400 Bad Request)
```json
{
  "success": false,
  "status_code": 400,
  "message": "Ngày kiểm tra không hợp lệ hoặc đã trôi qua trong quá khứ",
  "error_code": "EXAM_DATE_INVALID",
  "details": [
    {
      "field": "exam_date",
      "issue": "Ngày kiểm tra phải từ ngày hiện tại trở đi"
    }
  ],
  "timestamp": "2026-09-27T08:30:00.000Z"
}
```

##### Lời nhắc không tồn tại (HTTP 404 Not Found)
```json
{
  "success": false,
  "status_code": 404,
  "message": "Không tìm thấy thông tin lịch nhắc kiểm tra này",
  "error_code": "EXAM_REMINDER_NOT_FOUND",
  "details": null,
  "timestamp": "2026-09-27T08:30:00.000Z"
}
```

---

## 3. Bảng Tổng Hợp Mã Lỗi Phân Hệ Exam Reminders

| HTTP Status | Mã Lỗi (`error_code`) | Ý nghĩa & Tình huống xảy ra |
| :---: | :--- | :--- |
| `400` | `EXAM_DATE_INVALID` | Ngày kiểm tra không hợp lệ hoặc rơi vào quá khứ. |
| `400` | `COMMON_VALIDATION_ERROR` | Thiếu trường bắt buộc (`class_id`, `subject_code`, `exam_type`,...). |
| `401` | `AUTH_UNAUTHORIZED` | Bearer token không hợp lệ hoặc đã hết hạn. |
| `403` | `AUTH_FORBIDDEN` | Tài khoản không có quyền thao tác trên lớp học này. |
| `404` | `EXAM_REMINDER_NOT_FOUND` | `reminder_id` không tồn tại. |
| `404` | `CLASS_NOT_FOUND` | Lớp học không tồn tại. |
| `500` | `SYS_INTERNAL_ERROR` | Lỗi máy chủ cơ sở dữ liệu nội bộ. |

