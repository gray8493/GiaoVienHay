# Đặc Tả API Phân Hệ Trợ Giảng AI & Game Hóa Lớp Học (AI Quizzes & Gamification API Specification)
# Module: Quizzes (`/api/v1/quizzes`) - Trắc Nghiệm Bài Cũ, Vòng Quay May Mắn & 3 Chế Độ Mini-Game

---

## 1. Tổng Quan Phân Hệ
Phân hệ **Quizzes** là giải pháp toàn diện cho hoạt động **Kiểm tra bài cũ & Khởi động đầu giờ (Warm-up)** tại lớp học Cấp 1 & Cấp 2:
- **Tự động hóa bằng AI (Google Gemini API):** Giáo viên tải lên tệp giáo án bài giảng (`.docx`, `.pdf`), chủ động chọn **Số lượng câu hỏi** và **Độ khó** (`EASY`, `MEDIUM`, `HARD`, `MIXED`). AI Gemini tự động bóc tách kiến thức trọng tâm và sinh ra ngân hàng câu hỏi trắc nghiệm chất lượng chỉ trong 10 giây.
- **Linh hoạt 2 Chế độ trình chiếu tại lớp (Dùng chung bộ câu hỏi):**
  1. **Chế độ Quiz Trắc Nghiệm Tiêu Chuẩn:** Trình chiếu từng slide câu hỏi kèm **Vòng quay may mắn (Lucky Wheel)** để bốc ngẫu nhiên học sinh lên bảng. Nếu quay trúng bạn nào nghỉ học hoặc vắng mặt, Giáo viên chỉ cần bấm nút **"Bỏ qua (Skip)"**, hệ thống tự động quay tiếp vòng mới để chọn bạn khác.
  2. **Chế độ Game Tương Tác Lớp Học:** Nếu không muốn dùng giao diện Quiz thông thường, Giáo viên chuyển sang **Chế độ Game** và lựa chọn 1 trong 3 Mini-game lớp học:
     - `GOLDEN_BELL`: Rung Chuông Vàng / Đấu Trí (học sinh toàn lớp cùng giơ bảng chọn đáp án).
     - `RACING`: Đua Xe Vượt Chướng Ngại Vật (thi đua theo tổ/đội trong lớp).
     - `MYSTERY_BOX`: Hộp Quà Bí Mật (mở câu hỏi và nhận quà điểm số/tràng pháo tay).
- **Tuyệt đối không thi trực tuyến:** Học sinh không sử dụng app để làm bài kiểm tra cá nhân. Toàn bộ là trải nghiệm tương tác trực tiếp tại lớp học; Giáo viên là người trực tiếp chấm và nhập điểm vào Sổ điểm môn học đang dạy (`/scores`).

| Method | Endpoint | Quyền truy cập (RBAC) | Mô tả chức năng |
| :---: | :--- | :---: | :--- |
| `POST` | `/api/v1/quizzes/generate-ai` | `TEACHER_*` | Upload giáo án, chọn số câu, độ khó $\rightarrow$ AI Gemini sinh câu hỏi |
| `GET` | `/api/v1/quizzes` | `TEACHER_*` | Lấy danh sách các bộ bài kiểm tra/game đã tạo của giáo viên |
| `GET` | `/api/v1/quizzes/:id` | `TEACHER_*` | Lấy chi tiết bộ câu hỏi kèm đáp án (dùng chiếu Quiz hoặc chiếu 3 Mini-game) |
| `GET` | `/api/v1/quizzes/:id/wheel-candidates` | `TEACHER_*` | Lấy danh sách học sinh có mặt hôm nay cho **Vòng quay may mắn** (kèm nút Skip) |
| `POST` | `/api/v1/quizzes/:id/in-class-scores` | `TEACHER_*` | Giáo viên nhập điểm bài cũ/mini-game trực tiếp $\rightarrow$ tự động lưu vào Sổ điểm môn học |

---

## 2. Chi Tiết Từng API

### 2.1. POST `/api/v1/quizzes/generate-ai` - AI Sinh Câu Hỏi Từ Giáo Án
- **Mô tả:** Giáo viên tải tệp giáo án lên, chọn số lượng câu hỏi và độ khó mong muốn. Google Gemini AI phân tích nội dung bài học để sinh ra bộ câu hỏi trắc nghiệm tương ứng.
- **Headers:** `Authorization: Bearer <token_gv>`, `Content-Type: multipart/form-data`
- **Form Data:**
  - `file`: Tệp giáo án bài giảng (`.docx` hoặc `.pdf`, tối đa 15MB).
  - `subject_code`: Mã môn học (`MATH`, `LIT`, `ENG`...).
  - `class_id`: ID lớp học áp dụng.
  - `title`: Tiêu đề bài kiểm tra bài cũ (Ví dụ: *"Kiểm tra bài 12 - Phép cộng phân số"*).
  - `num_questions`: **Số lượng câu hỏi do Giáo viên chọn** (Ví dụ: `3`, `5`, `10` câu - Mặc định: `5`).
  - `difficulty_level`: **Độ khó câu hỏi do Giáo viên chọn**:
    - `EASY`: Mức độ nhận biết, câu hỏi cơ bản.
    - `MEDIUM`: Mức độ thông hiểu, vừa phải.
    - `HARD`: Mức độ vận dụng, đòi hỏi suy luận.
    - `MIXED`: Phân hóa hỗn hợp (Mặc định: 60% vừa, 40% khó).
  - `preferred_mode`: Chế độ trình chiếu mặc định (`STANDARD_QUIZ`, `GOLDEN_BELL`, `RACING`, `MYSTERY_BOX`).

#### Response Thành Công (HTTP 201 Created)
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
    "source_doc_url": "https://storage.googleapis.com/.../giao_an_toan_5.pdf",
    "available_modes": ["STANDARD_QUIZ", "GOLDEN_BELL", "RACING", "MYSTERY_BOX"],
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
        "explanation": "Theo quy tắc Toán lớp 4-5: Muốn cộng hai phân số cùng mẫu số, ta cộng hai tử số với nhau và giữ nguyên mẫu số.",
        "time_limit_seconds": 30
      }
    ]
  }
}
```

---

### 2.2. GET `/api/v1/quizzes/:id` - Lấy Chi Tiết Bộ Câu Hỏi Để Trình Chiếu
- **Mô tả:** Lấy danh sách câu hỏi để trình chiếu theo **Chế độ Quiz** hoặc nạp vào **3 Chế độ Mini-game**.
- **Headers:** `Authorization: Bearer <token_gv>`

#### Response Thành Công (HTTP 200 OK)
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

---

### 2.3. GET `/api/v1/quizzes/:id/wheel-candidates` - Lấy Danh Sách Cho Vòng Quay May Mắn
- **Mô tả:** Lấy danh sách học sinh **CÓ MẶT HÔM NAY** trong lớp để nạp vào các nan quạt của Vòng quay may mắn (hỗ trợ nút **Bỏ qua - Skip** khi trúng bạn nghỉ học).
- **Headers:** `Authorization: Bearer <token_gv>`

#### Response Thành Công (HTTP 200 OK)
```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "quiz_id": "qz_88219",
    "class_id": "cls_1a_2026",
    "total_candidates": 32,
    "students": [
      { "id": "stu_01", "name": "Trần Bảo Nam", "student_code": "HS001" },
      { "id": "stu_02", "name": "Lê Ngọc Mai", "student_code": "HS002" }
    ],
    "skip_policy": "AUTO_SPIN_NEXT"
  }
}
```

---

### 2.4. POST `/api/v1/quizzes/:id/in-class-scores` - Giáo Viên Nhập Điểm Trực Tiếp Tại Lớp
- **Mô tả:** Sau khi học sinh trả lời bài cũ (dù qua Quiz hay qua 3 Mini-game), Giáo viên trực tiếp chấm và nhập điểm số tại chỗ. Hệ thống lưu vào `/quiz_results` và tự động cập nhật vào Sổ điểm môn học `/scores` (cột điểm miệng `ORAL_TEST`).
- **Headers:** `Authorization: Bearer <token_gv>`, `Content-Type: application/json`

#### Request Body
```json
{
  "student_id": "stu_01",
  "score": 9.0,
  "mode_played": "GOLDEN_BELL",
  "teacher_note": "Trả lời dứt khoát, giải thích đúng quy tắc toán học",
  "sync_to_scores_table": true
}
```

#### Response Thành Công (HTTP 201 Created)
```json
{
  "success": true,
  "status_code": 201,
  "message": "Đã lưu điểm bài cũ vào sổ điểm môn học",
  "data": {
    "result_id": "res_1029",
    "student_id": "stu_01",
    "score": 9.0,
    "score_type": "ORAL_TEST",
    "synced_to_scores": true,
    "created_at": "2026-09-23T10:15:00.000Z"
  }
}
```
