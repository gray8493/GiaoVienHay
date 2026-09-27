# Đặc Tả API Phân Hệ Nhận Xét Học Sinh (Remarks API Specification)
# Module: Remarks (`/api/v1/remarks`)

---

## 1. Tổng Quan Phân Hệ
Phân hệ **Remarks** cho phép Giáo viên (cả GVCN và GVBM) gửi lời nhận xét, đánh giá ngắn gọn về tinh thần học tập, nề nếp hoặc bài làm của học sinh tới Phụ huynh:
- **Thuần túy văn bản ngắn (Text-based):** Sử dụng các đoạn text ngắn gọn, chân thực (Ví dụ: *"Hôm nay em phát biểu rất hăng hái"*, *"Cần chú ý nghe giảng hơn"*), **hoàn toàn không sử dụng hệ thống thẻ nhãn tags rườm rà**.
- **Đẩy thông báo tức thì (FCM):** Nhận xét được lưu vào Firestore collection `/remarks` và lập tức bắn thông báo đến điện thoại phụ huynh.
- **Tương tác 2 chiều:** Phụ huynh có thể bấm nút **"Xác nhận đã đọc"** trên ứng dụng di động để phản hồi cho giáo viên.

| Method | Endpoint | Quyền truy cập (RBAC) | Mô tả chức năng |
| :---: | :--- | :---: | :--- |
| `POST` | `/api/v1/remarks` | `TEACHER_*` | Gửi lời nhận xét ngắn gọn cho học sinh $\rightarrow$ Bắn FCM tới PH |
| `GET` | `/api/v1/remarks/class/:classId` | `TEACHER_*` | Xem danh sách các nhận xét đã gửi trong lớp học |
| `PATCH` | `/api/v1/remarks/:id/acknowledge` | `PARENT` | Phụ huynh bấm "Xác nhận đã đọc" lời nhận xét |

---

## 2. Chi Tiết Từng API

### 2.1. POST `/api/v1/remarks` - Gửi Lời Nhận Xét Ngắn
- **Headers:** `Authorization: Bearer <token_gv>`, `Content-Type: application/json`

#### Bảng Quy Định Dữ Liệu Đầu Vào (Input Specification)

| Tên trường (Field) | Vị trí | Bắt buộc / Tùy chọn | Phương thức nhập liệu | Kiểu dữ liệu & Ràng buộc validation |
| :--- | :---: | :---: | :---: | :--- |
| `student_id` | Body | **Bắt buộc** | Chọn từ Danh Sách Học Sinh | Chuỗi ID học sinh hợp lệ trong lớp. |
| `class_id` | Body | **Bắt buộc** | Chọn từ Menu Lớp | Chuỗi ID lớp học. |
| `subject_code` | Body | **Tùy chọn** (với GVCN) / Bắt buộc (với GVBM) | **Chọn Dropdown Môn Học** | Mã môn học nếu là nhận xét bộ môn, hoặc `null` nếu là nhận xét nề nếp chung của GVCN. |
| `content` | Body | **Bắt buộc** | **Gõ tự do từ bàn phím** | Đoạn văn bản thuần túy (`string`), độ dài từ `3` đến `1000` ký tự. Tự động `trim()`. Không được rỗng hoặc chỉ toàn khoảng trắng. Không dùng hệ thống gắn thẻ (tag) phức tạp. |

#### Request Body Hợp Lệ
```json
{
  "student_id": "stu_01",
  "class_id": "cls_1a_2026",
  "subject_code": "MATH",
  "content": "Hôm nay em Nam tiếp thu bài rất nhanh và hăng hái xung phong lên bảng chữa bài tập."
}
```

#### Response Thành Công (HTTP 201 Created)
```json
{
  "success": true,
  "status_code": 201,
  "message": "Đã lưu nhận xét và gửi thông báo tới phụ huynh",
  "data": {
    "remark_id": "rmk_9912",
    "student_id": "stu_01",
    "content": "Hôm nay em Nam tiếp thu bài rất nhanh...",
    "created_at": "2026-09-23T10:15:00.000Z",
    "fcm_delivered": true
  }
}
```

#### Các Response Thất Bại & Lỗi Validation Chi Tiết

##### 1. Nội dung nhận xét chỉ toàn khoảng trắng hoặc rỗng (HTTP 400 Bad Request)
> **Tình huống:** Người dùng chỉ gõ phím cách (khoảng trắng `"   "`) rồi bấm gửi:
```json
{
  "success": false,
  "status_code": 400,
  "message": "Nội dung nhận xét không được để trống",
  "error_code": "REMARK_CONTENT_EMPTY",
  "details": [
    {
      "field": "content",
      "issue": "Nội dung nhận xét sau khi chuẩn hóa (trim) phải có tối thiểu 3 ký tự"
    }
  ],
  "timestamp": "2026-09-27T08:30:00.000Z"
}
```

##### 2. Nhận xét vượt quá 1000 ký tự (HTTP 400 Bad Request)
> **Tình huống:** Người dùng dán (paste) một bài văn quá dài vào ô nhận xét:
```json
{
  "success": false,
  "status_code": 400,
  "message": "Nội dung nhận xét vượt quá độ dài tối đa cho phép",
  "error_code": "COMMON_VALIDATION_ERROR",
  "details": [
    {
      "field": "content",
      "issue": "Lời nhận xét tối đa 1000 ký tự (nhận được: 1250 ký tự)"
    }
  ],
  "timestamp": "2026-09-27T08:30:00.000Z"
}
```


---

### 2.2. PATCH `/api/v1/remarks/:id/acknowledge` - Phụ Huynh Xác Nhận Đã Đọc
- **Mô tả:** Phụ huynh mở sổ liên lạc, xem nhận xét và chạm nút "Xác nhận đã đọc".
- **Headers:** `Authorization: Bearer <token_parent>`

#### Response Thành Công (HTTP 200 OK)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Đã ghi nhận xác nhận từ phụ huynh",
  "data": {
    "remark_id": "rmk_9912",
    "parent_acknowledged": true,
    "acknowledged_at": "2026-09-23T10:20:00.000Z"
  }
}
```

#### Response Thất Bại Thường Gặp
##### Nội dung nhận xét để trống hoặc vượt quá 1000 ký tự (HTTP 400 Bad Request)
```json
{
  "success": false,
  "status_code": 400,
  "message": "Nội dung nhận xét không được để trống",
  "error_code": "REMARK_CONTENT_EMPTY",
  "details": [
    {
      "field": "content",
      "issue": "Nội dung nhận xét tối thiểu 3 ký tự và tối đa 1000 ký tự"
    }
  ],
  "timestamp": "2026-09-27T08:30:00.000Z"
}
```

##### Nhận xét không tồn tại hoặc đã bị xóa (HTTP 404 Not Found)
```json
{
  "success": false,
  "status_code": 404,
  "message": "Không tìm thấy nhận xét này trên hệ thống",
  "error_code": "REMARK_NOT_FOUND",
  "details": null,
  "timestamp": "2026-09-27T08:30:00.000Z"
}
```

---

## 3. Bảng Tổng Hợp Mã Lỗi Phân Hệ Remarks

| HTTP Status | Mã Lỗi (`error_code`) | Ý nghĩa & Tình huống xảy ra |
| :---: | :--- | :--- |
| `400` | `REMARK_CONTENT_EMPTY` | Nội dung nhận xét rỗng hoặc chỉ có khoảng trắng. |
| `400` | `COMMON_VALIDATION_ERROR` | Thiếu trường bắt buộc (`student_id`, `class_id`,...). |
| `401` | `AUTH_UNAUTHORIZED` | Bearer token không hợp lệ hoặc đã hết hạn. |
| `403` | `AUTH_FORBIDDEN` | Phụ huynh cố tình xác nhận nhận xét của học sinh không phải con mình. |
| `404` | `REMARK_NOT_FOUND` | `remark_id` không tồn tại trong Firestore. |
| `404` | `STUDENT_NOT_FOUND` | Học sinh không tồn tại trong hệ thống. |
| `500` | `SYS_INTERNAL_ERROR` | Lỗi máy chủ cơ sở dữ liệu nội bộ. |

