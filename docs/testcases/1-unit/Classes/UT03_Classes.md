# TÀI LIỆU KỊCH BẢN KIỂM THỬ ĐƠN VỊ - PHÂN HỆ QUẢN LÝ LỚP HỌC & THÀNH VIÊN (CLASSES)

# MÃ PHÂN HỆ: 03 - CLASS MANAGEMENT MODULE

# CẤP ĐỘ KIỂM THỬ: KIỂM THỬ ĐƠN VỊ (UNIT TEST)

---

## 1. THÔNG TIN CHUNG

- **PHÂN HỆ HỆ THỐNG:** `03` - Phân hệ Quản lý Lớp học tổng, Phân công GVBM & Thành viên lớp học (`/api/v1/classes`)
- **MÔ TẢ MODULE API:** GVCN khởi tạo Lớp tổng, thêm học sinh và phân công GVBM, cơ chế Vào lớp 1-chạm (sinh mã mời `invite_code`, link mời `invite_link`), Phụ huynh tham gia lớp xác nhận con em, GVBM truy cập lớp theo môn giảng dạy, quản lý thêm/xóa học sinh và cập nhật phân công bộ môn (`ClassesService`, `ClassesController`).
- **NGƯỜI THỰC HIỆN / VIẾT TESTCASE:** Kim Chi Ha
- **TẬP TIN ĐẶC TẢ API:** [API_Classes](https://github.com/gray8493/GiaoVienHay/tree/main/docs/apis/classes)
- **MÔI TRƯỜNG KIỂM THỬ:** Testing / Postman API Client / Jest Unit Testing

---

## 2. CHI TIẾT CÁC KỊCH BẢN KIỂM THỬ ĐƠN VỊ

---

### PHẦN I: CÁC KỊCH BẢN KIỂM THỬ THẤT BẠI & BÁO LỖI (NEGATIVE / FALSE CASES)

---

#### 1. Nhóm Kịch Bản Thiếu Các Trường Bắt Buộc (Missing Required Fields Validation)

---

##### UT03_Classes_TC01 : TỪ CHỐI TẠO LỚP HỌC KHI KHÔNG NHẬP HOẶC ĐỂ TRỐNG TÊN LỚP (MISSING NAME)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên chủ nhiệm đã đăng nhập hợp lệ với vai trò `TEACHER_HOMEROOM`.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_gvcn_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):** Để trống trường `name`:
  ```json
  {
    "name": "",
    "grade_level": 1,
    "academic_year": "2026-2027"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã `Bearer Token` của GVCN vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/classes`.
  3. Gửi payload thiếu trường tên lớp `name`.
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
        "field": "name",
        "issue": "Tên lớp học bắt buộc và không được để trống"
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT03_Classes_TC02 : TỪ CHỐI TẠO LỚP HỌC KHI KHÔNG CHỌN KHỐI LỚP (MISSING GRADE_LEVEL)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - GVCN đã đăng nhập hợp lệ vào hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_gvcn_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):** Không truyền trường `grade_level`:
  ```json
  {
    "name": "1A",
    "academic_year": "2026-2027"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của GVCN vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/classes`.
  3. Gửi payload thiếu `grade_level`.
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
        "field": "grade_level",
        "issue": "Khối lớp bắt buộc phải được chọn (từ Khối 1 đến Khối 9)"
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT03_Classes_TC03 : TỪ CHỐI TẠO LỚP HỌC KHI KHÔNG NHẬP HOẶC ĐỂ TRỐNG NĂM HỌC (MISSING ACADEMIC_YEAR)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - GVCN đã đăng nhập hợp lệ vào hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_gvcn_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):** Để trống trường `academic_year`:
  ```json
  {
    "name": "1A",
    "grade_level": 1,
    "academic_year": ""
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của GVCN vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/classes`.
  3. Gửi payload thiếu trường `academic_year`.
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
        "field": "academic_year",
        "issue": "Năm học bắt buộc và không được để trống"
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT03_Classes_TC04 : TỪ CHỐI TẠO LỚP KHI HỌC SINH THIẾU MÃ HỌC SINH, HỌ TÊN HOẶC GIỚI TÍNH

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - GVCN đã đăng nhập hợp lệ vào hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_gvcn_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):** Phần tử học sinh thiếu `student_code`, `full_name` hoặc `gender`:
  ```json
  {
    "name": "1A",
    "grade_level": 1,
    "academic_year": "2026-2027",
    "students": [
      {
        "student_code": "",
        "full_name": "Trần Bảo Nam",
        "gender": ""
      }
    ]
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của GVCN vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/classes`.
  3. Gửi payload chứa phần tử học sinh thiếu các trường bắt buộc.
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
        "field": "students[0].student_code",
        "issue": "Mã học sinh bắt buộc và không được để trống"
      },
      {
        "field": "students[0].gender",
        "issue": "Giới tính học sinh bắt buộc phải được chọn (MALE, FEMALE, OTHER)"
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT03_Classes_TC05 : TỪ CHỐI PHỤ HUYNH VÀO LỚP KHI THIẾU MÃ MỜI HOẶC MÃ HỌC SINH (MISSING JOIN FIELDS)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Phụ huynh đã đăng nhập với vai trò `PARENT`.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_parent_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):** Bỏ trống `invite_code` và `student_id`:
  ```json
  {
    "invite_code": "",
    "student_id": ""
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của Phụ huynh vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/classes/join`.
  3. Gửi payload thiếu thông tin vào phần **Body**.
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
        "field": "invite_code",
        "issue": "Mã mời tham gia lớp học không được để trống"
      },
      {
        "field": "student_id",
        "issue": "Vui lòng chọn học sinh xác nhận là con em mình"
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT03_Classes_TC06 : TỪ CHỐI THÊM HỌC SINH KHI DANH SÁCH STUDENTS RỖNG HOẶC THIẾU THÔNG TIN BẮT BUỘC

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - GVCN phụ trách lớp `cls_1a_2026` đã đăng nhập thành công.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_gvcn_hop_le>`
    - `Content-Type: application/json`
  - **Tham số đường dẫn (Path Params):** `id = cls_1a_2026`
  - **Dữ liệu thân (Body JSON):** Mảng `students` rỗng `[]`:
  ```json
  {
    "students": []
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của GVCN vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/classes/cls_1a_2026/students`.
  3. Gửi payload có mảng `students` rỗng.
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
        "field": "students",
        "issue": "Danh sách học sinh thêm mới không được để trống (tối thiểu 1 học sinh)"
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT03_Classes_TC07 : TỪ CHỐI CẬP NHẬT PHÂN CÔNG GVBM KHI THIẾU THÔNG TIN MÃ GIÁO VIÊN HOẶC MÔN HỌC

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - GVCN phụ trách lớp `cls_1a_2026` đã đăng nhập thành công.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_gvcn_hop_le>`
    - `Content-Type: application/json`
  - **Tham số đường dẫn (Path Params):** `id = cls_1a_2026`
  - **Dữ liệu thân (Body JSON):** Phần tử thiếu `teacher_id` hoặc `subject_code`:
  ```json
  {
    "subject_teachers": [
      {
        "teacher_id": "",
        "subject_code": "MATH"
      }
    ]
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của GVCN vào mục **Headers**.
  2. Chọn phương thức **`PUT`**, nhập đường dẫn API: `/api/v1/classes/cls_1a_2026/subject-teachers`.
  3. Gửi payload thiếu thông tin bắt buộc trong phần tử phân công.
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
        "field": "subject_teachers[0].teacher_id",
        "issue": "Mã giáo viên bộ môn bắt buộc và không được để trống"
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

#### 2. Nhóm Kịch Bản Dữ Liệu Nghiệp Vụ & Mã Lỗi Phân Hệ Lớp Học (Business Errors)

---

##### UT03_Classes_TC08 : TỪ CHỐI TẠO LỚP HỌC KHI KHỐI LỚP NGOÀI PHẠM VI CHO PHÉP (1 ĐẾN 9)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - GVCN đã đăng nhập hợp lệ vào hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_gvcn_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):** Chọn khối lớp 10, 11 hoặc 12 (vượt phạm vi Cấp 1 & Cấp 2):
  ```json
  {
    "name": "10A1",
    "grade_level": 10,
    "academic_year": "2026-2027"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của GVCN vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/classes`.
  3. Gửi dữ liệu có `grade_level = 10`.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống ném ra ngoại lệ **HTTP 400 (BAD REQUEST - YÊU CẦU KHÔNG HỢP LỆ)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:
  ```json
  {
    "success": false,
    "status_code": 400,
    "message": "Khối lớp không nằm trong phạm vi hệ thống hỗ trợ",
    "error_code": "COMMON_VALIDATION_ERROR",
    "details": [
      {
        "field": "grade_level",
        "issue": "Khối lớp phải là số nguyên từ 1 đến 9 (Tiểu học & THCS)"
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT03_Classes_TC09 : TỪ CHỐI TẠO LỚP KHI NĂM HỌC SAI ĐỊNH DẠNG HOẶC NĂM KẾT THÚC SAI QUY TẮC

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - GVCN đã đăng nhập hợp lệ vào hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_gvcn_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):** Năm học sai định dạng `2026/2027` hoặc khoảng thời gian không hợp lệ:
  ```json
  {
    "name": "1A",
    "grade_level": 1,
    "academic_year": "2026-2029"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của GVCN vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/classes`.
  3. Gửi dữ liệu có `academic_year` sai quy cách.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống ném ra ngoại lệ **HTTP 400 (BAD REQUEST - YÊU CẦU KHÔNG HỢP LỆ)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:
  ```json
  {
    "success": false,
    "status_code": 400,
    "message": "Định dạng năm học không hợp lệ",
    "error_code": "COMMON_VALIDATION_ERROR",
    "details": [
      {
        "field": "academic_year",
        "issue": "Năm học phải có định dạng YYYY-YYYY và năm kết thúc phải bằng năm bắt đầu + 1 (Ví dụ: 2026-2027)"
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT03_Classes_TC10 : TỪ CHỐI KHI NGÀY SINH HỌC SINH KHÔNG CÓ THẬT TRÊN LỊCH HOẶC Ở TƯƠNG LAI

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - GVCN đã đăng nhập hợp lệ vào hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_gvcn_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):** Ngày sinh `2018-02-30` không tồn tại trên lịch thực tế:
  ```json
  {
    "name": "1A",
    "grade_level": 1,
    "academic_year": "2026-2027",
    "students": [
      {
        "student_code": "HS001",
        "full_name": "Trần Bảo Nam",
        "gender": "MALE",
        "dob": "2018-02-30"
      }
    ]
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của GVCN vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/classes`.
  3. Gửi dữ liệu có `dob: "2018-02-30"`.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống ném ra ngoại lệ **HTTP 400 (BAD REQUEST - YÊU CẦU KHÔNG HỢP LỆ)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:
  ```json
  {
    "success": false,
    "status_code": 400,
    "message": "Ngày sinh học sinh không hợp lệ hoặc không tồn tại trong lịch thực tế",
    "error_code": "COMMON_VALIDATION_ERROR",
    "details": [
      {
        "field": "students[0].dob",
        "issue": "Giá trị '2018-02-30' không phải là ngày hợp lệ trong lịch thực tế (tháng 2 năm 2018 chỉ có 28 ngày)"
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT03_Classes_TC11 : TỪ CHỐI TẠO LỚP HOẶC THÊM HỌC SINH KHI TRÙNG MÃ HỌC SINH (CLASS_STUDENT_CODE_EXISTS)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - GVCN đã đăng nhập hợp lệ vào hệ thống.
  - Lớp học đã có học sinh mang mã `HS001` trong danh sách.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_gvcn_hop_le>`
    - `Content-Type: application/json`
  - **Tham số đường dẫn (Path Params):** `id = cls_1a_2026`
  - **Dữ liệu thân (Body JSON):** Thêm học sinh mới với mã `HS001` bị trùng lặp:
  ```json
  {
    "students": [
      {
        "student_code": "HS001",
        "full_name": "Lê Bảo Anh",
        "gender": "FEMALE"
      }
    ]
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của GVCN vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/classes/cls_1a_2026/students`.
  3. Gửi payload chứa mã học sinh đã tồn tại.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống ném ra ngoại lệ xung đột dữ liệu **HTTP 409 (CONFLICT - TRÙNG MÃ HỌC SINH)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:
  ```json
  {
    "success": false,
    "status_code": 409,
    "message": "Mã học sinh HS001 đã tồn tại trong danh sách lớp",
    "error_code": "CLASS_STUDENT_CODE_EXISTS",
    "details": [
      {
        "field": "students[0].student_code",
        "issue": "Mã học sinh HS001 bị trùng lặp trong lớp học này"
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT03_Classes_TC12 : TỪ CHỐI THÊM HỌC SINH KHI LỚP HỌC ĐÃ ĐẠT SĨ SỐ TỐI ĐA CHO PHÉP (CLASS_MAX_STUDENTS_EXCEEDED)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Lớp `cls_1a_2026` hiện tại đã có đủ 60 học sinh (sĩ số trần tối đa theo hạn mức tài nguyên hệ thống).
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_gvcn_hop_le>`
    - `Content-Type: application/json`
  - **Tham số đường dẫn (Path Params):** `id = cls_1a_2026`
  - **Dữ liệu thân (Body JSON):** Tiếp tục thêm học sinh thứ 61:
  ```json
  {
    "students": [
      {
        "student_code": "HS061",
        "full_name": "Phạm Quốc Tuấn",
        "gender": "MALE"
      }
    ]
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của GVCN vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/classes/cls_1a_2026/students`.
  3. Gửi yêu cầu thêm học sinh vượt sĩ số.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống ném ra ngoại lệ **HTTP 400 (BAD REQUEST - VƯỢT QUÁ HẠN MỨC SĨ SỐ)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:
  ```json
  {
    "success": false,
    "status_code": 400,
    "message": "Lớp học đã đạt sĩ số tối đa theo quy định hạn mức hệ thống (tối đa 60 học sinh)",
    "error_code": "CLASS_MAX_STUDENTS_EXCEEDED",
    "details": null,
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT03_Classes_TC13 : TỪ CHỐI PHỤ HUYNH VÀO LỚP KHI MÃ MỜI KHÔNG HỢP LỆ HOẶC HẾT HẠN (CLASS_INVITE_CODE_INVALID)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Phụ huynh đã đăng nhập với vai trò `PARENT`.
  - Mã mời `GVH_SAI_MA_999` hoàn toàn không tồn tại trong hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_parent_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):**
  ```json
  {
    "invite_code": "GVH_SAI_MA_999",
    "student_id": "stu_01"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của Phụ huynh vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/classes/join`.
  3. Thêm mã mời không tồn tại vào phần **Body**.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 404 (NOT FOUND - KHÔNG TÌM THẤY)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:
  ```json
  {
    "success": false,
    "status_code": 404,
    "message": "Mã mời tham gia lớp học không hợp lệ hoặc đã hết hạn",
    "error_code": "CLASS_INVITE_CODE_INVALID",
    "details": null,
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT03_Classes_TC14 : TỪ CHỐI LIÊN KẾT KHI HỌC SINH ĐÃ ĐƯỢC LIÊN KẾT VỚI PHỤ HUYNH NÀY (STUDENT_ALREADY_LINKED)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Tài khoản phụ huynh `usr_parent_01` đã liên kết thành công với học sinh `stu_01` từ trước.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_parent_01>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):** Gửi lại yêu cầu tham gia lớp và chọn học sinh `stu_01`:
  ```json
  {
    "invite_code": "GVH1A26",
    "student_id": "stu_01"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của Phụ huynh vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/classes/join`.
  3. Gửi payload liên kết trùng lặp.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống ném ra ngoại lệ xung đột **HTTP 409 (CONFLICT - HỌC SINH ĐÃ ĐƯỢC LIÊN KẾT)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:
  ```json
  {
    "success": false,
    "status_code": 409,
    "message": "Học sinh này đã được liên kết với tài khoản phụ huynh này",
    "error_code": "STUDENT_ALREADY_LINKED",
    "details": null,
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT03_Classes_TC15 : BÁO LỖI KHI TRA CỨU HOẶC THAO TÁC VỚI MÃ LỚP HỌC KHÔNG TỒN TẠI (CLASS_NOT_FOUND)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên đã đăng nhập hợp lệ.
  - Mã lớp học `cls_khong_ton_tai` hoàn toàn không có trong cơ sở dữ liệu hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien_hop_le>`
  - **Tham số đường dẫn (Path Params):** `id = cls_khong_ton_tai`
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/classes/cls_khong_ton_tai`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 404 (NOT FOUND - KHÔNG TÌM THẤY)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:
  ```json
  {
    "success": false,
    "status_code": 404,
    "message": "Không tìm thấy lớp học",
    "error_code": "CLASS_NOT_FOUND",
    "details": null,
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT03_Classes_TC16 : CHẶN GIÁO VIÊN KHÔNG PHẢI CHỦ NHIỆM THỰC HIỆN CÁC THAO TÁC QUẢN TRỊ LỚP (CLASS_NOT_HOMEROOM_TEACHER)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên `usr_teacher_other` đã đăng nhập nhưng không phải GVCN của lớp `cls_1a_2026`.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien_khong_phai_gvcn>`
  - **Tham số đường dẫn (Path Params):** `id = cls_1a_2026`
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực của giáo viên không có thẩm quyền vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn lấy mã mời: `/api/v1/classes/cls_1a_2026/invite`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống ném ra ngoại lệ cấm truy cập **HTTP 403 (FORBIDDEN - CẤM TRUY CẬP)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:
  ```json
  {
    "success": false,
    "status_code": 403,
    "message": "Chỉ Giáo viên chủ nhiệm mới có quyền thực hiện thao tác này",
    "error_code": "CLASS_NOT_HOMEROOM_TEACHER",
    "details": null,
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT03_Classes_TC17 : CHẶN GVBM TRUY CẬP LỚP TỔNG KHI CHƯA ĐƯỢC PHÂN CÔNG GIẢNG DẠY (ACAD_NOT_ASSIGNED_TEACHER)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên bộ môn `usr_gvbm_unassigned` đã đăng nhập nhưng chưa được GVCN phân công giảng dạy bất kỳ môn nào tại lớp `cls_1a_2026`.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_gvbm_chua_phan_cong>`
  - **Tham số đường dẫn (Path Params):** `id = cls_1a_2026`
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của GVBM vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/classes/cls_1a_2026/my-subject`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống ném ra ngoại lệ **HTTP 403 (FORBIDDEN - CHƯA ĐƯỢC PHÂN CÔNG)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:
  ```json
  {
    "success": false,
    "status_code": 403,
    "message": "Giáo viên chưa được phân công giảng dạy môn học này tại lớp",
    "error_code": "ACAD_NOT_ASSIGNED_TEACHER",
    "details": null,
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT03_Classes_TC18 : XỬ LÝ NGOẠI LỆ LỖI HỆ THỐNG KHI MẤT KẾT NỐI DATABASE FIRESTORE (SYS_INTERNAL_ERROR)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - GVCN đã đăng nhập hợp lệ.
  - Cơ sở dữ liệu Cloud Firestore tạm thời gặp sự cố mất kết nối mạng hoặc timeout truy vấn.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_gvcn_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):**
  ```json
  {
    "name": "1A",
    "grade_level": 1,
    "academic_year": "2026-2027"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của GVCN vào mục **Headers**.
  2. Giả lập / Mocking kết nối Cloud Firestore ném ra lỗi ngoại lệ `FirebaseError: Service Unavailable / Timeout`.
  3. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/classes`.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Bộ lọc ngoại lệ toàn cục (Global Exception Filter) bắt lỗi và chuyển đổi thành mã trạng thái **HTTP 500 (INTERNAL SERVER ERROR - LỖI MÁY CHỦ NỘI BỘ)** mà không làm crash tiến trình ứng dụng.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:
  ```json
  {
    "success": false,
    "status_code": 500,
    "message": "Lỗi máy chủ nội bộ hoặc lỗi kết nối Firebase Firestore",
    "error_code": "SYS_INTERNAL_ERROR",
    "details": null,
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### PHẦN II: CÁC KỊCH BẢN KIỂM THỬ THÀNH CÔNG (POSITIVE / TRUE CASES)

---

#### UT03_Classes_TC19 : GVCN TẠO LỚP HỌC TỔNG, THÊM HỌC SINH VÀ PHÂN CÔNG GVBM BAN ĐẦU THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên đã đăng nhập với vai trò Giáo viên Chủ nhiệm (`TEACHER_HOMEROOM`).
  - Danh sách môn GVCN dạy (`teaching_subjects`) đã được định nghĩa trong hồ sơ tài khoản.
  - Các tài khoản GVBM tiếng Anh (`uid_gvbm_eng`) và Thể dục (`uid_gvbm_pe`) tồn tại trong hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_gvcn_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):**
  ```json
  {
    "name": "1A",
    "grade_level": 1,
    "academic_year": "2026-2027",
    "subject_teachers": [
      {
        "teacher_id": "uid_gvbm_eng",
        "subject_code": "ENG"
      },
      {
        "teacher_id": "uid_gvbm_pe",
        "subject_code": "PE"
      }
    ],
    "students": [
      {
        "student_code": "HS001",
        "full_name": "Trần Bảo Nam",
        "gender": "MALE",
        "dob": "2020-05-15"
      },
      {
        "student_code": "HS002",
        "full_name": "Lê Ngọc Mai",
        "gender": "FEMALE",
        "dob": "2020-08-20"
      }
    ]
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã `Bearer Token` của GVCN vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/classes`.
  3. Thêm dữ liệu cấu hình lớp học vào phần **Body** định dạng `raw (application/json)`.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 201 (CREATED - ĐÃ TẠO THÀNH CÔNG)**.
  - Tạo document lớp học trong `/classes` kèm mã mời ngẫu nhiên `invite_code` (ví dụ `GVH1A26`) và đường dẫn mời `invite_link`.
  - Batch write khởi tạo các document học sinh trong `/students` và hồ sơ theo dõi BHYT trong `/fees_and_insurance`.
  - Tự động gộp các môn của GVCN cùng môn của GVBM vào mảng `assigned_subjects`.
  - Dữ liệu trả về đúng định dạng JSON chuẩn:
  ```json
  {
    "success": true,
    "status_code": 201,
    "message": "Tạo lớp học tổng thành công",
    "data": {
      "class_id": "cls_1a_2026",
      "name": "1A",
      "grade_level": 1,
      "invite_code": "GVH1A26",
      "invite_link": "https://giaovienhay.vn/join?code=GVH1A26",
      "total_students": 2,
      "assigned_subjects": [
        "MATH",
        "LIT",
        "ETHICS",
        "ENG",
        "PE"
      ]
    },
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

#### UT03_Classes_TC20 : GVCN TẠO LỚP HỌC TỔNG VỚI DANH SÁCH HỌC SINH RỖNG THÀNH CÔNG (CHỜ IMPORT SAU)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - GVCN đã đăng nhập hợp lệ với vai trò `TEACHER_HOMEROOM`.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_gvcn_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):** Không nạp danh sách `students`:
  ```json
  {
    "name": "2B",
    "grade_level": 2,
    "academic_year": "2026-2027"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã `Bearer Token` của GVCN vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/classes`.
  3. Gửi payload khởi tạo lớp không có mảng học sinh ban đầu.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 201 (CREATED - ĐÃ TẠO THÀNH CÔNG)**.
  - Tạo document lớp học với `total_students = 0` và sinh sẵn mã mời `invite_code` để GVCN import học sinh sau.
  - Dữ liệu trả về đúng định dạng JSON chuẩn.
- **TRẠNG THÁI KIỂM THỬ:**

---

#### UT03_Classes_TC21 : LẤY DANH SÁCH CÁC LỚP HỌC GIÁO VIÊN ĐANG PHỤ TRÁCH THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên đã đăng nhập và được phân công làm Chủ nhiệm tại lớp `cls_1a_2026` hoặc dạy bộ môn tại lớp `cls_2b_2026`.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien_hop_le>`
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của giáo viên vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/classes`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Trả về danh sách tất cả các lớp mà giáo viên tham gia (phân định rõ vai trò `HOMEROOM` hay `SUBJECT`).
  - Dữ liệu trả về đúng định dạng JSON chuẩn:
  ```json
  {
    "success": true,
    "status_code": 200,
    "data": [
      {
        "class_id": "cls_1a_2026",
        "name": "1A",
        "grade_level": 1,
        "academic_year": "2026-2027",
        "role_in_class": "HOMEROOM",
        "total_students": 35
      },
      {
        "class_id": "cls_2b_2026",
        "name": "2B",
        "grade_level": 2,
        "academic_year": "2026-2027",
        "role_in_class": "SUBJECT",
        "assigned_subject": "ENG",
        "total_students": 32
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

#### UT03_Classes_TC22 : XEM THÔNG TIN CHI TIẾT LỚP HỌC THEO ID THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Lớp học `cls_1a_2026` tồn tại trên hệ thống.
  - Người dùng (GVCN, GVBM hoặc Phụ huynh của lớp) có quyền truy cập.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_nguoi_dung_hop_le>`
  - **Tham số đường dẫn (Path Params):** `id = cls_1a_2026`
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/classes/cls_1a_2026`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Trả về chi tiết thông tin lớp học, sĩ số, thông tin GVCN và danh sách GVBM các bộ môn.
  - Dữ liệu trả về đúng định dạng JSON chuẩn:
  ```json
  {
    "success": true,
    "status_code": 200,
    "data": {
      "class_id": "cls_1a_2026",
      "name": "1A",
      "grade_level": 1,
      "academic_year": "2026-2027",
      "homeroom_teacher": {
        "uid": "usr_teacher_lan_01",
        "full_name": "Nguyễn Thị Lan"
      },
      "total_students": 35,
      "subject_teachers": [
        {
          "teacher_id": "uid_gvbm_eng",
          "full_name": "Trần Thị Mai",
          "subject_code": "ENG"
        }
      ]
    },
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

#### UT03_Classes_TC23 : GVBM TRUY CẬP LỚP TỔNG THEO ĐÚNG MÔN ĐƯỢC PHÂN CÔNG THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên bộ môn `uid_gvbm_eng` đã được phân công giảng dạy môn `ENG` tại lớp `cls_1a_2026`.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_gvbm_eng>`
  - **Tham số đường dẫn (Path Params):** `id = cls_1a_2026`
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của GVBM vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/classes/cls_1a_2026/my-subject`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Trả về danh sách học sinh của lớp tổng kèm quyền hạn nhập điểm đối với môn `ENG`.
  - Dữ liệu trả về đúng định dạng JSON chuẩn:
  ```json
  {
    "success": true,
    "status_code": 200,
    "message": "Lấy danh sách học sinh theo môn thành công",
    "data": {
      "class_id": "cls_1a_2026",
      "class_name": "1A",
      "subject_code": "ENG",
      "subject_name": "Tiếng Anh",
      "students": [
        {
          "id": "stu_01",
          "student_code": "HS001",
          "full_name": "Trần Bảo Nam"
        },
        {
          "id": "stu_02",
          "student_code": "HS002",
          "full_name": "Lê Ngọc Mai"
        }
      ]
    },
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

#### UT03_Classes_TC24 : GVCN LẤY MÃ MỜI VÀ LINK MỜI THAM GIA LỚP HỌC THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - GVCN phụ trách lớp `cls_1a_2026` đã đăng nhập thành công.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_gvcn_hop_le>`
  - **Tham số đường dẫn (Path Params):** `id = cls_1a_2026`
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của GVCN vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/classes/cls_1a_2026/invite`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Trả về mã mời (`invite_code`), link mời trực tiếp (`invite_link`) và mã QR để GVCN sao chép gửi phụ huynh qua Zalo/tin nhắn.
  - Dữ liệu trả về đúng định dạng JSON chuẩn:
  ```json
  {
    "success": true,
    "status_code": 200,
    "data": {
      "class_id": "cls_1a_2026",
      "class_name": "1A",
      "invite_code": "GVH1A26",
      "invite_link": "https://giaovienhay.vn/join?code=GVH1A26",
      "qr_code_url": "https://api.giaovienhay.vn/qr/GVH1A26.png"
    },
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

#### UT03_Classes_TC25 : PHỤ HUYNH THAM GIA LỚP QUA MÃ MỜI VÀ XÁC NHẬN LIÊN KẾT CON EM THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Phụ huynh đã đăng nhập với vai trò `PARENT`.
  - Mã mời `GVH1A26` hợp lệ và học sinh `stu_01` thuộc lớp `cls_1a_2026`.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_parent_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):**
  ```json
  {
    "invite_code": "GVH1A26",
    "student_id": "stu_01"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của Phụ huynh vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/classes/join`.
  3. Thêm mã mời và mã học sinh vào phần **Body** định dạng `raw (application/json)`.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Thêm UID của phụ huynh vào mảng `parent_uids` của document `/students/stu_01` trong Cloud Firestore.
  - Dữ liệu trả về đúng định dạng JSON chuẩn:
  ```json
  {
    "success": true,
    "status_code": 200,
    "message": "Liên kết vào lớp học của con thành công",
    "data": {
      "class_id": "cls_1a_2026",
      "class_name": "1A",
      "child": {
        "student_id": "stu_01",
        "full_name": "Trần Bảo Nam",
        "student_code": "HS001"
      }
    },
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

#### UT03_Classes_TC26 : GVCN THÊM HỌC SINH MỚI VÀO LỚP HỌC HIỆN TẠI THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - GVCN phụ trách lớp `cls_1a_2026` đã đăng nhập thành công.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_gvcn_hop_le>`
    - `Content-Type: application/json`
  - **Tham số đường dẫn (Path Params):** `id = cls_1a_2026`
  - **Dữ liệu thân (Body JSON):**
  ```json
  {
    "students": [
      {
        "student_code": "HS036",
        "full_name": "Vũ Hải Đăng",
        "gender": "MALE",
        "dob": "2020-03-12"
      }
    ]
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của GVCN vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/classes/cls_1a_2026/students`.
  3. Thêm dữ liệu học sinh mới cần bổ sung vào phần **Body**.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 201 (CREATED - ĐÃ TẠO THÀNH CÔNG)**.
  - Tạo mới document học sinh trong `/students` và cập nhật tăng trường sĩ số `total_students` của lớp trong `/classes/cls_1a_2026`.
  - Dữ liệu trả về đúng định dạng JSON chuẩn:
  ```json
  {
    "success": true,
    "status_code": 201,
    "message": "Thêm học sinh vào lớp học thành công",
    "data": {
      "class_id": "cls_1a_2026",
      "added_count": 1,
      "total_students": 36
    },
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

#### UT03_Classes_TC27 : GVCN XÓA HỌC SINH KHỎI LỚP HỌC THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - GVCN phụ trách lớp `cls_1a_2026` đã đăng nhập thành công.
  - Học sinh `stu_99` tồn tại trong lớp học.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_gvcn_hop_le>`
  - **Tham số đường dẫn (Path Params):**
    - `id = cls_1a_2026`
    - `studentId = stu_99`
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của GVCN vào mục **Headers**.
  2. Chọn phương thức **`DELETE`**, nhập đường dẫn API: `/api/v1/classes/cls_1a_2026/students/stu_99`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Phản hồi kèm Header: `X-Response-Time`.
  - Không xóa vật lý bản ghi khỏi cơ sở dữ liệu; Firestore cập nhật cờ xóa mềm `is_deleted: true` và mốc thời gian `deleted_at: <ISO timestamp>` trên tài liệu `/students/stu_99`.
  - Dữ liệu trả về đúng định dạng JSON chuẩn:
  ```json
  {
    "success": true,
    "status_code": 200,
    "message": "Xóa mềm học sinh khỏi lớp thành công",
    "data": {
      "message": "Xóa mềm học sinh khỏi lớp thành công",
      "student_id": "stu_99",
      "class_id": "cls_1a_2026",
      "is_deleted": true,
      "deleted_at": "2026-10-04T08:30:00.000Z"
    },
    "timestamp": "2026-10-04T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

#### UT03_Classes_TC28 : GVCN CẬP NHẬT PHÂN CÔNG GIÁO VIÊN BỘ MÔN (GVBM) CHO LỚP THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - GVCN phụ trách lớp `cls_1a_2026` đã đăng nhập thành công.
  - Tài khoản GVBM tiếng Anh mới `usr_gvbm_eng_02` tồn tại trong hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_gvcn_hop_le>`
    - `Content-Type: application/json`
  - **Tham số đường dẫn (Path Params):** `id = cls_1a_2026`
  - **Dữ liệu thân (Body JSON):**
  ```json
  {
    "subject_teachers": [
      {
        "teacher_id": "usr_gvbm_eng_02",
        "subject_code": "ENG"
      }
    ]
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của GVCN vào mục **Headers**.
  2. Chọn phương thức **`PUT`**, nhập đường dẫn API: `/api/v1/classes/cls_1a_2026/subject-teachers`.
  3. Thêm cấu hình phân công GVBM mới vào phần **Body**.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Cập nhật trường `subject_teachers` trong document Firestore `/classes/cls_1a_2026`.
  - Dữ liệu trả về đúng định dạng JSON chuẩn:
  ```json
  {
    "success": true,
    "status_code": 200,
    "message": "Cập nhật phân công GVBM thành công",
    "data": {
      "class_id": "cls_1a_2026",
      "updated_count": 1
    },
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

#### UT03_Classes_TC29 : XÓA MỀM LỚP HỌC VÀ TỰ ĐỘNG XÓA IN-MEMORY RAM CACHE CỦA GIÁO VIÊN THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - GVCN phụ trách lớp `cls_1a_2026` đã đăng nhập thành công.
  - Danh sách lớp của giáo viên đang được cache trong RAM với key `classes_teacher_<teacherId>`.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_gvcn_hop_le>`
  - **Tham số đường dẫn (Path Params):** `id = cls_1a_2026`
- **CÁC BƯỚC THỰC HIỆN:**
  1. Gửi request xóa mềm lớp học: `DELETE /api/v1/classes/cls_1a_2026`.
  2. Backend cập nhật `is_deleted = true`, `deleted_at = now`.
  3. Backend gọi `cacheManager.del("classes_teacher_" + teacherId)` để xóa cache danh sách lớp.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Kèm header `X-Response-Time`.
  - Dữ liệu trả về:
  ```json
  {
    "success": true,
    "status_code": 200,
    "message": "Xóa mềm lớp học thành công",
    "data": {
      "message": "Xóa mềm lớp học thành công",
      "class_id": "cls_1a_2026",
      "is_deleted": true,
      "deleted_at": "2026-10-04T08:30:00.000Z"
    },
    "timestamp": "2026-10-04T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

#### UT03_Classes_TC30 : TRUY VẤN DANH SÁCH LỚP HỌC VÀ HỌC SINH TỰ ĐỘNG LỌC BỎ CÁC BẢN GHI ĐÃ XÓA MỀM

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Lớp `cls_1a_2026` có 35 học sinh, trong đó học sinh `stu_99` đã bị xóa mềm (`is_deleted = true`).
  - Giáo viên đã đăng nhập hợp lệ.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_gv>`
  - **Endpoint & Method:** `GET /api/v1/classes/cls_1a_2026`
- **CÁC BƯỚC THỰC HIỆN:**
  1. Gửi request `GET /api/v1/classes/cls_1a_2026`.
  2. Kiểm tra danh sách mảng `students` trả về trong payload.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi **HTTP 200 (OK)**.
  - Danh sách học sinh của lớp chỉ chứa các học sinh có `is_deleted = false`.
  - Học sinh `stu_99` không xuất hiện trong danh sách kết quả trả về.
- **TRẠNG THÁI KIỂM THỬ:**

---

#### UT03_Classes_TC31 : XỬ LÝ TRẠNG THÁI RỖNG AN TOÀN KHI GIÁO VIÊN MỚI CHƯA ĐƯỢC PHÂN CÔNG LỚP HỌC NÀO TRONG HỆ THỐNG (EMPTY STATE - 200 OK)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Tài khoản giáo viên mới đăng ký (`usr_teacher_fresh`) đã xác thực thành công.
  - Trong cơ sở dữ liệu Cloud Firestore `/classes`, giáo viên này chưa từng tạo lớp chủ nhiệm nào (`homeroom_teacher_id != usr_teacher_fresh`) và chưa được phân công làm giáo viên bộ môn của lớp nào.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_gv_moi>`
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền token xác thực của giáo viên mới vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/classes`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Phản hồi kèm Header `X-Response-Time`.
  - Dữ liệu trả về đúng cấu trúc danh sách rỗng an toàn, giúp ứng dụng hiển thị màn hình Empty State "Bạn chưa phụ trách lớp học nào. Hãy bấm nút Tạo Lớp Mới để bắt đầu":
  ```json
  {
    "success": true,
    "status_code": 200,
    "message": "Lấy danh sách lớp học thành công",
    "data": {
      "total": 0,
      "classes": []
    },
    "timestamp": "2026-10-04T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

#### UT03_Classes_TC32 : XỬ LÝ TRẠNG THÁI RỖNG AN TOÀN KHI XEM CHI TIẾT LỚP HỌC CHƯA CÓ HỌC SINH NÀO TRONG CƠ SỞ DỮ LIỆU (EMPTY STATE - 200 OK)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Lớp học `cls_new_empty` vừa được GVCN tạo mới thành công trên hệ thống nhưng chưa kịp import danh sách học sinh (danh sách học sinh trong DB collection `/classes/cls_new_empty/students` đang rỗng).
  - Giáo viên chủ nhiệm đã đăng nhập hợp lệ.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_gvcn>`
  - **Tham số đường dẫn (Path Params):** `id = cls_new_empty`
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền token GVCN vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/classes/cls_new_empty`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Trả về thông tin lớp học đầy đủ (tên lớp, niên khóa, mã mời), mảng học sinh rỗng `students: []`, tổng số lượng học sinh `total_students: 0`, không gây ra lỗi null pointer:
  ```json
  {
    "success": true,
    "status_code": 200,
    "data": {
      "id": "cls_new_empty",
      "name": "Lớp 6A3",
      "grade_level": 6,
      "academic_year": "2026-2027",
      "homeroom_teacher_name": "Cô Hoàng Lan",
      "invite_code": "CL6A39",
      "total_students": 0,
      "students": [],
      "subject_teachers": []
    },
    "timestamp": "2026-10-04T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

#### UT03_Classes_TC33 : TỪ CHỐI XÓA HỌC SINH KHI MÃ HỌC SINH KHÔNG TỒN TẠI TRONG DANH SÁCH LỚP HỌC (STUDENT_NOT_FOUND - 404)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Lớp học `cls_1a_2026` tồn tại trên hệ thống và GVCN đã đăng nhập hợp lệ.
  - Mã định danh học sinh `stu_not_found_9999` hoàn toàn không tồn tại trong danh sách học sinh của lớp này trên Cloud Firestore.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_gvcn_hop_le>`
  - **Tham số đường dẫn (Path Params):**
    - `id = cls_1a_2026`
    - `student_id = stu_not_found_9999`
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền token GVCN vào mục **Headers**.
  2. Chọn phương thức **`DELETE`**, nhập đường dẫn API: `/api/v1/classes/cls_1a_2026/students/stu_not_found_9999`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống ném ra ngoại lệ **HTTP 404 (NOT FOUND - KHÔNG TÌM THẤY HỌC SINH TRONG LỚP)**.
  - Phản hồi cấu trúc Envelope lỗi chuẩn, giữ nguyên toàn vẹn dữ liệu sĩ số lớp hiện tại:
  ```json
  {
    "success": false,
    "status_code": 404,
    "message": "Không tìm thấy học sinh này trong danh sách lớp học",
    "error_code": "STUDENT_NOT_FOUND",
    "details": null,
    "timestamp": "2026-10-04T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

