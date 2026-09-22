# Kiến Trúc Web Quản Trị Nền Tảng Next.js (Platform Admin Web Architecture)
# Nền tảng: Next.js 14+ (App Router / TypeScript)
# Đối tượng sử dụng: DUY NHẤT Platform Admin (Quản trị viên Nền tảng)

Tài liệu này đặc tả chi tiết cấu trúc, giao diện và tính năng trên ứng dụng **Web Quản trị Next.js** phục vụ **chỉ riêng Quản trị viên Nền tảng (Platform Admin - "chúng tôi")**. Toàn bộ các nghiệp vụ sư phạm của Giáo viên (GVCN & GVBM) và Phụ huynh được vận hành độc lập trên ứng dụng **Mobile & Tablet App (React Native)**.

---

## 1. Phạm Vi Chức Năng Của Web Admin Next.js

Ứng dụng Web Next.js được tinh gọn tối đa, tập trung duy nhất vào 3 trụ cột quản trị kỹ thuật nền tảng:

### 1.1. Quản Trị Người Dùng & Dữ Liệu Toàn Hệ Thống (CRUD & Ban/Unban)
- **Tra cứu & Quản lý danh sách tài khoản:** Xem danh sách toàn bộ Giáo viên (GVCN, GVBM), Phụ huynh trên hệ thống kèm trạng thái kích hoạt, ngày tạo, số điện thoại, email.
- **Khóa & Mở khóa tài khoản (Ban / Unban User):** 
  - Khóa tài khoản vi phạm chính sách hoặc có hành vi bất thường (`is_active = false`, vô hiệu hóa trên Firebase Auth).
  - Thu hồi tức thì phiên đăng nhập của tài khoản bị khóa.
  - Mở khóa (`Unban`) khôi phục quyền truy cập cho người dùng khi giải quyết xong khiếu nại.
- **Hỗ trợ cập nhật thông tin:** Hỗ trợ điều chỉnh thông tin tài khoản khi người dùng yêu cầu trợ giúp kỹ thuật.

### 1.2. Giám Sát Dữ Liệu Lớp Học Toàn Nền Tảng (System Classes Monitoring)
- Tra cứu danh sách lớp học tổng được tạo bởi các GVCN.
- Theo dõi sĩ số học sinh, danh sách phân công GVBM theo từng lớp.
- Giám sát mã mời (`invite_code`) và link mời (`invite_link`) của các lớp để hỗ trợ kỹ thuật khi phụ huynh gặp sự cố kết nối.

### 1.3. Cấu Hình Hạn Mức Tài Nguyên Hệ Thống (System Limits & Quotas)
- **Hạn mức lớp học & sĩ số:**
  - Cấu hình số lớp tối đa một Giáo viên được phép tạo (ví dụ: mặc định 5 lớp/GV).
  - Cấu hình số học sinh tối đa trong một lớp (ví dụ: tối đa 55 học sinh/lớp).
- **Hạn mức Dịch vụ AI (Google Gemini API Quota):**
  - Cấu hình hạn ngạch gọi AI bóc tách giáo án sinh câu hỏi kiểm tra bài cũ theo ngày (ví dụ: 20 lượt gọi/ngày/GV) nhằm kiểm soát chi phí hạ tầng Google Cloud.
- **Hạn mức lưu trữ tệp (Storage Limit):**
  - Giới hạn dung lượng tải lên tài liệu giáo án `.docx`/`.pdf` lên Firebase Storage (ví dụ: tối đa 15MB/file).

---

## 2. Cấu Trúc Thư Mục Chuẩn (Project Folder Structure)

```text
web-admin/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/                      # Đăng nhập dành riêng cho Platform Admin
│   │   ├── (dashboard)/
│   │   │   ├── admin/                      # Module quản trị nền tảng cốt lõi
│   │   │   │   ├── users/                  # CRUD danh sách người dùng, Ban/Unban tài khoản
│   │   │   │   ├── classes/                # Tra cứu, giám sát dữ liệu lớp học & học sinh
│   │   │   │   └── limits/                 # Cấu hình hạn ngạch tài nguyên (Limit & Quota)
│   │   │   └── layout.tsx                  # Khung giao diện Admin Sidebar, Header
│   ├── components/
│   │   ├── admin/                          # UserTable, BanUserModal, LimitConfigForm
│   │   └── ui/                             # Table, Modal, Button, Input, Badge, Switch
│   ├── services/
│   │   ├── admin-users.service.ts          # Gọi API CRUD & Ban/Unban người dùng
│   │   ├── admin-classes.service.ts        # Gọi API tra cứu lớp học
│   │   └── admin-limits.service.ts         # Gọi API lưu cấu hình hạn mức tài nguyên
│   └── lib/
│       ├── firebase-admin.ts               # Khởi tạo Firebase SDK
│       └── auth-guard.ts                   # Chặn truy cập nếu không phải vai trò ADMIN
```

---

## 3. Quy Chuẩn Bảo Mật (Security & Access Control)

- **RBAC Server-side Guard:** Mọi request vào Web Next.js đều được kiểm tra Custom Claims `role === 'ADMIN'` từ Firebase ID Token.
- **Từ chối tuyệt đối:** Các tài khoản `TEACHER_HOMEROOM`, `TEACHER_SUBJECT` hoặc `PARENT` khi cố tình đăng nhập vào Web Admin Next.js sẽ lập tức bị chặn với mã lỗi `403 Forbidden` và điều hướng về thông báo sử dụng ứng dụng di động.
