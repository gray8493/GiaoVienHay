# Kịch Bản Kiểm Thử Đơn Vị (Unit Test Specification) - Phân Hệ Trợ Giảng AI & Game Hóa
# Module: Quizzes (`/api/v1/quizzes`)
# Cấp Độ: Unit Test (UT) - Framework: Jest / NestJS Testing
# Quy Tắc Tuân Thủ: rules/testcase-rules.md

---

## 1. Thông Tin Chung

- **Phân hệ:** `03` - Gradebook & Assessment Module (Theo rules/testcase-rules.md)
- **Module API:** Quizzes (`QuizzesService`, `QuizzesController`)
- **Tập tin kiểm thử:** `src/features/academic/quizzes.service.spec.ts`
- **Người thực hiện:** QA / Developer
- **Môi trường:** Isolated Unit Testing (Mock Google Gemini AI Client, Mock Attendance Repository)

---

## 2. Bảng Danh Sách Unit Test Cases

| Mã Testcase | Tên Kịch Bản | Mục Tiêu Kiểm Thử | Dữ Liệu Đầu Vào (Mock Input) | Kết Quả Mong Đợi (Assertion) | Trạng Thái |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **UT03_Quizzes_TC01** | `generateAI()` tạo câu hỏi từ giáo án | Mock Gemini API phân tích file docx/pdf sinh 5 câu hỏi trắc nghiệm | File: `giao_an_toan.pdf`, `subject_code: "MATH"`, `num_questions: 5`, `difficulty_level: "MEDIUM"` | Trả về HTTP 201, `data.questions` có đúng 5 phần tử, mỗi câu có 4 đáp án A, B, C, D | **PASS** |
| **UT03_Quizzes_TC02** | `getWheelCandidates()` lọc học sinh có mặt | Lấy danh sách học sinh CÓ MẶT trong buổi học cho Vòng quay may mắn | Param: `id = qz_88219`<br>Mock Attendance: `stu_01` (PRESENT), `stu_02` (ABSENT) | Trả về HTTP 200, `candidates` chỉ chứa `stu_01`, loại trừ bạn vắng mặt `stu_02` | **PASS** |
| **UT03_Quizzes_TC03** | `saveInClassScores()` nhập điểm mini-game | Giáo viên nhập điểm khởi động trực tiếp lưu vào sổ điểm `/scores` | Body: `{ "student_id": "stu_01", "score_value": 10.0, "score_type": "QUIZ" }` | Trả về HTTP 201, document điểm được tạo mới trong `/scores` với `score_type === 'QUIZ'` | **PASS** |
| **UT03_Quizzes_TC04** | `generateAI()` từ chối file quá 15MB | Chặn upload giáo án có dung lượng vượt ngưỡng giới hạn | File size: `16.5MB` | Ném `PayloadTooLargeException` (413), tin nhắn *"File giáo án vượt quá 15MB"* | **PASS** |
