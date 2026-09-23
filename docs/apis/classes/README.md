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

---

## 2. Chi Tiết Từng API

### 2.1. POST `/api/v1/classes` - GVCN Tạo Lớp Học Tổng
- **Headers:** `Authorization: Bearer <token_gvcn>`, `Content-Type: application/json`

#### Request Body
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
  }
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
  "data": {
    "class_id": "cls_1a_2026",
    "class_name": "1A",
    "subject_code": "ENG",
    "subject_name": "Tiếng Anh",
    "students": [
      { "id": "stu_01", "student_code": "HS001", "full_name": "Trần Bảo Nam" },
      { "id": "stu_02", "student_code": "HS002", "full_name": "Lê Ngọc Mai" }
    ]
  }
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
  }
}
```
- **Ràng buộc Firestore:** UID của Phụ huynh được thêm vào mảng `parent_uids` của document `/students/stu_01`.
