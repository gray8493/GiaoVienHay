# TỪ ĐIỂN MÃ LỖI & THÔNG ĐIỆP HỆ THỐNG TOÀN DIỆN (SYSTEM ERROR CODES & MESSAGES DICTIONARY)
# DỰ ÁN GIAOVIENHAY

Tài liệu này định nghĩa tập trung và toàn diện 100% các **Mã Lỗi Nghiệp Vụ (`error_code`)**, **Mã Trạng Thái HTTP (`status_code`)**, **Thông Điệp Tiếng Việt Chuẩn (`message`)**, cùng định nghĩa mã nguồn TypeScript để sử dụng xuyên suốt cho:
- **Backend NestJS:** `apps/backend/src/common/constants/error-codes.ts`
- **Gói dùng chung:** `packages/shared-types/src/error-codes.ts`
- **Mobile React Native & Web Admin Next.js:** Xử lý rẽ nhánh thông báo lỗi đa ngôn ngữ / UI toast.

---

## 1. QUY CHUẨN ĐẶT MÃ LỖI (ERROR CODE NAMING CONVENTION)

Mọi mã lỗi nghiệp vụ trong hệ thống đều tuân thủ cú pháp chuỗi viết hoa:
```text
<TIỀN_TỐ_PHÂN_HỆ>_<ĐỐI_TƯỢNG>_<NGUYÊN_NHÂN>
```

- **Định dạng:** Chữ in hoa (SCREAMING_SNAKE_CASE).
- **Tính nhất quán:** Luôn đi kèm 1 thông điệp tiếng Việt mặc định thân thiện với người dùng, tuyệt đối không trả về stack trace hoặc thông tin kỹ thuật nhạy cảm ra ngoài client.

---

## 2. BẢNG TỔNG HỢP TRA CỨU 12 PHÂN HỆ HỆ THỐNG

### 2.1. Phân hệ 01: Xác thực & Quản lý phiên làm việc (`AUTH_*`)

| Mã Lỗi (`error_code`) | HTTP Status | Thông Điệp Mặc Định (`message`) | Tình huống kích hoạt (Trigger Condition) |
| :--- | :---: | :--- | :--- |
| `AUTH_INVALID_CREDENTIALS` | `401` | Email hoặc mật khẩu không chính xác. | Sai mật khẩu hoặc email không tồn tại khi đăng nhập. |
| `AUTH_TOKEN_EXPIRED` | `401` | Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại hoặc làm mới token. | JWT Access Token đã quá thời hạn hiệu lực (hết hạn sau 1h). |
| `AUTH_TOKEN_INVALID` | `401` | Token xác thực không hợp lệ hoặc đã bị thu hồi. | Chữ ký JWT sai, token bị sửa đổi hoặc nằm trong Redis Blacklist. |
| `AUTH_UNAUTHORIZED` | `401` | Yêu cầu truy cập chưa được xác thực danh tính. | Request không gửi kèm header `Authorization: Bearer <token>`. |
| `AUTH_ROLE_FORBIDDEN` | `403` | Bạn không có quyền truy cập vào chức năng này. | Người dùng không sở hữu role yêu cầu (ví dụ: Phụ huynh gọi API của GV). |
| `AUTH_ACCOUNT_LOCKED` | `403` | Tài khoản của bạn đã bị khóa bởi Quản trị viên. | Cờ `is_active = false` hoặc tài khoản bị Ban trên Firebase Auth. |
| `AUTH_REFRESH_TOKEN_INVALID`| `401` | Phiên làm mới không hợp lệ hoặc đã hết hạn. | Refresh token không tìm thấy trong Redis hoặc đã quá hạn 30 ngày. |
| `AUTH_FIREBASE_UID_EXISTS` | `409` | Định danh Firebase UID này đã tồn tại trong hệ thống. | Tạo tài khoản trùng lặp UID với tài khoản đã có. |

---

### 2.2. Phân hệ 02: Người dùng & Hồ sơ cá nhân (`USER_*`)

| Mã Lỗi (`error_code`) | HTTP Status | Thông Điệp Mặc Định (`message`) | Tình huống kích hoạt (Trigger Condition) |
| :--- | :---: | :--- | :--- |
| `USER_NOT_FOUND` | `404` | Không tìm thấy người dùng trong hệ thống. | Truy vấn hồ sơ với `userId` không tồn tại trong Firestore. |
| `USER_EMAIL_EXISTS` | `409` | Địa chỉ email này đã được sử dụng cho một tài khoản khác. | Đăng ký hoặc cập nhật hồ sơ với email đã có người dùng khác sở hữu. |
| `USER_PHONE_EXISTS` | `409` | Số điện thoại này đã được đăng ký cho tài khoản khác. | Đăng ký hoặc đổi số điện thoại đã tồn tại. |
| `USER_INACTIVE` | `403` | Tài khoản người dùng đang tạm ngưng hoạt động. | Tài khoản chưa kích hoạt hoặc đang chờ duyệt. |
| `USER_PROFILE_INCOMPLETE` | `400` | Thông tin hồ sơ chưa đầy đủ thông tin bắt buộc. | Giáo viên thiếu tên trường công tác hoặc chưa chọn môn giảng dạy. |
| `USER_FCM_TOKEN_INVALID` | `400` | Mã thiết bị nhận thông báo FCM không hợp lệ. | Client gửi token rỗng hoặc chuỗi sai định dạng Firebase Messaging. |

---

### 2.3. Phân hệ 03: Lớp học & Phân công giáo viên (`CLASS_*`)

| Mã Lỗi (`error_code`) | HTTP Status | Thông Điệp Mặc Định (`message`) | Tình huống kích hoạt (Trigger Condition) |
| :--- | :---: | :--- | :--- |
| `CLASS_NOT_FOUND` | `404` | Không tìm thấy lớp học trên hệ thống. | `class_id` không tồn tại trong collection `/classes`. |
| `CLASS_INVITE_CODE_INVALID` | `404` | Mã mời tham gia lớp học không hợp lệ hoặc đã hết hạn. | Phụ huynh quét mã QR / click link chứa invite code sai hoặc đã bị hủy. |
| `CLASS_NOT_HOMEROOM_TEACHER`| `403` | Chỉ Giáo viên chủ nhiệm mới có quyền thực hiện thao tác này. | GVBM hoặc PH cố tình thực hiện thao tác quản trị lớp (tạo lớp, phân công). |
| `CLASS_STUDENT_CODE_EXISTS` | `409` | Mã học sinh đã tồn tại trong danh sách của lớp học này. | Thêm mới hoặc import học sinh trùng `student_code` trong cùng 1 lớp. |
| `CLASS_MAX_STUDENTS_EXCEEDED`| `400`| Lớp học đã đạt sĩ số tối đa theo quy định hạn mức hệ thống. | Sĩ số lớp vượt quá cấu hình `max_students_per_class` của Admin. |
| `CLASS_HOMEROOM_CONFLICT` | `409` | Giáo viên này đã được phân công làm chủ nhiệm cho một lớp học khác. | Một giáo viên chỉ được làm chủ nhiệm duy nhất 1 lớp trong cùng 1 năm học. |
| `CLASS_GRADE_LEVEL_INVALID` | `400` | Khối lớp không hợp lệ, hệ thống chỉ hỗ trợ từ Khối 1 đến Khối 9. | Giá trị `grade_level` nhỏ hơn 1 hoặc lớn hơn 9. |

---

### 2.4. Phân hệ 04: Hồ sơ Học sinh & Cổng tra cứu phụ huynh (`STUDENT_*`)

| Mã Lỗi (`error_code`) | HTTP Status | Thông Điệp Mặc Định (`message`) | Tình huống kích hoạt (Trigger Condition) |
| :--- | :---: | :--- | :--- |
| `STUDENT_NOT_FOUND` | `404` | Không tìm thấy hồ sơ học sinh trên hệ thống. | `student_id` không tồn tại trong collection `/students`. |
| `PARENT_STUDENT_LINK_NOT_FOUND`| `403`| Bạn không có quyền truy cập hồ sơ của học sinh này. | Phụ huynh tra cứu học sinh không nằm trong mảng `parent_uids` của hồ sơ. |
| `STUDENT_ALREADY_LINKED` | `409` | Học sinh này đã được liên kết với tài khoản phụ huynh này. | Phụ huynh bấm link mời và chọn lại đúng con đã liên kết thành công. |
| `STUDENT_DOB_INVALID` | `400` | Ngày sinh học sinh không hợp lệ hoặc không tồn tại trong lịch thực tế. | Nhập ngày ảo (VD: `2018-02-30`) hoặc ngày sinh rơi vào tương lai. |
| `STUDENT_NOT_IN_CLASS` | `400` | Học sinh không thuộc danh sách biên chế của lớp học này. | Thực hiện điểm danh hoặc vào điểm cho học sinh của lớp khác. |

---

### 2.5. Phân hệ 05: Điểm danh & Theo dõi chuyên cần (`ATTEND_*`)

| Mã Lỗi (`error_code`) | HTTP Status | Thông Điệp Mặc Định (`message`) | Tình huống kích hoạt (Trigger Condition) |
| :--- | :---: | :--- | :--- |
| `ATTEND_RECORD_NOT_FOUND` | `404` | Không tìm thấy bản ghi điểm danh yêu cầu. | Cập nhật bản ghi điểm danh với ID không tồn tại. |
| `ATTEND_ALREADY_EXISTS` | `409` | Tiết học hoặc buổi học này đã được điểm danh trước đó. | Lớp học đã được nộp điểm danh cho ngày/tiết này rồi. |
| `ATTEND_DATE_IN_FUTURE` | `400` | Không thể thực hiện điểm danh cho ngày trong tương lai. | Gửi `attendance_date` lớn hơn ngày hiện tại của máy chủ. |
| `ATTEND_DATE_INVALID` | `400` | Ngày điểm danh không tồn tại trong lịch thực tế. | Nhập ngày không có thật (VD: `2026-02-30`, `2026-13-45`). |
| `ATTEND_STATUS_INVALID` | `400` | Trạng thái điểm danh không hợp lệ. | Giá trị status ngoài danh mục (`PRESENT`, `ABSENT_EXCUSED`, `ABSENT_UNEXCUSED`). |

---

### 2.6. Phân hệ 06: Sổ điểm & Bảng xếp hạng (`ACAD_*` & `GRADE_*`)

| Mã Lỗi (`error_code`) | HTTP Status | Thông Điệp Mặc Định (`message`) | Tình huống kích hoạt (Trigger Condition) |
| :--- | :---: | :--- | :--- |
| `ACAD_NOT_ASSIGNED_TEACHER` | `403` | Giáo viên chưa được phân công giảng dạy môn học này tại lớp đã chọn. | Giáo viên vào điểm môn mà mình không phụ trách tại lớp. |
| `ACAD_SCORE_OUT_OF_RANGE` | `400` | Điểm số phải nằm trong khoảng từ 0.0 đến 10.0 với tối đa 1 chữ số thập phân. | Nhập điểm âm, điểm chữ hoặc điểm vượt quá 10 (VD: `10.5`, `-1`). |
| `ACAD_SEMESTER_LOCKED` | `400` | Học kỳ này đã được khóa sổ, không thể điều chỉnh điểm số. | Quản trị viên đã đóng sổ điểm học kỳ tương ứng. |
| `GRADE_RECORD_NOT_FOUND` | `404` | Không tìm thấy bản ghi điểm số của học sinh. | Truy vấn hoặc sửa đổi điểm số không tồn tại. |
| `GRADE_NOT_PUBLISHED` | `400` | Bảng điểm môn học chưa được giáo viên công bố tới phụ huynh. | Phụ huynh tra cứu cột điểm khi giáo viên chưa bấm "Công bố điểm". |
| `GRADE_TYPE_INVALID` | `400` | Cột điểm thành phần không hợp lệ. | Giá trị ngoài `ORAL_TEST`, `QUIZ`, `TEST_15P`, `TEST_1P`, `MID_TERM`, `FINAL`. |

---

### 2.7. Phân hệ 07: Trợ giảng AI Gemini & Mini-game (`QUIZ_*` & `GAME_*`)

| Mã Lỗi (`error_code`) | HTTP Status | Thông Điệp Mặc Định (`message`) | Tình huống kích hoạt (Trigger Condition) |
| :--- | :---: | :--- | :--- |
| `QUIZ_NOT_FOUND` | `404` | Không tìm thấy bộ câu hỏi kiểm tra bài cũ. | `quiz_id` không tồn tại trong collection `/quizzes`. |
| `QUIZ_FILE_TOO_LARGE` | `400` | Tệp giáo án tải lên vượt quá dung lượng cho phép (tối đa 15MB). | Upload file giáo án có kích thước > 15MB. |
| `QUIZ_FILE_UNSUPPORTED` | `400` | Định dạng tệp không được hỗ trợ (chỉ chấp nhận .pdf và .docx). | Upload file sai định dạng (VD: `.xlsx`, `.exe`, `.png`). |
| `QUIZ_AI_GENERATION_FAILED` | `500` | Google Gemini AI không thể trích xuất câu hỏi từ tệp giáo án này. | Lỗi API Google Gemini hoặc nội dung tài liệu bị lỗi mã hóa font text. |
| `QUIZ_DAILY_QUOTA_EXCEEDED` | `429` | Bạn đã sử dụng hết hạn ngạch gọi AI Gemini miễn phí trong ngày. | Giáo viên vượt quá hạn mức tạo trắc nghiệm trong ngày (mặc định: 20 lần/ngày). |
| `QUIZ_INVALID_MODE` | `400` | Chế độ trình chiếu hoặc loại trò chơi không hợp lệ. | Giá trị ngoài `STANDARD_QUIZ`, `GOLDEN_BELL`, `RACING`, `MYSTERY_BOX`. |
| `GAME_SESSION_NOT_FOUND` | `404` | Phiên trò chơi mini-game không tồn tại hoặc đã kết thúc. | Kết nối vào phòng game lớp học không tồn tại. |

---

### 2.8. Phân hệ 08: Sổ liên lạc nhận xét học sinh (`REMARK_*`)

| Mã Lỗi (`error_code`) | HTTP Status | Thông Điệp Mặc Định (`message`) | Tình huống kích hoạt (Trigger Condition) |
| :--- | :---: | :--- | :--- |
| `REMARK_NOT_FOUND` | `404` | Không tìm thấy bản ghi nhận xét của học sinh. | `remark_id` không tồn tại trong collection `/remarks`. |
| `REMARK_CONTENT_EMPTY` | `400` | Nội dung nhận xét không được để trống hoặc chỉ có khoảng trắng. | Gửi nhận xét rỗng hoặc chuỗi toàn ký tự cách sau khi trim. |
| `REMARK_CONTENT_TOO_LONG` | `400` | Nội dung nhận xét không được vượt quá 1000 ký tự. | Gõ lời phê quá dài (> 1000 ký tự). |
| `REMARK_ALREADY_ACKNOWLEDGED`| `400`| Nhận xét này đã được phụ huynh đọc và xác nhận trước đó. | Phụ huynh bấm "Xác nhận đã đọc" nhiều lần cho 1 nhận xét. |

---

### 2.9. Phân hệ 09: Lời nhắc lịch kiểm tra (`EXAM_*`)

| Mã Lỗi (`error_code`) | HTTP Status | Thông Điệp Mặc Định (`message`) | Tình huống kích hoạt (Trigger Condition) |
| :--- | :---: | :--- | :--- |
| `EXAM_REMINDER_NOT_FOUND` | `404` | Không tìm thấy lời nhắc lịch kiểm tra. | `reminder_id` không tồn tại trong collection `/exam_reminders`. |
| `EXAM_DATE_INVALID` | `400` | Ngày kiểm tra không hợp lệ hoặc đã trôi qua trong quá khứ. | Nhập ngày thi nhỏ hơn ngày hiện tại hoặc ngày không tồn tại trên lịch. |
| `EXAM_TYPE_INVALID` | `400` | Loại hình bài kiểm tra không nằm trong danh mục chuẩn. | Giá trị ngoài `TEST_15P`, `TEST_1P`, `MID_TERM`, `FINAL`. |
| `EXAM_MESSAGE_TOO_SHORT` | `400` | Lời dặn dò ôn thi phải có tối thiểu 10 ký tự. | Nội dung dặn dò quá ngắn, không đủ hướng dẫn cho phụ huynh. |

---

### 2.10. Phân hệ 10: Quản lý Học phí & BHYT (`FEE_*`)

| Mã Lỗi (`error_code`) | HTTP Status | Thông Điệp Mặc Định (`message`) | Tình huống kích hoạt (Trigger Condition) |
| :--- | :---: | :--- | :--- |
| `FEE_RECORD_NOT_FOUND` | `404` | Không tìm thấy bản ghi theo dõi học phí hoặc BHYT của học sinh. | `record_id` không tồn tại trong collection `/fees_and_insurance`. |
| `FEE_TERM_LOCKED` | `400` | Đợt thu nộp này đã được kế toán trường khóa sổ, không thể chỉnh sửa. | Kế toán nhà trường đã đóng kỳ thu học phí/BHYT. |
| `FEE_INVALID_FLAG` | `400` | Trạng thái cờ nộp phí không hợp lệ. | Giá trị không phải là kiểu boolean `true` hoặc `false`. |
| `FEE_PAID_DATE_INVALID` | `400` | Ngày nộp tiền không hợp lệ hoặc rơi vào tương lai. | Nhập ngày nộp tiền lớn hơn ngày hiện tại hoặc ngày ảo trên lịch. |

---

### 2.11. Phân hệ 11: Lịch sử thông báo đẩy FCM (`NOTI_*`)

| Mã Lỗi (`error_code`) | HTTP Status | Thông Điệp Mặc Định (`message`) | Tình huống kích hoạt (Trigger Condition) |
| :--- | :---: | :--- | :--- |
| `NOTI_NOT_FOUND` | `404` | Không tìm thấy thông báo này trên hệ thống. | `notification_id` không tồn tại trong collection `/notifications`. |
| `NOTI_DEVICE_TOKEN_INVALID` | `400` | Thiết bị không hợp lệ để nhận thông báo đẩy FCM. | Token thiết bị gửi lên bị lỗi cú pháp hoặc đã bị Firebase thu hồi. |
| `NOTI_DISPATCH_FAILED` | `500` | Lỗi dịch vụ Google Firebase FCM khi gửi thông báo đẩy. | Kết nối Firebase FCM bị gián đoạn hoặc lỗi hạ tầng Google. |
| `NOTI_FORBIDDEN` | `403` | Bạn không có quyền thao tác trên thông báo của tài khoản khác. | Đánh dấu đã đọc thông báo không thuộc quyền sở hữu của mình. |

---

### 2.12. Phân hệ 12: Quản trị hệ thống & Dashboard Web (`ADM_*`)

| Mã Lỗi (`error_code`) | HTTP Status | Thông Điệp Mặc Định (`message`) | Tình huống kích hoạt (Trigger Condition) |
| :--- | :---: | :--- | :--- |
| `ADM_ACCOUNT_ALREADY_BANNED`| `400` | Tài khoản người dùng này đã ở trạng thái bị khóa từ trước. | Khóa một tài khoản đang có `is_active = false`. |
| `ADM_ACCOUNT_ALREADY_ACTIVE`| `400` | Tài khoản người dùng đang hoạt động bình thường, không thể mở khóa lại. | Mở khóa cho tài khoản đang có `is_active = true`. |
| `ADM_CANNOT_BAN_ADMIN` | `403` | Không thể khóa tài khoản có vai trò Quản trị viên cấp cao (ADMIN). | Admin cố tình thao tác khóa một tài khoản Admin khác. |
| `ADM_CANNOT_DEACTIVATE_SELF`| `403` | Quản trị viên không thể tự vô hiệu hóa tài khoản của chính mình. | Admin đang đăng nhập gửi lệnh khóa chính UID của mình. |
| `ADM_INVALID_LIMITS` | `400` | Thông số cấu hình hạn mức tài nguyên không hợp lệ (phải là số nguyên dương). | Nhập hạn ngạch số âm hoặc bằng 0. |

---

### 2.13. Phân hệ Lỗi Hệ thống & Tham số Chung (`COMMON_*` & `SYS_*`)

| Mã Lỗi (`error_code`) | HTTP Status | Thông Điệp Mặc Định (`message`) | Tình huống kích hoạt (Trigger Condition) |
| :--- | :---: | :--- | :--- |
| `COMMON_VALIDATION_ERROR` | `400` | Dữ liệu gửi lên vi phạm quy tắc ràng buộc hoặc sai định dạng. | Thiếu trường bắt buộc, ngày không có thật trên lịch, vượt độ dài chuỗi. |
| `REQ_VALIDATION_ERROR` | `422` | Dữ liệu đầu vào sai quy cách định dạng DTO Validation. | Sai kiểu dữ liệu trường (truyền chữ vào trường số nguyên). |
| `SYS_RATE_LIMIT_EXCEEDED` | `429` | Bạn đã gửi quá nhiều yêu cầu. Vui lòng chờ 1 phút trước khi thử lại. | Client gọi API vượt quá tần suất cho phép (Rate limit). |
| `SYS_INTERNAL_ERROR` | `500` | Lỗi máy chủ nội bộ. Vui lòng liên hệ đội ngũ kỹ thuật để được hỗ trợ. | Lỗi sập server, lỗi cơ sở dữ liệu hoặc bug chưa được bắt try-catch. |

---

## 3. ĐỊNH NGHĨA MÃ NGUỒN TYPESCRIPT CHUẨN (TYPESCRIPT CODE DEFINITIONS)

Lập trình viên Backend NestJS và Frontend Web/Mobile có thể import trực tiếp định nghĩa TypeScript sau:

```typescript
/**
 * Danh mục toàn bộ Mã Lỗi Nghiệp Vụ của hệ thống GiaoVienHay
 * Áp dụng thống nhất cho Backend NestJS, Next.js Admin và React Native App
 */
export enum ErrorCode {
  // 01. AUTH MODULE
  AUTH_INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
  AUTH_TOKEN_EXPIRED = 'AUTH_TOKEN_EXPIRED',
  AUTH_TOKEN_INVALID = 'AUTH_TOKEN_INVALID',
  AUTH_UNAUTHORIZED = 'AUTH_UNAUTHORIZED',
  AUTH_ROLE_FORBIDDEN = 'AUTH_ROLE_FORBIDDEN',
  AUTH_ACCOUNT_LOCKED = 'AUTH_ACCOUNT_LOCKED',
  AUTH_REFRESH_TOKEN_INVALID = 'AUTH_REFRESH_TOKEN_INVALID',
  AUTH_FIREBASE_UID_EXISTS = 'AUTH_FIREBASE_UID_EXISTS',

  // 02. USERS MODULE
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_EMAIL_EXISTS = 'USER_EMAIL_EXISTS',
  USER_PHONE_EXISTS = 'USER_PHONE_EXISTS',
  USER_INACTIVE = 'USER_INACTIVE',
  USER_PROFILE_INCOMPLETE = 'USER_PROFILE_INCOMPLETE',
  USER_FCM_TOKEN_INVALID = 'USER_FCM_TOKEN_INVALID',

  // 03. CLASSES MODULE
  CLASS_NOT_FOUND = 'CLASS_NOT_FOUND',
  CLASS_INVITE_CODE_INVALID = 'CLASS_INVITE_CODE_INVALID',
  CLASS_NOT_HOMEROOM_TEACHER = 'CLASS_NOT_HOMEROOM_TEACHER',
  CLASS_STUDENT_CODE_EXISTS = 'CLASS_STUDENT_CODE_EXISTS',
  CLASS_MAX_STUDENTS_EXCEEDED = 'CLASS_MAX_STUDENTS_EXCEEDED',
  CLASS_HOMEROOM_CONFLICT = 'CLASS_HOMEROOM_CONFLICT',
  CLASS_GRADE_LEVEL_INVALID = 'CLASS_GRADE_LEVEL_INVALID',

  // 04. STUDENTS MODULE
  STUDENT_NOT_FOUND = 'STUDENT_NOT_FOUND',
  PARENT_STUDENT_LINK_NOT_FOUND = 'PARENT_STUDENT_LINK_NOT_FOUND',
  STUDENT_ALREADY_LINKED = 'STUDENT_ALREADY_LINKED',
  STUDENT_DOB_INVALID = 'STUDENT_DOB_INVALID',
  STUDENT_NOT_IN_CLASS = 'STUDENT_NOT_IN_CLASS',

  // 05. ATTENDANCE MODULE
  ATTEND_RECORD_NOT_FOUND = 'ATTEND_RECORD_NOT_FOUND',
  ATTEND_ALREADY_EXISTS = 'ATTEND_ALREADY_EXISTS',
  ATTEND_DATE_IN_FUTURE = 'ATTEND_DATE_IN_FUTURE',
  ATTEND_DATE_INVALID = 'ATTEND_DATE_INVALID',
  ATTEND_STATUS_INVALID = 'ATTEND_STATUS_INVALID',

  // 06. GRADES MODULE
  ACAD_NOT_ASSIGNED_TEACHER = 'ACAD_NOT_ASSIGNED_TEACHER',
  ACAD_SCORE_OUT_OF_RANGE = 'ACAD_SCORE_OUT_OF_RANGE',
  ACAD_SEMESTER_LOCKED = 'ACAD_SEMESTER_LOCKED',
  GRADE_RECORD_NOT_FOUND = 'GRADE_RECORD_NOT_FOUND',
  GRADE_NOT_PUBLISHED = 'GRADE_NOT_PUBLISHED',
  GRADE_TYPE_INVALID = 'GRADE_TYPE_INVALID',

  // 07. QUIZZES & GAME MODULE
  QUIZ_NOT_FOUND = 'QUIZ_NOT_FOUND',
  QUIZ_FILE_TOO_LARGE = 'QUIZ_FILE_TOO_LARGE',
  QUIZ_FILE_UNSUPPORTED = 'QUIZ_FILE_UNSUPPORTED',
  QUIZ_AI_GENERATION_FAILED = 'QUIZ_AI_GENERATION_FAILED',
  QUIZ_DAILY_QUOTA_EXCEEDED = 'QUIZ_DAILY_QUOTA_EXCEEDED',
  QUIZ_INVALID_MODE = 'QUIZ_INVALID_MODE',
  GAME_SESSION_NOT_FOUND = 'GAME_SESSION_NOT_FOUND',

  // 08. REMARKS MODULE
  REMARK_NOT_FOUND = 'REMARK_NOT_FOUND',
  REMARK_CONTENT_EMPTY = 'REMARK_CONTENT_EMPTY',
  REMARK_CONTENT_TOO_LONG = 'REMARK_CONTENT_TOO_LONG',
  REMARK_ALREADY_ACKNOWLEDGED = 'REMARK_ALREADY_ACKNOWLEDGED',

  // 09. EXAM REMINDERS MODULE
  EXAM_REMINDER_NOT_FOUND = 'EXAM_REMINDER_NOT_FOUND',
  EXAM_DATE_INVALID = 'EXAM_DATE_INVALID',
  EXAM_TYPE_INVALID = 'EXAM_TYPE_INVALID',
  EXAM_MESSAGE_TOO_SHORT = 'EXAM_MESSAGE_TOO_SHORT',

  // 10. FEES & INSURANCE MODULE
  FEE_RECORD_NOT_FOUND = 'FEE_RECORD_NOT_FOUND',
  FEE_TERM_LOCKED = 'FEE_TERM_LOCKED',
  FEE_INVALID_FLAG = 'FEE_INVALID_FLAG',
  FEE_PAID_DATE_INVALID = 'FEE_PAID_DATE_INVALID',

  // 11. NOTIFICATIONS MODULE
  NOTI_NOT_FOUND = 'NOTI_NOT_FOUND',
  NOTI_DEVICE_TOKEN_INVALID = 'NOTI_DEVICE_TOKEN_INVALID',
  NOTI_DISPATCH_FAILED = 'NOTI_DISPATCH_FAILED',
  NOTI_FORBIDDEN = 'NOTI_FORBIDDEN',

  // 12. ADMIN MODULE
  ADM_ACCOUNT_ALREADY_BANNED = 'ADM_ACCOUNT_ALREADY_BANNED',
  ADM_ACCOUNT_ALREADY_ACTIVE = 'ADM_ACCOUNT_ALREADY_ACTIVE',
  ADM_CANNOT_BAN_ADMIN = 'ADM_CANNOT_BAN_ADMIN',
  ADM_CANNOT_DEACTIVATE_SELF = 'ADM_CANNOT_DEACTIVATE_SELF',
  ADM_INVALID_LIMITS = 'ADM_INVALID_LIMITS',

  // COMMON & SYSTEM ERRORS
  COMMON_VALIDATION_ERROR = 'COMMON_VALIDATION_ERROR',
  REQ_VALIDATION_ERROR = 'REQ_VALIDATION_ERROR',
  SYS_RATE_LIMIT_EXCEEDED = 'SYS_RATE_LIMIT_EXCEEDED',
  SYS_INTERNAL_ERROR = 'SYS_INTERNAL_ERROR',
}

/**
 * Bản đồ ánh xạ thông điệp tiếng Việt thân thiện mặc định theo Mã Lỗi
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  // 01. AUTH
  [ErrorCode.AUTH_INVALID_CREDENTIALS]: 'Email hoặc mật khẩu không chính xác.',
  [ErrorCode.AUTH_TOKEN_EXPIRED]: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  [ErrorCode.AUTH_TOKEN_INVALID]: 'Token xác thực không hợp lệ hoặc đã bị thu hồi.',
  [ErrorCode.AUTH_UNAUTHORIZED]: 'Yêu cầu truy cập chưa được xác thực danh tính.',
  [ErrorCode.AUTH_ROLE_FORBIDDEN]: 'Bạn không có quyền truy cập vào chức năng này.',
  [ErrorCode.AUTH_ACCOUNT_LOCKED]: 'Tài khoản của bạn đã bị khóa bởi Quản trị viên.',
  [ErrorCode.AUTH_REFRESH_TOKEN_INVALID]: 'Phiên làm mới không hợp lệ hoặc đã hết hạn.',
  [ErrorCode.AUTH_FIREBASE_UID_EXISTS]: 'Định danh Firebase UID này đã tồn tại.',

  // 02. USERS
  [ErrorCode.USER_NOT_FOUND]: 'Không tìm thấy người dùng trong hệ thống.',
  [ErrorCode.USER_EMAIL_EXISTS]: 'Địa chỉ email này đã được sử dụng cho một tài khoản khác.',
  [ErrorCode.USER_PHONE_EXISTS]: 'Số điện thoại này đã được đăng ký cho tài khoản khác.',
  [ErrorCode.USER_INACTIVE]: 'Tài khoản người dùng đang tạm ngưng hoạt động.',
  [ErrorCode.USER_PROFILE_INCOMPLETE]: 'Thông tin hồ sơ chưa đầy đủ thông tin bắt buộc.',
  [ErrorCode.USER_FCM_TOKEN_INVALID]: 'Mã thiết bị nhận thông báo FCM không hợp lệ.',

  // 03. CLASSES
  [ErrorCode.CLASS_NOT_FOUND]: 'Không tìm thấy lớp học trên hệ thống.',
  [ErrorCode.CLASS_INVITE_CODE_INVALID]: 'Mã mời tham gia lớp học không hợp lệ hoặc đã hết hạn.',
  [ErrorCode.CLASS_NOT_HOMEROOM_TEACHER]: 'Chỉ Giáo viên chủ nhiệm mới có quyền thực hiện thao tác này.',
  [ErrorCode.CLASS_STUDENT_CODE_EXISTS]: 'Mã học sinh đã tồn tại trong danh sách của lớp học này.',
  [ErrorCode.CLASS_MAX_STUDENTS_EXCEEDED]: 'Lớp học đã đạt sĩ số tối đa theo quy định hạn mức hệ thống.',
  [ErrorCode.CLASS_HOMEROOM_CONFLICT]: 'Giáo viên này đã được phân công làm chủ nhiệm cho một lớp học khác.',
  [ErrorCode.CLASS_GRADE_LEVEL_INVALID]: 'Khối lớp không hợp lệ, hệ thống chỉ hỗ trợ từ Khối 1 đến Khối 9.',

  // 04. STUDENTS
  [ErrorCode.STUDENT_NOT_FOUND]: 'Không tìm thấy hồ sơ học sinh trên hệ thống.',
  [ErrorCode.PARENT_STUDENT_LINK_NOT_FOUND]: 'Bạn không có quyền truy cập hồ sơ của học sinh này.',
  [ErrorCode.STUDENT_ALREADY_LINKED]: 'Học sinh này đã được liên kết với tài khoản phụ huynh này.',
  [ErrorCode.STUDENT_DOB_INVALID]: 'Ngày sinh học sinh không hợp lệ hoặc không tồn tại trong lịch thực tế.',
  [ErrorCode.STUDENT_NOT_IN_CLASS]: 'Học sinh không thuộc danh sách biên chế của lớp học này.',

  // 05. ATTENDANCE
  [ErrorCode.ATTEND_RECORD_NOT_FOUND]: 'Không tìm thấy bản ghi điểm danh yêu cầu.',
  [ErrorCode.ATTEND_ALREADY_EXISTS]: 'Tiết học hoặc buổi học này đã được điểm danh trước đó.',
  [ErrorCode.ATTEND_DATE_IN_FUTURE]: 'Không thể thực hiện điểm danh cho ngày trong tương lai.',
  [ErrorCode.ATTEND_DATE_INVALID]: 'Ngày điểm danh không tồn tại trong lịch thực tế.',
  [ErrorCode.ATTEND_STATUS_INVALID]: 'Trạng thái điểm danh không hợp lệ.',

  // 06. GRADES
  [ErrorCode.ACAD_NOT_ASSIGNED_TEACHER]: 'Giáo viên chưa được phân công giảng dạy môn học này tại lớp đã chọn.',
  [ErrorCode.ACAD_SCORE_OUT_OF_RANGE]: 'Điểm số phải nằm trong khoảng từ 0.0 đến 10.0 với tối đa 1 chữ số thập phân.',
  [ErrorCode.ACAD_SEMESTER_LOCKED]: 'Học kỳ này đã được khóa sổ, không thể điều chỉnh điểm số.',
  [ErrorCode.GRADE_RECORD_NOT_FOUND]: 'Không tìm thấy bản ghi điểm số của học sinh.',
  [ErrorCode.GRADE_NOT_PUBLISHED]: 'Bảng điểm môn học chưa được giáo viên công bố tới phụ huynh.',
  [ErrorCode.GRADE_TYPE_INVALID]: 'Cột điểm thành phần không hợp lệ.',

  // 07. QUIZZES
  [ErrorCode.QUIZ_NOT_FOUND]: 'Không tìm thấy bộ câu hỏi kiểm tra bài cũ.',
  [ErrorCode.QUIZ_FILE_TOO_LARGE]: 'Tệp giáo án tải lên vượt quá dung lượng cho phép (tối đa 15MB).',
  [ErrorCode.QUIZ_FILE_UNSUPPORTED]: 'Định dạng tệp không được hỗ trợ (chỉ chấp nhận .pdf và .docx).',
  [ErrorCode.QUIZ_AI_GENERATION_FAILED]: 'Google Gemini AI không thể trích xuất câu hỏi từ tệp giáo án này.',
  [ErrorCode.QUIZ_DAILY_QUOTA_EXCEEDED]: 'Bạn đã sử dụng hết hạn ngạch gọi AI Gemini miễn phí trong ngày.',
  [ErrorCode.QUIZ_INVALID_MODE]: 'Chế độ trình chiếu hoặc loại trò chơi không hợp lệ.',
  [ErrorCode.GAME_SESSION_NOT_FOUND]: 'Phiên trò chơi mini-game không tồn tại hoặc đã kết thúc.',

  // 08. REMARKS
  [ErrorCode.REMARK_NOT_FOUND]: 'Không tìm thấy bản ghi nhận xét của học sinh.',
  [ErrorCode.REMARK_CONTENT_EMPTY]: 'Nội dung nhận xét không được để trống hoặc chỉ có khoảng trắng.',
  [ErrorCode.REMARK_CONTENT_TOO_LONG]: 'Nội dung nhận xét không được vượt quá 1000 ký tự.',
  [ErrorCode.REMARK_ALREADY_ACKNOWLEDGED]: 'Nhận xét này đã được phụ huynh đọc và xác nhận trước đó.',

  // 09. EXAM REMINDERS
  [ErrorCode.EXAM_REMINDER_NOT_FOUND]: 'Không tìm thấy lời nhắc lịch kiểm tra.',
  [ErrorCode.EXAM_DATE_INVALID]: 'Ngày kiểm tra không hợp lệ hoặc đã trôi qua trong quá khứ.',
  [ErrorCode.EXAM_TYPE_INVALID]: 'Loại hình bài kiểm tra không nằm trong danh mục chuẩn.',
  [ErrorCode.EXAM_MESSAGE_TOO_SHORT]: 'Lời dặn dò ôn thi phải có tối thiểu 10 ký tự.',

  // 10. FEES & INSURANCE
  [ErrorCode.FEE_RECORD_NOT_FOUND]: 'Không tìm thấy bản ghi theo dõi học phí hoặc BHYT của học sinh.',
  [ErrorCode.FEE_TERM_LOCKED]: 'Đợt thu nộp này đã được kế toán trường khóa sổ, không thể chỉnh sửa.',
  [ErrorCode.FEE_INVALID_FLAG]: 'Trạng thái cờ nộp phí không hợp lệ.',
  [ErrorCode.FEE_PAID_DATE_INVALID]: 'Ngày nộp tiền không hợp lệ hoặc rơi vào tương lai.',

  // 11. NOTIFICATIONS
  [ErrorCode.NOTI_NOT_FOUND]: 'Không tìm thấy thông báo này trên hệ thống.',
  [ErrorCode.NOTI_DEVICE_TOKEN_INVALID]: 'Thiết bị không hợp lệ để nhận thông báo đẩy FCM.',
  [ErrorCode.NOTI_DISPATCH_FAILED]: 'Lỗi dịch vụ Google Firebase FCM khi gửi thông báo đẩy.',
  [ErrorCode.NOTI_FORBIDDEN]: 'Bạn không có quyền thao tác trên thông báo của tài khoản khác.',

  // 12. ADMIN
  [ErrorCode.ADM_ACCOUNT_ALREADY_BANNED]: 'Tài khoản người dùng này đã ở trạng thái bị khóa từ trước.',
  [ErrorCode.ADM_ACCOUNT_ALREADY_ACTIVE]: 'Tài khoản người dùng đang hoạt động bình thường, không thể mở khóa lại.',
  [ErrorCode.ADM_CANNOT_BAN_ADMIN]: 'Không thể khóa tài khoản có vai trò Quản trị viên cấp cao (ADMIN).',
  [ErrorCode.ADM_CANNOT_DEACTIVATE_SELF]: 'Quản trị viên không thể tự vô hiệu hóa tài khoản của chính mình.',
  [ErrorCode.ADM_INVALID_LIMITS]: 'Thông số cấu hình hạn mức tài nguyên không hợp lệ (phải là số nguyên dương).',

  // COMMON & SYSTEM
  [ErrorCode.COMMON_VALIDATION_ERROR]: 'Dữ liệu gửi lên vi phạm quy tắc ràng buộc hoặc sai định dạng.',
  [ErrorCode.REQ_VALIDATION_ERROR]: 'Dữ liệu đầu vào sai quy cách định dạng DTO Validation.',
  [ErrorCode.SYS_RATE_LIMIT_EXCEEDED]: 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng chờ 1 phút trước khi thử lại.',
  [ErrorCode.SYS_INTERNAL_ERROR]: 'Lỗi máy chủ nội bộ. Vui lòng liên hệ đội ngũ kỹ thuật.',
};
```
