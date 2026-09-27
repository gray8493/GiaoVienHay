# TÀI LIỆU KỊCH BẢN KIỂM THỬ ĐƠN VỊ - PHÂN HỆ QUẢN LÝ LỚP HỌC & THÀNH VIÊN (CLASSES)

# MÃ PHÂN HỆ: UT04_CLASSES - CLASS MANAGEMENT MODULE

# CẤP ĐỘ KIỂM THỬ: KIỂM THỬ ĐƠN VỊ (UNIT TEST)

---

## 1. THÔNG TIN CHUNG

- **PHÂN HỆ HỆ THỐNG:** `UT04` - Phân hệ Quản lý Lớp học tổng, Phân công GVBM & Thành viên lớp học
- **MÔ TẢ MODULE API:** GVCN khởi tạo Lớp tổng, thêm học sinh và phân công GVBM, cơ chế Vào lớp 1-chạm (sinh mã mời `invite_code`, link mời `invite_link`), Phụ huynh tham gia lớp xác nhận con em, GVBM truy cập lớp theo môn giảng dạy, quản lý thêm/xóa học sinh (`ClassesService`, `ClassesController`)
- **NGƯỜI THỰC HIỆN / VIẾT TESTCASE:** Kim Chi Ha
- **TẬP TIN KIỂM THỬ:** [API_Classes](https://github.com/gray8493/GiaoVienHay/tree/main/docs/apis/classes)
- **MÔI TRƯỜNG KIỂM THỬ:** Testing / Postman API Client

---

## 2. CHI TIẾT CÁC KỊCH BẢN KIỂM THỬ ĐƠN VỊ

---

### UT04_Classes_TC01 : GVCN TẠO LỚP HỌC TỔNG, THÊM HỌC SINH VÀ PHÂN CÔNG GVBM THÀNH CÔNG

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
  3. Thêm dữ liệu cấu hình lớp học vào phần **Body** định dạng `raw (application/json)` theo mẫu JSON trên.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  - Hệ thống phản hồi mã trạng thái **HTTP 201 (CREATED - ĐÃ TẠO THÀNH CÔNG)**.
  - Tạo document lớp học trong `/classes` kèm mã mời ngẫu nhiên `invite_code` (ví dụ `GVH1A26`) và đường dẫn mời `invite_link`.
  - Batch write khởi tạo các document học sinh trong `/students` và hồ sơ theo dõi BHYT trong `/fees_and_insurance`.
  - Tự động gộp các môn của GVCN cùng môn của GVBM vào mảng `assigned_subjects`.
  - Dữ liệu trả về đúng định dạng JSON chuẩn như sau:

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
    }
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT04_Classes_TC02 : TỪ CHỐI TẠO LỚP HỌC KHI THIẾU TÊN HOẶC KHỐI LỚP KHÔNG HỢP LỆ

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - GVCN đã đăng nhập hợp lệ vào hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_gvcn_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "name": "",
    "grade_level": 15,
    "academic_year": "2026-2027"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` của GVCN vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/classes`.
  3. Thêm dữ liệu có tên lớp rỗng và khối lớp vượt quá quy định (chỉ cho phép 1 đến 9) vào phần **Body**.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  - Hệ thống ném ra ngoại lệ **HTTP 400 (BAD REQUEST - YÊU CẦU KHÔNG HỢP LỆ)**.
  - Tuyệt đối không tạo document lớp học trong Firestore.
  - Dữ liệu lỗi phản hồi định dạng JSON như sau:

  ```json
  {
    "success": false,
    "status_code": 400,
    "error_code": "VALIDATION_FAILED",
    "message": "Tên lớp học không được để trống và khối lớp (grade_level) phải từ 1 đến 9"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT04_Classes_TC03 : LẤY DANH SÁCH CÁC LỚP HỌC GIÁO VIÊN ĐANG PHỤ TRÁCH THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Giáo viên đã đăng nhập và được phân công làm Chủ nhiệm tại lớp `cls_1a_2026` hoặc dạy bộ môn tại lớp `cls_2b_2026`.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien_hop_le>`
  - **Tham số truy vấn (Query Params JSON):**

  ```json
  {}
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` của giáo viên vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/classes`.
  3. Không cần truyền dữ liệu vào phần Body.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Trả về danh sách tất cả các lớp mà giáo viên tham gia (phân định rõ vai trò `HOMEROOM` hay `SUBJECT`).
  - Dữ liệu trả về đúng định dạng JSON chuẩn như sau:

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
    ]
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT04_Classes_TC04 : XEM THÔNG TIN CHI TIẾT LỚP HỌC THEO ID THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Lớp học `cls_1a_2026` tồn tại trên hệ thống.
  - Người dùng (GVCN, GVBM hoặc Phụ huynh của lớp) có quyền truy cập.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_nguoi_dung_hop_le>`
  - **Tham số đường dẫn (Path Params):** `id = cls_1a_2026`
  - **Tham số truy vấn (Query Params JSON):**

  ```json
  {}
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/classes/cls_1a_2026`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Trả về chi tiết thông tin lớp học, sĩ số, thông tin GVCN và danh sách GVBM các bộ môn.
  - Dữ liệu trả về đúng định dạng JSON chuẩn như sau:

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
    }
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT04_Classes_TC05 : GVBM TRUY CẬP LỚP TỔNG THEO ĐÚNG MÔN ĐƯỢC PHÂN CÔNG THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Giáo viên bộ môn `uid_gvbm_eng` đã được phân công giảng dạy môn `ENG` tại lớp `cls_1a_2026`.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_gvbm_eng>`
  - **Tham số đường dẫn (Path Params):** `id = cls_1a_2026`
  - **Tham số truy vấn (Query Params JSON):**

  ```json
  {}
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` của GVBM vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/classes/cls_1a_2026/my-subject`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Trả về danh sách học sinh của lớp tổng kèm quyền hạn nhập điểm chính xác đối với môn `ENG`.
  - Dữ liệu trả về đúng định dạng JSON chuẩn như sau:

  ```json
  {
    "success": true,
    "status_code": 200,
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
    }
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT04_Classes_TC06 : CHẶN GVBM TRUY CẬP KHI KHÔNG ĐƯỢC PHÂN CÔNG BỘ MÔN NÀO TRONG LỚP

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Giáo viên `usr_gvbm_la` đã đăng nhập nhưng không có tên trong danh sách phân công bộ môn của lớp `cls_1a_2026`.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_gvbm_la>`
  - **Tham số đường dẫn (Path Params):** `id = cls_1a_2026`
  - **Tham số truy vấn (Query Params JSON):**

  ```json
  {}
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` của GVBM không được phân công vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/classes/cls_1a_2026/my-subject`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  - Hệ thống ném ra ngoại lệ **HTTP 403 (FORBIDDEN - CẤM TRUY CẬP)**.
  - Chặn quyền xem và sửa bảng điểm môn học của lớp này.
  - Dữ liệu lỗi phản hồi định dạng JSON như sau:

  ```json
  {
    "success": false,
    "status_code": 403,
    "error_code": "FORBIDDEN_SUBJECT_ACCESS",
    "message": "Bạn không được phân công giảng dạy bộ môn nào trong lớp học này"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT04_Classes_TC07 : GVCN LẤY MÃ MỜI VÀ LINK MỜI THAM GIA LỚP HỌC THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - GVCN phụ trách lớp `cls_1a_2026` đã đăng nhập thành công.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_gvcn_hop_le>`
  - **Tham số đường dẫn (Path Params):** `id = cls_1a_2026`
  - **Tham số truy vấn (Query Params JSON):**

  ```json
  {}
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` của GVCN vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/classes/cls_1a_2026/invite`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Trả về mã mời (`invite_code`), link mời trực tiếp (`invite_link`) và mã QR để GVCN sao chép gửi vào nhóm Zalo phụ huynh.
  - Dữ liệu trả về đúng định dạng JSON chuẩn như sau:

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
    }
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT04_Classes_TC08 : PHỤ HUYNH THAM GIA LỚP QUA MÃ MỜI VÀ XÁC NHẬN LIÊN KẾT CON EM THÀNH CÔNG

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
  - Phụ huynh chính thức được cấp quyền xem điểm, chuyên cần và nhận thông báo FCM liên quan đến con mình.
  - Dữ liệu trả về đúng định dạng JSON chuẩn như sau:

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
    }
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT04_Classes_TC09 : TỪ CHỐI PHỤ HUYNH VÀO LỚP KHI MÃ MỜI KHÔNG HỢP LỆ HOẶC HẾT HẠN

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Phụ huynh đã đăng nhập với vai trò `PARENT`.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_parent_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "invite_code": "GVH_MA_SAI_999",
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
  - Tuyệt đối không liên kết phụ huynh vào bất kỳ lớp học hay học sinh nào.
  - Dữ liệu lỗi phản hồi định dạng JSON như sau:

  ```json
  {
    "success": false,
    "status_code": 404,
    "error_code": "INVALID_INVITE_CODE",
    "message": "Mã mời lớp học không tồn tại hoặc đã hết hạn sử dụng"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT04_Classes_TC10 : GVCN THÊM HỌC SINH MỚI VÀO LỚP HỌC HIỆN TẠI THÀNH CÔNG

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
  3. Thêm dữ liệu học sinh mới cần bổ sung vào phần **Body** định dạng `raw (application/json)`.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  - Hệ thống phản hồi mã trạng thái **HTTP 201 (CREATED - ĐÃ TẠO THÀNH CÔNG)**.
  - Tạo mới document học sinh trong `/students` và cập nhật tăng trường sĩ số `total_students` của lớp trong `/classes/cls_1a_2026`.
  - Dữ liệu trả về đúng định dạng JSON chuẩn như sau:

  ```json
  {
    "success": true,
    "status_code": 201,
    "message": "Thêm học sinh vào lớp học thành công",
    "data": {
      "class_id": "cls_1a_2026",
      "added_count": 1,
      "total_students": 36
    }
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**
