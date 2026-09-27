# Kịch Bản Kiểm Thử Đơn Vị (Unit Test Specification) - Phân Hệ Người Dùng & Hồ Sơ
# Module: Users (`/api/v1/users`)
# Cấp Độ: Unit Test (UT) - Framework: Jest / NestJS Testing
# Quy Tắc Tuân Thủ: rules/testcase-rules.md

---

## 1. Thông Tin Chung

- **Phân hệ:** `01` - Auth & User Profile Module (Theo rules/testcase-rules.md)
- **Module API:** Users (`UsersService`, `UsersController`)
- **Tập tin kiểm thử:** `src/features/auth/users.service.spec.ts`
- **Người thực hiện:** QA / Developer
- **Môi trường:** Isolated Unit Testing (Mock Firestore Repository, Mock Firebase Auth)

---

## 2. Bảng Danh Sách Unit Test Cases

| Mã Testcase | Tên Kịch Bản | Mục Tiêu Kiểm Thử | Dữ Liệu Đầu Vào (Mock Input) | Kết Quả Mong Đợi (Assertion) | Trạng Thái |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **UT01_Users_TC01** | `getProfile()` thành công | Kiểm tra lấy thông tin profile và danh sách môn dạy của user | Headers: `Bearer valid_teacher_token`<br>UID: `usr_teacher_lan` | Trả về HTTP 200, đúng `uid`, `full_name: "Nguyễn Thị Lan"`, `role: "TEACHER_HOMEROOM"`, mảng `teaching_subjects: ["MATH", "LIT"]` | **PASS** |
| **UT01_Users_TC02** | `updateProfile()` cập nhật môn dạy hợp lệ | Kiểm tra cập nhật họ tên, trường và mảng `teaching_subjects` | Body: `{ "school_name": "Trường Tiểu Học Chu Văn An", "teaching_subjects": ["MATH", "LIT", "ETHICS"] }` | Trả về HTTP 200, Firestore `updateDoc` được gọi đúng 1 lần với data mới | **PASS** |
| **UT01_Users_TC03** | `updateProfile()` từ chối môn học sai chuẩn | Kiểm tra ném lỗi khi giáo viên chọn mã môn không nằm trong danh mục GDPT | Body: `{ "teaching_subjects": ["INVALID_CODE_XYZ"] }` | Ném `BadRequestException` (400), mã lỗi `INVALID_SUBJECT_CODE` | **PASS** |
| **UT01_Users_TC04** | `registerDeviceToken()` thành công | Kiểm tra lưu FCM token thiết bị vào profile user để nhận thông báo | Body: `{ "fcm_device_token": "fcm_tok_abc123xyz", "device_type": "ANDROID" }` | Trả về HTTP 200, `fcm_tokens` mảng của user trong DB được bổ sung token mới | **PASS** |
| **UT01_Users_TC05** | `registerDeviceToken()` từ chối token rỗng | Kiểm tra validation ném lỗi khi client gửi token rỗng | Body: `{ "fcm_device_token": "" }` | Ném `BadRequestException` (400), tin nhắn *"fcm_device_token không được để trống"* | **PASS** |
