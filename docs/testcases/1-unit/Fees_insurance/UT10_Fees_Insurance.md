# TÀI LIỆU KỊCH BẢN KIỂM THỬ ĐƠN VỊ - PHÂN HỆ QUẢN LÝ HỌC PHÍ & BẢO HIỂM Y TẾ (FEES & INSURANCE)

# MÃ PHÂN HỆ: 10 - FEES & HEALTH INSURANCE MODULE

# CẤP ĐỘ KIỂM THỬ: KIỂM THỬ ĐƠN VỊ (UNIT TEST)

---

## 1. THÔNG TIN CHUNG

- **PHÂN HỆ HỆ THỐNG:** `10` - Phân hệ Quản lý Thu nộp Học phí & Bảo hiểm y tế (BHYT - `/api/v1/fees-insurance`)
- **MÔ TẢ MODULE API:** Quản lý theo dõi nghĩa vụ tài chính của học sinh lớp chủ nhiệm qua 2 cờ Boolean kèm ngày nộp thực tế (`is_paid_tuition`, `tuition_paid_date`, `is_paid_insurance`, `insurance_paid_date`), thu tiền mặt trực tiếp tại lớp (không qua cổng thanh toán online), lọc danh sách chưa nộp và phát thông báo đẩy FCM đôn đốc phụ huynh (`FeesInsuranceService`, `FeesInsuranceController`)
- **NGƯỜI THỰC HIỆN / VIẾT TESTCASE:** Kim Chi Ha
- **TẬP TIN KIỂM THỬ:** [API_Fees_Insurance](https://github.com/gray8493/GiaoVienHay/tree/main/docs/apis/fees-insurance)
- **MÔI TRƯỜNG KIỂM THỬ:** Testing / Postman API Client

---

## 2. CHI TIẾT CÁC KỊCH BẢN KIỂM THỬ ĐƠN VỊ

---

### UT10_FeesInsurance_TC01 : GVCN XEM TOÀN BỘ DANH SÁCH THU NỘP HỌC PHÍ & BHYT CỦA LỚP CHỦ NHIỆM THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Giáo viên chủ nhiệm đã đăng nhập và được phân công phụ trách lớp `cls_1a_2026`.
  - Bộ sưu tập `/fees_and_insurance` đã khởi tạo các bản ghi theo dõi nghĩa vụ cho học sinh của lớp.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_gvcn_hop_le>`
  - **Tham số đường dẫn (Path Params):** `classId = cls_1a_2026`
  - **Tham số truy vấn (Query Params JSON):**

  ```json
  {
    "fee_type": "ALL",
    "unpaid_only": false
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` của GVCN vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API kèm tham số: `/api/v1/fees-insurance/class/cls_1a_2026?fee_type=ALL&unpaid_only=false`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Trả về danh sách chi tiết trạng thái Học phí và BHYT của từng học sinh trong lớp (cờ `is_paid` kèm ngày nộp thực tế).
  - Dữ liệu trả về đúng định dạng JSON chuẩn như sau:

  ```json
  {
    "success": true,
    "status_code": 200,
    "data": {
      "class_id": "cls_1a_2026",
      "term_name": "Học kỳ 1 năm học 2026-2027",
      "records": [
        {
          "record_id": "fee_01",
          "student_id": "stu_01",
          "student_name": "Trần Bảo Nam",
          "tuition": {
            "is_paid": true,
            "paid_date": "2026-09-15"
          },
          "insurance": {
            "is_paid": true,
            "paid_date": "2026-09-18"
          },
          "note": "Đã nộp đủ cả năm"
        },
        {
          "record_id": "fee_02",
          "student_id": "stu_02",
          "student_name": "Lê Ngọc Mai",
          "tuition": {
            "is_paid": true,
            "paid_date": "2026-09-16"
          },
          "insurance": {
            "is_paid": false,
            "paid_date": null
          },
          "note": null
        }
      ]
    }
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT10_FeesInsurance_TC02 : LỌC DANH SÁCH HỌC SINH CHƯA NỘP BHYT CỦA LỚP THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - GVCN phụ trách lớp `cls_1a_2026` đã đăng nhập thành công.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_gvcn_hop_le>`
  - **Tham số đường dẫn (Path Params):** `classId = cls_1a_2026`
  - **Tham số truy vấn (Query Params JSON):**

  ```json
  {
    "fee_type": "INSURANCE",
    "unpaid_only": true
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` của GVCN vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/fees-insurance/class/cls_1a_2026?fee_type=INSURANCE&unpaid_only=true`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Chỉ lọc và hiển thị danh sách những học sinh có cờ `insurance.is_paid: false`.
  - Dữ liệu trả về đúng định dạng JSON chuẩn như sau:

  ```json
  {
    "success": true,
    "status_code": 200,
    "data": {
      "class_id": "cls_1a_2026",
      "term_name": "Học kỳ 1 năm học 2026-2027",
      "records": [
        {
          "record_id": "fee_02",
          "student_id": "stu_02",
          "student_name": "Lê Ngọc Mai",
          "insurance": {
            "is_paid": false,
            "paid_date": null
          },
          "note": null
        }
      ]
    }
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT10_FeesInsurance_TC03 : CẬP NHẬT TRẠNG THÁI ĐÃ NỘP BHYT KÈM NGÀY NỘP THỰC TẾ THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Phụ huynh học sinh `stu_02` đã đóng tiền mặt BHYT trực tiếp tại lớp cho GVCN.
  - Bản ghi `fee_02` tồn tại trong `/fees_and_insurance`.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_gvcn_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "record_id": "fee_02",
    "fee_type": "INSURANCE",
    "is_paid": true,
    "paid_date": "2026-09-27",
    "note": "Đã nộp tiền mặt tại lớp"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` của GVCN vào mục **Headers**.
  2. Chọn phương thức **`PATCH`**, nhập đường dẫn API: `/api/v1/fees-insurance/toggle`.
  3. Thêm dữ liệu cập nhật nộp tiền vào phần **Body** định dạng `raw (application/json)`.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Cập nhật trường `is_paid_insurance: true`, `insurance_paid_date: "2026-09-27"` trong Cloud Firestore.
  - Dữ liệu trả về đúng định dạng JSON chuẩn:

  ```json
  {
    "success": true,
    "status_code": 200,
    "message": "Cập nhật trạng thái nộp tiền thành công",
    "data": {
      "record_id": "fee_02",
      "is_paid": true,
      "paid_date": "2026-09-27",
      "updated_at": "2026-09-27T10:40:00.000Z"
    }
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT10_FeesInsurance_TC04 : CẬP NHẬT TRẠNG THÁI ĐÃ NỘP HỌC PHÍ THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - GVCN đã nhận học phí từ phụ huynh của bản ghi `fee_03`.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_gvcn_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "record_id": "fee_03",
    "fee_type": "TUITION",
    "is_paid": true,
    "paid_date": "2026-09-27",
    "note": "Nộp học phí tháng 9"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` vào mục **Headers**.
  2. Chọn phương thức **`PATCH`**, nhập đường dẫn API: `/api/v1/fees-insurance/toggle`.
  3. Thêm dữ liệu cập nhật Học phí vào phần **Body**.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Cập nhật cờ `is_paid_tuition: true` và `tuition_paid_date: "2026-09-27"` trong Firestore.
  - Dữ liệu trả về đúng định dạng JSON chuẩn:

  ```json
  {
    "success": true,
    "status_code": 200,
    "message": "Cập nhật trạng thái nộp tiền thành công",
    "data": {
      "record_id": "fee_03",
      "is_paid": true,
      "paid_date": "2026-09-27",
      "updated_at": "2026-09-27T10:42:00.000Z"
    }
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT10_FeesInsurance_TC05 : TỪ CHỐI CẬP NHẬT KHI NGÀY NỘP TIỀN Ở TƯƠNG LAI

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - GVCN đã đăng nhập hợp lệ vào hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_gvcn_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "record_id": "fee_02",
    "fee_type": "INSURANCE",
    "is_paid": true,
    "paid_date": "2026-12-31"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` vào mục **Headers**.
  2. Chọn phương thức **`PATCH`**, nhập đường dẫn API: `/api/v1/fees-insurance/toggle`.
  3. Thêm dữ liệu có ngày nộp tiền vượt quá ngày hiện tại vào phần **Body**.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  - Hệ thống ném ra ngoại lệ **HTTP 400 (BAD REQUEST - YÊU CẦU KHÔNG HỢP LỆ)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:

  ```json
  {
    "success": false,
    "status_code": 400,
    "message": "Ngày nộp tiền không hợp lệ hoặc rơi vào tương lai",
    "error_code": "FEE_PAID_DATE_INVALID",
    "details": [
      {
        "field": "paid_date",
        "issue": "Ngày hoàn thành nộp tiền không được vượt quá ngày hiện tại"
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT10_FeesInsurance_TC06 : BÁO LỖI KHI CẬP NHẬT BẢN GHI THU NỘP KHÔNG TỒN TẠI

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Mã bản ghi `fee_non_existent` hoàn toàn không có trong cơ sở dữ liệu.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_gvcn_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "record_id": "fee_non_existent",
    "fee_type": "INSURANCE",
    "is_paid": true
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` vào mục **Headers**.
  2. Chọn phương thức **`PATCH`**, nhập đường dẫn API: `/api/v1/fees-insurance/toggle`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  - Hệ thống phản hồi mã trạng thái **HTTP 404 (NOT FOUND - KHÔNG TÌM THẤY)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:

  ```json
  {
    "success": false,
    "status_code": 404,
    "message": "Không tìm thấy bản ghi theo dõi học phí hoặc BHYT của học sinh",
    "error_code": "FEE_RECORD_NOT_FOUND",
    "details": null,
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT10_FeesInsurance_TC07 : GVCN GỬI THÔNG BÁO FCM ĐÔN ĐỐC PHỤ HUYNH CHƯA NỘP BHYT THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Lớp `cls_1a_2026` còn các học sinh chưa hoàn thành nộp BHYT (`is_paid_insurance == false`).
  - Thiết bị của phụ huynh các em này có FCM Device Token hợp lệ.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_gvcn_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "class_id": "cls_1a_2026",
    "fee_type": "INSURANCE",
    "custom_message": "Kính nhờ quý phụ huynh chưa hoàn thành BHYT năm học 2026-2027 vui lòng nộp tiền mặt cho GVCN trước ngày 15/10."
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` của GVCN vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/fees-insurance/remind`.
  3. Thêm cấu hình gửi lời nhắc vào phần **Body** định dạng `raw (application/json)`.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Backend lọc danh sách học sinh chưa nộp, tra cứu FCM token của phụ huynh và phát Multicast Message.
  - Dữ liệu trả về đúng định dạng JSON chuẩn như sau:

  ```json
  {
    "success": true,
    "status_code": 200,
    "message": "Đã gửi thông báo nhắc nhở tới 12 phụ huynh chưa nộp",
    "data": {
      "class_id": "cls_1a_2026",
      "notified_parents_count": 12
    }
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT10_FeesInsurance_TC08 : CHẶN GIÁO VIÊN KHÔNG PHẢI GVCN TRUY CẬP XEM THU NỘP CỦA LỚP

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Giáo viên `usr_teacher_other` là Giáo viên bộ môn hoặc không phụ trách chủ nhiệm lớp `cls_1a_2026`.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien_khong_phai_gvcn>`
  - **Tham số đường dẫn (Path Params):** `classId = cls_1a_2026`
  - **Tham số truy vấn (Query Params JSON):**

  ```json
  {
    "fee_type": "ALL"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` của giáo viên không có thẩm quyền vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/fees-insurance/class/cls_1a_2026?fee_type=ALL`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
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

### UT10_FeesInsurance_TC09 : CHẶN YÊU CẦU GỬI LỜI NHẮC KHI CHƯA XÁC THỰC (UNAUTHORIZED)

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Request không truyền header Authorization hoặc token xác thực đã hết hạn.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** Không truyền Authorization token
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "class_id": "cls_1a_2026",
    "fee_type": "INSURANCE"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Không cấu hình giá trị `Bearer Token` trong tab **Authorization** trên Postman.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/fees-insurance/remind`.
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

### UT10_FeesInsurance_TC10 : BÁO LỖI KHI CẬP NHẬT KHI ĐỢT THU PHÍ ĐÃ BỊ KHÓA SỔ

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Đợt thu học phí/BHYT học kỳ này đã được kế toán nhà trường khóa sổ (`is_locked = true`).
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_gvcn_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "record_id": "fee_02",
    "fee_type": "INSURANCE",
    "is_paid": true,
    "paid_date": "2026-09-27"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` vào mục **Headers**.
  2. Chọn phương thức **`PATCH`**, nhập đường dẫn API: `/api/v1/fees-insurance/toggle`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  - Hệ thống phản hồi mã trạng thái **HTTP 400 (BAD REQUEST - YÊU CẦU KHÔNG HỢP LỆ)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:

  ```json
  {
    "success": false,
    "status_code": 400,
    "message": "Đợt thu nộp này đã được kế toán trường khóa sổ, không thể chỉnh sửa",
    "error_code": "FEE_TERM_LOCKED",
    "details": null,
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**
