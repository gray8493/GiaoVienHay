# Kiến Trúc Tầng Giao Diện Người Dùng (Frontend Architecture Overview)
# Dự Án GiaoVienHay

Tài liệu này tổng hợp cấu trúc, phân chia trách nhiệm và tiêu chuẩn kỹ thuật cho toàn bộ tầng Frontend của hệ thống **GiaoVienHay**.

---

## 1. Tổng Quan 2 Nền Tảng Frontend

Hệ thống cung cấp 2 giải pháp giao diện độc lập nhằm tối ưu hóa trải nghiệm cho 3 nhóm đối tượng người dùng:

```text
+--------------------------------------------------------------------------------------------------+
|                                    TẦNG FRONTEND (PRESENTATION LAYER)                            |
+----------------------------------------------------+---------------------------------------------+
| 1. WEB QUẢN TRỊ (Admin & Giáo viên)                | 2. MOBILE APP (Giáo viên & Phụ huynh)       |
|    - Framework: Next.js 14+ (App Router)           |    - Framework: React Native (CLI / Expo)   |
|    - Ngôn ngữ: TypeScript                          |    - Ngôn ngữ: TypeScript                   |
|    - Đối tượng: Platform Admin, Giáo viên           |    - Đối tượng: Giáo viên, Phụ huynh        |
|    - Mục đích: CRUD, Ban, Limit tài nguyên, tạo     |    - Mục đích: Điểm danh nhanh, nhận thông  |
|      lớp, nhập điểm, trình chiếu tương tác.         |      báo đẩy tức thì, tra cứu học bạ, phí.  |
+----------------------------------------------------+---------------------------------------------+
```

---

## 2. Danh Mục Tài Liệu Chi Tiết

- 🌐 **[fe-web-architecture.md](file:///e:/GiaoVienHay/docs/fe/web/fe-web-architecture.md)**: Đặc tả kiến trúc Web Next.js (App Router, Quản lý State, Cấu trúc Thư mục, Phân trang, Tối ưu SEO/Performance).
- 📱 **[fe-mobile-architecture.md](file:///e:/GiaoVienHay/docs/fe/mobile/fe-mobile-architecture.md)**: Đặc tả kiến trúc Mobile App React Native (Navigation, Tích hợp FCM Push Notification, Quản lý State, Lưu trữ bảo mật Keychain).

---

## 3. Quy Chuẩn Kỹ Thuật Dùng Chung (Shared FE Standards)

1. **Ngôn ngữ:** 100% mã nguồn viết bằng **TypeScript** (Strict Mode bật).
2. **Quản lý Kiểu dữ liệu (Shared Types/DTOs):** Sử dụng chung định dạng interface với Backend NestJS theo `api-response-codes.md`.
3. **HTTP Client:** Sử dụng **Axios** kết hợp Interceptors để:
   - Tự động gắn header `Authorization: Bearer <access_token>`.
   - Bắt lỗi `401 Unauthorized` để tự động gọi refresh token hoặc điều hướng về trang đăng nhập.
4. **Quản lý Form & Validation:** Sử dụng `React Hook Form` kết hợp thư viện `Zod` để validate dữ liệu ngay tại client trước khi gửi lên API.

