# EduConnect (GiaoVienHay) – Master System Architecture Document
## Hệ Thống Quản Lý & Tương Tác Học Sinh Cấp 1 & Cấp 2

---

## 1. Tổng Quan Hệ Thống (System Overview)

- **Tên dự án:** **EduConnect (GiaoVienHay)** – Hệ thống Quản lý & Tương tác Học sinh Cấp 1 & Cấp 2 (Tiểu học & THCS).
- **Mục tiêu:** Số hóa toàn diện quy trình chấm điểm, điểm danh chuyên cần, quản lý lớp học và kết nối với phụ huynh. Cung cấp bộ công cụ trợ giảng đột phá đầu giờ cho giáo viên: **Dò bài cũ, Vòng quay Random học sinh có mặt, Sinh câu hỏi AI từ Docs/PDF và Tạo Mini-game lớp học tương tác**.
- **Tech Stack Cốt Lõi:**
  - **Web Quản trị:** Next.js 14+ (App Router, TypeScript).
  - **Mobile App:** React Native (iOS & Android).
  - **Backend API:** NestJS (TypeScript, Modular Architecture).
  - **AI Engine:** Google Gemini API (`gemini-1.5-flash`) bóc tách tài liệu bài học.
  - **Cơ sở dữ liệu:** PostgreSQL (10 bảng cốt lõi), Redis (Caching & Queue), MongoDB (Bảng tin trường học).
  - **Message Broker & Push:** RabbitMQ, Firebase Cloud Messaging (FCM).

---

## 2. Chi Tiết Các Tính Năng Đặc Thù & Gamification

1. **Dò Bài Cũ & Vòng Quay / Random Học Sinh Lên Bảng:**
   - Cả **GVCN** và **GVBM** đều sử dụng linh hoạt đầu mỗi tiết học.
   - Thuật toán thông minh: Truy vấn bảng `attendances` và **chỉ nạp các học sinh CÓ MẶT HÔM NAY (`status = 'PRESENT'`)**, tự động loại trừ học sinh vắng.
   - Vòng quay may mắn (Lucky Wheel) sinh động, công bằng, nhập điểm miệng trực tiếp vào sổ điểm.
2. **AI Sinh Câu Hỏi Bài Cũ & Tạo Mini-Game Lớp Học (Gamification):**
   - Giáo viên tải lên tài liệu bài học (`.docx`, `.pdf`).
   - Gemini AI tự động bóc tách kiến thức và sinh bộ câu hỏi kiểm tra bài cũ 5-10 phút.
   - **Tự động chuyển đổi thành 4 Mini-Game tương tác chiếu lên bảng lớp:**
     - *1. Rung Chuông Vàng (Golden Bell):* Đếm ngược thời gian, trả lời câu hỏi trắc nghiệm kịch tính.
     - *2. Đua Xe / Vượt Chướng Ngại Vật (Class Racing):* Chia tổ thi đua, trả lời đúng thì xe tiến lên.
     - *3. Hộp Quà May Mắn (Mystery Boxes):* Trả lời đúng được chọn mở hộp quà chứa điểm thưởng/sticker.
     - *4. Chạm Nối Bảng Thông Minh (Smartboard Match):* Kéo thả nối khái niệm/hình ảnh trực tiếp bằng cảm ứng chạm.
3. **Quản Lý Học Phí & Bảo Hiểm Y Tế (BHYT):**
   - Quản lý trạng thái bằng 2 cờ Boolean trực tiếp:
     - `is_paid_tuition`: Đã nộp học phí.
     - `is_paid_insurance`: Đã nộp tiền BHYT học sinh.
   - Checklist 1-chạm cho GVCN và công cụ lọc nhanh danh sách chưa nộp để gửi tin nhắn nhắc nhở phụ huynh qua FCM.

---

## 3. Phân Quyền Chi Tiết (RBAC Guard in NestJS)

- **`ADMIN` (Ban Giám Hiệu):** Quản trị khối 1-9, phân công chuyên môn, quản lý biểu phí toàn trường.
- **`TEACHER_HOMEROOM` (GVCN):** **Toàn quyền giảng dạy sư phạm (dò bài, nhập điểm, tạo game AI, quay random)** + Quản lý điểm danh nề nếp, BHYT & học phí, nhận xét hạnh kiểm lớp chủ nhiệm.
- **`TEACHER_SUBJECT` (GVBM):** Nhập điểm bộ môn, dò bài cũ, tạo đề kiểm tra & game lớp học bằng AI, quay random học sinh.
- **`PARENT` (Phụ huynh):** Tra cứu sổ điểm, chuyên cần, tình trạng BHYT/học phí của con.

---

## 4. Danh Mục 10 Bảng CSDL Cốt Lõi (PostgreSQL)

1. `users`: Tài khoản, password hash, email, SĐT, `role`.
2. `classes`: Tên lớp (1A, 6B), khối 1-9, `homeroom_teacher_id`.
3. `students`: Mã học sinh, họ tên, ngày sinh, giới tính, `class_id`.
4. `student_parent_relations`: Ràng buộc phụ huynh - học sinh.
5. `scores`: Điểm miệng, 15p, 1 tiết, giữa kỳ, cuối kỳ, môn học, giáo viên chấm.
6. `attendances`: Điểm danh ngày, tiết, trạng thái (`PRESENT`, `ABSENT_EXCUSED`, `ABSENT_UNEXCUSED`).
7. `fees_and_insurance`: Quản lý `is_paid_tuition`, `is_paid_insurance`, ngày đóng.
8. `quizzes`: Bộ đề kiểm tra bài cũ / Game tạo từ tài liệu.
9. `questions`: Câu hỏi, 4 phương án, đáp án đúng, giải thích, thời gian đếm ngược, cấu hình game.
10. `notifications`: Lịch sử thông báo đẩy gửi tới thiết bị di động của phụ huynh.

---

## 5. Mục Lục Hệ Thống Tài Liệu (`docs/`)

- 📄 **[system-overview.md](file:///e:/GiaoVienHay/docs/architecture/system-overview.md)**: Tổng quan hệ thống Cấp 1 & 2, Gamification và quyền hạn toàn diện của GVCN.
- 📄 **[tech-stack.md](file:///e:/GiaoVienHay/docs/architecture/tech-stack.md)**: Ngăn xếp công nghệ và sơ đồ Mermaid ERD 10 bảng CSDL.
- 📄 **[actors_and_use_cases.md](file:///e:/GiaoVienHay/docs/architecture/actors_and_use_cases.md)**: Phân quyền chi tiết Admin, GVCN (kế thừa toàn bộ quyền giảng dạy), GVBM, Phụ huynh.
- 📄 **[use_case_descriptions.md](file:///e:/GiaoVienHay/docs/architecture/use_case_descriptions.md)**: Đặc tả chi tiết Dò bài cũ, AI Quiz, 4 Mini-game lớp học và quản lý BHYT.
- 📄 **[project-requirements.md](file:///e:/GiaoVienHay/docs/architecture/project-requirements.md)**: Yêu cầu chức năng FR và phi chức năng NFR.
- 📊 **[use_case_diagram.puml](file:///e:/GiaoVienHay/docs/diagrams/puml/use_case_diagram.puml)**: Sơ đồ Use Case PlantUML có phân hệ Mini-game tương tác lớp học.
- 🌐 **[fe-web-architecture.md](file:///e:/GiaoVienHay/docs/fe/web/fe-web-architecture.md)**: Kiến trúc Web Next.js có module UI 4 Mini-games (Golden Bell, Racing, Mystery Box, Smartboard Match).
- 📱 **[fe-mobile-architecture.md](file:///e:/GiaoVienHay/docs/fe/mobile/fe-mobile-architecture.md)**: Kiến trúc Mobile App React Native.
