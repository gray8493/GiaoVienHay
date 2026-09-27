# TÀI LIỆU KỊCH BẢN KIỂM THỬ ĐƠN VỊ - PHÂN HỆ TRỢ GIẢNG AI & MINI-GAME LỚP HỌC
# MÃ PHÂN HỆ: 03 - GRADEBOOK & ASSESSMENT MODULE
# CẤP ĐỘ KIỂM THỬ: KIỂM THỬ ĐƠN VỊ (UNIT TEST)

---

## 1. THÔNG TIN CHUNG

- **PHÂN HỆ HỆ THỐNG:** `03` - Phân hệ Trợ giảng AI & Game hóa kiểm tra bài cũ
- **MÔ TẢ MODULE API:** Quản lý ngân hàng câu hỏi AI và Vòng quay may mắn (`QuizzesService`, `QuizzesController`)
- **TẬP TIN KIỂM THỬ:** 
- **MÔI TRƯỜNG KIỂM THỬ:** Testing

---

## 2. CHI TIẾT CÁC KỊCH BẢN KIỂM THỬ ĐƠN VỊ

---

### UT03_Quizzes_TC01 : AI GEMINI PHÂN TÍCH GIÁO ÁN SINH BỘ CÂU HỎI TRẮC NGHIỆM THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên đã đăng nhập và được phân công dạy môn Toán tại lớp `cls_1a_2026`.
  - Tệp giáo án định dạng `.pdf` hợp lệ (kích thước nhỏ hơn 15MB).
  - Dịch vụ Google Gemini API hoạt động ổn định.

- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Dữ liệu thân (Form-Data / JSON tương đương):**

  ```json
  {
    "file": "giao_an_toan_lop_5_phep_cong_phan_so.pdf",
    "subject_code": "MATH",
    "class_id": "cls_1a_2026",
    "title": "Kiểm tra bài 12: Phép cộng phân số",
    "num_questions": 5,
    "difficulty_level": "MEDIUM",
    "preferred_mode": "STANDARD_QUIZ"
  }
  ```

- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của giáo viên vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/quizzes/generate-ai`.
  3. Chọn định dạng `multipart/form-data`, đính kèm tệp giáo án và nhập các trường dữ liệu như trên.
  4. Bấm nút **Gửi (Send)** để thực thi request.

- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 201 (CREATED - ĐÃ TẠO MỚI)**.
  - Gemini AI phân tích thành công và trả về đúng 5 câu hỏi trắc nghiệm gồm 4 đáp án A, B, C, D.
  - Dữ liệu trả về đúng định dạng JSON chuẩn như sau:

  ```json
  {
    "success": true,
    "status_code": 201,
    "message": "AI đã phân tích giáo án và sinh bộ câu hỏi thành công",
    "data": {
      "quiz_id": "qz_88219",
      "title": "Kiểm tra bài 12: Phép cộng phân số",
      "subject_code": "MATH",
      "difficulty_level": "MEDIUM",
      "total_questions": 5,
      "questions": [
        {
          "question_number": 1,
          "content": "Muốn cộng hai phân số cùng mẫu số, ta làm thế nào?",
          "options": [
            { "key": "A", "text": "Cộng hai tử số với nhau và giữ nguyên mẫu số" },
            { "key": "B", "text": "Cộng cả tử số và mẫu số với nhau" },
            { "key": "C", "text": "Nhân chéo hai phân số" },
            { "key": "D", "text": "Quy đồng mẫu số trước" }
          ],
          "correct_answer": "A"
        }
      ]
    }
  }
  ```

- **TRẠNG THÁI KIỂM THỬ:** 

---

### UT03_Quizzes_TC02 : LỌC DANH SÁCH HỌC SINH CÓ MẶT TẠI LỚP CHO VÒNG QUAY MAY MẮN

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Bộ câu hỏi `qz_88219` đã được tạo thành công.
  - Buổi học hôm nay đã có dữ liệu điểm danh: học sinh `stu_01` CÓ MẶT (`PRESENT`), học sinh `stu_02` VẮNG MẶT (`ABSENT`).

- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Tham số đường dẫn (Path Params JSON):**

  ```json
  {
    "id": "qz_88219"
  }
  ```

- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của giáo viên vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/quizzes/qz_88219/wheel-candidates`.
  3. Không cần truyền dữ liệu vào phần Body.
  4. Bấm nút **Gửi (Send)** để thực thi request.

- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Danh sách học sinh chỉ chứa các bạn có mặt (`stu_01`), tự động loại trừ bạn vắng mặt (`stu_02`).
  - Dữ liệu trả về đúng định dạng JSON chuẩn như sau:

  ```json
  {
    "success": true,
    "status_code": 200,
    "data": {
      "quiz_id": "qz_88219",
      "class_id": "cls_1a_2026",
      "total_candidates": 1,
      "students": [
        {
          "id": "stu_01",
          "name": "Trần Bảo Nam",
          "student_code": "HS001"
        }
      ],
      "skip_policy": "AUTO_SPIN_NEXT"
    }
  }
  ```

- **TRẠNG THÁI KIỂM THỬ:** 

---

### UT03_Quizzes_TC03 : GIÁO VIÊN NHẬP ĐIỂM BÀI CŨ ĐƯỢC ĐỒNG BỘ VÀO SỔ ĐIỂM MÔN HỌC

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Học sinh `stu_01` vừa hoàn thành câu hỏi trắc nghiệm hoặc mini-game trên bảng.
  - Giáo viên có quyền nhập điểm môn học cho học sinh này.

- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "student_id": "stu_01",
    "score": 10.0,
    "comment": "Trả lời câu hỏi khởi động xuất sắc"
  }
  ```

- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của giáo viên vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/quizzes/qz_88219/in-class-scores`.
  3. Thêm dữ liệu chấm điểm vào phần **Body** định dạng `raw (application/json)` theo cấu trúc trên.
  4. Bấm nút **Gửi (Send)** để thực thi request.

- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 201 (CREATED - ĐÃ LƯU ĐIỂM)**.
  - Tự động tạo bản ghi điểm mới trong bộ sưu tập `/scores` với loại điểm `score_type: "QUIZ"`.
  - Dữ liệu trả về đúng định dạng JSON chuẩn như sau:

  ```json
  {
    "success": true,
    "status_code": 201,
    "message": "Đã lưu điểm bài cũ vào Sổ điểm môn học",
    "data": {
      "score_id": "sc_auto_7712",
      "student_id": "stu_01",
      "score": 10.0,
      "score_type": "QUIZ",
      "saved_to_gradebook": true
    }
  }
  ```

- **TRẠNG THÁI KIỂM THỬ:** 

---

### UT03_Quizzes_TC04 : TỪ CHỐI TỆP GIÁO ÁN CÓ DUNG LƯỢNG VƯỢT QUÁ 15MB

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên đã đăng nhập vào hệ thống.
  - Giáo viên chuẩn bị tệp giáo án có dung lượng thực tế là 16.5MB (vượt quá hạn mức 15MB).

- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Dữ liệu tệp gửi lên (JSON mô phỏng payload):**

  ```json
  {
    "file_name": "giao_an_dung_luong_lon.pdf",
    "file_size_bytes": 17301504,
    "max_allowed_bytes": 15728640
  }
  ```

- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của giáo viên vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/quizzes/generate-ai`.
  3. Đính kèm tệp có dung lượng 16.5MB vào form tải lên.
  4. Bấm nút **Gửi (Send)** để thực thi request.

- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống ném ra ngoại lệ dung lượng vượt quá **HTTP 413 (PAYLOAD TOO LARGE)**.
  - Tuyệt đối không gọi tới Google Gemini API để tránh lãng phí chi phí xử lý.
  - Dữ liệu lỗi trả về đúng định dạng JSON chuẩn như sau:

  ```json
  {
    "success": false,
    "status_code": 413,
    "error_code": "FILE_TOO_LARGE",
    "message": "File giáo án vượt quá 15MB, vui lòng nén hoặc chọn file khác"
  }
  ```

- **TRẠNG THÁI KIỂM THỬ:** 
