# Đặc Tả API Phân Hệ Sổ Điểm & Bảng Xếp Hạng (Grades API Specification)

# Module: Grades (`/api/v1/grades`)

---

## 1. Tổng Quan Phân Hệ

Phân hệ **Grades** quản lý sổ điểm điện tử đa môn học toàn diện theo học sinh:

- **Đa dạng đầu điểm thành phần:** Điểm kiểm tra miệng / dò bài cũ (`ORAL_TEST`), Mini-game (`QUIZ`), 15 phút (`TEST_15P`), 1 tiết (`TEST_1P`), Giữa kỳ (`MID_TERM`), Cuối kỳ (`FINAL`).
- **Trung thực dữ liệu (Không tính GPA môn):** Hệ thống lưu trữ các đầu điểm do giáo viên nhập, **không tự động tính GPA trung bình môn**.
- **Công bố điểm có kiểm soát:** Giáo viên bấm "Công bố điểm" thì phụ huynh mới xem được và nhận thông báo FCM.
- **Bảng xếp hạng (Leaderboard) Điểm Môn Học:** Trình chiếu vinh danh Top học sinh điểm môn học cao nhất tại lớp.

|  Method  | Endpoint                                | Quyền truy cập (RBAC) | Mô tả chức năng                                                      |
| :------: | :-------------------------------------- | :---------------------: | :----------------------------------------------------------------------- |
| `GET` | `/api/v1/grades/class/:classId`       |      `TEACHER_*`      | Xem sổ điểm môn học theo lớp, môn, học kỳ                       |
| `POST` | `/api/v1/grades/batch`                |      `TEACHER_*`      | Nhập/cập nhật danh sách điểm thành phần (thang điểm 10)        |
| `POST` | `/api/v1/grades/publish`              |      `TEACHER_*`      | Phê duyệt và công bố cột điểm cho phụ huynh xem                 |
| `GET` | `/api/v1/grades/leaderboard/:classId` |      `TEACHER_*`      | Lấy dữ liệu**Bảng xếp hạng điểm môn học** để vinh danh |

---

## 2. Chi Tiết Từng API

### 2.1. POST `/api/v1/grades/batch` - Nhập Điểm Thành Phần

- **Headers:** `Authorization: Bearer <token_gv>`, `Content-Type: application/json`

#### Bảng Quy Định Dữ Liệu Đầu Vào (Input Specification)

| Tên trường (Field) | Vị trí | Bắt buộc / Tùy chọn | Phương thức nhập liệu | Kiểu dữ liệu & Ràng buộc validation |
| :--- | :---: | :---: | :---: | :--- |
| `class_id` | Body | **Bắt buộc** | Chọn từ Menu Lớp | Chuỗi ID lớp học hợp lệ (VD: `cls_1a_2026`). |
| `subject_code` | Body | **Bắt buộc** | **Chọn Dropdown Môn Học** | Mã môn học chuẩn (VD: `MATH`, `LIT`, `ENG`). Phải là môn giáo viên được phân công giảng dạy tại lớp. |
| `semester` | Body | **Bắt buộc** | **Chọn Dropdown Học Kỳ** | Số nguyên: `1` (Học kỳ 1) hoặc `2` (Học kỳ 2). Học kỳ không được ở trạng thái đã khóa sổ. |
| `score_type` | Body | **Bắt buộc** | **Chọn Dropdown Cột Điểm** | Enum đầu điểm: `ORAL_TEST` (Điểm miệng), `QUIZ` (Mini-game), `TEST_15P` (15 phút), `TEST_1P` (1 tiết), `MID_TERM` (Giữa kỳ), `FINAL` (Cuối kỳ). |
| `scores` | Body | **Bắt buộc** | Danh sách lặp | Mảng đối tượng điểm số học sinh (`minItems: 1`). |
| `scores[].student_id` | Body | **Bắt buộc** | Hệ thống nạp tự động | Chuỗi ID học sinh có trong danh sách lớp. |
| `scores[].score_value` | Body | **Bắt buộc** | **Gõ số từ bàn phím** | Số thực (`float`) từ `0.0` đến `10.0`. Tối đa 1 chữ số thập phân (Ví dụ: `8.5`, `9.0`). Không chấp nhận số âm, ký tự chữ hoặc giá trị vượt quá 10. |
| `scores[].teacher_comment`| Body | **Tùy chọn** (Optional) | **Gõ tự do từ bàn phím** | Chuỗi nhận xét ngắn của giáo viên cho cột điểm (tối đa 255 ký tự). Cho phép `null` hoặc chuỗi rỗng. Tự động `trim()`. |

#### Request Body Hợp Lệ
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

#### Các Response Thất Bại & Lỗi Validation Chi Tiết

##### 1. Điểm số vượt quá thang điểm 0 - 10 (HTTP 400 Bad Request)
> **Tình huống:** Người dùng gõ nhầm điểm âm hoặc gõ thừa số (`10.5` hoặc `-1`):
```json
{
  "success": false,
  "status_code": 400,
  "message": "Điểm số không hợp lệ, thang điểm từ 0.0 đến 10.0",
  "error_code": "ACAD_SCORE_OUT_OF_RANGE",
  "details": [
    {
      "field": "scores[0].score_value",
      "issue": "Giá trị điểm phải là số thực từ 0.0 đến 10.0 với tối đa 1 chữ số thập phân (nhận được: 10.5)"
    }
  ],
  "timestamp": "2026-09-27T08:30:00.000Z"
}
```

##### 2. Lời phê điểm quá dài (HTTP 400 Bad Request)
> **Tình huống:** Trường `teacher_comment` là trường tùy chọn (optional) gõ từ bàn phím, nhưng nếu gõ vượt quá 255 ký tự:
```json
{
  "success": false,
  "status_code": 400,
  "message": "Nội dung lời phê vượt quá giới hạn độ dài cho phép",
  "error_code": "COMMON_VALIDATION_ERROR",
  "details": [
    {
      "field": "scores[1].teacher_comment",
      "issue": "Lời phê giáo viên không được vượt quá 255 ký tự (hiện tại: 290 ký tự)"
    }
  ],
  "timestamp": "2026-09-27T08:30:00.000Z"
}
```

##### 3. Giáo viên không được phân công dạy môn này (HTTP 403 Forbidden)
```json
{
  "success": false,
  "status_code": 403,
  "message": "Giáo viên không được phân công giảng dạy môn học này tại lớp đã chọn",
  "error_code": "ACAD_NOT_ASSIGNED_TEACHER",
  "details": null,
  "timestamp": "2026-09-27T08:30:00.000Z"
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

#### Response Thất Bại Thường Gặp
##### Điểm số ngoài thang 0 - 10 (HTTP 400 Bad Request)
```json
{
  "success": false,
  "status_code": 400,
  "message": "Điểm số không hợp lệ, thang điểm từ 0.0 đến 10.0",
  "error_code": "ACAD_SCORE_OUT_OF_RANGE",
  "details": [
    {
      "field": "scores[0].score_value",
      "issue": "Giá trị điểm phải nằm trong khoảng từ 0 đến 10"
    }
  ],
  "timestamp": "2026-09-27T08:30:00.000Z"
}
```

##### Giáo viên không được phân công dạy môn (HTTP 403 Forbidden)
```json
{
  "success": false,
  "status_code": 403,
  "message": "Giáo viên không được phân công giảng dạy môn học này tại lớp đã chọn",
  "error_code": "ACAD_NOT_ASSIGNED_TEACHER",
  "details": null,
  "timestamp": "2026-09-27T08:30:00.000Z"
}
```

---

## 3. Bảng Tổng Hợp Mã Lỗi Phân Hệ Grades

| HTTP Status | Mã Lỗi (`error_code`) | Ý nghĩa & Tình huống xảy ra |
| :---: | :--- | :--- |
| `400` | `ACAD_SCORE_OUT_OF_RANGE` | Giá trị điểm nhập vào nhỏ hơn 0 hoặc lớn hơn 10. |
| `400` | `ACAD_SEMESTER_LOCKED` | Học kỳ này đã được quản trị viên đóng/khóa sổ điểm, không thể sửa đổi. |
| `400` | `COMMON_VALIDATION_ERROR` | Thiếu trường bắt buộc (`class_id`, `subject_code`, `score_type`,...). |
| `401` | `AUTH_UNAUTHORIZED` | Không có Bearer token hoặc token đã hết hạn. |
| `403` | `ACAD_NOT_ASSIGNED_TEACHER` | Giáo viên đăng nhập không phụ trách môn học này ở lớp tương ứng. |
| `404` | `CLASS_NOT_FOUND` | Lớp học không tồn tại trong hệ thống. |
| `404` | `STUDENT_NOT_FOUND` | `student_id` trong danh sách điểm không thuộc danh sách lớp. |
| `500` | `SYS_INTERNAL_ERROR` | Lỗi máy chủ cơ sở dữ liệu nội bộ. |

