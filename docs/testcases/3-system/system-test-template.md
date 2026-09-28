# TÀI LIỆU MẪU KỊCH BẢN KIỂM THỬ TOÀN HỆ THỐNG (SYSTEM TEST TEMPLATE)

# MÃ KỊCH BẢN HỆ THỐNG: [MÃ KỊCH BẢN] - [TÊN QUY TRÌNH HỆ THỐNG E2E]

# CẤP ĐỘ KIỂM THỬ: KIỂM THỬ HỆ THỐNG (SYSTEM TEST - E2E TESTING)

---

## 1. THÔNG TIN CHUNG

- **TÊN QUY TRÌNH HỆ THỐNG:** [Ví dụ: Quy trình Điểm danh đầu giờ $\rightarrow$ Quay số may mắn $\rightarrow$ Kiểm tra bài cũ và Đồng bộ sổ điểm môn học]
- **MÔ TẢ LUỒNG NGHIỆP VỤ XUYÊN SUỐT:** [Mô tả chi tiết kịch bản tương tác đa vai trò từ lúc bắt đầu cho đến khi dữ liệu được đồng bộ toàn diện trên cả hệ thống].
- **CÁC TÁC NHÂN (ACTORS) THAM GIA:**
  - **Giáo viên chủ nhiệm (GVCN):** Thao tác trên thiết bị di động (React Native App) hoặc Web.
  - **Giáo viên bộ môn (GVBM):** Thao tác kiểm tra bài cũ trên màn hình chiếu lớp học.
  - **Phụ huynh học sinh (PHHS):** Thiết bị di động nhận thông báo đẩy FCM và tra cứu sổ liên lạc.
  - **Hệ sinh thái Backend:** API Gateway NestJS, Cloud Firestore, Firebase Auth, FCM Push Service.
- **NGƯỜI THỰC HIỆN / VIẾT TESTCASE:** [Tên người thực hiện]
- **MÔI TRƯỜNG KIỂM THỬ:** Môi trường Staging (Môi trường thử nghiệm hoàn chỉnh kết nối thật giữa Mobile App, Web và Backend API).

---

## 2. BẢNG DANH SÁCH SYSTEM TEST CASES (E2E SUITE)

| Mã Testcase | Tên Luồng Quy Trình Nghiệp Vụ | Các Thiết Bị / Ứng Dụng Tham Gia | Dữ Liệu Thử Nghiệm Toàn Hệ Thống | Kết Quả Kỳ Vọng Cuối Cùng | Trạng Thái |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **ST01_E2E_[Ten]_TC01** | [Tên luồng E2E thành công] | App GV $\rightarrow$ Backend $\rightarrow$ App PH | [Dữ liệu các bước liên hoàn] | [Dữ liệu nhất quán, thông báo đẩy tới đúng thiết bị] | **PASS** |
| **ST01_E2E_[Ten]_TC02** | [Tên luồng E2E xử lý khi gián đoạn mạng/dữ liệu] | App Mobile $\rightarrow$ Backend | [Thao tác khi mất kết nối tạm thời] | [Dữ liệu offline sync an toàn, không bị duplicate] | **PASS** |

---

## 3. CHI TIẾT KỊCH BẢN KIỂM THỬ HỆ THỐNG MẪU

---

### ST05_SysAttend_Quiz_Grade_TC01 : QUY TRÌNH KHÉP KÍN ĐIỂM DANH ĐẦU GIỜ, LỌC HỌC SINH CÓ MẶT VÀO VÒNG QUAY MAY MẮN, CHẤM ĐIỂM BÀI CŨ VÀ ĐỒNG BỘ SỔ ĐIỂM

- **MỤC TIÊU KIỂM THỬ:**
  Xác minh toàn bộ chuỗi mắt xích liên hoàn trong tiết học đầu ngày: GVCN điểm danh $\rightarrow$ Phụ huynh nhận tin nhắn $\rightarrow$ GVBM lấy đúng danh sách học sinh có mặt hôm nay nạp vào Vòng quay may mắn (loại trừ học sinh nghỉ học) $\rightarrow$ Học sinh trả lời bài cũ $\rightarrow$ GV chấm điểm tại chỗ $\rightarrow$ Điểm tự động ghi nhận vào Sổ điểm môn học.

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Lớp học `1A` có sĩ số 3 em: Học sinh A (`stu_01`), Học sinh B (`stu_02`), Học sinh C (`stu_03`).
  - Thiết bị 1: Điện thoại của GVCN (đã đăng nhập tài khoản cô Lan).
  - Thiết bị 2: Điện thoại của Phụ huynh học sinh B (đã đăng nhập tài khoản phụ huynh).
  - Thiết bị 3 (hoặc Laptop kết nối máy chiếu): Màn hình của GVBM Toán (cô Hoa).

- **DỮ LIỆU ĐẦU VÀO VÀ CÁC THIẾT LẬP:**
  - Lớp: `1A` (ID: `cls_1a_2026`).
  - Môn học: Toán học (`MATH`).
  - Trạng thái điểm danh dự kiến: Em A và Em C đi học (`PRESENT`), Em B nghỉ học không phép (`ABSENT_UNEXCUSED`).

- **CÁC BƯỚC THỰC HIỆN CHI TIẾT (CHUỖI HÀNH ĐỘNG E2E):**

  1. **Bước 1 (GVCN Điểm danh):**
     - Trên **Thiết bị 1 (App GVCN)**, cô Lan mở mục "Điểm danh", tích chọn: Em A (Có mặt), Em B (Vắng), Em C (Có mặt).
     - Bấm nút **"Hoàn tất điểm danh"**.

  2. **Bước 2 (Kiểm tra Phụ huynh nhận cảnh báo):**
     - Quan sát **Thiết bị 2 (Điện thoại Phụ huynh em B)**.
     - Kiểm tra trong vòng 3 giây xem thanh thông báo có xuất hiện Push Notification: *"Học sinh B vắng mặt tiết 1 ngày 28/09/2026..."* hay không.
     - Phụ huynh chạm vào thông báo $\rightarrow$ App mở đúng vào màn hình Chi tiết chuyên cần của con.

  3. **Bước 3 (GVBM Mở Vòng quay may mắn kiểm tra bài cũ):**
     - Trên **Thiết bị 3 (Laptop/Tablet GVBM)**, cô Hoa mở bài kiểm tra bài cũ môn Toán và chọn chế độ **Vòng quay may mắn (Lucky Wheel)**.
     - Hệ thống tự động gọi API `/api/v1/quizzes/:id/wheel-candidates` để lấy danh sách học sinh có mặt.
     - Quan sát các nan quạt trên vòng quay hiển thị trên màn hình chiếu.

  4. **Bước 4 (Bấm quay và Nhập điểm tại chỗ):**
     - Bấm nút **"Quay số"** $\rightarrow$ Kim dừng tại nan quạt của Em A (`stu_01`).
     - Em A lên bảng trả lời xuất sắc câu hỏi trắc nghiệm số 1.
     - Cô giáo nhập điểm: `9.0` kèm lời nhận xét *"Thuộc bài tốt"* và bấm **"Lưu điểm bài cũ"**.

  5. **Bước 5 (Kiểm tra tính nhất quán toàn hệ thống trên Sổ điểm):**
     - Mở phân hệ Sổ điểm môn Toán (`/api/v1/grades/class/cls_1a_2026?subject_code=MATH`).
     - Tra cứu thông tin điểm số của Em A.

- **KẾT QUẢ MONG ĐỢI TOÀN HỆ THỐNG (END-TO-END CRITERIA):**
  1. **Tại Bước 1 & 2:** Điểm danh thành công trong thời gian < 1 giây; Điện thoại phụ huynh nhận thông báo đẩy FCM trong thời gian < 3 giây với nội dung rõ ràng, chính xác.
  2. **Tại Bước 3:** Vòng quay may mắn chỉ xuất hiện đúng **2 học sinh (Em A và Em C)**. Học sinh B (vắng mặt) **tuyệt đối không xuất hiện** trên vòng quay.
  3. **Tại Bước 4 & 5:**
     - Bản ghi điểm số được lưu vào lịch sử kiểm tra bài cũ của bài học.
     - Cột điểm miệng (`ORAL_TEST`) trong Sổ điểm môn Toán của Em A lập tức xuất hiện giá trị `9.0` cùng lời phê của giáo viên mà không cần thao tác nhập liệu thủ công lần hai.
     - Dữ liệu hoàn toàn nhất quán trên toàn bộ cơ sở dữ liệu Cloud Firestore.

- **TRẠNG THÁI KIỂM THỬ:** **PASS**
