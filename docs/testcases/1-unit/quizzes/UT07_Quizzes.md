# TÀI LIỆU KỊCH BẢN KIỂM THỬ ĐƠN VỊ - PHÂN HỆ TRỢ GIẢNG AI & MINI-GAME LỚP HỌC

# MÃ PHÂN HỆ: 07 - QUIZZES & AI TUTOR MODULE

# CẤP ĐỘ KIỂM THỬ: KIỂM THỬ ĐƠN VỊ (UNIT TEST)

---

## 1. THÔNG TIN CHUNG

- **PHÂN HỆ HỆ THỐNG:** `07` - Phân hệ Trợ giảng AI & Game hóa kiểm tra bài cũ
- **MÔ TẢ MODULE API:** Quản lý ngân hàng câu hỏi AI và Vòng quay may mắn (`QuizzesService`, `QuizzesController`)
- **TẬP TIN KIỂM THỬ:** `apps/api/src/modules/07-quizzes/quizzes.service.spec.ts`, `apps/api/src/modules/07-quizzes/quizzes.controller.spec.ts`
- **NGƯỜI THỰC HIỆN:** Thái Bảo
- **MÔI TRƯỜNG KIỂM THỬ:** Testing

---

## 2. CHI TIẾT CÁC KỊCH BẢN KIỂM THỬ ĐƠN VỊ

---

### UT07_Quizzes_TC01 : AI GEMINI PHÂN TÍCH GIÁO ÁN SINH BỘ CÂU HỎI TRẮC NGHIỆM THÀNH CÔNG

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

### UT07_Quizzes_TC02 : GIÁO VIÊN NHẬP ĐIỂM BÀI CŨ ĐƯỢC ĐỒNG BỘ VÀO SỔ ĐIỂM MÔN HỌC

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
    "comment": "Trả lời câu hỏi khởi động xuất sắc",
    "mode_played": "STANDARD_QUIZ"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` của giáo viên vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/quizzes/qz_88219/in-class-scores`.
  3. Thêm dữ liệu chấm điểm vào phần **Body** định dạng `raw (application/json)` theo cấu trúc trên.
  4. Bấm nút **Gửi (Send)** để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

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

### UT07_Quizzes_TC03 : XỬ LÝ AN TOÀN TRÁNH LƯU ĐIỂM TRÙNG LẶP KHI BẤM LƯU ĐIỂM NHIỀU LẦN (IDEMPOTENCY)

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Điểm bài cũ của học sinh `stu_01` trong bộ Quiz `qz_88219` đã được lưu thành công trước đó (`score: 10.0`).
  - Giáo viên vô tình bấm lại nút "Lưu điểm" lần thứ 2 do độ trễ mạng.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "student_id": "stu_01",
    "score": 10.0,
    "comment": "Trả lời câu hỏi khởi động xuất sắc",
    "mode_played": "STANDARD_QUIZ"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực `Authentication Token` của giáo viên vào mục **Headers**.
  2. Gửi request `POST /api/v1/quizzes/qz_88219/in-class-scores` lần thứ hai với cùng payload.
  3. Bấm nút **Gửi (Send)** để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": true,
    "status_code": 200,
    "message": "Điểm số của học sinh trong lượt kiểm tra này đã được ghi nhận trước đó. Không tạo thêm bản ghi trùng lặp.",
    "data": {
      "already_saved": true,
      "student_id": "stu_01",
      "score": 10.0
    }
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT07_Quizzes_TC04 : TỪ CHỐI TỆP GIÁO ÁN CÓ DUNG LƯỢNG VƯỢT QUÁ 15MB

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

  ```json
  {
    "success": false,
    "status_code": 400,
    "error_code": "QUIZ_FILE_TOO_LARGE",
    "message": "Tệp giáo án tải lên vượt quá dung lượng cho phép (tối đa 15MB)."
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT07_Quizzes_TC05 : TỪ CHỐI TỆP GIÁO ÁN SAI ĐỊNH DẠNG KHÔNG ĐƯỢC HỖ TRỢ

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Giáo viên đã đăng nhập vào hệ thống.
  - Tệp tải lên là bảng tính Excel `.xlsx` hoặc ảnh `.png` thay vì tài liệu văn bản `.pdf` hoặc `.docx`.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Dữ liệu tệp gửi lên (JSON mô phỏng payload):**

  ```json
  {
    "file_name": "bang_tinh_ke_hoach_giang_day.xlsx",
    "mime_type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực vào **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/quizzes/generate-ai`.
  3. Đính kèm tệp `.xlsx` và gửi request.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 400,
    "error_code": "QUIZ_FILE_UNSUPPORTED",
    "message": "Định dạng tệp không được hỗ trợ (chỉ chấp nhận .pdf và .docx)."
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT07_Quizzes_TC06 : TỪ CHỐI VÀ CHẶN NHẬP SỐ LƯỢNG CÂU HỎI SAI ĐỊNH DẠNG (CHỮ CÁI, SỐ THẬP PHÂN HOẶC KÝ TỰ ĐẶC BIỆT)

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Giáo viên đã đăng nhập vào hệ thống.
  - Tệp giáo án bài giảng hoàn toàn hợp lệ.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "subject_code": "MATH",
    "class_id": "cls_1a_2026",
    "title": "Kiểm tra bài 12: Phép cộng phân số",
    "num_questions": "nam_cau"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực vào **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/quizzes/generate-ai`.
  3. Gửi payload có trường `num_questions = "nam_cau"` (hoặc chuỗi số thập phân `"5.5"`, ký tự lạ `"@@@"` thay vì số nguyên).
  4. Bấm nút **Gửi (Send)** để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 400,
    "error_code": "INVALID_DATA_TYPE",
    "message": "Số lượng câu hỏi (num_questions) phải là số nguyên dương hợp lệ (từ 1 đến 20)."
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT07_Quizzes_TC07 : CHẶN GỌI AI KHI GIÁO VIÊN ĐÃ DÙNG HẾT HẠN MỨC TRONG NGÀY

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Tài khoản giáo viên đã gọi Google Gemini AI tạo bộ câu hỏi đủ 20 lần trong ngày hôm nay (`daily_ai_usage_count = 20`).
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Dữ liệu thân (Body JSON):** Payload tạo đề trắc nghiệm hợp lệ.
- **CÁC BƯỚC THỰC HIỆN:**

  1. Giáo viên thực hiện gửi request tạo bài kiểm tra bằng AI lần thứ 21 trong ngày.
  2. Chọn phương thức **`POST`**, URL: `/api/v1/quizzes/generate-ai`.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 429,
    "error_code": "QUIZ_DAILY_QUOTA_EXCEEDED",
    "message": "Giáo viên đã sử dụng hết hạn ngạch gọi AI Gemini miễn phí trong ngày (tối đa 20 lần/ngày). Vui lòng quay lại vào ngày mai."
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT07_Quizzes_TC08 : XỬ LÝ LỖI MÁY CHỦ GOOGLE GEMINI KHÔNG THỂ TRÍCH XUẤT CÂU HỎI

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Tệp giáo án và tham số yêu cầu gửi lên hoàn toàn hợp lệ.
  - Máy chủ Google Gemini API gặp sự cố nội bộ hoặc ném ra ngoại lệ không mong muốn.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Dữ liệu thân (Body JSON):** Payload hợp lệ.
- **CÁC BƯỚC THỰC HIỆN:**

  1. Giả lập (Mock) dịch vụ Google Gemini ném ra lỗi ngoại lệ nội bộ `GeminiApiException: INTERNAL_SERVER_ERROR`.
  2. Gửi request `POST /api/v1/quizzes/generate-ai`.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 500,
    "error_code": "QUIZ_AI_GENERATION_FAILED",
    "message": "Lỗi khi Google Gemini xử lý giáo án hoặc sinh câu hỏi trắc nghiệm. Vui lòng thử lại sau giây lát."
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT07_Quizzes_TC09 : XỬ LÝ TIMEOUT KHI DỊCH VỤ GOOGLE GEMINI PHẢN HỒI QUÁ THỜI GIAN CHỜ

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Giáo viên gửi yêu cầu tạo bài trắc nghiệm hợp lệ.
  - Kết nối quốc tế tới máy chủ Google AI Studio bị trễ mạng kéo dài, vượt quá ngưỡng timeout 30 giây của Backend.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Dữ liệu thân (Body JSON):** Payload hợp lệ.
- **CÁC BƯỚC THỰC HIỆN:**

  1. Giả lập dịch vụ Gemini phản hồi trễ sau 35 giây (vượt mức timeout 30s).
  2. Gửi request `POST /api/v1/quizzes/generate-ai`.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 504,
    "error_code": "QUIZ_AI_GATEWAY_TIMEOUT",
    "message": "Dịch vụ AI phản hồi quá thời gian chờ (timeout 30s). Vui lòng kiểm tra lại kết nối mạng và thử lại sau."
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT07_Quizzes_TC10 : XỬ LÝ LỖI KHI DỮ LIỆU AI TRẢ VỀ SAI CẤU TRÚC JSON CÂU HỎI TRẮC NGHIỆM

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Giáo viên gửi yêu cầu tạo câu hỏi thành công tới Gemini API.
  - Gemini AI trả về chuỗi văn bản tự do, thiếu trường đáp án hoặc cấu trúc JSON bị lỗi cú pháp.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Dữ liệu thân (Body JSON):** Payload hợp lệ.
- **CÁC BƯỚC THỰC HIỆN:**

  1. Giả lập phản hồi từ Gemini là chuỗi Markdown không thể parse JSON: `Here are questions: 1. What is...`.
  2. Gửi request `POST /api/v1/quizzes/generate-ai`.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 502,
    "error_code": "QUIZ_AI_PARSING_FAILED",
    "message": "Cấu trúc câu hỏi do AI tạo ra không hợp chuẩn (lỗi parse JSON). Vui lòng thử lại."
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT07_Quizzes_TC11 : TỪ CHỐI TRUY XUẤT BỘ CÂU HỎI KIỂM TRA BÀI CŨ KHÔNG TỒN TẠI

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Giáo viên đã đăng nhập hợp lệ vào hệ thống.
  - Bộ câu hỏi với mã định danh `quiz_id = "qz_nonexistent_9999"` không tồn tại trong collection `/quizzes`.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Tham số đường dẫn (Path Params JSON):**

  ```json
  {
    "id": "qz_nonexistent_9999"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực vào **Headers**.
  2. Chọn phương thức **`GET`**, URL: `/api/v1/quizzes/qz_nonexistent_9999`.
  3. Bấm nút **Gửi (Send)** để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 404,
    "error_code": "QUIZ_NOT_FOUND",
    "message": "Không tìm thấy bộ câu hỏi kiểm tra bài cũ."
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT07_Quizzes_TC12 : TỪ CHỐI VÀ CHẶN NHẬP ĐIỂM SỐ NGOÀI THANG ĐIỂM 0.0 ĐẾN 10.0

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Giáo viên đã đăng nhập và mở bộ câu hỏi `qz_88219`.
  - Học sinh `stu_01` đã tồn tại trong hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "student_id": "stu_01",
    "score": 11.5,
    "comment": "Gõ nhầm điểm số vượt quá thang 10"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực vào **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/quizzes/qz_88219/in-class-scores`.
  3. Gửi payload chứa điểm số `score = 11.5`.
  4. Bấm nút **Gửi (Send)** để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 400,
    "error_code": "ACAD_SCORE_OUT_OF_RANGE",
    "message": "Điểm số phải nằm trong khoảng từ 0.0 đến 10.0."
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT07_Quizzes_TC13 : GIÁO VIÊN CHỈNH SỬA NỘI DUNG VÀ ĐÁP ÁN CÂU HỎI TRONG BỘ ĐỀ THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Giáo viên đã đăng nhập và là chủ sở hữu của bộ câu hỏi `qz_88219`.
  - Câu hỏi số 1 (`question_number: 1`) đã tồn tại trong bộ đề.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Tham số đường dẫn (Path Params):** `id = "qz_88219"`, `question_number = 1`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "content": "Muốn cộng hai phân số có cùng mẫu số, em thực hiện như thế nào?",
    "options": [
      { "key": "A", "text": "Cộng hai tử số với nhau và giữ nguyên mẫu số" },
      { "key": "B", "text": "Cộng cả tử số và mẫu số với nhau" },
      { "key": "C", "text": "Nhân hai tử số và giữ nguyên mẫu số" },
      { "key": "D", "text": "Lấy tử số trừ mẫu số" }
    ],
    "correct_answer": "A",
    "explanation": "Quy tắc: Ta cộng hai tử số và giữ nguyên mẫu số chung."
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực vào mục **Headers**.
  2. Chọn phương thức **`PUT`**, nhập đường dẫn API: `/api/v1/quizzes/qz_88219/questions/1`.
  3. Gửi payload cập nhật nội dung câu hỏi và các phương án trả lời.
  4. Bấm nút **Gửi (Send)** để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": true,
    "status_code": 200,
    "message": "Cập nhật câu hỏi thành công",
    "data": {
      "quiz_id": "qz_88219",
      "question_number": 1,
      "content": "Muốn cộng hai phân số có cùng mẫu số, em thực hiện như thế nào?",
      "correct_answer": "A",
      "updated_at": "2026-09-28T08:30:00.000Z"
    }
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT07_Quizzes_TC14 : YÊU CẦU AI ĐỔI VÀ SINH LẠI RIÊNG MỘT CÂU HỎI KHÔNG ƯNG Ý THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Bộ câu hỏi `qz_88219` có 5 câu hỏi. Giáo viên không ưng ý câu hỏi số 3 và bấm nút "Đổi câu khác".
  - Dịch vụ Google Gemini AI hoạt động ổn định.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Tham số đường dẫn (Path Params):** `id = "qz_88219"`, `question_number = 3`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "difficulty_level": "MEDIUM",
    "prompt_hint": "Tập trung vào bài toán thực tế về phép cộng phân số"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực vào **Headers**.
  2. Chọn phương thức **`POST`**, nhập URL: `/api/v1/quizzes/qz_88219/questions/3/regenerate`.
  3. Bấm nút **Gửi (Send)** để kích hoạt AI tạo câu hỏi thay thế.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": true,
    "status_code": 200,
    "message": "AI đã sinh câu hỏi mới thay thế thành công",
    "data": {
      "quiz_id": "qz_88219",
      "question_number": 3,
      "content": "Một hình chữ nhật có chiều dài 3/5m và chiều rộng 1/5m. Nửa chu vi hình chữ nhật đó là bao nhiêu?",
      "options": [
        { "key": "A", "text": "4/5 m" },
        { "key": "B", "text": "4/10 m" },
        { "key": "C", "text": "2/5 m" },
        { "key": "D", "text": "3/25 m" }
      ],
      "correct_answer": "A",
      "explanation": "Nửa chu vi = Chiều dài + Chiều rộng = 3/5 + 1/5 = 4/5 (m)."
    }
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT07_Quizzes_TC15 : THÊM CÂU HỎI TRẮC NGHIỆM THỦ CÔNG VÀO BỘ ĐỀ THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Bộ câu hỏi `qz_88219` đang có 5 câu hỏi. Giáo viên muốn tự bổ sung thêm 1 câu hỏi trọng tâm.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Tham số đường dẫn (Path Params):** `id = "qz_88219"`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "content": "Kết quả của phép tính 2/7 + 3/7 là:",
    "options": [
      { "key": "A", "text": "5/7" },
      { "key": "B", "text": "5/14" },
      { "key": "C", "text": "6/7" },
      { "key": "D", "text": "1/7" }
    ],
    "correct_answer": "A",
    "explanation": "Ta lấy 2 + 3 = 5, giữ nguyên mẫu số 7."
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực vào **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn: `/api/v1/quizzes/qz_88219/questions`.
  3. Gửi payload chứa nội dung câu hỏi mới.
  4. Bấm nút **Gửi (Send)** để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": true,
    "status_code": 201,
    "message": "Đã thêm câu hỏi mới vào bộ đề thành công",
    "data": {
      "quiz_id": "qz_88219",
      "question_number": 6,
      "total_questions": 6
    }
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT07_Quizzes_TC16 : XÓA BỚT CÂU HỎI KHÔNG PHÙ HỢP KHỎI BỘ ĐỀ THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Bộ câu hỏi `qz_88219` đang có 6 câu hỏi. Giáo viên chỉ muốn kiểm tra 5 câu nên xóa bớt câu số 6.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Tham số đường dẫn (Path Params):** `id = "qz_88219"`, `question_number = 6`
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực vào **Headers**.
  2. Chọn phương thức **`DELETE`**, nhập đường dẫn API: `/api/v1/quizzes/qz_88219/questions/6`.
  3. Bấm nút **Gửi (Send)** để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": true,
    "status_code": 200,
    "message": "Đã xóa câu hỏi khỏi bộ đề thành công",
    "data": {
      "quiz_id": "qz_88219",
      "deleted_question_number": 6,
      "remaining_questions": 5
    }
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT07_Quizzes_TC17 : TỪ CHỐI XÓA CÂU HỎI KHI BỘ ĐỀ CHỈ CÒN DUY NHẤT 1 CÂU (TỐI THIỂU 1 CÂU)

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Bộ câu hỏi `qz_88219` chỉ còn đúng 1 câu hỏi duy nhất (`total_questions = 1`).
  - Giáo viên tiếp tục bấm xóa câu hỏi này.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Tham số đường dẫn (Path Params):** `id = "qz_88219"`, `question_number = 1`
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực vào **Headers**.
  2. Gửi request `DELETE /api/v1/quizzes/qz_88219/questions/1`.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 400,
    "error_code": "QUIZ_MIN_QUESTIONS_REACHED",
    "message": "Bộ câu hỏi phải duy trì tối thiểu ít nhất 1 câu hỏi, không thể xóa tiếp."
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT07_Quizzes_TC18 : TỪ CHỐI CHỈNH SỬA KHI ĐÁP ÁN ĐÚNG KHÔNG NẰM TRONG CÁC LỰA CHỌN [A, B, C, D]

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Giáo viên chỉnh sửa câu hỏi số 1 trong bộ đề.
  - Giáo viên chọn đáp án đúng là `"E"` (hoặc để trống) trong khi các phương án chỉ có A, B, C, D.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "content": "Muốn cộng hai phân số cùng mẫu số, ta làm thế nào?",
    "options": [
      { "key": "A", "text": "Cộng hai tử số với nhau và giữ nguyên mẫu số" },
      { "key": "B", "text": "Cộng cả tử số và mẫu số với nhau" },
      { "key": "C", "text": "Nhân hai phân số" },
      { "key": "D", "text": "Quy đồng mẫu số" }
    ],
    "correct_answer": "E"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Gửi request `PUT /api/v1/quizzes/qz_88219/questions/1` với `correct_answer = "E"`.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 400,
    "error_code": "QUIZ_INVALID_CORRECT_ANSWER",
    "message": "Đáp án đúng phải thuộc danh sách các lựa chọn [A, B, C, D]."
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT07_Quizzes_TC19 : TỪ CHỐI LƯU KHI NỘI DUNG CÂU HỎI HOẶC PHƯƠNG ÁN LỰA CHỌN BỊ ĐỂ TRỐNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Giáo viên sửa câu hỏi nhưng xóa sạch nội dung câu hỏi hoặc để phương án lựa chọn là chuỗi rỗng `""`.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "content": "",
    "options": [
      { "key": "A", "text": "" },
      { "key": "B", "text": "Phương án B" },
      { "key": "C", "text": "Phương án C" },
      { "key": "D", "text": "Phương án D" }
    ],
    "correct_answer": "B"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Gửi request `PUT /api/v1/quizzes/qz_88219/questions/1` với nội dung bị để trống.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 400,
    "error_code": "COMMON_VALIDATION_ERROR",
    "message": "Nội dung câu hỏi và các phương án lựa chọn không được để trống."
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT07_Quizzes_TC20 : TỪ CHỐI YÊU CẦU THIẾU CÁC TRƯỜNG DỮ LIỆU BẮT BUỘC KHI TẠO QUIZ (THIẾU FILE, MÔN HỌC, LỚP HOẶC TIÊU ĐỀ)

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Giáo viên gửi request tạo bài trắc nghiệm bằng AI nhưng không đính kèm file giáo án, thiếu mã lớp, thiếu môn học hoặc tiêu đề để trống.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Dữ liệu thân (Form-Data):** Thiếu trường `file`, thiếu `subject_code`, thiếu `class_id` và `title = ""`.
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực vào **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/quizzes/generate-ai`.
  3. Gửi payload thiếu các trường dữ liệu bắt buộc.
  4. Bấm nút **Gửi (Send)** để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 400,
    "error_code": "COMMON_VALIDATION_ERROR",
    "message": "Dữ liệu không hợp lệ",
    "errors": [
      "file giáo án không được để trống",
      "subject_code không được để trống",
      "class_id không được để trống",
      "title phải có độ dài từ 5 đến 200 ký tự"
    ]
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT07_Quizzes_TC21 : TỪ CHỐI THAO TÁC DO KHÔNG CÓ TOKEN XÁC THỰC HOẶC TOKEN ĐÃ HẾT HẠN (401 UNAUTHORIZED)

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Người dùng chưa đăng nhập hoặc Firebase ID Token đã quá hạn 1800 giây.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** Không truyền header `Authorization` hoặc `Authorization: Bearer <token_het_han>`
  - **Dữ liệu thân (Body JSON):** Payload tạo Quiz hợp lệ.
- **CÁC BƯỚC THỰC HIỆN:**

  1. Gửi request `POST /api/v1/quizzes/generate-ai` mà không kèm token hợp lệ.
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

### UT07_Quizzes_TC22 : CHẶN NGƯỜI DÙNG KHÔNG CÓ VAI TRÒ GIÁO VIÊN TẠO HOẶC CHẤM ĐIỂM QUIZ (403 FORBIDDEN)

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Tài khoản phụ huynh (`usr_parent_01`) hoặc học sinh cố tình gọi API tạo câu hỏi AI hoặc nhập điểm bài cũ.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_phu_huynh>`
  - **Dữ liệu thân (Body JSON):** Payload tạo Quiz.
- **CÁC BƯỚC THỰC HIỆN:**

  1. Dùng token tài khoản phụ huynh gửi request `POST /api/v1/quizzes/generate-ai`.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": false,
    "status_code": 403,
    "error_code": "AUTH_FORBIDDEN",
    "message": "Bạn không có quyền thực hiện thao tác này. Chức năng chỉ dành cho giáo viên."
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT07_Quizzes_TC23 : TỪ CHỐI NHẬP ĐIỂM KHI THIẾU CÁC TRƯỜNG DỮ LIỆU BẮT BUỘC (THIẾU STUDENT_ID HOẶC ĐIỂM SỐ)

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Giáo viên gọi API lưu điểm bài cũ nhưng không truyền mã học sinh hoặc thiếu trường điểm số.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "comment": "Chỉ có lời phê, thiếu mã học sinh và điểm số"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền mã xác thực vào **Headers**.
  2. Chọn phương thức **`POST`**, URL: `/api/v1/quizzes/qz_88219/in-class-scores`.
  3. Gửi payload thiếu `student_id` và `score`.
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
      "score không được để trống và phải là kiểu số"
    ]
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT07_Quizzes_TC24 : TRUY XUẤT DANH SÁCH BỘ CÂU HỎI KIỂM TRA BÀI CŨ ĐÃ TẠO CỦA GIÁO VIÊN THÀNH CÔNG (HTTP 200 OK)

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Giáo viên đã đăng nhập hợp lệ vào hệ thống.
  - Giáo viên đã tạo 2 bộ câu hỏi kiểm tra bài cũ trong tài khoản của mình.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền token xác thực của giáo viên vào **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/quizzes`.
  3. Bấm nút **Gửi (Send)** để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": true,
    "status_code": 200,
    "data": {
      "total": 2,
      "items": [
        {
          "quiz_id": "qz_88219",
          "title": "Kiểm tra bài 12: Phép cộng phân số",
          "subject_code": "MATH",
          "class_id": "cls_1a_2026",
          "difficulty_level": "MEDIUM",
          "total_questions": 5,
          "created_at": "2026-09-28T08:00:00.000Z"
        },
        {
          "quiz_id": "qz_88220",
          "title": "Khởi động bài 13: Phép trừ phân số",
          "subject_code": "MATH",
          "class_id": "cls_1a_2026",
          "difficulty_level": "EASY",
          "total_questions": 4,
          "created_at": "2026-09-27T08:00:00.000Z"
        }
      ]
    }
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT07_Quizzes_TC25 : TRUY XUẤT CHI TIẾT BỘ CÂU HỎI ĐỂ TRÌNH CHIẾU TẠI LỚP THÀNH CÔNG (HTTP 200 OK)

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Bộ câu hỏi `qz_88219` đã tồn tại trong cơ sở dữ liệu và thuộc quyền quản lý của giáo viên.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Tham số đường dẫn (Path Params):** `id = "qz_88219"`
- **CÁC BƯỚC THỰC HIỆN:**

  1. Truyền token xác thực vào **Headers**.
  2. Chọn phương thức **`GET`**, nhập URL: `/api/v1/quizzes/qz_88219`.
  3. Bấm nút **Gửi (Send)** để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**

  ```json
  {
    "success": true,
    "status_code": 200,
    "data": {
      "quiz_id": "qz_88219",
      "title": "Kiểm tra bài 12: Phép cộng phân số",
      "subject_code": "MATH",
      "class_id": "cls_1a_2026",
      "questions": [
        {
          "question_index": 1,
          "content": "Muốn cộng hai phân số cùng mẫu số, ta làm thế nào?",
          "options": [
            "Cộng tử số với tử số và giữ nguyên mẫu số",
            "Cộng cả tử số và mẫu số với nhau",
            "Nhân tử số với mẫu số",
            "Giữ nguyên tử số và cộng mẫu số"
          ],
          "correct_answer": "A",
          "time_limit_seconds": 30
        }
      ]
    }
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT07_Quizzes_TC26 : XỬ LÝ LỖI MÁY CHỦ CƠ SỞ DỮ LIỆU NỘI BỘ KHI LƯU BỘ CÂU HỎI QUIZ (500 INTERNAL SERVER ERROR)

- **ĐIỀU KIỆN TIÊN QUYẾT:**

  - Giáo viên gửi yêu cầu lưu điểm hoặc tạo câu hỏi hợp lệ.
  - Cụm cơ sở dữ liệu Firestore bị sự cố ngắt kết nối nội bộ hoặc lỗi phân quyền hệ thống.
- **DỮ LIỆU ĐẦU VÀO:**

  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Dữ liệu thân (Body JSON):** Payload hợp lệ.
- **CÁC BƯỚC THỰC HIỆN:**

  1. Giả lập (Mock) tầng Database Firestore ném ra lỗi ngoại lệ `InternalServerErrorException`.
  2. Gửi request `POST /api/v1/quizzes/qz_88219/in-class-scores`.
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

### UT07_Quizzes_TC27 : XỬ LÝ TRẠNG THÁI RỖNG AN TOÀN KHI GIÁO VIÊN MỚI CHƯA TỪNG TẠO BỘ CÂU HỎI QUIZ NÀO TRONG CƠ SỞ DỮ LIỆU (EMPTY STATE - 200 OK)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên mới đăng nhập hợp lệ vào hệ thống.
  - Trong cơ sở dữ liệu Cloud Firestore `/quizzes`, chưa có bất kỳ bộ câu hỏi nào được tạo bởi giáo viên này.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien_moi>`
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã token xác thực của giáo viên vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/quizzes`.
  3. Bấm nút **Gửi (Send)** trên Postman để thực thi request.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Phản hồi kèm Header `X-Response-Time`.
  - Dữ liệu trả về đúng cấu trúc danh sách rỗng an toàn với `total: 0` và `items: []`, giao diện hiển thị Empty State hướng dẫn "Bạn chưa có bộ đề kiểm tra bài cũ nào. Hãy tải lên giáo án để AI hỗ trợ tạo câu hỏi":
  ```json
  {
    "success": true,
    "status_code": 200,
    "message": "Truy xuất danh sách bộ câu hỏi thành công",
    "data": {
      "total": 0,
      "items": []
    },
    "timestamp": "2026-10-04T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

---

### UT07_Quizzes_TC28 : TỪ CHỐI LƯU ĐIỂM BÀI CŨ KHI MÃ HỌC SINH KHÔNG TỒN TẠI TRONG CƠ SỞ DỮ LIỆU (STUDENT_NOT_FOUND - 404)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Bộ câu hỏi `qz_88219` tồn tại trong cơ sở dữ liệu và thuộc quyền quản lý của giáo viên.
  - Mã học sinh `stu_not_exist_9999` hoàn toàn không tồn tại trong cơ sở dữ liệu học sinh của lớp học.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_giao_vien>`
    - `Content-Type: application/json`
  - **Tham số đường dẫn (Path Params):** `id = "qz_88219"`
  - **Dữ liệu thân (Body JSON):**
  ```json
  {
    "student_id": "stu_not_exist_9999",
    "score": 8.5,
    "note": "Trả lời câu hỏi tốt"
  }
  ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền token giáo viên vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/quizzes/qz_88219/in-class-scores`.
  3. Gửi payload lưu điểm với mã học sinh không tồn tại trong DB.
  4. Bấm nút **Gửi (Send)** trên Postman.
- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống ném ra ngoại lệ **HTTP 404 (NOT FOUND - KHÔNG TÌM THẤY HỌC SINH)**.
  - Phản hồi cấu trúc Envelope lỗi chuẩn, không ghi nhận bất kỳ điểm số sai lệch nào vào cơ sở dữ liệu:
  ```json
  {
    "success": false,
    "status_code": 404,
    "message": "Không tìm thấy học sinh trong cơ sở dữ liệu của lớp",
    "error_code": "STUDENT_NOT_FOUND",
    "details": null,
    "timestamp": "2026-10-04T08:30:00.000Z"
  }
  ```
- **TRẠNG THÁI KIỂM THỬ:**

