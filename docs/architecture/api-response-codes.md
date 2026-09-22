# Quy Chuẩn Mã Phản Hồi & Cấu Trúc Dữ Liệu API (API Status & Response Codes Specification)
# Dự Án GiaoVienHay

Tài liệu này định nghĩa chuẩn mực cấu trúc phản hồi (**Response Envelope**) và danh mục toàn bộ mã trạng thái HTTP cùng mã lỗi nghiệp vụ (**Business Error Codes**) áp dụng cho Backend NestJS, Web Quản trị Next.js và Mobile App React Native.

---

## 1. Cấu Trúc Phản Hồi Chuẩn (Standard Response Envelope Schema)

Tất cả các API của hệ thống GiaoVienHay đều trả về dữ liệu định dạng **JSON** theo cấu trúc bao bọc nhất quán (Consistent Envelope Pattern):

### 1.1. Cấu trúc phản hồi Thành công (Success Response) - HTTP 200, 201

```json
{
  "success": true,
  "status_code": 200,
  "message": "Thao tác thành công",
  "data": {
    "id": "usr_98a76b5c",
    "email": "teacher.an@school.edu.vn",
    "full_name": "Nguyễn Văn An",
    "role": "TEACHER"
  },
  "timestamp": "2026-09-22T08:30:00.000Z"
}
```

- **`success`** (`boolean`): Luôn luôn là `true`.
- **`status_code`** (`number`): Mã trạng thái HTTP (200 OK, 201 Created).
- **`message`** (`string`): Thông điệp mô tả ngắn gọn, thân thiện với người dùng bằng tiếng Việt.
- **`data`** (`object` | `array` | `null`): Dữ liệu kết quả nghiệp vụ.
- **`timestamp`** (`string`): Thời gian phát sinh phản hồi theo chuẩn ISO 8601 UTC.

### 1.2. Cấu trúc phản hồi Thất bại / Lỗi (Error Response) - HTTP 4xx, 5xx

```json
{
  "success": false,
  "status_code": 400,
  "message": "Dữ liệu điểm số không hợp lệ",
  "error_code": "ACAD_SCORE_OUT_OF_RANGE",
  "details": [
    {
      "field": "score",
      "issue": "Điểm số phải nằm trong khoảng từ 0.0 đến 10.0"
    }
  ],
  "timestamp": "2026-09-22T08:30:00.000Z"
}
```

- **`success`** (`boolean`): Luôn luôn là `false`.
- **`status_code`** (`number`): Mã lỗi HTTP chuẩn (400, 401, 403, 404, 422, 500).
- **`message`** (`string`): Thông điệp mô tả lỗi bằng tiếng Việt để hiển thị lên giao diện.
- **`error_code`** (`string`): Mã lỗi nghiệp vụ dạng chuỗi hằng số (UPPERCASE) giúp Frontend lập trình xử lý logic rẽ nhánh.
- **`details`** (`array` | `null`): Mảng chi tiết lỗi theo từng trường dữ liệu (Validation errors).

---

## 2. Danh Mục Mã Trạng Thái HTTP Chuẩn (Standard HTTP Status Codes)

| HTTP Code | Ý nghĩa chuẩn | Ứng dụng trong GiaoVienHay |
| :---: | :--- | :--- |
| **200** | OK | Truy vấn dữ liệu thành công (`GET`), cập nhật thành công (`PUT`, `PATCH`). |
| **201** | Created | Tạo mới thành công (`POST`): tạo người dùng, nộp điểm danh, nhập điểm mới. |
| **400** | Bad Request | Dữ liệu đầu vào không hợp lệ hoặc sai quy tắc nghiệp vụ. |
| **401** | Unauthorized | Thiếu Access Token, Token hết hạn hoặc không hợp lệ. |
| **403** | Forbidden | Token hợp lệ nhưng không đủ quyền thực hiện hành động (vi phạm RBAC). |
| **404** | Not Found | Không tìm thấy tài nguyên yêu cầu (Học sinh, Lớp học, Bài viết không tồn tại). |
| **409** | Conflict | Xung đột dữ liệu (Email/SĐT đã tồn tại, Điểm danh trùng lặp cùng tiết). |
| **422** | Unprocessable Entity | Dữ liệu gửi lên đúng định dạng JSON nhưng sai kiểu dữ liệu trường (DTO Validation). |
| **429** | Too Many Requests | Vượt quá số lần gọi API cho phép trong 1 phút (Rate Limit). |
| **500** | Internal Server Error | Lỗi nội bộ phía máy chủ chưa được kiểm soát (Database crash, bug mã nguồn). |

---

## 3. Bảng Mã Lỗi Nghiệp Vụ (Business Error Codes Dictionary)

### 3.1. Phân hệ Xác thực & Quyền hạn (AUTH_*)
| Mã lỗi nghiệp vụ | HTTP Code | Thông báo gợi ý |
| :--- | :---: | :--- |
| `AUTH_INVALID_CREDENTIALS` | 401 | Email hoặc mật khẩu không chính xác. |
| `AUTH_TOKEN_EXPIRED` | 401 | Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại hoặc làm mới token. |
| `AUTH_TOKEN_INVALID` | 401 | Token xác thực không hợp lệ hoặc đã bị thu hồi. |
| `AUTH_ROLE_FORBIDDEN` | 403 | Bạn không có quyền truy cập vào chức năng này. |
| `AUTH_ACCOUNT_LOCKED` | 403 | Tài khoản của bạn đã bị khóa bởi Quản trị viên. |

### 3.2. Phân hệ Người dùng & Học sinh (USER_*)
| Mã lỗi nghiệp vụ | HTTP Code | Thông báo gợi ý |
| :--- | :---: | :--- |
| `USER_NOT_FOUND` | 404 | Không tìm thấy người dùng trong hệ thống. |
| `USER_EMAIL_EXISTS` | 409 | Địa chỉ email này đã được sử dụng cho một tài khoản khác. |
| `USER_PHONE_EXISTS` | 409 | Số điện thoại này đã được sử dụng. |
| `STUDENT_NOT_FOUND` | 404 | Không tìm thấy hồ sơ học sinh. |
| `PARENT_STUDENT_LINK_NOT_FOUND`| 403 | Bạn không có quyền xem thông tin của học sinh này. |

### 3.3. Phân hệ Học vụ & Điểm số (ACAD_*)
| Mã lỗi nghiệp vụ | HTTP Code | Thông báo gợi ý |
| :--- | :---: | :--- |
| `ACAD_CLASS_NOT_FOUND` | 404 | Không tìm thấy lớp học. |
| `ACAD_NOT_ASSIGNED_TEACHER` | 403 | Giáo viên chưa được phân công giảng dạy lớp học này. |
| `ACAD_SCORE_OUT_OF_RANGE` | 400 | Điểm số phải nằm trong khoảng từ 0.0 đến 10.0. |
| `ACAD_ATTENDANCE_ALREADY_EXISTS`| 409 | Buổi học này đã được điểm danh trước đó. |
| `ACAD_SEMESTER_LOCKED` | 400 | Học kỳ đã kết thúc, không thể chỉnh sửa điểm số. |

### 3.4. Phân hệ Thông báo & Thanh toán (NOTI_* & PAY_*)
| Mã lỗi nghiệp vụ | HTTP Code | Thông báo gợi ý |
| :--- | :---: | :--- |
| `NOTI_DEVICE_TOKEN_INVALID` | 400 | Thiết bị không hợp lệ để nhận thông báo đẩy FCM. |
| `PAY_INVOICE_NOT_FOUND` | 404 | Không tìm thấy hóa đơn học phí. |
| `PAY_INVOICE_ALREADY_PAID` | 409 | Hóa đơn này đã được thanh toán thành công trước đó. |
| `PAY_SIGNATURE_INVALID` | 400 | Chữ ký số giao dịch từ cổng thanh toán không khớp. |

