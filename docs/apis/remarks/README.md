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

#### Request Body
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
