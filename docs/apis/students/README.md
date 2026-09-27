# Đặc Tả API Phân Hệ Học Sinh & Cổng Tra Cứu Phụ Huynh (Students API Specification)
# Module: Students (`/api/v1/students`) - Trung Tâm Học Vụ & Cổng Phụ Huynh

---

## 1. Tổng Quan Phân Hệ
Phân hệ **Students** đóng vai trò là kho dữ liệu hồ sơ học sinh và là **Cổng Tra Cứu Toàn Diện dành cho Phụ huynh** trên ứng dụng di động React Native. Phụ huynh chỉ có quyền tra cứu dữ liệu của những học sinh có liên kết với tài khoản của mình (`parent_uids` chứa `parentUid`).

| Method | Endpoint | Quyền truy cập (RBAC) | Mô tả chức năng |
| :---: | :--- | :---: | :--- |
| `GET` | `/api/v1/students/:id` | `TEACHER_*`, `PARENT` | Lấy thông tin hồ sơ lý lịch học sinh |
| `GET` | `/api/v1/students/:id/academic` | `PARENT`, `TEACHER_*` | **Tra cứu Bảng điểm đa môn học** & các cột điểm thành phần |
| `GET` | `/api/v1/students/:id/attendance` | `PARENT`, `TEACHER_*` | **Theo dõi Lịch sử chuyên cần** & các buổi vắng học |
| `GET` | `/api/v1/students/:id/fees-insurance` | `PARENT`, `TEACHER_*` | **Xem tình trạng nộp Học phí & BHYT** (kèm ngày nộp thực tế) |
| `GET` | `/api/v1/students/:id/remarks` | `PARENT`, `TEACHER_*` | **Xem Sổ liên lạc nhận xét** từ giáo viên gửi về |
| `GET` | `/api/v1/students/:id/exam-reminders` | `PARENT`, `TEACHER_*` | **Xem Lời nhắc Lịch kiểm tra sắp tới** để đôn đốc con |

---

## 2. Chi Tiết Từng API

### 2.1. GET `/api/v1/students/:id/academic` - Tra Cứu Bảng Điểm Đa Môn
- **Headers:** `Authorization: Bearer <parent_token>`
- **Logic bảo mật:** Kiểm tra `parent_uids` trong document `/students/{id}` có chứa UID của người gọi hay không (ngăn chặn phụ huynh tra cứu điểm con nhà người khác).

#### Bảng Quy Định Dữ Liệu Đầu Vào (Input Specification)

| Tên tham số (Parameter) | Vị trí | Bắt buộc / Tùy chọn | Phương thức nhập liệu | Kiểu dữ liệu & Ràng buộc validation |
| :--- | :---: | :---: | :---: | :--- |
| `id` | Path | **Bắt buộc** | Hệ thống tự truyền | Mã ID học sinh (Chuỗi UUID/ID, VD: `stu_01`). Phải tồn tại trong hệ thống. |
| `semester` | Query | **Tùy chọn** (Default: kỳ hiện tại) | **Chọn Dropdown Học Kỳ** | Số nguyên: `1` hoặc `2`. |
| `month` *(API chuyên cần)* | Query | **Tùy chọn** | **Gõ bàn phím / Chọn MonthPicker** | Chuỗi năm-tháng `YYYY-MM`. Tháng phải từ `01` đến `12`. Loại bỏ tháng ảo như `2026-15`. |

#### Response Thành Công (HTTP 200 OK)
```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "student_id": "stu_01",
    "full_name": "Trần Bảo Nam",
    "class_name": "1A",
    "semester": 1,
    "subjects": [
      {
        "subject_code": "MATH",
        "subject_name": "Toán học",
        "scores": [
          { "type": "ORAL_TEST", "label": "Kiểm tra miệng", "value": 9.0, "comment": "Học thuộc bảng cộng" },
          { "type": "TEST_15P", "label": "Kiểm tra 15 phút", "value": 8.5 },
          { "type": "MID_TERM", "label": "Thi Giữa kỳ", "value": 9.5 }
        ]
      },
      {
        "subject_code": "LIT",
        "subject_name": "Tiếng Việt",
        "scores": [
          { "type": "ORAL_TEST", "label": "Đọc bài cũ", "value": 8.0 },
          { "type": "TEST_15P", "label": "Chính tả 15 phút", "value": 9.0 }
        ]
      }
    ]
  }
}
```

---

### 2.2. GET `/api/v1/students/:id/fees-insurance` - Xem Trạng Thái Nộp BHYT & Học Phí
- **Headers:** `Authorization: Bearer <parent_token>`

#### Response Thành Công (HTTP 200 OK)
```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "student_id": "stu_01",
    "term_name": "Học kỳ 1 năm học 2026-2027",
    "tuition": {
      "is_paid": true,
      "amount": 1200000,
      "paid_date": "2026-09-15",
      "status_label": "ĐÃ HOÀN THÀNH"
    },
    "insurance": {
      "is_paid": false,
      "amount": 880000,
      "paid_date": null,
      "deadline": "2026-10-15",
      "status_label": "CHƯA NỘP (Hạn chót: 15/10/2026)"
    },
    "teacher_note": "Phụ huynh vui lòng nộp BHYT trực tiếp tại lớp cho cô Lan."
  }
}
```

---

### 2.3. GET `/api/v1/students/:id/remarks` - Xem Sổ Nhận Xét Từ Thầy Cô
- **Response Thành Công (HTTP 200 OK):** Trả về danh sách các lời nhận xét ngắn gọn (đoạn text ngắn thuần túy, không gắn nhãn tags).

```json
{
  "success": true,
  "status_code": 200,
  "data": [
    {
      "remark_id": "rmk_01",
      "teacher_name": "Cô Nguyễn Thị Lan",
      "subject": "Toán học",
      "content": "Hôm nay Nam làm bài tập rất nhanh và hăng hái phát biểu xây dựng bài.",
      "created_at": "2026-09-22T08:30:00.000Z",
      "parent_acknowledged": true
    }
  ]
}
```

#### Response Thất Bại Thường Gặp
##### Phụ huynh truy cập hồ sơ học sinh không liên kết (HTTP 403 Forbidden)
```json
{
  "success": false,
  "status_code": 403,
  "message": "Bạn không có quyền truy cập thông tin của học sinh này",
  "error_code": "PARENT_STUDENT_LINK_NOT_FOUND",
  "details": null,
  "timestamp": "2026-09-27T08:30:00.000Z"
}
```

##### Học sinh không tồn tại (HTTP 404 Not Found)
```json
{
  "success": false,
  "status_code": 404,
  "message": "Không tìm thấy hồ sơ học sinh trên hệ thống",
  "error_code": "STUDENT_NOT_FOUND",
  "details": null,
  "timestamp": "2026-09-27T08:30:00.000Z"
}
```

---

## 3. Bảng Tổng Hợp Mã Lỗi Phân Hệ Students

| HTTP Status | Mã Lỗi (`error_code`) | Ý nghĩa & Tình huống xảy ra |
| :---: | :--- | :--- |
| `400` | `COMMON_VALIDATION_ERROR` | Tham số ID học sinh hoặc tham số lọc không đúng định dạng. |
| `401` | `AUTH_UNAUTHORIZED` | Bearer token không hợp lệ hoặc đã hết hạn. |
| `403` | `PARENT_STUDENT_LINK_NOT_FOUND` | Phụ huynh tra cứu học sinh không nằm trong danh sách con em của mình. |
| `404` | `STUDENT_NOT_FOUND` | `student_id` không tồn tại trong hệ thống. |
| `500` | `SYS_INTERNAL_ERROR` | Lỗi máy chủ cơ sở dữ liệu nội bộ. |

