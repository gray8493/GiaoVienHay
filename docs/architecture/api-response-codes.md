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

### 3.1. Phân hệ 01: Xác thực & Quyền hạn (AUTH_*)
| Mã lỗi nghiệp vụ | HTTP Code | Thông báo gợi ý |
| :--- | :---: | :--- |
| `AUTH_INVALID_CREDENTIALS` | 401 | Email hoặc mật khẩu không chính xác. |
| `AUTH_TOKEN_EXPIRED` | 401 | Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại hoặc làm mới token. |
| `AUTH_TOKEN_INVALID` | 401 | Token xác thực không hợp lệ hoặc đã bị thu hồi. |
| `AUTH_ROLE_FORBIDDEN` | 403 | Bạn không có quyền truy cập vào chức năng này. |
| `AUTH_ACCOUNT_LOCKED` | 403 | Tài khoản của bạn đã bị khóa bởi Quản trị viên. |

### 3.2. Phân hệ 02: Người dùng & Hồ sơ cá nhân (USER_*)
| Mã lỗi nghiệp vụ | HTTP Code | Thông báo gợi ý |
| :--- | :---: | :--- |
| `USER_NOT_FOUND` | 404 | Không tìm thấy người dùng trong hệ thống. |
| `USER_EMAIL_EXISTS` | 409 | Địa chỉ email này đã được sử dụng cho một tài khoản khác. |
| `USER_PHONE_EXISTS` | 409 | Số điện thoại này đã được sử dụng. |

### 3.3. Phân hệ 03: Lớp học & Phân công bộ môn (CLASS_*)
| Mã lỗi nghiệp vụ | HTTP Code | Thông báo gợi ý |
| :--- | :---: | :--- |
| `CLASS_NOT_FOUND` | 404 | Không tìm thấy lớp học. |
| `CLASS_INVITE_CODE_INVALID` | 404 | Mã mời tham gia lớp học không hợp lệ hoặc đã hết hạn. |
| `CLASS_NOT_HOMEROOM_TEACHER`| 403 | Chỉ Giáo viên chủ nhiệm mới có quyền thực hiện thao tác này. |
| `CLASS_STUDENT_CODE_EXISTS` | 409 | Mã học sinh đã tồn tại trong danh sách của lớp. |
| `CLASS_MAX_STUDENTS_EXCEEDED`| 400 | Lớp học đã đạt sĩ số tối đa theo quy định hạn mức hệ thống. |

### 3.4. Phân hệ 04: Hồ sơ Học sinh & Cổng Phụ huynh (STUDENT_*)
| Mã lỗi nghiệp vụ | HTTP Code | Thông báo gợi ý |
| :--- | :---: | :--- |
| `STUDENT_NOT_FOUND` | 404 | Không tìm thấy hồ sơ học sinh. |
| `PARENT_STUDENT_LINK_NOT_FOUND`| 403 | Bạn không có quyền xem thông tin của học sinh này. |
| `STUDENT_ALREADY_LINKED` | 409 | Học sinh này đã được liên kết với tài khoản phụ huynh này. |

### 3.5. Phân hệ 05: Điểm danh & Chuyên cần (ATTEND_*)
| Mã lỗi nghiệp vụ | HTTP Code | Thông báo gợi ý |
| :--- | :---: | :--- |
| `ATTEND_RECORD_NOT_FOUND` | 404 | Không tìm thấy bản ghi điểm danh yêu cầu. |
| `ATTEND_ALREADY_EXISTS` | 409 | Tiết học/buổi học này đã được điểm danh trước đó. |
| `ATTEND_DATE_IN_FUTURE` | 400 | Không thể thực hiện điểm danh cho ngày trong tương lai. |
| `ATTEND_DATE_INVALID` | 400 | Ngày điểm danh không tồn tại trong lịch thực tế. |

### 3.6. Phân hệ 06: Sổ điểm & Bảng xếp hạng (ACAD_* & GRADE_*)
| Mã lỗi nghiệp vụ | HTTP Code | Thông báo gợi ý |
| :--- | :---: | :--- |
| `ACAD_NOT_ASSIGNED_TEACHER` | 403 | Giáo viên chưa được phân công giảng dạy môn học này tại lớp. |
| `ACAD_SCORE_OUT_OF_RANGE` | 400 | Điểm số phải nằm trong khoảng từ 0.0 đến 10.0. |
| `ACAD_SEMESTER_LOCKED` | 400 | Học kỳ đã kết thúc, không thể chỉnh sửa điểm số. |
| `GRADE_RECORD_NOT_FOUND` | 404 | Không tìm thấy bản ghi điểm số của học sinh. |
| `GRADE_NOT_PUBLISHED` | 400 | Bảng điểm môn học chưa được công bố tới phụ huynh. |

### 3.7. Phân hệ 07: Trợ giảng AI Gemini & Mini-game (QUIZ_* & GAME_*)
| Mã lỗi nghiệp vụ | HTTP Code | Thông báo gợi ý |
| :--- | :---: | :--- |
| `QUIZ_NOT_FOUND` | 404 | Không tìm thấy bộ câu hỏi kiểm tra bài cũ. |
| `QUIZ_FILE_TOO_LARGE` | 400 | Tệp giáo án tải lên vượt quá dung lượng cho phép (tối đa 15MB). |
| `QUIZ_FILE_INVALID_FORMAT` | 400 | Định dạng tệp không được hỗ trợ (chỉ chấp nhận .pdf và .docx). |
| `QUIZ_AI_GENERATION_FAILED` | 500 | Lỗi khi Google Gemini xử lý giáo án hoặc sinh câu hỏi trắc nghiệm. |
| `QUIZ_DAILY_QUOTA_EXCEEDED` | 429 | Giáo viên đã sử dụng hết hạn ngạch gọi AI Gemini miễn phí trong ngày. |
| `QUIZ_INVALID_MODE` | 400 | Chế độ chơi hoặc hình thức kiểm tra không hợp lệ. |

### 3.8. Phân hệ 08: Nhận xét Học sinh (REMARK_*)
| Mã lỗi nghiệp vụ | HTTP Code | Thông báo gợi ý |
| :--- | :---: | :--- |
| `REMARK_NOT_FOUND` | 404 | Không tìm thấy bản ghi nhận xét của học sinh. |
| `REMARK_CONTENT_EMPTY` | 400 | Nội dung nhận xét không được để trống. |
| `REMARK_ALREADY_ACKNOWLEDGED` | 400 | Nhận xét này đã được phụ huynh đọc và xác nhận trước đó. |

### 3.9. Phân hệ 09: Lời nhắc Lịch kiểm tra (EXAM_*)
| Mã lỗi nghiệp vụ | HTTP Code | Thông báo gợi ý |
| :--- | :---: | :--- |
| `EXAM_REMINDER_NOT_FOUND` | 404 | Không tìm thấy lời nhắc lịch kiểm tra. |
| `EXAM_DATE_INVALID` | 400 | Ngày kiểm tra không hợp lệ hoặc đã trôi qua trong quá khứ. |
| `EXAM_TYPE_INVALID` | 400 | Loại hình kiểm tra không nằm trong danh mục chuẩn. |

### 3.10. Phân hệ 10: Học phí & BHYT (FEE_*)
| Mã lỗi nghiệp vụ | HTTP Code | Thông báo gợi ý |
| :--- | :---: | :--- |
| `FEE_RECORD_NOT_FOUND` | 404 | Không tìm thấy bản ghi theo dõi học phí hoặc BHYT của học sinh. |
| `FEE_TERM_LOCKED` | 400 | Đợt thu nộp đã kết thúc, không thể điều chỉnh trạng thái cờ nộp. |
| `FEE_INVALID_FLAG` | 400 | Trạng thái cờ nộp phí không hợp lệ (chỉ nhận boolean true/false). |

### 3.11. Phân hệ 11: Thông báo Đẩy FCM (NOTI_*)
| Mã lỗi nghiệp vụ | HTTP Code | Thông báo gợi ý |
| :--- | :---: | :--- |
| `NOTI_NOT_FOUND` | 404 | Không tìm thấy bản ghi thông báo trong hộp thư. |
| `NOTI_DEVICE_TOKEN_INVALID` | 400 | Thiết bị không hợp lệ để nhận thông báo đẩy FCM. |
| `NOTI_DISPATCH_FAILED` | 500 | Lỗi dịch vụ Google Firebase FCM khi gửi thông báo đẩy. |

### 3.12. Phân hệ 12: Quản trị Nền tảng (ADM_*)
| Mã lỗi nghiệp vụ | HTTP Code | Thông báo gợi ý |
| :--- | :---: | :--- |
| `ADM_ACCOUNT_ALREADY_BANNED` | 400 | Tài khoản người dùng đã ở trạng thái bị khóa. |
| `ADM_ACCOUNT_ALREADY_ACTIVE` | 400 | Tài khoản người dùng đang hoạt động bình thường, không thể mở khóa lại. |
| `ADM_CANNOT_BAN_ADMIN` | 403 | Không thể khóa tài khoản có vai trò Quản trị viên cấp cao (ADMIN). |
| `ADM_INVALID_LIMITS` | 400 | Thông số cấu hình hạn mức tài nguyên không hợp lệ (phải là số nguyên dương). |

### 3.13. Phân hệ Lỗi Hệ thống & Tham số Chung (COMMON_* & SYS_*)
| Mã lỗi nghiệp vụ | HTTP Code | Thông báo gợi ý |
| :--- | :---: | :--- |
| `COMMON_VALIDATION_ERROR` | 400 | Dữ liệu gửi lên vi phạm quy tắc ràng buộc hoặc sai định dạng. |
| `REQ_VALIDATION_ERROR` | 422 | Dữ liệu đầu vào sai quy cách định dạng DTO Validation. |
| `SYS_RATE_LIMIT_EXCEEDED` | 429 | Vượt quá tần suất yêu cầu tối đa cho phép trong 1 phút. |
| `SYS_INTERNAL_ERROR` | 500 | Lỗi máy chủ nội bộ chưa được xử lý ngoại lệ. |
| `SYS_SERVICE_UNAVAILABLE` | 503 | Dịch vụ cơ sở dữ liệu Firebase hoặc Google Cloud tạm thời không phản hồi. |


