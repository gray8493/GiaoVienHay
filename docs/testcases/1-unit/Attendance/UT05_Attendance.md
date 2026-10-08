# TÀI LIỆU KỊCH BẢN KIỂM THỬ ĐƠN VỊ - PHÂN HỆ ĐIỂM DANH & CHUYÊN CẦN (ATTENDANCE)

# MÃ PHÂN HỆ: 05 - ATTENDANCE & PUNCTUALITY MODULE

# CẤP ĐỘ KIỂM THỬ: KIỂM THỬ ĐƠN VỊ (UNIT TEST)

---

## 1. THÔNG TIN CHUNG

- **PHÂN HỆ HỆ THỐNG:** `05` - Phân hệ Điểm danh & Theo dõi chuyên cần học sinh (`/api/v1/attendance`)
- **MÔ TẢ MODULE API:** Điểm danh chuyên cần đầu giờ 1-chạm, tự động kích hoạt thông báo đẩy tức thời FCM tới phụ huynh khi học sinh vắng, cập nhật lại trạng thái điểm danh (đến muộn / có phép), tra cứu lịch sử chuyên cần của lớp và trích xuất danh sách học sinh có mặt hôm nay cho Vòng quay ngẫu nhiên kiểm tra bài cũ (`AttendanceService`, `AttendanceController`).
- **NGƯỜI THỰC HIỆN / VIẾT TESTCASE:** Kim Chi Ha
- **TẬP TIN ĐẶC TẢ API:** [API_Attendance](https://github.com/gray8493/GiaoVienHay/tree/main/docs/apis/attendance)
- **MÔI TRƯỜNG KIỂM THỬ:** Testing / Postman API Client / Jest Unit Testing

---

## 2. CHI TIẾT CÁC KỊCH BẢN KIỂM THỬ ĐƠN VỊ

---

### PHẦN I: CÁC KỊCH BẢN KIỂM THỬ THẤT BẠI & BÁO LỖI (NEGATIVE / FALSE CASES)

---

#### 1. Nhóm Kịch Bản Thiếu Các Trường Bắt Buộc (Missing Required Fields)

---

##### UT05_Attendance_TC01 : TỪ CHỐI ĐIỂM DANH KHI KHÔNG NHẬP HOẶC ĐỂ TRỐNG MÃ LỚP HỌC (MISSING CLASS_ID)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - GVCN đã đăng nhập hợp lệ vào hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_gvcn_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):** Không truyền hoặc để trống trường `class_id`:
  ```json
  {
    "class_id": "",
    "attendance_date": "2026-09-23",
    "period": 1,
    "records": [
      {
        "student_id": "stu_01",
        "status": "PRESENT"
      }
    ]
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của GVCN vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/attendance/submit`.
  3. Gửi payload thiếu trường `class_id`.
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
        "field": "class_id",
        "issue": "Mã lớp học (class_id) bắt buộc và không được để trống"
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT05_Attendance_TC02 : TỪ CHỐI ĐIỂM DANH KHI KHÔNG NHẬP HOẶC ĐỂ TRỐNG NGÀY ĐIỂM DANH (MISSING ATTENDANCE_DATE)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - GVCN đã đăng nhập hợp lệ vào hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_gvcn_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):** Để trống trường `attendance_date`:
  ```json
  {
    "class_id": "cls_1a_2026",
    "attendance_date": "",
    "period": 1,
    "records": [
      {
        "student_id": "stu_01",
        "status": "PRESENT"
      }
    ]
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của GVCN vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/attendance/submit`.
  3. Gửi payload thiếu `attendance_date`.
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
        "field": "attendance_date",
        "issue": "Ngày điểm danh (attendance_date) bắt buộc và không được để trống"
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT05_Attendance_TC03 : TỪ CHỐI ĐIỂM DANH KHI KHÔNG TRUYỀN HOẶC ĐỂ TRỐNG DANH SÁCH BẢN GHI HỌC SINH (MISSING / EMPTY RECORDS)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - GVCN đã đăng nhập hợp lệ vào hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_gvcn_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):** Mảng `records` rỗng `[]`:
  ```json
  {
    "class_id": "cls_1a_2026",
    "attendance_date": "2026-09-23",
    "period": 1,
    "records": []
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của GVCN vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/attendance/submit`.
  3. Gửi payload có mảng `records: []`.
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
        "field": "records",
        "issue": "Danh sách học sinh điểm danh (records) không được rỗng (tối thiểu 1 học sinh)"
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT05_Attendance_TC04 : TỪ CHỐI ĐIỂM DANH KHI BẢN GHI THIẾU MÃ HỌC SINH HOẶC THIẾU TRẠNG THÁI CHUYÊN CẦN

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - GVCN đã đăng nhập hợp lệ vào hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_gvcn_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):** Phần tử thiếu `student_id` và phần tử thiếu `status`:
  ```json
  {
    "class_id": "cls_1a_2026",
    "attendance_date": "2026-09-23",
    "period": 1,
    "records": [
      {
        "student_id": "",
        "status": "PRESENT"
      },
      {
        "student_id": "stu_02"
      }
    ]
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của GVCN vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/attendance/submit`.
  3. Gửi payload thiếu thông tin bắt buộc trong phần tử mảng.
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
        "field": "records[0].student_id",
        "issue": "Mã định danh học sinh (student_id) bắt buộc và không được để trống"
      },
      {
        "field": "records[1].status",
        "issue": "Trạng thái điểm danh (status) bắt buộc phải được chọn"
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT05_Attendance_TC05 : TỪ CHỐI CẬP NHẬT ĐIỂM DANH KHI KHÔNG TRUYỀN ID HOẶC THIẾU TRẠNG THÁI MỚI (PATCH ATTENDANCE)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - GVCN đã đăng nhập hợp lệ vào hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_gvcn_hop_le>`
    - `Content-Type: application/json`
  - **Tham số đường dẫn (Path Params):** `id = att_01`
  - **Dữ liệu thân (Body JSON):** Không truyền trường bắt buộc `status`:
  ```json
  {
    "note": "Chỉ cập nhật ghi chú mà không chọn trạng thái mới"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của GVCN vào mục **Headers**.
  2. Chọn phương thức **`PATCH`**, nhập đường dẫn API: `/api/v1/attendance/att_01`.
  3. Gửi Body JSON thiếu trường bắt buộc `status`.
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
        "field": "status",
        "issue": "Trạng thái điểm danh (status) bắt buộc phải được cung cấp"
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

#### 2. Nhóm Kịch Bản Dữ Liệu Nghiệp Vụ & Mã Lỗi Chuyên Cần (Business Error Codes)

---

##### UT05_Attendance_TC06 : TỪ CHỐI ĐIỂM DANH KHI NGÀY KHÔNG TỒN TẠI TRONG LỊCH THỰC TẾ (ATTEND_DATE_INVALID)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - GVCN đã đăng nhập hợp lệ vào hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_gvcn_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):** Nhập ngày không tồn tại trên lịch thực tế `2026-02-30`:
  ```json
  {
    "class_id": "cls_1a_2026",
    "attendance_date": "2026-02-30",
    "period": 1,
    "records": [
      {
        "student_id": "stu_01",
        "status": "PRESENT"
      }
    ]
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của GVCN vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/attendance/submit`.
  3. Gửi dữ liệu có ngày `2026-02-30` vào phần **Body**.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống ném ra ngoại lệ **HTTP 400 (BAD REQUEST - YÊU CẦU KHÔNG HỢP LỆ)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:
  ```json
  {
    "success": false,
    "status_code": 400,
    "message": "Dữ liệu ngày gửi lên không hợp lệ hoặc không tồn tại trong lịch thực tế",
    "error_code": "ATTEND_DATE_INVALID",
    "details": [
      {
        "field": "attendance_date",
        "issue": "Giá trị '2026-02-30' không phải là ngày hợp lệ trong lịch thực tế (tháng 2 năm 2026 chỉ có 28 ngày)"
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT05_Attendance_TC07 : TỪ CHỐI ĐIỂM DANH KHI NGÀY ĐIỂM DANH Ở THỜI ĐIỂM TƯƠNG LAI (ATTEND_DATE_IN_FUTURE)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - GVCN đã đăng nhập hợp lệ vào hệ thống.
  - Ngày hiện tại của hệ thống là `2026-09-27`.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_gvcn_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):** Nhập ngày điểm danh trong tương lai `2026-12-31`:
  ```json
  {
    "class_id": "cls_1a_2026",
    "attendance_date": "2026-12-31",
    "period": 1,
    "records": [
      {
        "student_id": "stu_01",
        "status": "PRESENT"
      }
    ]
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của GVCN vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/attendance/submit`.
  3. Gửi dữ liệu có ngày vượt quá ngày hiện tại.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống ném ra ngoại lệ **HTTP 400 (BAD REQUEST - YÊU CẦU KHÔNG HỢP LỆ)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:
  ```json
  {
    "success": false,
    "status_code": 400,
    "message": "Không thể thực hiện điểm danh cho ngày trong tương lai",
    "error_code": "ATTEND_DATE_IN_FUTURE",
    "details": [
      {
        "field": "attendance_date",
        "issue": "Ngày điểm danh không được vượt quá ngày hiện tại (2026-09-27)"
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT05_Attendance_TC08 : TỪ CHỐI ĐIỂM DANH KHI GHI CHÚ VƯỢT QUÁ GIỚI HẠN ĐỘ DÀI CHO PHÉP (MAX 255 KÝ TỰ)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - GVCN đã đăng nhập hợp lệ vào hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_gvcn_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):** Chuỗi `note` dài 310 ký tự:
  ```json
  {
    "class_id": "cls_1a_2026",
    "attendance_date": "2026-09-23",
    "period": 1,
    "records": [
      {
        "student_id": "stu_01",
        "status": "ABSENT_EXCUSED",
        "note": "Học sinh này xin nghỉ ốm dài ngày do bị sốt xuất huyết nhập viện từ đầu tuần trước, gia đình đã gọi điện cho cô giáo chủ nhiệm từ sáng sớm và hứa sẽ nộp giấy ra viện và đơn xin phép đầy đủ vào tuần tới sau khi học sinh bình phục hoàn toàn. Cô giáo ghi chú lại để theo dõi việc học tập bổ sung."
      }
    ]
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của GVCN vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/attendance/submit`.
  3. Thêm bản ghi có `note` vượt quá 255 ký tự vào phần **Body**.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống ném ra ngoại lệ **HTTP 400 (BAD REQUEST - YÊU CẦU KHÔNG HỢP LỆ)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:
  ```json
  {
    "success": false,
    "status_code": 400,
    "message": "Nội dung ghi chú vượt quá giới hạn độ dài cho phép",
    "error_code": "COMMON_VALIDATION_ERROR",
    "details": [
      {
        "field": "records[0].note",
        "issue": "Ghi chú không được vượt quá 255 ký tự (hiện tại: 310 ký tự)"
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT05_Attendance_TC09 : TỪ CHỐI ĐIỂM DANH TRÙNG LẶP KHI BUỔI HỌC ĐÃ ĐƯỢC ĐIỂM DANH TRƯỚC ĐÓ (ATTEND_ALREADY_EXISTS)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Lớp `cls_1a_2026` đã được điểm danh tiết 1 ngày `2026-09-23` thành công trước đó trong cơ sở dữ liệu.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_gvcn_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):** Gửi lại yêu cầu điểm danh cùng ngày và cùng tiết:
  ```json
  {
    "class_id": "cls_1a_2026",
    "attendance_date": "2026-09-23",
    "period": 1,
    "records": [
      {
        "student_id": "stu_01",
        "status": "PRESENT"
      }
    ]
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của GVCN vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/attendance/submit`.
  3. Gửi payload điểm danh trùng với buổi học đã có dữ liệu.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống ném ra ngoại lệ xung đột dữ liệu **HTTP 409 (CONFLICT - XUNG ĐỘT BẢN GHI)**.
  - Ngăn chặn ghi đè làm sai lệch dữ liệu lịch sử điểm danh của lớp.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:
  ```json
  {
    "success": false,
    "status_code": 409,
    "message": "Tiết học/buổi học này đã được điểm danh trước đó",
    "error_code": "ATTEND_ALREADY_EXISTS",
    "details": null,
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT05_Attendance_TC10 : BÁO LỖI KHI CẬP NHẬT BẢN GHI ĐIỂM DANH VỚI MÃ ID KHÔNG TỒN TẠI (ATTEND_RECORD_NOT_FOUND)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - GVCN đã đăng nhập hợp lệ với vai trò `TEACHER_HOMEROOM`.
  - Mã bản ghi điểm danh `att_non_existent` không tồn tại trong Firestore collection `/attendances`.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_gvcn_hop_le>`
    - `Content-Type: application/json`
  - **Tham số đường dẫn (Path Params):** `id = att_non_existent`
  - **Dữ liệu thân (Body JSON):**
  ```json
  {
    "status": "PRESENT"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của GVCN vào mục **Headers**.
  2. Chọn phương thức **`PATCH`**, nhập đường dẫn API: `/api/v1/attendance/att_non_existent`.
  3. Thêm Body JSON hợp lệ.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 404 (NOT FOUND - KHÔNG TÌM THẤY)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:
  ```json
  {
    "success": false,
    "status_code": 404,
    "message": "Không tìm thấy bản ghi điểm danh yêu cầu",
    "error_code": "ATTEND_RECORD_NOT_FOUND",
    "details": null,
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT05_Attendance_TC11 : BÁO LỖI KHI ĐIỂM DANH CHO LỚP HỌC KHÔNG TỒN TẠI TRÊN HỆ THỐNG (CLASS_NOT_FOUND)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - GVCN đã đăng nhập hợp lệ.
  - Mã lớp học `cls_khong_ton_tai` hoàn toàn không có trong cơ sở dữ liệu hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_gvcn_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):**
  ```json
  {
    "class_id": "cls_khong_ton_tai",
    "attendance_date": "2026-09-23",
    "period": 1,
    "records": [
      {
        "student_id": "stu_01",
        "status": "PRESENT"
      }
    ]
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/attendance/submit`.
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

##### UT05_Attendance_TC12 : CHẶN GIÁO VIÊN KHÔNG PHẢI CHỦ NHIỆM THỰC HIỆN ĐIỂM DANH LỚP HỌC (CLASS_NOT_HOMEROOM_TEACHER)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên bộ môn hoặc giáo viên khác (`usr_teacher_other`) đã đăng nhập nhưng không được phân công làm Chủ nhiệm tại lớp `cls_1a_2026`.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_giao_vien_bo_mon>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):**
  ```json
  {
    "class_id": "cls_1a_2026",
    "attendance_date": "2026-09-23",
    "period": 1,
    "records": [
      {
        "student_id": "stu_01",
        "status": "PRESENT"
      }
    ]
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của giáo viên không có thẩm quyền GVCN vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/attendance/submit`.
  3. Thêm dữ liệu điểm danh vào phần **Body**.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống ném ra ngoại lệ **HTTP 403 (FORBIDDEN - CẤM TRUY CẬP)** do vi phạm quyền hạn RBAC.
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

##### UT05_Attendance_TC13 : XỬ LÝ NGOẠI LỆ LỖI HỆ THỐNG KHI MẤT KẾT NỐI DATABASE HOẶC LỖI DỊCH VỤ ĐẨY FCM

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - GVCN đã đăng nhập hợp lệ.
  - Cơ sở dữ liệu Cloud Firestore hoặc dịch vụ Firebase Cloud Messaging (FCM) tạm thời gặp sự cố mất kết nối, timeout hoặc ném lỗi ngoại lệ chưa được kiểm soát.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_gvcn_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):**
  ```json
  {
    "class_id": "cls_1a_2026",
    "attendance_date": "2026-09-23",
    "period": 1,
    "records": [
      {
        "student_id": "stu_01",
        "status": "ABSENT_UNEXCUSED"
      }
    ]
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của GVCN vào mục **Headers**.
  2. Giả lập / Mocking kết nối Firestore hoặc Firebase FCM ném ra lỗi ngoại lệ `FirebaseError: Deadline Exceeded / Service Unavailable`.
  3. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/attendance/submit`.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Bộ lọc ngoại lệ toàn cục (Global Exception Filter) bắt lỗi và chuyển đổi thành mã trạng thái **HTTP 500 (INTERNAL SERVER ERROR - LỖI MÁY CHỦ NỘI BỘ)** mà không làm crash tiến trình ứng dụng.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:
  ```json
  {
    "success": false,
    "status_code": 500,
    "message": "Lỗi máy chủ nội bộ hoặc lỗi kết nối Firebase",
    "error_code": "SYS_INTERNAL_ERROR",
    "details": null,
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### PHẦN II: CÁC KỊCH BẢN KIỂM THỬ THÀNH CÔNG (POSITIVE / TRUE CASES)

---

#### UT05_Attendance_TC14 : GVCN ĐIỂM DANH ĐẦU GIỜ THÀNH CÔNG CÓ HỌC SINH VẮNG VÀ TỰ ĐỘNG BẮN FCM THÔNG BÁO TỚI PHỤ HUYNH

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên chủ nhiệm đã đăng nhập thành công với vai trò `TEACHER_HOMEROOM` và được phân công phụ trách lớp `cls_1a_2026`.
  - Các học sinh `stu_01`, `stu_02`, `stu_03` đã tồn tại trong bộ sưu tập `/students` và đã liên kết tài khoản phụ huynh với FCM token hợp lệ.
  - Buổi học ngày `2026-09-23` chưa được điểm danh trước đó.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_gvcn_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):**
  ```json
  {
    "class_id": "cls_1a_2026",
    "attendance_date": "2026-09-23",
    "period": 1,
    "records": [
      {
        "student_id": "stu_01",
        "status": "PRESENT",
        "note": null
      },
      {
        "student_id": "stu_02",
        "status": "ABSENT_EXCUSED",
        "note": "Phụ huynh xin nghỉ ốm qua điện thoại"
      },
      {
        "student_id": "stu_03",
        "status": "ABSENT_UNEXCUSED",
        "note": null
      }
    ]
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của GVCN vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/attendance/submit`.
  3. Thêm dữ liệu điểm danh đầy đủ vào phần **Body** định dạng `raw (application/json)`.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 201 (CREATED - ĐÃ TẠO THÀNH CÔNG)**.
  - Phản hồi kèm Header đo lường hiệu năng: `X-Response-Time: <duration>ms`.
  - Ghi nhận 3 bản ghi điểm danh vào cơ sở dữ liệu Cloud Firestore tại collection `/attendances`.
  - Tự động xóa bộ nhớ đệm In-Memory RAM Cache danh sách học sinh có mặt hôm nay của lớp (`att_present_cls_1a_2026_2026-09-23`).
  - Hệ thống tự động phát sự kiện xử lý ngầm (Event-driven qua `EventEmitter2` sự kiện `attendance.absent`) để Worker gửi Multicast FCM Notification đến 2 phụ huynh có học sinh vắng (`stu_02`, `stu_03`) mà không block luồng phản hồi HTTP của giáo viên.
  - Dữ liệu trả về đúng định dạng JSON chuẩn:
  ```json
  {
    "success": true,
    "status_code": 201,
    "message": "Điểm danh hoàn tất",
    "data": {
      "message": "Điểm danh hoàn tất",
      "total_students": 3,
      "present_count": 1,
      "absent_count": 2,
      "notified_parents_queued": 2
    },
    "timestamp": "2026-10-04T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

#### UT05_Attendance_TC15 : GVCN ĐIỂM DANH ĐẦU GIỜ THÀNH CÔNG KHI 100% HỌC SINH CÓ MẶT (KHÔNG CÓ HỌC SINH VẮNG)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - GVCN đã đăng nhập thành công với vai trò `TEACHER_HOMEROOM` tại lớp `cls_1a_2026`.
  - Buổi học ngày `2026-09-24` chưa được điểm danh.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_gvcn_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):** Tất cả học sinh đều có trạng thái `PRESENT`:
  ```json
  {
    "class_id": "cls_1a_2026",
    "attendance_date": "2026-09-24",
    "period": 1,
    "records": [
      {
        "student_id": "stu_01",
        "status": "PRESENT",
        "note": null
      },
      {
        "student_id": "stu_02",
        "status": "PRESENT",
        "note": null
      },
      {
        "student_id": "stu_03",
        "status": "PRESENT",
        "note": null
      }
    ]
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của GVCN vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/attendance/submit`.
  3. Gửi request với dữ liệu 100% học sinh có mặt.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 201 (CREATED - ĐÃ TẠO THÀNH CÔNG)**.
  - Phản hồi kèm Header `X-Response-Time`.
  - Lưu đầy đủ 3 bản ghi điểm danh vào Cloud Firestore.
  - Số lượng phụ huynh cần thông báo `notified_parents_queued = 0`, không kích hoạt sự kiện FCM ngầm.
  - Dữ liệu trả về đúng định dạng JSON chuẩn:
  ```json
  {
    "success": true,
    "status_code": 201,
    "message": "Điểm danh hoàn tất",
    "data": {
      "message": "Điểm danh hoàn tất",
      "total_students": 3,
      "present_count": 3,
      "absent_count": 0,
      "notified_parents_queued": 0
    },
    "timestamp": "2026-10-04T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

#### UT05_Attendance_TC16 : CẬP NHẬT TRẠNG THÁI ĐIỂM DANH KHI HỌC SINH ĐẾN MUỘN HOẶC XIN PHÉP THÀNH CÔNG (PATCH ATTENDANCE)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - GVCN đã đăng nhập thành công.
  - Bản ghi điểm danh `att_02` của học sinh `stu_02` đang ở trạng thái `ABSENT_UNEXCUSED`.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_gvcn_hop_le>`
    - `Content-Type: application/json`
  - **Tham số đường dẫn (Path Params):** `id = att_02`
  - **Dữ liệu thân (Body JSON):** Cập nhật sang trạng thái `LATE` (hoặc `ABSENT_EXCUSED`):
  ```json
  {
    "status": "LATE",
    "note": "Học sinh đến lớp muộn 15 phút do thời tiết mưa lớn"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của GVCN vào mục **Headers**.
  2. Chọn phương thức **`PATCH`**, nhập đường dẫn API: `/api/v1/attendance/att_02`.
  3. Thêm trạng thái cập nhật `LATE` và ghi chú vào phần **Body**.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Cập nhật tài liệu `att_02` trong Firestore: đổi trạng thái thành `LATE`, cập nhật `note` và `updated_at`.
  - Dữ liệu trả về đúng định dạng JSON chuẩn:
  ```json
  {
    "success": true,
    "status_code": 200,
    "message": "Cập nhật điểm danh thành công",
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

#### UT05_Attendance_TC17 : XEM LỊCH SỬ CHUYÊN CẦN CỦA LỚP THEO NGÀY HOẶC THEO THÁNG THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên phụ trách lớp `cls_1a_2026` đã đăng nhập thành công.
  - Đã có dữ liệu điểm danh ngày `2026-09-23` và tháng `2026-09` trong Cloud Firestore.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien_hop_le>`
  - **Tham số đường dẫn (Path Params):** `classId = cls_1a_2026`
  - **Tham số truy vấn (Query Params):** `date = 2026-09-23` (hoặc `month = 2026-09`)
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/attendance/class/cls_1a_2026?date=2026-09-23`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Trả về danh sách chi tiết các bản ghi chuyên cần của từng học sinh trong ngày hoặc tháng được chỉ định.
  - Dữ liệu trả về đúng định dạng JSON chuẩn:
  ```json
  {
    "success": true,
    "status_code": 200,
    "data": [
      {
        "id": "att_01",
        "student_id": "stu_01",
        "student_name": "Trần Bảo Nam",
        "attendance_date": "2026-09-23",
        "status": "PRESENT",
        "note": null,
        "updated_at": "2026-09-23T07:15:00.000Z"
      },
      {
        "id": "att_02",
        "student_id": "stu_02",
        "student_name": "Lê Ngọc Mai",
        "attendance_date": "2026-09-23",
        "status": "ABSENT_EXCUSED",
        "note": "Phụ huynh xin nghỉ ốm qua điện thoại",
        "updated_at": "2026-09-23T07:15:00.000Z"
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

#### UT05_Attendance_TC18 : TRÍCH XUẤT DANH SÁCH HỌC SINH CÓ MẶT HÔM NAY PHỤC VỤ VÒNG QUAY RANDOM THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Lớp `cls_1a_2026` đã hoàn thành điểm danh đầu giờ hôm nay (`2026-09-23`).
  - Có các học sinh mang trạng thái `PRESENT`.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien_hop_le>`
  - **Tham số đường dẫn (Path Params):** `classId = cls_1a_2026`
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của giáo viên vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/attendance/today/cls_1a_2026`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Phản hồi kèm Header `X-Response-Time` với độ trễ cực thấp (< 5ms khi Cache-hit).
  - Kết quả được lưu tạm vào bộ nhớ RAM In-Memory Cache (`att_present_cls_1a_2026_<today>`) với thời gian tồn tại (TTL) 15 phút.
  - Trả về danh sách chính xác các học sinh thực tế có mặt hôm nay (loại trừ các học sinh vắng) phục vụ nạp danh sách vào tính năng Vòng quay may mắn kiểm tra bài cũ.
  - Dữ liệu trả về đúng định dạng JSON chuẩn:
  ```json
  {
    "success": true,
    "status_code": 200,
    "message": "Thao tác thành công",
    "data": {
      "class_id": "cls_1a_2026",
      "today": "2026-10-04",
      "present_students": [
        {
          "id": "stu_01",
          "full_name": "Trần Bảo Nam",
          "student_code": "HS001"
        },
        {
          "id": "stu_04",
          "full_name": "Hoàng Minh Khôi",
          "student_code": "HS004"
        }
      ]
    },
    "timestamp": "2026-10-04T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

#### UT05_Attendance_TC19 : TỰ ĐỘNG XÓA BỘ NHỚ ĐỆM RAM CACHE KHI ĐIỂM DANH LẠI THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Danh sách học sinh có mặt hôm nay của lớp `cls_1a_2026` đang được lưu cache tại key `att_present_cls_1a_2026_<today>`.
  - Học sinh `stu_02` đến muộn và được GVCN cập nhật lại từ `ABSENT` sang `PRESENT`.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_gvcn_hop_le>`, `Content-Type: application/json`
  - **Body JSON:** Gửi điểm danh cập nhật bổ sung cho lớp `cls_1a_2026`.
- **CÁC BƯỚC THỰC HIỆN:**
  1. Gửi request `POST /api/v1/attendance/submit` để điểm danh bổ sung học sinh đến muộn.
  2. Hệ thống thực thi hàm `this.cacheManager.del(cacheKey)`.
  3. Gửi lại request `GET /api/v1/attendance/today/cls_1a_2026`.
- **KẾT QUẢ MONG ĐỢI:**
  - Cache cũ bị vô hiệu hóa ngay lập tức.
  - Lần truy vấn `GET /today` tiếp theo truy xuất trực tiếp từ Firestore với danh sách học sinh có mặt mới nhất (bao gồm cả `stu_02`), sau đó lưu lại vào cache mới.
- **TRẠNG THÁI KIỂM THỬ:**

---

#### UT05_Attendance_TC20 : XỬ LÝ TRẠNG THÁI RỖNG AN TOÀN KHI LỚP HỌC CHƯA CÓ DỮ LIỆU LỊCH SỬ ĐIỂM DANH TRONG CƠ SỞ DỮ LIỆU (EMPTY STATE - 200 OK)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Lớp học mới tạo hoặc trong tháng truy vấn (`2026-08`) chưa từng có bất kỳ buổi học nào được ghi nhận điểm danh trong Firestore collection `/attendances`.
  - Giáo viên chủ nhiệm đã đăng nhập hợp lệ với vai trò `TEACHER_HOMEROOM`.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_gvcn_hop_le>`
  - **Tham số đường dẫn (Path Params):** `classId = cls_new_2026`
  - **Tham số truy vấn (Query Params):** `month = "2026-08"`
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của GVCN vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/attendance/history/cls_new_2026?month=2026-08`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Phản hồi kèm Header `X-Response-Time`.
  - Cơ sở dữ liệu không có dữ liệu khớp nhưng hệ thống xử lý an toàn, trả về mảng rỗng `records: []` kèm thống kê `total: 0`, không gây ra lỗi máy chủ nội bộ (500) hoặc lỗi crash frontend:
  ```json
  {
    "success": true,
    "status_code": 200,
    "message": "Truy xuất lịch sử chuyên cần thành công",
    "data": {
      "class_id": "cls_new_2026",
      "month": "2026-08",
      "total_records": 0,
      "records": []
    },
    "timestamp": "2026-10-04T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

#### UT05_Attendance_TC21 : XỬ LÝ TRẠNG THÁI AN TOÀN KHI TRÍCH XUẤT DANH SÁCH CÓ MẶT NHƯNG CHƯA ĐIỂM DANH HOẶC CẢ LỚP ĐỀU VẮNG HÔM NAY (EMPTY STATE - 200 OK)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Lớp `cls_1a_2026` trong ngày hôm nay chưa được thực hiện điểm danh buổi sáng (chưa có bản ghi điểm danh trong DB hôm nay), hoặc ngày hôm nay cả lớp đều vắng mặt (không có học sinh nào có trạng thái `PRESENT`).
  - Giáo viên bộ môn hoặc GVCN đã đăng nhập hợp lệ.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien_hop_le>`
  - **Tham số đường dẫn (Path Params):** `classId = cls_1a_2026`
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền token Giáo viên vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/attendance/today/cls_1a_2026`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Trả về danh sách rỗng an toàn `present_students: []` và `total_present: 0`.
  - Tính năng Vòng quay may mắn (Random Wheel) nhận được mảng rỗng và hiển thị thông báo giao diện "Chưa có học sinh có mặt hôm nay để thực hiện quay số", hệ thống không bị crash:
  ```json
  {
    "success": true,
    "status_code": 200,
    "message": "Trích xuất danh sách học sinh có mặt hôm nay thành công",
    "data": {
      "class_id": "cls_1a_2026",
      "date": "2026-10-04",
      "is_attended_today": false,
      "total_present": 0,
      "present_students": []
    },
    "timestamp": "2026-10-04T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

