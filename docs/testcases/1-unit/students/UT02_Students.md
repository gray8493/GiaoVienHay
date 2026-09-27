# TÀI LIỆU KỊCH BẢN KIỂM THỬ ĐƠN VỊ - PHÂN HỆ HỌC SINH & CỔNG PHỤ HUYNH
# MÃ PHÂN HỆ: 02 - SCHOOL & ACADEMIC STRUCTURE MODULE
# CẤP ĐỘ KIỂM THỬ: KIỂM THỬ ĐƠN VỊ (UNIT TEST)

---

## 1. THÔNG TIN CHUNG

- **PHÂN HỆ HỆ THỐNG:** `02` - Phân hệ Hồ sơ học sinh & Cổng tra cứu phụ huynh
- **MÔ TẢ MODULE API:** Trung tâm học vụ học sinh (`StudentsService`, `StudentsController`)
- **TẬP TIN KIỂM THỬ:** 
- **MÔI TRƯỜNG KIỂM THỬ:** Testing

---

## 2. CHI TIẾT CÁC KỊCH BẢN KIỂM THỬ ĐƠN VỊ

---

### UT02_Students_TC01 : PHỤ HUYNH XEM THÔNG TIN LÝ LỊCH CON CÁI THUỘC QUYỀN QUẢN LÝ THÀNH CÔNG

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
  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Trả về đầy đủ thông tin học sinh thuộc quyền giám hộ.
  - Dữ liệu trả về đúng định dạng JSON chuẩn như sau:

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

### UT02_Students_TC02 : CHẶN PHỤ HUYNH TRA CỨU THÔNG TIN HỌC SINH KHÔNG PHẢI CON MÌNH

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
  - Hệ thống ném ra ngoại lệ từ chối quyền truy cập **HTTP 403 (FORBIDDEN - CẤM TRUY CẬP)**.
  - Dữ liệu lỗi trả về đúng định dạng JSON chuẩn như sau:

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

### UT02_Students_TC03 : TRA CỨU BẢNG ĐIỂM ĐA MÔN HỌC VÀ CÁC CỘT ĐIỂM THÀNH PHẦN

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
  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Trả về danh sách môn học kèm chi tiết từng cột điểm thành phần.
  - Dữ liệu trả về đúng định dạng JSON chuẩn như sau:

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

### UT02_Students_TC04 : PHỤ HUYNH XEM SỔ LIÊN LẠC NHẬN XÉT CỦA CON THEO HỌC KỲ

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
  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Dữ liệu trả về đúng định dạng JSON chuẩn như sau:

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

### UT02_Students_TC05 : TRA CỨU TÌNH TRẠNG NỘP HỌC PHÍ VÀ BẢO HIỂM Y TẾ (BHYT)

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
  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Hiển thị đầy đủ tình trạng đã nộp hay chưa kèm mốc thời gian thực tế.
  - Dữ liệu trả về đúng định dạng JSON chuẩn như sau:

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
