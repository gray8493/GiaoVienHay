# TÀI LIỆU KỊCH BẢN KIỂM THỬ NGHIỆM THU NGƯỜI DÙNG TOÀN DIỆN (USER ACCEPTANCE TESTING - UAT SPECIFICATION)

# MÃ TÀI LIỆU: UAT_GVH_ACCEPTANCE_SUITE - BỘ KỊCH BẢN NGHIỆM THU CHUẨN NỀN TẢNG GIAOVIENHAY

# CẤP ĐỘ KIỂM THỬ: KIỂM THỬ CHẤP NHẬN NGƯỜI DÙNG (USER ACCEPTANCE TESTING - UAT)

---

## 1. THÔNG TIN CHUNG

- **HỆ THỐNG PHẦN MỀM:** Nền tảng Quản lý Học vụ & Sổ liên lạc Điện tử Thông minh **GiaoVienHay** (Phục vụ Giáo viên, Học sinh và Phụ huynh Cấp 1 & Cấp 2).
- **MỤC ĐÍCH TÀI LIỆU:** Cung cấp bộ kịch bản kiểm thử nghiệm thu người dùng (UAT) hoàn chỉnh, bám sát 100% kiến trúc vận hành thực tế của hệ thống hiện tại. Tài liệu được thiết kế trực quan, có sẵn tài khoản mẫu, dữ liệu lớp học và các bước thao tác chi tiết để người dùng cuối (Giáo viên, Phụ huynh, Ban Giám Hiệu, QA/QC) có thể cầm thiết bị và thực hiện kiểm thử nghiệm thu ngay lập tức.
- **MÔI TRƯỜNG CÔNG NGHỆ THỰC TẾ:**
  - **Cơ sở dữ liệu (Database):** Supabase PostgreSQL Cloud (Lưu trữ quan hệ: `users`, `classes`, `students`, `attendances`, `scores`, `quizzes`, `remarks`, `exam_reminders`, `notifications`, `system_limits`).
  - **Máy chủ Backend:** NestJS REST API v10, kiến trúc hướng sự kiện `EventEmitter2`, bộ nhớ đệm In-Memory Caching (Redis/RAM), phân quyền nghiêm ngặt theo vai trò (RBAC).
  - **Ứng dụng Di động (Mobile App):** React Native (Expo SDK), hỗ trợ đa nền tảng iOS & Android, giao diện tối ưu theo ngôn ngữ thiết kế sư phạm hiện đại.
- **DANH SÁCH TÀI KHOẢN THỬ NGHIỆM THỰC TẾ (SẴN SÀNG TEST NGAY):**
  - **Tài khoản Giáo viên chủ nhiệm (GVCN):** SĐT `0912345678` | Mật khẩu: `MatKhau123@` (Cô Nguyễn Thị Lan - GVCN Lớp 1A).
  - **Tài khoản Giáo viên bộ môn (GVBM):** SĐT `0912345679` | Mật khẩu: `MatKhau123@` (Thầy Lê Hoàng Nam - GVBM Toán/Tin học).
  - **Tài khoản Phụ huynh học sinh (PHHS):** SĐT `0977112233` | Mật khẩu: `MatKhau123@` (Bác Trần Văn Hùng - Bố em Trần Bảo Nam, Lớp 1A).
  - **Tài khoản Quản trị viên (Admin):** SĐT `0988001122` | Mật khẩu: `MatKhau123@` (Thầy Trần Văn Bình - Ban Giám Hiệu / Quản trị hệ thống).
- **TIÊU CHÍ NGHIỆM THU TỔNG QUAN (ACCEPTANCE CRITERIA):**
  - Giao diện tiếng Việt 100%, từ ngữ sư phạm chuẩn mực, phù hợp môi trường giáo dục Việt Nam.
  - Tốc độ phản hồi tức thì: Các thao tác lưu dữ liệu trên app dưới 1 giây, truy xuất cache danh sách dưới 5ms.
  - Xử lý bất đồng bộ (Non-blocking UI): Điểm danh vắng học phát thông báo đẩy FCM ngầm dưới 2.5 giây mà không làm gián đoạn hay đơ màn hình giáo viên.
  - Bảo toàn dữ liệu lịch sử: Xóa học sinh áp dụng cơ chế Soft Delete (`is_deleted = true`), bảo toàn 100% điểm số và chuyên cần quá khứ.
  - Độ ổn định cao: Không xuất hiện hiện tượng sập ứng dụng (Crash), treo màn hình (Freeze) hay màn hình trắng (White screen).

---

## 2. BẢNG TỔNG HỢP CÁC KỊCH BẢN NGHIỆM THU (UAT SUITE MATRIX)

| Mã UAT | Nhóm Người Dùng | Tính Năng Nghiệm Thu | Kịch Bản Thử Nghiệm Thực Tế | Tiêu Chí Chấp Nhận (Acceptance Criteria) | Đánh Giá |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **UAT01_AUTH_01** | Toàn bộ người dùng | Đăng nhập đa vai trò & Đổi mật khẩu | Đăng nhập bằng SĐT + Mật khẩu (Quick Login 1 chạm), kiểm tra chuyển hướng theo vai trò (GVCN/GVBM/PH/Admin) và đổi mật khẩu an toàn. | Đăng nhập < 1s, hiển thị đúng vai trò và giao diện tương ứng, đổi mật khẩu thành công và cập nhật session. |           |
| **UAT02_GVCN_01** | Giáo viên chủ nhiệm | Phân lớp RBAC, Thêm & Xóa mềm HS | GVCN quản lý Lớp 1A, xem danh sách HS & liên hệ phụ huynh (gọi điện/SMS), thêm HS mới và xóa mềm 1 HS chuyển trường. | Thao tác mượt mà, HS bị xóa ẩn khỏi app nhưng điểm số và chuyên cần quá khứ trong CSDL PostgreSQL được bảo toàn nguyên vẹn. |           |
| **UAT03_GVCN_02** | Giáo viên chủ nhiệm | Điểm danh 1-chạm & Đồng bộ Cache | GVCN điểm danh đầu giờ, chạm chuyển trạng thái có mặt/vắng, bấm Lưu và quan sát thông báo đẩy FCM tới phụ huynh con vắng. | Lưu tức thì không đơ máy, phụ huynh nhận Push Notification < 2.5s, tự động nạp In-Memory Cache (< 5ms) cho vòng quay bài cũ. |           |
| **UAT04_GVCN_03** | Giáo viên chủ nhiệm | Thu phí BHYT, VietQR & Nhắc nộp | GVCN tích chọn cờ BHYT kèm ngày nộp thực tế, tạo mã VietQR chuyển khoản Napas247 và phát thông báo nhắc nhở 5 phụ huynh chưa nộp. | Ghi nhận cờ nộp kèm ngày thực tế, VietQR tự động sinh số tiền và nội dung, thông báo đẩy tới đúng phụ huynh chưa nộp. |           |
| **UAT05_GVCN_04** | Giáo viên chủ nhiệm | Nhận xét HS & Theo dõi "Đã đọc" | GVCN gửi lời khen ngắn gọn cho học sinh tiến bộ về Sổ liên lạc của phụ huynh, theo dõi biểu tượng mắt đọc khi phụ huynh bấm xác nhận. | Văn bản tự nhiên không tag rườm rà, phụ huynh nhận tin tức thì, trạng thái "Đã đọc" phản hồi 2 chiều minh bạch. |           |
| **UAT06_GVBM_01** | Giáo viên bộ môn | Trợ lý AI sinh đề trắc nghiệm | GVBM nạp giáo án, chọn môn, khối, số lượng và độ khó; AI đọc hiểu và trả về bộ 5 câu hỏi trắc nghiệm kèm đáp án và lời giải. | AI sinh câu hỏi < 12 giây, nội dung chuẩn xác sư phạm, cho phép xem trước, chỉnh sửa câu hỏi và lưu vào kho đề. |           |
| **UAT07_GVBM_02** | Giáo viên bộ môn | Vòng quay 3D tên HS & Chấm điểm | GVBM chiếu Vòng quay 3D hiển thị tên học sinh trực tiếp trên nan quạt, tự động lọc HS có mặt, bấm "Skip" khi vắng và chấm điểm miệng. | Đồ họa 3D xoay mượt mà, hiển thị rõ tên học sinh, nút Skip quay tiếp ngay không đơ máy, điểm miệng đồng bộ thẳng vào Sổ điểm. |           |
| **UAT08_GVBM_03** | Giáo viên bộ môn | Chuyển đổi Mini-Game lớp học | GVBM biến bộ câu hỏi thành game Rung Chuông Vàng toàn màn hình, học sinh giơ bảng trả lời, đếm ngược 30s và pháo hoa khen thưởng. | Chuyển đổi 1-chạm tức thì, đồng hồ đếm ngược chuẩn xác, hiệu ứng âm thanh và pháo hoa giấy reo hò sôi nổi. |           |
| **UAT09_GVBM_04** | Giáo viên bộ môn | Sổ điểm đa cột & Chiếu Leaderboard | GVBM nhập điểm 15 phút, bảo lưu điểm gốc không tự tính GPA ảo, chiếu Bảng xếp hạng vinh danh Top 3 và công bố điểm gửi FCM tới cả lớp. | Nhập điểm nhanh nhạy hỗ trợ phím điều hướng, Leaderboard vinh danh cúp vàng đẹp mắt, thông báo điểm mới phát tới phụ huynh cả lớp. |           |
| **UAT10_GVBM_05** | Giáo viên bộ môn | Lời nhắc Lịch kiểm tra định kỳ | GVBM tạo thông báo lịch kiểm tra 1 tiết kèm dặn dò trọng tâm ôn thi gửi broadcast tới toàn bộ phụ huynh trong lớp. | Thông báo lưu vào hệ thống, FCM multicast phát tới 100% phụ huynh học sinh để gia đình đôn đốc con ôn bài. |           |
| **UAT11_PHHS_01** | Phụ huynh học sinh | Đăng nhập & Liên kết Sổ liên lạc | Phụ huynh đăng nhập tài khoản, tra cứu và liên kết con em mình vào ứng dụng Sổ liên lạc điện tử qua Mã học sinh / Mã mời lớp. | Đăng nhập nhanh bằng SĐT, giao diện thân thiện, hiển thị chính xác hồ sơ học sinh và lớp học của con. |           |
| **UAT12_PHHS_02** | Phụ huynh học sinh | Nhận cảnh báo vắng học & Chuyên cần | Phụ huynh nhận tiếng chuông thông báo đẩy khi con vắng học đầu giờ, chạm vào mở thẳng màn hình Lịch sử chuyên cần tháng của con. | Nhận thông báo < 2.5s, Deep link mở đúng trang chuyên cần, giao diện chấm tròn màu sắc minh bạch có/vắng. |           |
| **UAT13_PHHS_03** | Phụ huynh học sinh | Xem Bảng điểm & Xác nhận "Đã đọc" | Phụ huynh mở app xem điểm kiểm tra 15 phút vừa công bố, đọc nhận xét của cô giáo và bấm nút "Xác nhận đã đọc". | Điểm số hiển thị chi tiết theo từng môn, đọc trọn vẹn lời khen, nút "Xác nhận đã đọc" phản hồi tức thì < 1s. |           |
| **UAT14_PHHS_04** | Phụ huynh học sinh | Tra cứu BHYT, Quét VietQR & Nhắc thi | Phụ huynh xem xác nhận đóng BHYT kèm ngày nộp, mở mã VietQR thanh toán học phí tiện lợi và đọc lời dặn dò kiểm tra ngày mai. | Minh bạch tài chính có ngày nộp cụ thể, mã VietQR chuẩn ngân hàng quét chuyển khoản nhanh, lịch thi chi tiết. |           |
| **UAT15_PHHS_05** | Phụ huynh học sinh | Sửa Hồ sơ PH (Live 3D Avatar Preview) | Phụ huynh mở màn hình Cá nhân, mở Bottom Sheet sửa họ tên và email với 3D avatar preview tự động, số điện thoại khóa cố định. | Giao diện hiện đại UI/UX Pro Max, avatar đổi chữ cái trực tiếp khi gõ tên, lưu thành công cập nhật ngay vào CSDL PostgreSQL. |           |
| **UAT16_ADMIN_01** | Quản trị hệ thống | Cấu hình Hạn mức Tài nguyên Hệ thống | Admin cấu hình hạn ngạch gọi AI, sĩ số tối đa/lớp và dung lượng upload tài liệu, kiểm tra hệ thống áp dụng chặn ngay lập tức. | Endpoint `/system-limits` lưu tức thì, middleware áp dụng chặn an toàn khi vượt ngưỡng, bảo vệ máy chủ. |           |
| **UAT17_ADMIN_02** | Quản trị hệ thống | Khóa tài khoản (Ban) & Mở khóa an toàn | Admin khóa tài khoản vi phạm quy tắc học đường, kiểm tra người dùng bị thu hồi phiên tức thì và mở khóa (Unban) phục hồi dữ liệu. | Đặt `is_active = false`, từ chối API với mã HTTP 403, app tự đăng xuất ra màn hình Login, mở khóa lại toàn vẹn 100%. |           |

---

## 3. CHI TIẾT TỪNG KỊCH BẢN NGHIỆM THU

---

### UAT01_AUTH_01 : NGHIỆM THU ĐĂNG NHẬP ĐA VAI TRÒ BẰNG SỐ ĐIỆN THOẠI, QUICK LOGIN 1-CHẠM VÀ THAO TÁC ĐỔI MẬT KHẨU BẢO MẬT

- **VAI TRÒ NGHIỆM THU:** Giáo viên chủ nhiệm (GVCN), Giáo viên bộ môn (GVBM), Phụ huynh học sinh (PHHS) và Quản trị viên (Admin).
- **MÔI TRƯỜNG THỰC TẾ:** Ứng dụng di động GiaoVienHay Mobile App trên thiết bị Android hoặc iOS kết nối mạng 4G/Wi-Fi.
- **BỐI CẢNH NGHIỆP VỤ THỰC TẾ:**
  Người dùng mở ứng dụng lần đầu hoặc sau khi đăng xuất. Người dùng cần đăng nhập nhanh chóng bằng Số điện thoại và Mật khẩu cá nhân, hệ thống tự động nhận diện vai trò và điều hướng vào đúng không gian làm việc. Đồng thời, người dùng có thể thực hiện đổi mật khẩu định kỳ để nâng cao tính bảo mật.
- **DỮ LIỆU CHUẨN BỊ:**
  - Tài khoản GVCN: `0912345678` / `MatKhau123@` (Cô Nguyễn Thị Lan).
  - Tài khoản PHHS: `0977112233` / `MatKhau123@` (Bác Trần Văn Hùng).
  - Tài khoản GVBM: `0912345679` / `MatKhau123@` (Thầy Lê Hoàng Nam).
  - Nút bấm Quick Login có sẵn trên màn hình `LoginScreen`.

- **CÁC BƯỚC THAO TÁC THỰC HIỆN CỦA NGƯỜI DÙNG:**
  1. **Bước 1 (Thử nghiệm tính năng Quick Login):**
     - Mở ứng dụng GiaoVienHay. Tại màn hình Đăng nhập, quan sát vùng phím tắt Quick Login:
     - Chạm nút **"👩‍🏫 Cô Lan (GV)"**: Trường Số điện thoại và Mật khẩu tự động được điền `0912345678` và `MatKhau123@`.
     - Bấm nút màu cam **"Đăng Nhập"**.
     - Quan sát: Ứng dụng phản hồi dưới 1 giây, chuyển hướng thẳng vào **TeacherHomeScreen** của giáo viên với lời chào *"Xin chào, Cô Nguyễn Thị Lan"*.
  2. **Bước 2 (Đăng xuất tài khoản):**
     - Vào tab **"Cá nhân"** (ở thanh điều hướng dưới đáy).
     - Cuộn xuống chân trang, bấm nút màu đỏ **"Đăng xuất"**.
     - Hộp thoại xác nhận xuất hiện: Bấm **"Đồng ý"**. Màn hình quay trở lại `LoginScreen`.
  3. **Bước 3 (Đăng nhập tài khoản Phụ huynh):**
     - Tại `LoginScreen`, chạm nút **"👨‍👩‍👧 Trần Văn Hùng (PH)"** hoặc gõ SĐT `0977112233`, mật khẩu `MatKhau123@`.
     - Bấm **"Đăng Nhập"**.
     - Quan sát: Chuyển hướng vào **ParentHomeScreen** với thẻ học sinh *"Trần Bảo Nam - Lớp 1A"*.
  4. **Bước 4 (Thử nghiệm Đổi mật khẩu):**
     - Vào tab **"Cá nhân"** của phụ huynh, bấm vào mục **"Đổi mật khẩu"**.
     - Modal đổi mật khẩu mở ra: Nhập Mật khẩu hiện tại `MatKhau123@`, nhập Mật khẩu mới `MatKhauMoi456@` và Nhập lại mật khẩu mới.
     - Bấm **"Cập Nhật"**: Hệ thống báo *"Đổi mật khẩu thành công!"*.
     - Đổi lại mật khẩu cũ `MatKhau123@` để phục vụ các bài test tiếp theo.

- **TIÊU CHÍ CHẤP NHẬN ĐẠT CHUẨN (ACCEPTANCE CRITERIA):**
  - [ ] **Tốc độ xác thực:** Đăng nhập thành công và nạp token JWT trong vòng **dưới 1 giây**.
  - [ ] **Nhận diện đúng vai trò (Role Routing):** Tài khoản Giáo viên mở `TeacherHomeScreen`, tài khoản Phụ huynh mở `ParentHomeScreen`.
  - [ ] **Nút Quick Login tiện ích:** Phím tắt điền dữ liệu chuẩn xác, tiết kiệm thời gian gõ cho tester.
  - [ ] **Bảo mật đổi mật khẩu:** Xác thực đúng mật khẩu cũ, kiểm tra khớp mật khẩu mới, cập nhật mã băm an toàn trong CSDL PostgreSQL.

- **KẾT QUẢ ĐÁNH GIÁ CUỐI CÙNG:** 
- **GHI CHÚ / GÓP Ý CẢI TIẾN THÊM TỪ NGƯỜI DÙNG:**
- **XÁC NHẬN NGHIỆM THU:**
  - Đại diện Người dùng: 
  - Đại diện Nhóm Phát Triển: 

---

### UAT02_GVCN_01 : NGHIỆM THU QUẢN LÝ LỚP HỌC (RBAC), DANH SÁCH HỌC SINH, LIÊN HỆ PHỤ HUYNH, THÊM MỚI VÀ XÓA MỀM (SOFT DELETE) BẢO TOÀN DỮ LIỆU

- **VAI TRÒ NGHIỆM THU:** Giáo viên chủ nhiệm (GVCN).
- **MÔI TRƯỜNG THỰC TẾ:** Ứng dụng di động GiaoVienHay Mobile App trên điện thoại Android/iOS.
- **BỐI CẢNH NGHIỆP VỤ THỰC TẾ:**
  Cô giáo chủ nhiệm quản lý sĩ số lớp `1A`. Cô cần tra cứu nhanh thông tin liên lạc của phụ huynh để gọi điện/nhắn tin trao đổi, thêm học sinh mới nhập học vào lớp và thực hiện xóa 1 học sinh chuyển trường ra khỏi danh sách lớp mà vẫn bảo toàn 100% dữ liệu điểm số, chuyên cần cũ trong học bạ của nhà trường.
- **DỮ LIỆU CHUẨN BỊ:**
  - Tài khoản GVCN: `0912345678` (Cô Nguyễn Thị Lan).
  - Lớp chủ nhiệm: `Lớp 1A` (Trường Tiểu Học Chu Văn An).
  - Danh sách học sinh: Em Lê Minh Khôi, Nguyễn Hoàng My, Nguyễn Văn An, Phạm Quỳnh Anh, Trần Bảo Nam...

- **CÁC BƯỚC THAO TÁC THỰC HIỆN CỦA GIÁO VIÊN:**
  1. **Bước 1 (Mở màn hình Quản lý Lớp học):**
     - Đăng nhập tài khoản Cô Lan, tại Trang chủ bấm vào lối tắt **"Lớp học của tôi"** hoặc **"Quản lý lớp"**.
     - Danh sách lớp hiển thị: Mục **"Lớp Chủ Nhiệm"** hiển thị nổi bật thẻ `Lớp 1A` với sĩ số và tên GVCN.
     - Chạm vào thẻ `Lớp 1A` để vào màn hình **ClassManagementScreen**.
  2. **Bước 2 (Tra cứu thông tin liên hệ Phụ huynh):**
     - Tại tab **"Học Sinh"**, quan sát danh sách học sinh kèm thông tin phụ huynh bên dưới (Họ tên bố/mẹ, SĐT).
     - Tìm học sinh `Lê Minh Khôi`, quan sát ô phụ huynh: *"Lê Văn Minh (Bố) - 0933 445 566"*.
     - Bấm nút **"Gọi điện"**: Thiết bị tự động mở trình quay số gọi đến `0933445566`.
     - Bấm nút **"Nhắn tin"**: Thiết bị mở ứng dụng tin nhắn SMS với số điện thoại phụ huynh.
  3. **Bước 3 (Kiểm tra Tab Phân công Giáo viên Bộ môn):**
     - Chuyển sang tab **"Giáo Viên Bộ Môn"**:
     - Hiển thị danh sách các môn được phân công: Môn Tiếng Anh (Cô Phạm Quỳnh Chi), Môn Tin học (Thầy Trần Văn Nam), Môn Âm nhạc (Cô Lê Hồng Mai)...
  4. **Bước 4 (Thử nghiệm Xóa mềm học sinh - Soft Delete):**
     - Trở lại tab **"Học Sinh"**, bấm vào biểu tượng ba chấm `...` bên cạnh học sinh cần xóa (hoặc vuốt để mở tùy chọn).
     - Chọn **"Xóa học sinh khỏi lớp"**.
     - Hộp thoại cảnh báo sư phạm xuất hiện: *"Học sinh sẽ được ẩn khỏi danh sách lớp hiện tại. Điểm số và lịch sử chuyên cần quá khứ sẽ được bảo toàn nguyên vẹn trong hệ thống. Bạn có chắc chắn muốn thực hiện?"*.
     - Bấm **"Xác nhận xóa"**.
     - Quan sát giao diện: Học sinh lập tức biến mất khỏi danh sách lớp, sĩ số giảm đi 1.
  5. **Bước 5 (Đối soát bảo toàn dữ liệu trong CSDL PostgreSQL):**
     - Kiểm tra trực tiếp bảng `students`: Bản ghi học sinh được cập nhật `is_deleted = true` và `deleted_at`, không bị xóa cứng (No hard delete).
     - Toàn bộ điểm số cũ trong bảng `scores` và lịch sử điểm danh trong `attendances` vẫn còn nguyên 100%.

- **TIÊU CHÍ CHẤP NHẬN ĐẠT CHUẨN (ACCEPTANCE CRITERIA):**
  - [ ] **Phân quyền chuẩn RBAC:** GVCN có toàn quyền quản lý học sinh và xem GVBM trong lớp của mình.
  - [ ] **Thao tác liên lạc 1-chạm:** Bấm gọi điện/nhắn tin kết nối chuẩn xác với ứng dụng hệ thống trên máy.
  - [ ] **Cơ chế Soft Delete an toàn:** Học sinh được ẩn tức thì khỏi app nhưng toàn bộ dữ liệu học bạ được lưu trữ an toàn trong PostgreSQL Supabase.

- **KẾT QUẢ ĐÁNH GIÁ CUỐI CÙNG:** 
- **GHI CHÚ / GÓP Ý CẢI TIẾN THÊM TỪ NGƯỜI DÙNG:**
- **XÁC NHẬN NGHIỆM THU:**
  - Đại diện Giáo viên: 
  - Đại diện Nhóm Phát Triển: 

---

### UAT03_GVCN_02 : NGHIỆM THU TÍNH NĂNG ĐIỂM DANH CHUYÊN CẦN 1-CHẠM BẤT ĐỒNG BỘ, PHÁT THÔNG BÁO ĐẨY FCM VẮNG HỌC VÀ ĐỒNG BỘ IN-MEMORY CACHE

- **VAI TRÒ NGHIỆM THU:** Giáo viên chủ nhiệm (GVCN).
- **MÔI TRƯỜNG THỰC TẾ:** Điện thoại di động của GVCN chạy app GiaoVienHay tại cửa lớp học qua mạng 4G/Wi-Fi.
- **BỐI CẢNH NGHIỆP VỤ THỰC TẾ:**
  Đầu giờ học buổi sáng (7h15), cô giáo chủ nhiệm mở ứng dụng để điểm danh nhanh lớp `1A`. Toàn bộ học sinh mặc định được đánh dấu "Có mặt" màu xanh. Cô chỉ mất 20 giây để quan sát chỗ ngồi trống, chạm 1-lần để chuyển trạng thái cho 1 bạn vắng có phép và 1 bạn vắng không phép, sau đó bấm nút "Lưu kết quả điểm danh". Hệ thống lưu dữ liệu tức thì không đơ máy, phát cảnh báo ngầm tới điện thoại phụ huynh con vắng và nạp In-Memory Cache cho Vòng quay bài cũ của các tiết sau.
- **DỮ LIỆU CHUẨN BỊ:**
  - Lớp: `Lớp 1A`.
  - Học sinh vắng có phép: Em Nguyễn Hoàng My (`ABSENT_EXCUSED`).
  - Học sinh vắng không phép: Em Trần Bảo Nam (`ABSENT_UNEXCUSED`).
  - Điện thoại phụ huynh em Trần Bảo Nam (SĐT `0977112233`) đang để ở chế độ chờ.

- **CÁC BƯỚC THAO TÁC THỰC HIỆN CỦA GIÁO VIÊN:**
  1. **Bước 1 (Mở màn hình Điểm danh):**
     - Đăng nhập tài khoản Cô Lan, tại Trang chủ bấm vào mục **"Điểm danh"** (hoặc chọn Lớp 1A $\rightarrow$ Điểm danh).
     - Màn hình **AttendanceScreen** mở ra: Danh sách học sinh hiển thị sẵn với trạng thái màu xanh lá cây **"Có mặt"** (`PRESENT`).
  2. **Bước 2 (Chạm 1-chạm chuyển trạng thái học sinh vắng):**
     - Chạm vào dòng tên em `Nguyễn Hoàng My`: Trạng thái chuyển sang huy hiệu màu vàng **"Vắng có phép"**.
     - Chạm 2 lần vào dòng tên em `Trần Bảo Nam`: Trạng thái chuyển sang huy hiệu màu đỏ **"Vắng không phép"**.
     - Thanh thống kê sĩ số trên đỉnh tự động cập nhật: `Có mặt: 5 | Vắng: 2 (1 có phép, 1 không phép)`.
  3. **Bước 3 (Bấm lưu kết quả điểm danh):**
     - Cô giáo bấm nút màu cam **"Lưu điểm danh"**.
     - Ứng dụng thông báo *"Lưu điểm danh thành công"* ngay lập tức (< 1 giây), không có biểu tượng xoay chờ mạng lâu làm đơ màn hình.
  4. **Bước 4 (Đối soát thiết bị Phụ huynh & Cache ngầm):**
     - Cầm điện thoại phụ huynh em Trần Bảo Nam: Quan sát nhận thông báo đẩy FCM trong vòng 2.5 giây với nội dung: *"Thông báo chuyên cần: Em Trần Bảo Nam vắng mặt không phép buổi học sáng nay..."*.
     - Phụ huynh của các em có mặt không bị nhận thông báo làm phiền.
     - Dữ liệu chuyên cần được ghi vào bảng `attendances` trong CSDL và nạp vào In-Memory Cache sẵn sàng cho Vòng quay gọi bài cũ.

- **TIÊU CHÍ CHẤP NHẬN ĐẠT CHUẨN (ACCEPTANCE CRITERIA):**
  - [ ] **Thao tác 1-chạm mượt mà:** Chuyển đổi trạng thái nhạy bén giữa Có mặt ➔ Vắng có phép ➔ Vắng không phép ➔ Trễ.
  - [ ] **Kiến trúc bất đồng bộ (Non-blocking):** Giao diện app phản hồi lưu thành công tức thì; backend phát sự kiện ngầm gửi FCM không làm treo app giáo viên.
  - [ ] **Tốc độ Push Notification:** Phụ huynh em vắng nhận được thông báo đẩy trên thanh trạng thái điện thoại trong vòng **dưới 2.5 giây**.
  - [ ] **Đồng bộ In-Memory Cache:** Tự động nạp danh sách học sinh có mặt vào RAM cache phục vụ Vòng quay bài cũ với độ trễ < 5ms.

- **KẾT QUẢ ĐÁNH GIÁ CUỐI CÙNG:** 
- **GHI CHÚ / GÓP Ý CẢI TIẾN THÊM TỪ NGƯỜI DÙNG:**
- **XÁC NHẬN NGHIỆM THU:**
  - Đại diện Giáo viên Chủ nhiệm: 
  - Đại diện Nhóm Phát Triển: 

---

### UAT04_GVCN_03 : NGHIỆM THU QUẢN LÝ THU PHÍ & BẢO HIỂM Y TẾ (TÍCH CHỌN NGÀY NỘP THỰC TẾ), TẠO MÃ VIETQR CHUẨN NAPAS247 VÀ GỬI THÔNG BÁO NHẮC NỘP PHÍ

- **VAI TRÒ NGHIỆM THU:** Giáo viên chủ nhiệm (GVCN).
- **MÔI TRƯỜNG THỰC TẾ:** Ứng dụng di động GiaoVienHay Mobile App trên điện thoại hoặc máy tính bảng của GVCN.
- **BỐI CẢNH NGHIỆP VỤ THỰC TẾ:**
  Nhà trường triển khai thu Bảo hiểm Y tế (BHYT) và Quỹ bán trú đợt 1. Phụ huynh nộp tiền mặt hoặc chuyển khoản trực tiếp cho GVCN. GVCN mở màn hình Thu phí & BHYT, tích chọn hoàn thành cho học sinh đã nộp (hệ thống lưu ngày nộp thực tế), mở mã VietQR chuyển khoản chuẩn ngân hàng để phụ huynh quét mã tiện lợi, sau đó lọc danh sách học sinh chưa nộp để bấm nút gửi thông báo nhắc nhở tức thì.
- **DỮ LIỆU CHUẨN BỊ:**
  - Lớp: `Lớp 1A`.
  - Khoản thu: Bảo hiểm Y tế (BHYT) số tiền `850.000 VNĐ`.
  - Học sinh đã nộp: Em Lê Minh Khôi.
  - Học sinh chưa nộp: Em Vũ Đức Trọng, Nguyễn Văn An...

- **CÁC BƯỚC THAO TÁC THỰC HIỆN CỦA GIÁO VIÊN:**
  1. **Bước 1 (Mở màn hình Thu phí & BHYT):**
     - Đăng nhập tài khoản Cô Lan, chọn mục **"Thu phí & BHYT"** từ màn hình chính.
     - Màn hình **FeesInsuranceScreen** mở ra hiển thị danh sách học sinh kèm trạng thái các khoản thu: `Bảo hiểm Y tế`, `Học phí / Bán trú`.
  2. **Bước 2 (Tích chọn xác nhận nộp phí kèm ngày nộp):**
     - Tìm học sinh `Lê Minh Khôi`, chạm vào ô chuyển trạng thái nộp BHYT.
     - Ô trạng thái chuyển sang màu xanh lá cây kèm nhãn ngày nộp hôm nay (ví dụ: `25/10/2026`).
     - Thử chọn điều chỉnh ngày nộp về ngày thực tế phụ huynh đã đóng $\rightarrow$ Lưu thành công.
  3. **Bước 3 (Xem mã VietQR chuyển khoản ngân hàng):**
     - Bấm vào nút **"Mã VietQR Chuyển Khoản"** trên màn hình.
     - Modal hiển thị mã QR chuẩn Napas247 của nhà trường / lớp học kèm thông tin: Tên ngân hàng, Số tài khoản, Tên người thụ hưởng, Số tiền chuẩn và Cú pháp nội dung chuyển khoản tự động.
     - Bấm nút **"Chia sẻ mã QR"** để gửi vào nhóm Zalo phụ huynh của lớp.
  4. **Bước 4 (Lọc danh sách chưa nộp & Gửi thông báo nhắc nhở):**
     - Sử dụng bộ lọc nhanh: Chọn tab **"Chưa hoàn thành"**.
     - Danh sách thu gọn lại hiển thị các học sinh còn thiếu phí.
     - Bấm nút **"Gửi nhắc nhở tới Phụ huynh"**.
     - Pop-up xác nhận xuất hiện: Bấm **"Xác nhận gửi"**.
     - Hệ thống phát thông báo FCM tới đúng các phụ huynh có con chưa đóng phí.

- **TIÊU CHÍ CHẤP NHẬN ĐẠT CHUẨN (ACCEPTANCE CRITERIA):**
  - [ ] **Minh bạch tài chính:** Trạng thái lưu cờ boolean kèm ngày nộp cụ thể, hỗ trợ đối soát sổ sách kế toán thuận tiện.
  - [ ] **Tiện ích VietQR chuẩn Napas247:** Mã QR hiển thị rõ nét, quét thử qua ứng dụng ngân hàng tự động điền đúng số tiền và nội dung.
  - [ ] **Gửi đúng đối tượng:** Thông báo nhắc nhở chỉ phát tới phụ huynh chưa nộp phí, không làm phiền phụ huynh đã hoàn thành.

- **KẾT QUẢ ĐÁNH GIÁ CUỐI CÙNG:** 
- **GHI CHÚ / GÓP Ý CẢI TIẾN THÊM TỪ NGƯỜI DÙNG:**
- **XÁC NHẬN NGHIỆM THU:**
  - Đại diện Giáo viên Chủ nhiệm: 
  - Đại diện Nhóm Phát Triển: 

---

### UAT05_GVCN_04 : NGHIỆM THU NHẬP LỜI NHẬN XÉT HỌC SINH (TEXT THUẦN TÚY) GỬI VỀ SỔ LIÊN LẠC VÀ THEO DÕI XÁC NHẬN "ĐÃ ĐỌC" 2 CHIỀU

- **VAI TRÒ NGHIỆM THU:** Giáo viên chủ nhiệm (GVCN) hoặc Giáo viên bộ môn (GVBM).
- **MÔI TRƯỜNG THỰC TẾ:** Ứng dụng di động GiaoVienHay Mobile App trên điện thoại giáo viên và phụ huynh.
- **BỐI CẢNH NGHIỆP VỤ THỰC TẾ:**
  Trong buổi học, em Trần Bảo Nam có tiến bộ vượt bậc, hăng hái xung phong phát biểu và viết chữ rất sạch đẹp. Cô giáo muốn gửi ngay lời khen ngợi chân thành bằng câu chữ tự nhiên về Sổ liên lạc của bố mẹ em để gia đình chung vui, khích lệ con. Khi phụ huynh mở app đọc xong và bấm nút "Xác nhận đã đọc", cô giáo có thể theo dõi được ngay trên màn hình quản lý.
- **DỮ LIỆU CHUẨN BỊ:**
  - Học sinh: Trần Bảo Nam (`std_01`), Lớp 1A.
  - Nội dung nhận xét: *"Hôm nay Bảo Nam rất hăng hái giơ tay xây dựng bài Toán, viết chữ ngay ngắn sạch đẹp. Cô khen ngợi con!"*.
  - Điện thoại phụ huynh Bác Trần Văn Hùng (`0977112233`).

- **CÁC BƯỚC THAO TÁC THỰC HIỆN CỦA GIÁO VIÊN & PHỤ HUYNH:**
  1. **Bước 1 (Giáo viên soạn nhận xét trên App):**
     - Đăng nhập tài khoản Cô Lan, mở màn hình **RemarksExamScreen** (hoặc vào Lớp 1A $\rightarrow$ Nhận xét học sinh).
     - Chọn học sinh `Trần Bảo Nam`, bấm **"Thêm nhận xét mới"**.
     - Nhập nội dung văn bản thuần túy vào khung soạn thảo (không cần gắn thẻ tags cứng nhắc).
     - Bấm nút màu cam **"Gửi nhận xét tới Phụ huynh"**.
  2. **Bước 2 (Kiểm tra phía Phụ huynh tiếp nhận):**
     - Điện thoại phụ huynh Bác Trần Văn Hùng nhận được thông báo đẩy kèm chuông báo.
     - Chạm vào thông báo: Mở thẳng vào màn hình Sổ liên lạc của em Bảo Nam $\rightarrow$ Mục **"Nhận xét của cô"**.
     - Bác Hùng đọc trọn vẹn đoạn văn bản nhận xét kèm mốc thời gian gửi của cô giáo.
  3. **Bước 3 (Phụ huynh bấm xác nhận đã đọc):**
     - Dưới nhận xét có nút **"Xác nhận đã đọc"**. Phụ huynh bấm vào nút này.
     - Nút chuyển sang trạng thái tích xanh: *"Đã đọc lúc [Thời gian]"*.
  4. **Bước 4 (Giáo viên kiểm tra phản hồi):**
     - Cô giáo tải lại màn hình nhận xét của em Nam: Thấy biểu tượng mắt đọc màu xanh hiển thị *"Phụ huynh đã đọc"*.

- **TIÊU CHÍ CHẤP NHẬN ĐẠT CHUẨN (ACCEPTANCE CRITERIA):**
  - [ ] **Văn bản tự nhiên chuẩn sư phạm:** Hỗ trợ tiếng Việt có dấu đầy đủ, câu chữ tự nhiên không bị gò bó bởi nhãn tag.
  - [ ] **Tốc độ thông báo:** Phụ huynh nhận thông báo đẩy trong vòng **dưới 2 giây**.
  - [ ] **Phản hồi 2 chiều minh bạch:** Cơ chế "Đã đọc" cập nhật trạng thái tức thì giữa hai bên, lưu an toàn vào bảng `remarks` trong PostgreSQL.

- **KẾT QUẢ ĐÁNH GIÁ CUỐI CÙNG:** 
- **GHI CHÚ / GÓP Ý CẢI TIẾN THÊM TỪ NGƯỜI DÙNG:**
- **XÁC NHẬN NGHIỆM THU:**
  - Đại diện Giáo viên: 
  - Đại diện Phụ huynh: 
  - Đại diện Nhóm Phát Triển: 

---

### UAT06_GVBM_01 : NGHIỆM THU TRỢ GIẢNG AI SINH CÂU HỎI TRẮC NGHIỆM BÀI CŨ THEO MÔN, KHỐI VÀ ĐỘ KHÓ TÙY CHỌN

- **VAI TRÒ NGHIỆM THU:** Giáo viên bộ môn (GVBM) hoặc Giáo viên chủ nhiệm (GVCN).
- **MÔI TRƯỜNG THỰC TẾ:** Ứng dụng di động hoặc Web của giáo viên kết nối mạng Internet.
- **BỐI CẢNH NGHIỆP VỤ THỰC TẾ:**
  Để khởi động tiết học 5 phút kiểm tra bài cũ, thầy giáo mở tính năng Trợ lý AI trên app để tự động sinh 5 câu hỏi trắc nghiệm bám sát nội dung bài học. Thầy chọn môn học, khối lớp, độ khó và chủ đề bài giảng, AI (Google Gemini / NVIDIA API) đọc hiểu và sinh ra bộ câu hỏi chuẩn sư phạm kèm đáp án A, B, C, D và lời giải chi tiết.
- **DỮ LIỆU CHUẨN BỊ:**
  - Môn học: `Toán học` (hoặc `Khoa học tự nhiên`).
  - Khối: `Khối 6` (hoặc `Khối 1`).
  - Chủ đề: `Phép cộng và trừ phân số`.
  - Cấu hình: `5 câu hỏi`, Độ khó: `Vừa (MEDIUM)`.

- **CÁC BƯỚC THAO TÁC THỰC HIỆN CỦA GIÁO VIÊN:**
  1. **Bước 1 (Mở màn hình Trợ giảng AI Soạn đề):**
     - Đăng nhập tài khoản Thầy Nam (GVBM), mở mục **"Trợ giảng AI / Soạn bài cũ"** (`QuizGenScreen`).
     - Chọn Môn học: `Toán học`.
     - Chọn Số lượng câu: `5 câu`.
     - Chọn Độ khó: `Vừa`.
     - Nhập chủ đề hoặc tải tệp tài liệu tóm tắt bài giảng.
  2. **Bước 2 (Kích hoạt sinh câu hỏi bằng AI):**
     - Bấm nút màu cam **"Bắt đầu sinh câu hỏi bằng AI"**.
     - Màn hình hiển thị animation tiến trình sinh câu hỏi thông minh.
     - Bấm đồng hồ bấm giờ: Thời gian xử lý hoàn tất trong vòng dưới 12 giây.
  3. **Bước 3 (Xem trước, duyệt và chỉnh sửa câu hỏi):**
     - Danh sách 5 câu hỏi hiển thị rõ ràng với 4 phương án A, B, C, D, đáp án đúng được tô nổi bật kèm giải thích ngắn gọn.
     - Thầy giáo thử bấm vào câu số 2 để sửa lại một từ trong phương án A $\rightarrow$ Lưu chỉnh sửa thành công.
     - Bấm nút **"Lưu bộ câu hỏi vào kho đề"** (lưu an toàn vào bảng `quizzes` trong CSDL).

- **TIÊU CHÍ CHẤP NHẬN ĐẠT CHUẨN (ACCEPTANCE CRITERIA):**
  - [ ] **Tốc độ xử lý của AI:** Đọc hiểu và sinh hoàn chỉnh 5 câu hỏi trong vòng **dưới 12 giây**.
  - [ ] **Chuẩn kiến thức sư phạm:** Câu hỏi bám sát chủ đề bài học, ngôn ngữ sư phạm chuẩn mực, không bị ảo giác (hallucination).
  - [ ] **Linh hoạt biên tập:** Cho phép giáo viên chỉnh sửa câu chữ, đổi đáp án và lưu lại ngay lập tức.

- **KẾT QUẢ ĐÁNH GIÁ CUỐI CÙNG:** 
- **GHI CHÚ / GÓP Ý CẢI TIẾN THÊM TỪ NGƯỜI DÙNG:**
- **XÁC NHẬN NGHIỆM THU:**
  - Đại diện Giáo viên Bộ môn: 
  - Đại diện Nhóm Phát Triển: 

---

### UAT07_GVBM_02 : NGHIỆM THU VÒNG QUAY MAY MẮN 3D (HIỂN THỊ TÊN HỌC SINH LÊN VÒNG QUAY), NÚT BỎ QUA (SKIP) VÀ CHẤM ĐIỂM MIỆNG TRỰC TIẾP VÀO SỔ ĐIỂM

- **VAI TRÒ NGHIỆM THU:** Giáo viên bộ môn (GVBM) hoặc Giáo viên chủ nhiệm (GVCN).
- **MÔI TRƯỜNG THỰC TẾ:** Ứng dụng di động GiaoVienHay trên máy tính bảng hoặc điện thoại kết nối Máy chiếu / Tivi bục giảng lớp học.
- **BỐI CẢNH NGHIỆP VỤ THỰC TẾ:**
  Đầu tiết học, thầy giáo mở Vòng quay may mắn (`WheelScreen`) chiếu lên màn hình TV lớp học để gọi ngẫu nhiên học sinh lên bảng kiểm tra bài cũ. Giao diện 3D rực rỡ chuẩn UI/UX Pro Max, tên học sinh được hiển thị trực tiếp và rõ ràng trên từng nan quạt của vòng quay. Vòng quay tự động loại trừ học sinh đã được điểm danh vắng mặt sáng nay. Khi quay trúng một bạn đột xuất xin ra ngoài phòng y tế, thầy giáo bấm nút "Bỏ qua (Skip)" để vòng quay lập tức quay tiếp mà không bị đứng hình. Học sinh trả lời đúng, thầy chấm điểm 10 và điểm được lưu thẳng vào Sổ điểm môn học.
- **DỮ LIỆU CHUẨN BỊ:**
  - Lớp: `Lớp 1A`.
  - Danh sách học sinh có mặt nạp từ In-Memory Cache (loại trừ các học sinh vắng đã điểm danh ở UAT03).
  - Điểm chấm: `10.0` điểm vào cột Kiểm tra miệng.

- **CÁC BƯỚC THAO TÁC THỰC HIỆN CỦA GIÁO VIÊN:**
  1. **Bước 1 (Khởi chạy Vòng quay may mắn 3D):**
     - Đăng nhập tài khoản Thầy Nam (hoặc Cô Lan), chọn Lớp 1A, mở mục **"Dò bài cũ / Vòng quay may mắn"** (`WheelScreen`).
     - Quan sát đồ họa Vòng quay 3D:
       - Tên của các học sinh có mặt được khắc chữ sắc nét trực tiếp lên từng nan quạt màu sắc của vòng quay.
       - Tên học sinh vắng sáng nay (Trần Bảo Nam, Nguyễn Hoàng My) hoàn toàn không xuất hiện trên vòng quay.
  2. **Bước 2 (Thực hiện quay số lượt 1):**
     - Thầy giáo chạm nút **"Quay số"**.
     - Vòng quay chuyển động xoay 3D tít và mượt mà kèm âm thanh hồi hộp. Kim chỉ dừng lại ở tên em `Lê Minh Khôi`.
  3. **Bước 3 (Thử nghiệm nút Bỏ qua - Skip):**
     - Giả định em Khôi vừa xin phép ra ngoài phòng y tế.
     - Thầy giáo bấm ngay nút **"Bỏ qua (Skip)"**.
     - Quan sát phản hồi: Hệ thống bỏ qua em Khôi và tự động kích hoạt lượt quay mới ngay lập tức mà không bị đơ, không bị treo app.
  4. **Bước 4 (Chấm điểm trực tiếp tại lớp):**
     - Vòng quay dừng lại ở tên em `Phạm Quỳnh Anh`. Quỳnh Anh lên bảng trả lời xuất sắc câu hỏi bài cũ.
     - Thầy giáo nhập điểm `10.0` trên bảng chấm điểm nhanh (giao diện đã được dọn sạch các ô điểm số thừa 6, 7, 8, 9 theo đúng chuẩn tối giản).
     - Bấm nút **"Lưu điểm vào sổ"**.
  5. **Bước 5 (Kiểm tra đồng bộ Sổ điểm):**
     - Mở màn hình Sổ điểm môn học: Điểm 10.0 của em Phạm Quỳnh Anh đã xuất hiện ngay tại cột Điểm miệng (`ORAL`) mà thầy giáo không cần phải mở sổ ghi chép lại thủ công.

- **TIÊU CHÍ CHẤP NHẬN ĐẠT CHUẨN (ACCEPTANCE CRITERIA):**
  - [ ] **Đồ họa 3D hiển thị tên học sinh:** Tên học sinh hiển thị trực tiếp lên từng nan quạt của vòng quay, thẩm mỹ cao chuẩn UI/UX Pro Max.
  - [ ] **Lọc danh sách chuyên cần:** Tự động lấy danh sách học sinh có mặt từ In-Memory Cache, không đưa học sinh vắng mặt vào vòng quay.
  - [ ] **Nút Bỏ qua (Skip) nhạy bén:** Bấm Skip là vòng quay xoay tiếp lượt mới ngay tức thì, không giật lag hay treo màn hình.
  - [ ] **Đồng bộ Sổ điểm trực tiếp:** Điểm số được lưu thẳng vào bảng `scores` trong CSDL PostgreSQL Supabase.

- **KẾT QUẢ ĐÁNH GIÁ CUỐI CÙNG:** 
- **GHI CHÚ / GÓP Ý CẢI TIẾN THÊM TỪ NGƯỜI DÙNG:**
- **XÁC NHẬN NGHIỆM THU:**
  - Đại diện Giáo viên Bộ môn: 
  - Đại diện Nhóm Phát Triển: 

---

### UAT08_GVBM_03 : NGHIỆM THU TÍNH NĂNG CHUYỂN ĐỔI BỘ CÂU HỎI THÀNH MINI-GAME LỚP HỌC (RUNG CHUÔNG VÀNG / HỘP QUÀ / ĐUA XE) TRÌNH CHIẾU FULLSCREEN

- **VAI TRÒ NGHIỆM THU:** Giáo viên bộ môn (GVBM) hoặc Giáo viên chủ nhiệm (GVCN).
- **MÔI TRƯỜNG THỰC TẾ:** Tablet hoặc Laptop kết nối Máy chiếu / Tivi tương tác thông minh tại lớp học.
- **BỐI CẢNH NGHIỆP VỤ THỰC TẾ:**
  Vào tiết học buổi chiều, giáo viên muốn tạo không khí học tập sôi nổi cho cả lớp bằng cách bấm nút "Biến thành Trò chơi (Gamify)" để nạp bộ câu hỏi vào chế độ **Rung Chuông Vàng**. Giáo viên bật chế độ trình chiếu toàn màn hình để toàn thể học sinh cùng tham gia giơ bảng chọn đáp án A, B, C, D. Khi hết giờ đếm ngược 30 giây, giáo viên mở đáp án, hệ thống kích hoạt hiệu ứng pháo hoa và âm thanh reo hò rộn rã.
- **DỮ LIỆU CHUẨN BỊ:**
  - Bộ 5 câu hỏi trắc nghiệm đã tạo từ Trợ lý AI.
  - Chế độ lựa chọn: **Rung Chuông Vàng** (`GOLDEN_BELL`).
  - Thời gian đếm ngược: 30 giây/câu.

- **CÁC BƯỚC THAO TÁC THỰC HIỆN CỦA GIÁO VIÊN:**
  1. **Bước 1 (Chọn chế độ Mini-Game):**
     - Tại màn hình bộ câu hỏi, bấm nút nổi bật **"Biến thành Trò chơi (Gamify)"** (`GameSelectScreen`).
     - Chọn biểu tượng **"Rung Chuông Vàng"** (hoặc Mở Hộp Quà Bí Mật, Đua Xe).
     - Bấm nút **"Bắt đầu trò chơi"**.
  2. **Bước 2 (Trình chiếu toàn màn hình):**
     - Bấm nút Fullscreen: Màn hình mở rộng tối đa không viền đen.
     - Nhạc nền mở màn sôi động vang lên kích thích sự hào hứng của học sinh.
     - Bấm **"Bắt đầu Câu 1"**.
  3. **Bước 3 (Vận hành câu hỏi & Đếm ngược 30s):**
     - Nội dung câu hỏi và 4 ô đáp án A, B, C, D hiển thị to rõ trên bảng lớp.
     - Đồng hồ đếm ngược 30 giây bắt đầu chạy kèm tiếng tích-tắc dồn dập.
     - Học sinh dưới lớp suy nghĩ và giơ bảng con ghi đáp án.
  4. **Bước 4 (Công bố đáp án đúng & Hiệu ứng khen thưởng):**
     - Hết 30 giây, tiếng chuông "Keng keng keng" vang lên báo hiệu hết giờ giơ bảng.
     - Giáo viên chạm mở đáp án: Ô đáp án đúng phát sáng viền vàng rực rỡ, hiệu ứng pháo hoa giấy (confetti) bắn tung tóe kèm âm thanh vỗ tay tán thưởng vang dội.
     - Bấm chuyển sang câu tiếp theo.

- **TIÊU CHÍ CHẤP NHẬN ĐẠT CHUẨN (ACCEPTANCE CRITERIA):**
  - [ ] **Chuyển đổi 1-chạm:** Biến bộ câu hỏi thành game hoàn tất trong vòng **dưới 1 giây**.
  - [ ] **Giao diện trực quan lớp học:** Chữ to rõ ràng, học sinh ngồi cuối lớp vẫn nhìn thấy rõ nét.
  - [ ] **Đồng hồ đếm ngược chuẩn xác:** Đếm chuẩn từng giây, có âm thanh cảnh báo ở 5 giây cuối.
  - [ ] **Hiệu ứng khen thưởng sống động:** Pháo hoa confetti và âm thanh reo hò tạo không khí học tập phấn khởi, hào hứng.

- **KẾT QUẢ ĐÁNH GIÁ CUỐI CÙNG:** 
- **GHI CHÚ / GÓP Ý CẢI TIẾN THÊM TỪ NGƯỜI DÙNG:**
- **XÁC NHẬN NGHIỆM THU:**
  - Đại diện Giáo viên: 
  - Đại diện Nhóm Phát Triển: 

---

### UAT09_GVBM_04 : NGHIỆM THU SỔ ĐIỂM ĐIỆN TỬ ĐA CỘT THÀNH PHẦN (KHÔNG TỰ TÍNH GPA), TRÌNH CHIẾU BẢNG XẾP HẠNG (LEADERBOARD) VÀ CÔNG BỐ ĐIỂM GỬI FCM

- **VAI TRÒ NGHIỆM THU:** Giáo viên bộ môn (GVBM) hoặc Giáo viên chủ nhiệm (GVCN).
- **MÔI TRƯỜNG THỰC TẾ:** Ứng dụng di động hoặc Web của giáo viên kết nối máy chiếu lớp học.
- **BỐI CẢNH NGHIỆP VỤ THỰC TẾ:**
  Sau khi chấm xong bài kiểm tra 15 phút môn Toán của lớp `1A`, thầy giáo mở Sổ điểm điện tử (`GradebookScreen`) để nhập điểm cho học sinh theo thang điểm 10 (bước nhảy 0.1). Hệ thống lưu trữ trung thực các cột điểm thành phần và không tự ý tính điểm trung bình (GPA). Sau đó, thầy bật tính năng "Trình chiếu Bảng Xếp Hạng" lên màn hình lớp để vinh danh các bạn đạt điểm 10 với hoa điểm mười. Cuối cùng, thầy bấm nút "Công bố điểm" để phát thông báo tới điện thoại của toàn thể phụ huynh trong lớp.
- **DỮ LIỆU CHUẨN BỊ:**
  - Lớp: `Lớp 1A`, Môn: `Toán học`.
  - Cột điểm thành phần: `Kiểm tra 15 phút` (`TEST_15P`).
  - Điểm số nhập thử nghiệm: Em Lê Minh Khôi: 10.0, Em Phạm Quỳnh Anh: 9.5, Em Nguyễn Văn An: 8.5...

- **CÁC BƯỚC THAO TÁC THỰC HIỆN CỦA GIÁO VIÊN:**
  1. **Bước 1 (Mở Sổ điểm & Nhập điểm thành phần):**
     - Đăng nhập tài khoản Thầy Nam, mở mục **"Sổ điểm điện tử"** (`GradebookScreen`).
     - Chọn Lớp `1A`, Môn `Toán học`, chọn cột điểm **"Kiểm tra 15 phút"**.
     - Nhập nhanh điểm số cho từng học sinh theo danh sách.
     - Bấm nút màu cam **"Lưu bảng điểm"**.
  2. **Bước 2 (Trình chiếu Bảng xếp hạng - Leaderboard):**
     - Nhấn nút **"Trình chiếu Bảng Xếp Hạng Môn Học"**.
     - Màn hình chuyển sang chế độ Fullscreen hiển thị giao diện **Leaderboard**:
       - Bục vinh danh hiển thị Top 1, Top 2, Top 3 kèm cúp vàng và hoa điểm 10 rực rỡ.
       - Biểu đồ phổ điểm trực quan phân bố tỷ lệ Giỏi, Khá, Trung bình của lớp.
  3. **Bước 3 (Công bố điểm gửi Phụ huynh):**
     - Thầy giáo bấm nút **"Công bố điểm kiểm tra 15 phút"**.
     - Cảnh báo xác nhận xuất hiện: Bấm **"Xác nhận công bố"**.
  4. **Bước 4 (Kiểm tra thông báo phía Phụ huynh):**
     - Cầm điện thoại phụ huynh: Xuất hiện thông báo đẩy FCM *"Điểm mới môn Toán: Em Lê Minh Khôi đạt 10.0 điểm trong bài kiểm tra 15 phút..."*.

- **TIÊU CHÍ CHẤP NHẬN ĐẠT CHUẨN (ACCEPTANCE CRITERIA):**
  - [ ] **Nhập điểm nhanh nhạy:** Hỗ trợ kiểm tra hợp lệ thang điểm từ 0.0 đến 10.0, báo đỏ nếu nhập quá 10.
  - [ ] **Không tự ý tính GPA:** Hệ thống lưu đúng các đầu điểm thành phần vào bảng `scores`, không tự ý tính GPA sai quy chế Bộ GD&ĐT.
  - [ ] **Leaderboard tôn vinh học tập:** Bục vinh danh hoa điểm 10 trang trọng, truyền cảm hứng thi đua học tốt.
  - [ ] **Công bố điểm có kiểm soát:** Chỉ khi giáo viên bấm "Công bố điểm" thì phụ huynh mới nhận được thông báo và xem được trên app.

- **KẾT QUẢ ĐÁNH GIÁ CUỐI CÙNG:** 
- **GHI CHÚ / GÓP Ý CẢI TIẾN THÊM TỪ NGƯỜI DÙNG:**
- **XÁC NHẬN NGHIỆM THU:**
  - Đại diện Giáo viên Bộ môn: 
  - Đại diện Phụ huynh Học sinh: 
  - Đại diện Nhóm Phát Triển: 

---

### UAT10_GVBM_05 : NGHIỆM THU TÍNH NĂNG TẠO LỜI NHẮC LỊCH KIỂM TRA ĐỊNH KỲ PHÁT THÔNG BÁO ĐẨY BROADCAST TỚI TOÀN THỂ PHỤ HUYNH

- **VAI TRÒ NGHIỆM THU:** Giáo viên bộ môn (GVBM) hoặc Giáo viên chủ nhiệm (GVCN).
- **MÔI TRƯỜNG THỰC TẾ:** Ứng dụng di động GiaoVienHay trên điện thoại giáo viên.
- **BỐI CẢNH NGHIỆP VỤ THỰC TẾ:**
  Còn 2 ngày nữa là đến bài kiểm tra định kỳ môn Tiếng Anh. Để học sinh không bị quên bài và phụ huynh có thể chủ động sắp xếp thời gian kèm con ôn luyện tại nhà, cô giáo tạo một thông báo lời nhắc lịch kiểm tra trên hệ thống, nêu rõ môn thi, ngày thi và những nội dung trọng tâm cần học thuộc. Toàn thể phụ huynh lớp `1A` sẽ nhận được thông báo đẩy trên điện thoại.
- **DỮ LIỆU CHUẨN BỊ:**
  - Lớp: `Lớp 1A`.
  - Môn học: `Tiếng Anh`.
  - Loại bài kiểm tra: `Kiểm tra 1 tiết định kỳ`.
  - Ngày kiểm tra: `28/10/2026`.
  - Lời dặn dò trọng tâm: *"Thứ Tư ngày 28/10 lớp có bài kiểm tra định kỳ Tiếng Anh. Bố mẹ nhắc con ôn kỹ từ vựng Unit 1, 2 và chuẩn bị bút chì."*.

- **CÁC BƯỚC THAO TÁC THỰC HIỆN CỦA GIÁO VIÊN:**
  1. **Bước 1 (Mở chức năng Tạo lời nhắc kiểm tra):**
     - Mở mục **"Lời nhắc lịch kiểm tra"** trong `RemarksExamScreen`.
     - Bấm nút **"Tạo lời nhắc mới"**.
  2. **Bước 2 (Thiết lập thông tin bài kiểm tra):**
     - Chọn Môn học: `Tiếng Anh`.
     - Chọn Loại kiểm tra: `Kiểm tra 1 tiết (45 phút)`.
     - Chọn Ngày kiểm tra: `28/10/2026`.
     - Nhập nội dung dặn dò ôn thi vào khung văn bản.
  3. **Bước 3 (Gửi phát thông báo):**
     - Bấm nút **"Gửi lời nhắc tới toàn thể Phụ huynh"**.
     - Hệ thống thông báo gửi thành công và hiển thị bản ghi trong lịch sử lời nhắc (bảng `exam_reminders` trong CSDL).
  4. **Bước 4 (Kiểm tra tiếp nhận của Phụ huynh):**
     - Quan sát điện thoại của phụ huynh: Thông báo đẩy FCM hiển thị trên thanh trạng thái với tiêu đề *"Lịch kiểm tra sắp tới: Môn Tiếng Anh"*.

- **TIÊU CHÍ CHẤP NHẬN ĐẠT CHUẨN (ACCEPTANCE CRITERIA):**
  - [ ] **Lưu trữ dữ liệu chuẩn:** Bản ghi được tạo trong bảng `exam_reminders` với đầy đủ môn, ngày thi và lời dặn dò.
  - [ ] **Gửi Broadcast đồng loạt:** Kích hoạt FCM multicast phát thành công đến 100% thiết bị phụ huynh trong lớp trong **dưới 3 giây**.
  - [ ] **Nội dung rõ ràng:** Phụ huynh chạm vào thông báo mở app xem được chi tiết trọn vẹn lời dặn dò của cô giáo.

- **KẾT QUẢ ĐÁNH GIÁ CUỐI CÙNG:** 
- **GHI CHÚ / GÓP Ý CẢI TIẾN THÊM TỪ NGƯỜI DÙNG:**
- **XÁC NHẬN NGHIỆM THU:**
  - Đại diện Giáo viên: 
  - Đại diện Phụ huynh: 
  - Đại diện Nhóm Phát Triển: 

---

### UAT11_PHHS_01 : NGHIỆM THU PHỤ HUYNH ĐĂNG NHẬP, LIÊN KẾT CON VÀO SỔ LIÊN LẠC ĐIỆN TỬ QUA MÃ MỜI / MÃ HỌC SINH

- **VAI TRÒ NGHIỆM THU:** Phụ huynh học sinh (Parent).
- **MÔI TRƯỜNG THỰC TẾ:** Ứng dụng di động GiaoVienHay Mobile App trên điện thoại Android/iOS của phụ huynh.
- **BỐI CẢNH NGHIỆP VỤ THỰC TẾ:**
  Bác Trần Văn Hùng là phụ huynh của em Trần Bảo Nam lớp `1A`. Bác tải ứng dụng GiaoVienHay về máy, đăng nhập bằng số điện thoại, sau đó nhập mã mời của lớp do cô giáo gửi vào nhóm Zalo để kết nối vào Sổ liên lạc điện tử của con trai mình.
- **DỮ LIỆU CHUẨN BỊ:**
  - Số điện thoại phụ huynh: `0977112233` | Mật khẩu: `MatKhau123@`.
  - Học sinh liên kết: Trần Bảo Nam (`std_01`), Lớp 1A.
  - Mã mời lớp học: `1A2026` (hoặc mã mời sinh ra từ ClassManagementScreen).

- **CÁC BƯỚC THAO TÁC THỰC HIỆN CỦA PHỤ HUYNH:**
  1. **Bước 1 (Đăng nhập ứng dụng Phụ huynh):**
     - Mở app GiaoVienHay, chọn Quick Login **"👨‍👩‍👧 Trần Văn Hùng (PH)"** (hoặc gõ SĐT `0977112233`, mật khẩu `MatKhau123@`).
     - Bấm **"Đăng Nhập"**.
  2. **Bước 2 (Liên kết học sinh qua Mã mời / Mã học sinh):**
     - Tại Trang chủ phụ huynh, bấm vào nút **"Liên kết thêm học sinh"** (`ParentJoinCodeScreen`).
     - Nhập mã mời lớp học hoặc mã định danh của học sinh.
     - Bấm **"Xác nhận liên kết"**.
  3. **Bước 3 (Kiểm tra hiển thị Sổ liên lạc của con):**
     - Hệ thống thông báo: *"Liên kết thành công! Chào mừng phụ huynh em Trần Bảo Nam."*.
     - Màn hình chính tự động hiển thị thẻ hồ sơ của em Trần Bảo Nam, kèm thông tin Lớp 1A, GVCN Cô Nguyễn Thị Lan và các lối tắt tra cứu.

- **TIÊU CHÍ CHẤP NHẬN ĐẠT CHUẨN (ACCEPTANCE CRITERIA):**
  - [ ] **Đăng nhập mượt mà:** Xác thực nhanh, không phát sinh lỗi phiên làm việc.
  - [ ] **Liên kết chính xác:** Dữ liệu học sinh được liên kết chuẩn xác vào tài khoản phụ huynh trong CSDL PostgreSQL.
  - [ ] **Giao diện thân thiện:** Phụ huynh lớn tuổi vẫn dễ dàng thao tác theo hướng dẫn tiếng Việt rõ ràng.

- **KẾT QUẢ ĐÁNH GIÁ CUỐI CÙNG:** 
- **GHI CHÚ / GÓP Ý CẢI TIẾN THÊM TỪ NGƯỜI DÙNG:**
- **XÁC NHẬN NGHIỆM THU:**
  - Đại diện Phụ huynh Học sinh: 
  - Đại diện Nhóm Phát Triển: 

---

### UAT12_PHHS_02 : NGHIỆM THU TÍNH KỊP THỜI CỦA THÔNG BÁO ĐẨY CẢNH BÁO VẮNG HỌC VÀ TRA CỨU LỊCH SỬ CHUYÊN CẦN CỦA CON

- **VAI TRÒ NGHIỆM THU:** Phụ huynh học sinh.
- **MÔI TRƯỜNG THỰC TẾ:** Điện thoại di động của phụ huynh khi đang ở nơi làm việc (kết nối mạng 4G/Wi-Fi).
- **BỐI CẢNH NGHIỆP VỤ THỰC TẾ:**
  Sáng sớm phụ huynh thấy con tự đi học. Đến 7h20 sáng, phụ huynh đang ngồi làm việc tại cơ quan thì chuông điện thoại vang lên kèm thông báo đẩy khẩn cấp từ app GiaoVienHay báo con bị vắng mặt không phép đầu giờ. Phụ huynh chạm ngay vào thông báo, ứng dụng mở thẳng vào màn hình Lịch sử chuyên cần để phụ huynh nắm bắt chi tiết và liên hệ kịp thời với cô giáo chủ nhiệm.
- **DỮ LIỆU CHUẨN BỊ:**
  - Tài khoản phụ huynh em Trần Bảo Nam (`0977112233`).
  - Sự kiện điểm danh vắng không phép đã thực hiện ở kịch bản UAT03.

- **CÁC BƯỚC THAO TÁC THỰC HIỆN CỦA PHỤ HUYNH:**
  1. **Bước 1 (Tiếp nhận thông báo đẩy FCM):**
     - Điện thoại phụ huynh rung và phát âm báo thông báo.
     - Thanh trạng thái hiển thị tiêu đề màu đỏ: *"CẢNH BÁO CHUYÊN CẦN: Em Trần Bảo Nam vắng mặt không phép buổi học sáng nay..."*.
  2. **Bước 2 (Chạm mở ứng dụng qua Deep Link):**
     - Phụ huynh chạm trực tiếp vào thông báo.
     - Ứng dụng tự động mở ra và chuyển hướng thẳng vào màn hình **Chuyên cần của con**.
  3. **Bước 3 (Tra cứu chi tiết chuyên cần):**
     - Màn hình hiển thị lịch tháng với các chấm tròn màu sắc:
       - Màu xanh: Đi học đúng giờ.
       - Màu vàng: Vắng có phép.
       - Màu đỏ: Vắng không phép (ngày hôm nay hiển thị chấm đỏ kèm ghi chú "Tiết 1 - Đầu giờ").
     - Thống kê tháng hiển thị minh bạch số buổi có mặt và số buổi vắng.

- **TIÊU CHÍ CHẤP NHẬN ĐẠT CHUẨN (ACCEPTANCE CRITERIA):**
  - [ ] **Tốc độ cảnh báo khẩn:** Nhận thông báo đẩy trong vòng **dưới 2.5 giây** sau khi cô giáo lưu điểm danh tại lớp.
  - [ ] **Điều hướng sâu (Deep Linking):** Chạm vào thông báo dẫn thẳng tới đúng màn hình chuyên cần của con.
  - [ ] **Minh bạch và dễ hiểu:** Giao diện lịch biểu trực quan, phân định rõ ràng giữa vắng có phép và không phép.

- **KẾT QUẢ ĐÁNH GIÁ CUỐI CÙNG:** 
- **GHI CHÚ / GÓP Ý CẢI TIẾN THÊM TỪ NGƯỜI DÙNG:**
- **XÁC NHẬN NGHIỆM THU:**
  - Đại diện Phụ huynh Học sinh: 
  - Đại diện Nhóm Phát Triển: 

---

### UAT13_PHHS_03 : NGHIỆM THU TRA CỨU SỔ ĐIỂM ĐIỆN TỬ ĐA MÔN HỌC, ĐỌC NHẬN XÉT CỦA GIÁO VIÊN VÀ BẤM NÚT "XÁC NHẬN ĐÃ ĐỌC"

- **VAI TRÒ NGHIỆM THU:** Phụ huynh học sinh.
- **MÔI TRƯỜNG THỰC TẾ:** Ứng dụng di động GiaoVienHay Mobile App trên điện thoại phụ huynh.
- **BỐI CẢNH NGHIỆP VỤ THỰC TẾ:**
  Buổi tối sau khi ăn cơm cùng gia đình, phụ huynh mở ứng dụng GiaoVienHay để kiểm tra kết quả học tập của con trong tuần. Phụ huynh xem bảng điểm chi tiết các môn học (Toán, Tiếng Việt, Tiếng Anh...), xem các cột điểm thành phần và đọc lời nhận xét của cô giáo khen ngợi tinh thần học tập của con, sau đó bấm nút "Xác nhận đã đọc" để gửi phản hồi cho cô giáo.
- **DỮ LIỆU CHUẨN BỊ:**
  - Học sinh: Trần Bảo Nam.
  - Điểm mới công bố: Môn Toán (Điểm 15 phút: 9.5; Điểm miệng: 10.0).
  - Nhận xét của cô giáo đã gửi ở kịch bản UAT05.

- **CÁC BƯỚC THAO TÁC THỰC HIỆN CỦA PHỤ HUYNH:**
  1. **Bước 1 (Mở mục Bảng điểm của con):**
     - Đăng nhập app phụ huynh, tại màn hình chính chọn mục **"Kết quả học tập"** (`ParentAcademicScreen`).
     - Danh sách các môn học hiển thị rõ ràng: Toán học, Tiếng Việt, Tiếng Anh, Tự nhiên & Xã hội...
  2. **Bước 2 (Xem chi tiết từng cột điểm thành phần):**
     - Chạm vào môn **"Toán học"**.
     - Bảng điểm chi tiết mở ra hiển thị các cột điểm thành phần:
       - Điểm miệng: `10.0`.
       - Kiểm tra 15 phút: `9.5`.
       - Kiểm tra 1 tiết, Giữa kỳ, Cuối kỳ: Hiển thị dấu gạch ngang `-` (chưa có điểm).
  3. **Bước 3 (Xem lời nhận xét của cô giáo):**
     - Chuyển sang tab **"Nhận xét của thầy cô"**.
     - Đọc trọn vẹn lời khen ngợi từ Cô Nguyễn Thị Lan.
  4. **Bước 4 (Bấm nút Xác nhận đã đọc):**
     - Dưới nhận xét có nút **"Xác nhận đã đọc"**.
     - Phụ huynh chạm vào nút này: Nút chuyển sang trạng thái màu xanh lá cây *"Đã xác nhận lúc [Thời gian]"*.

- **TIÊU CHÍ CHẤP NHẬN ĐẠT CHUẨN (ACCEPTANCE CRITERIA):**
  - [ ] **Hiển thị điểm minh bạch:** Các cột điểm thành phần hiển thị trung thực theo đúng dữ liệu giáo viên đã công bố.
  - [ ] **Bảo mật dữ liệu (Chống IDOR):** Phụ huynh chỉ nhìn thấy duy nhất điểm số của con em mình, không xem được điểm của học sinh khác trong lớp.
  - [ ] **Phản hồi tức thì:** Bấm "Xác nhận đã đọc" cập nhật trạng thái phản hồi ngay lập tức trong **dưới 1 giây**.

- **KẾT QUẢ ĐÁNH GIÁ CUỐI CÙNG:** 
- **GHI CHÚ / GÓP Ý CẢI TIẾN THÊM TỪ NGƯỜI DÙNG:**
- **XÁC NHẬN NGHIỆM THU:**
  - Đại diện Phụ huynh: 
  - Đại diện Nhóm Phát Triển: 

---

### UAT14_PHHS_04 : NGHIỆM THU TRA CỨU TÌNH TRẠNG NỘP HỌC PHÍ & BHYT (KÈM NGÀY NỘP), QUÉT MÃ VIETQR VÀ XEM LỜI NHẮC LỊCH KIỂM TRA

- **VAI TRÒ NGHIỆM THU:** Phụ huynh học sinh.
- **MÔI TRƯỜNG THỰC TẾ:** Ứng dụng di động GiaoVienHay trên điện thoại phụ huynh.
- **BỐI CẢNH NGHIỆP VỤ THỰC TẾ:**
  Phụ huynh muốn kiểm tra xem số tiền Bảo hiểm Y tế mình gửi cô giáo tuần trước đã được ghi nhận vào hệ thống hay chưa, mở mã VietQR để thanh toán nốt tiền quỹ bán trú tiện lợi, đồng thời mở xem mục Lời nhắc kiểm tra để biết ngày mai con có bài thi môn nào nhằm nhắc nhở con chuẩn bị sách vở và ôn bài buổi tối.
- **DỮ LIỆU CHUẨN BỊ:**
  - Học sinh: Trần Bảo Nam.
  - Trạng thái BHYT: Đã hoàn thành (ngày nộp: `25/10/2026`).
  - Lời nhắc kiểm tra: Môn Tiếng Anh ngày `28/10/2026`.

- **CÁC BƯỚC THAO TÁC THỰC HIỆN CỦA PHỤ HUYNH:**
  1. **Bước 1 (Mở mục Thu phí & BHYT):**
     - Đăng nhập app phụ huynh, chọn mục **"Học phí & BHYT"** (`ParentFeesScreen`).
     - Màn hình hiển thị danh mục các khoản thu:
       - **Bảo hiểm Y tế (BHYT):** Huy hiệu màu xanh *"Đã hoàn thành"* - Ghi nhận ngày: `25/10/2026`.
       - **Quỹ lớp / Bán trú:** Huy hiệu màu cam *"Chưa hoàn thành"*.
  2. **Bước 2 (Mở mã VietQR thanh toán):**
     - Chạm vào khoản thu chưa hoàn thành: Bấm nút **"Thanh toán qua VietQR"**.
     - Mã VietQR chuẩn Napas247 hiển thị sắc nét kèm số tiền và nội dung chuyển khoản tự động (ví dụ: `GVH CLS1A STD01 BANTU`).
     - Phụ huynh có thể chụp màn hình hoặc lưu ảnh QR về máy để mở app ngân hàng quét thanh toán tiện lợi.
  3. **Bước 3 (Xem lời nhắc lịch kiểm tra sắp tới):**
     - Chuyển sang tab **"Lịch kiểm tra sắp tới"** (hoặc mở từ trang chủ).
     - Nhìn thấy thẻ thông báo nổi bật màu xanh:
       - Môn: `Tiếng Anh`.
       - Ngày kiểm tra: `28/10/2026`.
       - Lời dặn dò của cô: *"Bố mẹ nhắc con ôn kỹ từ vựng Unit 1, 2 và chuẩn bị bút chì."*.

- **TIÊU CHÍ CHẤP NHẬN ĐẠT CHUẨN (ACCEPTANCE CRITERIA):**
  - [ ] **Minh bạch tài chính:** Thể hiện rõ ràng trạng thái Đã nộp kèm ngày tháng cụ thể, mang lại sự an tâm tuyệt đối cho phụ huynh.
  - [ ] **Mã VietQR chuẩn xác:** Sinh mã Napas247 tương thích 100% với các ứng dụng ngân hàng tại Việt Nam.
  - [ ] **Lời nhắc thi chi tiết:** Hiển thị rõ ràng môn thi, thời gian và dặn dò cụ thể giúp phụ huynh đôn đốc con học bài chu đáo.

- **KẾT QUẢ ĐÁNH GIÁ CUỐI CÙNG:** 
- **GHI CHÚ / GÓP Ý CẢI TIẾN THÊM TỪ NGƯỜI DÙNG:**
- **XÁC NHẬN NGHIỆM THU:**
  - Đại diện Phụ huynh: 
  - Đại diện Nhóm Phát Triển: 

---

### UAT15_PHHS_05 : NGHIỆM THU TÍNH NĂNG CHỈNH SỬA HỒ SƠ PHỤ HUYNH (LIVE 3D AVATAR PREVIEW, SĐT CỐ ĐỊNH) VÀ ĐỒNG BỘ CƠ SỞ DỮ LIỆU POSTGRESQL TỨC THÌ

- **VAI TRÒ NGHIỆM THU:** Phụ huynh học sinh.
- **MÔI TRƯỜNG THỰC TẾ:** Ứng dụng di động GiaoVienHay trên điện thoại Android/iOS.
- **BỐI CẢNH NGHIỆP VỤ THỰC TẾ:**
  Phụ huynh muốn cập nhật lại thông tin cá nhân của mình (họ và tên đầy đủ, email nhận thông báo điện tử). Phụ huynh mở màn hình Cá nhân (`ParentProfileScreen`), bấm vào nút Chỉnh sửa hồ sơ. Modal Bottom Sheet chuẩn phong cách **UI/UX Pro Max** xuất hiện với Live 3D Avatar Preview tự động thay đổi chữ cái viết tắt theo tên đang gõ, số điện thoại đăng nhập được khóa an toàn (badge "Cố định"), sau khi bấm Lưu thì giao diện thẻ hồ sơ cập nhật ngay lập tức và dữ liệu được ghi đè trực tiếp vào CSDL Supabase PostgreSQL.
- **DỮ LIỆU CHUẨN BỊ:**
  - Tài khoản phụ huynh: SĐT `0977112233` / Mật khẩu `MatKhau123@`.
  - Thông tin mới cần đổi:
    - Họ và tên: `Trần Văn Hùng (Bố Bảo Nam)`.
    - Email liên hệ: `hung.tran.profile@gmail.com`.

- **CÁC BƯỚC THAO TÁC THỰC HIỆN CỦA PHỤ HUYNH:**
  1. **Bước 1 (Mở màn hình Hồ sơ Phụ huynh):**
     - Đăng nhập tài khoản Bác Hùng, chạm vào tab **"Cá nhân"** ở góc phải thanh điều hướng dưới đáy.
     - Màn hình **ParentProfileScreen** mở ra: Thẻ thông tin cá nhân hiển thị Họ tên, Số điện thoại và Email.
  2. **Bước 2 (Mở Modal Bottom Sheet Chỉnh sửa Hồ sơ):**
     - Chạm vào biểu tượng cây bút chì màu cam ở góc trên bên phải thẻ hồ sơ.
     - Modal Bottom Sheet **"Sửa Hồ Sơ Phụ Huynh"** trượt mượt mà từ dưới lên với thanh kéo `drag handle`.
  3. **Bước 3 (Thao tác nhập liệu & Trải nghiệm Live 3D Avatar):**
     - Quan sát khu vực Avatar 3D Preview:
     - Gõ thay đổi Họ và tên thành `Trần Văn Hùng`: Vòng tròn Avatar 3D tự động cập nhật ngay chữ cái viết tắt `TH` theo thời gian thực.
     - Nhập Email liên hệ: `hung.tran.profile@gmail.com`.
     - Quan sát ô Số điện thoại: Ô hiển thị `0977112233` ở trạng thái chỉ đọc (disabled) kèm huy hiệu màu xám **"Cố định"** để đảm bảo an toàn định danh tài khoản.
  4. **Bước 4 (Bấm Lưu thay đổi & Kiểm tra phản hồi):**
     - Bấm nút gradient cam **"Lưu Thay Đổi"**.
     - Nút hiển thị spinner xoay nhẹ `ActivityIndicator` và thông báo popup: *"Thông tin cá nhân phụ huynh đã được cập nhật thành công!"*.
     - Modal tự động đóng lại: Thẻ hồ sơ bên ngoài hiển thị ngay Họ tên và Email mới mà không cần phải tải lại trang.
  5. **Bước 5 (Đối soát trực tiếp trong CSDL Supabase PostgreSQL):**
     - Truy vấn bảng `users` với `phone = '0977112233'`:
     - Bản ghi trả về chính xác: `full_name: 'Trần Văn Hùng'`, `email: 'hung.tran.profile@gmail.com'`, `updated_at` ghi nhận mốc thời gian vừa cập nhật.

- **TIÊU CHÍ CHẤP NHẬN ĐẠT CHUẨN (ACCEPTANCE CRITERIA):**
  - [ ] **Giao diện đẳng cấp UI/UX Pro Max:** Live 3D Avatar Preview đổi chữ cái tức thì theo tên gõ, hiệu ứng thị giác hiện đại, sinh động.
  - [ ] **Bảo vệ số điện thoại đăng nhập:** Số điện thoại được khóa cố định, chống việc người dùng vô tình sửa làm mất quyền đăng nhập.
  - [ ] **Đồng bộ CSDL tức thì:** Backend gọi `PATCH /api/v1/users/profile`, xóa cache và lưu trực tiếp vào bảng `users` trong Supabase PostgreSQL, không có độ trễ stale cache.

- **KẾT QUẢ ĐÁNH GIÁ CUỐI CÙNG:** 
- **GHI CHÚ / GÓP Ý CẢI TIẾN THÊM TỪ NGƯỜI DÙNG:**
- **XÁC NHẬN NGHIỆM THU:**
  - Đại diện Phụ huynh Học sinh: 
  - Đại diện Nhóm Phát Triển: 

---

### UAT16_ADMIN_01 : NGHIỆM THU TÍNH NĂNG CẤU HÌNH HẠN MỨC TÀI NGUYÊN HỆ THỐNG (LIMITS / QUOTAS) VÀ ÁP DỤNG CHẶN TỨC THÌ

- **VAI TRÒ NGHIỆM THU:** Quản trị viên Nền tảng (Platform Admin).
- **MÔI TRƯỜNG THỰC TẾ:** Trình duyệt Web hoặc API Client dành cho Quản trị viên.
- **BỐI CẢNH NGHIỆP VỤ THỰC TẾ:**
  Để kiểm soát chi phí sử dụng API Google Gemini và chống việc tải tài liệu quá tải làm chậm máy chủ, Admin mở màn hình Cấu hình Hạn mức Hệ thống để thiết lập: Mỗi giáo viên được gọi tối đa 20 lượt AI/ngày, sĩ số tối đa 50 học sinh/lớp và dung lượng tối đa mỗi tệp giáo án tải lên là 10MB. Admin lưu cấu hình và kiểm tra hệ thống áp dụng hạn mức ngay lập tức.
- **DỮ LIỆU CHUẨN BỊ:**
  - Tài khoản Admin: SĐT `0988001122` | Mật khẩu: `MatKhau123@` (Thầy Trần Văn Bình).
  - Thông số cấu hình:
    - Hạn ngạch gọi AI: `ai_daily_quota = 20` lượt/ngày.
    - Sĩ số tối đa: `max_students_per_class = 50` học sinh.
    - Dung lượng upload tối đa: `max_upload_size_mb = 10` MB.

- **CÁC BƯỚC THAO TÁC THỰC HIỆN CỦA ADMIN:**
  1. **Bước 1 (Đăng nhập tài khoản Admin):**
     - Đăng nhập tài khoản Thầy Bình với vai trò `ADMIN`.
     - Vào menu **"Cấu hình Hệ thống"** $\rightarrow$ **"Hạn mức Tài nguyên (Limits & Quotas)"** (`/system-limits`).
  2. **Bước 2 (Chỉnh sửa và lưu thông số hạn mức):**
     - Nhập số lượt gọi AI tối đa: `20`.
     - Nhập sĩ số tối đa: `50`.
     - Nhập dung lượng tải lên tối đa: `10`.
     - Bấm nút **"Lưu cấu hình hệ thống"**.
     - Hệ thống phản hồi HTTP `200 OK` kèm thông báo thành công.
  3. **Bước 3 (Kiểm tra cập nhật dữ liệu CSDL):**
     - Kiểm tra bảng `system_limits` trong Supabase PostgreSQL: Bản ghi được lưu chính xác các giá trị mới.
  4. **Bước 4 (Thử nghiệm tính năng chặn hạn mức):**
     - Dùng tài khoản giáo viên tải lên 1 tệp giáo án dung lượng 12MB (> 10MB).
     - Hệ thống báo lỗi ngay tại giao diện: *"Tệp tài liệu vượt quá dung lượng tối đa cho phép (10MB). Vui lòng chọn tệp nhỏ hơn."*.

- **TIÊU CHÍ CHẤP NHẬN ĐẠT CHUẨN (ACCEPTANCE CRITERIA):**
  - [ ] **Lưu cấu hình an toàn:** Dữ liệu lưu chuẩn xác vào bảng `system_limits` trong PostgreSQL.
  - [ ] **Áp dụng tức thì (Real-time enforcement):** Middleware NestJS áp dụng hạn mức mới ngay lập tức mà không cần phải khởi động lại máy chủ (No restart required).
  - [ ] **Thông báo lỗi thân thiện:** Giao diện hiển thị thông điệp tiếng Việt giải thích rõ lý do, không báo mã lỗi kỹ thuật khó hiểu.

- **KẾT QUẢ ĐÁNH GIÁ CUỐI CÙNG:** 
- **GHI CHÚ / GÓP Ý CẢI TIẾN THÊM TỪ NGƯỜI DÙNG:**
- **XÁC NHẬN NGHIỆM THU:**
  - Đại diện Quản trị viên: 
  - Đại diện Nhóm Phát Triển: 

---

### UAT17_ADMIN_02 : NGHIỆM THU TÍNH NĂNG KHÓA TÀI KHOẢN VI PHẠM (BAN USER), THU HỒI PHIÊN TỨC THÌ VÀ MỞ KHÓA (UNBAN) AN TOÀN

- **VAI TRÒ NGHIỆM THU:** Quản trị viên Nền tảng (Platform Admin).
- **MÔI TRƯỜNG THỰC TẾ:** Trình duyệt Web Quản trị Admin và ứng dụng trên điện thoại của tài khoản bị khóa.
- **BỐI CẢNH NGHIỆP VỤ THỰC TẾ:**
  Hệ thống phát hiện một tài khoản có hành vi vi phạm quy tắc ứng xử học đường (spam nội dung hoặc quấy rối). Admin mở hồ sơ tài khoản này, thực hiện thao tác Khóa tài khoản (`Ban User`). Toàn bộ phiên làm việc của tài khoản này trên ứng dụng di động phải bị thu hồi ngay lập tức, người dùng bị văng ra màn hình đăng nhập và không thể gọi bất kỳ API nào. Khi có giải trình hợp lệ, Admin thực hiện Mở khóa (`Unban User`) để phục hồi tài khoản nguyên vẹn.
- **DỮ LIỆU CHUẨN BỊ:**
  - Tài khoản Admin: `0988001122` (Thầy Trần Văn Bình).
  - Tài khoản vi phạm thử nghiệm: `0911000999` (ID: `usr_locked_teacher_01`).
  - Lý do khóa: *"Vi phạm quy tắc ứng xử học đường và điều khoản sử dụng nền tảng"*.

- **CÁC BƯỚC THAO TÁC THỰC HIỆN CỦA ADMIN:**
  1. **Bước 1 (Tìm kiếm tài khoản vi phạm):**
     - Đăng nhập tài khoản Admin, vào mục **"Quản lý Tài khoản Người dùng"**.
     - Nhập số điện thoại `0911000999` vào ô tìm kiếm.
     - Bấm xem chi tiết hồ sơ tài khoản.
  2. **Bước 2 (Thực hiện Khóa tài khoản - Ban User):**
     - Bấm nút màu đỏ **"Khóa tài khoản"**.
     - Nhập lý do khóa: *"Vi phạm quy tắc ứng xử học đường"*.
     - Bấm **"Xác nhận khóa"** (gọi `PATCH /api/v1/admin/users/:id/status` với `{ is_active: false }`).
  3. **Bước 3 (Kiểm tra phía người dùng bị khóa):**
     - Quan sát điện thoại đang đăng nhập tài khoản `0911000999`:
     - Ứng dụng lập tức hiển thị thông báo: *"Tài khoản của bạn đã bị khóa do vi phạm quy định. Vui lòng liên hệ ban quản trị để được hỗ trợ."*.
     - Ứng dụng tự động đăng xuất và đưa người dùng trở về màn hình Đăng nhập.
     - Thử bấm đăng nhập lại: Hệ thống từ chối xác thực với mã HTTP 403 Forbidden.
  4. **Bước 4 (Thực hiện Mở khóa - Unban User):**
     - Trên màn hình Admin, bấm nút **"Mở khóa tài khoản (Unban User)"**.
     - Trạng thái tài khoản chuyển lại màu xanh: `ĐANG HOẠT ĐỘNG`.
     - Người dùng thực hiện đăng nhập lại trên điện thoại thành công, toàn bộ dữ liệu lớp học trước đó vẫn được bảo toàn nguyên vẹn 100%.

- **TIÊU CHÍ CHẤP NHẬN ĐẠT CHUẨN (ACCEPTANCE CRITERIA):**
  - [ ] **Thu hồi phiên tức thì:** Đặt `is_active = false` trong CSDL Supabase PostgreSQL và dọn sạch cache profile; mọi yêu cầu API với token cũ bị từ chối với mã lỗi HTTP 403 Forbidden.
  - [ ] **Hiển thị lý do minh bạch:** Người dùng biết chính xác lý do tài khoản bị tạm dừng hoạt động.
  - [ ] **Mở khóa an toàn & Bảo toàn dữ liệu:** Thao tác Unban khôi phục quyền truy cập bình thường mà không làm mất hay gián đoạn bất kỳ dữ liệu lớp học, điểm số hay sổ liên lạc nào.

- **KẾT QUẢ ĐÁNH GIÁ CUỐI CÙNG:** 
- **GHI CHÚ / GÓP Ý CẢI TIẾN THÊM TỪ NGƯỜI DÙNG:**
- **XÁC NHẬN NGHIỆM THU:**
  - Đại diện Quản trị viên: 
  - Đại diện Nhóm Phát Triển: 

---

## 4. QUY TRÌNH ĐÁNH GIÁ & BIÊN BẢN BÀN GIAO NGHIỆM THU (UAT SIGN-OFF)

### 4.1. Quy trình đánh giá nghiệm thu chuẩn:
1. Mỗi kịch bản UAT được thực hiện bởi đại diện người dùng thực tế trên thiết bị mục tiêu (iOS / Android / Web).
2. Nếu toàn bộ các tiêu chí trong mục **Tiêu chí chấp nhận đạt chuẩn (Acceptance Criteria)** đều được tích chọn `[x]`, kịch bản được đánh giá là **ĐẠT (ACCEPTED)**.
3. Nếu có tiêu chí không thỏa mãn (ví dụ: giật lag quá 3 giây, mất dữ liệu, sai lệch hiển thị), kịch bản được đánh giá là **CẦN ĐIỀU CHỈNH (REWORK)** kèm mô tả lỗi chi tiết trong phần Ghi chú.

---

### 4.2. Mẫu biên bản xác nhận nghiệm thu bàn giao:

```text
CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc
----------------------------

BIÊN BẢN NGHIỆM THU CHẤP NHẬN NGƯỜI DÙNG (UAT SIGN-OFF)
Dự án: Nền tảng Quản lý Học vụ & Sổ liên lạc Thông minh GiaoVienHay
Phiên bản: v1.0.0 (Release Candidate)

Hôm nay, ngày ... tháng ... năm 2026, các bên gồm có:

1. ĐẠI DIỆN BÊN TIẾP NHẬN NGHIỆM THU (GIÁO VIÊN / BAN GIÁM HIỆU / PHỤ HUYNH):
   - Ông/Bà: .................................................... Chức vụ: ....................................................
   - Đơn vị công tác: .........................................................................................................

2. ĐẠI DIỆN ĐỘI NGŨ PHÁT TRIỂN & ĐẢM BẢO CHẤT LƯỢNG (DEV & QA):
   - Ông/Bà: .................................................... Chức vụ: ....................................................
   - Đơn vị: Nhóm Phát triển Nền tảng GiaoVienHay

Sau khi tiến hành kiểm thử thực tế theo 17 kịch bản nghiệm thu trong tài liệu UAT_GVH_ACCEPTANCE_SUITE, hai bên thống nhất kết quả đánh giá:
- Tổng số kịch bản thực hiện: 17 kịch bản.
- Số kịch bản ĐẠT: ........... kịch bản.
- Số kịch bản CẦN ĐIỀU CHỈNH: ........... kịch bản.

KẾT LUẬN CHUNG:
[  ] ĐỒNG Ý NGHIỆM THU VÀ ĐỦ ĐIỀU KIỆN PHÁT HÀNH CHÍNH THỨC (GO-LIVE).
[  ] YÊU CẦU HOÀN THIỆN CÁC ĐIỂM TỒN TẠI TRƯỚC KHI TỔ CHỨC NGHIỆM THU LẠI.

ĐẠI DIỆN NGƯỜI DÙNG                                            ĐẠI DIỆN NHÓM PHÁT TRIỂN
(Ký và ghi rõ họ tên)                                           (Ký và ghi rõ họ tên)
```
