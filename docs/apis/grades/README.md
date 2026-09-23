# Đặc Tả API Phân Hệ Sổ Điểm & Bảng Xếp Hạng (Grades API Specification)
# Module: Grades (`/api/v1/grades`)

---

## 1. Tổng Quan Phân Hệ
Phân hệ **Grades** quản lý sổ điểm điện tử đa môn học toàn diện theo học sinh:
- **Đa dạng đầu điểm thành phần:** Điểm kiểm tra miệng / dò bài cũ (`ORAL_TEST`), Mini-game (`QUIZ`), 15 phút (`TEST_15P`), 1 tiết (`TEST_1P`), Giữa kỳ (`MID_TERM`), Cuối kỳ (`FINAL`).
- **Trung thực dữ liệu (Không tính GPA môn):** Hệ thống lưu trữ các đầu điểm do giáo viên nhập, **không tự động tính GPA trung bình môn**.
- **Công bố điểm có kiểm soát:** Giáo viên bấm "Công bố điểm" thì phụ huynh mới xem được và nhận thông báo FCM.
- **Bảng xếp hạng (Leaderboard) Điểm Môn Học:** Trình chiếu vinh danh Top học sinh điểm môn học cao nhất tại lớp.

| Method | Endpoint | Quyền truy cập (RBAC) | Mô tả chức năng |
| :---: | :--- | :---: | :--- |
| `GET` | `/api/v1/grades/class/:classId` | `TEACHER_*` | Xem sổ điểm môn học theo lớp, môn, học kỳ |
| `POST` | `/api/v1/grades/batch` | `TEACHER_*` | Nhập/cập nhật danh sách điểm thành phần (thang điểm 10) |
| `POST` | `/api/v1/grades/publish` | `TEACHER_*` | Phê duyệt và công bố cột điểm cho phụ huynh xem |
| `GET` | `/api/v1/grades/leaderboard/:classId` | `TEACHER_*` | Lấy dữ liệu **Bảng xếp hạng điểm môn học** để vinh danh |

---

## 2. Chi Tiết Từng API

### 2.1. POST `/api/v1/grades/batch` - Nhập Điểm Thành Phần
- **Headers:** `Authorization: Bearer <token_gv>`, `Content-Type: application/json`

#### Request Body
```json
{
  "class_id": "cls_1a_2026",
  "subject_code": "MATH",
  "semester": 1,
  "score_type": "ORAL_TEST",
  "scores": [
    { "student_id": "stu_01", "score_value": 9.5, "teacher_comment": "Thuộc bảng cửu chương" },
    { "student_id": "stu_02", "score_value": 8.0, "teacher_comment": "Cần tính nhẩm nhanh hơn" }
  ]
}
```

#### Response Thành Công (HTTP 200 OK)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Lưu bảng điểm thành phần thành công",
  "data": {
    "class_id": "cls_1a_2026",
    "subject_code": "MATH",
    "score_type": "ORAL_TEST",
    "updated_count": 2
  }
}
```

---

### 2.2. POST `/api/v1/grades/publish` - Công Bố Điểm Cho Phụ Huynh
- **Mô tả:** Cập nhật cờ `is_published = true` trong collection `/scores` và kích hoạt FCM thông báo đến phụ huynh.
- **Request Body:**
```json
{
  "class_id": "cls_1a_2026",
  "subject_code": "MATH",
  "score_type": "TEST_15P",
  "semester": 1
}
```

#### Response Thành Công (HTTP 200 OK)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Đã công bố điểm môn học tới phụ huynh",
  "data": {
    "notified_parents_count": 35,
    "published_at": "2026-09-23T10:00:00.000Z"
  }
}
```

---

### 2.3. GET `/api/v1/grades/leaderboard/:classId` - Bảng Xếp Hạng Vinh Danh
- **Query Params:** `subject_code=MATH`, `semester=1`, `limit=5`

#### Response Thành Công (HTTP 200 OK)
```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "subject_code": "MATH",
    "subject_name": "Toán học",
    "top_students": [
      { "rank": 1, "student_name": "Trần Bảo Nam", "score": 9.8, "badge": "GOLD" },
      { "rank": 2, "student_name": "Lê Ngọc Mai", "score": 9.5, "badge": "SILVER" },
      { "rank": 3, "student_name": "Hoàng Minh Khôi", "score": 9.2, "badge": "BRONZE" }
    ]
  }
}
```
