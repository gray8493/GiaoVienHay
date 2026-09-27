# Đặc Tả API Phân Hệ Quản Lý Lớp Học & Thành Viên (Classes API Specification)
# Module: Classes (`/api/v1/classes`)

---

## 1. Tổng Quan Phân Hệ
Phân hệ **Classes** đóng vai trò là hạt nhân quản lý lớp học của hệ thống **GiaoVienHay**:
- **GVCN tạo 1 lớp học tổng:** Nhập thông tin lớp, sĩ số học sinh, hệ thống tự động gán các môn GVCN trực tiếp giảng dạy (`teaching_subjects`), GVCN phân công GVBM cho các môn còn lại.
- **GVBM truy cập lớp tổng:** GVBM chỉ cần đăng nhập là thấy lớp tổng và được phân quyền thay đổi điểm đúng bộ môn mình phụ trách.
- **Cơ chế Vào lớp 1-chạm:** Sinh **Mã mời (`invite_code`)** và **Link mời (`invite_link`)** gửi phụ huynh qua Zalo/Tin nhắn. Phụ huynh bấm link để vào lớp và chọn xác nhận con em mình.

| Method | Endpoint | Quyền truy cập (RBAC) | Mô tả chức năng |
| :---: | :--- | :---: | :--- |
| `POST` | `/api/v1/classes` | `TEACHER_HOMEROOM` | GVCN tạo Lớp tổng, thêm học sinh, phân công GVBM |
| `GET` | `/api/v1/classes` | `TEACHER_*` | Lấy danh sách lớp GV phụ trách (chủ nhiệm + dạy bộ môn) |
| `GET` | `/api/v1/classes/:id` | `TEACHER_*`, `PARENT` | Xem thông tin chi tiết lớp học |
| `GET` | `/api/v1/classes/:id/my-subject` | `TEACHER_SUBJECT` | GVBM truy cập lớp tổng theo môn học mình phụ trách |
| `GET` | `/api/v1/classes/:id/invite` | `TEACHER_HOMEROOM` | Lấy mã mời (`invite_code`), link mời và mã QR của lớp |
| `POST` | `/api/v1/classes/join` | `PARENT` | Phụ huynh tham gia lớp qua link mời và xác nhận con |
| `POST` | `/api/v1/classes/:id/students` | `TEACHER_HOMEROOM` | Thêm học sinh đơn lẻ hoặc import file Excel |
| `DELETE` | `/api/v1/classes/:id/students/:studentId` | `TEACHER_HOMEROOM` | Xóa học sinh khỏi lớp học |
| `PUT` | `/api/v1/classes/:id/subject-teachers` | `TEACHER_HOMEROOM` | Cập nhật phân công Giáo viên Bộ môn (GVBM) cho lớp |

---

## 2. Chi Tiết Từng API & Ràng Buộc Dữ Liệu

### 2.1. POST `/api/v1/classes` - GVCN Tạo Lớp Học Tổng
- **Headers:** `Authorization: Bearer <token_gvcn>`, `Content-Type: application/json`

#### Bảng Quy Định Dữ Liệu Đầu Vào (Input Specification)

| Tên trường (Field) | Vị trí | Bắt buộc / Tùy chọn | Phương thức nhập liệu | Kiểu dữ liệu & Ràng buộc validation |
| :--- | :---: | :---: | :---: | :--- |
| `name` | Body | **Bắt buộc** | **Gõ tự do từ bàn phím** | Tên lớp học (Chuỗi `1 - 20` ký tự, VD: `"1A"`, `"6A1"`). Tự động `trim()`. |
| `grade_level` | Body | **Bắt buộc** | **Chọn Dropdown Khối Lớp** | Số nguyên từ `1` đến `9` (Phục vụ đúng phạm vi Cấp 1 & Cấp 2). |
| `academic_year` | Body | **Bắt buộc** | **Gõ bàn phím / Chọn Dropdown** | Chuỗi năm học định dạng `YYYY-YYYY` (VD: `"2026-2027"`). Năm kết thúc phải bằng năm bắt đầu + 1. |
| `subject_teachers` | Body | **Tùy chọn** (Optional) | Danh sách phân công GVBM | Mảng đối tượng chứa `teacher_id` và `subject_code`. GVBM phải tồn tại trong hệ thống. |
| `students` | Body | **Tùy chọn** (Optional) | Danh sách nạp ban đầu | Mảng học sinh ban đầu. Có thể để trống để import Excel sau. |
| `students[].student_code`| Body | **Bắt buộc nếu có HS** | **Gõ bàn phím** | Mã học sinh trong lớp (`2 - 20` ký tự). Phải duy nhất trong lớp học này. |
| `students[].full_name` | Body | **Bắt buộc nếu có HS** | **Gõ bàn phím** | Họ và tên học sinh (`2 - 100` ký tự). |
| `students[].gender` | Body | **Bắt buộc nếu có HS** | **Chọn nút bấm UI Radio** | Enum giới tính: `MALE`, `FEMALE`, hoặc `OTHER`. |
| `students[].dob` | Body | **Tùy chọn** (Optional) | **Gõ bàn phím / Chọn DatePicker** | Chuỗi ngày sinh ISO `YYYY-MM-DD`.<br>1. Phải là ngày tồn tại trong lịch thực tế (loại bỏ `2018-02-30`).<br>2. Phải là ngày trong quá khứ (`< today`). |

#### Request Body Mẫu
```json
{
  "name": "1A",
  "grade_level": 1,
  "academic_year": "2026-2027",
  "subject_teachers": [
    { "teacher_id": "uid_gvbm_eng", "subject_code": "ENG" },
    { "teacher_id": "uid_gvbm_pe", "subject_code": "PE" }
  ],
  "students": [
    { "student_code": "HS001", "full_name": "Trần Bảo Nam", "gender": "MALE", "dob": "2020-05-15" },
    { "student_code": "HS002", "full_name": "Lê Ngọc Mai", "gender": "FEMALE", "dob": "2020-08-20" }
  ]
}
```

#### Response Thành Công (HTTP 201 Created)
```json
{
  "success": true,
  "status_code": 201,
  "message": "Tạo lớp học tổng thành công",
  "data": {
    "class_id": "cls_1a_2026",
    "name": "1A",
    "grade_level": 1,
    "invite_code": "GVH1A26",
    "invite_link": "https://giaovienhay.vn/join?code=GVH1A26",
    "total_students": 2,
    "assigned_subjects": ["MATH", "LIT", "ETHICS", "ENG", "PE"]
  },
  "timestamp": "2026-09-27T08:30:00.000Z"
}
```

#### Các Response Thất Bại & Lỗi Validation Chi Tiết

##### 1. Ngày sinh học sinh không có thật trên lịch (HTTP 400 Bad Request)
> **Tình huống:** Người dùng gõ tay ngày sinh `2018-02-30`:
```json
{
  "success": false,
  "status_code": 400,
  "message": "Ngày sinh học sinh không hợp lệ hoặc không tồn tại trong lịch thực tế",
  "error_code": "COMMON_VALIDATION_ERROR",
  "details": [
    {
      "field": "students[0].dob",
      "issue": "Giá trị '2018-02-30' không phải là ngày hợp lệ trong lịch thực tế (tháng 2 năm 2018 chỉ có 28 ngày)"
    }
  ],
  "timestamp": "2026-09-27T08:30:00.000Z"
}
```

##### 2. Khối lớp ngoài phạm vi Cấp 1 & Cấp 2 (HTTP 400 Bad Request)
> **Tình huống:** Chọn khối lớp 10, 11 hoặc 12:
```json
{
  "success": false,
  "status_code": 400,
  "message": "Khối lớp không nằm trong phạm vi hệ thống hỗ trợ",
  "error_code": "COMMON_VALIDATION_ERROR",
  "details": [
    {
      "field": "grade_level",
      "issue": "Khối lớp phải là số nguyên từ 1 đến 9 (Tiểu học & THCS)"
    }
  ],
  "timestamp": "2026-09-27T08:30:00.000Z"
}
```

##### 3. Trùng mã học sinh trong lớp (HTTP 409 Conflict)
```json
{
  "success": false,
  "status_code": 409,
  "message": "Mã học sinh HS001 đã tồn tại trong danh sách lớp",
  "error_code": "CLASS_STUDENT_CODE_EXISTS",
  "details": [
    {
      "field": "students[0].student_code",
      "issue": "Mã học sinh HS001 bị trùng lặp"
    }
  ],
  "timestamp": "2026-09-27T08:30:00.000Z"
}
```

---

### 2.2. GET `/api/v1/classes/:id/my-subject` - GVBM Truy Cập Lớp Tổng Theo Môn
- **Mô tả:** Giáo viên bộ môn đăng nhập truy cập lớp tổng, hệ thống trả về danh sách học sinh và quyền hạn nhập điểm đối với môn học được GVCN phân công.
- **Headers:** `Authorization: Bearer <token_gvbm>`

#### Response Thành Công (HTTP 200 OK)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Lấy danh sách học sinh theo môn thành công",
  "data": {
    "class_id": "cls_1a_2026",
    "class_name": "1A",
    "subject_code": "ENG",
    "subject_name": "Tiếng Anh",
    "students": [
      { "id": "stu_01", "student_code": "HS001", "full_name": "Trần Bảo Nam" },
      { "id": "stu_02", "student_code": "HS002", "full_name": "Lê Ngọc Mai" }
    ]
  },
  "timestamp": "2026-09-27T08:30:00.000Z"
}
```

#### Response Thất Bại (HTTP 403 Forbidden - Chưa được phân công)
```json
{
  "success": false,
  "status_code": 403,
  "message": "Giáo viên chưa được phân công giảng dạy môn học này tại lớp",
  "error_code": "ACAD_NOT_ASSIGNED_TEACHER",
  "details": null,
  "timestamp": "2026-09-27T08:30:00.000Z"
}
```

---

### 2.3. POST `/api/v1/classes/join` - Phụ Huynh Vào Lớp & Xác Nhận Con
- **Mô tả:** Phụ huynh nhấp vào link mời của GVCN, đăng nhập và chọn học sinh là con mình trong danh sách lớp.
- **Headers:** `Authorization: Bearer <token_parent>`, `Content-Type: application/json`

#### Request Body
```json
{
  "invite_code": "GVH1A26",
  "student_id": "stu_01"
}
```

#### Response Thành Công (HTTP 200 OK)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Liên kết vào lớp học của con thành công",
  "data": {
    "class_id": "cls_1a_2026",
    "class_name": "1A",
    "child": {
      "student_id": "stu_01",
      "full_name": "Trần Bảo Nam",
      "student_code": "HS001"
    }
  },
  "timestamp": "2026-09-27T08:30:00.000Z"
}
```

#### Response Thất Bại (HTTP 404 Not Found - Mã mời sai hoặc hết hạn)
```json
{
  "success": false,
  "status_code": 404,
  "message": "Mã mời tham gia lớp học không hợp lệ hoặc đã hết hạn",
  "error_code": "CLASS_INVITE_CODE_INVALID",
  "details": null,
  "timestamp": "2026-09-27T08:30:00.000Z"
}
```

---

### 2.4. PUT `/api/v1/classes/:id/subject-teachers` - GVCN Cập Nhật Phân Công GVBM
- **Headers:** `Authorization: Bearer <token_gvcn>`, `Content-Type: application/json`
- **Mô tả:** Cho phép GVCN phân công hoặc thay đổi giáo viên bộ môn giảng dạy các môn học trong lớp.

#### Request Body
```json
{
  "subject_teachers": [
    { "teacher_id": "usr_gvbm_math_02", "subject_code": "MATH" },
    { "teacher_id": "usr_gvbm_eng_01", "subject_code": "ENG" }
  ]
}
```

#### Response Thành Công (HTTP 200 OK)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Cập nhật phân công GVBM thành công",
  "data": {
    "class_id": "cls_1a_2026",
    "updated_count": 2
  },
  "timestamp": "2026-09-27T08:30:00.000Z"
}
```

---

## 3. Bảng Tổng Hợp Mã Lỗi Phân Hệ Classes
Theo quy chuẩn [api-response-codes.md](file:///e:/GiaoVienHay/docs/architecture/api-response-codes.md):

| HTTP Code | Error Code | Mô tả & Nguyên nhân |
| :---: | :--- | :--- |
| `400` | `CLASS_MAX_STUDENTS_EXCEEDED` | Lớp học đã đạt sĩ số tối đa theo quy định hạn mức hệ thống (mặc định 60). |
| `403` | `CLASS_NOT_HOMEROOM_TEACHER` | Người dùng không phải GVCN của lớp học này. |
| `404` | `CLASS_NOT_FOUND` | Không tìm thấy lớp học trong Firestore. |
| `404` | `CLASS_INVITE_CODE_INVALID` | Mã mời không tồn tại hoặc đã hết hạn. |
| `409` | `CLASS_STUDENT_CODE_EXISTS` | Mã học sinh bị trùng lặp trong danh sách học sinh của lớp. |
| `409` | `STUDENT_ALREADY_LINKED` | Học sinh đã được liên kết với tài khoản phụ huynh này trước đó. |
| `422` | `REQ_VALIDATION_ERROR` | Dữ liệu gửi lên sai định dạng validation DTO. |
| `500` | `SYS_INTERNAL_ERROR` | Lỗi máy chủ nội bộ hoặc lỗi kết nối Firebase Firestore. |
