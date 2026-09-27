# TÀI LIỆU KỊCH BẢN KIỂM THỬ ĐƠN VỊ - PHÂN HỆ LỜI NHẮC LỊCH KIỂM TRA (EXAM REMINDERS)

# MÃ PHÂN HỆ: 09 - UPCOMING EXAM REMINDERS MODULE

# CẤP ĐỘ KIỂM THỬ: KIỂM THỬ ĐƠN VỊ (UNIT TEST)

---

## 1. THÔNG TIN CHUNG

- **PHÂN HỆ HỆ THỐNG:** `09` - Phân hệ Lời nhắc Lịch kiểm tra sắp tới & Phát thông báo phụ huynh (`/api/v1/exam-reminders`)
- **MÔ TẢ MODULE API:** Khởi tạo lời nhắc kiểm tra (Môn học, Loại bài kiểm tra, Ngày diễn ra, Lời dặn ôn bài), tự động phát thông báo Multicast Push Notification qua Firebase Cloud Messaging (FCM) tới toàn bộ phụ huynh trong lớp, tra cứu danh sách lịch kiểm tra sắp tới theo lớp và theo môn, xóa/hủy lời nhắc kiểm tra (`ExamRemindersService`, `ExamRemindersController`).
- **NGƯỜI THỰC HIỆN / VIẾT TESTCASE:** Kim Chi Ha
- **TẬP TIN ĐẶC TẢ API:** [API_Exam_reminders](https://github.com/gray8493/GiaoVienHay/tree/main/docs/apis/exam-reminders)
- **MÔI TRƯỜNG KIỂM THỬ:** Testing / Postman API Client / Jest Unit Testing

---

## 2. CHI TIẾT CÁC KỊCH BẢN KIỂM THỬ ĐƠN VỊ

---

### PHẦN I: CÁC KỊCH BẢN KIỂM THỬ THẤT BẠI & BÁO LỖI (NEGATIVE / FALSE CASES)

---

#### 1. Nhóm Kịch Bản Thiếu Các Trường Bắt Buộc (Missing Required Fields Validation)

---

##### UT09_ExamReminders_TC01 : TỪ CHỐI TẠO LỜI NHẮC KHI KHÔNG CHỌN HOẶC ĐỂ TRỐNG MÃ LỚP HỌC (MISSING CLASS_ID)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên đã đăng nhập hợp lệ với vai trò `TEACHER_HOMEROOM` hoặc `TEACHER_SUBJECT`.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_giao_vien_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):** Để trống trường `class_id`:
  ```json
  {
    "class_id": "",
    "subject_code": "MATH",
    "exam_type": "TEST_15P",
    "exam_date": "2026-09-30",
    "message": "Các con ôn tập kỹ bài 5 và 6 về phép cộng trong phạm vi 10."
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã `Bearer Token` của giáo viên vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/exam-reminders`.
  3. Gửi payload thiếu trường mã lớp học `class_id`.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống ném ra ngoại lệ **HTTP 400 (BAD REQUEST - YÊU CẦU KHÔNG HỢP LỆ)**.
  - Tuyệt đối không tạo document trong collection `/exam_reminders` và không gửi thông báo FCM.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:
  ```json
  {
    "success": false,
    "status_code": 400,
    "message": "Dữ liệu gửi lên vi phạm quy tắc ràng buộc hoặc sai định dạng",
    "error_code": "COMMON_VALIDATION_ERROR",
    "details": [
      {
        "field": "class_id",
        "issue": "Mã lớp học bắt buộc và không được để trống"
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT09_ExamReminders_TC02 : TỪ CHỐI TẠO LỜI NHẮC KHI KHÔNG CHỌN HOẶC ĐỂ TRỐNG MÃ MÔN HỌC (MISSING SUBJECT_CODE)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên đã đăng nhập hợp lệ vào hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_giao_vien_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):** Không truyền hoặc để trống trường `subject_code`:
  ```json
  {
    "class_id": "cls_1a_2026",
    "subject_code": "",
    "exam_type": "TEST_15P",
    "exam_date": "2026-09-30",
    "message": "Các con ôn tập kỹ bài 5 và 6 về phép cộng trong phạm vi 10."
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/exam-reminders`.
  3. Gửi payload thiếu trường mã môn học `subject_code`.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống ném ra ngoại lệ **HTTP 400 (BAD REQUEST - YÊU CẦU KHÔNG HỢP LỆ)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:
  ```json
  {
    "success": false,
    "status_code": 400,
    "message": "Dữ liệu gửi lên vi phạm quy tắc ràng buộc hoặc sai định dạng",
    "error_code": "COMMON_VALIDATION_ERROR",
    "details": [
      {
        "field": "subject_code",
        "issue": "Mã môn học bắt buộc phải được chọn (ví dụ: MATH, LIT, ENG)"
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT09_ExamReminders_TC03 : TỪ CHỐI TẠO LỜI NHẮC KHI KHÔNG CHỌN HOẶC ĐỂ TRỐNG LOẠI BÀI KIỂM TRA (MISSING EXAM_TYPE)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên đã đăng nhập hợp lệ vào hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_giao_vien_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):** Bỏ trống hoặc không truyền trường `exam_type`:
  ```json
  {
    "class_id": "cls_1a_2026",
    "subject_code": "MATH",
    "exam_date": "2026-09-30",
    "message": "Các con ôn tập kỹ bài 5 và 6 về phép cộng trong phạm vi 10."
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/exam-reminders`.
  3. Gửi payload thiếu trường `exam_type`.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống ném ra ngoại lệ **HTTP 400 (BAD REQUEST - YÊU CẦU KHÔNG HỢP LỆ)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:
  ```json
  {
    "success": false,
    "status_code": 400,
    "message": "Dữ liệu gửi lên vi phạm quy tắc ràng buộc hoặc sai định dạng",
    "error_code": "COMMON_VALIDATION_ERROR",
    "details": [
      {
        "field": "exam_type",
        "issue": "Loại bài kiểm tra bắt buộc phải được chọn (TEST_15P, TEST_1P, MID_TERM, FINAL)"
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT09_ExamReminders_TC04 : TỪ CHỐI TẠO LỜI NHẮC KHI KHÔNG NHẬP HOẶC ĐỂ TRỐNG NGÀY KIỂM TRA (MISSING EXAM_DATE)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên đã đăng nhập hợp lệ vào hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_giao_vien_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):** Để trống trường `exam_date`:
  ```json
  {
    "class_id": "cls_1a_2026",
    "subject_code": "MATH",
    "exam_type": "TEST_15P",
    "exam_date": "",
    "message": "Các con ôn tập kỹ bài 5 và 6 về phép cộng trong phạm vi 10."
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/exam-reminders`.
  3. Gửi payload có trường `exam_date` là chuỗi rỗng `""`.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống ném ra ngoại lệ **HTTP 400 (BAD REQUEST - YÊU CẦU KHÔNG HỢP LỆ)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:
  ```json
  {
    "success": false,
    "status_code": 400,
    "message": "Dữ liệu gửi lên vi phạm quy tắc ràng buộc hoặc sai định dạng",
    "error_code": "COMMON_VALIDATION_ERROR",
    "details": [
      {
        "field": "exam_date",
        "issue": "Ngày diễn ra kiểm tra bắt buộc và không được để trống (định dạng YYYY-MM-DD)"
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT09_ExamReminders_TC05 : TỪ CHỐI TẠO LỜI NHẮC KHI KHÔNG NHẬP HOẶC NỘI DUNG DẶN DÒ CHỈ CÓ KHOẢNG TRẮNG (MISSING MESSAGE)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên đã đăng nhập hợp lệ vào hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_giao_vien_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):** Trường `message` chỉ chứa toàn khoảng trắng:
  ```json
  {
    "class_id": "cls_1a_2026",
    "subject_code": "MATH",
    "exam_type": "TEST_15P",
    "exam_date": "2026-09-30",
    "message": "   "
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/exam-reminders`.
  3. Gửi payload có trường `message` chứa khoảng trắng.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống tự động `trim()` và phát hiện nội dung dặn dò rỗng.
  - Hệ thống ném ra ngoại lệ **HTTP 400 (BAD REQUEST - YÊU CẦU KHÔNG HỢP LỆ)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:
  ```json
  {
    "success": false,
    "status_code": 400,
    "message": "Dữ liệu gửi lên vi phạm quy tắc ràng buộc hoặc sai định dạng",
    "error_code": "COMMON_VALIDATION_ERROR",
    "details": [
      {
        "field": "message",
        "issue": "Nội dung lời dặn dò ôn thi bắt buộc và không được để trống hoặc chỉ chứa khoảng trắng"
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

#### 2. Nhóm Kịch Bản Dữ Liệu Không Hợp Lệ & Lỗi Nghiệp Vụ (Invalid Formats & Business Rules)

---

##### UT09_ExamReminders_TC06 : TỪ CHỐI TẠO LỜI NHẮC KHI LỜI DẶN DÒ ÔN THI QUÁ NGẮN (DƯỚI 10 KÝ TỰ)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên đã đăng nhập hợp lệ vào hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_giao_vien_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):** Lời dặn dò có độ dài 7 ký tự (< 10 ký tự):
  ```json
  {
    "class_id": "cls_1a_2026",
    "subject_code": "MATH",
    "exam_type": "TEST_15P",
    "exam_date": "2026-09-30",
    "message": "Thi nhé"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/exam-reminders`.
  3. Gửi dữ liệu có `message` dưới 10 ký tự.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống ném ra ngoại lệ **HTTP 400 (BAD REQUEST - YÊU CẦU KHÔNG HỢP LỆ)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:
  ```json
  {
    "success": false,
    "status_code": 400,
    "message": "Nội dung lời dặn dò quá ngắn",
    "error_code": "COMMON_VALIDATION_ERROR",
    "details": [
      {
        "field": "message",
        "issue": "Lời dặn dò phải có tối thiểu 10 ký tự để cung cấp đủ thông tin ôn thi cho phụ huynh"
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT09_ExamReminders_TC07 : TỪ CHỐI TẠO LỜI NHẮC KHI LỜI DẶN DÒ VƯỢT QUÁ ĐỘ DÀI TỐI ĐA (TRÊN 500 KÝ TỰ)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên đã đăng nhập hợp lệ vào hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_giao_vien_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):** Lời dặn dò dài 550 ký tự (vượt ngưỡng tối đa 500 ký tự):
  ```json
  {
    "class_id": "cls_1a_2026",
    "subject_code": "MATH",
    "exam_type": "FINAL",
    "exam_date": "2026-12-20",
    "message": "Đoạn văn bản dặn dò ôn thi dài 550 ký tự: Kính gửi quý phụ huynh lớp 1A, kỳ thi học kỳ 1 sắp tới là kỳ thi rất quan trọng đối với các con. Nội dung ôn thi gồm toàn bộ kiến thức từ bài 1 đến bài 25 sách giáo khoa Toán. Đề nghị quý phụ huynh kèm cặp các con làm các dạng bài tập: tính nhẩm cộng trừ trong phạm vi 20, nhận biết các hình khối, giải bài toán có lời văn theo sơ đồ tóm tắt. Xin lưu ý các con cần chuẩn bị đầy đủ bút chì 2B, tẩy gôm, thước kẻ có vạch chia cm rõ ràng. Tuyệt đối không để quên dụng cụ học tập ở nhà tránh làm ảnh hưởng tâm lý của con khi làm bài thi. Mọi thắc mắc xin phụ huynh liên hệ trực tiếp với giáo viên qua số điện thoại cá nhân trong giờ hành chính..."
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/exam-reminders`.
  3. Gửi dữ liệu có `message` vượt quá 500 ký tự.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống ném ra ngoại lệ **HTTP 400 (BAD REQUEST - YÊU CẦU KHÔNG HỢP LỆ)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:
  ```json
  {
    "success": false,
    "status_code": 400,
    "message": "Nội dung lời dặn dò vượt quá độ dài tối đa cho phép",
    "error_code": "COMMON_VALIDATION_ERROR",
    "details": [
      {
        "field": "message",
        "issue": "Nội dung lời dặn dò không được vượt quá 500 ký tự"
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT09_ExamReminders_TC08 : TỪ CHỐI TẠO LỜI NHẮC KHI NGÀY KIỂM TRA KHÔNG TỒN TẠI TRONG LỊCH THỰC TẾ

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên đã đăng nhập hợp lệ vào hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_giao_vien_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):** Ngày kiểm tra `2026-02-30` không tồn tại trong lịch thực tế:
  ```json
  {
    "class_id": "cls_1a_2026",
    "subject_code": "MATH",
    "exam_type": "TEST_15P",
    "exam_date": "2026-02-30",
    "message": "Kiểm tra 15 phút môn Toán về cộng trừ phạm vi 10."
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/exam-reminders`.
  3. Gửi trường `exam_date` là ngày không tồn tại trên lịch thực tế.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống ném ra ngoại lệ **HTTP 400 (BAD REQUEST - YÊU CẦU KHÔNG HỢP LỆ)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:
  ```json
  {
    "success": false,
    "status_code": 400,
    "message": "Dữ liệu ngày kiểm tra không hợp lệ hoặc không tồn tại trong lịch thực tế",
    "error_code": "COMMON_VALIDATION_ERROR",
    "details": [
      {
        "field": "exam_date",
        "issue": "Giá trị '2026-02-30' không phải là ngày hợp lệ trong lịch thực tế (tháng 2 năm 2026 chỉ có 28 ngày)"
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT09_ExamReminders_TC09 : TỪ CHỐI TẠO LỜI NHẮC KHI NGÀY KIỂM TRA ĐÃ TRÔI QUA TRONG QUÁ KHÚ (EXAM_DATE_INVALID)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên đã đăng nhập hợp lệ vào hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_giao_vien_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):** Ngày kiểm tra nhỏ hơn ngày hiện tại:
  ```json
  {
    "class_id": "cls_1a_2026",
    "subject_code": "MATH",
    "exam_type": "TEST_15P",
    "exam_date": "2026-09-01",
    "message": "Kiểm tra 15 phút môn Toán về cộng trừ phạm vi 10."
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/exam-reminders`.
  3. Gửi trường `exam_date` nhỏ hơn ngày hiện tại (`2026-09-01` < `2026-09-27`).
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống ném ra ngoại lệ **HTTP 400 (BAD REQUEST - NGÀY KIỂM TRA TRONG QUÁ KHỨ)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:
  ```json
  {
    "success": false,
    "status_code": 400,
    "message": "Ngày kiểm tra không hợp lệ hoặc đã trôi qua trong quá khứ",
    "error_code": "EXAM_DATE_INVALID",
    "details": [
      {
        "field": "exam_date",
        "issue": "Ngày kiểm tra phải từ ngày hiện tại trở đi (>= 2026-09-27)"
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT09_ExamReminders_TC10 : TỪ CHỐI TẠO LỜI NHẮC KHI LOẠI BÀI KIỂM TRA NGOÀI DANH MỤC CHO PHÉP (EXAM_TYPE_INVALID)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên đã đăng nhập hợp lệ vào hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_giao_vien_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):** Loại bài kiểm tra không nằm trong enum chuẩn:
  ```json
  {
    "class_id": "cls_1a_2026",
    "subject_code": "MATH",
    "exam_type": "KIEM_TRA_DOT_XUAT",
    "exam_date": "2026-09-30",
    "message": "Kiểm tra đột xuất kiến thức cũ về hình học"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/exam-reminders`.
  3. Gửi giá trị `exam_type` không thuộc enum (`ORAL_TEST`, `QUIZ`, `TEST_15P`, `TEST_1P`, `MID_TERM`, `FINAL`).
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống ném ra ngoại lệ **HTTP 400 (BAD REQUEST - LOẠI BÀI THI KHÔNG HỢP LỆ)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:
  ```json
  {
    "success": false,
    "status_code": 400,
    "message": "Loại hình bài kiểm tra không nằm trong danh mục chuẩn",
    "error_code": "EXAM_TYPE_INVALID",
    "details": [
      {
        "field": "exam_type",
        "issue": "Giá trị ngoài danh mục cho phép (ORAL_TEST, QUIZ, TEST_15P, TEST_1P, MID_TERM, FINAL)"
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

#### 3. Nhóm Kịch Bản Phân Quyền & Không Tìm Thấy (Authorization & Not Found)

---

##### UT09_ExamReminders_TC11 : CHẶN GIÁO VIÊN CHƯA ĐƯỢC PHÂN CÔNG GIẢNG DẠY MÔN HỌC TẠO LỜI NHẮC (ACAD_NOT_ASSIGNED_TEACHER)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên `usr_teacher_other` đã đăng nhập nhưng không được phân công giảng dạy môn Toán tại lớp `cls_1a_2026`.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_giao_vien_khong_phu_trach>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):**
  ```json
  {
    "class_id": "cls_1a_2026",
    "subject_code": "MATH",
    "exam_type": "TEST_15P",
    "exam_date": "2026-09-30",
    "message": "Lời nhắc từ giáo viên không có thẩm quyền đối với bộ môn này."
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của giáo viên không có thẩm quyền vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/exam-reminders`.
  3. Gửi payload tạo lời nhắc môn học chưa được phân công.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống ném ra ngoại lệ cấm truy cập **HTTP 403 (FORBIDDEN - CHƯA ĐƯỢC PHÂN CÔNG)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:
  ```json
  {
    "success": false,
    "status_code": 403,
    "message": "Giáo viên chưa được phân công giảng dạy môn học này tại lớp đã chọn",
    "error_code": "ACAD_NOT_ASSIGNED_TEACHER",
    "details": null,
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT09_ExamReminders_TC12 : BÁO LỖI KHI TẠO LỜI NHẮC VỚI MÃ LỚP HỌC KHÔNG TỒN TẠI (CLASS_NOT_FOUND)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên đã đăng nhập hợp lệ.
  - Mã lớp học `cls_nonexistent_999` hoàn toàn không có trong cơ sở dữ liệu hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_giao_vien_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):**
  ```json
  {
    "class_id": "cls_nonexistent_999",
    "subject_code": "MATH",
    "exam_type": "TEST_15P",
    "exam_date": "2026-09-30",
    "message": "Kiểm tra 15 phút môn Toán về cộng trừ phạm vi 10."
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của giáo viên vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/exam-reminders`.
  3. Gửi payload với `class_id` không tồn tại.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 404 (NOT FOUND - KHÔNG TÌM THẤY)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:
  ```json
  {
    "success": false,
    "status_code": 404,
    "message": "Không tìm thấy lớp học trên hệ thống",
    "error_code": "CLASS_NOT_FOUND",
    "details": null,
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT09_ExamReminders_TC13 : BÁO LỖI KHI TRA CỨU DANH SÁCH LỊCH KIỂM TRA VỚI MÃ LỚP HỌC KHÔNG TỒN TẠI (CLASS_NOT_FOUND)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Người dùng đã đăng nhập hợp lệ.
  - Mã lớp học `cls_khong_ton_tai` hoàn toàn không tồn tại trong hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_nguoi_dung_hop_le>`
  - **Tham số đường dẫn (Path Params):** `classId = cls_khong_ton_tai`
  - **Tham số truy vấn (Query Params):** Không có
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/exam-reminders/class/cls_khong_ton_tai`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 404 (NOT FOUND - KHÔNG TÌM THẤY)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:
  ```json
  {
    "success": false,
    "status_code": 404,
    "message": "Không tìm thấy lớp học trên hệ thống",
    "error_code": "CLASS_NOT_FOUND",
    "details": null,
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT09_ExamReminders_TC14 : CHẶN NGƯỜI DÙNG KHÔNG THUỘC LỚP HỌC XEM DANH SÁCH LỊCH KIỂM TRA (AUTH_FORBIDDEN)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Người dùng thuộc trường/lớp khác đã đăng nhập hợp lệ, nhưng không có con em hay phân công giảng dạy tại lớp `cls_1a_2026`.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_nguoi_dung_lop_khac>`
  - **Tham số đường dẫn (Path Params):** `classId = cls_1a_2026`
  - **Tham số truy vấn (Query Params):** Không có
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực của người dùng không thuộc lớp vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/exam-reminders/class/cls_1a_2026`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống ném ra ngoại lệ cấm truy cập **HTTP 403 (FORBIDDEN - CẤM TRUY CẬP)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:
  ```json
  {
    "success": false,
    "status_code": 403,
    "message": "Bạn không có quyền xem thông tin lịch kiểm tra của lớp học này",
    "error_code": "AUTH_FORBIDDEN",
    "details": null,
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT09_ExamReminders_TC15 : BÁO LỖI KHI XÓA LỜI NHẮC KIỂM TRA VỚI MÃ LỜI NHẮC KHÔNG TỒN TẠI (EXAM_REMINDER_NOT_FOUND)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên đã đăng nhập hợp lệ.
  - Mã lời nhắc `exm_khong_ton_tai` hoàn toàn không có trong cơ sở dữ liệu.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien_hop_le>`
  - **Tham số đường dẫn (Path Params):** `id = exm_khong_ton_tai`
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của giáo viên vào mục **Headers**.
  2. Chọn phương thức **`DELETE`**, nhập đường dẫn API: `/api/v1/exam-reminders/exm_khong_ton_tai`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 404 (NOT FOUND - KHÔNG TÌM THẤY)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:
  ```json
  {
    "success": false,
    "status_code": 404,
    "message": "Không tìm thấy thông tin lịch nhắc kiểm tra này",
    "error_code": "EXAM_REMINDER_NOT_FOUND",
    "details": null,
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT09_ExamReminders_TC16 : CHẶN GIÁO VIÊN KHÔNG PHẢI TÁC GIẢ HOẶC GVCN XÓA LỜI NHẮC KIỂM TRA (AUTH_FORBIDDEN)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Lời nhắc `exm_4412` do giáo viên môn Toán tạo.
  - Giáo viên khác (`usr_teacher_other`) cố tình gửi yêu cầu xóa lời nhắc này.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien_khong_phai_tac_gia>`
  - **Tham số đường dẫn (Path Params):** `id = exm_4412`
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực của giáo viên không có thẩm quyền vào mục **Headers**.
  2. Chọn phương thức **`DELETE`**, nhập đường dẫn API: `/api/v1/exam-reminders/exm_4412`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống ném ra ngoại lệ cấm truy cập **HTTP 403 (FORBIDDEN - CẤM TRUY CẬP)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:
  ```json
  {
    "success": false,
    "status_code": 403,
    "message": "Bạn không có quyền xóa lời nhắc kiểm tra do giáo viên khác tạo",
    "error_code": "AUTH_FORBIDDEN",
    "details": null,
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT09_ExamReminders_TC17 : CHẶN TRUY CẬP KHI THIẾU TOKEN HOẶC TOKEN KHÔNG HỢP LỆ (AUTH_UNAUTHORIZED)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Request không truyền header `Authorization` hoặc token xác thực đã hết hạn / không hợp lệ.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** Không truyền Bearer token xác thực
  - **Dữ liệu thân (Body JSON):**
  ```json
  {
    "class_id": "cls_1a_2026",
    "subject_code": "MATH",
    "exam_type": "TEST_15P",
    "exam_date": "2026-09-30",
    "message": "Lời nhắc kiểm tra môn Toán"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Không cấu hình giá trị `Bearer Token` trong tab **Authorization** trên Postman.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/exam-reminders`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống ném ra ngoại lệ **HTTP 401 (UNAUTHORIZED - CHƯA XÁC THỰC)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:
  ```json
  {
    "success": false,
    "status_code": 401,
    "message": "Yêu cầu truy cập chưa được xác thực danh tính",
    "error_code": "AUTH_UNAUTHORIZED",
    "details": null,
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

#### 4. Nhóm Kịch Bản Lỗi Ngoại Lệ Hệ Thống (System Internal Server Errors)

---

##### UT09_ExamReminders_TC18 : XỬ LÝ NGOẠI LỆ LỖI MÁY CHỦ NỘI BỘ HOẶC SỰ CỐ DỊCH VỤ FIREBASE FCM (SYS_INTERNAL_ERROR)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên đã đăng nhập hợp lệ.
  - Cơ sở dữ liệu Cloud Firestore hoặc dịch vụ Firebase Admin FCM gặp sự cố mất kết nối mạng hoặc timeout.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_giao_vien_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):**
  ```json
  {
    "class_id": "cls_1a_2026",
    "subject_code": "MATH",
    "exam_type": "TEST_15P",
    "exam_date": "2026-09-30",
    "message": "Thứ Sáu tới lớp sẽ có bài kiểm tra 15 phút môn Toán về phép cộng."
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của giáo viên vào mục **Headers**.
  2. Giả lập / Mocking kết nối cơ sở dữ liệu Firestore hoặc dịch vụ Firebase FCM bị sập / timeout.
  3. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/exam-reminders`.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Bộ lọc ngoại lệ toàn cục bắt lỗi và chuyển đổi thành mã trạng thái **HTTP 500 (INTERNAL SERVER ERROR - LỖI MÁY CHỦ NỘI BỘ)** mà không làm crash tiến trình ứng dụng.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:
  ```json
  {
    "success": false,
    "status_code": 500,
    "message": "Lỗi máy chủ nội bộ hoặc lỗi kết nối Firebase Cloud Messaging",
    "error_code": "SYS_INTERNAL_ERROR",
    "details": null,
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### PHẦN II: CÁC KỊCH BẢN KIỂM THỬ THÀNH CÔNG (POSITIVE / TRUE CASES)

---

#### UT09_ExamReminders_TC19 : TẠO LỜI NHẮC KIỂM TRA 15 PHÚT THÀNH CÔNG VÀ TỰ ĐỘNG PHÁT THÔNG BÁO FCM TỚI PHỤ HUYNH

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên đã đăng nhập và được phân công giảng dạy môn Toán (`MATH`) tại lớp `cls_1a_2026`.
  - Lớp học đã có 36 học sinh liên kết phụ huynh và sở hữu FCM Device Token hợp lệ.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_giao_vien_toan>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):**
  ```json
  {
    "class_id": "cls_1a_2026",
    "subject_code": "MATH",
    "exam_type": "TEST_15P",
    "exam_date": "2026-09-30",
    "message": "Thứ Sáu tới lớp sẽ có bài kiểm tra 15 phút môn Toán về phép cộng trong phạm vi 10. Kính nhờ quý phụ huynh nhắc các con ôn kỹ bài 5 và 6."
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của giáo viên dạy Toán vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/exam-reminders`.
  3. Thêm dữ liệu lời nhắc kiểm tra vào phần **Body** định dạng `raw (application/json)`.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 201 (CREATED - ĐÃ TẠO THÀNH CÔNG)**.
  - Lưu document lời nhắc vào collection `/exam_reminders` trong Cloud Firestore.
  - Tự động kích hoạt Multicast FCM Notification đến toàn bộ điện thoại phụ huynh trong lớp.
  - Dữ liệu trả về đúng định dạng JSON chuẩn:
  ```json
  {
    "success": true,
    "status_code": 201,
    "message": "Đã tạo lời nhắc kiểm tra và phát thông báo tới toàn thể phụ huynh",
    "data": {
      "reminder_id": "exm_4412",
      "class_id": "cls_1a_2026",
      "subject_code": "MATH",
      "exam_date": "2026-09-30",
      "notified_parents": 36,
      "created_at": "2026-09-27T10:30:00.000Z"
    },
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

#### UT09_ExamReminders_TC20 : TẠO LỜI NHẮC KIỂM TRA ĐỊNH KỲ 1 TIẾT THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên bộ môn Tiếng Anh (`ENG`) được phân công tại lớp `cls_1a_2026` đã đăng nhập hợp lệ.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_gvbm_eng>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):**
  ```json
  {
    "class_id": "cls_1a_2026",
    "subject_code": "ENG",
    "exam_type": "TEST_1P",
    "exam_date": "2026-10-05",
    "message": "Lớp sẽ có bài kiểm tra 1 tiết môn Tiếng Anh vào ngày 05/10. Nội dung ôn tập gồm từ vựng và mẫu câu Unit 1 và Unit 2."
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/exam-reminders`.
  3. Thêm dữ liệu lịch thi 1 tiết vào phần **Body**.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 201 (CREATED - ĐÃ TẠO THÀNH CÔNG)**.
  - Ghi nhận lịch kiểm tra 1 tiết vào hệ thống và phát thông báo FCM tới phụ huynh.
  - Dữ liệu trả về đúng định dạng JSON chuẩn:
  ```json
  {
    "success": true,
    "status_code": 201,
    "message": "Đã tạo lời nhắc kiểm tra và phát thông báo tới toàn thể phụ huynh",
    "data": {
      "reminder_id": "exm_4413",
      "class_id": "cls_1a_2026",
      "subject_code": "ENG",
      "exam_date": "2026-10-05",
      "notified_parents": 36,
      "created_at": "2026-09-27T10:35:00.000Z"
    },
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

#### UT09_ExamReminders_TC21 : TẠO LỜI NHẮC KIỂM TRA ĐỊNH KỲ GIỮA KỲ / CUỐI KỲ THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên bộ môn Ngữ Văn (`LIT`) tại lớp `cls_1a_2026` đã đăng nhập hợp lệ.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_gvbm_lit>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):**
  ```json
  {
    "class_id": "cls_1a_2026",
    "subject_code": "LIT",
    "exam_type": "MID_TERM",
    "exam_date": "2026-10-20",
    "message": "Lịch thi Giữa học kỳ 1 môn Tiếng Việt sẽ diễn ra vào ngày 20/10. Phụ huynh đôn đốc các con luyện đọc diễn cảm và rèn chữ viết hoa."
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/exam-reminders`.
  3. Thêm dữ liệu lịch thi Giữa kỳ (`MID_TERM`) vào phần **Body**.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 201 (CREATED - ĐÃ TẠO THÀNH CÔNG)**.
  - Lưu bản ghi và bắn FCM thông báo tới toàn thể phụ huynh trong lớp.
  - Dữ liệu trả về đúng định dạng JSON chuẩn:
  ```json
  {
    "success": true,
    "status_code": 201,
    "message": "Đã tạo lời nhắc kiểm tra và phát thông báo tới toàn thể phụ huynh",
    "data": {
      "reminder_id": "exm_4414",
      "class_id": "cls_1a_2026",
      "subject_code": "LIT",
      "exam_date": "2026-10-20",
      "notified_parents": 36,
      "created_at": "2026-09-27T10:40:00.000Z"
    },
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

#### UT09_ExamReminders_TC22 : LẤY TOÀN BỘ DANH SÁCH LỊCH KIỂM TRA SẮP TỚI CỦA LỚP HỌC THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên hoặc phụ huynh của học sinh lớp `cls_1a_2026` đã đăng nhập thành công.
  - Lớp học đã có các lịch kiểm tra sắp tới trong cơ sở dữ liệu.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_nguoi_dung_hop_le>`
  - **Tham số đường dẫn (Path Params):** `classId = cls_1a_2026`
  - **Tham số truy vấn (Query Params):** Không có (lấy tất cả các môn)
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/exam-reminders/class/cls_1a_2026`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Trả về danh sách tất cả các lời nhắc kiểm tra sắp tới của lớp học, sắp xếp theo thứ tự ngày tăng dần.
  - Dữ liệu trả về đúng định dạng JSON chuẩn:
  ```json
  {
    "success": true,
    "status_code": 200,
    "data": [
      {
        "id": "exm_4412",
        "class_id": "cls_1a_2026",
        "teacher_id": "usr_teacher_lan_01",
        "teacher_name": "Nguyễn Thị Lan",
        "subject_code": "MATH",
        "subject_name": "Toán học",
        "exam_type": "TEST_15P",
        "exam_date": "2026-09-30",
        "message": "Thứ Sáu tới lớp sẽ có bài kiểm tra 15 phút môn Toán về phép cộng trong phạm vi 10.",
        "created_at": "2026-09-27T10:30:00.000Z"
      },
      {
        "id": "exm_4413",
        "class_id": "cls_1a_2026",
        "teacher_id": "usr_teacher_eng_02",
        "teacher_name": "Trần Thị Mai",
        "subject_code": "ENG",
        "subject_name": "Tiếng Anh",
        "exam_type": "TEST_1P",
        "exam_date": "2026-10-05",
        "message": "Lớp sẽ có bài kiểm tra 1 tiết môn Tiếng Anh vào ngày 05/10.",
        "created_at": "2026-09-27T10:35:00.000Z"
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

#### UT09_ExamReminders_TC23 : LỌC DANH SÁCH LỊCH KIỂM TRA THEO MÃ MÔN HỌC THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Lớp `cls_1a_2026` có lịch kiểm tra các môn Toán (`MATH`) và Tiếng Anh (`ENG`).
  - Người dùng thuộc lớp đã đăng nhập hợp lệ.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_nguoi_dung_hop_le>`
  - **Tham số đường dẫn (Path Params):** `classId = cls_1a_2026`
  - **Tham số truy vấn (Query Params):** `subject_code = MATH`
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/exam-reminders/class/cls_1a_2026?subject_code=MATH`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Chỉ lọc và trả về các lịch kiểm tra thuộc môn Toán học (`MATH`).
  - Dữ liệu trả về đúng định dạng JSON chuẩn:
  ```json
  {
    "success": true,
    "status_code": 200,
    "data": [
      {
        "id": "exm_4412",
        "class_id": "cls_1a_2026",
        "teacher_id": "usr_teacher_lan_01",
        "teacher_name": "Nguyễn Thị Lan",
        "subject_code": "MATH",
        "subject_name": "Toán học",
        "exam_type": "TEST_15P",
        "exam_date": "2026-09-30",
        "message": "Thứ Sáu tới lớp sẽ có bài kiểm tra 15 phút môn Toán về phép cộng trong phạm vi 10.",
        "created_at": "2026-09-27T10:30:00.000Z"
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

#### UT09_ExamReminders_TC24 : GIÁO VIÊN XÓA HOẶC HỦY BỎ LỜI NHẮC KIỂM TRA THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Lời nhắc kiểm tra `exm_4412` tồn tại trên hệ thống.
  - Giáo viên tạo lời nhắc (hoặc GVCN của lớp `cls_1a_2026`) đã đăng nhập hợp lệ.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien_hop_le>`
  - **Tham số đường dẫn (Path Params):** `id = exm_4412`
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của giáo viên có thẩm quyền vào mục **Headers**.
  2. Chọn phương thức **`DELETE`**, nhập đường dẫn API: `/api/v1/exam-reminders/exm_4412`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Xóa tài liệu `exm_4412` khỏi collection `/exam_reminders` trong Cloud Firestore.
  - Dữ liệu trả về đúng định dạng JSON chuẩn:
  ```json
  {
    "success": true,
    "status_code": 200,
    "message": "Đã xóa lịch nhắc kiểm tra thành công",
    "data": {
      "reminder_id": "exm_4412"
    },
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**
