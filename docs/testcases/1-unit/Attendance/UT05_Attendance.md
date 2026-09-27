# TÀI LIỆU KỊCH BẢN KIỂM THỬ ĐƠN VỊ - PHÂN HỆ ĐIỂM DANH & CHUYÊN CẦN (ATTENDANCE)

# MÃ PHÂN HỆ: 05 - ATTENDANCE & PUNCTUALITY MODULE

# CẤP ĐỘ KIỂM THỬ: KIỂM THỬ ĐƠN VỊ (UNIT TEST)

---

## 1. THÔNG TIN CHUNG

- **PHÂN HỆ HỆ THỐNG:** `05` - Phân hệ Điểm danh & Theo dõi chuyên cần học sinh (`/api/v1/attendance`)
- **MÔ TẢ MODULE API:** Điểm danh chuyên cần đầu giờ, tự động kích hoạt thông báo đẩy FCM tới phụ huynh khi học sinh vắng, tra cứu lịch sử điểm danh và trích xuất danh sách học sinh có mặt hôm nay cho Vòng quay ngẫu nhiên (`AttendanceService`, `AttendanceController`)
- **NGƯỜI THỰC HIỆN / VIẾT TESTCASE:** Kim Chi Ha
- **TẬP TIN KIỂM THỬ:** [API_Attendance](https://github.com/gray8493/GiaoVienHay/tree/main/docs/apis/attendance)
- **MÔI TRƯỜNG KIỂM THỬ:** Testing / Postman API Client

---

## 2. CHI TIẾT CÁC KỊCH BẢN KIỂM THỬ ĐƠN VỊ

---

### UT05_Attendance_TC01 : ĐIỂM DANH CHUYÊN CẦN ĐẦU GIỜ THÀNH CÔNG VÀ KÍCH HOẠT THÔNG BÁO ĐẨY FCM VẮNG HỌC

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Giáo viên chủ nhiệm đã đăng nhập thành công với vai trò `TEACHER_HOMEROOM` và được phân công phụ trách lớp `cls_1a_2026`.
  - Các học sinh `stu_01`, `stu_02`, `stu_03` đã tồn tại trong bộ sưu tập `/students` và đã liên kết tài khoản phụ huynh với FCM token hợp lệ.
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
  3. Thêm danh sách điểm danh chi tiết vào phần **Body** định dạng `raw (application/json)`.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  - Hệ thống phản hồi mã trạng thái **HTTP 201 (CREATED - ĐÃ TẠO THÀNH CÔNG)**.
  - Ghi nhận 3 bản ghi điểm danh vào cơ sở dữ liệu Cloud Firestore tại collection `/attendances`.
  - Hệ thống tự động kích hoạt gửi Multicast FCM Notification đến thiết bị của 2 phụ huynh có học sinh vắng (`stu_02`, `stu_03`).
  - Dữ liệu trả về đúng định dạng JSON chuẩn như sau:

  ```json
  {
    "success": true,
    "status_code": 201,
    "message": "Điểm danh hoàn tất và đã gửi thông báo vắng tới phụ huynh",
    "data": {
      "attendance_date": "2026-09-23",
      "total_students": 3,
      "present_count": 1,
      "absent_count": 2,
      "notified_parents": 2
    }
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT05_Attendance_TC02 : TỪ CHỐI ĐIỂM DANH KHI TRẠNG THÁI CHUYÊN CẦN KHÔNG HỢP LỆ

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - GVCN đã đăng nhập hợp lệ vào hệ thống.
  - Lớp học `cls_1a_2026` tồn tại trên hệ thống.
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
        "status": "DI_TRE_KHONG_PHEP",
        "note": null
      }
    ]
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` của GVCN vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/attendance/submit`.
  3. Thêm dữ liệu có giá trị `status` không nằm trong enum cho phép vào phần **Body**.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  - Hệ thống ném ra ngoại lệ **HTTP 400 (BAD REQUEST - YÊU CẦU KHÔNG HỢP LỆ)**.
  - Tuyệt đối không lưu dữ liệu sai vào Firestore và không kích hoạt gửi FCM.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:

  ```json
  {
    "success": false,
    "status_code": 400,
    "message": "Trạng thái điểm danh không hợp lệ",
    "error_code": "ATTEND_STATUS_INVALID",
    "details": [
      {
        "field": "records[0].status",
        "issue": "Giá trị status ngoài danh mục cho phép (PRESENT, ABSENT_EXCUSED, ABSENT_UNEXCUSED)"
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT05_Attendance_TC03 : CHẶN GIÁO VIÊN KHÔNG PHẢI CHỦ NHIỆM THỰC HIỆN ĐIỂM DANH LỚP

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Giáo viên `usr_teacher_other` đã đăng nhập nhưng không được phân công làm Chủ nhiệm tại lớp `cls_1a_2026`.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_giao_vien_khong_phai_gvcn>`
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
      }
    ]
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` của giáo viên không có thẩm quyền vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/attendance/submit`.
  3. Thêm dữ liệu điểm danh vào phần **Body**.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  - Hệ thống ném ra ngoại lệ **HTTP 403 (FORBIDDEN - CẤM TRUY CẬP)**.
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

### UT05_Attendance_TC04 : TỪ CHỐI ĐIỂM DANH KHI DANH SÁCH BẢN GHI RỖNG HOẶC THIẾU NGÀY

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - GVCN đã đăng nhập hợp lệ vào hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_gvcn_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "class_id": "cls_1a_2026",
    "attendance_date": "",
    "period": 1,
    "records": []
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` của GVCN vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/attendance/submit`.
  3. Truyền dữ liệu thiếu ngày điểm danh và mảng `records` rỗng vào phần **Body**.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  - Hệ thống phản hồi mã trạng thái **HTTP 400 (BAD REQUEST - YÊU CẦU KHÔNG HỢP LỆ)**.
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
        "issue": "Ngày điểm danh không được để trống"
      },
      {
        "field": "records",
        "issue": "Danh sách học sinh điểm danh không được rỗng"
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT05_Attendance_TC05 : XEM LỊCH SỬ ĐIỂM DANH CỦA LỚP THEO NGÀY CỤ THỂ THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Giáo viên có quyền phụ trách lớp `cls_1a_2026` đã đăng nhập thành công.
  - Lớp học đã có dữ liệu điểm danh ngày `2026-09-23` trong cơ sở dữ liệu Firestore.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien_hop_le>`
  - **Tham số đường dẫn (Path Params):** `classId = cls_1a_2026`
  - **Tham số truy vấn (Query Params JSON):**

  ```json
  {
    "date": "2026-09-23"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API kèm tham số: `/api/v1/attendance/class/cls_1a_2026?date=2026-09-23`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Trả về danh sách chi tiết các bản ghi chuyên cần của từng học sinh trong ngày được chỉ định.
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
    ]
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT05_Attendance_TC06 : XEM LỊCH SỬ ĐIỂM DANH CỦA LỚP THEO THÁNG THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Giáo viên có quyền phụ trách lớp `cls_1a_2026` đã đăng nhập thành công.
  - Cơ sở dữ liệu chứa dữ liệu điểm danh tháng `2026-09`.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien_hop_le>`
  - **Tham số đường dẫn (Path Params):** `classId = cls_1a_2026`
  - **Tham số truy vấn (Query Params JSON):**

  ```json
  {
    "month": "2026-09"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/attendance/class/cls_1a_2026?month=2026-09`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Trả về toàn bộ danh sách điểm danh trong tháng của lớp học.
  - Dữ liệu trả về đúng định dạng JSON chuẩn như sau:

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
      }
    ]
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT05_Attendance_TC07 : TRUY VẤN DANH SÁCH HỌC SINH CÓ MẶT HÔM NAY PHỤC VỤ VÒNG QUAY RANDOM THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Lớp `cls_1a_2026` đã hoàn thành điểm danh đầu giờ hôm nay (`2026-09-23`).
  - Có các học sinh có trạng thái `PRESENT`.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien_hop_le>`
  - **Tham số đường dẫn (Path Params):** `classId = cls_1a_2026`
  - **Tham số truy vấn (Query Params JSON):**

  ```json
  {}
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` của giáo viên vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/attendance/today/cls_1a_2026`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Trả về danh sách chính xác các học sinh thực tế có mặt hôm nay (loại trừ các em vắng) để nạp vào tính năng Vòng quay may mắn.
  - Dữ liệu trả về đúng định dạng JSON chuẩn như sau:

  ```json
  {
    "success": true,
    "status_code": 200,
    "data": {
      "class_id": "cls_1a_2026",
      "today": "2026-09-23",
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
    }
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT05_Attendance_TC08 : XỬ LÝ TRUY VẤN DANH SÁCH HỌC SINH CÓ MẶT KHI LỚP CHƯA ĐIỂM DANH

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Lớp `cls_1a_2026` chưa thực hiện điểm danh buổi học hôm nay trong hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien_hop_le>`
  - **Tham số đường dẫn (Path Params):** `classId = cls_1a_2026`
  - **Tham số truy vấn (Query Params JSON):**

  ```json
  {}
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/attendance/today/cls_1a_2026`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Mảng `present_students` trả về rỗng kèm thông báo.
  - Dữ liệu trả về đúng định dạng JSON chuẩn như sau:

  ```json
  {
    "success": true,
    "status_code": 200,
    "data": {
      "class_id": "cls_1a_2026",
      "today": "2026-09-23",
      "present_students": []
    },
    "message": "Chưa có dữ liệu điểm danh hôm nay cho lớp này"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT05_Attendance_TC09 : CHẶN YÊU CẦU ĐIỂM DANH KHI CHƯA XÁC THỰC (UNAUTHORIZED)

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Request không truyền header Authorization hoặc token xác thực đã hết hạn.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** Không truyền hoặc truyền Token rỗng
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

  1. Không cấu hình giá trị `Bearer Token` trong tab **Authorization** trên Postman.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/attendance/submit`.
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

### UT05_Attendance_TC10 : BÁO LỖI KHI XEM LỊCH SỬ ĐIỂM DANH VỚI MÃ LỚP HỌC KHÔNG TỒN TẠI

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Giáo viên đã đăng nhập hợp lệ.
  - Mã lớp học `cls_khong_ton_tai` hoàn toàn không có trong cơ sở dữ liệu hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien_hop_le>`
  - **Tham số đường dẫn (Path Params):** `classId = cls_khong_ton_tai`
  - **Tham số truy vấn (Query Params JSON):**

  ```json
  {
    "date": "2026-09-23"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/attendance/class/cls_khong_ton_tai?date=2026-09-23`.
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
