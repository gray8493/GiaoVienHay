# Mẫu Kịch Bản Kiểm Thử Tích Hợp (Integration Test Template)
# Cấp độ: Integration Test (IT) - Framework: Supertest / Testcontainers

---

## 1. Thông Tin Chung

- **Module:** Academic & Event Messaging (`AcademicController`, `PostgreSQL`, `RabbitMQ`)
- **Tập tin kiểm thử:** `test/academic-integration.e2e-spec.ts`
- **Môi trường:** Testcontainers (PostgreSQL container & RabbitMQ container thật)

---

## 2. Bảng Danh Sách Integration Test Cases

| Mã Testcase | Tên Kịch Bản | Mục Tiêu Kiểm Thử | Các Bước Thực Hiện (Steps) | Kết Quả Mong Đợi (Assertion) | Trạng Thái |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **IT03_Grade_TC01** | Công bố điểm và bắn sự kiện RabbitMQ | Đảm bảo điểm được ghi vào PostgreSQL và `GradePublishedEvent` được đẩy vào RabbitMQ exchange | 1. Tạo giáo viên và lớp học test trong DB.<br>2. Gửi `POST /api/v1/grades/publish` với Bearer JWT.<br>3. Kiểm tra DB và hàng đợi RabbitMQ. | Status code 200.<br>Bản ghi trong bảng `grades` có giá trị mới.<br>RabbitMQ queue nhận được 1 message chứa đúng `classId` và `subjectId`. | **PASS** |
| **IT04_Attend_TC01** | Điểm danh học sinh vắng kích hoạt RabbitMQ | Đảm bảo khi có học sinh vắng, event `StudentAbsentEvent` được phát ra queue | 1. Gửi `POST /api/v1/attendance/submit` với 1 học sinh status `ABSENT_UNEXCUSED`.<br>2. Kiểm tra queue `notification.attendance`. | Status code 201.<br>Bản ghi `attendance_records` được lưu.<br>Queue nhận được event chứa `studentId` vắng. | **PASS** |
