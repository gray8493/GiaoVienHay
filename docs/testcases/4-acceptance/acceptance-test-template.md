# TÀI LIỆU MẪU KỊCH BẢN KIỂM THỬ NGHIỆM THU NGƯỜI DÙNG (ACCEPTANCE TEST / UAT TEMPLATE)

# MÃ TÀI LIỆU: UAT_TEMPLATE_SPEC - KHUNG KỊCH BẢN NGHIỆM THU CHUẨN NỀN TẢNG GIAOVIENHAY

# CẤP ĐỘ KIỂM THỬ: KIỂM THỬ CHẤP NHẬN NGƯỜI DÙNG (USER ACCEPTANCE TESTING - UAT)

---

## 1. THÔNG TIN CHUNG

- **HỆ THỐNG PHẦN MỀM:** Nền tảng Quản lý Học vụ & Sổ liên lạc Điện tử Thông minh **GiaoVienHay** (Phục vụ Giáo viên, Học sinh và Phụ huynh Cấp 1 & Cấp 2).
- **MỤC ĐÍCH TÀI LIỆU:** Cung cấp khung kịch bản chuẩn (Template) và các kịch bản mẫu đại diện để người dùng cuối (Giáo viên, Phụ huynh, Quản trị viên) và bộ phận Đảm bảo chất lượng (QA/QC) đánh giá tính tiện dụng, hiệu năng và mức độ sẵn sàng triển khai của các tính năng phần mềm trong môi trường thực tế lớp học.
- **ĐỐI TƯỢNG THAM GIA NGHIỆM THU (PERSONAS):**
  - **Giáo viên chủ nhiệm (GVCN):** Kiểm tra tính tiện lợi, thao tác 1-chạm điểm danh nhanh đầu giờ học (xử lý bất đồng bộ, nạp cache danh sách có mặt), quản lý thu nộp BHYT/học phí bằng cờ boolean, gửi nhận xét text ngắn gọn, xóa mềm học sinh chuyển trường bảo toàn dữ liệu lịch sử.
  - **Giáo viên bộ môn (GVBM):** Kiểm tra tính năng tạo đề bài cũ bằng AI Gemini từ giáo án Word/PDF, chiếu Vòng quay may mắn nạp từ RAM cache có nút Bỏ qua (Skip), Mini-game lớp học (Rung chuông vàng, Hộp quà), nhập điểm thành phần trực tiếp và xem Bảng xếp hạng.
  - **Phụ huynh học sinh (PHHS):** Kiểm tra tính kịp thời của thông báo đẩy (FCM vắng học < 2 giây), xem sổ liên lạc điện tử (điểm số, chuyên cần, BHYT kèm ngày nộp) và nút bấm "Xác nhận đã đọc" nhận xét.
  - **Ban Giám Hiệu / Quản trị viên (Platform Admin):** Kiểm tra cấu hình hạn mức tài nguyên (`/system-limits`), tra cứu người dùng qua từ khóa (`keyword`), điều chỉnh trạng thái tài khoản (`PATCH /api/v1/admin/users/:id/status`) thu hồi phiên tức thì.
- **TIÊU CHÍ NGHIỆM THU TỔNG QUAN (ACCEPTANCE CRITERIA):**
  - Giao diện tiếng Việt 100%, từ ngữ sư phạm chuẩn mực, gần gũi với môi trường giáo dục phổ thông Việt Nam.
  - Tốc độ phản hồi tức thì: Thao tác chạm/lưu trên màn hình dưới 1 giây, truy vấn danh sách lớp/danh sách có mặt qua In-Memory Cache siêu tốc (< 5ms).
  - Kiến trúc bất đồng bộ (Event-driven): Điểm danh vắng phát sự kiện ngầm qua `EventEmitter2`, đẩy thông báo FCM tới phụ huynh dưới 2 giây mà không làm gián đoạn hay đơ màn hình của giáo viên.
  - Tính toàn vẹn dữ liệu: Áp dụng cơ chế xóa mềm (Soft Delete `is_deleted = true`) giúp bảo toàn 100% dữ liệu điểm số, chuyên cần lịch sử khi học sinh hoặc lớp học thay đổi trạng thái.
  - Độ ổn định cao: Không xuất hiện lỗi sập ứng dụng (Crash), không bị treo màn hình (Freeze) hoặc lỗi hiển thị trắng (White screen).
- **THIẾT BỊ SỬ DỤNG THỰC TẾ:**
  - Điện thoại di động iOS (iPhone) & Android (Samsung, Xiaomi) kết nối 4G/Wi-Fi.
  - Laptop / Máy tính bảng kết nối Máy chiếu (Projector) hoặc Tivi tương tác thông minh tại lớp học.
  - Máy tính để bàn kết nối trình duyệt Web dành cho Quản trị viên Admin.

---

## 2. BẢNG TỔNG HỢP CÁC KỊCH BẢN NGHIỆM THU MẪU (UAT SUITE)

| Mã UAT | Nhóm Người Dùng | Tính Năng Nghiệm Thu | Kịch Bản Thử Nghiệm Thực Tế | Tiêu Chí Chấp Nhận (Acceptance Criteria) | Đánh Giá |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **UAT_SAMPLE_01** | Giáo viên bộ môn | AI Gemini sinh câu hỏi, Vòng quay RAM cache & Vào điểm | GVBM tải giáo án lên web, AI sinh 5 câu hỏi, chiếu Vòng quay may mắn (bấm Skip khi vắng), chấm điểm miệng trực tiếp vào sổ điểm | AI sinh đề < 12 giây, vòng quay mượt mà nạp danh sách có mặt từ RAM cache, nút Skip quay tiếp ngay, điểm đồng bộ tức thì | **ĐẠT** |
| **UAT_SAMPLE_02** | Giáo viên chủ nhiệm | Điểm danh 1-chạm bất đồng bộ & Nạp cache danh sách có mặt | GVCN điểm danh 35 học sinh tại cửa lớp trong 30 giây, chuyển trạng thái 2 em vắng, bấm lưu và quan sát phản hồi | Lưu tức thì không đơ máy (`notified_parents_queued`), phụ huynh nhận FCM < 2s, tự động nạp cache RAM danh sách có mặt (< 5ms) cho Vòng quay | **ĐẠT** |
| **UAT_SAMPLE_03** | Giáo viên chủ nhiệm | Xóa mềm (Soft Delete) học sinh & Bảo toàn dữ liệu lịch sử | GVCN thực hiện xóa 1 học sinh chuyển trường khỏi danh sách lớp trên App di động, sau đó kiểm tra sổ điểm và CSDL | Học sinh biến mất ngay khỏi danh sách lớp và Vòng quay trên App, nhưng toàn bộ điểm số và lịch sử chuyên cần quá khứ vẫn được bảo toàn nguyên vẹn | **ĐẠT** |
| **UAT_SAMPLE_04** | Phụ huynh học sinh | Tra cứu BHYT & Xác nhận đã đọc Sổ liên lạc | Phụ huynh mở app xem trạng thái nộp BHYT (kèm ngày nộp thực tế) và bấm "Xác nhận đã đọc" lời nhận xét của cô giáo | Thông tin hiển thị minh bạch có ngày tháng, nút bấm phản hồi tức thì < 1s, cập nhật trạng thái đã đọc hai chiều | **ĐẠT** |
| **UAT_SAMPLE_05** | Quản trị viên hệ thống | Cấu hình hạn mức (`/system-limits`) & Khóa tài khoản (`/status`) | Admin kiểm tra hạn mức hệ thống, tìm người dùng qua `keyword`, khóa tài khoản vi phạm và xác nhận thu hồi phiên đăng nhập | Endpoint API chuẩn xác, lưu hạn mức tức thì, tài khoản bị khóa bị đăng xuất ngay và dọn sạch cache profile | **ĐẠT** |

---

## 3. KHUNG HƯỚNG DẪN CẤU TRÚC KỊCH BẢN CHI TIẾT (UAT SPECIFICATION STRUCTURE)

Mỗi kịch bản nghiệm thu chi tiết trong bộ tài liệu UAT bắt buộc phải tuân theo cấu trúc chuẩn 7 phần:

```text
### [MÃ_KỊCH_BẢN] : [TÊN TÍNH NĂNG NGHIỆM THU VIẾT IN HOA]

- VAI TRÒ NGHIỆM THU: [GVCN / GVBM / PHHS / Admin]
- MÔI TRƯỜNG THỰC TẾ: [Thiết bị, Hệ điều hành, Mạng kết nối, Trình duyệt / App]
- BỐI CẢNH NGHIỆP VỤ THỰC TẾ: [Mô tả tình huống đời thực tại trường lớp thúc đẩy người dùng thao tác]
- DỮ LIỆU CHUẨN BỊ (PRE-CONDITIONS & TEST DATA): [Tài khoản, lớp học, học sinh, tệp đính kèm]
- CÁC BƯỚC THAO TÁC THỰC HIỆN CỦA NGƯỜI DÙNG:
  1. Bước 1: [Hành động mở màn hình / chọn lớp]
  2. Bước 2: [Hành động nhập liệu / chạm chuyển trạng thái]
  3. Bước 3: [Hành động bấm nút thực thi / lưu]
  4. Bước 4: [Hành động đối soát kết quả hiển thị trên thiết bị liên quan]
- TIÊU CHÍ CHẤP NHẬN ĐẠT CHUẨN (ACCEPTANCE CRITERIA):
  - [ ] Tiêu chí giao diện và ngôn ngữ sư phạm.
  - [ ] Tiêu chí thời gian phản hồi (Latency / Response Time).
  - [ ] Tiêu chí thông báo đẩy (FCM Push Notification).
  - [ ] Tiêu chí bảo toàn dữ liệu & cơ chế ngầm (Soft Delete / In-Memory Cache / Async Queue).
- KẾT QUẢ ĐÁNH GIÁ CUỐI CÙNG: [ĐẠT (ACCEPTED) / CẦN ĐIỀU CHỈNH (REWORK)]
- GHI CHÚ / GÓP Ý CẢI TIẾN THÊM TỪ NGƯỜI DÙNG: [Nhận xét thực tế]
- XÁC NHẬN NGHIỆM THU: [Đại diện người dùng & Nhóm phát triển ký xác nhận]
```

---

## 4. CHI TIẾT CÁC KỊCH BẢN NGHIỆM THU MẪU ĐIỂN HÌNH

---

### UAT_SAMPLE_01 : NGHIỆM THU TÍNH NĂNG TRỢ GIẢNG AI SINH TRẮC NGHIỆM TỪ GIÁO ÁN, TRÌNH CHIẾU VÒNG QUAY MAY MẮN (NẠP RAM CACHE, NÚT SKIP) VÀ VÀO ĐIỂM TRỰC TIẾP

- **VAI TRÒ NGHIỆM THU:** Giáo viên bộ môn (GVBM) Toán học / Khoa học tự nhiên.
- **MÔI TRƯỜNG THỰC TẾ:** Trình duyệt Web Google Chrome trên Laptop cá nhân kết nối Máy chiếu / Tivi tương tác thông minh tại phòng học qua mạng Wi-Fi trường.
- **BỐI CẢNH NGHIỆP VỤ THỰC TẾ:**
  Cô giáo bước vào tiết học, cần khởi động đầu giờ 5 phút bằng 5 câu hỏi trắc nghiệm kiểm tra bài cũ dựa trên giáo án bài giảng đã soạn sẵn. Cô giáo tải tệp Word giáo án lên hệ thống để AI Gemini sinh đề trắc nghiệm tự động, sau đó chuyển sang trình chiếu Vòng quay may mắn (sử dụng danh sách học sinh có mặt hôm nay đã được nạp sẵn trong RAM cache từ tiết điểm danh). Khi quay trúng bạn vắng mặt, cô giáo bấm nút "Bỏ qua (Skip)" để quay tiếp không bị đơ. Sau khi học sinh trả lời đúng, cô cho điểm 10 và bấm lưu trực tiếp vào sổ điểm môn học.
- **DỮ LIỆU CHUẨN BỊ:**
  - Tệp giáo án: `Bai12_PhepCongPhanSo.docx` (Dung lượng 2MB).
  - Cấu hình đề: 5 câu hỏi, Độ khó: `Vừa (MEDIUM)`, Hình thức: Trắc nghiệm 4 lựa chọn.
  - Lớp học: Lớp `6A2` (Đã có 33 học sinh có mặt và 2 học sinh vắng trong buổi điểm danh sáng).
  - RAM cache điểm danh: Khóa `att_present_cls_6a2_<today>` đã sẵn sàng trên server.

- **CÁC BƯỚC THAO TÁC THỰC HIỆN CỦA GIÁO VIÊN:**
  1. **Bước 1 (Tải giáo án và cấu hình sinh đề AI):**
     - Đăng nhập tài khoản GVBM, mở lớp `6A2`, vào mục **"Trợ giảng AI / Kiểm tra bài cũ"**.
     - Kéo thả tệp `Bai12_PhepCongPhanSo.docx` vào vùng tải lên.
     - Chọn số lượng câu hỏi: `5 câu`, độ khó: `Vừa (MEDIUM)`.
     - Bấm nút **"Bắt đầu sinh câu hỏi bằng AI"**.
  2. **Bước 2 (Xem trước và duyệt bộ đề trắc nghiệm):**
     - Quan sát màn hình chờ tiến trình: AI hoàn tất đọc hiểu và trả về bộ 5 câu hỏi kèm đáp án A, B, C, D và lời giải chi tiết.
     - Cô giáo kiểm tra lướt nội dung, bấm nút **"Duyệt bộ đề & Bắt đầu trò chơi"**.
  3. **Bước 3 (Trình chiếu Vòng quay may mắn toàn màn hình):**
     - Bấm nút **"Toàn màn hình (Full-screen)"** để hiển thị hình ảnh sống động lên màn hình Tivi lớp học.
     - Màn hình Vòng quay tải danh sách học sinh có mặt từ In-Memory Cache tức thì (< 5ms), không bị lẫn 2 bạn vắng học.
     - Bấm nút **"Quay số"**: Vòng quay quay tròn mượt mà kèm âm thanh hào hứng.
     - Giả sử hệ thống chỉ định bạn Tuấn (bạn Tuấn hôm nay xin phép ra ngoài phòng y tế). Cô giáo bấm nút **"Bỏ qua (Skip)"**.
     - Vòng quay lập tức quay tiếp lượt mới mà không cần tải lại trang hay gây gián đoạn tiết học.
  4. **Bước 4 (Chấm điểm trực tiếp vào Sổ điểm):**
     - Vòng quay dừng lại ở bạn Lê Lan. Bạn Lan trả lời đúng xuất sắc câu hỏi số 1.
     - Cô giáo nhập điểm `10`, ghi lời khen *"Nắm chắc quy tắc cộng phân số khác mẫu"* và bấm **"Lưu điểm vào sổ"**.
     - Chuyển sang mục Sổ điểm môn Toán: Điểm 10 của bạn Lan đã xuất hiện ngay tại cột Kiểm tra miệng.

- **TIÊU CHÍ CHẤP NHẬN ĐẠT CHUẨN (ACCEPTANCE CRITERIA):**
  - [x] **Tốc độ AI Gemini:** Đọc hiểu tài liệu và sinh bộ 5 câu hỏi chuẩn kiến thức trong vòng **dưới 12 giây**.
  - [x] **Độ chuẩn xác kiến thức:** Câu hỏi bám sát nội dung bài học, đáp án đúng A/B/C/D chính xác không bị nhầm lẫn phương án.
  - [x] **Hiệu năng RAM cache & Đồ họa:** Danh sách vòng quay nạp từ RAM cache dưới 5ms; chuyển động quay mượt mà (60fps), âm thanh sống động, học sinh thích thú.
  - [x] **Xử lý nút Skip nhạy bén:** Bấm "Skip" phản hồi ngay lập tức, chuyển lượt quay mới liền mạch, không giật lag.
  - [x] **Đồng bộ Sổ điểm:** Điểm số được lưu thẳng vào document điểm số môn học trong CSDL, không yêu cầu cô giáo phải mở sổ ghi chép lại thủ công.

- **KẾT QUẢ ĐÁNH GIÁ CUỐI CÙNG:** **ĐẠT (ACCEPTED)**
- **GHI CHÚ / GÓP Ý CẢI TIẾN THÊM TỪ NGƯỜI DÙNG:**
  - *"Tính năng AI sinh đề rất thông minh, bám sát giáo án. Vòng quay nạp danh sách có mặt rất nhanh và nút Skip cực kỳ hữu ích khi học sinh ra ngoài hoặc có sự cố đột xuất tại lớp."*
- **XÁC NHẬN NGHIỆM THU:**
  - Đại diện Giáo viên Bộ môn: *(Đã ký nhận)*
  - Đại diện Nhóm Phát Triển: *(Đã xác nhận)*

---

### UAT_SAMPLE_02 : NGHIỆM THU TÍNH NĂNG ĐIỂM DANH CHUYÊN CẦN 1-CHẠM BẤT ĐỒNG BỘ, TỰ ĐỘNG PHÁT THÔNG BÁO FCM NGẦM VÀ ĐỒNG BỘ RAM CACHE

- **VAI TRÒ NGHIỆM THU:** Giáo viên chủ nhiệm (GVCN).
- **MÔI TRƯỜNG THỰC TẾ:** Ứng dụng di động GiaoVienHay Mobile App trên điện thoại thông minh iPhone 13 (kết nối Wi-Fi trường hoặc mạng 4G).
- **BỐI CẢNH NGHIỆP VỤ THỰC TẾ:**
  Đầu giờ học buổi sáng (7h15), cô giáo chủ nhiệm mở ứng dụng trên điện thoại để điểm danh nhanh lớp `6A2` (35 học sinh). Toàn bộ danh sách đã được hệ thống tích sẵn huy hiệu màu xanh "Có mặt". Cô giáo chỉ mất 30 giây để quan sát chỗ ngồi trống, chạm 1 lần để đổi trạng thái cho em Nguyễn Văn A (vắng có phép) và em Trần Văn B (vắng không phép), sau đó bấm nút "Lưu điểm danh". Hệ thống lưu dữ liệu tức thì, không làm đơ điện thoại của cô giáo, tự động bắn sự kiện ngầm gửi thông báo đẩy tới phụ huynh học sinh vắng và nạp RAM cache danh sách học sinh có mặt cho các tiết học tiếp theo.
- **DỮ LIỆU CHUẨN BỊ:**
  - Lớp học: Lớp `6A2` (Sĩ số: 35 học sinh).
  - Học sinh vắng 1: Nguyễn Văn A (`stu_01`) $\rightarrow$ `ABSENT_EXCUSED` (Vắng có phép).
  - Học sinh vắng 2: Trần Văn B (`stu_02`) $\rightarrow$ `ABSENT_UNEXCUSED` (Vắng không phép).
  - Điện thoại phụ huynh em Trần Văn B đang cài sẵn App GiaoVienHay ở chế độ chờ.

- **CÁC BƯỚC THAO TÁC THỰC HIỆN CỦA GIÁO VIÊN:**
  1. **Bước 1 (Mở giao diện điểm danh nhanh):**
     - Đăng nhập App, chọn lớp `6A2`, vào mục **"Điểm danh đầu giờ"**.
     - Danh sách 35 học sinh hiển thị sẵn với trạng thái mặc định màu xanh **"Có mặt"**.
  2. **Bước 2 (Chạm 1-chạm chuyển trạng thái học sinh vắng):**
     - Chạm 1 lần vào dòng tên em Nguyễn Văn A: Trạng thái đổi sang màu vàng **"Vắng có phép"**.
     - Chạm 2 lần vào dòng tên em Trần Văn B: Trạng thái đổi sang màu đỏ **"Vắng không phép"**.
     - Thanh trạng thái sĩ số đầu trang cập nhật: `Có mặt: 33 | Vắng: 2`.
  3. **Bước 3 (Bấm lưu kết quả và quan sát phản hồi):**
     - Cô giáo bấm nút lớn **"Lưu kết quả điểm danh"**.
     - Màn hình thông báo *"Lưu điểm danh thành công"* ngay lập tức (< 1 giây), không có biểu tượng xoay chờ mạng lâu.
  4. **Bước 4 (Đối soát thiết bị phụ huynh và kiểm tra cache ngầm):**
     - Kiểm tra điện thoại phụ huynh em Trần Văn B: Nhận thông báo đẩy FCM trong vòng 2 giây: *"Thông báo: Em Trần Văn B vắng mặt không phép buổi học sáng nay..."*.
     - Phụ huynh của 33 em có mặt không nhận thông báo làm phiền.
     - GVBM môn sau mở Vòng quay may mắn: Danh sách hiển thị ngay 33 học sinh có mặt lấy trực tiếp từ In-Memory Cache với độ trễ cực thấp.

- **TIÊU CHÍ CHẤP NHẬN ĐẠT CHUẨN (ACCEPTANCE CRITERIA):**
  - [x] **Thao tác 1-chạm mượt mà:** Chuyển đổi trạng thái linh hoạt, trực quan bằng màu sắc chuẩn sư phạm (Xanh: Có mặt, Vàng: Vắng có phép, Đỏ: Vắng không phép).
  - [x] **Xử lý bất đồng bộ (Non-blocking UI):** Ứng dụng phản hồi lưu thành công tức thì; backend phát sự kiện ngầm qua `EventEmitter2` (`notified_parents_queued: 2`), không làm treo màn hình điện thoại giáo viên.
  - [x] **Tốc độ thông báo đẩy FCM:** Điện thoại phụ huynh học sinh vắng nhận cảnh báo đẩy trong vòng **dưới 2.5 giây**.
  - [x] **Đồng bộ In-Memory Cache:** Tự động xóa cache điểm danh cũ và nạp RAM cache `att_present_cls_6a2_<date>` (< 5ms) phục vụ vòng quay và sổ điểm các tiết sau.

- **KẾT QUẢ ĐÁNH GIÁ CUỐI CÙNG:** **ĐẠT (ACCEPTED)**
- **GHI CHÚ / GÓP Ý CẢI TIẾN THÊM TỪ NGƯỜI DÙNG:**
  - *"Điểm danh cực nhanh, chỉ mất chưa đầy 30 giây đầu giờ. Phụ huynh nhận được tin ngay lập tức nên rất an tâm."*
- **XÁC NHẬN NGHIỆM THU:**
  - Đại diện Giáo viên Chủ nhiệm: *(Đã ký nhận)*
  - Đại diện Nhóm Phát Triển: *(Đã xác nhận)*

---

### UAT_SAMPLE_03 : NGHIỆM THU CHU TRÌNH XÓA MỀM (SOFT DELETE) HỌC SINH VÀ BẢO TOÀN DỮ LIỆU ĐIỂM SỐ / CHUYÊN CẦN LỊCH SỬ

- **VAI TRÒ NGHIỆM THU:** Giáo viên chủ nhiệm (GVCN) & Ban Giám Hiệu.
- **MÔI TRƯỜNG THỰC TẾ:** Ứng dụng di động GiaoVienHay Mobile App trên iPad / Android Tablet và Trình duyệt Web quản lý lớp học.
- **BỐI CẢNH NGHIỆP VỤ THỰC TẾ:**
  Học sinh Hoàng Gia Bảo lớp `6A2` chuyển trường cùng gia đình sang tỉnh khác giữa học kỳ. GVCN cần cập nhật lại danh sách lớp bằng cách xóa học sinh Gia Bảo để em không còn hiển thị trong danh sách sĩ số thường nhật, không bị gọi tên trong Vòng quay may mắn hay bảng điểm danh. Tuy nhiên, theo quy định lưu trữ hồ sơ học bạ của Bộ Giáo dục & Đào tạo, toàn bộ điểm kiểm tra học kỳ 1 và lịch sử chuyên cần trước ngày chuyển trường của em Bảo bắt buộc phải được bảo toàn nguyên vẹn trong hệ thống.
- **DỮ LIỆU CHUẨN BỊ:**
  - Học sinh: Hoàng Gia Bảo (`stu_bao_09`), lớp `6A2`.
  - Dữ liệu đã có: 3 cột điểm môn Toán (Điểm 15 phút: 8.5, Điểm 1 tiết: 9.0), 45 bản ghi điểm danh quá khứ.
  - Quyền hạn: GVCN lớp `6A2`.

- **CÁC BƯỚC THAO TÁC THỰC HIỆN CỦA GIÁO VIÊN:**
  1. **Bước 1 (Mở hồ sơ học sinh trên App):**
     - GVCN mở app, chọn lớp `6A2`, vào mục **"Danh sách Học sinh"**.
     - Tìm học sinh `Hoàng Gia Bảo`, bấm vào biểu tượng tùy chọn hồ sơ.
  2. **Bước 2 (Thực hiện thao tác xóa học sinh):**
     - Bấm nút màu đỏ **"Xóa học sinh khỏi lớp"**.
     - Hệ thống hiển thị hộp thoại xác nhận: *"Học sinh sẽ được ẩn khỏi danh sách lớp hiện tại. Dữ liệu điểm số và chuyên cần lịch sử sẽ được bảo toàn nguyên vẹn trong hệ thống. Bạn có chắc chắn muốn thực hiện?"*.
     - Bấm **"Xác nhận xóa"**.
  3. **Bước 3 (Kiểm tra hiển thị phía giao diện App):**
     - Danh sách lớp `6A2` tải lại: Sĩ số giảm từ 35 xuống 34. Tên học sinh Hoàng Gia Bảo không còn xuất hiện trong danh sách lớp.
     - GVBM mở màn hình Vòng quay may mắn và màn hình Điểm danh: Tên em Bảo đã hoàn toàn được ẩn khỏi danh sách quay số và danh sách điểm danh.
  4. **Bước 4 (Đối soát bảo toàn dữ liệu ngầm trong CSDL):**
     - Kiểm tra document học sinh trong collection `/students/stu_bao_09`: Bản ghi không bị xóa vĩnh viễn (Hard delete) mà được gán cờ `is_deleted = true`, kèm mốc thời gian `deleted_at: timestamp`.
     - Kiểm tra collection `/grades` và `/attendance`: Toàn bộ các cột điểm số và lịch sử chuyên cần quá khứ của em Bảo vẫn còn nguyên vẹn 100%, không bị xóa theo chuỗi (No accidental cascade delete).

- **TIÊU CHÍ CHẤP NHẬN ĐẠT CHUẨN (ACCEPTANCE CRITERIA):**
  - [x] **Cơ chế Xóa mềm (Soft Delete) chuẩn xác:** Bản ghi học sinh được cập nhật `is_deleted = true` và `deleted_at`; API trả về thông điệp thành công rõ ràng.
  - [x] **Tự động làm mới giao diện & Dọn cache:** Danh sách lớp trên App tự động ẩn học sinh bị xóa; cache lớp học (`classes_teacher_<id>`) được vô hiệu hóa để tải dữ liệu mới tức thì.
  - [x] **Bảo toàn dữ liệu học vụ lịch sử (Data Preservation):** Điểm số và dữ liệu chuyên cần cũ của học sinh không bị mất mát, sẵn sàng phục vụ việc trích xuất học bạ hoặc báo cáo thống kê của nhà trường khi cần.
  - [x] **Hộp thoại cảnh báo nghiệp vụ thân thiện:** Giải thích rõ ràng cho giáo viên về tính an toàn của dữ liệu lịch sử trước khi xác nhận.

- **KẾT QUẢ ĐÁNH GIÁ CUỐI CÙNG:** **ĐẠT (ACCEPTED)**
- **GHI CHÚ / GÓP Ý CẢI TIẾN THÊM TỪ NGƯỜI DÙNG:**
  - *"Rất yên tâm vì học sinh chuyển trường được ẩn đi cho gọn danh sách lớp, nhưng điểm cũ vẫn giữ nguyên trong sổ điểm điện tử của nhà trường để in học bạ."*
- **XÁC NHẬN NGHIỆM THU:**
  - Đại diện Giáo viên Chủ nhiệm: *(Đã ký nhận)*
  - Đại diện Ban Giám Hiệu: *(Đã xác nhận)*
  - Đại diện Nhóm Phát Triển: *(Đã xác nhận)*

---

## 5. HƯỚNG DẪN ĐÁNH GIÁ & KÝ BIÊN BẢN NGHIỆM THU (SIGN-OFF PROCESS)

1. **Quy trình nghiệm thu chuẩn:**
   - Mỗi kịch bản UAT được thực hiện bởi đại diện người dùng thực tế trên thiết bị mục tiêu.
   - Nếu toàn bộ các tiêu chí trong mục **Tiêu chí chấp nhận đạt chuẩn (Acceptance Criteria)** đều được tích chọn `[x]`, kịch bản được đánh giá là **ĐẠT (ACCEPTED)**.
   - Nếu có tiêu chí không thỏa mãn (ví dụ: giật lag quá 3 giây, mất dữ liệu, giao diện sai tiếng Việt), kịch bản được đánh giá là **CẦN ĐIỀU CHỈNH (REWORK)** kèm mô tả lỗi chi tiết trong phần Ghi chú.

2. **Mẫu biên bản xác nhận bàn giao nghiệm thu:**

```text
CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc
----------------------------

BIÊN BẢN NGHIỆM THU CHẤP NHẬN NGƯỜI DÙNG (UAT SIGN-OFF)
Dự án: Nền tảng Quản lý Học vụ & Sổ liên lạc GiaoVienHay
Phiên bản: v1.0.0 (Release Candidate)

Hôm nay, ngày ... tháng ... năm 2026, các bên gồm có:
1. ĐẠI DIỆN NGƯỜI DÙNG (GIÁO VIÊN / BAN GIÁM HIỆU / PHỤ HUYNH):
   - Ông/Bà: ....................................... Chức vụ: ....................................
2. ĐẠI DIỆN ĐỘI NGŨ PHÁT TRIỂN & ĐẢM BẢO CHẤT LƯỢNG (DEV & QA):
   - Ông/Bà: ....................................... Chức vụ: ....................................

Sau khi tiến hành kiểm thử thực tế theo bộ kịch bản nghiệm thu UAT, hai bên thống nhất:
- Tổng số kịch bản thực hiện: ........... kịch bản.
- Số kịch bản ĐẠT: ........... kịch bản.
- Số kịch bản CẦN ĐIỀU CHỈNH: ........... kịch bản.

KẾT LUẬN CHUNG:
[ ] ĐỒNG Ý NGHIỆM THU VÀ ĐỦ ĐIỀU KIỆN PHÁT HÀNH CHÍNH THỨC (GO-LIVE).
[ ] YÊU CẦU HOÀN THIỆN CÁC ĐIỂM TỒN TẠI TRƯỚC KHI TỔ CHỨC NGHIỆM THU LẠI.

ĐẠI DIỆN NGƯỜI DÙNG                                  ĐẠI DIỆN NHÓM PHÁT TRIỂN
  (Ký và ghi rõ họ tên)                                 (Ký và ghi rõ họ tên)
```
