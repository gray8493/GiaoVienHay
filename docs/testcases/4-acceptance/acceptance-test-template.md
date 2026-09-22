# Mẫu Kịch Bản Kiểm Thử Nghiệm Thu (Acceptance Test Template)
# Cấp độ: User Acceptance Testing (UAT)

---

## 1. Thông Tin Chung

- **Đối tượng nghiệm thu:** Đại diện Ban Giám Hiệu (Admin), Giáo viên chủ nhiệm & Đại diện Hội Phụ huynh học sinh
- **Tiêu chí nghiệm thu:** Đáp ứng đầy đủ các yêu cầu nghiệp vụ thực tế, giao diện tiếng Việt thân thiện, không có lỗi chặn (Blocker/Critical bug).

---

## 2. Bảng Kịch Bản Nghiệm Thu Người Dùng (UAT Cases)

| Mã UAT | Nhóm Người Dùng | Tính Năng Nghiệm Thu | Kịch Bản Thử Nghiệm Thực Tế | Tiêu Chí Chấp Nhận (Acceptance Criteria) | Kết Quả Đánh Giá |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **AT01_Admin_UAT01** | Admin (BGH) | Phân công chuyên môn năm học mới | Admin tạo năm học 2026-2027, tạo lớp 10A1 và phân công Giáo viên An làm GVCN trên Web Next.js | Thao tác dưới 3 phút, giao diện trực quan, dữ liệu hiển thị chính xác trên danh sách lớp. | **ĐẠT** |
| **AT02_Teacher_UAT01**| Giáo viên | Điểm danh lớp học trên điện thoại | Giáo viên đứng tại lớp, mở App React Native, điểm danh 40 học sinh trong 1 phút | Giao diện vuốt/chạm nhanh, có nút xác nhận rõ ràng, không bị giật lag. | **ĐẠT** |
| **AT03_Parent_UAT01** | Phụ huynh | Xem kết quả học tập & Đóng học phí | Phụ huynh mở App tra cứu điểm học kỳ 1 của con và bấm thanh toán học phí qua VNPAY | Hiển thị điểm số rõ ràng, chuyển hướng sang ứng dụng ngân hàng mượt mà, nhận biên lai điện tử ngay sau khi trừ tiền. | **ĐẠT** |
