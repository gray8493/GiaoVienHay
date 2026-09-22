# Mẫu Kịch Bản Kiểm Thử Toàn Hệ Thống (System Test Template)
# Cấp độ: System Test (ST) - E2E Testing (Playwright / Detox / Postman Runner)

---

## 1. Thông Tin Chung

- **Kịch bản:** Quy trình xuyên suốt: Đăng nhập -> Điểm danh trên App -> Nhận thông báo Push trên máy Phụ huynh
- **Tác nhân tham gia:** Giáo viên (React Native), Phụ huynh (React Native), Backend NestJS, FCM Server
- **Môi trường:** Staging Environment

---

## 2. Bảng Danh Sách System Test Cases

| Mã Testcase | Tên Kịch Bản E2E | Các Bước Thực Hiện (Steps) | Dữ Liệu Kiểm Thử | Kết Quả Mong Đợi | Trạng Thái |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **ST04_SysAttend_TC01** | Luồng điểm danh và nhận thông báo vắng học E2E | 1. Giáo viên mở App React Native, đăng nhập.<br>2. Chọn lớp 10A1, chọn học sinh An vắng học.<br>3. Bấm "Lưu điểm danh".<br>4. Quan sát điện thoại Phụ huynh của học sinh An. | User Giáo viên: `gv_toan`<br>User Phụ huynh: `ph_an`<br>Học sinh: `Nguyễn Văn An` | 1. Giáo viên nhận thông báo "Điểm danh hoàn tất" trong < 1s.<br>2. Điện thoại Phụ huynh nhận push notification từ FCM trong vòng < 3s: "Học sinh Nguyễn Văn An vắng mặt...". | **PASS** |
| **ST03_SysGrade_TC01** | Luồng nhập điểm trên Web và tra cứu trên Mobile App | 1. Giáo viên vào Web Next.js, nhập điểm 1 tiết môn Toán lớp 10A1.<br>2. Bấm "Phê duyệt công bố".<br>3. Phụ huynh mở App React Native vào tab "Bảng điểm". | Lớp: 10A1<br>Môn: Toán<br>Điểm số: 9.0 | 1. Web hiển thị "Đã công bố thành công".<br>2. App Phụ huynh hiển thị cột điểm 1 tiết môn Toán = 9.0 và điểm trung bình môn cập nhật tức thời. | **PASS** |
