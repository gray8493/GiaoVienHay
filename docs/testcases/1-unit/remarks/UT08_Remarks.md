# TÀI LIỆU KỊCH BẢN KIỂM THỬ ĐƠN VỊ - PHÂN HỆ NHẬN XÉT HỌC SINH

# MÃ PHÂN HỆ: 08 - REMARKS MODULE

# CẤP ĐỘ KIỂM THỬ: KIỂM THỬ ĐƠN VỊ (UNIT TEST)

---

## 1. THÔNG TIN CHUNG

- **PHÂN HỆ HỆ THỐNG:** `08` - Phân hệ Sổ liên lạc nhận xét học sinh
- **MÔ TẢ MODULE API:** Sổ liên lạc nhận xét học sinh (`RemarksService`, `RemarksController`)
- **TẬP TIN KIỂM THỬ:** `apps/api/src/modules/08-remarks/remarks.service.spec.ts`, `apps/api/src/modules/08-remarks/remarks.controller.spec.ts`
- **NGƯỜI THỰC HIỆN:** Thái Bảo
- **MÔI TRƯỜNG KIỂM THỬ:** Testing

---

## 2. CHI TIẾT CÁC KỊCH BẢN KIỂM THỬ ĐƠN VỊ

---

### UT08_Remarks_TC01 : GỬI LỜI NHẬN XÉT NGẮN GỌN VÀ BẮN THÔNG BÁO FCM CHO PHỤ HUYNH

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

### UT08_Remarks_TC02 : TỪ CHỐI LỜI NHẬN XÉT VƯỢT QUÁ GIỚI HẠN 500 KÝ TỰ

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

### UT08_Remarks_TC03 : XEM DANH SÁCH LỊCH SỬ NHẬN XÉT TRONG LỚP HỌC

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
          "subject_code": "MATH",
          "content": "Hôm nay em Nam tiếp thu bài rất nhanh và hăng hái xung phong lên bảng chữa bài tập.",
          "created_at": "2026-09-23T10:15:00.000Z"
        }
      ]
    }
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT08_Remarks_TC04 : CHẶN GIÁO VIÊN BỘ MÔN TỰ Ý GỬI NHẬN XÉT MÔN HỌC MÌNH KHÔNG ĐƯỢC PHÂN CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Giáo viên mang tài khoản `usr_teacher_math` chỉ được phân công giảng dạy môn Toán (`MATH`) tại lớp `cls_1a_2026`.
  - Giáo viên cố tình chọn môn Ngữ văn (`LIT`) để nhận xét cho học sinh.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien_toan>`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "student_id": "stu_01",
    "class_id": "cls_1a_2026",
    "subject_code": "LIT",
    "content": "Em làm bài văn miêu tả rất giàu cảm xúc và chữ viết nắn nót."
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực của giáo viên môn Toán vào **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/remarks`.
  3. Gửi payload nhận xét môn Văn (`subject_code: "LIT"`).
  4. Bấm nút **Gửi (Send)** để thực thi request.
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

### UT08_Remarks_TC05 : GIÁO VIÊN CHỦ NHIỆM GỬI NHẬN XÉT NỀ NẾP CHUNG KHÔNG KÈM MÔN HỌC THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Giáo viên có vai trò Giáo viên Chủ nhiệm (`TEACHER_HOMEROOM`) của lớp `cls_1a_2026`.
  - Giáo viên gửi nhận xét về nề nếp, đạo đức và chuyên cần mà không gắn với môn học cụ thể nào.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien_chu_nhiem>`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "student_id": "stu_01",
    "class_id": "cls_1a_2026",
    "subject_code": null,
    "content": "Hôm nay em Nam đi học đúng giờ, đồng phục chỉnh tề và rất tích cực tham gia trực nhật lớp."
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực của giáo viên chủ nhiệm vào **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/remarks`.
  3. Gửi payload với `subject_code = null`.
  4. Bấm nút **Gửi (Send)** để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": true,
    "status_code": 201,
    "message": "Đã lưu nhận xét nề nếp chung và gửi thông báo tới phụ huynh",
    "data": {
      "remark_id": "rmk_9913",
      "student_id": "stu_01",
      "subject_code": null,
      "content": "Hôm nay em Nam đi học đúng giờ, đồng phục chỉnh tề và rất tích cực tham gia trực nhật lớp.",
      "is_homeroom_remark": true,
      "created_at": "2026-09-28T08:30:00.000Z",
      "fcm_delivered": true
    }
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT08_Remarks_TC06 : TỪ CHỐI LỜI NHẬN XÉT RỖNG HOẶC CHỈ TOÀN KHOẢNG TRẮNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Giáo viên đã đăng nhập hợp lệ vào hệ thống.
  - Học sinh `stu_01` tồn tại trong lớp.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "student_id": "stu_01",
    "class_id": "cls_1a_2026",
    "subject_code": "MATH",
    "content": "       "
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực vào **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/remarks`.
  3. Gửi payload có trường `content` chỉ gồm các ký tự phím cách (khoảng trắng rỗng).
  4. Bấm nút **Gửi (Send)** để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 400,
    "error_code": "REMARK_CONTENT_EMPTY",
    "message": "Nội dung nhận xét không được để trống hoặc chỉ có khoảng trắng."
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT08_Remarks_TC07 : TỪ CHỐI LỜI NHẬN XÉT QUÁ NGẮN DƯỚI 3 KÝ TỰ

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Giáo viên đã đăng nhập hợp lệ vào hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "student_id": "stu_01",
    "class_id": "cls_1a_2026",
    "subject_code": "MATH",
    "content": "ok"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực vào **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn: `/api/v1/remarks`.
  3. Gửi payload chứa nội dung nhận xét chỉ có 2 ký tự `"ok"`.
  4. Bấm nút **Gửi (Send)** để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 400,
    "error_code": "REMARK_CONTENT_TOO_SHORT",
    "message": "Nội dung nhận xét phải có tối thiểu 3 ký tự để đảm bảo tính sư phạm."
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT08_Remarks_TC08 : TỪ CHỐI LỜI NHẬN XÉT CHỨA KÝ TỰ ĐẶC BIỆT ĐỘC HẠI HOẶC MÃ SCRIPT XSS

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Người dùng gửi request có chứa các ký tự bậy bạ hoặc mã script injection nhằm tấn công ứng dụng phụ huynh.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "student_id": "stu_01",
    "class_id": "cls_1a_2026",
    "subject_code": "MATH",
    "content": "<script>alert('XSS_ATTACK')</script>@@@###$$$%%%"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực vào **Headers**.
  2. Gửi request `POST /api/v1/remarks` với nội dung chứa mã độc hại.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 400,
    "error_code": "INVALID_INPUT_PAYLOAD",
    "message": "Nội dung nhận xét chứa ký tự đặc biệt không hợp lệ hoặc mã độc tiềm ẩn."
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT08_Remarks_TC09 : GỬI NHẬN XÉT THÀNH CÔNG VỚI CƠ CHẾ CHỊU LỖI KHI DỊCH VỤ GOOGLE FCM GIÁN ĐOẠN TẠM THỜI

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Dữ liệu nhận xét gửi lên hoàn toàn hợp lệ.
  - Cụm máy chủ dịch vụ thông báo Firebase Cloud Messaging (FCM) của Google gặp sự cố mạng hoặc quá thời gian chờ (Deadline Exceeded).
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "student_id": "stu_01",
    "class_id": "cls_1a_2026",
    "subject_code": "MATH",
    "content": "Em Nam làm bài tập về nhà rất đầy đủ và sạch đẹp."
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Giả lập dịch vụ Google FCM ném ngoại lệ kết nối `FirebaseMessagingError: UNAVAILABLE`.
  2. Gửi request `POST /api/v1/remarks`.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": true,
    "status_code": 201,
    "message": "Đã lưu nhận xét thành công. Dịch vụ thông báo phụ huynh đang gặp gián đoạn tạm thời và đã được đưa vào hàng đợi tự động thử lại.",
    "data": {
      "remark_id": "rmk_9914",
      "student_id": "stu_01",
      "fcm_status": "QUEUED_FOR_RETRY",
      "created_at": "2026-09-28T08:35:00.000Z"
    }
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT08_Remarks_TC10 : TỪ CHỐI THAO TÁC DO KHÔNG CÓ TOKEN XÁC THỰC HOẶC TOKEN ĐÃ HẾT HẠN

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Người dùng chưa đăng nhập hoặc Firebase ID Token đã hết hạn quá thời gian cho phép.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** Không truyền header `Authorization` hoặc `Authorization: Bearer <token_het_han>`
  - **Dữ liệu thân (Body JSON):** Payload nhận xét hợp lệ.
- **CÁC BƯỚC THỰC HIỆN:**

  1. Gửi request `POST /api/v1/remarks` mà không kèm token xác thực hợp lệ.
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

### UT08_Remarks_TC11 : TỪ CHỐI GỬI NHẬN XÉT CHO HỌC SINH KHÔNG TỒN TẠI TRONG LỚP

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Giáo viên đã đăng nhập hợp lệ vào hệ thống.
  - Học sinh có mã `stu_nonexistent_9999` không tồn tại trong lớp `cls_1a_2026`.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "student_id": "stu_nonexistent_9999",
    "class_id": "cls_1a_2026",
    "subject_code": "MATH",
    "content": "Em học bài tốt."
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực vào **Headers**.
  2. Gửi request `POST /api/v1/remarks` với mã học sinh không tồn tại.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 404,
    "error_code": "STUDENT_NOT_FOUND",
    "message": "Không tìm thấy hồ sơ học sinh trong lớp học."
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT08_Remarks_TC12 : TỪ CHỐI YÊU CẦU THIẾU CÁC TRƯỜNG DỮ LIỆU BẮT BUỘC KHI GỬI NHẬN XÉT (THIẾU STUDENT_ID HOẶC CLASS_ID)

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Giáo viên gửi nhận xét nhưng payload thiếu mã định danh học sinh hoặc thiếu mã lớp học.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "content": "Em tiếp thu bài nhanh và chăm chú nghe giảng."
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực vào **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn: `/api/v1/remarks`.
  3. Gửi payload thiếu trường `student_id` và `class_id`.
  4. Bấm nút **Gửi (Send)** để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 400,
    "error_code": "COMMON_VALIDATION_ERROR",
    "message": "Dữ liệu không hợp lệ",
    "errors": [
      "student_id không được để trống",
      "class_id không được để trống"
    ]
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT08_Remarks_TC13 : CHẶN GIÁO VIÊN BỘ MÔN GỬI NHẬN XÉT NHƯNG THIẾU MÃ MÔN HỌC BẮT BUỘC (400 BAD REQUEST)

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Giáo viên gửi nhận xét với vai trò Giáo viên Bộ môn (`TEACHER_SUBJECT`, không phải GVCN của lớp).
  - Quy định: Giáo viên bộ môn bắt buộc phải chọn môn học mình phụ trách khi gửi nhận xét.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien_bo_mon>`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "student_id": "stu_01",
    "class_id": "cls_1a_2026",
    "subject_code": null,
    "content": "Em hoàn thành bài tập về nhà rất tốt."
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Giáo viên bộ môn truyền token vào **Headers**.
  2. Chọn phương thức **`POST`**, URL: `/api/v1/remarks`.
  3. Gửi payload có `subject_code = null` (chỉ có GVCN mới được gửi nhận xét chung không môn).
  4. Bấm nút **Gửi (Send)** để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 400,
    "error_code": "COMMON_VALIDATION_ERROR",
    "message": "Giáo viên bộ môn bắt buộc phải chọn mã môn học khi gửi nhận xét."
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT08_Remarks_TC14 : XỬ LÝ LỖI MÁY CHỦ CƠ SỞ DỮ LIỆU FIRESTORE MẤT KẾT NỐI HOẶC TIMEOUT (500 INTERNAL SERVER ERROR)

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Giáo viên gửi yêu cầu nhận xét học sinh hợp lệ.
  - Cụm cơ sở dữ liệu Firestore bị mất kết nối hoặc quá thời gian chờ (Deadline Exceeded / Connection Refused).
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Dữ liệu thân (Body JSON):** Payload nhận xét hợp lệ.
- **CÁC BƯỚC THỰC HIỆN:**

  1. Giả lập (Mock) tầng Database Firestore ném ra ngoại lệ `UNAVAILABLE` hoặc `DEADLINE_EXCEEDED`.
  2. Gửi request `POST /api/v1/remarks`.
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

### UT08_Remarks_TC15 : XỬ LÝ TRẠNG THÁI RỖNG AN TOÀN KHI LỚP HỌC CHƯA CÓ LỜI NHẬN XÉT NÀO TRONG CƠ SỞ DỮ LIỆU (EMPTY STATE - 200 OK)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Lớp học `cls_new_2026` mới được tạo lập đầu năm học và chưa có giáo viên nào gửi bất kỳ lời nhận xét nào trong collection `/remarks`.
  - Giáo viên chủ nhiệm đã đăng nhập hợp lệ.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Tham số đường dẫn (Path Params):** `classId = cls_new_2026`
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền token giáo viên vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/remarks/class/cls_new_2026`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Phản hồi kèm Header `X-Response-Time`.
  - Dữ liệu trả về đúng cấu trúc danh sách rỗng an toàn với `total: 0` và `items: []`, giao diện hiển thị Empty State "Chưa có lời nhận xét nào trong lớp học":
  ```json
  {
    "success": true,
    "status_code": 200,
    "message": "Truy xuất danh sách nhận xét của lớp thành công",
    "data": {
      "class_id": "cls_new_2026",
      "total": 0,
      "items": []
    },
    "timestamp": "2026-10-04T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT08_Remarks_TC16 : XỬ LÝ TRẠNG THÁI RỖNG AN TOÀN KHI XEM LỊCH SỬ NHẬN XÉT CỦA HỌC SINH CHƯA TỪNG NHẬN ĐƯỢC NHẬN XÉT NÀO (EMPTY STUDENT REMARKS - 200 OK)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Học sinh `stu_03` thuộc lớp `cls_1a_2026` chưa từng được giáo viên gửi bất kỳ lời nhận xét môn học hay nề nếp nào trong Firestore.
  - Phụ huynh của học sinh này hoặc Giáo viên đã đăng nhập hợp lệ.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_hop_le>`
  - **Tham số đường dẫn (Path Params):** `studentId = stu_03`
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền token xác thực vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/remarks/student/stu_03`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Trả về danh sách rỗng an toàn `items: []` và `total: 0`, không gây lỗi null pointer khi render danh sách trên app phụ huynh:
  ```json
  {
    "success": true,
    "status_code": 200,
    "message": "Truy xuất lịch sử nhận xét của học sinh thành công",
    "data": {
      "student_id": "stu_03",
      "total": 0,
      "items": []
    },
    "timestamp": "2026-10-04T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

