# TÀI LIỆU KỊCH BẢN KIỂM THỬ NGHIỆM THU NGƯỜI DÙNG TOÀN DIỆN (USER ACCEPTANCE TESTING SPECIFICATION)

# MÃ KỊCH BẢN NGHIỆM THU: UAT_GVH_SUITE - BỘ KỊCH BẢN NGHIỆM THU HỆ THỐNG GIAOVIENHAY

# CẤP ĐỘ KIỂM THỬ: KIỂM THỬ CHẤP NHẬN NGƯỜI DÙNG (USER ACCEPTANCE TESTING - UAT)

---

## 1. THÔNG TIN CHUNG

- **HỆ THỐNG PHẦN MỀM:** Nền tảng Quản lý Học vụ & Sổ liên lạc Điện tử Thông minh **GiaoVienHay** (Quản lý Học sinh Cấp 1 & Cấp 2).
- **ĐỐI TƯỢNG THAM GIA NGHIỆM THU (PERSONAS):**
  - **Giáo viên chủ nhiệm (GVCN):** Kiểm tra tính tiện lợi, thiết lập hồ sơ chọn môn dạy, tạo lớp tổng, thao tác điểm danh 1-chạm nhanh chóng đầu giờ học, đôn đốc nộp BHYT/học phí (cờ boolean, không cổng online), gửi nhận xét text ngắn gọn tới gia đình.
  - **Giáo viên bộ môn (GVBM):** Kiểm tra tính năng tải giáo án Word/PDF để AI Gemini tự động sinh đề bài cũ, trình chiếu Vòng quay may mắn (có nút Bỏ qua - Skip khi vắng), tổ chức Mini-game lớp học (Rung chuông vàng, Đua xe, Hộp quà), nhập điểm đa cột thành phần trực tiếp và trình chiếu Bảng xếp hạng (Leaderboard) môn học.
  - **Phụ huynh học sinh (PHHS):** Kiểm tra tính kịp thời của thông báo đẩy (FCM), sự minh bạch trong sổ liên lạc điện tử (điểm số từng môn, chuyên cần, trạng thái BHYT kèm ngày nộp) và nhận lời nhắc lịch kiểm tra sắp tới để đôn đốc con ôn bài.
  - **Ban Giám Hiệu / Quản trị viên Nền tảng (Platform Admin):** Kiểm tra cấu hình hạn mức tài nguyên (hạn ngạch gọi AI Gemini, giới hạn sĩ số lớp học, dung lượng tải tài liệu) và khả năng khóa/mở khóa tài khoản (Ban/Unban) tức thời.
- **TIÊU CHÍ NGHIỆM THU TỔNG QUAN (ACCEPTANCE CRITERIA):**
  - Giao diện tiếng Việt 100%, từ ngữ sư phạm chuẩn mực, gần gũi với giáo viên, học sinh và phụ huynh Việt Nam.
  - Tốc độ phản hồi tức thì: thao tác chạm/lưu trên màn hình dưới 1 giây, nhận thông báo đẩy FCM tới điện thoại dưới 3 giây.
  - Tối ưu trình chiếu lớp học: giao diện Vòng quay may mắn, Mini-game và Leaderboard hiển thị rực rỡ, hỗ trợ Fullscreen trên máy chiếu/TV bục giảng.
  - Độ ổn định cao: Không xuất hiện lỗi sập ứng dụng (Crash), không bị treo màn hình (Freeze) hoặc lỗi hiển thị trắng (White screen).
- **NGƯỜI THỰC HIỆN ĐÁNH GIÁ:** Đội ngũ Đảm bảo Chất lượng Phần mềm (QA/QC), Đại diện Giáo viên Tiểu học & THCS, Đại diện Hội Phụ huynh Học sinh.
- **THIẾT BỊ SỬ DỤNG THỰC TẾ:**
  - Điện thoại thông minh iOS (iPhone 13, iPhone 15 Pro).
  - Điện thoại thông minh Android (Samsung Galaxy A54, Xiaomi Redmi Note 13).
  - Laptop / Tablet kết nối trực tiếp Máy chiếu (Projector) và Màn hình Tivi tương tác thông minh tại phòng học.

---

## 2. BẢNG TỔNG HỢP KỊCH BẢN NGHIỆM THU (UAT SUITE)

| Mã UAT | Nhóm Người Dùng | Tính Năng Nghiệm Thu | Kịch Bản Thử Nghiệm Thực Tế | Tiêu Chí Chấp Nhận (Acceptance Criteria) | Đánh Giá |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **UAT01_GVCN_01** | Giáo viên chủ nhiệm | Thiết lập môn dạy, tạo lớp tổng & chia sẻ QR | GVCN chọn môn Toán trong hồ sơ, tạo lớp 6A2, nạp Excel 35 học sinh, phân công GVBM Văn, Anh và lấy mã QR gửi Zalo phụ huynh | Lớp tạo hoàn tất < 3s, danh sách học sinh chuẩn xác, tự động gán môn GVCN, mã QR chia sẻ sắc nét |           |
| **UAT02_GVCN_02** | Giáo viên chủ nhiệm | Điểm danh nhanh 1-chạm đầu giờ học | GVCN cầm điện thoại tại cửa lớp, chạm chuyển trạng thái 2 bạn vắng trong 35 em, lưu điểm danh trong 30 giây | Thao tác mượt mà, lưu điểm danh tức thì, phụ huynh của 2 em vắng nhận được Push FCM cảnh báo trong 2 giây |           |
| **UAT03_GVCN_03** | Giáo viên chủ nhiệm | Quản lý thu nộp BHYT & phát thông báo đôn đốc | GVCN tích chọn cờ BHYT cho học sinh nộp tiền mặt tại lớp, lọc 5 em chưa nộp và bấm gửi thông báo nhắc nhở | Ghi nhận cờ nộp kèm ngày thực tế, không cần cổng online rườm rà, thông báo FCM gửi tức thì đến đúng 5 phụ huynh |           |
| **UAT04_GVCN_04** | Giáo viên chủ nhiệm | Nhập nhận xét text ngắn gửi phụ huynh | GVCN nhập lời khen ngắn gọn cho học sinh tiến bộ gửi về gia đình và theo dõi phản hồi phụ huynh | Text ngắn gọn, không thẻ tag rườm rà, phụ huynh nhận thông báo FCM tức thì và bấm nút "Đã đọc" thành công |           |
| **UAT05_GVBM_01** | Giáo viên bộ môn | Tải giáo án để AI Gemini sinh đề trắc nghiệm | GVBM tải file Word giáo án `TeBao.docx`, chọn 5 câu hỏi độ khó Vừa, AI phân tích và trả về bộ đề | AI sinh đúng 5 câu trắc nghiệm chuẩn sư phạm trong < 12 giây, đáp án và lời giải chính xác, xem trước và chỉnh sửa dễ dàng |           |
| **UAT06_GVBM_02** | Giáo viên bộ môn | Vòng quay may mắn có nút Bỏ qua (Skip) & Vào điểm | GVBM chiếu Vòng quay gọi bài cũ, bấm nút "Skip" khi quay trúng bạn vắng mặt, chấm điểm 9 và lưu sổ điểm | Vòng quay đồ họa âm thanh mượt mà, nút Skip quay tiếp ngay không đơ, điểm miệng đồng bộ thẳng vào sổ điểm môn học |           |
| **UAT07_GVBM_03** | Giáo viên bộ môn | Trình chiếu Mini-game lớp học (Rung Chuông Vàng) | GVBM chuyển bộ câu hỏi AI thành game Rung Chuông Vàng toàn màn hình, học sinh giơ bảng trả lời | Giao diện full-screen kịch tính, đồng hồ đếm ngược 30s chính xác, hiệu ứng công bố đáp án reo hò sôi nổi |           |
| **UAT08_GVBM_04** | Giáo viên bộ môn | Nhập điểm thành phần & Chiếu Leaderboard môn học | GVBM nhập điểm 15 phút cho 35 học sinh, chiếu Bảng xếp hạng môn học vinh danh Top 3 và công bố điểm | Nhập số nhanh nhạy, không tự động tính GPA, Leaderboard vinh danh môn học đẹp mắt, thông báo FCM điểm mới gửi tới cả lớp |           |
| **UAT09_GVBM_05** | Giáo viên bộ môn | Tạo lời nhắc lịch kiểm tra gửi phụ huynh đôn đốc | GVBM tạo thông báo lịch kiểm tra 1 tiết Lịch sử kèm dặn dò trọng tâm ôn thi gửi toàn bộ phụ huynh trong lớp | Thông báo lưu vào hệ thống, FCM multicast phát tức thì tới 100% phụ huynh của lớp để kịp thời kèm con học |           |
| **UAT10_PHHS_01** | Phụ huynh học sinh | Tham gia lớp bằng Link mời / QR và kết nối con | Phụ huynh quét mã QR nhận từ Zalo lớp, đăng nhập OTP số điện thoại, tìm đúng tên con và xác nhận kết nối | Thao tác đơn giản < 1 phút, nhận diện đúng học sinh, chuyển hướng ngay vào Sổ liên lạc điện tử của con |           |
| **UAT11_PHHS_02** | Phụ huynh học sinh | Nhận cảnh báo vắng học & Xem chuyên cần | Phụ huynh đang đi làm nhận được tiếng chuông báo con vắng học đầu giờ, mở app xem lịch sử điểm danh | Thông báo đẩy tức thì < 2 giây, nội dung rõ ràng kèm ngày/tiết, xem được thống kê chuyên cần tháng của con |           |
| **UAT12_PHHS_03** | Phụ huynh học sinh | Tra cứu Bảng điểm đa môn & Xác nhận nhận xét | Phụ huynh mở app xem điểm kiểm tra 15 phút vừa công bố, đọc nhận xét của cô giáo và bấm nút "Xác nhận đã đọc" | Bảng điểm rõ từng môn và cột thành phần, đọc lời khen của cô, nút "Đã đọc" phản hồi mượt mà không độ trễ |           |
| **UAT13_PHHS_04** | Phụ huynh học sinh | Tra cứu tình trạng nộp BHYT & Lời nhắc kiểm tra | Phụ huynh xem xác nhận đóng BHYT kèm ngày nộp và đọc dặn dò chuẩn bị bài thi ngày mai của giáo viên | Minh bạch khoản thu BHYT có ngày nộp cụ thể, lời dặn dò kiểm tra chi tiết giúp gia đình đôn đốc con kịp thời |           |
| **UAT14_ADMIN_01** | Quản trị viên hệ thống | Cấu hình hạn mức tài nguyên (Limits / Quotas) | Admin cấu hình hạn ngạch gọi AI Gemini 20 lượt/ngày, sĩ số tối đa 50 HS/lớp và dung lượng upload 10MB | Lưu cấu hình an toàn, middleware áp dụng chặn tức thì khi người dùng vượt ngưỡng, bảo vệ tài nguyên máy chủ |           |
| **UAT15_ADMIN_02** | Quản trị viên hệ thống | Khóa tài khoản vi phạm (Ban) & Thu hồi phiên tức thì | Admin khóa tài khoản có hành vi bất thường, kiểm tra thiết bị người dùng bị đăng xuất ngay và mở khóa lại (Unban) | Cập nhật `is_active=false`, Firebase Auth bị disabled ngay lập tức, chặn mã HTTP 403, mở khóa lại toàn vẹn |           |

---

## 3. CHI TIẾT CÁC KỊCH BẢN NGHIỆM THU CHI TIẾT

---

### UAT01_GVCN_01 : NGHIỆM THU THIẾT LẬP HỒ SƠ MÔN DẠY, KHỞI TẠO LỚP HỌC TỔNG, THÊM DANH SÁCH HỌC SINH TỪ EXCEL, PHÂN CÔNG GVBM VÀ SINH MÃ MỜI / MÃ QR

- **VAI TRÒ NGHIỆM THU:** Giáo viên chủ nhiệm (GVCN) THCS / Tiểu học.
- **MÔI TRƯỜNG THỰC TẾ:** Trình duyệt Web Google Chrome trên Laptop cá nhân của giáo viên kết nối mạng Wi-Fi trường học.
- **BỐI CẢNH NGHIỆP VỤ THỰC TẾ:**
  Bước vào năm học mới 2026-2027, thầy giáo Nguyễn Văn An được phân công làm giáo viên chủ nhiệm lớp `6A2` đồng thời trực tiếp giảng dạy môn `Toán học`. Thầy An cần đăng nhập vào hệ thống GiaoVienHay, cấu hình hồ sơ môn dạy của mình, tạo lớp học tổng `6A2`, nạp danh sách 35 học sinh từ file Excel của nhà trường, phân công cô Hằng dạy môn Ngữ văn, thầy Bình dạy môn Tiếng Anh và lấy mã QR lớp học gửi vào nhóm phụ huynh Zalo.
- **DỮ LIỆU CHUẨN BỊ:**
  - Tài khoản GVCN: `thayan.gvcn@giaovienhay.edu.vn`.
  - Tệp danh sách học sinh: `Danh_sach_lop_6A2.xlsx` (Gồm 35 học sinh đầy đủ Căn cước/Mã học sinh, Họ và tên, Ngày sinh, Giới tính, Tên phụ huynh, SĐT phụ huynh).
  - Thông tin lớp: Lớp `6A2`, Khối `6`, Niên khóa `2026-2027`.
  - Phân công bộ môn: Môn Toán (Thầy An - GVCN tự dạy), Môn Ngữ văn (Cô Hằng), Môn Tiếng Anh (Thầy Bình).

- **CÁC BƯỚC THAO TÁC THỰC HIỆN CỦA GIÁO VIÊN:**
  1. **Bước 1 (Thiết lập hồ sơ môn giảng dạy):**
     - Thầy An đăng nhập vào hệ thống GiaoVienHay trên Web.
     - Vào mục **"Hồ sơ cá nhân / Thiết lập chuyên môn"**.
     - Tại danh sách môn học, thầy tích chọn môn **"Toán học"** trong danh mục `teaching_subjects` và bấm **"Lưu hồ sơ"**.
  2. **Bước 2 (Khởi tạo thông tin lớp học tổng):**
     - Chuyển sang mục **"Quản lý lớp học"**, bấm nút **"Tạo lớp học mới"**.
     - Nhập Tên lớp: `6A2`, chọn Khối: `Khối 6`, chọn Niên khóa: `2026-2027`.
     - Hệ thống tự động nhận diện và tích chọn sẵn môn **"Toán học"** do thầy An trực tiếp đảm nhiệm.
  3. **Bước 3 (Tải danh sách học sinh từ file Excel):**
     - Tại bước "Danh sách học sinh", bấm nút **"Tải lên file Excel"**.
     - Chọn file `Danh_sach_lop_6A2.xlsx` từ máy tính.
     - Quan sát màn hình xem trước dữ liệu: Kiểm tra đủ 35 học sinh, thông tin cột được map chuẩn xác (Mã HS, Họ tên, Ngày sinh, SĐT).
  4. **Bước 4 (Phân công Giáo viên bộ môn):**
     - Tại bảng phân công chuyên môn, chọn môn Ngữ văn $\rightarrow$ chọn tài khoản `Cô Lê Thị Hằng`.
     - Chọn môn Tiếng Anh $\rightarrow$ chọn tài khoản `Thầy Trần Thanh Bình`.
     - Bấm nút **"Hoàn tất khởi tạo lớp học"**.
  5. **Bước 5 (Kiểm tra mã mời & Chia sẻ mã QR):**
     - Màn hình lớp học hiển thị thông báo thành công.
     - Kiểm tra phần thông tin lớp: Xuất hiện Mã mời (Invite Code, ví dụ: `LH6A2X`) và nút **"Tải mã QR lớp học"**.
     - Bấm nút sao chép đường dẫn mời và tải hình ảnh mã QR về máy tính để gửi vào nhóm phụ huynh Zalo.

- **TIÊU CHÍ CHẤP NHẬN ĐẠT CHUẨN (ACCEPTANCE CRITERIA):**
  - [ ] **Tự động liên kết môn dạy:** Hệ thống tự động gán môn Toán cho Thầy An theo đúng cấu hình hồ sơ, không cần chọn lại thủ công.
  - [ ] **Tốc độ đọc file Excel:** Nhận diện và hiển thị bản xem trước 35 học sinh trong vòng **dưới 2 giây**, không phát sinh lỗi lệch cột tiếng Việt có dấu.
  - [ ] **Khởi tạo dữ liệu ngầm tự động:** Khởi tạo document lớp học trong `/classes`, 35 document học sinh trong `/students` và 35 bản ghi theo dõi thu nộp BHYT/học phí trong `/fees_and_insurance` với trạng thái ban đầu `false`.
  - [ ] **Mã mời & Mã QR trực quan:** Đường dẫn mời (`invite_link`) có định dạng chuẩn, mã QR hiển thị rõ nét, quét thử bằng camera điện thoại nhận diện đường link tức thì.

- **KẾT QUẢ ĐÁNH GIÁ CUỐI CÙNG:** 
- **GHI CHÚ / GÓP Ý CẢI TIẾN THÊM TỪ NGƯỜI DÙNG:**
- **XÁC NHẬN NGHIỆM THU:**
  - Đại diện Giáo viên Chủ nhiệm: 
  - Đại diện Nhóm Phát Triển: 

---

### UAT02_GVCN_02 : NGHIỆM THU TÍNH NĂNG ĐIỂM DANH CHUYÊN CẦN 1-CHẠM ĐẦU GIỜ HỌC VÀ TỰ ĐỘNG PHÁT THÔNG BÁO ĐẨY TỨC THỜI TỚI PHỤ HUYNH

- **VAI TRÒ NGHIỆM THU:** Giáo viên chủ nhiệm (GVCN).
- **MÔI TRƯỜNG THỰC TẾ:** Ứng dụng di động GiaoVienHay Mobile App (React Native) chạy trên điện thoại iPhone 13 của giáo viên tại cửa lớp học qua mạng 4G/Wi-Fi.
- **BỐI CẢNH NGHIỆP VỤ THỰC TẾ:**
  Vào lúc 7h15 sáng đầu giờ học, cô giáo chủ nhiệm bước vào lớp `6A2` để điểm danh sĩ số 35 học sinh. Mặc định hệ thống đã tích chọn sẵn trạng thái "Có mặt" cho toàn bộ danh sách. Cô giáo chỉ cần quan sát nhanh các chỗ ngồi trống, chạm 1-chạm để chuyển trạng thái cho 2 bạn vắng mặt (em Nguyễn Hoàng Long vắng có phép do phụ huynh đã nhắn xin nghỉ ốm, em Trần Đức Anh vắng chưa rõ lý do). Sau đó cô bấm nút lưu điểm danh trong chưa đầy 30 giây.
- **DỮ LIỆU CHUẨN BỊ:**
  - Danh sách lớp `6A2`: 35 học sinh.
  - Học sinh vắng 1: Em Nguyễn Hoàng Long (`stu_long_01`) $\rightarrow$ Trạng thái: `Vắng có phép (ABSENT_EXCUSED)`.
  - Học sinh vắng 2: Em Trần Đức Anh (`stu_anh_02`) $\rightarrow$ Trạng thái: `Vắng không phép (ABSENT_UNEXCUSED)`.
  - Điện thoại phụ huynh em Trần Đức Anh đã cài đặt App GiaoVienHay và đăng nhập tài khoản.

- **CÁC BƯỚC THAO TÁC THỰC HIỆN CỦA GIÁO VIÊN:**
  1. **Bước 1 (Mở màn hình Điểm danh):**
     - Cô giáo mở ứng dụng GiaoVienHay trên iPhone, chọn lớp `6A2`, bấm vào mục **"Điểm danh đầu giờ"**.
     - Màn hình hiển thị danh sách 35 học sinh với trạng thái mặc định tất cả đều là huy hiệu màu xanh **"Có mặt"** (`PRESENT`).
  2. **Bước 2 (Chạm 1-chạm đổi trạng thái học sinh vắng):**
     - Cuộn đến tên em Nguyễn Hoàng Long, chạm 1 lần vào biểu tượng trạng thái để chuyển sang màu vàng **"Vắng có phép"**.
     - Cuộn đến tên em Trần Đức Anh, chạm 2 lần để chuyển sang màu đỏ **"Vắng không phép"**.
  3. **Bước 3 (Lưu và phát cảnh báo vắng):**
     - Quan sát bảng tóm tắt sĩ số trên đỉnh màn hình: `Tổng số: 35 | Có mặt: 33 | Vắng: 2 (1 có phép, 1 không phép)`.
     - Bấm nút lớn **"Lưu kết quả điểm danh"**.
  4. **Bước 4 (Quan sát phản hồi trên thiết bị phụ huynh):**
     - Cầm điện thoại của phụ huynh em Trần Đức Anh đang để màn hình khóa.
     - Đếm thời gian nhận được thông báo đẩy (Push Notification).

- **TIÊU CHÍ CHẤP NHẬN ĐẠT CHUẨN (ACCEPTANCE CRITERIA):**
  - [ ] **Tốc độ thao tác 1-chạm:** Việc chuyển đổi trạng thái giữa Có mặt $\rightarrow$ Vắng có phép $\rightarrow$ Vắng không phép diễn ra tức thì, giao diện mượt mà không có độ trễ giật lag.
  - [ ] **Thời gian lưu dữ liệu:** Bấm Lưu và nhận thông báo thành công trong vòng **dưới 1 giây**.
  - [ ] **Tốc độ thông báo đẩy FCM:** Điện thoại phụ huynh em Đức Anh nhận được thông báo đẩy trong vòng **dưới 2.5 giây** với nội dung: *"Thông báo chuyên cần: Em Trần Đức Anh vắng mặt không phép tiết học sáng ngày 05/10/2026. Kính đề nghị phụ huynh kiểm tra và liên hệ với GVCN."*
  - [ ] **Bảo vệ phụ huynh khác:** Phụ huynh của 33 học sinh có mặt không nhận thông báo spam làm phiền.
  - [ ] **Chặn trùng lặp:** Nếu cô giáo bấm Lưu điểm danh thêm lần nữa trong cùng buổi, hệ thống thông báo dữ liệu buổi này đã tồn tại và cho phép cập nhật, không tạo bản ghi rác trùng lặp.

- **KẾT QUẢ ĐÁNH GIÁ CUỐI CÙNG:** 
- **GHI CHÚ / GÓP Ý CẢI TIẾN THÊM TỪ NGƯỜI DÙNG:**
- **XÁC NHẬN NGHIỆM THU:**
  - Đại diện Giáo viên Chủ nhiệm: 
  - Đại diện Nhóm Phát Triển: 

---

### UAT03_GVCN_03 : NGHIỆM THU QUẢN LÝ THEO DÕI THU NỘP BHYT & HỌC PHÍ (TÍCH CHỌN 1-CHẠM KÈM NGÀY NỘP) VÀ PHÁT THÔNG BÁO ĐÔN ĐỐC PHỤ HUYNH

- **VAI TRÒ NGHIỆM THU:** Giáo viên chủ nhiệm (GVCN).
- **MÔI TRƯỜNG THỰC TẾ:** Trình duyệt Web trên Laptop hoặc Tablet của GVCN.
- **BỐI CẢNH NGHIỆP VỤ THỰC TẾ:**
  Nhà trường thông báo thời hạn hoàn thành nộp tiền Bảo hiểm Y tế (BHYT) học sinh đợt 1. Phụ huynh nộp tiền mặt hoặc chuyển khoản trực tiếp cho GVCN tại trường (hệ thống không tích hợp cổng thanh toán trực tuyến). GVCN mở bảng theo dõi trên phần mềm, tích chọn xác nhận đã nộp cho các học sinh vừa hoàn thành (hệ thống tự động ghi nhận ngày nộp hôm nay), sau đó lọc danh sách 5 học sinh còn lại chưa nộp để bấm nút phát thông báo đôn đốc nhắc nhở phụ huynh.
- **DỮ LIỆU CHUẨN BỊ:**
  - Danh sách theo dõi thu phí lớp `6A2` trong collection `/fees_and_insurance`.
  - Học sinh hoàn thành: Em Phạm Mai Chi nộp tiền mặt 850.000 VNĐ.
  - 5 học sinh còn lại chưa nộp BHYT (trong đó có phụ huynh em Lê Minh Khang).

- **CÁC BƯỚC THAO TÁC THỰC HIỆN CỦA GIÁO VIÊN:**
  1. **Bước 1 (Mở giao diện Thu phí & BHYT):**
     - GVCN truy cập vào lớp `6A2`, mở tab **"Quản lý Thu phí & BHYT"**.
     - Bảng danh sách học sinh hiển thị trực quan với 2 cột checkbox: `Học phí` và `Bảo hiểm Y tế`.
  2. **Bước 2 (Tích chọn xác nhận nộp BHYT):**
     - Tìm học sinh `Phạm Mai Chi`.
     - Tích chọn vào ô checkbox tại cột **Bảo hiểm Y tế**.
     - Quan sát hệ thống: Ô checkbox chuyển thành màu xanh lá cây kèm nhãn hiển thị ngày nộp tự động `05/10/2026`.
     - GVCN thử nhấp vào ngày nộp để điều chỉnh lùi lại ngày thực tế nếu phụ huynh đã nộp hôm qua $\rightarrow$ Lưu thành công.
  3. **Bước 3 (Lọc danh sách chưa hoàn thành):**
     - Bấm vào bộ lọc nhanh phía trên bảng: Chọn **"Chưa nộp BHYT"**.
     - Danh sách thu gọn lại chỉ còn đúng 5 học sinh chưa hoàn thành nộp phí.
  4. **Bước 4 (Phát thông báo nhắc nhở qua FCM):**
     - Bấm nút **"Gửi nhắc nhở BHYT tới Phụ huynh"**.
     - Một pop-up xác nhận xuất hiện: *"Bạn có chắc chắn muốn gửi thông báo nhắc nộp BHYT tới 5 phụ huynh chưa hoàn thành?"*.
     - Bấm **"Xác nhận gửi"**.

- **TIÊU CHÍ CHẤP NHẬN ĐẠT CHUẨN (ACCEPTANCE CRITERIA):**
  - [ ] **Thao tác đơn giản 1-chạm:** Tích chọn checkbox cập nhật ngay trạng thái `is_paid_insurance = true` và `insurance_paid_date` trong Firestore mà không cần nhấn thêm nút lưu rườm rà.
  - [ ] **Minh bạch thông tin ngày nộp:** Hiển thị rõ ràng ngày nộp cụ thể giúp giáo viên đối soát sổ sách kế toán dễ dàng.
  - [ ] **Gửi đúng đối tượng:** Thông báo FCM chỉ phát tới phụ huynh của 5 học sinh chưa nộp, phụ huynh của học sinh Mai Chi và các em đã nộp không bị nhận tin nhắc nhở.
  - [ ] **Tốc độ gửi thông báo:** Toàn bộ 5 phụ huynh nhận được thông báo đẩy trên điện thoại trong vòng **dưới 3 giây**.

- **KẾT QUẢ ĐÁNH GIÁ CUỐI CÙNG:** 
- **GHI CHÚ / GÓP Ý CẢI TIẾN THÊM TỪ NGƯỜI DÙNG:**
- **XÁC NHẬN NGHIỆM THU:**
  - Đại diện Giáo viên Chủ nhiệm: 
  - Đại diện Nhóm Phát Triển: 

---

### UAT04_GVCN_04 : NGHIỆM THU TÍNH NĂNG NHẬP LỜI NHẬN XÉT HỌC SINH NGẮN GỌN (TEXT THUẦN TÚY) GỬI TỨC THỜI TỚI SỔ LIÊN LẠC VÀ THEO DÕI XÁC NHẬN ĐÃ ĐỌC

- **VAI TRÒ NGHIỆM THU:** Giáo viên chủ nhiệm (GVCN) hoặc Giáo viên bộ môn (GVBM).
- **MÔI TRƯỜNG THỰC TẾ:** Mobile App React Native trên điện thoại Android của giáo viên và iPhone của phụ huynh.
- **BỐI CẢNH NGHIỆP VỤ THỰC TẾ:**
  Trong tiết học, em Lê Minh Triết có tiến bộ vượt bậc, hăng hái xung phong phát biểu giải bài toán khó và hỗ trợ bạn cùng bàn. Giáo viên muốn gửi ngay một lời nhận xét ngắn gọn, chân tình về ứng dụng sổ liên lạc của bố mẹ em để gia đình cùng chung vui, động viên con. Giáo viên không muốn sử dụng các thẻ nhãn (tags) gò bó mà muốn gõ đoạn văn bản tự nhiên.
- **DỮ LIỆU CHUẨN BỊ:**
  - Học sinh: Lê Minh Triết (`stu_triet_03`).
  - Nội dung nhận xét: *"Hôm nay Minh Triết rất tích cực giơ tay xây dựng bài Toán và giúp đỡ bạn cùng bàn. Cô khen ngợi tinh thần học tập của con!"* (Độ dài: 112 ký tự).
  - Tài khoản phụ huynh em Triết trên điện thoại iPhone.

- **CÁC BƯỚC THAO TÁC THỰC HIỆN CỦA GIÁO VIÊN & PHỤ HUYNH:**
  1. **Bước 1 (Giáo viên nhập nhận xét trên App):**
     - Giáo viên mở app, vào lớp `6A2`, chọn học sinh Lê Minh Triết.
     - Chọn mục **"Nhận xét học sinh"** $\rightarrow$ bấm **"Viết nhận xét mới"**.
     - Nhập nội dung văn bản ngắn vào khung soạn thảo.
     - Bấm nút **"Gửi nhận xét tới Phụ huynh"**.
  2. **Bước 2 (Kiểm tra phía Phụ huynh nhận thông báo):**
     - Điện thoại phụ huynh em Triết nhận được Push Notification kèm âm thanh thông báo.
     - Phụ huynh chạm vào thông báo: Ứng dụng mở thẳng vào mục Sổ liên lạc $\rightarrow$ Tab "Nhận xét của giáo viên".
     - Đọc trọn vẹn đoạn văn bản nhận xét của cô giáo hiển thị kèm mốc thời gian gửi rõ ràng.
  3. **Bước 3 (Phụ huynh bấm xác nhận đã đọc):**
     - Dưới chân lời nhận xét có nút **"Xác nhận đã đọc"**. Phụ huynh bấm vào nút này.
     - Nút chuyển thành trạng thái **"Đã xem lúc [Giờ:Phút]"** kèm dấu tích xanh.
  4. **Bước 4 (Giáo viên kiểm tra trạng thái phản hồi):**
     - Giáo viên tải lại màn hình nhận xét trên điện thoại: Nhìn thấy biểu tượng mắt đọc màu xanh hiển thị *"Phụ huynh đã đọc"*.

- **TIÊU CHÍ CHẤP NHẬN ĐẠT CHUẨN (ACCEPTANCE CRITERIA):**
  - [ ] **Trực quan & Thuần túy Text:** Soạn thảo văn bản tự do, hỗ trợ đầy đủ tiếng Việt có dấu, không sử dụng hệ thống tags rườm rà.
  - [ ] **Thời gian nhận thông báo:** Điện thoại phụ huynh nhận thông báo đẩy trong vòng **dưới 2 giây**.
  - [ ] **Xác nhận 2 chiều:** Cơ chế xác nhận "Đã đọc" hoạt động tức thì, cập nhật cờ `is_acknowledged = true` vào document `/remarks` trong Firestore.

- **KẾT QUẢ ĐÁNH GIÁ CUỐI CÙNG:** 
- **GHI CHÚ / GÓP Ý CẢI TIẾN THÊM TỪ NGƯỜI DÙNG:**
- **XÁC NHẬN NGHIỆM THU:**
  - Đại diện Giáo viên: 
  - Đại diện Phụ huynh: 
  - Đại diện Nhóm Phát Triển: 

---

### UAT05_GVBM_01 : NGHIỆM THU TÍNH NĂNG TẢI LÊN GIÁO ÁN (DOCX/PDF) ĐỂ TRỢ GIẢNG AI GEMINI TỰ ĐỘNG SINH CÂU HỎI TRẮC NGHIỆM KIỂM TRA BÀI CŨ THEO ĐỘ KHÓ VÀ SỐ LƯỢNG TÙY CHỌN

- **VAI TRÒ NGHIỆM THU:** Giáo viên bộ môn (GVBM) Khoa học tự nhiên / Toán học.
- **MÔI TRƯỜNG THỰC TẾ:** Laptop của giáo viên kết nối mạng Internet trường học, mở trình duyệt Web Next.js.
- **BỐI CẢNH NGHIỆP VỤ THỰC TẾ:**
  Để chuẩn bị 5 phút khởi động kiểm tra bài cũ đầu tiết học môn Khoa học tự nhiên 6, cô giáo không muốn mất thời gian tự ngồi gõ từng câu hỏi trắc nghiệm. Cô giáo tải tệp giáo án bài giảng Word (`.docx`) đã soạn sẵn lên hệ thống GiaoVienHay, chọn yêu cầu sinh 5 câu hỏi trắc nghiệm với độ khó "Vừa". Trợ giảng AI tích hợp Google Gemini API sẽ tự động đọc hiểu giáo án và sinh ra bộ 5 câu hỏi trắc nghiệm kèm 4 phương án A, B, C, D, đáp án đúng và phần giải thích quy tắc sư phạm để cô giáo duyệt.
- **DỮ LIỆU CHUẨN BỊ:**
  - Tệp giáo án: `Bai17_TeBao_DonViCoBan.docx` (Dung lượng 1.8MB, nội dung về cấu tạo tế bào nhân sơ và nhân thực).
  - Cấu hình tùy chọn:
    - Số lượng câu hỏi: `5 câu`.
    - Độ khó: `Vừa (MEDIUM)`.
    - Loại câu hỏi: Trắc nghiệm 4 lựa chọn (A, B, C, D).

- **CÁC BƯỚC THAO TÁC THỰC HIỆN CỦA GIÁO VIÊN:**
  1. **Bước 1 (Tải giáo án lên hệ thống):**
     - Đăng nhập tài khoản GVBM, mở lớp `6A2`, vào mục **"Trợ giảng AI / Tạo bài kiểm tra bài cũ"**.
     - Kéo thả tệp `Bai17_TeBao_DonViCoBan.docx` vào vùng tải lên tài liệu.
     - Thanh tiến trình tải file đạt 100%, hệ thống xác nhận tệp hợp lệ.
  2. **Bước 2 (Cấu hình thông số tạo đề):**
     - Tại mục "Số lượng câu hỏi", chọn `5 câu`.
     - Tại mục "Độ khó", chọn `Vừa (MEDIUM)`.
     - Bấm nút **"Bắt đầu sinh câu hỏi bằng AI"**.
  3. **Bước 3 (Quan sát tiến trình AI xử lý):**
     - Màn hình hiển thị animation xử lý: *"AI Gemini đang đọc hiểu giáo án và soạn câu hỏi..."*.
     - Bấm đồng hồ bấm giờ đếm thời gian từ lúc ấn nút đến khi kết quả xuất hiện.
  4. **Bước 4 (Duyệt và kiểm tra chất lượng câu hỏi):**
     - Màn hình hiển thị danh sách 5 câu hỏi trắc nghiệm vừa được tạo.
     - Giáo viên đọc kiểm tra: Câu hỏi có đúng nội dung bài 17 hay không? 4 đáp án A, B, C, D có hợp lý không? Đáp án đúng có bị sai lệch không?
     - Giáo viên thử bấm vào nút "Chỉnh sửa" tại câu số 3 để sửa lại 1 từ trong phương án B $\rightarrow$ Bấm "Lưu chỉnh sửa".
     - Bấm nút **"Lưu bộ câu hỏi vào kho đề"**.

- **TIÊU CHÍ CHẤP NHẬN ĐẠT CHUẨN (ACCEPTANCE CRITERIA):**
  - [ ] **Thời gian xử lý của AI:** Google Gemini API trích xuất và sinh hoàn chỉnh 5 câu hỏi trắc nghiệm trong vòng **dưới 11 giây**.
  - [ ] **Chất lượng kiến thức sư phạm:** Nội dung câu hỏi bám sát 100% giáo án bài học môn KHTN lớp 6, câu từ trong sáng chuẩn mực, không có hiện tượng ảo giác (hallucination).
  - [ ] **Độ chính xác đáp án:** Mỗi câu hỏi có duy nhất 1 đáp án đúng rõ ràng kèm phần giải thích ngắn gọn, xúc tích.
  - [ ] **Khả năng biên tập linh hoạt:** Cho phép giáo viên chỉnh sửa câu chữ, thay đổi đáp án đúng và lưu cập nhật tức thời vào Firestore.

- **KẾT QUẢ ĐÁNH GIÁ CUỐI CÙNG:** 
- **GHI CHÚ / GÓP Ý CẢI TIẾN THÊM TỪ NGƯỜI DÙNG:**
- **XÁC NHẬN NGHIỆM THU:**
  - Đại diện Giáo viên Bộ môn: 
  - Đại diện Nhóm Phát Triển: 

---

### UAT06_GVBM_02 : NGHIỆM THU GIAO DIỆN VÒNG QUAY MAY MẮN (LUCKY WHEEL) TỰ ĐỘNG LỌC HỌC SINH CÓ MẶT, NÚT BỎ QUA (SKIP) KHI VẮNG VÀ CHẤM ĐIỂM MIỆNG TRỰC TIẾP VÀO SỔ ĐIỂM

- **VAI TRÒ NGHIỆM THU:** Giáo viên bộ môn (GVBM) hoặc Giáo viên chủ nhiệm (GVCN).
- **MÔI TRƯỜNG THỰC TẾ:** Trình duyệt Web của giáo viên kết nối trực tiếp với Máy chiếu / Màn hình TV lớn trên bục giảng lớp học.
- **BỐI CẢNH NGHIỆP VỤ THỰC TẾ:**
  Đầu tiết học Toán, thầy giáo mở Vòng quay may mắn chiếu lên màn hình lớn trước lớp để bốc ngẫu nhiên học sinh lên bảng kiểm tra bài cũ. Hệ thống phải tự động loại trừ học sinh đã được điểm danh vắng mặt đầu ngày. Trong trường hợp vòng quay trúng một bạn đột xuất xin xuống phòng y tế (vắng mặt tại chỗ), thầy giáo bấm nút "Bỏ qua (Skip)" để vòng quay lập tức quay tiếp chọn bạn khác mà không bị đứng hình. Học sinh được chọn lên bảng trả lời đúng câu hỏi số 1, thầy chấm điểm 9 và điểm lập tức ghi nhận vào sổ điểm môn Toán.
- **DỮ LIỆU CHUẨN BỊ:**
  - Sĩ số lớp 35 học sinh, trong đó 2 học sinh vắng đã được GVCN điểm danh sáng nay.
  - Vòng quay may mắn nạp danh sách 33 học sinh có mặt hôm nay.
  - Câu hỏi bài cũ số 1 từ bộ đề vừa tạo.
  - Điểm số chấm: 9.0 điểm vào cột Điểm miệng (`ORAL_TEST`).

- **CÁC BƯỚC THAO TÁC THỰC HIỆN CỦA GIÁO VIÊN:**
  1. **Bước 1 (Khởi chạy Vòng quay may mắn):**
     - Mở bộ câu hỏi bài cũ, chọn chế độ **"Vòng quay may mắn (Lucky Wheel)"**.
     - Bấm nút chuyển sang **"Toàn màn hình (Full-screen)"** để hiển thị trọn vẹn trên máy chiếu.
     - Kiểm tra danh sách học sinh trên nan quạt vòng quay: Đảm bảo không có tên của 2 học sinh đã nghỉ học sáng nay.
  2. **Bước 2 (Quay số chọn học sinh lượt 1):**
     - Thầy giáo bấm nút **"Quay số"**. Vòng quay chuyển động tít với hiệu ứng âm thanh tạch-tạch hồi hộp, kim chỉ dừng lại ở tên em `Đỗ Tuấn Hưng`.
  3. **Bước 3 (Thao tác nút Bỏ qua - Skip):**
     - Giả định em Hưng xin phép xuống phòng y tế lúc đầu giờ nên không thể lên bảng.
     - Thầy giáo bấm ngay nút **"Bỏ qua (Skip)"**.
     - Quan sát phản hồi: Hệ thống bỏ qua em Hưng và tự động kích hoạt vòng quay mới ngay lập tức mà không cần bấm thêm nút nào khác.
  4. **Bước 4 (Chấm điểm trực tiếp tại lớp):**
     - Vòng quay dừng lại ở tên em `Nguyễn Thùy Linh`. Thùy Linh lên bảng trả lời câu hỏi trắc nghiệm số 1 và giải thích chính xác.
     - Thầy giáo nhập điểm `9.0` vào pop-up chấm điểm nhanh và bấm **"Lưu điểm"**.
  5. **Bước 5 (Kiểm tra đồng bộ Sổ điểm):**
     - Mở tab Sổ điểm môn Toán của lớp `6A2`: Kiểm tra cột "Điểm miệng" của em Thùy Linh xem đã xuất hiện điểm 9.0 chưa.

- **TIÊU CHÍ CHẤP NHẬN ĐẠT CHUẨN (ACCEPTANCE CRITERIA):**
  - [ ] **Lọc danh sách chuyên cần chuẩn:** Tự động lấy danh sách học sinh trạng thái `PRESENT` từ `/attendances` của ngày hôm nay, tuyệt đối không đưa học sinh vắng mặt vào vòng quay.
  - [ ] **Hiệu ứng đồ họa & Âm thanh:** Vòng quay quay mượt mà ở tần số 60 FPS, âm thanh sống động, kim chỉ dừng dứt khoát tạo không khí hào hứng cho học sinh.
  - [ ] **Nút Bỏ qua (Skip) nhạy bén:** Bấm "Skip" là vòng quay chuyển động tiếp ngay lập tức, không bị đơ, treo hay crash ứng dụng.
  - [ ] **Đồng bộ Sổ điểm tức thì:** Điểm số 9.0 được lưu đồng thời vào `/quiz_results` và ghi nhận thẳng vào cột điểm miệng trong `/scores` của môn học mà thầy giáo không cần phải mở sổ điểm gõ lại.

- **KẾT QUẢ ĐÁNH GIÁ CUỐI CÙNG:** 
- **GHI CHÚ / GÓP Ý CẢI TIẾN THÊM TỪ NGƯỜI DÙNG:**
- **XÁC NHẬN NGHIỆM THU:**
  - Đại diện Giáo viên Bộ môn: 
  - Đại diện Nhóm Phát Triển: 

---

### UAT07_GVBM_03 : NGHIỆM THU TÍNH NĂNG CHUYỂN ĐỔI BỘ CÂU HỎI AI THÀNH MINI-GAME LỚP HỌC (RUNG CHUÔNG VÀNG / ĐUA XE / HỘP QUÀ) TRÌNH CHIẾU TƯƠNG TÁC TOÀN MÀN HÌNH

- **VAI TRÒ NGHIỆM THU:** Giáo viên bộ môn (GVBM) hoặc Giáo viên chủ nhiệm (GVCN).
- **MÔI TRƯỜNG THỰC TẾ:** Máy tính giáo viên kết nối Màn hình tương tác thông minh / Máy chiếu lớp học.
- **BỐI CẢNH NGHIỆP VỤ THỰC TẾ:**
  Vào tiết học buổi chiều khi học sinh có biểu hiện uể oải, giáo viên không muốn chiếu slide câu hỏi thông thường. Giáo viên bấm nút "Biến thành Trò chơi (Gamify)" để nạp 5 câu hỏi AI vào chế độ **Rung Chuông Vàng**. Giáo viên bật chế độ toàn màn hình để học sinh toàn lớp cùng tham gia giơ bảng chọn đáp án A, B, C hoặc D. Khi hết giờ đếm ngược, giáo viên mở đáp án, hệ thống phát hiệu ứng pháo hoa và âm thanh reo hò rộn rã.
- **DỮ LIỆU CHUẨN BỊ:**
  - Bộ 5 câu hỏi trắc nghiệm kiểm tra bài cũ đã được duyệt.
  - Chế độ game lựa chọn: **Rung chuông vàng (GOLDEN_BELL)**.
  - Thời gian đếm ngược quy định: 30 giây/câu.

- **CÁC BƯỚC THAO TÁC THỰC HIỆN CỦA GIÁO VIÊN:**
  1. **Bước 1 (Chọn chế độ Mini-Game):**
     - Tại màn hình bộ câu hỏi, bấm nút nổi bật **"Biến thành Trò chơi (Gamify)"**.
     - Xuất hiện màn hình chọn 3 chế độ game: `Rung Chuông Vàng`, `Đua Xe Vượt Chướng Ngại Vật`, `Mở Hộp Quà Bí Mật`.
     - Giáo viên nhấp chọn biểu tượng **"Rung Chuông Vàng"** và bấm **"Bắt đầu trò chơi"**.
  2. **Bước 2 (Trình chiếu toàn màn hình):**
     - Giao diện chuyển sang màn hình chờ của trò chơi với nhạc nền sôi động.
     - Giáo viên bấm nút biểu tượng Fullscreen để mở rộng toàn bộ màn hình chiếu.
     - Bấm nút **"Bắt đầu Câu 1"**.
  3. **Bước 3 (Vận hành câu hỏi & Đếm ngược thời gian):**
     - Nội dung câu hỏi và 4 ô đáp án A, B, C, D hiển thị to rõ trên bảng lớp.
     - Đồng hồ cát đếm ngược 30 giây bắt đầu chạy kèm tiếng tích-tắc dồn dập.
     - Học sinh dưới lớp suy nghĩ và đồng loạt giơ bảng con ghi đáp án.
  4. **Bước 4 (Công bố đáp án đúng & Hiệu ứng khen thưởng):**
     - Hết 30 giây, tiếng chuông "Keng keng keng" vang lên báo hiệu hết giờ giơ bảng.
     - Giáo viên chạm vào màn hình hoặc bấm phím cách (Space) để mở đáp án đúng.
     - Ô đáp án đúng (ví dụ: Đáp án B) phát sáng viền vàng rực rỡ, kèm hiệu ứng pháo hoa giấy (confetti) bắn tung tóe trên màn hình và âm thanh vỗ tay tán thưởng vang dội.
     - Bấm nút mũi tên chuyển sang câu tiếp theo.

- **TIÊU CHÍ CHẤP NHẬN ĐẠT CHUẨN (ACCEPTANCE CRITERIA):**
  - [ ] **Chuyển đổi 1-chạm:** Biến bộ câu hỏi thành game hoàn tất ngay lập tức trong **dưới 1 giây** mà không cần cấu hình phức tạp.
  - [ ] **Đồ họa bắt mắt:** Giao diện thiết kế theo phong cách hiện đại, màu sắc tươi sáng, chữ to rõ ràng học sinh ngồi cuối lớp vẫn nhìn thấy rõ.
  - [ ] **Đồng hồ đếm ngược chuẩn xác:** Đồng hồ chạy chính xác từng giây, phát âm thanh cảnh báo khi còn 5 giây cuối cùng.
  - [ ] **Hiệu ứng kích thích học tập:** Hiệu ứng pháo hoa và âm thanh reo hò sống động, tạo bầu không khí học tập vô cùng hào hứng, giúp học sinh tiếp thu kiến thức một cách tự nhiên.

- **KẾT QUẢ ĐÁNH GIÁ CUỐI CÙNG:** 
- **GHI CHÚ / GÓP Ý CẢI TIẾN THÊM TỪ NGƯỜI DÙNG:**
- **XÁC NHẬN NGHIỆM THU:**
  - Đại diện Giáo viên Bộ môn: 
  - Đại diện Nhóm Phát Triển: 

---

### UAT08_GVBM_04 : NGHIỆM THU TÍNH NĂNG NHẬP SỔ ĐIỂM ĐA CỘT THÀNH PHẦN MÔN HỌC (KHÔNG TÍNH GPA), TRÌNH CHIẾU BẢNG XẾP HẠNG (LEADERBOARD) VINH DANH ĐIỂM CAO VÀ CÔNG BỐ ĐIỂM GỬI FCM TỚI PHỤ HUYNH

- **VAI TRÒ NGHIỆM THU:** Giáo viên bộ môn (GVBM).
- **MÔI TRƯỜNG THỰC TẾ:** Trình duyệt Web Next.js trên máy tính của giáo viên kết nối máy chiếu lớp học.
- **BỐI CẢNH NGHIỆP VỤ THỰC TẾ:**
  Sau khi chấm xong bài kiểm tra 15 phút môn Toán học kỳ 1 của lớp `6A2`, thầy giáo mở Sổ điểm điện tử để nhập điểm cho 35 học sinh theo thang điểm 10 (bước nhảy 0.1). Hệ thống lưu trữ trung thực các cột điểm thành phần và không tự ý tính điểm trung bình (GPA). Sau khi nhập xong, thầy bật chức năng "Trình chiếu Bảng Xếp Hạng Điểm Môn Học" lên màn hình lớp để vinh danh Top 3 bạn điểm 10 với huy hiệu hoa điểm mười. Cuối cùng, thầy bấm nút "Công bố điểm môn học" để gửi thông báo tức thì đến ứng dụng phụ huynh của cả lớp.
- **DỮ LIỆU CHUẨN BỊ:**
  - Lớp: `6A2`, Môn học: `Toán học`, Học kỳ: `Học kỳ 1`.
  - Cột điểm thành phần: `Kiểm tra 15 phút (TEST_15P)`.
  - Bảng điểm 35 học sinh (trong đó có 3 em đạt điểm 10.0: Em An, Em Bình, Em Chi).

- **CÁC BƯỚC THAO TÁC THỰC HIỆN CỦA GIÁO VIÊN:**
  1. **Bước 1 (Mở Sổ điểm & Nhập điểm thành phần):**
     - Mở mục **"Sổ điểm điện tử"**, chọn Lớp `6A2`, Môn `Toán học`, Học kỳ `1`.
     - Chọn cột điểm **"Kiểm tra 15 phút (TEST_15P)"**.
     - Bảng danh sách học sinh hiện ra: Thầy giáo sử dụng phím `Enter` hoặc mũi tên xuống để nhập nhanh điểm số cho từng em (ví dụ: 10, 9.5, 8.0, 7.5...).
     - Bấm nút **"Lưu bảng điểm"**.
  2. **Bước 2 (Trình chiếu Bảng xếp hạng - Leaderboard môn học):**
     - Nhấn nút **"Trình chiếu Bảng Xếp Hạng Môn Học"**.
     - Màn hình Next.js chuyển sang chế độ Fullscreen hiển thị giao diện **Leaderboard Điểm Môn Toán**:
       - Vị trí bục vinh danh hiển thị Top 1, Top 2, Top 3 kèm hiệu ứng cúp vàng, vương miện và vòng hoa điểm mười cho 3 bạn đạt điểm 10.
       - Biểu đồ phổ điểm hiển thị trực quan tỷ lệ Giỏi, Khá, Trung bình của cả lớp.
  3. **Bước 3 (Công bố điểm gửi phụ huynh):**
     - Thầy giáo thoát chế độ chiếu, bấm nút **"Công bố điểm kiểm tra 15 phút"**.
     - Xuất hiện cảnh báo xác nhận gửi thông báo cho phụ huynh. Thầy bấm **"Xác nhận công bố"**.
  4. **Bước 4 (Kiểm tra thông báo phía phụ huynh):**
     - Kiểm tra điện thoại phụ huynh: Xuất hiện thông báo đẩy FCM *"Điểm mới môn Toán: Em Nguyễn Hoàng Long đạt 9.5 điểm trong bài kiểm tra 15 phút ngày 05/10/2026."*

- **TIÊU CHÍ CHẤP NHẬN ĐẠT CHUẨN (ACCEPTANCE CRITERIA):**
  - [ ] **Thao tác nhập điểm siêu tốc:** Hỗ trợ phím tắt điều hướng nhanh nhẹn, kiểm tra tính hợp lệ dữ liệu (từ 0.0 đến 10.0, bước nhảy 0.1), báo đỏ nếu nhập sai ngoài khoảng.
  - [ ] **Không tự ý tính GPA:** Hệ thống lưu đúng các đầu điểm thành phần vào `/scores`, tuyệt đối không tự động sinh cột GPA môn làm sai lệch quy định học bạ.
  - [ ] **Giao diện Leaderboard tôn vinh học tập:** Thiết kế bảng vinh danh trang trọng, hiệu ứng chúc mừng hoa điểm mười truyền cảm hứng thi đua học tốt.
  - [ ] **Công bố điểm có kiểm soát:** Chỉ khi giáo viên ấn "Công bố điểm" thì phụ huynh mới nhận được thông báo và xem được điểm trên app, tránh việc lộ điểm khi đang nhập dở dang.

- **KẾT QUẢ ĐÁNH GIÁ CUỐI CÙNG:** 
- **GHI CHÚ / GÓP Ý CẢI TIẾN THÊM TỪ NGƯỜI DÙNG:**
- **XÁC NHẬN NGHIỆM THU:**
  - Đại diện Giáo viên Bộ môn: 
  - Đại diện Phụ huynh Học sinh: 
  - Đại diện Nhóm Phát Triển: 

---

### UAT09_GVBM_05 : NGHIỆM THU TÍNH NĂNG TẠO LỜI NHẮC LỊCH KIỂM TRA SẮP TỚI KÈM DẶN DÒ ÔN TẬP GỬI THÔNG BÁO ĐẨY ĐỒNG LOẠT (BROADCAST) TỚI TOÀN BỘ PHỤ HUYNH TRONG LỚP

- **VAI TRÒ NGHIỆM THU:** Giáo viên bộ môn (GVBM) hoặc Giáo viên chủ nhiệm (GVCN).
- **MÔI TRƯỜNG THỰC TẾ:** Web Next.js hoặc Mobile App của giáo viên.
- **BỐI CẢNH NGHIỆP VỤ THỰC TẾ:**
  Còn 2 ngày nữa là đến bài kiểm tra định kỳ 1 tiết môn Lịch sử - Địa lý. Để học sinh không bị quên bài và phụ huynh có thể chủ động sắp xếp thời gian đôn đốc con ôn luyện tại nhà, cô giáo tạo một thông báo lời nhắc lịch kiểm tra trên hệ thống, nêu rõ môn học, ngày kiểm tra và những nội dung trọng tâm cần học thuộc. Toàn thể phụ huynh lớp `6A2` sẽ nhận được thông báo đẩy trên điện thoại.
- **DỮ LIỆU CHUẨN BỊ:**
  - Lớp: `6A2`.
  - Môn học: `Lịch sử & Địa lý`.
  - Loại bài kiểm tra: `Kiểm tra 1 tiết định kỳ (TEST_1P)`.
  - Ngày diễn ra kiểm tra: `08/10/2026`.
  - Lời dặn dò trọng tâm: *"Thứ Năm ngày 08/10 lớp có bài kiểm tra 1 tiết Lịch sử. Các con nhớ ôn kỹ phần lược đồ tự nhiên châu Á và các mốc thời gian bài 4, chuẩn bị bút chì và thước kẻ."*

- **CÁC BƯỚC THAO TÁC THỰC HIỆN CỦA GIÁO VIÊN:**
  1. **Bước 1 (Mở chức năng Tạo lời nhắc kiểm tra):**
     - Đăng nhập vào hệ thống, chọn lớp `6A2`, vào mục **"Lời nhắc lịch kiểm tra"**.
     - Bấm nút **"Tạo lời nhắc mới"**.
  2. **Bước 2 (Thiết lập thông tin bài kiểm tra):**
     - Chọn Môn học: `Lịch sử & Địa lý`.
     - Chọn Loại kiểm tra: `Kiểm tra 1 tiết (45 phút)`.
     - Chọn Ngày kiểm tra: `08/10/2026`.
     - Nhập nội dung dặn dò ôn thi vào khung văn bản.
  3. **Bước 3 (Gửi phát thông báo):**
     - Kiểm tra lại nội dung, bấm nút **"Gửi lời nhắc tới toàn thể Phụ huynh"**.
     - Hệ thống thông báo gửi thành công và hiển thị bản ghi trong lịch sử lời nhắc.
  4. **Bước 4 (Kiểm tra tiếp nhận của phụ huynh):**
     - Quan sát điện thoại của phụ huynh: Thông báo FCM hiển thị trên thanh trạng thái với tiêu đề *"Lịch kiểm tra sắp tới: Môn Lịch sử & Địa lý"*.

- **TIÊU CHÍ CHẤP NHẬN ĐẠT CHUẨN (ACCEPTANCE CRITERIA):**
  - [ ] **Lưu trữ dữ liệu chuẩn:** Bản ghi được tạo trong collection `/exam_reminders` với đầy đủ thông tin môn, ngày thi và dặn dò.
  - [ ] **Gửi broadcast đồng loạt:** Kích hoạt FCM multicast phát thành công đến 100% thiết bị phụ huynh của lớp có tài khoản liên kết trong **dưới 3 giây**.
  - [ ] **Nội dung rõ ràng:** Phụ huynh chạm vào thông báo mở app xem được chi tiết trọn vẹn lời dặn dò của cô giáo để tối về nhắc con học bài.

- **KẾT QUẢ ĐÁNH GIÁ CUỐI CÙNG:** 
- **GHI CHÚ / GÓP Ý CẢI TIẾN THÊM TỪ NGƯỜI DÙNG:**
- **XÁC NHẬN NGHIỆM THU:**
  - Đại diện Giáo viên: 
  - Đại diện Phụ huynh: 
  - Đại diện Nhóm Phát Triển: 

---

### UAT10_PHHS_01 : NGHIỆM THU QUY TRÌNH PHỤ HUYNH THAM GIA LỚP HỌC QUA LINK MỜI / MÃ QR VÀ XÁC NHẬN LIÊN KẾT CON EM MÌNH

- **VAI TRÒ NGHIỆM THU:** Phụ huynh học sinh (Parent).
- **MÔI TRƯỜNG THỰC TẾ:** Điện thoại thông minh iPhone hoặc Android của phụ huynh kết nối 4G/Wi-Fi.
- **BỐI CẢNH NGHIỆP VỤ THỰC TẾ:**
  Chị Lê Thị Mai là phụ huynh của em Nguyễn Hoàng Long lớp `6A2`. Chị Mai nhận được link mời và hình ảnh mã QR do thầy chủ nhiệm gửi vào nhóm Zalo lớp. Chị nhấp vào liên kết trên Zalo, tiến hành đăng nhập ứng dụng bằng số điện thoại qua mã OTP gửi về máy, sau đó tìm đúng tên con trai mình trong danh sách lớp và bấm xác nhận để kết nối vào sổ liên lạc điện tử.
- **DỮ LIỆU CHUẨN BỊ:**
  - Đường dẫn mời: `https://giaovienhay.edu.vn/join?code=LH6A2X` (kèm mã QR).
  - Số điện thoại phụ huynh: `0987xxxxxx` nhận mã SMS OTP.
  - Học sinh liên kết: Nguyễn Hoàng Long (`stu_long_01`), lớp `6A2`.

- **CÁC BƯỚC THAO TÁC THỰC HIỆN CỦA PHỤ HUYNH:**
  1. **Bước 1 (Nhấp link mời hoặc quét mã QR):**
     - Chị Mai mở Zalo trên điện thoại, bấm vào đường dẫn mời tham gia lớp học.
     - Ứng dụng GiaoVienHay mở ra với màn hình chào mừng: *"Tham gia lớp 6A2 - GVCN: Thầy Nguyễn Văn An"*.
  2. **Bước 2 (Đăng nhập xác thực bằng OTP):**
     - Nhập Số điện thoại của chị Mai, bấm **"Nhận mã xác thực"**.
     - Nhận mã OTP 6 chữ số qua tin nhắn SMS trong vòng 5 giây, nhập mã vào ứng dụng.
  3. **Bước 3 (Tìm và chọn con em mình):**
     - Màn hình hiển thị danh sách học sinh của lớp `6A2` xếp theo thứ tự bảng chữ cái.
     - Chị Mai gõ tên `Hoàng Long` vào thanh tìm kiếm.
     - Kết quả hiển thị em **Nguyễn Hoàng Long (Ngày sinh: 15/04/2014)**.
     - Chị Mai tích chọn vào tên con và bấm **"Xác nhận kết nối con em"**.
  4. **Bước 4 (Truy cập Sổ liên lạc):**
     - Ứng dụng hiển thị thông báo: *"Kết nối thành công! Chào mừng phụ huynh em Nguyễn Hoàng Long."*
     - Màn hình tự động chuyển vào trang chủ Sổ liên lạc điện tử của con.

- **TIÊU CHÍ CHẤP NHẬN ĐẠT CHUẨN (ACCEPTANCE CRITERIA):**
  - [ ] **Quy trình đơn giản, bảo mật:** Đăng nhập OTP trơn tru, không bắt phụ huynh phải nhớ mật khẩu phức tạp.
  - [ ] **Tìm kiếm học sinh nhanh:** Tìm kiếm tức thì trong danh sách 35 học sinh, hiển thị rõ ràng ngày sinh để tránh nhầm lẫn học sinh trùng tên.
  - [ ] **Cập nhật liên kết chính xác:** Ghi nhận UID của phụ huynh vào mảng `parent_uids` của học sinh trong `/students` và gán `class_id` vào thông tin tài khoản phụ huynh trong `/users`.

- **KẾT QUẢ ĐÁNH GIÁ CUỐI CÙNG:** 
- **GHI CHÚ / GÓP Ý CẢI TIẾN THÊM TỪ NGƯỜI DÙNG:**
- **XÁC NHẬN NGHIỆM THU:**
  - Đại diện Phụ huynh Học sinh: 
  - Đại diện Nhóm Phát Triển: 

---

### UAT11_PHHS_02 : NGHIỆM THU TÍNH KỊP THỜI CỦA THÔNG BÁO ĐẨY CẢNH BÁO VẮNG HỌC VÀ TRA CỨU LỊCH SỬ CHUYÊN CẦN TRÊN APP PHỤ HUYNH

- **VAI TRÒ NGHIỆM THU:** Phụ huynh học sinh.
- **MÔI TRƯỜNG THỰC TẾ:** Ứng dụng Mobile App GiaoVienHay trên điện thoại Samsung Galaxy của phụ huynh khi đang ở nơi làm việc.
- **BỐI CẢNH NGHIỆP VỤ THỰC TẾ:**
  Sáng sớm phụ huynh thấy con tự đạp xe đi học. Đến 7h20 sáng, phụ huynh đang ngồi làm việc tại cơ quan thì chuông điện thoại vang lên kèm thông báo khẩn cấp từ ứng dụng GiaoVienHay báo con bị vắng mặt không phép đầu giờ. Phụ huynh lập tức mở ứng dụng kiểm tra chi tiết, gọi điện cho người nhà và cô giáo để xử lý kịp thời trường hợp con bị hỏng xe trên đường.
- **DỮ LIỆU CHUẨN BỊ:**
  - Tài khoản phụ huynh em Trần Đức Anh (`stu_anh_02`).
  - Sự kiện điểm danh: Tiết 1 sáng ngày 05/10/2026, trạng thái `Vắng không phép`.

- **CÁC BƯỚC THAO TÁC THỰC HIỆN CỦA PHỤ HUYNH:**
  1. **Bước 1 (Tiếp nhận thông báo đẩy FCM):**
     - Điện thoại phụ huynh rung và phát âm báo thông báo.
     - Thanh trạng thái hiển thị tiêu đề màu đỏ: *"CẢNH BÁO CHUYÊN CẦN: Học sinh Trần Đức Anh vắng mặt không phép tiết 1 ngày 05/10/2026"*.
  2. **Bước 2 (Chạm mở ứng dụng):**
     - Phụ huynh chạm trực tiếp vào thông báo.
     - Ứng dụng tự động mở ra và chuyển hướng thẳng vào màn hình **"Lịch sử Chuyên cần"** của con.
  3. **Bước 3 (Tra cứu chi tiết chuyên cần):**
     - Màn hình hiển thị lịch tháng với các chấm tròn màu sắc:
       - Màu xanh: Đi học đúng giờ.
       - Màu vàng: Vắng có phép.
       - Màu đỏ: Vắng không phép (ngày hôm nay 05/10/2026 hiển thị màu đỏ kèm ghi chú "Tiết 1 - Đầu giờ").
     - Xem tổng kết tháng: `Có mặt: 22 ngày | Vắng có phép: 0 | Vắng không phép: 1`.

- **TIÊU CHÍ CHẤP NHẬN ĐẠT CHUẨN (ACCEPTANCE CRITERIA):**
  - [ ] **Thời gian nhận cảnh báo:** Nhận thông báo đẩy trong vòng **dưới 2.5 giây** sau khi giáo viên ấn lưu điểm danh trên lớp.
  - [ ] **Điều hướng sâu (Deep Linking):** Chạm vào thông báo dẫn thẳng tới đúng màn hình chuyên cần của con, không bắt phụ huynh phải bấm tìm qua nhiều menu.
  - [ ] **Minh bạch và dễ hiểu:** Giao diện lịch biểu trực quan, phân định rõ ràng giữa vắng có phép và vắng không phép.

- **KẾT QUẢ ĐÁNH GIÁ CUỐI CÙNG:** 
- **GHI CHÚ / GÓP Ý CẢI TIẾN THÊM TỪ NGƯỜI DÙNG:**
- **XÁC NHẬN NGHIỆM THU:**
  - Đại diện Phụ huynh Học sinh: 
  - Đại diện Nhóm Phát Triển: 

---

### UAT12_PHHS_03 : NGHIỆM THU TRA CỨU SỔ ĐIỂM ĐIỆN TỬ ĐA MÔN HỌC, ĐỌC NHẬN XÉT CỦA GIÁO VIÊN VÀ BẤM NÚT XÁC NHẬN ĐÃ ĐỌC

- **VAI TRÒ NGHIỆM THU:** Phụ huynh học sinh.
- **MÔI TRƯỜNG THỰC TẾ:** Mobile App GiaoVienHay trên iPhone của phụ huynh.
- **BỐI CẢNH NGHIỆP VỤ THỰC TẾ:**
  Buổi tối sau khi ăn cơm cùng gia đình, phụ huynh mở ứng dụng GiaoVienHay để kiểm tra kết quả học tập của con trong tuần. Phụ huynh xem bảng điểm các môn học (Toán, Tiếng Việt/Ngữ văn, Tiếng Anh, Khoa học...), xem chi tiết các cột điểm miệng, 15 phút, 1 tiết và đọc lời nhận xét của giáo viên chủ nhiệm khen ngợi tinh thần học tập của con, sau đó bấm nút "Đã đọc" để phản hồi cho giáo viên.
- **DỮ LIỆU CHUẨN BỊ:**
  - Học sinh: Nguyễn Hoàng Long.
  - Điểm mới công bố: Môn Toán (Điểm 15 phút: 9.5; Điểm miệng: 9.0).
  - Lời nhận xét text của GVCN: *"Con có ý thức học bài rất tốt, chữ viết sạch đẹp. Cần tiếp tục phát huy."*

- **CÁC BƯỚC THAO TÁC THỰC HIỆN CỦA PHỤ HUYNH:**
  1. **Bước 1 (Mở mục Bảng điểm điện tử):**
     - Đăng nhập app, tại màn hình chính chọn mục **"Sổ điểm của con"**.
     - Danh sách các môn học hiển thị rõ ràng: Toán học, Ngữ văn, Tiếng Anh, Lịch sử & Địa lý, KHTN...
  2. **Bước 2 (Xem chi tiết từng cột điểm thành phần):**
     - Nhấp vào môn **"Toán học"**.
     - Bảng điểm chi tiết mở ra hiển thị các cột điểm thành phần:
       - Điểm miệng: `9.0` (Ngày 02/10/2026).
       - Kiểm tra 15 phút: `9.5` (Ngày 05/10/2026).
       - Kiểm tra 1 tiết, Giữa kỳ, Cuối kỳ: Hiển thị dấu gạch ngang `-` (chưa có điểm).
  3. **Bước 3 (Xem lời nhận xét của giáo viên):**
     - Chuyển sang tab **"Nhận xét của thầy cô"**.
     - Đọc trọn vẹn lời dặn dò, khen ngợi từ GVCN Thầy Nguyễn Văn An.
  4. **Bước 4 (Bấm nút Xác nhận đã đọc):**
     - Dưới nhận xét có nút bấm **"Xác nhận đã đọc"**.
     - Phụ huynh chạm vào nút này: Nút chuyển sang trạng thái màu xanh lá cây *"Đã xác nhận lúc [Thời gian]"*.

- **TIÊU CHÍ CHẤP NHẬN ĐẠT CHUẨN (ACCEPTANCE CRITERIA):**
  - [ ] **Hiển thị điểm minh bạch:** Các cột điểm thành phần hiển thị trung thực theo đúng dữ liệu giáo viên nhập, không có cột điểm trung bình ảo.
  - [ ] **Bảo mật dữ liệu (Chống IDOR):** Phụ huynh chỉ nhìn thấy duy nhất điểm số và nhận xét của con em mình, tuyệt đối không xem được điểm của học sinh khác trong lớp.
  - [ ] **Nút xác nhận phản hồi nhanh:** Chạm "Xác nhận đã đọc" cập nhật trạng thái phản hồi lập tức trong **dưới 1 giây**.

- **KẾT QUẢ ĐÁNH GIÁ CUỐI CÙNG:** 
- **GHI CHÚ / GÓP Ý CẢI TIẾN THÊM TỪ NGƯỜI DÙNG:**
- **XÁC NHẬN NGHIỆM THU:**
  - Đại diện Phụ huynh Học sinh: 
  - Đại diện Nhóm Phát Triển: 

---

### UAT13_PHHS_04 : NGHIỆM THU TRA CỨU TÌNH TRẠNG NỘP HỌC PHÍ & BHYT (KÈM NGÀY NỘP CỤ THỂ) VÀ XEM LỜI NHẮC LỊCH KIỂM TRA ĐỂ ĐÔN ĐỐC CON ÔN TẬP

- **VAI TRÒ NGHIỆM THU:** Phụ huynh học sinh.
- **MÔI TRƯỜNG THỰC TẾ:** Mobile App GiaoVienHay trên điện thoại của phụ huynh.
- **BỐI CẢNH NGHIỆP VỤ THỰC TẾ:**
  Phụ huynh muốn kiểm tra xem số tiền Bảo hiểm Y tế mình gửi giáo viên chủ nhiệm tuần trước đã được nhà trường ghi nhận vào hệ thống hay chưa, đồng thời mở xem mục Lời nhắc kiểm tra để biết ngày mai con có bài thi môn nào nhằm nhắc nhở con chuẩn bị sách vở và ôn bài buổi tối.
- **DỮ LIỆU CHUẨN BỊ:**
  - Học sinh: Nguyễn Hoàng Long.
  - Trạng thái nộp BHYT: Đã hoàn thành (ngày nộp: `02/10/2026`).
  - Trạng thái học phí: Đã hoàn thành (ngày nộp: `01/10/2026`).
  - Lời nhắc kiểm tra: Môn Lịch sử & Địa lý, kiểm tra 1 tiết ngày `08/10/2026`.

- **CÁC BƯỚC THAO TÁC THỰC HIỆN CỦA PHỤ HUYNH:**
  1. **Bước 1 (Mở mục Học phí & BHYT):**
     - Đăng nhập app, chọn mục **"Học phí & Bảo hiểm Y tế"**.
     - Màn hình hiển thị danh mục các khoản thu:
       - **Học phí:** Huy hiệu màu xanh *"Đã hoàn thành"* - Ghi nhận ngày: `01/10/2026`.
       - **Bảo hiểm Y tế (BHYT):** Huy hiệu màu xanh *"Đã hoàn thành"* - Ghi nhận ngày: `02/10/2026`.
  2. **Bước 2 (Kiểm tra tính minh bạch):**
     - Quan sát thông tin: Hiển thị rõ ràng ngày giáo viên tích nhận tiền, không có yêu cầu thanh toán trực tuyến qua cổng thẻ.
  3. **Bước 3 (Mở mục Lời nhắc kiểm tra):**
     - Chuyển sang tab **"Lịch kiểm tra sắp tới"**.
     - Nhìn thấy thẻ thông báo nổi bật màu xanh dương:
       - Môn: `Lịch sử & Địa lý`.
       - Loại bài: `Kiểm tra 1 tiết (45 phút)`.
       - Ngày kiểm tra: `Thứ Năm, 08/10/2026` (Đếm ngược: Còn 2 ngày).
       - Lời dặn dò của cô: *"Các con nhớ ôn kỹ phần lược đồ tự nhiên châu Á và các mốc thời gian bài 4, chuẩn bị bút chì và thước kẻ."*

- **TIÊU CHÍ CHẤP NHẬN ĐẠT CHUẨN (ACCEPTANCE CRITERIA):**
  - [ ] **Minh bạch tài chính:** Thể hiện rõ ràng trạng thái Đã nộp kèm ngày tháng cụ thể, mang lại sự tin cậy và an tâm cho phụ huynh.
  - [ ] **Thông tin nhắc thi chi tiết:** Hiển thị rõ ràng môn thi, thời gian và lời dặn dò cụ thể giúp phụ huynh có căn cứ đôn đốc con học bài chu đáo.

- **KẾT QUẢ ĐÁNH GIÁ CUỐI CÙNG:** 
- **GHI CHÚ / GÓP Ý CẢI TIẾN THÊM TỪ NGƯỜI DÙNG:**
- **XÁC NHẬN NGHIỆM THU:**
  - Đại diện Phụ huynh Học sinh: 
  - Đại diện Nhóm Phát Triển: 

---

### UAT14_ADMIN_01 : NGHIỆM THU TÍNH NĂNG CẤU HÌNH HẠN MỨC TÀI NGUYÊN HỆ THỐNG (LIMITS / QUOTAS) VÀ KIỂM TRA ÁP DỤNG CHẶN TỨC THÌ TRÊN TOÀN NỀN TẢNG

- **VAI TRÒ NGHIỆM THU:** Quản trị viên Nền tảng (Platform Admin).
- **MÔI TRƯỜNG THỰC TẾ:** Web Quản trị Admin trên máy tính để bàn.
- **BỐI CẢNH NGHIỆP VỤ THỰC TẾ:**
  Để kiểm soát chi phí gọi API Google Gemini và chống việc tải tệp tài liệu quá tải làm chậm máy chủ, Admin mở màn hình Cấu hình Hạn mức Hệ thống để thiết lập: Mỗi giáo viên được gọi tối đa 20 lượt AI/ngày, sĩ số tối đa 50 học sinh/lớp và dung lượng tối đa mỗi tệp giáo án tải lên là 10MB. Admin lưu cấu hình và kiểm tra hệ thống có áp dụng chặn ngay lập tức hay không.
- **DỮ LIỆU CHUẨN BỊ:**
  - Tài khoản Admin: `admin@giaovienhay.edu.vn`.
  - Thông số cấu hình hạn mức:
    - Hạn ngạch gọi AI Gemini: `ai_daily_quota = 20` lượt/ngày/giáo viên.
    - Sĩ số tối đa 1 lớp: `max_students_per_class = 50` học sinh.
    - Dung lượng tệp giáo án tối đa: `max_upload_size_mb = 10` MB.
    - Số lớp học tối đa mỗi GV: `max_classes_per_teacher = 5` lớp.

- **CÁC BƯỚC THAO TÁC THỰC HIỆN CỦA ADMIN:**
  1. **Bước 1 (Đăng nhập Web Quản trị):**
     - Đăng nhập tài khoản Admin vào trang quản trị nền tảng GiaoVienHay.
     - Vào menu **"Cấu hình Hệ thống"** $\rightarrow$ **"Hạn mức Tài nguyên (Limits & Quotas)"**.
  2. **Bước 2 (Chỉnh sửa các thông số hạn mức):**
     - Nhập số lượt gọi AI tối đa: `20`.
     - Nhập sĩ số tối đa: `50`.
     - Nhập dung lượng tải lên tối đa: `10`.
     - Nhập số lớp tối đa: `5`.
     - Bấm nút **"Lưu cấu hình hệ thống"**.
  3. **Bước 3 (Kiểm tra cập nhật dữ liệu):**
     - Mở Firestore console kiểm tra document `/system_configs/limits`: Các giá trị mới đã được cập nhật chính xác.
  4. **Bước 4 (Thử nghiệm tính năng bảo vệ hạn mức):**
     - Thử dùng tài khoản giáo viên tải lên 1 tệp giáo án dung lượng 12MB (> 10MB).
     - Hệ thống báo lỗi ngay tại giao diện: *"Tệp tài liệu vượt quá dung lượng tối đa cho phép (10MB). Vui lòng chọn tệp nhỏ hơn."*

- **TIÊU CHÍ CHẤP NHẬN ĐẠT CHUẨN (ACCEPTANCE CRITERIA):**
  - [ ] **Cập nhật an toàn:** Dữ liệu cấu hình lưu chính xác vào collection `/system_configs/limits`.
  - [ ] **Áp dụng tức thì (Real-time enforcement):** Middleware và Guards của NestJS áp dụng hạn mức mới ngay lập tức mà không cần phải khởi động lại máy chủ (No restart required).
  - [ ] **Thông báo lỗi thân thiện:** Khi người dùng chạm ngưỡng giới hạn, giao diện hiển thị thông báo tiếng Việt giải thích rõ ràng lý do, không báo lỗi kỹ thuật khó hiểu.

- **KẾT QUẢ ĐÁNH GIÁ CUỐI CÙNG:** 
- **GHI CHÚ / GÓP Ý CẢI TIẾN THÊM TỪ NGƯỜI DÙNG:**
- **XÁC NHẬN NGHIỆM THU:**
  - Đại diện Quản trị viên: 
  - Đại diện Nhóm Phát Triển: 

---

### UAT15_ADMIN_02 : NGHIỆM THU TÍNH NĂNG KHÓA TÀI KHOẢN VI PHẠM (BAN USER), THU HỒI PHIÊN ĐĂNG NHẬP TỨC THÌ VÀ MỞ KHÓA TÀI KHOẢN (UNBAN)

- **VAI TRÒ NGHIỆM THU:** Quản trị viên Nền tảng (Platform Admin).
- **MÔI TRƯỜNG THỰC TẾ:** Web Quản trị Admin trên máy tính và ứng dụng trên điện thoại của tài khoản bị khóa.
- **BỐI CẢNH NGHIỆP VỤ THỰC TẾ:**
  Hệ thống phát hiện một tài khoản người dùng có hành vi vi phạm điều khoản quy tắc ứng xử học đường (spam nội dung hoặc quấy rối). Admin mở hồ sơ người dùng này trên cổng quản trị, thực hiện thao tác Khóa tài khoản (`Ban User`). Toàn bộ phiên làm việc của tài khoản này trên thiết bị di động phải bị thu hồi ngay lập tức, người dùng bị văng ra màn hình đăng nhập và không thể gọi bất kỳ API nào. Khi có giải trình hợp lệ, Admin có thể thực hiện Mở khóa (`Unban User`) để phục hồi tài khoản nguyên vẹn.
- **DỮ LIỆU CHUẨN BỊ:**
  - Tài khoản vi phạm: `nguoidung.vipham@gmail.com` (UID: `usr_violate_99`).
  - Lý do khóa: *"Vi phạm quy tắc ứng xử học đường và điều khoản sử dụng nền tảng"*.

- **CÁC BƯỚC THAO TÁC THỰC HIỆN CỦA ADMIN:**
  1. **Bước 1 (Tìm kiếm tài khoản vi phạm):**
     - Trên Web Admin, vào mục **"Quản lý Tài khoản Người dùng"**.
     - Nhập email `nguoidung.vipham@gmail.com` vào ô tìm kiếm.
     - Bấm xem chi tiết hồ sơ tài khoản.
  2. **Bước 2 (Thực hiện Khóa tài khoản - Ban User):**
     - Bấm nút màu đỏ **"Khóa tài khoản (Ban User)"**.
     - Một hộp thoại xác nhận hiện ra: Nhập lý do khóa *"Vi phạm quy tắc ứng xử học đường"*.
     - Bấm **"Xác nhận khóa tài khoản"**.
  3. **Bước 3 (Kiểm tra phía người dùng bị khóa):**
     - Quan sát điện thoại đang đăng nhập tài khoản vi phạm:
     - Ứng dụng lập tức hiển thị thông báo: *"Tài khoản của bạn đã bị khóa do: Vi phạm quy tắc ứng xử học đường. Vui lòng liên hệ ban quản trị để được hỗ trợ."*
     - Ứng dụng tự động đăng xuất và đưa người dùng trở về màn hình Đăng nhập.
     - Thử đăng nhập lại: Hệ thống từ chối xác thực và báo lỗi tài khoản đã bị vô hiệu hóa.
  4. **Bước 4 (Thực hiện Mở khóa - Unban User):**
     - Trên Web Admin, hồ sơ người dùng hiển thị trạng thái màu đỏ: `ĐÃ BỊ KHÓA`.
     - Admin bấm nút **"Mở khóa tài khoản (Unban User)"**.
     - Trạng thái chuyển lại màu xanh: `ĐANG HOẠT ĐỘNG`.
     - Người dùng thực hiện đăng nhập lại trên điện thoại thành công, toàn bộ dữ liệu lớp học trước đó vẫn được bảo toàn nguyên vẹn.

- **TIÊU CHÍ CHẤP NHẬN ĐẠT CHUẨN (ACCEPTANCE CRITERIA):**
  - [ ] **Thu hồi phiên tức thì:** Vô hiệu hóa tài khoản trên Firebase Authentication (`disabled = true`) và đặt `is_active = false` trong Firestore; mọi yêu cầu API với token cũ bị từ chối với mã lỗi HTTP 403 Forbidden.
  - [ ] **Hiển thị lý do minh bạch:** Người dùng biết chính xác lý do tài khoản của mình bị khóa.
  - [ ] **Mở khóa an toàn & Bảo toàn dữ liệu:** Thao tác Unban khôi phục quyền truy cập bình thường mà không làm mất hay gián đoạn dữ liệu lớp học, điểm số hay sổ liên lạc của người dùng.

- **KẾT QUẢ ĐÁNH GIÁ CUỐI CÙNG:** 
- **GHI CHÚ / GÓP Ý CẢI TIẾN THÊM TỪ NGƯỜI DÙNG:**
- **XÁC NHẬN NGHIỆM THU:**
  - Đại diện Quản trị viên: 
  - Đại diện Nhóm Phát Triển: 
