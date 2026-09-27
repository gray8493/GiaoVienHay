# QUY TẮC ĐẶT MÃ & SOẠN THẢO KỊCH BẢN KIỂM THỬ (TESTCASE SPECIFICATION RULES)
# DỰ ÁN GIAOVIENHAY

Tài liệu này quy định chuẩn bắt buộc khi đặt mã định danh, phân loại phân hệ và định dạng trình bày chi tiết kịch bản kiểm thử (Unit Test / Integration Test) cho toàn bộ 12 phân hệ của dự án **GiaoVienHay**.

---

## 1. CẤU TRÚC ĐẶT MÃ ĐỊNH DANH TESTCASE (TESTCASE ID SYNTAX)

Mọi testcase trong dự án bắt buộc phải tuân theo cú pháp:

```text
<Cấp độ Test><Mã phân hệ 2 số>_<Tên Module viết hoa>_TC<Số thứ tự 2 số>
```

### 1.1. Cấp độ kiểm thử (`<Cấp độ Test>`):
- **`UT`**: Unit Test (Kiểm thử đơn vị Controller, Service, DTO Validator, Guard).
- **`IT`**: Integration Test (Kiểm thử tích hợp API endpoint với Firestore Emulator, Firebase Admin SDK).
- **`ST`**: System Test (Kiểm thử luồng hệ thống xuyên suốt Web Admin, Mobile App và Backend).
- **`AT`**: Acceptance Test (Kiểm thử chấp nhận người dùng UAT).

### 1.2. Danh mục 12 phân hệ chuẩn của dự án GiaoVienHay (Theo luồng nghiệp vụ & CSDL):
- **`01`**: `Auth` - Phân hệ Xác thực & Quản lý phiên làm việc (`/api/v1/auth`)
- **`02`**: `Users` - Phân hệ Người dùng & Hồ sơ cá nhân (`/api/v1/users`)
- **`03`**: `Classes` - Phân hệ Lớp học & Phân công giáo viên bộ môn (`/api/v1/classes`)
- **`04`**: `Students` - Phân hệ Hồ sơ học sinh & Cổng tra cứu phụ huynh (`/api/v1/students`)
- **`05`**: `Attendance` - Phân hệ Điểm danh & Theo dõi chuyên cần (`/api/v1/attendance`)
- **`06`**: `Grades` - Phân hệ Sổ điểm điện tử & Bảng xếp hạng vinh danh (`/api/v1/grades`)
- **`07`**: `Quizzes` - Phân hệ Trợ giảng AI & Game hóa kiểm tra bài cũ (`/api/v1/quizzes`)
- **`08`**: `Remarks` - Phân hệ Sổ liên lạc nhận xét học sinh (`/api/v1/remarks`)
- **`09`**: `ExamReminders` - Phân hệ Lời nhắc lịch kiểm tra (`/api/v1/exam-reminders`)
- **`10`**: `FeesInsurance` - Phân hệ Quản lý Học phí & BHYT (`/api/v1/fees-insurance`)
- **`11`**: `Notifications` - Phân hệ Lịch sử thông báo đẩy FCM (`/api/v1/notifications`)
- **`12`**: `Admin` - Phân hệ Quản trị hệ thống & Dashboard Web (`/api/v1/admin`)

### 1.3. Ví dụ mã testcase chuẩn:
- `UT01_Auth_TC01`: Unit test xác thực đăng nhập cấp token.
- `UT03_Classes_TC01`: Unit test GVCN tạo lớp học tổng và sinh mã mời.
- `UT05_Attendance_TC01`: Unit test điểm danh đầu giờ thành công.
- `UT06_Grades_TC01`: Unit test nhập bảng điểm thành phần thành công.
- `UT07_Quizzes_TC01`: Unit test tải giáo án gọi AI Gemini sinh câu hỏi.

---

## 2. QUY CHUẨN FORMAT BẮT BUỘC CHO MỖI TÀI LIỆU KỊCH BẢN KIỂM THỬ

Mỗi tập tin kịch bản kiểm thử của từng phân hệ bắt buộc phải tuân theo cấu trúc chuẩn sau:

```markdown
# TÀI LIỆU KỊCH BẢN KIỂM THỬ ĐƠN VỊ - [TÊN PHÂN HỆ TIẾNG VIỆT]
# MÃ PHÂN HỆ: [MÃ 2 SỐ] - [TÊN MODULE TIẾNG ANH]
# CẤP ĐỘ KIỂM THỬ: KIỂM THỬ ĐƠN VỊ (UNIT TEST)

---

## 1. THÔNG TIN CHUNG

- **PHÂN HỆ HỆ THỐNG:** `[Mã 2 số]` - [Tên phân hệ đầy đủ]
- **MÔ TẢ MODULE API:** [Tên Service, Controller liên quan]
- **TẬP TIN KIỂM THỬ:** [Đường dẫn file mã nguồn test, ví dụ: test/modules/grades/grades.service.spec.ts]
- **MÔI TRƯỜNG KIỂM THỬ:** Testing / Local Firestore Emulator

---

## 2. CHI TIẾT CÁC KỊCH BẢN KIỂM THỬ ĐƠN VỊ

---

### [MÃ TESTCASE] : [TÊN KỊCH BẢN IN HOA NGẮN GỌN RÕ RÀNG]

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - [Liệt kê các trạng thái CSDL, tài khoản đăng nhập, quyền hạn cần chuẩn bị sẵn]

- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_vai_tro>`
  - **Dữ liệu thân (Body JSON):** hoặc **Tham số truy vấn (Query Params JSON):**
  ```json
  // Payload JSON gửi lên
  ```

- **CÁC BƯỚC THỰC HIỆN:**
  1. [Bước 1: Thiết lập Header, URL API]
  2. [Bước 2: Chọn phương thức HTTP (GET, POST, PATCH, DELETE)]
  3. [Bước 3: Nhập dữ liệu Body / Query]
  4. [Bước 4: Bấm nút Gửi (Send) / Kích hoạt hàm]

- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái HTTP chuẩn.
  - Ràng buộc tác động dữ liệu (Firestore ghi mới/cập nhật/không ghi đè).
  - Cấu trúc Envelope JSON trả về chính xác (gồm `success`, `status_code`, `data` hoặc `error_code`, `message`, `details`, `timestamp`).

- **TRẠNG THÁI KIỂM THỬ:** [Chưa thực hiện / Đạt (PASS) / Thất bại (FAIL)]
```

---

## 3. TÀI LIỆU KỊCH BẢN MẪU CHUẨN CỦA DỰ ÁN (MODULE 06 - GRADES)

Dưới đây là kịch bản kiểm thử mẫu hoàn chỉnh của Phân hệ 06 làm hình mẫu tham chiếu:

# TÀI LIỆU KỊCH BẢN KIỂM THỬ ĐƠN VỊ - PHÂN HỆ SỔ ĐIỂM & BẢNG XẾP HẠNG
# MÃ PHÂN HỆ: 06 - GRADEBOOK & ASSESSMENT MODULE
# CẤP ĐỘ KIỂM THỬ: KIỂM THỬ ĐƠN VỊ (UNIT TEST)

---

## 1. THÔNG TIN CHUNG

- **PHÂN HỆ HỆ THỐNG:** `06` - Phân hệ Quản lý Sổ điểm & Đánh giá học sinh
- **MÔ TẢ MODULE API:** Sổ điểm điện tử môn học (`GradesService`, `GradesController`)
- **TẬP TIN KIỂM THỬ:** `test/modules/grades/grades.service.spec.ts`
- **MÔI TRƯỜNG KIỂM THỬ:** Testing

---

## 2. CHI TIẾT CÁC KỊCH BẢN KIỂM THỬ ĐƠN VỊ

---

### UT06_Grades_TC01 : NHẬP BẢNG ĐIỂM THÀNH PHẦN CHO HỌC SINH THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên đã đăng nhập thành công vào hệ thống với vai trò Giáo viên Bộ môn hoặc Giáo viên Chủ nhiệm.
  - Lớp học mã `cls_1a_2026` và học sinh mã `stu_01` đã tồn tại sẵn trong cơ sở dữ liệu.
  - Giáo viên có quyết định phân công giảng dạy môn Toán tại lớp học này.

- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "class_id": "cls_1a_2026",
    "subject_code": "MATH",
    "semester": 1,
    "score_type": "ORAL_TEST",
    "scores": [
      {
        "student_id": "stu_01",
        "score_value": 9.5,
        "teacher_comment": "Thuộc bài tốt, tính nhẩm nhanh"
      }
    ]
  }
  ```

- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của giáo viên vào mục **Headers** (`Authorization: Bearer <token_giao_vien>`).
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/grades/batch`.
  3. Thêm dữ liệu vào phần **Body** định dạng `raw (application/json)` theo cấu trúc JSON ở trên.
  4. Bấm nút **Gửi (Send)** để thực thi request.

- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Cập nhật thành công 1 bản ghi điểm vào cơ sở dữ liệu Firestore.
  - Dữ liệu trả về đúng định dạng JSON chuẩn như sau:

  ```json
  {
    "success": true,
    "status_code": 200,
    "message": "Lưu bảng điểm thành phần thành công",
    "data": {
      "class_id": "cls_1a_2026",
      "subject_code": "MATH",
      "score_type": "ORAL_TEST",
      "updated_count": 1
    }
  }
  ```

- **TRẠNG THÁI KIỂM THỬ:**
