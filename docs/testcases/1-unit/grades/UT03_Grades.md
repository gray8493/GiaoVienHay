# Kịch Bản Kiểm Thử Đơn Vị (Unit Test Specification) - Phân Hệ Sổ Điểm & Bảng Xếp Hạng
# Module: Grades (`/api/v1/grades`)
# Cấp Độ: Unit Test (UT) - Framework: Jest / NestJS Testing
# Quy Tắc Tuân Thủ: rules/testcase-rules.md

---

## 1. Thông Tin Chung

- **Phân hệ:** `03` - Gradebook & Assessment Module (Theo rules/testcase-rules.md)
- **Module API:** Grades (`GradesService`, `GradesController`)
- **Tập tin kiểm thử:** `src/features/academic/grades.service.spec.ts`
- **Người thực hiện:** QA / Developer
- **Môi trường:** Isolated Unit Testing (Mock Firestore Batch Writer, Mock Notification Service)

---

## 2. Bảng Danh Sách Unit Test Cases

| Mã Testcase | Tên Kịch Bản | Mục Tiêu Kiểm Thử | Dữ Liệu Đầu Vào (Mock Input) | Kết Quả Mong Đợi (Assertion) | Trạng Thái |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **UT03_Grades_TC01** | `batchSaveScores()` nhập điểm thành công | Lưu hàng loạt điểm thành phần (thang điểm 10) vào collection `/scores` | Body: `class_id: "cls_1a_2026"`, `subject_code: "MATH"`, `score_type: "ORAL_TEST"`, `scores: [{ student_id: "stu_01", score_value: 9.5 }]` | Trả về HTTP 200, `updated_count: 1`, Firestore batch write được thực thi thành công | **PASS** |
| **UT03_Grades_TC02** | `batchSaveScores()` từ chối điểm vượt thang 10 | Kiểm tra validator chặn điểm âm hoặc lớn hơn 10.0 | Body: `scores: [{ student_id: "stu_01", score_value: 12.0 }]` | Ném `BadRequestException` (400), tin nhắn *"Điểm số phải trong khoảng từ 0.0 đến 10.0"* | **PASS** |
| **UT03_Grades_TC03** | `publishGrades()` công bố điểm & gửi FCM | Cập nhật `is_published = true` và kích hoạt FCM tới phụ huynh | Body: `class_id: "cls_1a_2026"`, `subject_code: "MATH"`, `score_type: "TEST_15P"`, `semester: 1` | Trả về HTTP 200, gọi `NotificationService.sendGradeAlert()` đúng 1 lần | **PASS** |
| **UT03_Grades_TC04** | `getLeaderboard()` lấy Top vinh danh | Truy vấn Top 5 học sinh điểm cao nhất theo môn và kỳ | Params: `classId = "cls_1a_2026"`, `subject_code = "MATH"`, `semester = 1`, `limit = 5` | Trả về HTTP 200, danh sách `top_students` sắp xếp giảm dần điểm số, Top 1 có badge `"GOLD"` | **PASS** |
| **UT03_Grades_TC05** | `getClassScores()` xem sổ điểm cả lớp | Giáo viên xem bảng điểm môn của cả lớp | Params: `classId = "cls_1a_2026"`, `subject_code = "MATH"`, `semester = 1` | Trả về HTTP 200, danh sách học sinh và đầy đủ các cột điểm thành phần | **PASS** |
