# Mẫu Kịch Bản Kiểm Thử Tích Hợp (Integration Test Template)
# Cấp độ: Integration Test (IT) - Framework: Supertest / Testcontainers

---

## 1. Thông Tin Chung

- **Module:** Academic & Notification Messaging (`AcademicController`, `Cloud Firestore`, `Firebase FCM`)
- **Tập tin kiểm thử:** `test/academic-integration.e2e-spec.ts`
- **Môi trường:** Firebase Local Emulator Suite (Firestore Emulator & Auth Emulator)

---

## 2. Bảng Danh Sách Integration Test Cases

| Mã Testcase | Tên Kịch Bản | Mục Tiêu Kiểm Thử | Các Bước Thực Hiện (Steps) | Kết Quả Mong Đợi (Assertion) | Trạng Thái |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **IT03_Grade_TC01** | Công bố điểm và kích hoạt FCM | Đảm bảo điểm được ghi vào Firestore collection `/scores` và kích hoạt FCM notification | 1. Tạo giáo viên và lớp học test trong Firestore Emulator.<br>2. Gửi `POST /api/v1/grades/publish` với Firebase ID Token.<br>3. Kiểm tra Firestore document và mock FCM call. | Status code 200.<br>Document trong `/scores` có cờ `is_published: true`.<br>FCM service được gọi với đúng payload phụ huynh. | **PASS** |
| **IT04_Attend_TC01** | Điểm danh học sinh vắng kích hoạt FCM | Đảm bảo khi có học sinh vắng, thông báo vắng học được phát tới FCM | 1. Gửi `POST /api/v1/attendance/submit` với 1 học sinh status `ABSENT_UNEXCUSED`.<br>2. Kiểm tra collection `/attendances` và mock FCM. | Status code 201.<br>Bản ghi trong `/attendances` được lưu.<br>FCM nhận được payload cảnh báo vắng chứa `studentId`. | **PASS** |
