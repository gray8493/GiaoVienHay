# TÀI LIỆU KỊCH BẢN KIỂM THỬ ĐƠN VỊ - PHÂN HỆ QUẢN LÝ HỌC PHÍ & BẢO HIỂM Y TẾ (FEES & INSURANCE)

# MÃ PHÂN HỆ: 10 - FEES & HEALTH INSURANCE MODULE

# CẤP ĐỘ KIỂM THỬ: KIỂM THỬ ĐƠN VỊ (UNIT TEST)

---

## 1. THÔNG TIN CHUNG

- **PHÂN HỆ HỆ THỐNG:** `10` - Phân hệ Quản lý Thu nộp Học phí & Bảo hiểm y tế (BHYT - `/api/v1/fees-insurance`)
- **MÔ TẢ MODULE API:** Quản lý theo dõi nghĩa vụ tài chính của học sinh lớp chủ nhiệm qua 2 cờ Boolean kèm ngày nộp thực tế (`is_paid_tuition`, `tuition_paid_date`, `is_paid_insurance`, `insurance_paid_date`), thu tiền mặt trực tiếp tại lớp (không qua cổng thanh toán online), lọc danh sách chưa nộp và phát thông báo đẩy FCM đôn đốc phụ huynh (`FeesInsuranceService`, `FeesInsuranceController`).
- **NGƯỜI THỰC HIỆN / VIẾT TESTCASE:** Kim Chi Ha
- **TẬP TIN ĐẶC TẢ API:** [API_Fees_Insurance](https://github.com/gray8493/GiaoVienHay/tree/main/docs/apis/fees-insurance)
- **MÔI TRƯỜNG KIỂM THỬ:** Testing / Postman API Client / Jest Unit Testing

---

## 2. CHI TIẾT CÁC KỊCH BẢN KIỂM THỬ ĐƠN VỊ

---

### PHẦN I: CÁC KỊCH BẢN KIỂM THỬ THẤT BẠI & BÁO LỖI (NEGATIVE / FALSE CASES)

---

#### 1. Nhóm Kịch Bản Thiếu Các Trường Bắt Buộc (Missing Required Fields Validation)

---

##### UT10_FeesInsurance_TC01 : TỪ CHỐI CẬP NHẬT KHI KHÔNG TRUYỀN HOẶC ĐỂ TRỐNG MÃ BẢN GHI (MISSING RECORD_ID)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên chủ nhiệm đã đăng nhập hợp lệ với vai trò `TEACHER_HOMEROOM`.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_gvcn_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):** Để trống trường `record_id`:
  ```json
  {
    "record_id": "",
    "fee_type": "INSURANCE",
    "is_paid": true,
    "paid_date": "2026-09-27"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã `Bearer Token` của GVCN vào mục **Headers**.
  2. Chọn phương thức **`PATCH`**, nhập đường dẫn API: `/api/v1/fees-insurance/toggle`.
  3. Gửi payload thiếu trường `record_id`.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống ném ra ngoại lệ **HTTP 400 (BAD REQUEST - YÊU CẦU KHÔNG HỢP LỆ)**.
  - Tuyệt đối không thay đổi trạng thái bản ghi trong cơ sở dữ liệu.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:
  ```json
  {
    "success": false,
    "status_code": 400,
    "message": "Dữ liệu gửi lên vi phạm quy tắc ràng buộc hoặc sai định dạng",
    "error_code": "COMMON_VALIDATION_ERROR",
    "details": [
      {
        "field": "record_id",
        "issue": "Mã bản ghi thu nộp bắt buộc và không được để trống"
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT10_FeesInsurance_TC02 : TỪ CHỐI CẬP NHẬT KHI KHÔNG CHỌN HOẶC ĐỂ TRỐNG LOẠI KHOẢN THU (MISSING FEE_TYPE)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - GVCN đã đăng nhập hợp lệ vào hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_gvcn_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):** Không truyền hoặc để trống trường `fee_type`:
  ```json
  {
    "record_id": "fee_02",
    "fee_type": "",
    "is_paid": true,
    "paid_date": "2026-09-27"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của GVCN vào mục **Headers**.
  2. Chọn phương thức **`PATCH`**, nhập đường dẫn API: `/api/v1/fees-insurance/toggle`.
  3. Gửi payload thiếu trường `fee_type`.
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
        "field": "fee_type",
        "issue": "Loại khoản thu bắt buộc phải chọn (TUITION hoặc INSURANCE)"
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT10_FeesInsurance_TC03 : TỪ CHỐI CẬP NHẬT KHI THIẾU TRẠNG THÁI CỜ ĐÃ NỘP (MISSING IS_PAID)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - GVCN đã đăng nhập hợp lệ vào hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_gvcn_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):** Không truyền trường `is_paid`:
  ```json
  {
    "record_id": "fee_02",
    "fee_type": "INSURANCE",
    "paid_date": "2026-09-27"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` vào mục **Headers**.
  2. Chọn phương thức **`PATCH`**, nhập đường dẫn API: `/api/v1/fees-insurance/toggle`.
  3. Gửi payload thiếu trường `is_paid`.
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
        "field": "is_paid",
        "issue": "Trạng thái nộp phí bắt buộc phải có giá trị boolean (true hoặc false)"
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT10_FeesInsurance_TC04 : TỪ CHỐI CẬP NHẬT ĐÃ NỘP TIỀN NHƯNG THIẾU NGÀY NỘP THỰC TẾ (MISSING PAID_DATE WHEN IS_PAID IS TRUE)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - GVCN đã đăng nhập hợp lệ vào hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_gvcn_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):** `is_paid = true` nhưng để trống `paid_date`:
  ```json
  {
    "record_id": "fee_02",
    "fee_type": "INSURANCE",
    "is_paid": true,
    "paid_date": ""
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` vào mục **Headers**.
  2. Chọn phương thức **`PATCH`**, nhập đường dẫn API: `/api/v1/fees-insurance/toggle`.
  3. Gửi payload có `is_paid = true` nhưng bỏ trống trường `paid_date`.
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
        "field": "paid_date",
        "issue": "Ngày nộp tiền thực tế là bắt buộc khi đánh dấu đã hoàn thành nộp phí"
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT10_FeesInsurance_TC05 : TỪ CHỐI GỬI THÔNG BÁO NHẮC NHỞ KHI THIẾU HOẶC ĐỂ TRỐNG MÃ LỚP (MISSING CLASS_ID IN REMIND)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - GVCN đã đăng nhập hợp lệ vào hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_gvcn_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):** Để trống trường `class_id`:
  ```json
  {
    "class_id": "",
    "fee_type": "INSURANCE"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/fees-insurance/remind`.
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
        "issue": "Mã lớp học bắt buộc và không được để trống"
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT10_FeesInsurance_TC06 : TỪ CHỐI GỬI THÔNG BÁO NHẮC NHỞ KHI THIẾU HOẶC ĐỂ TRỐNG LOẠI KHOẢN THU (MISSING FEE_TYPE IN REMIND)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - GVCN đã đăng nhập hợp lệ vào hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_gvcn_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):** Không truyền hoặc để trống trường `fee_type`:
  ```json
  {
    "class_id": "cls_1a_2026",
    "fee_type": ""
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/fees-insurance/remind`.
  3. Gửi payload thiếu trường `fee_type`.
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
        "field": "fee_type",
        "issue": "Loại khoản thu nhắc nhở bắt buộc phải chọn (TUITION, INSURANCE hoặc BOTH)"
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

#### 2. Nhóm Kịch Bản Dữ Liệu Không Hợp Lệ & Lỗi Nghiệp Vụ (Invalid Formats & Business Rules)

---

##### UT10_FeesInsurance_TC07 : TỪ CHỐI CẬP NHẬT KHI NGÀY NỘP TIỀN KHÔNG TỒN TẠI TRONG LỊCH THỰC TẾ

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - GVCN đã đăng nhập hợp lệ vào hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_gvcn_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):** Ngày nộp tiền `2026-02-30` không tồn tại trong lịch thực tế:
  ```json
  {
    "record_id": "fee_02",
    "fee_type": "INSURANCE",
    "is_paid": true,
    "paid_date": "2026-02-30"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của GVCN vào mục **Headers**.
  2. Chọn phương thức **`PATCH`**, nhập đường dẫn API: `/api/v1/fees-insurance/toggle`.
  3. Gửi trường `paid_date` là ngày không tồn tại trên lịch thực tế.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống ném ra ngoại lệ **HTTP 400 (BAD REQUEST - YÊU CẦU KHÔNG HỢP LỆ)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:
  ```json
  {
    "success": false,
    "status_code": 400,
    "message": "Ngày nộp tiền không hợp lệ hoặc không tồn tại trong lịch thực tế",
    "error_code": "COMMON_VALIDATION_ERROR",
    "details": [
      {
        "field": "paid_date",
        "issue": "Giá trị '2026-02-30' không phải là ngày hợp lệ trong lịch thực tế (tháng 2 năm 2026 chỉ có 28 ngày)"
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT10_FeesInsurance_TC08 : TỪ CHỐI CẬP NHẬT KHI NGÀY NỘP TIỀN Ở TƯƠNG LAI

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - GVCN đã đăng nhập hợp lệ vào hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_gvcn_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):** Ngày nộp tiền `2026-12-31` vượt quá ngày hiện tại:
  ```json
  {
    "record_id": "fee_02",
    "fee_type": "INSURANCE",
    "is_paid": true,
    "paid_date": "2026-12-31"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của GVCN vào mục **Headers**.
  2. Chọn phương thức **`PATCH`**, nhập đường dẫn API: `/api/v1/fees-insurance/toggle`.
  3. Gửi trường `paid_date` lớn hơn ngày hôm nay (`2026-12-31` > `2026-09-27`).
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống ném ra ngoại lệ **HTTP 400 (BAD REQUEST - NGÀY NỘP Ở TƯƠNG LAI)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:
  ```json
  {
    "success": false,
    "status_code": 400,
    "message": "Ngày nộp tiền không thể ở tương lai",
    "error_code": "COMMON_VALIDATION_ERROR",
    "details": [
      {
        "field": "paid_date",
        "issue": "Ngày hoàn thành nộp tiền không được vượt quá ngày hiện tại (2026-09-27)"
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT10_FeesInsurance_TC09 : TỪ CHỐI CẬP NHẬT KHI GHI CHÚ VƯỢT QUÁ ĐỘ DÀI TỐI ĐA (TRÊN 255 KÝ TỰ)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - GVCN đã đăng nhập hợp lệ vào hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_gvcn_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):** Ghi chú `note` dài 280 ký tự (> 255 ký tự):
  ```json
  {
    "record_id": "fee_02",
    "fee_type": "INSURANCE",
    "is_paid": true,
    "paid_date": "2026-09-27",
    "note": "Ghi chú thu phí dài quá giới hạn: Phụ huynh đến trường trực tiếp nộp tiền mặt vào buổi sáng tiết sinh hoạt lớp ngày hôm nay, đã nhận đủ số tiền theo quy định và đã ký tên vào sổ theo dõi thu nộp của giáo viên chủ nhiệm. Kính nhờ ban giám hiệu và phòng tài vụ cập nhật hóa đơn tài chính cho phụ huynh."
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của GVCN vào mục **Headers**.
  2. Chọn phương thức **`PATCH`**, nhập đường dẫn API: `/api/v1/fees-insurance/toggle`.
  3. Gửi payload có trường `note` vượt quá 255 ký tự.
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
        "field": "note",
        "issue": "Ghi chú không được vượt quá 255 ký tự"
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT10_FeesInsurance_TC10 : TỪ CHỐI CẬP NHẬT KHI LOẠI KHOẢN THU KHÔNG NẰM TRONG ENUM CHUẨN

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - GVCN đã đăng nhập hợp lệ vào hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_gvcn_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):** Giá trị `fee_type` không thuộc `[TUITION, INSURANCE]`:
  ```json
  {
    "record_id": "fee_02",
    "fee_type": "TIEN_QUY_LOP",
    "is_paid": true,
    "paid_date": "2026-09-27"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của GVCN vào mục **Headers**.
  2. Chọn phương thức **`PATCH`**, nhập đường dẫn API: `/api/v1/fees-insurance/toggle`.
  3. Gửi giá trị `fee_type` không hợp lệ.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống ném ra ngoại lệ **HTTP 400 (BAD REQUEST - LOẠI KHOẢN THU KHÔNG HỢP LỆ)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:
  ```json
  {
    "success": false,
    "status_code": 400,
    "message": "Dữ liệu gửi lên vi phạm quy tắc ràng buộc hoặc sai định dạng",
    "error_code": "COMMON_VALIDATION_ERROR",
    "details": [
      {
        "field": "fee_type",
        "issue": "Giá trị 'fee_type' không hợp lệ (chỉ chấp nhận TUITION hoặc INSURANCE)"
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT10_FeesInsurance_TC11 : TỪ CHỐI GỬI LỜI NHẮC KHI LOẠI KHOẢN THU NHẮC NHỞ NGOÀI DANH MỤC CHO PHÉP

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - GVCN đã đăng nhập hợp lệ vào hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_gvcn_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):** Giá trị `fee_type` không thuộc `[TUITION, INSURANCE, BOTH]`:
  ```json
  {
    "class_id": "cls_1a_2026",
    "fee_type": "DONG_PHUC"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/fees-insurance/remind`.
  3. Gửi giá trị `fee_type` không hợp lệ.
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
        "field": "fee_type",
        "issue": "Giá trị 'fee_type' không hợp lệ (chỉ chấp nhận TUITION, INSURANCE hoặc BOTH)"
      }
    ],
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT10_FeesInsurance_TC12 : TỪ CHỐI CẬP NHẬT KHI ĐỢT THU PHÍ ĐÃ ĐƯỢC NHÀ TRƯỜNG ĐÓNG KHÓA SỔ (FEE_TERM_LOCKED)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - GVCN đã đăng nhập hợp lệ.
  - Đợt thu nộp học phí/BHYT này đã được kế toán nhà trường khóa sổ (`is_locked = true`).
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
  1. Truyền mã xác thực `Authentication Token` của GVCN vào mục **Headers**.
  2. Chọn phương thức **`PATCH`**, nhập đường dẫn API: `/api/v1/fees-insurance/toggle`.
  3. Gửi yêu cầu cập nhật bản ghi thuộc đợt thu đã khóa.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống ném ra ngoại lệ **HTTP 400 (BAD REQUEST - ĐỢT THU ĐÃ KHÓA SỔ)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:
  ```json
  {
    "success": false,
    "status_code": 400,
    "message": "Đợt thu này đã được kế toán trường khóa sổ, không thể điều chỉnh",
    "error_code": "FEE_TERM_LOCKED",
    "details": null,
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

#### 3. Nhóm Kịch Bản Phân Quyền & Không Tìm Thấy (Authorization & Not Found)

---

##### UT10_FeesInsurance_TC13 : BÁO LỖI KHI TRA CỨU DANH SÁCH THU NỘP VỚI MÃ LỚP HỌC KHÔNG TỒN TẠI (CLASS_NOT_FOUND)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - GVCN đã đăng nhập hợp lệ.
  - Mã lớp học `cls_khong_ton_tai` hoàn toàn không có trong cơ sở dữ liệu.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_gvcn_hop_le>`
  - **Tham số đường dẫn (Path Params):** `classId = cls_khong_ton_tai`
  - **Tham số truy vấn (Query Params):** Không có
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/fees-insurance/class/cls_khong_ton_tai`.
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

##### UT10_FeesInsurance_TC14 : CHẶN GIÁO VIÊN KHÔNG PHẢI GVCN TRUY CẬP DANH SÁCH THU NỘP CỦA LỚP (AUTH_FORBIDDEN)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên bộ môn hoặc giáo viên lớp khác (`usr_teacher_other`) đã đăng nhập nhưng không phụ trách chủ nhiệm lớp `cls_1a_2026`.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien_khong_phai_gvcn>`
  - **Tham số đường dẫn (Path Params):** `classId = cls_1a_2026`
  - **Tham số truy vấn (Query Params):** Không có
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực của giáo viên không có thẩm quyền vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/fees-insurance/class/cls_1a_2026`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống ném ra ngoại lệ cấm truy cập **HTTP 403 (FORBIDDEN - CẤM TRUY CẬP)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:
  ```json
  {
    "success": false,
    "status_code": 403,
    "message": "Chỉ giáo viên chủ nhiệm mới có quyền quản lý và thu nộp học phí, BHYT của lớp này",
    "error_code": "AUTH_FORBIDDEN",
    "details": null,
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT10_FeesInsurance_TC15 : BÁO LỖI KHI CẬP NHẬT BẢN GHI THU NỘP KHÔNG TỒN TẠI (FEE_RECORD_NOT_FOUND)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - GVCN đã đăng nhập hợp lệ.
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
    "is_paid": true,
    "paid_date": "2026-09-27"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` vào mục **Headers**.
  2. Chọn phương thức **`PATCH`**, nhập đường dẫn API: `/api/v1/fees-insurance/toggle`.
  3. Gửi payload có `record_id` không tồn tại.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 404 (NOT FOUND - KHÔNG TÌM THẤY)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:
  ```json
  {
    "success": false,
    "status_code": 404,
    "message": "Không tìm thấy hồ sơ theo dõi học phí này",
    "error_code": "FEE_RECORD_NOT_FOUND",
    "details": null,
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT10_FeesInsurance_TC16 : CHẶN GIÁO VIÊN KHÔNG PHẢI GVCN CỦA LỚP CẬP NHẬT BẢN GHI THU NỘP (AUTH_FORBIDDEN)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên `usr_teacher_other` không phải GVCN của lớp chứa bản ghi `fee_02`.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_giao_vien_khong_phai_gvcn>`
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
  1. Truyền mã xác thực của giáo viên không có thẩm quyền vào mục **Headers**.
  2. Chọn phương thức **`PATCH`**, nhập đường dẫn API: `/api/v1/fees-insurance/toggle`.
  3. Gửi payload cập nhật cờ thu nộp.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống ném ra ngoại lệ cấm truy cập **HTTP 403 (FORBIDDEN - CẤM TRUY CẬP)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:
  ```json
  {
    "success": false,
    "status_code": 403,
    "message": "Chỉ giáo viên chủ nhiệm mới có quyền quản lý và thu nộp học phí, BHYT của lớp này",
    "error_code": "AUTH_FORBIDDEN",
    "details": null,
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT10_FeesInsurance_TC17 : BÁO LỖI KHI GỬI LỜI NHẮC CHO LỚP HỌC KHÔNG TỒN TẠI (CLASS_NOT_FOUND IN REMIND)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - GVCN đã đăng nhập hợp lệ.
  - Mã lớp học `cls_khong_ton_tai` hoàn toàn không có trong hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_gvcn_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):**
  ```json
  {
    "class_id": "cls_khong_ton_tai",
    "fee_type": "INSURANCE"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/fees-insurance/remind`.
  3. Gửi payload với `class_id` không tồn tại.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
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

##### UT10_FeesInsurance_TC18 : CHẶN GIÁO VIÊN KHÔNG PHẢI GVCN GỬI THÔNG BÁO NHẮC NHỞ PHỤ HUYNH (AUTH_FORBIDDEN IN REMIND)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên bộ môn `usr_teacher_other` không phải GVCN của lớp `cls_1a_2026`.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_giao_vien_khong_phai_gvcn>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):**
  ```json
  {
    "class_id": "cls_1a_2026",
    "fee_type": "INSURANCE"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực của giáo viên không có quyền vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/fees-insurance/remind`.
  3. Gửi yêu cầu phát thông báo nhắc nhở.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống ném ra ngoại lệ cấm truy cập **HTTP 403 (FORBIDDEN - CẤM TRUY CẬP)**.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:
  ```json
  {
    "success": false,
    "status_code": 403,
    "message": "Chỉ giáo viên chủ nhiệm mới có quyền quản lý và thu nộp học phí, BHYT của lớp này",
    "error_code": "AUTH_FORBIDDEN",
    "details": null,
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

##### UT10_FeesInsurance_TC19 : CHẶN TRUY CẬP KHI THIẾU TOKEN HOẶC TOKEN KHÔNG HỢP LỆ (AUTH_UNAUTHORIZED)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Request không truyền header `Authorization` hoặc token xác thực đã hết hạn / không hợp lệ.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** Không truyền Bearer token xác thực
  - **Tham số đường dẫn (Path Params):** `classId = cls_1a_2026`
- **CÁC BƯỚC THỰC HIỆN:**
  1. Không cấu hình giá trị `Bearer Token` trong tab **Authorization** trên Postman.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/fees-insurance/class/cls_1a_2026`.
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

#### 4. Nhóm Kịch Bản Lỗi Ngoại Lệ Hệ Thống (System Internal Server Errors)

---

##### UT10_FeesInsurance_TC20 : XỬ LÝ NGOẠI LỆ LỖI MÁY CHỦ NỘI BỘ HOẶC SỰ CỐ DỊCH VỤ FIREBASE FCM KHI ĐÔN ĐỐC THU NỘP (SYS_INTERNAL_ERROR)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - GVCN đã đăng nhập hợp lệ.
  - Dịch vụ Cloud Firestore hoặc Firebase Admin FCM gặp sự cố mất kết nối mạng hoặc timeout.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_gvcn_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):**
  ```json
  {
    "class_id": "cls_1a_2026",
    "fee_type": "INSURANCE",
    "custom_message": "Nhắc nhở nộp BHYT"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của GVCN vào mục **Headers**.
  2. Giả lập / Mocking kết nối cơ sở dữ liệu Firestore hoặc dịch vụ Firebase FCM bị sập / timeout.
  3. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/fees-insurance/remind`.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Bộ lọc ngoại lệ toàn cục bắt lỗi và chuyển đổi thành mã trạng thái **HTTP 500 (INTERNAL SERVER ERROR - LỖI MÁY CHỦ NỘI BỘ)** mà không làm crash tiến trình ứng dụng.
  - Dữ liệu lỗi phản hồi đúng cấu trúc Envelope chuẩn:
  ```json
  {
    "success": false,
    "status_code": 500,
    "message": "Lỗi máy chủ nội bộ hoặc lỗi kết nối Firebase Cloud Messaging",
    "error_code": "SYS_INTERNAL_ERROR",
    "details": null,
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### PHẦN II: CÁC KỊCH BẢN KIỂM THỬ THÀNH CÔNG (POSITIVE / TRUE CASES)

---

#### UT10_FeesInsurance_TC21 : GVCN XEM TOÀN BỘ DANH SÁCH THU NỘP HỌC PHÍ & BHYT CỦA LỚP CHỦ NHIỆM THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên chủ nhiệm đã đăng nhập và được phân công phụ trách lớp `cls_1a_2026`.
  - Bộ sưu tập `/fees_and_insurance` đã khởi tạo các bản ghi theo dõi nghĩa vụ cho học sinh của lớp.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_gvcn_hop_le>`
  - **Tham số đường dẫn (Path Params):** `classId = cls_1a_2026`
  - **Tham số truy vấn (Query Params):** `fee_type = ALL`, `unpaid_only = false`
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của GVCN vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API kèm tham số: `/api/v1/fees-insurance/class/cls_1a_2026?fee_type=ALL&unpaid_only=false`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Trả về danh sách chi tiết trạng thái Học phí và BHYT của từng học sinh trong lớp (cờ `is_paid` kèm ngày nộp thực tế).
  - Dữ liệu trả về đúng định dạng JSON chuẩn:
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
    },
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

#### UT10_FeesInsurance_TC22 : LỌC DANH SÁCH HỌC SINH CHƯA NỘP BHYT CỦA LỚP THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - GVCN phụ trách lớp `cls_1a_2026` đã đăng nhập thành công.
  - Lớp có học sinh chưa nộp BHYT.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_gvcn_hop_le>`
  - **Tham số đường dẫn (Path Params):** `classId = cls_1a_2026`
  - **Tham số truy vấn (Query Params):** `fee_type = INSURANCE`, `unpaid_only = true`
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của GVCN vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/fees-insurance/class/cls_1a_2026?fee_type=INSURANCE&unpaid_only=true`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Chỉ lọc và hiển thị danh sách những học sinh có cờ `insurance.is_paid: false`.
  - Dữ liệu trả về đúng định dạng JSON chuẩn:
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
    },
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

#### UT10_FeesInsurance_TC23 : LỌC DANH SÁCH HỌC SINH CHƯA NỘP HỌC PHÍ CỦA LỚP THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - GVCN phụ trách lớp `cls_1a_2026` đã đăng nhập thành công.
  - Lớp có học sinh chưa hoàn thành nộp học phí.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_gvcn_hop_le>`
  - **Tham số đường dẫn (Path Params):** `classId = cls_1a_2026`
  - **Tham số truy vấn (Query Params):** `fee_type = TUITION`, `unpaid_only = true`
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của GVCN vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/fees-insurance/class/cls_1a_2026?fee_type=TUITION&unpaid_only=true`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Chỉ lọc và hiển thị danh sách các học sinh có cờ `tuition.is_paid: false`.
  - Dữ liệu trả về đúng định dạng JSON chuẩn.
- **TRẠNG THÁI KIỂM THỬ:**

---

#### UT10_FeesInsurance_TC24 : CẬP NHẬT TRẠNG THÁI ĐÃ NỘP BHYT KÈM NGÀY NỘP THỰC TẾ THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Phụ huynh học sinh `stu_02` đã hoàn thành đóng tiền mặt BHYT tại lớp cho GVCN.
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
    },
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

#### UT10_FeesInsurance_TC25 : CẬP NHẬT TRẠNG THÁI ĐÃ NỘP HỌC PHÍ KÈM NGÀY NỘP THỰC TẾ THÀNH CÔNG

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
    },
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

#### UT10_FeesInsurance_TC26 : HOÀN TÁC CẬP NHẬT TRẠNG THÁI TỪ ĐÃ NỘP VỀ CHƯA NỘP THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Bản ghi `fee_02` trước đó đang ở trạng thái đã nộp (`is_paid: true`).
  - GVCN cần hoàn tác về chưa nộp do nhầm lẫn học sinh.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_gvcn_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):**
  ```json
  {
    "record_id": "fee_02",
    "fee_type": "INSURANCE",
    "is_paid": false,
    "paid_date": null,
    "note": "Điều chỉnh do nhầm lẫn học sinh"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của GVCN vào mục **Headers**.
  2. Chọn phương thức **`PATCH`**, nhập đường dẫn API: `/api/v1/fees-insurance/toggle`.
  3. Gửi payload hoàn tác với `is_paid: false`.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Cập nhật cờ `is_paid_insurance: false` và `insurance_paid_date: null` trong cơ sở dữ liệu.
  - Dữ liệu trả về đúng định dạng JSON chuẩn:
  ```json
  {
    "success": true,
    "status_code": 200,
    "message": "Cập nhật trạng thái nộp tiền thành công",
    "data": {
      "record_id": "fee_02",
      "is_paid": false,
      "paid_date": null,
      "updated_at": "2026-09-27T10:45:00.000Z"
    },
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

#### UT10_FeesInsurance_TC27 : GVCN GỬI THÔNG BÁO FCM ĐÔN ĐỐC PHỤ HUYNH CHƯA NỘP BHYT THÀNH CÔNG

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
  - Dữ liệu trả về đúng định dạng JSON chuẩn:
  ```json
  {
    "success": true,
    "status_code": 200,
    "message": "Đã gửi thông báo nhắc nhở tới 12 phụ huynh chưa nộp",
    "data": {
      "class_id": "cls_1a_2026",
      "notified_parents_count": 12
    },
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

#### UT10_FeesInsurance_TC28 : GVCN GỬI THÔNG BÁO FCM NHẮC PHỤ HUYNH CHƯA NỘP CẢ 2 NGHĨA VỤ (BOTH) THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Lớp `cls_1a_2026` còn học sinh chưa nộp Học phí hoặc BHYT.
  - GVCN đã đăng nhập hợp lệ.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_gvcn_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):**
  ```json
  {
    "class_id": "cls_1a_2026",
    "fee_type": "BOTH",
    "custom_message": "Kính nhờ quý phụ huynh kiểm tra và hoàn thành các khoản nghĩa vụ Học phí và BHYT của con trước hạn chót của nhà trường."
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của GVCN vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/fees-insurance/remind`.
  3. Thêm dữ liệu với `fee_type: "BOTH"` vào phần **Body**.
  4. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Kích hoạt Multicast Message gửi thông báo đẩy đến tất cả phụ huynh có con em chưa hoàn thành ít nhất 1 trong 2 khoản thu.
  - Dữ liệu trả về đúng định dạng JSON chuẩn:
  ```json
  {
    "success": true,
    "status_code": 200,
    "message": "Đã gửi thông báo nhắc nhở tới 18 phụ huynh chưa nộp",
    "data": {
      "class_id": "cls_1a_2026",
      "notified_parents_count": 18
    },
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

#### UT10_FeesInsurance_TC29 : XỬ LÝ TRẠNG THÁI RỖNG AN TOÀN KHI LỚP HỌC CHƯA KHỞI TẠO BẢN GHI THU NỘP NÀO TRONG CƠ SỞ DỮ LIỆU (EMPTY STATE - 200 OK)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Lớp học mới tạo `cls_new_2026` chưa khởi tạo đợt thu học phí hoặc bảo hiểm y tế nào trong cơ sở dữ liệu Cloud Firestore `/fee_records`.
  - Giáo viên chủ nhiệm đã đăng nhập hợp lệ với vai trò `TEACHER_HOMEROOM`.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_gvcn_hop_le>`
  - **Tham số đường dẫn (Path Params):** `classId = cls_new_2026`
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của GVCN vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/fees-insurance/class/cls_new_2026`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Phản hồi kèm Header `X-Response-Time`.
  - Dữ liệu trả về đúng cấu trúc danh sách rỗng an toàn, các số liệu thống kê trả về 0, không gây lỗi null pointer hoặc crash màn hình quản lý thu nộp:
  ```json
  {
    "success": true,
    "status_code": 200,
    "message": "Lấy danh sách thu nộp học phí & BHYT thành công",
    "data": {
      "class_id": "cls_new_2026",
      "total_students": 0,
      "unpaid_tuition_count": 0,
      "unpaid_insurance_count": 0,
      "records": []
    },
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

#### UT10_FeesInsurance_TC30 : XỬ LÝ TRẠNG THÁI RỖNG AN TOÀN KHI LỌC DANH SÁCH CHƯA NỘP NHƯNG 100% HỌC SINH ĐÃ HOÀN THÀNH NGHĨA VỤ (EMPTY STATE - 200 OK)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Toàn bộ học sinh trong lớp `cls_1a_2026` đã hoàn thành 100% nghĩa vụ nộp tiền học phí (`is_paid_tuition: true` trên mọi bản ghi trong DB).
  - GVCN đã đăng nhập hợp lệ.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_gvcn_hop_le>`
  - **Tham số đường dẫn (Path Params):** `classId = cls_1a_2026`
  - **Tham số truy vấn (Query Params):**
  ```json
  {
    "status": "UNPAID",
    "fee_type": "TUITION"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền token GVCN vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/fees-insurance/class/cls_1a_2026?status=UNPAID&fee_type=TUITION`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Phản hồi mảng rỗng `records: []` kèm số lượng nợ `unpaid_tuition_count: 0`.
  - Giao diện GVCN hiển thị huy hiệu hoặc thông báo trạng thái "Tuyệt vời! 100% học sinh đã hoàn thành nộp học phí":
  ```json
  {
    "success": true,
    "status_code": 200,
    "message": "Lọc danh sách thu nộp học phí thành công",
    "data": {
      "class_id": "cls_1a_2026",
      "filtered_fee_type": "TUITION",
      "filtered_status": "UNPAID",
      "unpaid_count": 0,
      "records": []
    },
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

#### UT10_FeesInsurance_TC31 : XỬ LÝ AN TOÀN KHI GỬI THÔNG BÁO ĐÔN ĐỐC NHƯNG CƠ SỞ DỮ LIỆU KHÔNG CÓ PHỤ HUYNH NÀO CÒN NỢ TIỀN (ZERO NOTIFIED - 200 OK)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Toàn bộ học sinh trong lớp `cls_1a_2026` đã đóng đủ Bảo hiểm y tế (`is_paid_insurance: true`).
  - GVCN đã đăng nhập hợp lệ.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_gvcn_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):**
  ```json
  {
    "class_id": "cls_1a_2026",
    "fee_type": "INSURANCE",
    "custom_message": "Nhắc nhở nộp BHYT."
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền token GVCN vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/fees-insurance/remind`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Hệ thống kiểm tra DB, xác nhận không có học sinh nào còn nợ khoản phí này, bỏ qua việc gọi Firebase FCM Multicast để tránh gửi thông báo rác tới phụ huynh.
  - Phản hồi số lượng gửi là 0:
  ```json
  {
    "success": true,
    "status_code": 200,
    "message": "Không có phụ huynh nào chưa hoàn thành khoản phí này để gửi thông báo nhắc nhở",
    "data": {
      "class_id": "cls_1a_2026",
      "fee_type": "INSURANCE",
      "notified_parents_count": 0
    },
    "timestamp": "2026-09-27T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

