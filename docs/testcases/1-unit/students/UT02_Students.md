# Kịch Bản Kiểm Thử Đơn Vị (Unit Test Specification) - Phân Hệ Học Sinh & Cổng Phụ Huynh
# Module: Students (`/api/v1/students`)
# Cấp Độ: Unit Test (UT) - Framework: Jest / NestJS Testing
# Quy Tắc Tuân Thủ: rules/testcase-rules.md

---

## 1. Thông Tin Chung

- **Phân hệ:** `02` - School & Academic Structure Module (Theo rules/testcase-rules.md)
- **Module API:** Students (`StudentsService`, `StudentsController`)
- **Tập tin kiểm thử:** `src/features/academic/students.service.spec.ts`
- **Người thực hiện:** QA / Developer
- **Môi trường:** Isolated Unit Testing (Mock Firestore Repository, Mock RBAC Guard)

---

## 2. Bảng Danh Sách Unit Test Cases

| Mã Testcase | Tên Kịch Bản | Mục Tiêu Kiểm Thử | Dữ Liệu Đầu Vào (Mock Input) | Kết Quả Mong Đợi (Assertion) | Trạng Thái |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **UT02_Students_TC01** | `getStudentProfile()` thành công | Phụ huynh xem thông tin lý lịch con cái thuộc quyền quản lý | Headers: `Bearer parent_token`<br>Param: `id = stu_01` (học sinh có `parent_uids` chứa parentUid) | Trả về HTTP 200, đúng `full_name: "Trần Bảo Nam"`, `class_name: "1A"`, `dob` | **PASS** |
| **UT02_Students_TC02** | `getStudentProfile()` chặn phụ huynh lạ | Chặn phụ huynh tra cứu thông tin học sinh không phải con mình | Headers: `Bearer parent_other_token`<br>Param: `id = stu_01` (`parent_uids` không chứa UID người gọi) | Ném `ForbiddenException` (403), mã lỗi `FORBIDDEN_STUDENT_ACCESS` | **PASS** |
| **UT02_Students_TC03** | `getStudentAcademic()` tra cứu bảng điểm | Tra cứu bảng điểm đa môn học kèm các cột điểm thành phần của con | Param: `id = stu_01`, `semester = 1` | Trả về HTTP 200, danh sách `subjects` gồm `MATH`, `LIT` cùng các đầu điểm `ORAL_TEST`, `TEST_15P`, `MID_TERM` | **PASS** |
| **UT02_Students_TC04** | `getStudentRemarks()` xem nhận xét | Phụ huynh xem sổ liên lạc nhận xét của con theo kỳ | Param: `id = stu_01` | Trả về HTTP 200, danh sách `remarks` kèm trạng thái `parent_acknowledged` | **PASS** |
| **UT02_Students_TC05** | `getStudentFees()` xem học phí & BHYT | Tra cứu tình trạng nộp học phí và BHYT kèm ngày nộp thực tế | Param: `id = stu_01` | Trả về HTTP 200, thông tin `is_paid_insurance`, `is_paid_tuition`, `payment_date` | **PASS** |
