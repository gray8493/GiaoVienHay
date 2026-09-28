
# Bộ Quy Tắc Chung Khi Làm Việc Với Git (General Git & Workflow Rules)
# Dự Án GiaoVienHay

Tài liệu này quy định toàn bộ chuẩn mực và quy trình bắt buộc khi làm việc với Git (đặt tên nhánh, commit message, quy trình Pull Request và bảo vệ nhánh chính) cho các thành viên dự án **GiaoVienHay**.

---

## 1. Cấu Trúc Đặt Tên Nhánh Chuẩn (Branch Naming Convention)

Dự án quy định 3 nhóm nhánh chính:

### 1.1. Nhánh Tài liệu & Thiết kế (`docs/`)
Dành riêng cho việc tạo tài liệu kiến trúc, đặc tả API, kịch bản testcase và sơ đồ PlantUML:
- Định dạng: `docs/<module-name>-<developer-name>`
- Ví dụ: `docs/auth-api-hungnv`, `docs/uml-diagrams-anlt`

### 1.2. Nhánh Lập trình Tính năng (`feat/`)
Dành cho việc viết mã nguồn phát triển các tính năng mới trên Next.js, React Native hoặc NestJS:
- Định dạng: `feat/<platform>/<feature-name>`
- Ví dụ:
  - `feat/web/class-management`
  - `feat/mobile/attendance-screen`
  - `feat/backend/grade-publish-api`

### 1.3. Nhánh Sửa lỗi (`fix/`)
Dành cho việc khắc phục lỗi phát sinh trong quá trình kiểm thử:
- Định dạng: `fix/<issue-id>-<short-description>`
- Ví dụ: `fix/bug-attendance-sync`, `fix/token-expired-redirect`

---

## 2. Quy Chuẩn Đặt Tên Commit (Conventional Commits)

Tất cả các commit bắt buộc tuân theo định dạng:
```text
<type>(<scope>): <mô tả ngắn gọn bằng tiếng Việt hoặc tiếng Anh>
```

### 2.1. Các tiền tố (Types) bắt buộc:
- `feat`: Thêm tính năng mới cho hệ thống.
- `fix`: Sửa lỗi mã nguồn hoặc xử lý ngoại lệ.
- `docs`: Thêm hoặc chỉnh sửa tài liệu, sơ đồ UML, README.
- `style`: Định dạng mã nguồn, căn chỉnh giao diện không ảnh hưởng logic.
- `refactor`: Tái cấu trúc code nhằm tối ưu hiệu năng hoặc cấu trúc thư mục.
- `test`: Thêm hoặc chỉnh sửa unit test, integration test.
- `chore`: Cấu hình build, package.json, docker, CI/CD pipeline.

### 2.2. Ví dụ commit hợp lệ:
- `feat(web): hoàn thiện giao diện sổ điểm lớp học trên Next.js`
- `feat(backend): tích hợp RabbitMQ phát GradePublishedEvent`
- `fix(mobile): sửa lỗi lưu FCM token khi đăng nhập lần đầu`
- `docs(arch): cập nhật sơ đồ use case toàn hệ thống`

---

## 3. Chính Sách Bảo Vệ Nhánh Chính (Main Branch Protection)

- **TUYỆT ĐỐI KHÔNG PUSH TRỰC TIẾP LÊN NHÁNH `main`**.
- Mọi thay đổi đều phải được thực hiện thông qua **Pull Request (PR)** từ nhánh tính năng.
- Mỗi Pull Request cần đáp ứng:
  1. Build pass (Next.js build, NestJS build, TypeScript compile không có lỗi).
  2. Vượt qua toàn bộ Unit & Integration tests tự động.
  3. Có ít nhất 01 thành viên khác review và phê duyệt (Approve) trước khi merge.

