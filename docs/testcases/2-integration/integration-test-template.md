# TÀI LIỆU MẪU KỊCH BẢN KIỂM THỬ TÍCH HỢP (INTEGRATION TEST TEMPLATE)

# MÃ PHÂN HỆ: [MÃ PHÂN HỆ] - [TÊN PHÂN HỆ TIẾNG ANH] MODULE

# CẤP ĐỘ KIỂM THỬ: KIỂM THỬ TÍCH HỢP (INTEGRATION TEST - IT)

---

## 1. THÔNG TIN CHUNG

- **PHÂN HỆ HỆ THỐNG:** `[Mã số]` - [Tên phân hệ hệ thống] (`/api/v1/[module-endpoint]`)
- **CÁC DỊCH VỤ / MODULE TÍCH HỢP LIÊN QUAN:**
  - **Module khởi phát:** `[Tên Controller/Service gửi yêu cầu]` (Ví dụ: `AttendanceService`, `QuizzesService`)
  - **Dịch vụ phụ thuộc / Nhận sự kiện:** `[Tên Service nhận]` (Ví dụ: `Firestore Database`, `Firebase Cloud Messaging (FCM)`, `GradesService`, `Google Gemini AI API`)
- **MÔ TẢ NGHIỆP VỤ TÍCH HỢP:** [Mô tả ngắn gọn luồng kết nối dữ liệu giữa các module hoặc giữa API với dịch vụ bên thứ ba].
- **NGƯỜI THỰC HIỆN / VIẾT TESTCASE:** [Tên người thực hiện]
- **TẬP TIN ĐẶC TẢ API LIÊN QUAN:** [Đường dẫn link tài liệu đặc tả OpenAPI hoặc README của module]
- **MÔI TRƯỜNG KIỂM THỬ:** Firebase Local Emulator Suite (Firestore & Auth Emulator) / Postman / Supertest NestJS Testing

---

## 2. BẢNG MA TRẬN KỊCH BẢN KIỂM THỬ TÍCH HỢP (INTEGRATION TEST SUITE)

| Mã Testcase | Tên Kịch Bản Tích Hợp | Các Thành Phần Tương Tác | Dữ Liệu Đầu Vào Chính | Kết Quả Tích Hợp Kỳ Vọng | Trạng Thái |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **IT01_[Module]_TC01** | [Tên kịch bản tích hợp thành công luồng A -> B] | Service A $\leftrightarrow$ Service B $\leftrightarrow$ Database | [Mô tả ngắn payload hoặc event] | [Mã HTTP + Dữ liệu DB đồng bộ + Trigger sự kiện thành công] | **PASS** |
| **IT01_[Module]_TC02** | [Tên kịch bản xử lý khi dịch vụ B bị lỗi/timeout] | Service A $\leftrightarrow$ External Service Mock | [Payload yêu cầu] | [Xử lý lỗi graceful, rollback giao dịch hoặc retry an toàn] | **PASS** |

---

## 3. CHI TIẾT CÁC KỊCH BẢN KIỂM THỬ TÍCH HỢP

---

### PHẦN I: CÁC KỊCH BẢN TÍCH HỢP THÀNH CÔNG (POSITIVE / INTEGRATION FLOW CASES)

---

#### 1. Nhóm Kịch Bản Tích Hợp Đa Dịch Vụ Cơ Bản (Basic Inter-Service Integration)

---

##### IT05_Attendance_TC01 : ĐIỂM DANH HỌC SINH VẮNG TỰ ĐỘNG GHI FIRESTORE VÀ BẮN NOTIFICATION QUA FCM

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên chủ nhiệm đã đăng nhập và có token hợp lệ.
  - Học sinh mục tiêu (`stu_01`) đã được gán phụ huynh hợp lệ có đăng ký thiết bị FCM Device Token trong hệ thống.
  - Firebase Local Emulator Suite (Firestore Emulator & FCM Mock Service) đang ở trạng thái hoạt động.

- **CÁC THÀNH PHẦN THAM GIA TÍCH HỢP:**
  - `AttendanceController` & `AttendanceService` (Tiếp nhận và xác thực nghiệp vụ điểm danh).
  - `Cloud Firestore` (Lưu document vào collection `/attendances`).
  - `NotificationService` & `Firebase Admin FCM SDK` (Lọc danh sách `parent_uids` và gửi thông báo đẩy multicast).

- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_gvcn_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):**
    ```json
    {
      "class_id": "cls_1a_2026",
      "attendance_date": "2026-09-28",
      "period": 1,
      "records": [
        {
          "student_id": "stu_01",
          "status": "ABSENT_UNEXCUSED",
          "note": "Không thấy đến lớp đầu giờ"
        }
      ]
    }
    ```

- **CÁC BƯỚC THỰC HIỆN:**
  1. Cấu hình tiêu đề `Authorization` với token GVCN trên công cụ test (Postman / Supertest).
  2. Gửi yêu cầu HTTP **`POST`** tới endpoint: `/api/v1/attendance/submit`.
  3. Lắng nghe phản hồi trả về từ API Backend.
  4. Truy vấn trực tiếp vào database Firestore Emulator để kiểm tra trạng thái document mới tạo.
  5. Kiểm tra log của dịch vụ `NotificationService` / FCM Mock Provider xem gói tin push đã được phát hay chưa.

- **KẾT QUẢ MONG ĐỢI (ASSERTIONS):**
  - **Phản hồi API:** Trả về **HTTP 201 (CREATED)** với payload Envelope chuẩn:
    ```json
    {
      "success": true,
      "status_code": 201,
      "message": "Điểm danh hoàn tất và đã gửi thông báo vắng tới phụ huynh",
      "data": {
        "attendance_date": "2026-09-28",
        "total_students": 1,
        "present_count": 0,
        "absent_count": 1,
        "notified_parents": 1
      },
      "timestamp": "2026-09-28T08:00:00.000Z"
    }
    ```
  - **Trạng thái Database (Firestore):**
    - Collection `/attendances` có document mới chứa: `student_id: "stu_01"`, `status: "ABSENT_UNEXCUSED"`.
    - Collection `/notifications` tự động được thêm 1 bản ghi thông báo mới gắn liền với `parent_uid` của học sinh.
  - **Tương tác Dịch vụ ngoại vi (FCM):**
    - Hàm `admin.messaging().sendMulticast()` được gọi đúng 1 lần với đúng `fcm_token` của phụ huynh và nội dung cảnh báo vắng học.

- **TRẠNG THÁI KIỂM THỬ:** **PASS**

---

### PHẦN II: CÁC KỊCH BẢN XỬ LÝ LỖI TÍCH HỢP & NGOẠI LỆ (FAILURE & RESILIENCE CASES)

---

#### 1. Nhóm Kịch Bản Dịch Vụ Phụ Thuộc Bị Lỗi Hoặc Gián Đoạn (External Service Failures)

---

##### IT07_Quizzes_TC02 : AI GEMINI SERVICE BỊ TIMEOUT KHI SINH CÂU HỎI TỪ GIÁO ÁN

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên bộ môn tải tệp giáo án hợp lệ.
  - Mock Google Gemini AI API được cấu hình giả lập phản hồi trễ quá 15 giây hoặc trả về mã lỗi HTTP 504 Gateway Timeout.

- **CÁC THÀNH PHẦN THAM GIA TÍCH HỢP:**
  - `QuizzesController` & `QuizzesService`.
  - `GoogleGenAI Client Library` (Tích hợp Gemini 1.5 Flash / Pro).

- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_gv_hop_le>`
    - `Content-Type: multipart/form-data`
  - **Form Data:**
    - `file`: `giao_an_toan_lop5.docx`
    - `subject_code`: `MATH`
    - `num_questions`: 5
    - `difficulty_level`: `MEDIUM`

- **CÁC BƯỚC THỰC HIỆN:**
  1. Gửi request sinh câu hỏi bằng AI qua phương thức **`POST`** tới: `/api/v1/quizzes/generate-ai`.
  2. Mock Gemini API giả lập ngắt kết nối hoặc timeout.
  3. Ghi nhận cách Backend API xử lý và trả về phản hồi cho phía client.

- **KẾT QUẢ MONG ĐỢI (ASSERTIONS):**
  - Hệ thống không bị treo hoặc crash server NestJS.
  - Trả về mã lỗi an toàn **HTTP 503 (SERVICE UNAVAILABLE)** hoặc **HTTP 504 (GATEWAY TIMEOUT)**.
  - Cấu trúc phản hồi thông báo rõ nguyên nhân để ứng dụng hiển thị nút "Thử lại":
    ```json
    {
      "success": false,
      "status_code": 503,
      "message": "Dịch vụ Trợ lý AI đang bận hoặc phản hồi chậm, vui lòng thử lại sau giây lát",
      "error_code": "AI_SERVICE_UNAVAILABLE",
      "timestamp": "2026-09-28T08:05:00.000Z"
    }
    ```
  - Không tạo ra bất kỳ document rác nào trong collection `/quizzes` trên Firestore.

- **TRẠNG THÁI KIỂM THỬ:** **PASS**
