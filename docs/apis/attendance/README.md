# Đặc Tả API Phân Hệ Điểm Danh & Chuyên Cần (Attendance API Specification)
# Module: Attendance (`/api/v1/attendance`)

---

## 1. Tổng Quan Phân Hệ
Phân hệ **Attendance** phục vụ công tác điểm danh nhanh 1-chạm của Giáo viên chủ nhiệm (GVCN) vào đầu mỗi buổi học. Khi có học sinh vắng mặt, hệ thống tự động kích hoạt thông báo đẩy tức thời (FCM) đến điện thoại của phụ huynh. Ngoài ra, phân hệ cung cấp danh sách học sinh **CÓ MẶT HÔM NAY** để phục vụ Vòng quay kiểm tra bài cũ.

| Method | Endpoint | Quyền truy cập (RBAC) | Mô tả chức năng |
| :---: | :--- | :---: | :--- |
| `POST` | `/api/v1/attendance/submit` | `TEACHER_HOMEROOM` | Điểm danh chuyên cần đầu giờ $\rightarrow$ Tự động bắn FCM cảnh báo vắng |
| `PATCH` | `/api/v1/attendance/:id` | `TEACHER_HOMEROOM` | Cập nhật lại trạng thái điểm danh khi học sinh đến muộn/xin phép |
| `GET` | `/api/v1/attendance/class/:classId` | `TEACHER_*` | Xem lịch sử điểm danh của lớp theo ngày/tháng |
| `GET` | `/api/v1/attendance/today/:classId` | `TEACHER_*` | Lấy danh sách học sinh **CÓ MẶT HÔM NAY** (cho Vòng quay random) |

---

## 2. Chi Tiết Từng API & Ràng Buộc Dữ Liệu

### 2.1. POST `/api/v1/attendance/submit` - Điểm Danh Chuyên Cần Đầu Giờ
- **Headers:** `Authorization: Bearer <token_gvcn>`, `Content-Type: application/json`

#### Bảng Quy Định Dữ Liệu Đầu Vào (Input Specification)

| Tên trường (Field) | Vị trí | Bắt buộc / Tùy chọn | Phương thức nhập liệu | Kiểu dữ liệu & Ràng buộc validation |
| :--- | :---: | :---: | :---: | :--- |
| `class_id` | Body | **Bắt buộc** | Chọn từ Menu Lớp học | Chuỗi ID hợp lệ, tồn tại trong CSDL (VD: `cls_1a_2026`). |
| `attendance_date` | Body | **Bắt buộc** | **Gõ bàn phím / Chọn DatePicker** | Chuỗi chuẩn ISO `YYYY-MM-DD`.<br>1. Phải đúng lịch thực tế (loại bỏ `2026-02-30`, `2026-13-45`).<br>2. Không được vượt quá ngày hiện tại (`<= today`).<br>3. Không lùi quá 7 ngày làm việc. |
| `period` | Body | **Tùy chọn** (Default: 1) | **Gõ bàn phím / Chọn Tiết** | Số nguyên dương từ `1` đến `10`. |
| `records` | Body | **Bắt buộc** | Danh sách lặp | Mảng đối tượng học sinh, không được rỗng (`minItems: 1`). |
| `records[].student_id` | Body | **Bắt buộc** | Hệ thống nạp tự động | Chuỗi ID học sinh thuộc biên chế lớp học này. |
| `records[].status` | Body | **Bắt buộc** | **Chọn nút bấm nhanh (UI Chip/Radio)** | Enum chỉ định: `PRESENT` (Có mặt), `ABSENT_EXCUSED` (Nghỉ có phép), `ABSENT_UNEXCUSED` (Nghỉ không phép). |
| `records[].note` | Body | **Tùy chọn** (Optional) | **Gõ tự do từ bàn phím** | Chuỗi ký tự, tối đa 255 ký tự. Được phép `null` hoặc chuỗi rỗng. Tự động `trim()` khoảng trắng hai đầu. |

#### Request Body Hợp Lệ
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
  },
  "timestamp": "2026-09-27T08:30:00.000Z"
}
```

#### Các Response Thất Bại & Lỗi Validation Chi Tiết

##### 1. Nhập ngày không tồn tại trên lịch thực tế (HTTP 400 Bad Request)
> **Tình huống:** Người dùng gõ tay ngày `2026-02-30` (năm 2026 tháng 2 chỉ có 28 ngày) hoặc `2026-13-40`:
```json
{
  "success": false,
  "status_code": 400,
  "message": "Dữ liệu ngày gửi lên không hợp lệ hoặc không tồn tại trong lịch thực tế",
  "error_code": "COMMON_VALIDATION_ERROR",
  "details": [
    {
      "field": "attendance_date",
      "issue": "Giá trị '2026-02-30' không phải là ngày hợp lệ trong lịch thực tế (tháng 2 năm 2026 chỉ có 28 ngày)"
    }
  ],
  "timestamp": "2026-09-27T08:30:00.000Z"
}
```

##### 2. Nhập sai định dạng ngày (HTTP 400 Bad Request)
> **Tình huống:** Người dùng gõ dạng `23/09/2026` thay vì chuẩn `YYYY-MM-DD`:
```json
{
  "success": false,
  "status_code": 400,
  "message": "Định dạng ngày không đúng chuẩn quy định ISO 8601 (YYYY-MM-DD)",
  "error_code": "COMMON_VALIDATION_ERROR",
  "details": [
    {
      "field": "attendance_date",
      "issue": "Định dạng phải là YYYY-MM-DD (Ví dụ: 2026-09-23)"
    }
  ],
  "timestamp": "2026-09-27T08:30:00.000Z"
}
```

##### 3. Điểm danh ngày trong tương lai (HTTP 400 Bad Request)
> **Tình huống:** Chọn ngày vượt quá ngày hiện tại (ví dụ: `2026-12-31`):
```json
{
  "success": false,
  "status_code": 400,
  "message": "Không thể thực hiện điểm danh cho ngày trong tương lai",
  "error_code": "ATTEND_DATE_IN_FUTURE",
  "details": [
    {
      "field": "attendance_date",
      "issue": "Ngày điểm danh không được vượt quá ngày hiện tại (2026-09-27)"
    }
  ],
  "timestamp": "2026-09-27T08:30:00.000Z"
}
```

##### 4. Ghi chú gõ bàn phím vượt quá 255 ký tự (HTTP 400 Bad Request)
> **Tình huống:** Trường `note` là trường optional gõ từ bàn phím, nhưng nếu gõ quá dài (> 255 ký tự):
```json
{
  "success": false,
  "status_code": 400,
  "message": "Nội dung ghi chú vượt quá giới hạn độ dài cho phép",
  "error_code": "COMMON_VALIDATION_ERROR",
  "details": [
    {
      "field": "records[1].note",
      "issue": "Ghi chú không được vượt quá 255 ký tự (hiện tại: 310 ký tự)"
    }
  ],
  "timestamp": "2026-09-27T08:30:00.000Z"
}
```

##### 5. Buổi học đã được điểm danh trước đó (HTTP 409 Conflict)
```json
{
  "success": false,
  "status_code": 409,
  "message": "Tiết học/buổi học này đã được điểm danh trước đó",
  "error_code": "ATTEND_ALREADY_EXISTS",
  "details": null,
  "timestamp": "2026-09-27T08:30:00.000Z"
}
```


---

### 2.2. PATCH `/api/v1/attendance/:id` - Cập Nhật Trạng Thái Điểm Danh
- **Mô tả:** Cho phép GVCN điều chỉnh trạng thái khi học sinh đến muộn hoặc phụ huynh nộp giấy xin phép muộn.
- **Headers:** `Authorization: Bearer <token_gvcn>`, `Content-Type: application/json`

#### Request Body
```json
{
  "status": "ABSENT_EXCUSED",
  "note": "Phụ huynh đã gọi điện xin phép nghỉ ốm"
}
```

#### Response Thành Công (HTTP 200 OK)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Cập nhật điểm danh thành công",
  "timestamp": "2026-09-27T08:30:00.000Z"
}
```

---

### 2.3. GET `/api/v1/attendance/today/:classId` - Danh Sách Học Sinh Có Mặt Hôm Nay
- **Mô tả:** Truy xuất cực nhanh danh sách học sinh có mặt hôm nay kết hợp Composite Index Firestore `(class_id, attendance_date, status)` để nạp vào Vòng quay kiểm tra bài cũ.

#### Response Thành Công (HTTP 200 OK)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Lấy danh sách học sinh có mặt thành công",
  "data": {
    "class_id": "cls_1a_2026",
    "today": "2026-09-23",
    "present_students": [
      { "id": "stu_01", "full_name": "Trần Bảo Nam", "student_code": "HS001" },
      { "id": "stu_04", "full_name": "Hoàng Minh Khôi", "student_code": "HS004" }
    ]
  },
  "timestamp": "2026-09-27T08:30:00.000Z"
}
```

---

## 3. Bảng Tổng Hợp Mã Lỗi Phân Hệ Attendance
Theo chuẩn [api-response-codes.md](file:///e:/GiaoVienHay/docs/architecture/api-response-codes.md):

| HTTP Code | Error Code | Mô tả & Nguyên nhân |
| :---: | :--- | :--- |
| `400` | `ATTEND_DATE_IN_FUTURE` | Không thể thực hiện điểm danh cho ngày trong tương lai. |
| `401` | `AUTH_TOKEN_INVALID` | Token xác thực không hợp lệ hoặc đã hết hạn. |
| `403` | `AUTH_ROLE_FORBIDDEN` | Chỉ Giáo viên chủ nhiệm mới có quyền điểm danh lớp học. |
| `404` | `CLASS_NOT_FOUND` | Không tìm thấy thông tin lớp học. |
| `404` | `ATTEND_RECORD_NOT_FOUND` | Không tìm thấy bản ghi điểm danh yêu cầu cập nhật. |
| `409` | `ATTEND_ALREADY_EXISTS` | Buổi học này đã được điểm danh trước đó. |
| `422` | `REQ_VALIDATION_ERROR` | Dữ liệu gửi lên sai quy cách DTO Validation. |
| `500` | `SYS_INTERNAL_ERROR` | Lỗi máy chủ nội bộ hoặc lỗi kết nối Firebase. |
