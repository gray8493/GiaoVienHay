# TÀI LIỆU KỊCH BẢN KIỂM THỬ ĐƠN VỊ - PHÂN HỆ NHẬN XÉT HỌC SINH
# MÃ PHÂN HỆ: 03 - GRADEBOOK & ASSESSMENT MODULE
# CẤP ĐỘ KIỂM THỬ: KIỂM THỬ ĐƠN VỊ (UNIT TEST)

---

## 1. THÔNG TIN CHUNG

- **PHÂN HỆ HỆ THỐNG:** `03` - Phân hệ Nhận xét & Đánh giá thường xuyên
- **MÔ TẢ MODULE API:** Sổ liên lạc nhận xét học sinh (`RemarksService`, `RemarksController`)
- **TẬP TIN KIỂM THỬ:** 
- **MÔI TRƯỜNG KIỂM THỬ:** Testing

---

## 2. CHI TIẾT CÁC KỊCH BẢN KIỂM THỬ ĐƠN VỊ

---

### UT03_Remarks_TC01 : GỬI LỜI NHẬN XÉT NGẮN GỌN VÀ BẮN THÔNG BÁO FCM CHO PHỤ HUYNH

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên đã đăng nhập và có phân công giảng dạy môn Toán tại lớp `cls_1a_2026`.
  - Học sinh `stu_01` tồn tại trong lớp và đã liên kết với tài khoản phụ huynh.

- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "student_id": "stu_01",
    "class_id": "cls_1a_2026",
    "subject_code": "MATH",
    "content": "Hôm nay em Nam tiếp thu bài rất nhanh và hăng hái xung phong lên bảng chữa bài tập."
  }
  ```

- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của giáo viên vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/remarks`.
  3. Thêm dữ liệu nhận xét vào phần **Body** định dạng `raw (application/json)` theo cấu trúc JSON ở trên.
  4. Bấm nút **Gửi (Send)** để thực thi request.

- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 201 (CREATED - ĐÃ LƯU THÀNH CÔNG)**.
  - Bản ghi nhận xét mới được lưu vào collection `/remarks` và FCM lập tức bắn thông báo tới phụ huynh.
  - Dữ liệu trả về đúng định dạng JSON chuẩn như sau:

  ```json
  {
    "success": true,
    "status_code": 201,
    "message": "Đã lưu nhận xét và gửi thông báo tới phụ huynh",
    "data": {
      "remark_id": "rmk_9912",
      "student_id": "stu_01",
      "content": "Hôm nay em Nam tiếp thu bài rất nhanh và hăng hái xung phong lên bảng chữa bài tập.",
      "created_at": "2026-09-23T10:15:00.000Z",
      "fcm_delivered": true
    }
  }
  ```

- **TRẠNG THÁI KIỂM THỬ:** 

---

### UT03_Remarks_TC02 : TỪ CHỐI LỜI NHẬN XÉT VƯỢT QUÁ GIỚI HẠN 500 KÝ TỰ

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên đã đăng nhập vào hệ thống.
  - Đoạn văn bản nhận xét được soạn thảo dài 550 ký tự (vượt mức trần 500 ký tự).

- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "student_id": "stu_01",
    "class_id": "cls_1a_2026",
    "subject_code": "MATH",
    "content": "Đoạn nhận xét quá dài vượt quá giới hạn 500 ký tự tối đa của hệ thống..."
  }
  ```

- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của giáo viên vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/remarks`.
  3. Thêm dữ liệu chứa nội dung vượt quá 500 ký tự vào phần **Body** định dạng JSON.
  4. Bấm nút **Gửi (Send)** để thực thi request.

- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống ném ra ngoại lệ yêu cầu không hợp lệ **HTTP 400 (BAD REQUEST - YÊU CẦU SAI)**.
  - Dữ liệu lỗi trả về đúng định dạng JSON chuẩn như sau:

  ```json
  {
    "success": false,
    "status_code": 400,
    "error_code": "REMARK_TEXT_TOO_LONG",
    "message": "Nội dung nhận xét không được vượt quá 500 ký tự"
  }
  ```

- **TRẠNG THÁI KIỂM THỬ:** 

---

### UT03_Remarks_TC03 : PHỤ HUYNH XÁC NHẬN ĐÃ ĐỌC LỜI NHẬN XÉT CỦA GIÁO VIÊN

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Phụ huynh đã đăng nhập vào ứng dụng di động.
  - Nhận xét `rmk_9912` gửi cho con của phụ huynh này đang ở trạng thái chưa xác nhận (`is_acknowledged: false`).

- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_phu_huynh>`
  - **Tham số đường dẫn (Path Params JSON):**

  ```json
  {
    "id": "rmk_9912"
  }
  ```

- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của phụ huynh vào mục **Headers**.
  2. Chọn phương thức **`PATCH`**, nhập đường dẫn API: `/api/v1/remarks/rmk_9912/acknowledge`.
  3. Không cần truyền dữ liệu vào phần Body.
  4. Bấm nút **Gửi (Send)** để thực thi request.

- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Trường `is_acknowledged` chuyển thành `true` và lưu mốc thời gian phụ huynh đã xem.
  - Dữ liệu trả về đúng định dạng JSON chuẩn như sau:

  ```json
  {
    "success": true,
    "status_code": 200,
    "message": "Phụ huynh đã xác nhận đã đọc nhận xét",
    "data": {
      "remark_id": "rmk_9912",
      "is_acknowledged": true,
      "acknowledged_at": "2026-09-23T11:00:00.000Z"
    }
  }
  ```

- **TRẠNG THÁI KIỂM THỬ:** 

---

### UT03_Remarks_TC04 : XEM DANH SÁCH LỊCH SỬ NHẬN XÉT TRONG LỚP HỌC

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên đã đăng nhập và có quyền xem thông tin lớp `cls_1a_2026`.
  - Lớp học đã có các nhận xét được gửi trước đó.

- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Tham số đường dẫn & truy vấn (Params JSON):**

  ```json
  {
    "classId": "cls_1a_2026",
    "limit": 20
  }
  ```

- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của giáo viên vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/remarks/class/cls_1a_2026?limit=20`.
  3. Bấm nút **Gửi (Send)** để thực thi request.

- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Dữ liệu trả về đúng định dạng JSON chuẩn như sau:

  ```json
  {
    "success": true,
    "status_code": 200,
    "data": {
      "class_id": "cls_1a_2026",
      "total": 1,
      "items": [
        {
          "remark_id": "rmk_9912",
          "student_id": "stu_01",
          "content": "Hôm nay em Nam tiếp thu bài rất nhanh...",
          "is_acknowledged": true
        }
      ]
    }
  }
  ```

- **TRẠNG THÁI KIỂM THỬ:** 
