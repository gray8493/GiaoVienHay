# Kịch Bản Kiểm Thử Đơn Vị (Unit Test Specification) - Phân Hệ Nhận Xét Học Sinh
# Module: Remarks (`/api/v1/remarks`)
# Cấp Độ: Unit Test (UT) - Framework: Jest / NestJS Testing
# Quy Tắc Tuân Thủ: rules/testcase-rules.md

---

## 1. Thông Tin Chung

- **Phân hệ:** `03` - Gradebook & Assessment Module (Theo rules/testcase-rules.md)
- **Module API:** Remarks (`RemarksService`, `RemarksController`)
- **Tập tin kiểm thử:** `src/features/academic/remarks.service.spec.ts`
- **Người thực hiện:** QA / Developer
- **Môi trường:** Isolated Unit Testing (Mock Firestore Repository, Mock FCM Service)

---

## 2. Bảng Danh Sách Unit Test Cases

| Mã Testcase | Tên Kịch Bản | Mục Tiêu Kiểm Thử | Dữ Liệu Đầu Vào (Mock Input) | Kết Quả Mong Đợi (Assertion) | Trạng Thái |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **UT03_Remarks_TC01** | `createRemark()` gửi nhận xét ngắn | Giáo viên gửi nhận xét thuần text ngắn gọn và bắn FCM tức thì | Body: `{ "student_id": "stu_01", "class_id": "cls_1a_2026", "subject_code": "MATH", "content": "Em tiếp thu bài rất nhanh." }` | Trả về HTTP 201, lưu thành công vào `/remarks`, kích hoạt FCM tới điện thoại phụ huynh | **PASS** |
| **UT03_Remarks_TC02** | `createRemark()` chặn nội dung quá dài | Chặn giáo viên gửi nhận xét vượt quá giới hạn 500 ký tự | Body: `{ "content": "chuỗi văn bản dài > 500 ký tự..." }` | Ném `BadRequestException` (400), mã lỗi `REMARK_TEXT_TOO_LONG` | **PASS** |
| **UT03_Remarks_TC03** | `acknowledgeRemark()` phụ huynh xác nhận | Phụ huynh bấm nút "Xác nhận đã đọc" lời nhận xét trên Mobile App | Param: `id = rmk_9912`<br>Headers: `Bearer parent_token` | Trả về HTTP 200, cập nhật `is_acknowledged = true`, `acknowledged_at = now()` | **PASS** |
| **UT03_Remarks_TC04** | `getClassRemarks()` xem lịch sử nhận xét | Giáo viên xem danh sách nhận xét đã gửi trong lớp học | Param: `classId = cls_1a_2026` | Trả về HTTP 200, danh sách các nhận xét kèm trạng thái đã đọc | **PASS** |
