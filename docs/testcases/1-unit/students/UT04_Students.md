# TÀI LIỆU KỊCH BẢN KIỂM THỬ ĐƠN VỊ - PHÂN HỆ HỌC SINH & CỔNG PHỤ HUYNH

# MÃ PHÂN HỆ: 04 - STUDENTS & PARENTS PORTAL MODULE

# CẤP ĐỘ KIỂM THỬ: KIỂM THỬ ĐƠN VỊ (UNIT TEST)

---

## 1. THÔNG TIN CHUNG

- **PHÂN HỆ HỆ THỐNG:** `04` - Phân hệ Hồ sơ học sinh & Cổng tra cứu phụ huynh
- **MÔ TẢ MODULE API:** Trung tâm học vụ học sinh (`StudentsService`, `StudentsController`)
- **TẬP TIN KIỂM THỬ:** `apps/api/src/modules/04-students/students.service.spec.ts`, `apps/api/src/modules/04-students/students.controller.spec.ts`
- **NGƯỜI THỰC HIỆN:** Thái Bảo
- **MÔI TRƯỜNG KIỂM THỬ:** Testing

---

## 2. CHI TIẾT CÁC KỊCH BẢN KIỂM THỬ ĐƠN VỊ

---

### UT04_Students_TC01 : PHỤ HUYNH XEM THÔNG TIN LÝ LỊCH CON CÁI THUỘC QUYỀN QUẢN LÝ THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Phụ huynh đã đăng nhập vào hệ thống ứng dụng di động.
  - Học sinh `stu_01` có danh sách `parent_uids` chứa mã định danh UID của phụ huynh đang đăng nhập.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_phu_huynh>`
  - **Tham số đường dẫn (Path Params JSON):**

  ```json
  {
    "id": "stu_01"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` của phụ huynh vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/students/stu_01`.
  3. Không cần truyền dữ liệu vào phần Body.
  4. Bấm nút **Gửi (Send)** để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": true,
    "status_code": 200,
    "data": {
      "student_id": "stu_01",
      "full_name": "Trần Bảo Nam",
      "student_code": "HS2026_001",
      "class_id": "cls_1a_2026",
      "class_name": "1A",
      "dob": "2020-05-15",
      "gender": "MALE",
      "avatar_url": "https://storage.googleapis.com/.../avatar_nam.jpg"
    }
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT04_Students_TC02 : CHẶN PHỤ HUYNH TRA CỨU THÔNG TIN HỌC SINH KHÔNG PHẢI CON MÌNH

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Phụ huynh `parent_other` đã đăng nhập vào hệ thống.
  - Học sinh `stu_01` không có liên kết với tài khoản này (`parent_uids` không chứa UID người gọi).
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_phu_huynh_la>`
  - **Tham số đường dẫn (Path Params JSON):**

  ```json
  {
    "id": "stu_01"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` của phụ huynh không có quyền vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/students/stu_01`.
  3. Bấm nút **Gửi (Send)** để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 403,
    "error_code": "FORBIDDEN_STUDENT_ACCESS",
    "message": "Bạn không có quyền truy cập hồ sơ học sinh này"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT04_Students_TC03 : TRA CỨU BẢNG ĐIỂM ĐA MÔN HỌC VÀ CÁC CỘT ĐIỂM THÀNH PHẦN

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Phụ huynh có quyền giám hộ học sinh `stu_01`.
  - Giáo viên các bộ môn đã nhập và công bố điểm cho học sinh này trên hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_phu_huynh>`
  - **Tham số đường dẫn (Path Params JSON):**

  ```json
  {
    "id": "stu_01"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` của phụ huynh vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/students/stu_01/academic`.
  3. Bấm nút **Gửi (Send)** để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": true,
    "status_code": 200,
    "data": {
      "student_id": "stu_01",
      "full_name": "Trần Bảo Nam",
      "class_name": "1A",
      "semester": 1,
      "subjects": [
        {
          "subject_code": "MATH",
          "subject_name": "Toán học",
          "scores": [
            { "type": "ORAL_TEST", "label": "Kiểm tra miệng", "value": 9.0 },
            { "type": "TEST_15P", "label": "Kiểm tra 15 phút", "value": 8.5 },
            { "type": "MID_TERM", "label": "Thi Giữa kỳ", "value": 9.5 }
          ]
        },
        {
          "subject_code": "LIT",
          "subject_name": "Tiếng Việt",
          "scores": [
            { "type": "ORAL_TEST", "label": "Đọc bài cũ", "value": 8.0 },
            { "type": "TEST_15P", "label": "Chính tả 15 phút", "value": 9.0 }
          ]
        }
      ]
    }
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT04_Students_TC04 : PHỤ HUYNH XEM SỔ LIÊN LẠC NHẬN XÉT CỦA CON THEO HỌC KỲ

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Phụ huynh đã đăng nhập và có quyền xem thông tin học sinh `stu_01`.
  - Giáo viên đã gửi nhận xét đánh giá trong học kỳ.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_phu_huynh>`
  - **Tham số đường dẫn (Path Params JSON):**

  ```json
  {
    "id": "stu_01"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` của phụ huynh vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/students/stu_01/remarks`.
  3. Bấm nút **Gửi (Send)** để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": true,
    "status_code": 200,
    "data": {
      "student_id": "stu_01",
      "remarks": [
        {
          "id": "rmk_9912",
          "teacher_name": "Nguyễn Thị Lan",
          "subject_name": "Toán học",
          "content": "Em Nam tiếp thu bài rất nhanh...",
          "parent_acknowledged": true,
          "created_at": "2026-09-23T10:15:00.000Z"
        }
      ]
    }
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT04_Students_TC05 : TRA CỨU TÌNH TRẠNG NỘP HỌC PHÍ VÀ BẢO HIỂM Y TẾ (BHYT)

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Phụ huynh đăng nhập và tra cứu học phí, bảo hiểm của học sinh `stu_01`.
  - Bản ghi tình trạng đóng phí đã tồn tại trong cơ sở dữ liệu.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_phu_huynh>`
  - **Tham số đường dẫn (Path Params JSON):**

  ```json
  {
    "id": "stu_01"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` của phụ huynh vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/students/stu_01/fees-insurance`.
  3. Bấm nút **Gửi (Send)** để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": true,
    "status_code": 200,
    "data": {
      "student_id": "stu_01",
      "academic_year": "2026-2027",
      "is_paid_insurance": true,
      "insurance_paid_at": "2026-09-10T08:30:00.000Z",
      "is_paid_tuition": false,
      "tuition_due_date": "2026-10-05"
    }
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT04_Students_TC06 : PHỤ HUYNH THEO DÕI LỊCH SỬ CHUYÊN CẦN VÀ CÁC BUỔI NGHỈ HỌC CỦA CON

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Phụ huynh đã đăng nhập và có quyền giám hộ học sinh `stu_01`.
  - Dữ liệu điểm danh tháng 09/2026 của học sinh đã được giáo viên ghi nhận trên hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_phu_huynh>`
  - **Tham số đường dẫn (Path Params):** `id = "stu_01"`
  - **Tham số truy vấn (Query Params):** `month = "2026-09"`
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` của phụ huynh vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/students/stu_01/attendance?month=2026-09`.
  3. Bấm nút **Gửi (Send)** để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": true,
    "status_code": 200,
    "data": {
      "student_id": "stu_01",
      "full_name": "Trần Bảo Nam",
      "month": "2026-09",
      "total_school_days": 22,
      "present_days": 21,
      "absent_excused": 1,
      "absent_unexcused": 0,
      "late_days": 0,
      "absent_details": [
        {
          "date": "2026-09-18",
          "status": "EXCUSED",
          "reason": "Phụ huynh gửi đơn xin nghỉ ốm"
        }
      ]
    }
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT04_Students_TC07 : PHỤ HUYNH XEM DANH SÁCH LỜI NHẮC LỊCH KIỂM TRA SẮP TỚI CỦA LỚP

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Phụ huynh có quyền giám hộ học sinh `stu_01` thuộc lớp `cls_1a_2026`.
  - Giáo viên bộ môn Toán đã đăng thông báo dặn dò ôn thi kiểm tra 15 phút.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_phu_huynh>`
  - **Tham số đường dẫn (Path Params):** `id = "stu_01"`
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập URL: `/api/v1/students/stu_01/exam-reminders`.
  3. Bấm nút **Gửi (Send)** để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": true,
    "status_code": 200,
    "data": [
      {
        "reminder_id": "exm_rem_001",
        "subject_name": "Toán học",
        "exam_type": "TEST_15P",
        "exam_date": "2026-10-02",
        "instructions": "Ôn tập kỹ bài 12 và 13: Phép cộng phân số cùng mẫu số và làm bài tập trang 45",
        "created_at": "2026-09-28T07:00:00.000Z"
      }
    ]
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT04_Students_TC08 : TỪ CHỐI YÊU CẦU KHI MÃ HỌC SINH KHÔNG TỒN TẠI TRONG HỆ THỐNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Phụ huynh đã đăng nhập vào hệ thống.
  - Mã định danh học sinh `stu_nonexistent_9999` không tồn tại trong collection `/students`.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_phu_huynh>`
  - **Tham số đường dẫn (Path Params):** `id = "stu_nonexistent_9999"`
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực vào **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/students/stu_nonexistent_9999`.
  3. Bấm nút **Gửi (Send)** để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 404,
    "error_code": "STUDENT_NOT_FOUND",
    "message": "Không tìm thấy hồ sơ học sinh trên hệ thống"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT04_Students_TC09 : TỪ CHỐI KHI LỌC HỌC KỲ SAI ĐỊNH DẠNG ENUM (SEMESTER = 3)

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Phụ huynh đã đăng nhập và tra cứu bảng điểm học sinh `stu_01`.
  - Tham số học kỳ gửi lên nằm ngoài danh mục quy định của năm học phổ thông (chỉ gồm kỳ 1 và kỳ 2).
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_phu_huynh>`
  - **Tham số đường dẫn & truy vấn:** `id = "stu_01"`, `semester = 3`
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực vào **Headers**.
  2. Gửi request `GET /api/v1/students/stu_01/academic?semester=3`.
  3. Bấm nút **Gửi (Send)** để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 400,
    "error_code": "COMMON_VALIDATION_ERROR",
    "message": "Tham số học kỳ không hợp lệ. Học kỳ chỉ chấp nhận giá trị 1 hoặc 2."
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT04_Students_TC10 : TỪ CHỐI KHI LỌC THÁNG CHUYÊN CẦN SAI QUY CÁCH (MONTH = "2026-15")

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Phụ huynh đã đăng nhập và tra cứu chuyên cần của học sinh `stu_01`.
  - Tham số tháng gửi lên có giá trị tháng không tồn tại trên lịch (`month = "2026-15"` hoặc `"2026-00"`).
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_phu_huynh>`
  - **Tham số đường dẫn & truy vấn:** `id = "stu_01"`, `month = "2026-15"`
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực vào **Headers**.
  2. Gửi request `GET /api/v1/students/stu_01/attendance?month=2026-15`.
  3. Bấm nút **Gửi (Send)** để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 400,
    "error_code": "COMMON_VALIDATION_ERROR",
    "message": "Định dạng tháng không hợp lệ. Tham số month phải có định dạng YYYY-MM với tháng từ 01 đến 12."
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT04_Students_TC11 : TỪ CHỐI THAO TÁC DO KHÔNG CÓ TOKEN XÁC THỰC HOẶC TOKEN ĐÃ HẾT HẠN (401 UNAUTHORIZED)

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Người dùng chưa đăng nhập hoặc Firebase ID Token đã quá hạn 1800 giây.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** Không truyền header `Authorization` hoặc `Authorization: Bearer <token_het_han>`
- **CÁC BƯỚC THỰC HIỆN:**

  1. Gửi request `GET /api/v1/students/stu_01` mà không kèm token hợp lệ.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 401,
    "error_code": "AUTH_UNAUTHORIZED",
    "message": "Phiên làm việc không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại."
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT04_Students_TC12 : XỬ LÝ TRẠNG THÁI RỖNG AN TOÀN KHI HỌC SINH MỚI CHƯA CÓ DỮ LIỆU ĐIỂM (EMPTY STATE - 200 OK)

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Học sinh `stu_02` mới chuyển trường hoặc mới nhập học đầu năm, chưa có bất kỳ cột điểm bài kiểm tra nào được công bố.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_phu_huynh>`
  - **Tham số đường dẫn (Path Params):** `id = "stu_02"`
  - **Tham số truy vấn (Query Params):** `semester = 1`
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực vào **Headers**.
  2. Gửi request `GET /api/v1/students/stu_02/academic?semester=1`.
  3. Bấm nút **Gửi (Send)** để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": true,
    "status_code": 200,
    "data": {
      "student_id": "stu_02",
      "full_name": "Lê Ngọc Mai",
      "class_name": "1A",
      "semester": 1,
      "subjects": []
    }
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT04_Students_TC13 : XỬ LÝ LỖI HỆ THỐNG KHI CƠ SỞ DỮ LIỆU FIRESTORE MẤT KẾT NỐI HOẶC TIMEOUT (500 INTERNAL SERVER ERROR)

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Phụ huynh gửi yêu cầu tra cứu lý lịch học sinh hợp lệ.
  - Máy chủ Firestore Database bị ngắt kết nối đột ngột hoặc phản hồi quá thời gian chờ (Deadline Exceeded).
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_phu_huynh>`
  - **Tham số đường dẫn (Path Params):** `id = "stu_01"`
- **CÁC BƯỚC THỰC HIỆN:**

  1. Giả lập cơ sở dữ liệu Firestore ném ngoại lệ kết nối `DATABASE_UNAVAILABLE`.
  2. Gửi request `GET /api/v1/students/stu_01`.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 500,
    "error_code": "SYS_INTERNAL_ERROR",
    "message": "Hệ thống cơ sở dữ liệu tạm thời gián đoạn. Vui lòng thử lại sau giây lát."
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT04_Students_TC14 : XỬ LÝ TRẠNG THÁI RỖNG AN TOÀN KHI HỌC SINH CHƯA CÓ LỜI NHẬN XÉT NÀO TRONG SỔ LIÊN LẠC (EMPTY REMARKS - 200 OK)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Học sinh `stu_02` mới nhập học hoặc trong học kỳ 1 chưa có bất kỳ lời nhận xét nào từ GVCN hay GVBM trong cơ sở dữ liệu.
  - Phụ huynh đã đăng nhập và có quyền giám hộ học sinh này.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_phu_huynh>`
  - **Tham số đường dẫn (Path Params):** `id = "stu_02"`
  - **Tham số truy vấn (Query Params):** `semester = 1`
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền token vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/students/stu_02/remarks?semester=1`.
  3. Bấm nút **Gửi (Send)** để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Phản hồi kèm Header `X-Response-Time`.
  - Mảng nhận xét rỗng `remarks: []`, app hiển thị giao diện Empty State "Chưa có nhận xét nào trong học kỳ này":
  ```json
  {
    "success": true,
    "status_code": 200,
    "data": {
      "student_id": "stu_02",
      "semester": 1,
      "remarks": []
    }
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT04_Students_TC15 : XỬ LÝ TRẠNG THÁI AN TOÀN KHI HỌC SINH ĐI HỌC ĐẦY ĐỦ 100% KHÔNG CÓ BUỔI NGHỈ NÀO TRONG THÁNG (EMPTY ABSENCE - 200 OK)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Học sinh `stu_01` trong tháng `2026-09` đi học chuyên cần đầy đủ tất cả các buổi, không có bất kỳ bản ghi vắng mặt (`ABSENT`) nào trong Firestore.
  - Phụ huynh đã đăng nhập hợp lệ.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_phu_huynh>`
  - **Tham số đường dẫn & truy vấn:** `id = "stu_01"`, `month = "2026-09"`
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền token phụ huynh vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/students/stu_01/attendance?month=2026-09`.
  3. Bấm nút **Gửi (Send)** để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Mảng các buổi nghỉ rỗng `absent_dates: []`, tổng số buổi nghỉ `total_absent: 0`, tỷ lệ chuyên cần đạt 100%:
  ```json
  {
    "success": true,
    "status_code": 200,
    "data": {
      "student_id": "stu_01",
      "month": "2026-09",
      "total_sessions": 22,
      "total_absent": 0,
      "attendance_rate": 100,
      "absent_dates": []
    }
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

