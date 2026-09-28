# TÀI LIỆU MẪU KỊCH BẢN KIỂM THỬ NGHIỆM THU NGƯỜI DÙNG (ACCEPTANCE TEST / UAT TEMPLATE)

# MÃ KỊCH BẢN NGHIỆM THU: [MÃ KỊCH BẢN] - [TÊN TÍNH NĂNG NGHIỆM THU]

# CẤP ĐỘ KIỂM THỬ: KIỂM THỬ CHẤP NHẬN NGƯỜI DÙNG (USER ACCEPTANCE TESTING - UAT)

---

## 1. THÔNG TIN CHUNG

- **HỆ THỐNG PHẦN MỀM:** Nền tảng Quản lý Học vụ & Sổ liên lạc Điện tử Thông minh **GiaoVienHay**
- **ĐỐI TƯỢNG THAM GIA NGHIỆM THU (PERSONAS):**
  - **Giáo viên chủ nhiệm (GVCN):** Kiểm tra tính tiện lợi, thao tác 1-chạm nhanh chóng đầu giờ học, đôn đốc BHYT/học phí.
  - **Giáo viên bộ môn (GVBM):** Kiểm tra tính năng tạo đề bài cũ bằng AI, chiếu Vòng quay may mắn/Mini-game tương tác tại lớp và nhập điểm trực tiếp.
  - **Phụ huynh học sinh (PHHS):** Kiểm tra tính kịp thời của thông báo đẩy, sự minh bạch trong sổ liên lạc điện tử (điểm số, chuyên cần, BHYT).
  - **Ban Giám Hiệu / Quản trị viên (Admin):** Kiểm tra phân công chuyên môn, giám sát danh sách lớp học toàn trường.
- **TIÊU CHÍ NGHIỆM THU TỔNG QUAN (ACCEPTANCE CRITERIA):**
  - Giao diện tiếng Việt 100%, từ ngữ sư phạm chuẩn mực, gần gũi với giáo viên và phụ huynh Việt Nam.
  - Tốc độ phản hồi tức thì (thao tác chạm dưới 1 giây, nhận thông báo đẩy dưới 3 giây).
  - Không xuất hiện lỗi sập ứng dụng (Crash), không bị treo màn hình (Freeze) hoặc lỗi hiển thị trắng (White screen).
- **NGƯỜI THỰC HIỆN ĐÁNH GIÁ:** [Họ tên đại diện người dùng hoặc Product Owner]
- **THIẾT BỊ SỬ DỤNG THỰC TẾ:** Điện thoại iPhone (iOS), Điện thoại Samsung/Xiaomi (Android), Laptop/Máy tính bảng kết nối máy chiếu lớp học.

---

## 2. BẢNG TỔNG HỢP KỊCH BẢN NGHIỆM THU (UAT SUITE)

| Mã UAT | Nhóm Người Dùng | Tính Năng Nghiệm Thu | Kịch Bản Thử Nghiệm Thực Tế | Tiêu Chí Chấp Nhận (Acceptance Criteria) | Đánh Giá |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **UAT01_GVCN_01** | Giáo viên chủ nhiệm | Điểm danh nhanh 1-chạm đầu giờ | GVCN cầm điện thoại tại cửa lớp, điểm danh 35 học sinh trong 1 phút | Thao tác mượt mà, lưu thành công không cần chờ đợi, phụ huynh nhận được tin báo vắng | **ĐẠT** |
| **UAT02_GVBM_01** | Giáo viên bộ môn | Sinh câu hỏi AI & Vòng quay có Skip | GVBM tải giáo án lên máy, chiếu Vòng quay may mắn, bấm Skip khi quay trúng bạn vắng | AI sinh đúng 5 câu hỏi trong < 15 giây, nút Skip quay tiếp mượt mà, học sinh hào hứng | **ĐẠT** |
| **UAT03_PHHS_01** | Phụ huynh học sinh | Tra cứu BHYT & Sổ liên lạc con | Phụ huynh mở app xem tình trạng nộp BHYT (kèm ngày nộp) và bấm "Đã đọc" nhận xét | Thông tin hiển thị rõ ràng, nút bấm phản hồi tức thì, tạo cảm giác an tâm | **ĐẠT** |

---

## 3. CHI TIẾT KỊCH BẢN NGHIỆM THU MẪU

---

### UAT02_GVBM_AI_Quiz_Game : NGHIỆM THU TÍNH NĂNG TRỢ GIẢNG AI SINH TRẮC NGHIỆM TỪ GIÁO ÁN VÀ TRÌNH CHIẾU VÒNG QUAY MAY MẮN / MINI-GAME TẠI LỚP HỌC

- **VAI TRÒ NGHIỆM THU:** Giáo viên bộ môn Toán Cấp 1 / Cấp 2.
- **MÔI TRƯỜNG THỰC TẾ:** Trình duyệt Web / Tablet của giáo viên kết nối trực tiếp với TV / Máy chiếu trên bục giảng.

- **BỐI CẢNH NGHIỆP VỤ THỰC TẾ:**
  Cô giáo bước vào tiết học môn Toán, cần khởi động đầu giờ 5 phút bằng 5 câu hỏi trắc nghiệm kiểm tra bài cũ dựa trên tệp giáo án bài giảng đã soạn sẵn. Cô muốn trò chơi thật sôi nổi nhưng không mất thời gian gõ từng câu hỏi, và muốn máy tính tự chọn học sinh ngẫu nhiên để công bằng cho cả lớp.

- **DỮ LIỆU CHUẨN BỊ:**
  - Tệp giáo án: `Bai12_PhepCongPhanSo.docx` (Dung lượng 2MB).
  - Chọn cấu hình: 5 câu hỏi, Độ khó: `Vừa (MEDIUM)`, Chế độ mặc định: `Vòng quay may mắn`.

- **CÁC BƯỚC THAO TÁC THỰC HIỆN CỦA GIÁO VIÊN:**

  1. **Bước 1 (Tải giáo án và chọn thông số):**
     - Cô giáo đăng nhập vào hệ thống GiaoVienHay, vào mục **"Kiểm tra bài cũ / Trợ giảng AI"**.
     - Bấm nút **"Tải lên giáo án"**, chọn file `Bai12_PhepCongPhanSo.docx`.
     - Chọn số lượng câu hỏi: `5 câu`.
     - Chọn độ khó: `Vừa`.
     - Bấm nút **"Bắt đầu sinh câu hỏi bằng AI"**.

  2. **Bước 2 (Kiểm tra kết quả sinh câu hỏi):**
     - Quan sát màn hình chờ và đếm thời gian AI hoàn thành.
     - Đọc lướt qua nội dung 5 câu hỏi trắc nghiệm, các phương án A, B, C, D và phần giải thích quy tắc.

  3. **Bước 3 (Trình chiếu Vòng quay may mắn):**
     - Chuyển màn hình sang chế độ **Toàn màn hình (Full-screen)** để chiếu lên TV lớp học.
     - Bấm chuyển sang giao diện **"Vòng quay may mắn"**.
     - Bấm nút **"Quay số"** để chọn học sinh đầu tiên.
     - Giả sử quay trúng bạn Tuấn (bạn Tuấn hôm nay xin nghỉ ốm). Cô giáo bấm nút **"Bỏ qua (Skip)"**.
     - Quan sát xem vòng quay có tự động quay tiếp để chọn bạn khác hay không.

  4. **Bước 4 (Chấm điểm trực tiếp tại lớp):**
     - Bạn Lan được chọn trả lời đúng câu hỏi số 1.
     - Cô giáo chấm điểm `10` và bấm nút **"Lưu điểm"**.
     - Mở mục Sổ điểm môn Toán của lớp để xem điểm của Lan đã được ghi nhận chưa.

- **TIÊU CHÍ CHẤP NHẬN ĐẠT CHUẨN (ACCEPTANCE CRITERIA):**
  - [x] **Thời gian xử lý của AI:** Hoàn tất việc đọc hiểu file Word và sinh 5 câu hỏi trong vòng **dưới 12 giây**.
  - [x] **Chất lượng câu hỏi:** Câu hỏi bám sát kiến thức phân số lớp 4-5, ngôn từ tiếng Việt rõ ràng, phương án đúng A/B/C/D chính xác không có nhầm lẫn.
  - [x] **Độ hấp dẫn giao diện:** Vòng quay quay mượt mà, âm thanh hiệu ứng sinh động, tạo tiếng reo hò hứng khởi cho học sinh trong lớp.
  - [x] **Tính năng Bỏ qua (Skip):** Khi bấm nút "Skip", hệ thống bỏ qua ngay lập tức không bị đơ, tự động quay lượt tiếp theo để chọn học sinh khác.
  - [x] **Đồng bộ Sổ điểm:** Điểm số 10 của em Lan lập tức nhảy vào cột Điểm miệng trong Sổ điểm môn học mà không cần cô giáo phải nhập lại.

- **KẾT QUẢ ĐÁNH GIÁ CUỐI CÙNG:** **ĐẠT (ACCEPTED)**
- **GHI CHÚ / GÓP Ý CẢI TIẾN THÊM TỪ NGƯỜI DÙNG:**
  - *"Tính năng hoạt động rất nhanh và mượt, giúp tiết kiệm được ít nhất 10 phút soạn bài đầu giờ của giáo viên. Rất hài lòng."*
- **XÁC NHẬN NGHIỆM THU:**
  - Đại diện Giáo viên: *(Đã ký nhận)*
  - Đại diện Nhóm Phát Triển: *(Đã xác nhận)*
