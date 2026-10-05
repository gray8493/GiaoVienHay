# TÀI LIỆU KỊCH BẢN KIỂM THỬ ĐƠN VỊ - PHÂN HỆ SỔ ĐIỂM & BẢNG XẾP HẠNG

# MÃ PHÂN HỆ: 06 - GRADEBOOK & ASSESSMENT MODULE

# CẤP ĐỘ KIỂM THỬ: KIỂM THỬ ĐƠN VỊ (UNIT TEST)

---

## 1. THÔNG TIN CHUNG

- **PHÂN HỆ HỆ THỐNG:** `06` - Phân hệ Quản lý Sổ điểm & Đánh giá học sinh
- **MÔ TẢ MODULE API:** Sổ điểm điện tử môn học (`GradesService`, `GradesController`)
- **TẬP TIN KIỂM THỬ:** `apps/api/src/modules/06-grades/grades.service.spec.ts`, `apps/api/src/modules/06-grades/grades.controller.spec.ts`
- **NGƯỜI THỰC HIỆN:** Thái Bảo
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

---

### UT06_Grades_TC02 : TỪ CHỐI VÀ CHẶN NHẬP ĐIỂM VƯỢT QUÁ THANG ĐIỂM 10

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Giáo viên đã đăng nhập hợp lệ vào hệ thống.
  - Lớp học mã `cls_1a_2026` và học sinh mã `stu_01` tồn tại trong hệ thống.
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
        "score_value": 12.0
      }
    ]
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` của giáo viên vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/grades/batch`.
  3. Thêm dữ liệu chứa điểm số sai (`score_value = 12.0`) vào phần **Body** định dạng JSON ở trên.
  4. Bấm nút **Gửi (Send)** để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 400,
    "error_code": "ACAD_SCORE_OUT_OF_RANGE",
    "message": "Điểm số phải nằm trong khoảng từ 0.0 đến 10.0."
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT06_Grades_TC03 : PHÊ DUYỆT CÔNG BỐ ĐIỂM CHO PHỤ HUYNH VÀ KÍCH HOẠT THÔNG BÁO ĐẨY

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Lớp `cls_1a_2026` đã lưu sẵn danh sách điểm môn `MATH` loại `TEST_15P` trong cơ sở dữ liệu với trạng thái chưa công bố (`is_published = false`).
  - Dịch vụ phát thông báo đẩy Firebase Cloud Messaging (FCM) ở trạng thái sẵn sàng.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "class_id": "cls_1a_2026",
    "subject_code": "MATH",
    "score_type": "TEST_15P",
    "semester": 1
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` của giáo viên vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/grades/publish`.
  3. Thêm dữ liệu công bố điểm vào phần **Body** định dạng `raw (application/json)` theo mẫu JSON ở trên.
  4. Bấm nút **Gửi (Send)** để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": true,
    "status_code": 200,
    "message": "Đã công bố điểm môn học tới phụ huynh",
    "data": {
      "notified_parents_count": 35,
      "published_at": "2026-09-27T10:00:00.000Z"
    }
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT06_Grades_TC04 : TRUY XUẤT BẢNG XẾP HẠNG VINH DANH HỌC SINH CÓ ĐIỂM SỐ CAO NHẤT

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Lớp học `cls_1a_2026` đã có đầy đủ dữ liệu điểm môn `MATH` học kỳ 1 trong bộ sưu tập `/scores`.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Tham số truy vấn (Query Params JSON):**

  ```json
  {
    "classId": "cls_1a_2026",
    "subject_code": "MATH",
    "semester": 1,
    "limit": 5
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` của giáo viên vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API kèm tham số: `/api/v1/grades/leaderboard/cls_1a_2026?subject_code=MATH&semester=1&limit=5`.
  3. Không cần truyền dữ liệu vào phần Body.
  4. Bấm nút **Gửi (Send)** để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": true,
    "status_code": 200,
    "data": {
      "subject_code": "MATH",
      "subject_name": "Toán học",
      "top_students": [
        { "rank": 1, "student_name": "Trần Bảo Nam", "score": 9.8, "badge": "GOLD" },
        { "rank": 2, "student_name": "Lê Ngọc Mai", "score": 9.5, "badge": "SILVER" },
        { "rank": 3, "student_name": "Hoàng Minh Khôi", "score": 9.2, "badge": "BRONZE" }
      ]
    }
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT06_Grades_TC05 : CHẶN VÀ TỪ CHỐI GIÁO VIÊN XEM BẢNG ĐIỂM LỚP KHÔNG ĐƯỢC PHÂN CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Giáo viên mang định danh `usr_teacher_other` đã đăng nhập nhưng **hoàn toàn không được phân công** giảng dạy hoặc làm chủ nhiệm tại lớp `cls_1a_2026`.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien_la>`
  - **Tham số truy vấn (Query Params JSON):**

  ```json
  {
    "classId": "cls_1a_2026",
    "subject_code": "MATH",
    "semester": 1
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` của giáo viên không có thẩm quyền vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/grades/class/cls_1a_2026?subject_code=MATH&semester=1`.
  3. Bấm nút **Gửi (Send)** để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 403,
    "error_code": "ACAD_NOT_ASSIGNED_TEACHER",
    "message": "Giáo viên chưa được phân công giảng dạy môn học này tại lớp."
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT06_Grades_TC06 : CẬP NHẬT ĐỒNG THỜI ĐIỂM THÀNH PHẦN CHO TOÀN BỘ LỚP HỌC (30 HỌC SINH CÙNG LÚC - BATCH UPDATE THÀNH CÔNG)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên bộ môn Toán đã đăng nhập hợp lệ với token quyền hạn `TEACHER_SUBJECT`.
  - Lớp `cls_1a_2026` có 30 học sinh (từ `stu_01` đến `stu_30`) trong cơ sở dữ liệu.
  - Giáo viên được phân công giảng dạy môn Toán cho lớp này.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "class_id": "cls_1a_2026",
    "subject_code": "MATH",
    "semester": 1,
    "score_type": "TEST_15P",
    "scores": [
      { "student_id": "stu_01", "score_value": 10.0, "teacher_comment": "Xuất sắc, điểm tuyệt đối" },
      { "student_id": "stu_02", "score_value": 9.5, "teacher_comment": "Làm bài rất tốt" },
      { "student_id": "stu_03", "score_value": 8.75, "teacher_comment": "Tính toán cẩn thận" },
      { "student_id": "stu_04", "score_value": 8.0, "teacher_comment": "Tốt" },
      { "student_id": "stu_05", "score_value": 7.5, "teacher_comment": "Cần chú ý câu hình học" },
      { "student_id": "stu_06", "score_value": 6.25, "teacher_comment": "Cần cố gắng hơn" },
      { "student_id": "stu_07", "score_value": 5.0, "teacher_comment": "Đạt yêu cầu cơ bản" },
      { "student_id": "stu_08", "score_value": 0.0, "teacher_comment": "Vắng thi không phép" },
      { "student_id": "stu_09", "score_value": 8.5 },
      { "student_id": "stu_10", "score_value": 9.0 },
      { "student_id": "stu_11", "score_value": 7.0 },
      { "student_id": "stu_12", "score_value": 8.25 },
      { "student_id": "stu_13", "score_value": 6.75 },
      { "student_id": "stu_14", "score_value": 9.75 },
      { "student_id": "stu_15", "score_value": 8.0 },
      { "student_id": "stu_16", "score_value": 7.5 },
      { "student_id": "stu_17", "score_value": 8.5 },
      { "student_id": "stu_18", "score_value": 6.5 },
      { "student_id": "stu_19", "score_value": 7.25 },
      { "student_id": "stu_20", "score_value": 8.0 },
      { "student_id": "stu_21", "score_value": 9.0 },
      { "student_id": "stu_22", "score_value": 8.5 },
      { "student_id": "stu_23", "score_value": 7.75 },
      { "student_id": "stu_24", "score_value": 8.25 },
      { "student_id": "stu_25", "score_value": 9.25 },
      { "student_id": "stu_26", "score_value": 6.0 },
      { "student_id": "stu_27", "score_value": 7.0 },
      { "student_id": "stu_28", "score_value": 8.5 },
      { "student_id": "stu_29", "score_value": 9.0 },
      { "student_id": "stu_30", "score_value": 10.0 }
    ]
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền `Authorization Token` của giáo viên vào **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn: `/api/v1/grades/batch`.
  3. Thêm payload chứa dữ liệu của đủ 30 học sinh vào phần **Body**.
  4. Bấm nút **Gửi (Send)** để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": true,
    "status_code": 200,
    "message": "Lưu bảng điểm thành phần thành công",
    "data": {
      "class_id": "cls_1a_2026",
      "subject_code": "MATH",
      "score_type": "TEST_15P",
      "updated_count": 30
    }
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT06_Grades_TC07 : TỪ CHỐI VÀ CHẶN NHẬP ĐIỂM SỐ ÂM (< 0.0)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên đã đăng nhập hợp lệ vào hệ thống.
  - Lớp học `cls_1a_2026` và học sinh `stu_01` tồn tại.
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
        "score_value": -1.5,
        "teacher_comment": "Nhập nhầm số âm"
      }
    ]
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực vào **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/grades/batch`.
  3. Gửi payload có `score_value = -1.5`.
  4. Bấm **Gửi (Send)** để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 400,
    "error_code": "ACAD_SCORE_OUT_OF_RANGE",
    "message": "Điểm số phải nằm trong khoảng từ 0.0 đến 10.0."
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT06_Grades_TC08 : TỪ CHỐI VÀ CHẶN NHẬP ĐIỂM BẰNG CHỮ CÁI THUẦN TÚY (STRING / TEXT)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên đã đăng nhập hợp lệ vào hệ thống.
  - Lớp học `cls_1a_2026` và học sinh `stu_01` tồn tại.
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
        "score_value": "muoi",
        "teacher_comment": "Nhập chữ thay vì số"
      }
    ]
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền `Authorization` Token vào **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn: `/api/v1/grades/batch`.
  3. Đặt trường `score_value` là chuỗi chữ cái `"muoi"` (hoặc `"A"`, `"Ten"`).
  4. Bấm **Gửi (Send)**.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 400,
    "error_code": "INVALID_DATA_TYPE",
    "message": "Trường score_value phải là kiểu số (number)"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT06_Grades_TC09 : TỪ CHỐI VÀ CHẶN NHẬP ĐIỂM CHỨA CHỮ CÁI VÀ SỐ LỘN XỘN (MALFORMED ALPHANUMERIC STRING)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên đã đăng nhập hợp lệ vào hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "class_id": "cls_1a_2026",
    "subject_code": "MATH",
    "semester": 1,
    "score_type": "TEST_15P",
    "scores": [
      {
        "student_id": "stu_01",
        "score_value": "9a",
        "teacher_comment": "Gõ nhầm phím chữ kèm số"
      }
    ]
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Gửi request `POST /api/v1/grades/batch`.
  2. Dữ liệu `score_value` chứa các biến thể gõ sai lộn xộn như `"9a"`, `"8.5xyz"`, `"0x1A"`, `"1e2"`.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 400,
    "error_code": "INVALID_SCORE_FORMAT",
    "message": "Định dạng điểm số không hợp lệ, không được chứa ký tự chữ cái lẫn lộn"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT06_Grades_TC10 : TỪ CHỐI VÀ CHẶN NHẬP ĐIỂM LÀ KÝ TỰ ĐẶC BIỆT BẬY BẠ VÀ MÃ ĐỘC INJECTION ("@@@", XSS SCRIPT, NOSQL PAYLOAD)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Người dùng gửi request có chứa các ký tự bậy bạ hoặc mã độc hại nhằm tấn công ứng dụng.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "class_id": "cls_1a_2026",
    "subject_code": "MATH",
    "semester": 1,
    "score_type": "TEST_15P",
    "scores": [
      {
        "student_id": "stu_01",
        "score_value": "@@@",
        "teacher_comment": "<script>alert('XSS')</script>"
      }
    ]
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Gửi request `POST /api/v1/grades/batch`.
  2. `score_value` mang giá trị bậy bạ `"@@@"` (hoặc các ký tự lạ `#!$%^&*()`, emoji `😀👻`).
  3. `teacher_comment` mang payload mã script độc hại.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 400,
    "error_code": "INVALID_INPUT_PAYLOAD",
    "message": "Dữ liệu nhập vào chứa ký tự đặc biệt không hợp lệ hoặc mã độc tiềm ẩn"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT06_Grades_TC11 : TỪ CHỐI VÀ CHẶN ĐỊNH DẠNG SỐ THẬP PHÂN SAI (NHIỀU DẤU CHẤM "7.5.5" HOẶC DÙNG DẤU PHẨY "8,5")

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên thao tác nhập điểm số thập phân nhưng sai quy cách dấu ngăn cách.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "class_id": "cls_1a_2026",
    "subject_code": "MATH",
    "semester": 1,
    "score_type": "TEST_1P",
    "scores": [
      {
        "student_id": "stu_01",
        "score_value": "7.5.5",
        "teacher_comment": "Nhập thừa dấu chấm thập phân"
      }
    ]
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Gửi request `POST /api/v1/grades/batch` với giá trị `"7.5.5"` hoặc `"8,5"` (dùng dấu phẩy theo thói quen tiếng Việt nhưng hệ thống chuẩn yêu cầu dấu chấm float).
  2. Bấm **Gửi (Send)**.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 400,
    "error_code": "INVALID_DECIMAL_FORMAT",
    "message": "Định dạng số thập phân không hợp lệ, chỉ chấp nhận định dạng số thực chuẩn (VD: 7.5)"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT06_Grades_TC12 : TỪ CHỐI VÀ CHẶN DỮ LIỆU VƯỢT QUÁ ĐỘ DÀI TỐI ĐA (LỜI PHÊ GIÁO VIÊN VƯỢT QUÁ 255 KÝ TỰ)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên gửi trường dữ liệu lời phê vượt quá giới hạn thiết kế của schema (tối đa 255 ký tự).
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
        "score_value": 8.0,
        "teacher_comment": "Nội dung lời phê lặp lại vượt quá 255 ký tự: Em tiếp thu bài nhanh, làm bài cẩn thận, tích cực xây dựng bài trên lớp, cần phát huy hơn nữa trong các tiết học sau để đạt kết quả xuất sắc toàn diện trong kỳ học này. Giáo viên rất khen ngợi tinh thần học tập của em..."
      }
    ]
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Nhập chuỗi văn bản dài hơn 255 ký tự vào trường `teacher_comment`.
  2. Gửi request `POST /api/v1/grades/batch`.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 400,
    "error_code": "COMMON_VALIDATION_ERROR",
    "message": "Nội dung lời phê vượt quá giới hạn độ dài cho phép"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT06_Grades_TC13 : ĐẢM BẢO TÍNH NGUYÊN TỐ (TRANSACTION ROLLBACK / ATOMICITY) KHI BATCH 30 HỌC SINH CÓ 1 HỌC SINH LỖI ĐIỂM

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên cập nhật điểm một lần cho toàn lớp 30 học sinh.
  - 29 học sinh có dữ liệu hoàn toàn hợp lệ, riêng học sinh thứ 15 bị gõ nhầm điểm số sai (ví dụ `score_value = 15.0` hoặc `"@@@"`).
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "class_id": "cls_1a_2026",
    "subject_code": "MATH",
    "semester": 1,
    "score_type": "TEST_15P",
    "scores": [
      { "student_id": "stu_01", "score_value": 9.0 },
      { "student_id": "stu_02", "score_value": 8.5 },
      "...",
      { "student_id": "stu_15", "score_value": 15.0, "teacher_comment": "Gõ nhầm số vượt quá 10" },
      "...",
      { "student_id": "stu_30", "score_value": 7.5 }
    ]
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Gửi request batch gồm 30 phần tử lên API `/api/v1/grades/batch`.
  2. Theo dõi phản hồi và kiểm tra trạng thái collection `/scores` trong Firestore.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 400,
    "error_code": "BATCH_VALIDATION_FAILED",
    "message": "Cập nhật thất bại do học sinh stu_15 có điểm số 15.0 không hợp lệ. Đã hủy bỏ toàn bộ phiên cập nhật.",
    "invalid_index": 14,
    "student_id": "stu_15"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT06_Grades_TC14 : TỪ CHỐI YÊU CẦU THIẾU CÁC TRƯỜNG DỮ LIỆU BẮT BUỘC HOẶC MẢNG ĐIỂM RỖNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên gửi request thiếu các trường bắt buộc theo DTO schema (`class_id`, `subject_code`, `semester`, `score_type`, `scores`).
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "class_id": "cls_1a_2026",
    "semester": 1,
    "scores": []
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Gửi request `POST /api/v1/grades/batch` với phần thân thiếu `subject_code`, thiếu `score_type` và mảng `scores` rỗng.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 400,
    "error_code": "COMMON_VALIDATION_ERROR",
    "message": "Dữ liệu không hợp lệ",
    "errors": [
      "subject_code không được để trống",
      "score_type không được để trống",
      "scores phải chứa ít nhất 1 học sinh"
    ]
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT06_Grades_TC15 : TỪ CHỐI LOẠI ĐIỂM (SCORE_TYPE) HOẶC HỌC KỲ (SEMESTER) SAI ĐỊNH DẠNG ENUM

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên gửi `score_type` không thuộc danh mục cho phép hoặc `semester` ngoài kỳ 1, 2.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "class_id": "cls_1a_2026",
    "subject_code": "MATH",
    "semester": 3,
    "score_type": "EXTRA_SPECIAL_TEST",
    "scores": [
      {
        "student_id": "stu_01",
        "score_value": 8.0
      }
    ]
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Gửi request với `score_type = "EXTRA_SPECIAL_TEST"` (quy định chỉ có `ORAL_TEST, QUIZ, TEST_15P, TEST_1P, MID_TERM, FINAL`).
  2. Trường `semester = 3` (năm học phổ thông chỉ gồm kỳ 1 và kỳ 2).
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 400,
    "error_code": "INVALID_ENUM_VALUE",
    "message": "Loại điểm hoặc học kỳ không hợp lệ. score_type phải thuộc [ORAL_TEST, QUIZ, TEST_15P, TEST_1P, MID_TERM, FINAL], semester phải là 1 hoặc 2."
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT06_Grades_TC16 : NHẬP VÀ XỬ LÝ HỢP LỆ ĐIỂM SỐ 0.0 (ĐIỂM LIỆT / VẮNG THI CÓ LÝ DO - TRÁNH LỖI FALSY CHECK TRONG JS)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên đã đăng nhập hợp lệ vào hệ thống.
  - Lớp học `cls_1a_2026` và học sinh `stu_01` tồn tại trong cơ sở dữ liệu.
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
        "score_value": 0.0,
        "teacher_comment": "Vắng kiểm tra miệng không phép"
      }
    ]
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Gửi request `POST /api/v1/grades/batch` với `score_value = 0.0`.
  2. Bấm nút **Gửi (Send)**.
- **KẾT QUẢ MONG ĐỢI:**

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

---

### UT06_Grades_TC17 : TỪ CHỐI VÀ CHẶN SỬA ĐIỂM ÂM THẦM KHI CỘT ĐIỂM ĐÃ CÔNG BỐ MÀ THIẾU LÝ DO ĐÍNH CHÍNH

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Cột điểm 15 phút (`TEST_15P`) môn Toán của lớp `cls_1a_2026` đã được giáo viên công bố tới phụ huynh (`is_published = true`).
  - Học sinh `stu_01` đã có điểm ban đầu là `7.0`.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "class_id": "cls_1a_2026",
    "subject_code": "MATH",
    "semester": 1,
    "score_type": "TEST_15P",
    "scores": [
      {
        "student_id": "stu_01",
        "score_value": 8.5
      }
    ]
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Gửi request `POST /api/v1/grades/batch` nhằm thay đổi điểm của `stu_01` mà không đính kèm lý do đính chính (`teacher_comment` hoặc `correction_reason` bị để trống/null).
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 400,
    "error_code": "CORRECTION_REASON_REQUIRED",
    "message": "Cột điểm TEST_15P đã được công bố cho phụ huynh. Việc điều chỉnh điểm số bắt buộc phải cung cấp lý do đính chính rõ ràng để thông báo tới phụ huynh."
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT06_Grades_TC18 : CẬP NHẬT ĐÍNH CHÍNH ĐIỂM SỐ ĐÃ CÔNG BỐ HỢP LỆ VÀ TỰ ĐỘNG GỬI THÔNG BÁO ĐẾN RIÊNG PHỤ HUYNH

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Cột điểm 15 phút (`TEST_15P`) môn Toán đã công bố cho phụ huynh (`is_published = true`).
  - Học sinh `stu_01` (Trần Bảo Nam) có điểm cũ là `7.0`.
  - Giáo viên phát hiện cộng sót điểm sau khi phúc khảo và thực hiện quy trình đính chính điểm.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "class_id": "cls_1a_2026",
    "subject_code": "MATH",
    "semester": 1,
    "score_type": "TEST_15P",
    "is_correction": true,
    "scores": [
      {
        "student_id": "stu_01",
        "score_value": 8.5,
        "teacher_comment": "Đính chính: Giáo viên cộng sót điểm câu 3b sau khi phúc khảo bài làm"
      }
    ]
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Gửi request `POST /api/v1/grades/batch` với cờ `is_correction = true` kèm điểm số mới và nội dung giải trình rõ ràng trong `teacher_comment`.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": true,
    "status_code": 200,
    "message": "Đính chính điểm số thành công và đã gửi thông báo cập nhật tới phụ huynh học sinh",
    "data": {
      "class_id": "cls_1a_2026",
      "subject_code": "MATH",
      "score_type": "TEST_15P",
      "student_id": "stu_01",
      "old_score": 7.0,
      "new_score": 8.5,
      "notified_parents_count": 1,
      "updated_at": "2026-09-27T10:30:00.000Z"
    }
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT06_Grades_TC19 : TỪ CHỐI CÔNG BỐ ĐIỂM KHI CỘT ĐIỂM CHƯA CÓ DỮ LIỆU ĐIỂM NÀO TRONG HỆ THỐNG (NO SCORES TO PUBLISH)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Cột điểm Cuối kỳ (`FINAL`) của lớp `cls_1a_2026` chưa được giáo viên nhập bất kỳ điểm số nào (bộ sưu tập `/scores` của cột này đang hoàn toàn rỗng).
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "class_id": "cls_1a_2026",
    "subject_code": "MATH",
    "score_type": "FINAL",
    "semester": 1
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Gửi request `POST /api/v1/grades/publish` để yêu cầu công bố cột điểm `FINAL`.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 400,
    "error_code": "NO_SCORES_TO_PUBLISH",
    "message": "Không thể công bố do chưa có dữ liệu điểm nào được nhập cho cột điểm FINAL"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT06_Grades_TC20 : XỬ LÝ AN TOÀN TRÁNH GỬI THÔNG BÁO TRÙNG LẶP KHI BẤM CÔNG BỐ ĐIỂM NHIỀU LẦN (IDEMPOTENCY / ALREADY PUBLISHED)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Cột điểm 1 tiết (`TEST_1P`) đã được công bố thành công trước đó (`is_published = true`).
  - Giáo viên vô tình hoặc cố ý bấm lại nút "Công bố điểm môn học" một lần nữa.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "class_id": "cls_1a_2026",
    "subject_code": "MATH",
    "score_type": "TEST_1P",
    "semester": 1
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Gửi request `POST /api/v1/grades/publish` lần thứ hai cho cột điểm đã được công bố.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": true,
    "status_code": 200,
    "message": "Cột điểm này đã được công bố từ trước. Không có thông báo mới nào cần gửi thêm.",
    "data": {
      "already_published": true,
      "notified_parents_count": 0,
      "published_at": "2026-09-27T08:30:00.000Z"
    }
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT06_Grades_TC21 : CÔNG BỐ ĐIỂM THÀNH CÔNG VỚI CƠ CHẾ CHỊU LỖI KHI DỊCH VỤ GOOGLE FCM GẶP SỰ CỐ TẠM THỜI (FCM FAULT-TOLERANCE)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Cột điểm kiểm tra 15 phút có dữ liệu điểm hợp lệ.
  - Cụm máy chủ dịch vụ thông báo Firebase Cloud Messaging (FCM) của Google gặp sự cố mạng hoặc phản hồi quá thời gian chờ (Deadline Exceeded).
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "class_id": "cls_1a_2026",
    "subject_code": "MATH",
    "score_type": "TEST_15P",
    "semester": 1
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Mocking dịch vụ FCM ném ra lỗi ngoại lệ `FirebaseMessagingError: UNAVAILABLE`.
  2. Gửi request `POST /api/v1/grades/publish`.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": true,
    "status_code": 200,
    "message": "Đã công bố điểm thành công. Dịch vụ thông báo phụ huynh đang gặp gián đoạn tạm thời và đã được đưa vào hàng đợi tự động thử lại.",
    "data": {
      "fcm_status": "QUEUED_FOR_RETRY",
      "published_at": "2026-09-27T10:15:00.000Z"
    }
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT06_Grades_TC22 : XEM SỔ ĐIỂM LỚP HỌC MỚI THÀNH LẬP CHƯA CÓ DỮ LIỆU ĐIỂM (EMPTY STATE HANDLING - HTTP 200)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Lớp học `cls_1a_2026` mới được tạo lập đầu năm học, đã có danh sách học sinh nhưng chưa có bất kỳ bài kiểm tra nào được nhập điểm.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Tham số truy vấn (Query Params):** `subject_code=MATH`, `semester=1`
- **CÁC BƯỚC THỰC HIỆN:**
  1. Gửi request `GET /api/v1/grades/class/cls_1a_2026?subject_code=MATH&semester=1`.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": true,
    "status_code": 200,
    "data": [
      {
        "student_id": "stu_01",
        "student_name": "Trần Bảo Nam",
        "scores": []
      },
      {
        "student_id": "stu_02",
        "student_name": "Lê Ngọc Mai",
        "scores": []
      }
    ]
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT06_Grades_TC23 : XỬ LÝ XẾP HẠNG ĐỒNG HẠNG (TIE-BREAK) TRÊN BẢNG XẾP HẠNG VINH DANH HỌC SINH

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Trong lớp `cls_1a_2026`, có 2 học sinh cùng đạt điểm tối đa `10.0` môn Toán (Trần Bảo Nam và Lê Ngọc Mai), học sinh thứ 3 đạt `9.5` (Hoàng Minh Khôi).
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Tham số truy vấn (Query Params):** `subject_code=MATH`, `semester=1`, `limit=5`
- **CÁC BƯỚC THỰC HIỆN:**
  1. Gửi request `GET /api/v1/grades/leaderboard/cls_1a_2026?subject_code=MATH&semester=1&limit=5`.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": true,
    "status_code": 200,
    "data": {
      "subject_code": "MATH",
      "subject_name": "Toán học",
      "top_students": [
        { "rank": 1, "student_name": "Trần Bảo Nam", "score": 10.0, "badge": "GOLD" },
        { "rank": 1, "student_name": "Lê Ngọc Mai", "score": 10.0, "badge": "GOLD" },
        { "rank": 3, "student_name": "Hoàng Minh Khôi", "score": 9.5, "badge": "BRONZE" }
      ]
    }
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT06_Grades_TC24 : TỪ CHỐI THAO TÁC DO KHÔNG CÓ TOKEN XÁC THỰC HOẶC TOKEN ĐÃ HẾT HẠN (401 UNAUTHORIZED)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Người dùng chưa đăng nhập hoặc token JWT đã quá hạn 1800 giây.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** Không truyền header `Authorization` hoặc `Authorization: Bearer <expired_token>`
  - **Dữ liệu thân (Body JSON):** Payload điểm hợp lệ.
- **CÁC BƯỚC THỰC HIỆN:**
  1. Gửi request `POST /api/v1/grades/batch` mà không có token hợp lệ.
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

### UT06_Grades_TC25 : CHẶN GIÁO VIÊN BỘ MÔN KHÁC TỰ Ý NHẬP ĐIỂM MÔN HỌC KHÔNG ĐƯỢC PHÂN CÔNG (403 FORBIDDEN)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên mang tài khoản `usr_teacher_literature` (chỉ được phân công dạy môn Ngữ văn `LIT` tại lớp `cls_1a_2026`).
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien_van>`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "class_id": "cls_1a_2026",
    "subject_code": "MATH",
    "semester": 1,
    "score_type": "FINAL",
    "scores": [
      {
        "student_id": "stu_01",
        "score_value": 9.0
      }
    ]
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Giáo viên môn Văn dùng token của mình gọi API cập nhật điểm môn Toán (`MATH`).
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 403,
    "error_code": "ACAD_NOT_ASSIGNED_TEACHER",
    "message": "Giáo viên chưa được phân công giảng dạy môn học này tại lớp."
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT06_Grades_TC26 : XỬ LÝ LỖI HỆ THỐNG KHI CƠ SỞ DỮ LIỆU FIRESTORE MẤT KẾT NỐI HOẶC TIMEOUT (500 INTERNAL SERVER ERROR)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Yêu cầu đầu vào của giáo viên hoàn toàn hợp lệ.
  - Kết nối giữa Backend API Server và Firestore DB Cluster bị ngắt quãng hoặc quá thời gian chờ (Deadline Exceeded / Connection Refused).
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Dữ liệu thân (Body JSON):** Dữ liệu bảng điểm hợp lệ của lớp.
- **CÁC BƯỚC THỰC HIỆN:**
  1. Giả lập (Mock) tầng Database Firestore ném lỗi kết nối `UNAVAILABLE` hoặc `DEADLINE_EXCEEDED`.
  2. Gửi request `POST /api/v1/grades/batch`.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 500,
    "error_code": "SYS_INTERNAL_ERROR",
    "message": "Lỗi máy chủ cơ sở dữ liệu nội bộ. Vui lòng thử lại sau giây lát."
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT06_Grades_TC27 : CHẶN NHẬP HOẶC CHỈNH SỬA ĐIỂM SỐ KHI HỌC KỲ ĐÃ KẾT THÚC HOẶC BỊ KHÓA SỔ (400 BAD REQUEST)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên bộ môn Toán đã đăng nhập hợp lệ và được phân công giảng dạy tại lớp `cls_1a_2026`.
  - Học kỳ 1 (`semester: 1`) đã kết thúc và được Quản trị viên (Admin/Hiệu trưởng) khóa sổ thành công (`semester_status: LOCKED` hoặc `is_closed: true`).
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "class_id": "cls_1a_2026",
    "subject_code": "MATH",
    "semester": 1,
    "score_type": "FINAL",
    "scores": [
      {
        "student_id": "stu_01",
        "score_value": 8.5,
        "teacher_comment": "Bổ sung điểm thi kết thúc học kỳ 1"
      }
    ]
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Giáo viên truyền mã xác thực vào **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/grades/batch`.
  3. Gửi payload cập nhật điểm vào học kỳ đã bị khóa sổ.
  4. Bấm nút **Gửi (Send)** để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 400,
    "error_code": "ACAD_SEMESTER_LOCKED",
    "message": "Học kỳ đã kết thúc, không thể chỉnh sửa điểm số."
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT06_Grades_TC28 : TỪ CHỐI YÊU CẦU KHI KHÔNG TÌM THẤY BẢN GHI ĐIỂM SỐ CỦA HỌC SINH (404 NOT FOUND)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên bộ môn đã đăng nhập hợp lệ với token phân quyền `TEACHER_SUBJECT`.
  - Bản ghi điểm cụ thể với mã `score_id = "scr_nonexistent_999"` không tồn tại trong collection `/scores` trên Firestore.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Đường dẫn API (Path Params):** `/api/v1/grades/scores/scr_nonexistent_999`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "score_value": 9.0,
    "correction_reason": "Đính chính do chấm phúc khảo"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Giáo viên truyền token xác thực hợp lệ vào **Headers**.
  2. Chọn phương thức **`PUT`**, nhập URL: `/api/v1/grades/scores/scr_nonexistent_999`.
  3. Gửi payload yêu cầu cập nhật bản ghi điểm.
  4. Bấm nút **Gửi (Send)** để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 404,
    "error_code": "GRADE_RECORD_NOT_FOUND",
    "message": "Không tìm thấy bản ghi điểm số của học sinh."
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT06_Grades_TC29 : CHẶN PHỤ HUYNH TRA CỨU BẢNG ĐIỂM MÔN HỌC CHƯA ĐƯỢC CÔNG BỐ (400 BAD REQUEST)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Phụ huynh đã đăng nhập hợp lệ vào ứng dụng với tài khoản `usr_parent_01` (liên kết với học sinh `stu_01` của lớp `cls_1a_2026`).
  - Giáo viên bộ môn Toán đã nhập điểm thi học kỳ (`FINAL`) nhưng **chưa phê duyệt công bố** (`is_published: false`).
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_phu_huynh>`
  - **Tham số truy vấn (Query Params):**

  ```json
  {
    "student_id": "stu_01",
    "subject_code": "MATH",
    "semester": 1,
    "score_type": "FINAL"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Phụ huynh truyền mã xác thực vào **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/grades/parent/lookup?student_id=stu_01&subject_code=MATH&semester=1&score_type=FINAL`.
  3. Bấm nút **Gửi (Send)** để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 400,
    "error_code": "GRADE_NOT_PUBLISHED",
    "message": "Bảng điểm môn học chưa được công bố tới phụ huynh."
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT06_Grades_TC30 : LẤY BẢNG ĐIỂM CHI TIẾT MÔN HỌC THEO LỚP VÀ HỌC KỲ THÀNH CÔNG (HTTP 200 OK)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên bộ môn Toán đã đăng nhập hợp lệ và được phân công giảng dạy tại lớp `cls_1a_2026`.
  - Lớp `cls_1a_2026` đã có sẵn dữ liệu các đầu điểm thành phần môn Toán học kỳ 1 trong cơ sở dữ liệu.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Tham số truy vấn (Query Params):** `subject_code=MATH`, `semester=1`
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của giáo viên vào **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/grades/class/cls_1a_2026?subject_code=MATH&semester=1`.
  3. Bấm nút **Gửi (Send)** để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": true,
    "status_code": 200,
    "data": {
      "class_id": "cls_1a_2026",
      "subject_code": "MATH",
      "semester": 1,
      "students": [
        {
          "student_id": "stu_01",
          "student_name": "Trần Bảo Nam",
          "scores": {
            "ORAL_TEST": [9.5],
            "TEST_15P": [8.5],
            "TEST_1P": [9.0],
            "MID_TERM": [8.5],
            "FINAL": [9.0]
          }
        },
        {
          "student_id": "stu_02",
          "student_name": "Lê Ngọc Mai",
          "scores": {
            "ORAL_TEST": [9.0],
            "TEST_15P": [9.0],
            "TEST_1P": [8.5],
            "MID_TERM": [9.0],
            "FINAL": [9.5]
          }
        }
      ]
    }
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT06_Grades_TC31 : TỪ CHỐI THAO TÁC KHI MÃ LỚP HỌC KHÔNG TỒN TẠI TRONG HỆ THỐNG (404 NOT FOUND)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên đã đăng nhập hợp lệ vào hệ thống.
  - Mã lớp học `class_id = "cls_nonexistent_999"` không tồn tại trong hệ thống trường học.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "class_id": "cls_nonexistent_999",
    "subject_code": "MATH",
    "semester": 1,
    "score_type": "ORAL_TEST",
    "scores": [
      {
        "student_id": "stu_01",
        "score_value": 8.5
      }
    ]
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Gửi request `POST /api/v1/grades/batch` với `class_id` không tồn tại.
  2. Bấm nút **Gửi (Send)** để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 404,
    "error_code": "CLASS_NOT_FOUND",
    "message": "Lớp học không tồn tại trong hệ thống."
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT06_Grades_TC32 : TỪ CHỐI LƯU BẢNG ĐIỂM KHI MÃ HỌC SINH KHÔNG THUỘC DANH SÁCH LỚP (404 NOT FOUND)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Lớp học `cls_1a_2026` tồn tại hợp lệ.
  - Học sinh có mã `stu_unknown_888` không thuộc danh sách học sinh của lớp này hoặc không tồn tại trong hệ thống.
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
        "student_id": "stu_unknown_888",
        "score_value": 8.0,
        "teacher_comment": "Nhập điểm cho học sinh không thuộc lớp"
      }
    ]
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Gửi request `POST /api/v1/grades/batch` chứa học sinh lạ không có tên trong lớp.
  2. Bấm nút **Gửi (Send)** để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 404,
    "error_code": "STUDENT_NOT_FOUND",
    "message": "Học sinh không tồn tại hoặc không thuộc danh sách lớp đã chọn."
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT06_Grades_TC33 : TỪ CHỐI CÔNG BỐ ĐIỂM KHI THIẾU CÁC TRƯỜNG DỮ LIỆU BẮT BUỘC (400 BAD REQUEST)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên đã đăng nhập hợp lệ vào hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "class_id": "cls_1a_2026"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/grades/publish`.
  2. Gửi payload thiếu `subject_code`, `score_type` và `semester`.
  3. Bấm nút **Gửi (Send)** để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 400,
    "error_code": "COMMON_VALIDATION_ERROR",
    "message": "Dữ liệu không hợp lệ. Vui lòng cung cấp đầy đủ class_id, subject_code, score_type và semester."
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT06_Grades_TC34 : XỬ LÝ TRẠNG THÁI RỖNG AN TOÀN KHI TRUY XUẤT BẢNG XẾP HẠNG VINH DANH CHƯA CÓ DỮ LIỆU ĐIỂM (EMPTY LEADERBOARD - 200 OK)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Lớp học `cls_1a_2026` chưa có bất kỳ cột điểm nào của môn `MATH` được nhập hoặc công bố trong học kỳ 1 (collection `/scores` không có bản ghi nào khớp).
  - Giáo viên bộ môn đã đăng nhập hợp lệ.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Tham số đường dẫn & truy vấn (Params):** `classId = cls_1a_2026`, `subject_code = MATH`, `semester = 1`, `limit = 5`
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền token xác thực của giáo viên vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/grades/leaderboard/cls_1a_2026?subject_code=MATH&semester=1&limit=5`.
  3. Bấm nút **Gửi (Send)** để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Phản hồi kèm Header `X-Response-Time`.
  - Dữ liệu trả về đúng cấu trúc danh sách rỗng an toàn, mảng học sinh vinh danh rỗng `top_students: []`, không bị lỗi chia cho 0 hoặc null pointer:
  ```json
  {
    "success": true,
    "status_code": 200,
    "message": "Truy xuất bảng xếp hạng vinh danh thành công",
    "data": {
      "class_id": "cls_1a_2026",
      "subject_code": "MATH",
      "subject_name": "Toán học",
      "semester": 1,
      "total_ranked": 0,
      "top_students": []
    },
    "timestamp": "2026-10-04T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT06_Grades_TC35 : XỬ LÝ TRẠNG THÁI RỖNG AN TOÀN KHI XEM SỔ ĐIỂM CỦA LỚP CHƯA CÓ HỌC SINH NÀO TRONG HỆ THỐNG (EMPTY CLASS - 200 OK)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Lớp học `cls_new_empty` vừa khởi tạo trên hệ thống và chưa có học sinh nào trong cơ sở dữ liệu.
  - Giáo viên bộ môn đã đăng nhập hợp lệ.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Tham số truy vấn (Query Params):** `subject_code = MATH`, `semester = 1`
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền token giáo viên vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/grades/class/cls_new_empty?subject_code=MATH&semester=1`.
  3. Bấm nút **Gửi (Send)** để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Mảng dữ liệu sổ điểm trả về rỗng an toàn `data: []`, giao diện hiển thị Empty State hướng dẫn thêm học sinh vào lớp trước khi nhập điểm:
  ```json
  {
    "success": true,
    "status_code": 200,
    "message": "Lấy sổ điểm chi tiết thành công",
    "data": [],
    "timestamp": "2026-10-04T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

