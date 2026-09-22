# Kiến Trúc Web Quản Trị Next.js (Web Frontend Architecture)
# Nền tảng: Next.js 14+ (App Router / TypeScript)

Tài liệu này đặc tả chi tiết cấu trúc, quy ước và nguyên lý phát triển cho ứng dụng **Web Quản trị (Admin & Giáo viên)** thuộc hệ thống GiaoVienHay (EduConnect).

---

## 1. Mục Tiêu & Nhóm Người Dùng (Target Audience)

- **Admin (Ban Giám Hiệu / Quản trị viên trường):**
  - Quản trị cơ cấu trường, năm học, khối lớp, phân lớp học sinh.
  - Quản lý danh sách giáo viên, phân công chuyên môn và thời khóa biểu.
  - Cấu hình biểu phí, xuất báo cáo thống kê toàn trường.
- **Giáo viên (Teacher):**
  - Quản lý sổ điểm chi tiết (nhập hàng loạt bằng bảng tính hoặc import Excel).
  - Phê duyệt và công bố bảng điểm học kỳ.
  - Xem thời khóa biểu giảng dạy và lịch tuần của trường.

---

## 2. Cấu Trúc Thư Mục Chuẩn (Project Folder Structure)

Dự án Web Next.js được tổ chức theo cấu trúc App Router chuẩn:

```text
web-admin/
├── src/
│   ├── app/                                # Next.js App Router (File-based Routing)
│   │   ├── (auth)/                         # Route Group cho luồng xác thực (không có sidebar)
│   │   │   ├── login/                      # Trang đăng nhập
│   │   │   │   └── page.tsx
│   │   │   ├── forgot-password/            # Quên mật khẩu
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/                    # Route Group trang nghiệp vụ chính (có Sidebar & Header)
│   │   │   ├── admin/                      # Khu vực dành riêng cho ADMIN
│   │   │   │   ├── classes/                # Quản lý lớp học
│   │   │   │   ├── teachers/               # Quản lý giáo viên & phân công
│   │   │   │   ├── students/               # Quản lý học sinh
│   │   │   │   ├── billing/                # Quản lý học phí
│   │   │   │   └── page.tsx                # Dashboard tổng quan Admin
│   │   │   ├── teacher/                    # Khu vực dành riêng cho TEACHER
│   │   │   │   ├── gradebook/              # Nhập & phê duyệt sổ điểm
│   │   │   │   ├── attendance/             # Điểm danh học sinh
│   │   │   │   ├── timetable/              # Thời khóa biểu
│   │   │   │   └── page.tsx                # Dashboard Giáo viên
│   │   │   └── layout.tsx                  # Layout chung (Sidebar, Header, Auth Guard)
│   │   ├── layout.tsx                      # Root Layout
│   │   └── globals.css                     # Global Styles & Design System Tokens
│   ├── components/                         # Các UI Components dùng chung
│   │   ├── ui/                             # Button, Input, Modal, Table, Dropdown, Toast
│   │   ├── forms/                          # Form components kết hợp Zod validation
│   │   ├── tables/                         # Datatable với pagination, sorting, search
│   │   └── layout/                         # Sidebar, Header, Breadcrumbs, UserDropdown
│   ├── hooks/                              # Custom React Hooks (useAuth, useDebounce, usePagination)
│   ├── services/                           # Tầng gọi API Backend (Axios Instances)
│   │   ├── auth.service.ts
│   │   ├── academic.service.ts
│   │   └── user.service.ts
│   ├── stores/                             # Zustand Stores (Client state: sidebar toggle, user session)
│   ├── types/                              # TypeScript Interfaces & DTO Types
│   ├── lib/                                # Utilities, formatters (date, currency), axios client
│   └── middleware.ts                       # Next.js Edge Middleware (Route Protection & RBAC Check)
├── public/                                 # Static Assets (Images, Icons, Fonts)
├── next.config.mjs
├── tsconfig.json
└── package.json
```

---

## 3. Quản Lý Trạng Thái & Dữ Liệu (State Management)

1. **Server State (Dữ liệu từ Backend API):**
   - Sử dụng **TanStack Query (React Query v5)**.
   - Cơ chế tự động Caching, Background Refetching khi chuyển tab, quản lý trạng thái `isLoading`, `isError`.
   - Mutation tự động invalidate query cache sau khi tạo/sửa/xóa thành công.
2. **Client State (Trạng thái UI):**
   - Sử dụng **Zustand** cho các trạng thái nhẹ, không cần lưu trữ vĩnh viễn:
     - Trạng thái đóng/mở Sidebar.
     - Lựa chọn bộ lọc hiện tại trên bảng dữ liệu.
3. **Quản lý Xác thực & Bảo mật Token:**
   - Access Token được lưu trữ an toàn trong bộ nhớ hoặc HttpOnly Cookie.
   - `middleware.ts` chặn các request truy cập trái phép trước khi page được render:
     - Nếu chưa đăng nhập $\rightarrow$ Điều hướng về `/login`.
     - Nếu Role là `TEACHER` cố truy cập `/admin/*` $\rightarrow$ Điều hướng về `/teacher` hoặc trang `403 Forbidden`.

---

## 4. Tối Ưu Hiệu Năng & Trải Nghiệm (Performance & UX)

- **Server-Side Rendering (SSR) & Server Components:** Tải trước dữ liệu cơ bản ở phía server giúp FCP (First Contentful Paint) < 1.2s.
- **Streaming & Suspense:** Tận dụng file `loading.tsx` và React Suspense để hiển thị Skeleton Screens mượt mà trong khi dữ liệu bảng điểm lớn đang tải.
- **Tối ưu Bảng Sổ Điểm Lớn:** Áp dụng Virtual Scrolling (React Virtualized hoặc TanStack Virtual) đối với bảng danh sách học sinh từ 50-100 hàng có nhiều cột điểm thành phần.
