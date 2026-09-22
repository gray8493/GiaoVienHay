# Tài Liệu Đặc Tả Chi Tiết Trường Hợp Sử Dụng (Use Case Descriptions)
# Hệ Thống GiaoVienHay (EduConnect) – Quản Lý Học Sinh Cấp 1 & Cấp 2

---

## 1. Giới thiệu

Tài liệu này đặc tả chi tiết từng bước cho các trường hợp sử dụng trọng tâm của hệ thống quản lý học sinh Cấp 1 & Cấp 2, đặc biệt là các nghiệp vụ của **Giáo viên chủ nhiệm (GVCN)** và **Giáo viên bộ môn (GVBM)**.

---

## 2. Chi tiết các Use Case Cốt Lõi

### UC-ACA-04: Import Docs/PDF bằng AI (Gemini API) Sinh Câu Hỏi Kiểm Tra Bài Cũ
- **Mã Use Case:** `UC-ACA-04`
- **Tác nhân chính:** Giáo viên (GVBM / GVCN).
- **Tác nhân hỗ trợ:** Google Gemini API, Backend NestJS.
- **Mô tả:** Giáo viên tải lên tài liệu bài học (Word `.docx`, `.pdf`), hệ thống bóc tách văn bản và gọi Google Gemini API để tự động tạo bộ câu hỏi kiểm tra bài cũ 5-10 phút đầu giờ.
- **Tiền điều kiện:** Giáo viên đã đăng nhập và chọn đúng lớp/môn giảng dạy.
- **Hậu điều kiện:** Bộ câu hỏi được tạo trong bảng `quizzes` và `questions`, sẵn sàng trình chiếu lên bảng.
- **Luồng sự kiện chính (Main Flow):**
  1. Giáo viên mở màn hình "Kiểm tra bài cũ" trên Web Next.js.
  2. Chọn tệp tài liệu giáo án bài giảng (`.docx` hoặc `.pdf`) và tải lên.
  3. Chọn cấu hình: Số lượng câu hỏi (ví dụ: 3 câu trắc nghiệm), độ khó (nhận biết, thông hiểu), thời gian làm bài (30s/câu).
  4. Nhấn nút "Tạo câu hỏi bằng AI".
  5. Backend NestJS tiếp nhận file, dùng thư viện trích xuất văn bản (Text Extraction).
  6. Backend gửi prompt tối ưu tới Google Gemini API (`gemini-1.5-flash`) yêu cầu trả về cấu trúc JSON câu hỏi.
  7. Gemini API phản hồi mảng câu hỏi (nội dung, 4 đáp án, đáp án đúng, lời giải thích).
  8. Backend lưu vào CSDL (bảng `quizzes` và `questions`).
  9. Web Next.js hiển thị danh sách câu hỏi để giáo viên duyệt, chỉnh sửa nếu cần.
  10. Giáo viên bấm "Bật chế độ trình chiếu lớp học" (Fullscreen) để chiếu lên bảng tương tác / máy chiếu.

---

### UC-ACA-05: Vòng Quay / Random Học Sinh Có Mặt Hôm Nay Lên Bảng
- **Mã Use Case:** `UC-ACA-05`
- **Tác nhân chính:** Giáo viên (GVBM / GVCN).
- **Tác nhân hỗ trợ:** Backend NestJS, PostgreSQL (Bảng `attendances` và `students`).
- **Mô tả:** Giáo viên sử dụng công cụ quay số / bốc thăm ngẫu nhiên để chọn học sinh lên bảng kiểm tra bài cũ, thuật toán tự động loại bỏ các học sinh vắng mặt hôm nay.
- **Tiền điều kiện:** Lớp học đã được điểm danh trong ngày hiện tại.
- **Hậu điều kiện:** Một học sinh có mặt được chọn ngẫu nhiên, điểm kiểm tra bài cũ có thể nhập trực tiếp vào sổ điểm.
- **Luồng sự kiện chính (Main Flow):**
  1. Tại màn hình trình chiếu kiểm tra bài cũ trên Web Next.js, giáo viên bấm "Gọi học sinh lên bảng".
  2. Web gửi request `GET /api/v1/classes/:id/present-students-today` tới Backend NestJS.
  3. Backend truy vấn bảng `attendances` với điều kiện: `class_id = :id AND attendance_date = CURRENT_DATE AND status = 'PRESENT'`.
  4. Backend trả về danh sách chỉ gồm các học sinh ĐANG CÓ MẶT trong lớp.
  5. Web Next.js hiển thị giao diện Vòng quay may mắn (Lucky Wheel) hoặc Hiệu ứng rút thẻ bài sinh động.
  6. Giáo viên bấm "Quay số", vòng quay khởi chạy kèm âm thanh hồi hộp.
  7. Vòng quay dừng lại tại học sinh trúng thưởng (Ví dụ: "Em Trần Thị Bình - STT 08").
  8. Học sinh lên bảng trả lời câu hỏi bài cũ đang chiếu.
  9. Giáo viên nhập điểm trực tiếp tại pop-up (cột điểm miệng) và nhấn "Lưu điểm".
  10. Điểm số được lưu ngay vào bảng `scores`.

---

### UC-FEE-01: Quản Lý Thu Học Phí & Bảo Hiểm Y Tế (BHYT)
- **Mã Use Case:** `UC-FEE-01`
- **Tác nhân chính:** Giáo viên Chủ nhiệm (GVCN) & Admin.
- **Tác nhân hỗ trợ:** Backend NestJS, PostgreSQL (Bảng `fees_and_insurance`), Firebase FCM.
- **Mô tả:** GVCN theo dõi và quản lý danh sách học sinh của lớp đã hoặc chưa hoàn thành nộp Học phí và Bảo hiểm Y tế thông qua 2 cờ boolean `is_paid_tuition` và `is_paid_insurance`.
- **Tiền điều kiện:** Admin đã khởi tạo đợt thu học phí/BHYT cho khối lớp.
- **Hậu điều kiện:** Dữ liệu nộp tiền được cập nhật chuẩn xác, phụ huynh nhận được thông báo biên lai hoặc tin nhắn nhắc nhở.
- **Luồng sự kiện chính (Main Flow):**
  1. GVCN mở tab "Quản lý Thu phí & BHYT" của lớp chủ nhiệm trên Web Next.js hoặc Mobile App.
  2. Hệ thống hiển thị bảng danh sách học sinh với 2 cột checkbox:
     - `Học phí` (tương ứng cờ `is_paid_tuition`).
     - `BHYT` (tương ứng cờ `is_paid_insurance`).
  3. Khi phụ huynh nộp tiền mặt trực tiếp tại lớp: GVCN tích chọn vào ô tương ứng của học sinh.
  4. Nếu phụ huynh thanh toán online qua App: Hệ thống tự động gán cờ thành `true` và hiển thị thời gian thanh toán.
  5. GVCN có thể bấm nút lọc "Chưa nộp BHYT" $\rightarrow$ danh sách lập tức chỉ hiện các học sinh chưa hoàn thành.
  6. GVCN nhấn nút "Gửi nhắc nhở phụ huynh":
  7. Backend gửi thông báo đẩy (Push Notification) qua FCM tới riêng các phụ huynh chưa nộp: *"Nhà trường xin nhắc Phụ huynh hạn nộp BHYT học sinh năm học 2026-2027 là ngày 30/09."*
