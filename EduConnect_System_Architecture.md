# EduConnect (GiaoVienHay) – Master System Architecture Document
## Hệ Thống Quản Lý Học Sinh Cấp 1 & Cấp 2

---

## 1. Tổng Quan Hệ Thống (System Overview)

- **Tên dự án:** **EduConnect (GiaoVienHay)** – Hệ thống Quản lý Học sinh Cấp 1 & Cấp 2 (Tiểu học & THCS).
- **Mục tiêu:** Số hóa quy trình chấm điểm, điểm danh chuyên cần, quản lý lớp học và gửi thông báo nhận xét định kỳ đến phụ huynh. Tối ưu năng suất giảng dạy đầu giờ cho giáo viên (kiểm tra bài cũ AI, gọi học sinh ngẫu nhiên) và quản lý chặt chẽ BHYT/học phí.
- **Tech Stack Cốt Lõi:**
  - **Web Quản trị:** Next.js 14+ (App Router, TypeScript).
  - **Mobile App:** React Native (iOS & Android).
  - **Backend API:** NestJS (TypeScript, Modular Architecture).
  - **AI Engine:** Google Gemini API (`gemini-1.5-flash`) bóc tách tài liệu bài giảng.
  - **Cơ sở dữ liệu:** PostgreSQL (10 bảng cốt lõi), Redis (Caching & Queue), MongoDB (Bảng tin trường học).
  - **Message Broker & Push:** RabbitMQ, Firebase Cloud Messaging (FCM).

---

## 2. Chi Tiết Các Tính Năng Đặc Thù

1. **Import Docs/PDF bằng AI (Gemini API):**
   - Giáo viên tải lên tài liệu bài học (`.docx`, `.pdf`).
   - AI tự động bóc tách và sinh câu hỏi kiểm tra bài cũ 5-10 phút đầu giờ kèm đáp án và lời giải thích.
   - Hỗ trợ **Classroom Presentation Mode** toàn màn hình, có đồng hồ đếm ngược để chiếu lên bảng thông minh/máy chiếu tại lớp.
2. **Vòng Quay / Random Học Sinh Lên Bảng:**
   - Thuật toán lọc danh sách học sinh **CÓ MẶT HÔM NAY** (dựa trên dữ liệu điểm danh thực tế, tự động loại trừ học sinh vắng học).
   - Vòng quay may mắn sinh động trên Web Next.js để gọi ngẫu nhiên học sinh lên bảng trả lời câu hỏi bài cũ.
   - Cho phép giáo viên nhập điểm miệng trực tiếp vào sổ điểm ngay tại vòng quay.
3. **Quản Lý Học Phí & Bảo Hiểm Y Tế (BHYT):**
   - Quản lý trạng thái bằng 2 cờ Boolean trực tiếp trong CSDL:
     - `is_paid_tuition`: Trạng thái đã hoàn thành nộp học phí.
     - `is_paid_insurance`: Trạng thái đã tham gia và nộp tiền BHYT học sinh.
   - GVCN có checklist nhanh 1-chạm và công cụ lọc các em chưa nộp để gửi tin nhắn nhắc nhở phụ huynh qua FCM.

---

## 3. Phân Quyền Chi Tiết (RBAC Guard in NestJS)

Phân biệt rõ rệt 4 nhóm quyền:
- **`ADMIN` (Ban Giám Hiệu):** Toàn quyền cấu hình niên khóa, khối 1-9, phân công GVCN và GVBM, giám sát thu chi toàn trường.
- **`TEACHER_HOMEROOM` (GVCN):** Điểm danh lớp chủ nhiệm, theo dõi & cập nhật cờ `is_paid_tuition` và `is_paid_insurance`, nhập nhận xét hạnh kiểm định kỳ.
- **`TEACHER_SUBJECT` (GVBM):** Nhập điểm số môn học phụ trách, upload docs/pdf sinh câu hỏi AI, quay random học sinh có mặt hôm nay lên bảng.
- **`PARENT` (Phụ huynh):** Tra cứu sổ điểm, chuyên cần, trạng thái BHYT & học phí của đúng học sinh liên kết.

---

## 4. Kiến Trúc Sơ Đồ CSDL (10 Bảng Cốt Lõi PostgreSQL)

1. `users`: Tài khoản, hash mật khẩu, email, SĐT, `role`.
2. `classes`: Tên lớp (1A, 6B), khối 1-9, năm học, `homeroom_teacher_id`.
3. `students`: Mã học sinh, họ tên, ngày sinh, giới tính, `class_id`.
4. `student_parent_relations`: Quan hệ ràng buộc phụ huynh - học sinh.
5. `scores`: Điểm miệng, 15p, 1 tiết, giữa kỳ, cuối kỳ, môn học, giáo viên chấm.
6. `attendances`: Điểm danh ngày, tiết, trạng thái (`PRESENT`, `ABSENT_EXCUSED`, `ABSENT_UNEXCUSED`), lý do vắng.
7. `fees_and_insurance`: Đợt thu, số tiền, cờ `is_paid_tuition` (bool), cờ `is_paid_insurance` (bool), ngày nộp.
8. `quizzes`: Bộ đề kiểm tra bài cũ (tên bài học, giáo viên tạo, link tài liệu gốc).
9. `questions`: Câu hỏi, 4 phương án A-B-C-D, đáp án đúng, lời giải thích, thời gian đếm ngược.
10. `notifications`: Lịch sử thông báo đẩy gửi tới thiết bị di động của phụ huynh.

---

## 5. Mục Lục Toàn Bộ Hệ Thống Tài Liệu (`docs/`)

- 📄 **[system-overview.md](file:///e:/GiaoVienHay/docs/architecture/system-overview.md)**: Tổng quan hệ thống Cấp 1 & 2 và các tính năng đặc thù.
- 📄 **[tech-stack.md](file:///e:/GiaoVienHay/docs/architecture/tech-stack.md)**: Đặc tả ngăn xếp công nghệ và sơ đồ Mermaid ERD 10 bảng CSDL.
- 📄 **[actors_and_use_cases.md](file:///e:/GiaoVienHay/docs/architecture/actors_and_use_cases.md)**: Phân quyền chi tiết Admin, GVCN, GVBM, Phụ huynh.
- 📄 **[use_case_descriptions.md](file:///e:/GiaoVienHay/docs/architecture/use_case_descriptions.md)**: Đặc tả chi tiết AI Quiz, Random học sinh và quản lý BHYT.
- 📄 **[project-requirements.md](file:///e:/GiaoVienHay/docs/architecture/project-requirements.md)**: Yêu cầu chức năng FR và phi chức năng NFR.
- 📄 **[api-response-codes.md](file:///e:/GiaoVienHay/docs/architecture/api-response-codes.md)**: Quy chuẩn mã phản hồi API và mã lỗi nghiệp vụ.
- 📊 **[use_case_diagram.puml](file:///e:/GiaoVienHay/docs/diagrams/puml/use_case_diagram.puml)**: Sơ đồ Use Case phân cấp GVCN và GVBM.
- 📊 **[activity_diagram.puml](file:///e:/GiaoVienHay/docs/diagrams/puml/activity_diagram.puml)**: Sơ đồ hoạt động toàn chu trình vận hành.
- 📊 **[sequence_diagram.puml](file:///e:/GiaoVienHay/docs/diagrams/puml/sequence_diagram.puml)**: Sơ đồ tuần tự các giai đoạn nghiệp vụ.
- 📊 **[communication_diagram.puml](file:///e:/GiaoVienHay/docs/diagrams/puml/communication_diagram.puml)**: Sơ đồ giao tiếp giữa các đối tượng.
- 🌐 **[fe-web-architecture.md](file:///e:/GiaoVienHay/docs/fe/web/fe-web-architecture.md)**: Kiến trúc Web Next.js có màn hình Vòng quay & Trình chiếu AI Quiz.
- 📱 **[fe-mobile-architecture.md](file:///e:/GiaoVienHay/docs/fe/mobile/fe-mobile-architecture.md)**: Kiến trúc Mobile App React Native.
