# TÀI LIỆU KỊCH BẢN KIỂM THỬ ĐƠN VỊ - PHÂN HỆ LỜI NHẮC LỊCH KIỂM TRA (EXAM REMINDERS)

# MÃ PHÂN HỆ: 09 - UPCOMING EXAM REMINDERS MODULE

# CẤP ĐỘ KIỂM THỬ: KIỂM THỬ ĐƠN VỊ (UNIT TEST)

---

## 1. THÔNG TIN CHUNG

- **PHÂN HỆ HỆ THỐNG:** `09` - Phân hệ Lời nhắc Lịch kiểm tra sắp tới & Phát thông báo phụ huynh (`/api/v1/exam-reminders`)
- **MÔ TẢ MODULE API:** Khởi tạo lời nhắc kiểm tra (Môn học, Loại bài kiểm tra, Ngày diễn ra, Lời dặn ôn bài), tự động phát thông báo Multicast Push Notification qua Firebase Cloud Messaging (FCM) tới toàn bộ phụ huynh trong lớp, tra cứu danh sách lịch kiểm tra sắp tới theo lớp và theo môn (`ExamRemindersService`, `ExamRemindersController`)
- **NGƯỜI THỰC HIỆN / VIẾT TESTCASE:** Kim Chi Ha
- **TẬP TIN KIỂM THỬ:** [API_Exam_reminders](https://github.com/gray8493/GiaoVienHay/tree/main/docs/apis/exam-reminders)
- **MÔI TRƯỜNG KIỂM THỬ:** Testing / Postman API Client

---

## 2. CHI TIẾT CÁC KỊCH BẢN KIỂM THỬ ĐƠN VỊ

---

### UT09_ExamReminders_TC01 : TẠO LỜI NHẮC KIỂM TRA 15 PHÚT THÀNH CÔNG VÀ TỰ ĐỘNG PHÁT THÔNG BÁO FCM TỚI PHỤ HUYNH

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Giáo viên đã đăng nhập và được phân công giảng dạy môn Toán (`MATH`) tại lớp `cls_1a_2026`.
  - Lớp học đã có phụ huynh liên kết tài khoản và sở hữu FCM Device Token hợp lệ.
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
    "exam_date": "2026-09-28",
    "message": "Thứ Hai tới lớp sẽ có bài kiểm tra 15 phút môn Toán về phép cộng trong phạm vi 10. Kính nhờ quý phụ huynh nhắc các con ôn kỹ bài 5 và 6."
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` của giáo viên vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/exam-reminders`.
  3. Thêm dữ liệu lời nhắc kiểm tra vào phần **Body** định dạng `raw (application/json)`.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  - Hệ thống phản hồi mã trạng thái **HTTP 201 (CREATED - ĐÃ TẠO THÀNH CÔNG)**.
  - Lưu document lời nhắc vào collection `/exam_reminders` trong Cloud Firestore.
  - Tự động phát Multicast FCM Notification đến toàn bộ điện thoại phụ huynh trong lớp.
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
      "exam_date": "2026-09-28",
      "notified_parents": 35,
      "created_at": "2026-09-27T10:30:00.000Z"
    }
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT09_ExamReminders_TC02 : TẠO LỜI NHẮC KIỂM TRA ĐỊNH KỲ GIỮA KỲ THÀNH CÔNG

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
    "exam_type": "MID_TERM",
    "exam_date": "2026-10-15",
    "message": "Lịch kiểm tra Giữa học kỳ 1 môn Tiếng Anh sẽ diễn ra vào ngày 15/10. Nội dung ôn tập từ Unit 1 đến Unit 4 bao gồm kỹ năng Nghe và Từ vựng."
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/exam-reminders`.
  3. Thêm dữ liệu lịch thi Giữa kỳ vào phần **Body**.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  - Hệ thống phản hồi mã trạng thái **HTTP 201 (CREATED - ĐÃ TẠO THÀNH CÔNG)**.
  - Ghi nhận lịch kiểm tra giữa kỳ vào hệ thống và phát FCM nhắc nhở phụ huynh.
  - Dữ liệu trả về đúng định dạng JSON chuẩn:

  ```json
  {
    "success": true,
    "status_code": 201,
    "message": "Đã tạo lời nhắc kiểm tra và phát thông báo tới toàn thể phụ huynh",
    "data": {
      "reminder_id": "exm_midterm_01",
      "class_id": "cls_1a_2026",
      "subject_code": "ENG",
      "exam_date": "2026-10-15",
      "notified_parents": 35,
      "created_at": "2026-09-27T10:35:00.000Z"
    }
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT09_ExamReminders_TC03 : TỪ CHỐI TẠO LỜI NHẮC KHI LOẠI BÀI KIỂM TRA KHÔNG HỢP LỆ

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Giáo viên đã đăng nhập hợp lệ vào hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_giao_vien_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):**

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
  3. Thêm dữ liệu có `exam_type` không thuộc enum hợp lệ vào phần **Body**.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  - Hệ thống ném ra ngoại lệ **HTTP 400 (BAD REQUEST - YÊU CẦU KHÔNG HỢP LỆ)**.
  - Tuyệt đối không tạo bản ghi và không gửi thông báo FCM.
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

### UT09_ExamReminders_TC04 : TỪ CHỐI TẠO LỜI NHẮC KHI NGÀY KIỂM TRA TRONG QUÁ KHỨ

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Giáo viên đã đăng nhập hợp lệ vào hệ thống.
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
    "exam_date": "2026-01-01",
    "message": "Nhắc lịch kiểm tra môn Toán về phép cộng"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/exam-reminders`.
  3. Thêm dữ liệu có ngày kiểm tra `exam_date` nhỏ hơn ngày hiện tại vào phần **Body**.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  - Hệ thống phản hồi mã trạng thái **HTTP 400 (BAD REQUEST - YÊU CẦU KHÔNG HỢP LỆ)**.
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
        "issue": "Ngày diễn ra kiểm tra phải từ ngày hiện tại trở đi"
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT09_ExamReminders_TC05 : TỪ CHỐI TẠO LỜI NHẮC KHI LỜI DẶN ÔN TẬP QUÁ NGẮN

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Giáo viên đã đăng nhập hợp lệ vào hệ thống.
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
    "exam_date": "2026-09-28",
    "message": "Thi nhé"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/exam-reminders`.
  3. Thêm dữ liệu có lời dặn dưới 10 ký tự vào phần **Body**.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  - Hệ thống ném ra ngoại lệ **HTTP 400 (BAD REQUEST - YÊU CẦU KHÔNG HỢP LỆ)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:

  ```json
  {
    "success": false,
    "status_code": 400,
    "message": "Lời dặn dò ôn thi phải có tối thiểu 10 ký tự",
    "error_code": "EXAM_MESSAGE_TOO_SHORT",
    "details": [
      {
        "field": "message",
        "issue": "Độ dài nội dung lời dặn tối thiểu 10 ký tự"
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT09_ExamReminders_TC06 : CHẶN GIÁO VIÊN KHÔNG PHỤ TRÁCH MÔN TẠO LỜI NHẮC KIỂM TRA

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
    "exam_date": "2026-09-28",
    "message": "Lời nhắc từ giáo viên không có thẩm quyền đối với bộ môn này"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` của giáo viên không có thẩm quyền vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/exam-reminders`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  - Hệ thống ném ra ngoại lệ **HTTP 403 (FORBIDDEN - CẤM TRUY CẬP)**.
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

### UT09_ExamReminders_TC07 : LẤY TOÀN BỘ DANH SÁCH LỊCH KIỂM TRA SẮP TỚI CỦA LỚP HỌC THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Người dùng (Giáo viên hoặc Phụ huynh của lớp `cls_1a_2026`) đã đăng nhập thành công.
  - Lớp học đã có các lịch kiểm tra sắp tới trong cơ sở dữ liệu.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_nguoi_dung_hop_le>`
  - **Tham số đường dẫn (Path Params):** `classId = cls_1a_2026`
  - **Tham số truy vấn (Query Params JSON):**

  ```json
  {}
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/exam-reminders/class/cls_1a_2026`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Trả về danh sách chi tiết các lịch kiểm tra sắp tới của toàn bộ các môn học trong lớp.
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
        "exam_date": "2026-09-28",
        "message": "Thứ Hai tới lớp sẽ có bài kiểm tra 15 phút môn Toán về phép cộng trong phạm vi 10.",
        "created_at": "2026-09-27T10:30:00.000Z"
      }
    ]
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT09_ExamReminders_TC08 : LỌC DANH SÁCH LỊCH KIỂM TRA THEO MÃ MÔN HỌC THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Lớp `cls_1a_2026` có lịch kiểm tra các môn Toán (`MATH`) và Tiếng Anh (`ENG`).
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_nguoi_dung_hop_le>`
  - **Tham số đường dẫn (Path Params):** `classId = cls_1a_2026`
  - **Tham số truy vấn (Query Params JSON):**

  ```json
  {
    "subject_code": "MATH"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/exam-reminders/class/cls_1a_2026?subject_code=MATH`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Chỉ lọc và trả về các lịch kiểm tra thuộc môn Toán học.
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
        "exam_date": "2026-09-28",
        "message": "Thứ Hai tới lớp sẽ có bài kiểm tra 15 phút môn Toán về phép cộng trong phạm vi 10.",
        "created_at": "2026-09-27T10:30:00.000Z"
      }
    ]
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT09_ExamReminders_TC09 : CHẶN YÊU CẦU TẠO LỜI NHẮC KHI CHƯA XÁC THỰC (UNAUTHORIZED)

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Request không truyền header Authorization hoặc token xác thực đã hết hạn.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** Không truyền Authorization token
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "class_id": "cls_1a_2026",
    "subject_code": "MATH",
    "exam_type": "TEST_15P",
    "exam_date": "2026-09-28",
    "message": "Lời nhắc kiểm tra"
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

### UT09_ExamReminders_TC10 : BÁO LỖI KHI TRA CỨU LỊCH KIỂM TRA VỚI MÃ LỚP HỌC KHÔNG TỒN TẠI

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Người dùng đã đăng nhập hợp lệ.
  - Mã lớp học `cls_khong_ton_tai` hoàn toàn không có trong cơ sở dữ liệu hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_nguoi_dung_hop_le>`
  - **Tham số đường dẫn (Path Params):** `classId = cls_khong_ton_tai`
  - **Tham số truy vấn (Query Params JSON):**

  ```json
  {}
  ```
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
