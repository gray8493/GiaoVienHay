# TÀI LIỆU KỊCH BẢN KIỂM THỬ ĐƠN VỊ - PHÂN HỆ SỔ ĐIỂM & BẢNG XẾP HẠNG

# MÃ PHÂN HỆ: 03 - GRADEBOOK & ASSESSMENT MODULE

# CẤP ĐỘ KIỂM THỬ: KIỂM THỬ ĐƠN VỊ (UNIT TEST)

---

## 1. THÔNG TIN CHUNG

- **PHÂN HỆ HỆ THỐNG:** `03` - Phân hệ Quản lý Sổ điểm & Đánh giá học sinh
- **MÔ TẢ MODULE API:** Sổ điểm điện tử môn học (`GradesService`, `GradesController`)
- **TẬP TIN KIỂM THỬ:** `src/grades/grades.service.spec.ts`, `src/grades/grades.controller.spec.ts`
- **MÔI TRƯỜNG KIỂM THỬ:** Isolated Unit Testing (Mock Firestore, Mock FCM Push Notification, Mock Redis)

### BẢNG TỔNG HỢP MA TRẬN KỊCH BẢN KIỂM THỬ (TEST MATRIX)

| Mã Testcase | Phân Loại (Category) | Tên Kịch Bản | Dữ Liệu Đầu Vào Chính | Kết Quả Mong Đợi (HTTP / Mã Lỗi) |
| :--- | :--- | :--- | :--- | :--- |
| **UT03_Grades_TC01** | Happy Path (1 HS) | Nhập điểm thành phần cho 1 học sinh thành công | `score_value = 9.5` (số dương thập phân) | **HTTP 200** (OK, updated_count: 1) |
| **UT03_Grades_TC02** | Validation (Range) | Chặn nhập điểm vượt quá thang điểm 10 (> 10) | `score_value = 12.0` | **HTTP 400** (`INVALID_SCORE_VALUE`) |
| **UT03_Grades_TC03** | Happy Path (Publish) | Phê duyệt công bố điểm cho phụ huynh & gửi FCM | `score_type = TEST_15P`, `is_published: true` | **HTTP 200** (OK, notified_parents_count: 35) |
| **UT03_Grades_TC04** | Happy Path (Rank) | Truy xuất bảng xếp hạng Top học sinh điểm cao | `limit = 5`, `class_id = cls_1a_2026` | **HTTP 200** (Trả về Top vinh danh có Badge) |
| **UT03_Grades_TC05** | Security (RBAC) | Chặn giáo viên xem bảng điểm lớp không được phân công | Token giáo viên lớp khác | **HTTP 403** (`FORBIDDEN_CLASS_ACCESS`) |
| **UT03_Grades_TC06** | Happy Path (Batch) | Cập nhật điểm đồng thời cho 30 học sinh cùng lúc | Mảng 30 học sinh, điểm từ `0.0` đến `10.0` | **HTTP 200** (OK, updated_count: 30) |
| **UT03_Grades_TC07** | Validation (Range) | Chặn nhập điểm là số âm (< 0.0) | `score_value = -1.5` | **HTTP 400** (`INVALID_SCORE_RANGE`) |
| **UT03_Grades_TC08** | Validation (Data Type) | Chặn nhập điểm bằng chữ cái thuần túy | `score_value = "muoi"` hoặc `"A"` | **HTTP 400** (`INVALID_DATA_TYPE`) |
| **UT03_Grades_TC09** | Validation (Format) | Chặn nhập điểm chữ và số lộn xộn không đúng định dạng | `score_value = "9a"`, `"8.5xyz"`, `"0x1A"` | **HTTP 400** (`INVALID_SCORE_FORMAT`) |
| **UT03_Grades_TC10** | Security / Sanitization | Chặn nhập điểm là ký tự lạ bậy bạ, XSS, NoSQL injection | `score_value = "@@@"`, comment chèn `<script>` | **HTTP 400** (`INVALID_INPUT_PAYLOAD`) |
| **UT03_Grades_TC11** | Validation (Decimal) | Chặn số thập phân sai chuẩn (nhiều dấu chấm hoặc dấu phẩy) | `score_value = "7.5.5"` hoặc `"8,5"` | **HTTP 400** (`INVALID_DECIMAL_FORMAT`) |
| **UT03_Grades_TC12** | Boundary (MaxLength) | Chặn dữ liệu vượt quá độ dài tối đa (lời phê > 500 ký tự) | `teacher_comment` dài hơn 1000 ký tự | **HTTP 400** (`MAX_LENGTH_EXCEEDED`) |
| **UT03_Grades_TC13** | Integrity / Atomicity | Đảm bảo tính nguyên tố Rollback khi batch 30 hs có 1 hs lỗi | 29 hs hợp lệ, hs thứ 15 có `score_value = 15.0` | **HTTP 400** (`BATCH_VALIDATION_FAILED`, Rollback 100%) |
| **UT03_Grades_TC14** | Validation (Required) | Chặn yêu cầu thiếu trường bắt buộc hoặc mảng điểm rỗng | Thiếu `subject_code`, `scores: []` | **HTTP 400** (`MISSING_REQUIRED_FIELDS`) |
| **UT03_Grades_TC15** | Validation (Enum) | Chặn `score_type` hoặc `semester` sai quy định enum | `score_type = "EXTRA_TEST"`, `semester = 3` | **HTTP 400** (`INVALID_ENUM_VALUE`) |
| **UT03_Grades_TC16** | Edge Case (Falsy) | Nhập và xử lý hợp lệ điểm số 0.0 (Điểm liệt / Vắng thi) | `score_value = 0.0` | **HTTP 200** (OK, lưu đúng 0.0) |
| **UT03_Grades_TC17** | Business (Locking) | Chặn sửa điểm âm thầm khi cột điểm đã công bố mà thiếu lý do đính chính | Điểm đã công bố, thiếu `correction_reason` | **HTTP 400** (`CORRECTION_REASON_REQUIRED`) |
| **UT03_Grades_TC18** | Business (Correction) | Cập nhật đính chính điểm số đã công bố hợp lệ & gửi thông báo riêng phụ huynh | Sửa từ 7.0 lên 8.5 kèm lý do phúc khảo | **HTTP 200** (OK, `notified_parents_count: 1`) |
| **UT03_Grades_TC19** | Business (Validation) | Từ chối công bố điểm khi cột điểm chưa có dữ liệu điểm nào | Cột điểm chưa có bất kỳ học sinh nào có điểm | **HTTP 400** (`NO_SCORES_TO_PUBLISH`) |
| **UT03_Grades_TC20** | Idempotency (Spam) | Xử lý an toàn khi bấm công bố điểm nhiều lần liên tiếp | Cột điểm đã công bố trước đó | **HTTP 200** (Không gửi trùng FCM spam phụ huynh) |
| **UT03_Grades_TC21** | Fault Tolerance | Công bố điểm thành công khi dịch vụ Google FCM sự cố | Mock FCM `UNAVAILABLE` / Timeout | **HTTP 200** (`FCM_QUEUED_RETRY`, điểm vẫn công bố) |
| **UT03_Grades_TC22** | Edge Case (Empty) | Xem sổ điểm lớp học mới chưa có dữ liệu điểm | Lớp mới tạo đầu năm, chưa có bản ghi điểm | **HTTP 200** (Trả về `scores: []`, không crash 500) |
| **UT03_Grades_TC23** | Business (Tie-break) | Xử lý xếp hạng đồng hạng trên Bảng xếp hạng vinh danh | 2 học sinh cùng đạt 10.0, học sinh thứ 3 đạt 9.5 | **HTTP 200** (Cùng nhận Rank 1 & GOLD, hs tiếp Rank 3) |
| **UT03_Grades_TC24** | Security (Auth) | Từ chối yêu cầu không có token hoặc token đã hết hạn | Thiếu header `Authorization` hoặc token hết hạn | **HTTP 401** (`UNAUTHORIZED_ACCESS`) |
| **UT03_Grades_TC25** | Security (RBAC) | Chặn giáo viên bộ môn khác tự ý nhập điểm môn không dạy | Giáo viên Văn nhập điểm môn Toán | **HTTP 403** (`FORBIDDEN_TEACHER_ASSIGNMENT`) |
| **UT03_Grades_TC26** | System Fault Tolerance | Xử lý lỗi khi cơ sở dữ liệu Firestore timeout / mất kết nối | Mock Firestore `DEADLINE_EXCEEDED` | **HTTP 500** (`DATABASE_SERVICE_UNAVAILABLE`) |

---

## 2. CHI TIẾT CÁC KỊCH BẢN KIỂM THỬ ĐƠN VỊ

---

### UT03_Grades_TC01 : NHẬP BẢNG ĐIỂM THÀNH PHẦN CHO HỌC SINH THÀNH CÔNG

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

  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Cập nhật thành công 1 bản ghi điểm vào cơ sở dữ liệu Firestore.
  - Dữ liệu trả về đúng định dạng JSON chuẩn như sau:

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

### UT03_Grades_TC02 : TỪ CHỐI VÀ CHẶN NHẬP ĐIỂM VƯỢT QUÁ THANG ĐIỂM 10

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

  - Hệ thống ném ra ngoại lệ yêu cầu không hợp lệ **HTTP 400 (BAD REQUEST - YÊU CẦU SAI)**.
  - Tuyệt đối không ghi dữ liệu sai vào Firestore.
  - Dữ liệu lỗi trả về đúng định dạng JSON như sau:

  ```json
  {
    "success": false,
    "status_code": 400,
    "error_code": "INVALID_SCORE_VALUE",
    "message": "Điểm số phải trong khoảng từ 0.0 đến 10.0"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT03_Grades_TC03 : PHÊ DUYỆT CÔNG BỐ ĐIỂM CHO PHỤ HUYNH VÀ KÍCH HOẠT THÔNG BÁO ĐẨY

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

  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Cờ `is_published` được cập nhật thành `true` và kích hoạt thông báo FCM tới phụ huynh.
  - Dữ liệu trả về đúng định dạng JSON chuẩn như sau:

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

### UT03_Grades_TC04 : TRUY XUẤT BẢNG XẾP HẠNG VINH DANH HỌC SINH CÓ ĐIỂM SỐ CAO NHẤT

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

  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Danh sách học sinh được sắp xếp giảm dần theo điểm và tự động phân bổ huy hiệu Vàng, Bạc, Đồng.
  - Dữ liệu trả về đúng định dạng JSON chuẩn như sau:

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

### UT03_Grades_TC05 : CHẶN VÀ TỪ CHỐI GIÁO VIÊN XEM BẢNG ĐIỂM LỚP KHÔNG ĐƯỢC PHÂN CÔNG

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

  - Hệ thống ném ra ngoại lệ từ chối quyền truy cập **HTTP 403 (FORBIDDEN - CẤM TRUY CẬP)**.
  - Dữ liệu lỗi trả về đúng định dạng JSON như sau:

  ```json
  {
    "success": false,
    "status_code": 403,
    "error_code": "FORBIDDEN_CLASS_ACCESS",
    "message": "Giáo viên không có quyền truy cập bảng điểm lớp này"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT03_Grades_TC06 : CẬP NHẬT ĐỒNG THỜI ĐIỂM THÀNH PHẦN CHO TOÀN BỘ LỚP HỌC (30 HỌC SINH CÙNG LÚC - BATCH UPDATE THÀNH CÔNG)

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
  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Cả 30 bản ghi điểm được ghi nhận chính xác trong một Database Transaction duy nhất.
  - Bao phủ toàn diện các thang điểm hợp lệ: điểm cực cận `0.0`, điểm tối đa `10.0`, điểm nguyên `8.0`, điểm thập phân lẻ `8.75`, `6.25`.
  - Dữ liệu trả về đúng chuẩn JSON:

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

### UT03_Grades_TC07 : TỪ CHỐI VÀ CHẶN NHẬP ĐIỂM SỐ ÂM (< 0.0)

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
  - Hệ thống ném ngoại lệ kiểm tra tính hợp lệ **HTTP 400 (BAD REQUEST)**.
  - Điểm số không được ghi vào cơ sở dữ liệu.
  - Dữ liệu trả về:

  ```json
  {
    "success": false,
    "status_code": 400,
    "error_code": "INVALID_SCORE_RANGE",
    "message": "Điểm số không được nhỏ hơn 0.0 hoặc lớn hơn 10.0"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT03_Grades_TC08 : TỪ CHỐI VÀ CHẶN NHẬP ĐIỂM BẰNG CHỮ CÁI THUẦN TÚY (STRING / TEXT)

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
  - Hệ thống ném ngoại lệ sai kiểu dữ liệu **HTTP 400 (BAD REQUEST)**.
  - Bộ tiền xử lý Validation Pipe chặn ngay tại tầng Controller.
  - Dữ liệu trả về:

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

### UT03_Grades_TC09 : TỪ CHỐI VÀ CHẶN NHẬP ĐIỂM CHỨA CHỮ CÁI VÀ SỐ LỘN XỘN (MALFORMED ALPHANUMERIC STRING)

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
  - Hệ thống ném ngoại lệ **HTTP 400 (BAD REQUEST)**.
  - Chặn triệt để việc ép kiểu tự động sai lệch (implicit type coercion) trong Javascript/Node.js.
  - Dữ liệu trả về:

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

### UT03_Grades_TC10 : TỪ CHỐI VÀ CHẶN NHẬP ĐIỂM LÀ KÝ TỰ ĐẶC BIỆT BẬY BẠ VÀ MÃ ĐỘC INJECTION ("@@@", XSS SCRIPT, NOSQL PAYLOAD)

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
  - Hệ thống ném ngoại lệ kiểm duyệt an ninh **HTTP 400 (BAD REQUEST)**.
  - Dữ liệu bị bộ lọc đầu vào Sanitize/Validation reject hoàn toàn, không thực thi script, không lưu ký tự rác.
  - Dữ liệu trả về:

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

### UT03_Grades_TC11 : TỪ CHỐI VÀ CHẶN ĐỊNH DẠNG SỐ THẬP PHÂN SAI (NHIỀU DẤU CHẤM "7.5.5" HOẶC DÙNG DẤU PHẨY "8,5")

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
  - Hệ thống phản hồi **HTTP 400 (BAD REQUEST)**.
  - Từ chối parse chuỗi sai chuẩn số học.
  - Dữ liệu trả về:

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

### UT03_Grades_TC12 : TỪ CHỐI VÀ CHẶN DỮ LIỆU VƯỢT QUÁ ĐỘ DÀI TỐI ĐA (MAXLENGTH - LỜI PHÊ GIÁO VIÊN HOẶC CHUỖI ĐIỂM TRÀN SỐ)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên gửi trường dữ liệu chuỗi ghi chú vượt quá giới hạn thiết kế của schema (tối đa 500 ký tự).
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
        "teacher_comment": "Nội dung lời phê lặp lại hơn 1000 ký tự: AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA..."
      }
    ]
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Nhập chuỗi văn bản dài hơn 500 ký tự vào trường `teacher_comment` (hoặc chuỗi số float dài hơn 100 chữ số gây buffer overflow).
  2. Gửi request `POST /api/v1/grades/batch`.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống ném ngoại lệ **HTTP 400 (BAD REQUEST)**.
  - Ngăn ngừa tình trạng phình to bộ nhớ database và tấn công làm nghẽn bộ nhớ đệm (Buffer Bloat).
  - Dữ liệu trả về:

  ```json
  {
    "success": false,
    "status_code": 400,
    "error_code": "MAX_LENGTH_EXCEEDED",
    "message": "Lời phê của giáo viên không được vượt quá 500 ký tự"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT03_Grades_TC13 : ĐẢM BẢO TÍNH NGUYÊN TỐ (TRANSACTION ROLLBACK / ATOMICITY) KHI BATCH 30 HỌC SINH CÓ 1 HỌC SINH LỖI ĐIỂM

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
  - Hệ thống trả về mã lỗi **HTTP 400 (BAD REQUEST)**.
  - Toàn bộ Transaction cơ sở dữ liệu bị **Rollback 100%**: Tuyệt đối không ghi nhận điểm của bất kỳ học sinh nào (kể cả 29 học sinh hợp lệ trước đó) nhằm tránh tính trạng bất toàn dữ liệu (Partial Update Inconsistency).
  - Dữ liệu trả về chỉ rõ vị trí và nguyên nhân lỗi:

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

### UT03_Grades_TC14 : TỪ CHỐI YÊU CẦU THIẾU CÁC TRƯỜNG DỮ LIỆU BẮT BUỘC HOẶC MẢNG ĐIỂM RỖNG

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
  - Hệ thống phản hồi **HTTP 400 (BAD REQUEST)**.
  - Báo lỗi rõ ràng danh sách các trường bị thiếu.
  - Dữ liệu trả về:

  ```json
  {
    "success": false,
    "status_code": 400,
    "error_code": "MISSING_REQUIRED_FIELDS",
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

### UT03_Grades_TC15 : TỪ CHỐI LOẠI ĐIỂM (SCORE_TYPE) HOẶC HỌC KỲ (SEMESTER) SAI ĐỊNH DẠNG ENUM

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
  - Hệ thống phản hồi **HTTP 400 (BAD REQUEST)**.
  - Dữ liệu trả về:

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

### UT03_Grades_TC16 : NHẬP VÀ XỬ LÝ HỢP LỆ ĐIỂM SỐ 0.0 (ĐIỂM LIỆT / VẮNG THI CÓ LÝ DO - TRÁNH LỖI FALSY CHECK TRONG JS)

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
  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Backend nhận diện chính xác `0.0` là một số thực hợp lệ (không bị câu lệnh kiểm tra `if (!score_value)` coi là giá trị rỗng/falsy rồi báo lỗi nhầm).
  - Bản ghi điểm được ghi nhận chính xác vào Firestore.
  - Dữ liệu trả về:

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

### UT03_Grades_TC17 : TỪ CHỐI VÀ CHẶN SỬA ĐIỂM ÂM THẦM KHI CỘT ĐIỂM ĐÃ CÔNG BỐ MÀ THIẾU LÝ DO ĐÍNH CHÍNH

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
  - Hệ thống từ chối cập nhật và trả về mã lỗi **HTTP 400 (BAD REQUEST)**.
  - Chặn triệt để hành vi âm thầm sửa điểm sau khi phụ huynh đã tiếp nhận thông tin nhằm đảm bảo tính minh bạch học đường.
  - Dữ liệu trả về:

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

### UT03_Grades_TC18 : CẬP NHẬT ĐÍNH CHÍNH ĐIỂM SỐ ĐÃ CÔNG BỐ HỢP LỆ VÀ TỰ ĐỘNG GỬI THÔNG BÁO ĐẾN RIÊNG PHỤ HUYNH

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
  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Điểm của học sinh `stu_01` trong Firestore được cập nhật từ `7.0` thành `8.5`.
  - Hệ thống tự động kích hoạt Notification Service gửi thông báo FCM đích danh tới **riêng phụ huynh của học sinh `stu_01`** (`notified_parents_count: 1`), hoàn toàn không làm phiền 29 phụ huynh còn lại trong lớp.
  - Dữ liệu trả về:

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

### UT03_Grades_TC19 : TỪ CHỐI CÔNG BỐ ĐIỂM KHI CỘT ĐIỂM CHƯA CÓ DỮ LIỆU ĐIỂM NÀO TRONG HỆ THỐNG (NO SCORES TO PUBLISH)

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
  - Hệ thống ném ngoại lệ nghiệp vụ **HTTP 400 (BAD REQUEST)**.
  - Ngăn ngừa việc hệ thống tự động phát thông báo "Đã có điểm mới" trống rỗng tới hàng chục phụ huynh học sinh.
  - Dữ liệu trả về:

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

### UT03_Grades_TC20 : XỬ LÝ AN TOÀN TRÁNH GỬI THÔNG BÁO TRÙNG LẶP KHI BẤM CÔNG BỐ ĐIỂM NHIỀU LẦN (IDEMPOTENCY / ALREADY PUBLISHED)

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
  - Hệ thống phản hồi **HTTP 200 (OK)** với cơ chế Idempotent: ghi nhận trạng thái đã hoàn tất.
  - Số lượng thông báo gửi mới là `0` (`notified_parents_count: 0`), tuyệt đối không gửi lại thông báo trùng lặp làm phiền ứng dụng di động của phụ huynh.
  - Dữ liệu trả về:

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

### UT03_Grades_TC21 : CÔNG BỐ ĐIỂM THÀNH CÔNG VỚI CƠ CHẾ CHỊU LỖI KHI DỊCH VỤ GOOGLE FCM GẶP SỰ CỐ TẠM THỜI (FCM FAULT-TOLERANCE)

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
  - Hệ thống bắt ngoại lệ FCM bằng khối `try-catch`, đảm bảo trạng thái `is_published = true` trong cơ sở dữ liệu Firestore vẫn được cập nhật thành công (không bị rollback nhầm).
  - Tác vụ bắn thông báo được chuyển vào hàng đợi nền (Background Retry Queue) để gửi lại sau.
  - Hệ thống trả về **HTTP 200 (OK)** thông báo rõ trạng thái để giáo viên yên tâm.
  - Dữ liệu trả về:

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

### UT03_Grades_TC22 : XEM SỔ ĐIỂM LỚP HỌC MỚI THÀNH LẬP CHƯA CÓ DỮ LIỆU ĐIỂM (EMPTY STATE HANDLING - HTTP 200)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Lớp học `cls_1a_2026` mới được tạo lập đầu năm học, đã có danh sách học sinh nhưng chưa có bất kỳ bài kiểm tra nào được nhập điểm.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Tham số truy vấn (Query Params):** `subject_code=MATH`, `semester=1`
- **CÁC BƯỚC THỰC HIỆN:**
  1. Gửi request `GET /api/v1/grades/class/cls_1a_2026?subject_code=MATH&semester=1`.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi **HTTP 200 (OK - THÀNH CÔNG)**.
  - Tuyệt đối không quăng lỗi `404 Not Found` hay crash lỗi mã nguồn `500 NullPointerException` khi duyệt mảng điểm trống.
  - Trả về danh sách học sinh kèm mảng điểm trống `scores: []`.
  - Dữ liệu trả về:

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

### UT03_Grades_TC23 : XỬ LÝ XẾP HẠNG ĐỒNG HẠNG (TIE-BREAK) TRÊN BẢNG XẾP HẠNG VINH DANH HỌC SINH

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Trong lớp `cls_1a_2026`, có 2 học sinh cùng đạt điểm tối đa `10.0` môn Toán (Trần Bảo Nam và Lê Ngọc Mai), học sinh thứ 3 đạt `9.5` (Hoàng Minh Khôi).
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Tham số truy vấn (Query Params):** `subject_code=MATH`, `semester=1`, `limit=5`
- **CÁC BƯỚC THỰC HIỆN:**
  1. Gửi request `GET /api/v1/grades/leaderboard/cls_1a_2026?subject_code=MATH&semester=1&limit=5`.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi **HTTP 200 (OK - THÀNH CÔNG)**.
  - Thuật toán xếp hạng xử lý đúng trường hợp đồng hạng theo chuẩn thi đấu (Standard Competition Ranking):
    - Cả 2 học sinh điểm `10.0` đều nhận vị trí **Hạng 1** (`rank: 1`) và Huy hiệu Vàng (`badge: "GOLD"`).
    - Học sinh tiếp theo đạt `9.5` xếp **Hạng 3** (`rank: 3`) và nhận Huy hiệu Đồng (`badge: "BRONZE"`).
  - Dữ liệu trả về:

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

### UT03_Grades_TC24 : TỪ CHỐI THAO TÁC DO KHÔNG CÓ TOKEN XÁC THỰC HOẶC TOKEN ĐÃ HẾT HẠN (401 UNAUTHORIZED)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Người dùng chưa đăng nhập hoặc token JWT đã quá hạn 1800 giây.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** Không truyền header `Authorization` hoặc `Authorization: Bearer <expired_token>`
  - **Dữ liệu thân (Body JSON):** Payload điểm hợp lệ.
- **CÁC BƯỚC THỰC HIỆN:**
  1. Gửi request `POST /api/v1/grades/batch` mà không có token hợp lệ.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống chặn ngay tại Guard xác thực với mã trạng thái **HTTP 401 (UNAUTHORIZED)**.
  - Dữ liệu trả về:

  ```json
  {
    "success": false,
    "status_code": 401,
    "error_code": "UNAUTHORIZED_ACCESS",
    "message": "Phiên làm việc không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại."
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT03_Grades_TC25 : CHẶN GIÁO VIÊN BỘ MÔN KHÁC TỰ Ý NHẬP ĐIỂM MÔN HỌC KHÔNG ĐƯỢC PHÂN CÔNG (403 FORBIDDEN)

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
  - Hệ thống ném ngoại lệ phân quyền nghiêm ngặt **HTTP 403 (FORBIDDEN)**.
  - Dữ liệu điểm không bị sửa đổi trái phép.
  - Dữ liệu trả về:

  ```json
  {
    "success": false,
    "status_code": 403,
    "error_code": "FORBIDDEN_TEACHER_ASSIGNMENT",
    "message": "Giáo viên không được phân công giảng dạy môn MATH tại lớp cls_1a_2026"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT03_Grades_TC26 : XỬ LÝ LỖI HỆ THỐNG KHI CƠ SỞ DỮ LIỆU FIRESTORE MẤT KẾT NỐI HOẶC TIMEOUT (500 INTERNAL SERVER ERROR)

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
  - Hệ thống bắt ngoại lệ thông qua Global Exception Filter và trả về **HTTP 500 (INTERNAL SERVER ERROR)**.
  - Ghi log chi tiết lỗi nội bộ vào hệ thống logging tập trung, tuyệt đối không để lộ thông tin connection string hoặc stack trace nhạy cảm ra ngoài client.
  - Dữ liệu trả về:

  ```json
  {
    "success": false,
    "status_code": 500,
    "error_code": "DATABASE_SERVICE_UNAVAILABLE",
    "message": "Hệ thống cơ sở dữ liệu tạm thời gián đoạn. Vui lòng thử lại sau giây lát."
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**



