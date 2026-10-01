# TÀI LIỆU KỊCH BẢN KIỂM THỬ TOÀN HỆ THỐNG (SYSTEM TEST SPECIFICATION)

# DỰ ÁN: GIAOVIENHAY – HỆ THỐNG QUẢN LÝ & TƯƠNG TÁC HỌC SINH CẤP 1 & CẤP 2

# MÃ TÀI LIỆU: SYS_ST – SYSTEM END-TO-END TEST SUITE

# CẤP ĐỘ KIỂM THỬ: KIỂM THỬ HỆ THỐNG (SYSTEM TEST - E2E TESTING)

---

## 1. THÔNG TIN CHUNG

- **TÊN HỆ THỐNG KIỂM THỬ:** Nền tảng Chuyển đổi số Quản lý Học vụ & Tương tác Học đường Toàn diện **GiaoVienHay** (Tiểu học & THCS).
- **MÔ TẢ LUỒNG NGHIỆP VỤ XUYÊN SUỐT:**
  Hệ thống GiaoVienHay vận hành theo chuỗi liên hoàn đa nền tảng, khép kín từ khâu thiết lập quản trị, khởi tạo năm học, tổ chức tiết học tại lớp đến kết nối gia đình:
  1. *Khởi tạo & Kết nối:* Admin thiết lập hạn ngạch hệ thống $\rightarrow$ Giáo viên chủ nhiệm (GVCN) tạo Lớp tổng, thêm học sinh, phân công Giáo viên bộ môn (GVBM) và chia sẻ Link mời $\rightarrow$ Phụ huynh đăng nhập xác nhận liên kết con em $\rightarrow$ GVBM truy cập lớp theo môn được phân công.
  2. *Nghiệp vụ Sư phạm Đầu giờ:* GVCN điểm danh nề nếp 1-chạm $\rightarrow$ Phụ huynh nhận cảnh báo vắng tức thì $\rightarrow$ GVBM mở bài kiểm tra bài cũ với Vòng quay may mắn (Lucky Wheel) trên màn hình chiếu, hệ thống tự động lọc chỉ nạp học sinh **CÓ MẶT HÔM NAY (`status = 'PRESENT'`)**, hỗ trợ nút **"Bỏ qua (Skip)"** nếu gặp sự cố $\rightarrow$ Chấm điểm miệng trực tiếp đồng bộ vào Sổ điểm môn học.
  3. *Trợ giảng Số hóa & Trò chơi Lớp học:* Giáo viên tải tệp giáo án (`.docx`/`.pdf`) lên Firebase Storage $\rightarrow$ Google Gemini AI (`gemini-1.5-flash`) tự động bóc tách kiến thức sinh câu hỏi trắc nghiệm $\rightarrow$ Chuyển đổi thành 3 Mini-game lớp học (*Rung Chuông Vàng, Đua xe vượt chướng ngại vật, Hộp quà may mắn*) chiếu lên bảng lớp tương tác $\rightarrow$ Nhập điểm thi đua đồng bộ vào sổ điểm.
  4. *Quản trị Sổ điểm & Vinh danh:* Nhập điểm đa môn, đa cột điểm (`ORAL_TEST`, `TEST_15P`, `TEST_1P`, `MID_TERM`, `FINAL`) $\rightarrow$ Trình chiếu Bảng xếp hạng (Leaderboard) Điểm Môn Học tại lớp $\rightarrow$ Bấm "Công bố điểm" kích hoạt thông báo đẩy FCM tới phụ huynh.
  5. *Tương tác Học đường & Tài chính:* Giáo viên phát lời nhắc lịch kiểm tra ôn thi cho cả lớp $\rightarrow$ Gửi lời nhận xét ngắn gọn (dạng văn bản text thuần túy, không dùng tags) kèm cơ chế phụ huynh bấm xác nhận đã đọc $\rightarrow$ Quản lý thu nộp Học phí & Bảo hiểm Y tế (BHYT) bằng cờ boolean 1-chạm (`is_paid_tuition`, `is_paid_insurance`) và gửi thông báo đôn đốc đích danh.
  6. *Độ tin cậy & Phục hồi:* Đồng bộ dữ liệu ngoại tuyến (Offline Sync), kiểm soát trùng lặp (Idempotency), ngắt an toàn khi dịch vụ bên thứ ba (AI/FCM) gặp sự cố (Fault Tolerance & Graceful Degradation) và thực thi khóa tài khoản vi phạm (Ban User) tức thì trên toàn hệ thống.

- **CÁC TÁC NHÂN (ACTORS) VÀ THIẾT BỊ THAM GIA:**
  - **Quản trị viên Nền tảng (Platform Admin):** Thao tác trên Web Quản trị Admin Portal (Next.js 14+).
  - **Giáo viên Chủ nhiệm (GVCN):** Thao tác trên Ứng dụng Di động / Máy tính bảng (React Native App) hoặc Web Giáo viên.
  - **Giáo viên Bộ môn (GVBM):** Thao tác trên Máy tính bảng / Laptop kết nối trực tiếp Máy chiếu / Smartboard tại lớp học.
  - **Phụ huynh Học sinh (PHHS):** Sử dụng Ứng dụng Di động (React Native App trên iOS/Android) nhận thông báo thời gian thực và tra cứu sổ liên lạc điện tử.
  - **Hệ sinh thái Hạ tầng & Đám mây:** API Gateway NestJS (Kiến trúc Modular Monolith), Google Cloud Firestore (NoSQL Realtime Snapshot), Firebase Authentication, Firebase Cloud Storage, Firebase Cloud Messaging (FCM), Google Gemini AI API (`gemini-1.5-flash`).

> **NGUYÊN TẮC THIẾT KẾ ĐẶC THÙ CỦA HỆ THỐNG (SYSTEM SCOPE):**  
> 1. Hệ thống **KHÔNG CÓ TÁC NHÂN HỌC SINH (Student)**: Học sinh Cấp 1 & Cấp 2 không có tài khoản và không làm bài trực tuyến. Mọi hoạt động trò chơi, kiểm tra bài cũ diễn ra trực tiếp tại lớp học; Giáo viên là người duy nhất chấm và nhập điểm.  
> 2. **Bảng Xếp Hạng (Leaderboard)** được thiết kế chuyên biệt và duy nhất cho **Điểm Môn Học** (Toán, Tiếng Việt, Tiếng Anh...), không tự động tính hay xếp hạng GPA chung.  
> 3. **Nhận xét học sinh** là các đoạn văn bản ngắn (text), không dùng hệ thống nhãn/tags phức tạp.  
> 4. **Học phí & BHYT** được quản lý bằng 2 cờ Boolean (`is_paid_tuition`, `is_paid_insurance`), không tích hợp cổng thanh toán trực tuyến.

- **NGƯỜI THỰC HIỆN / VIẾT TESTCASE:** Đội ngũ Đảm bảo Chất lượng Phần mềm (QA/QC Team) - Dự án GiaoVienHay.
- **MÔI TRƯỜNG KIỂM THỬ:** Môi trường Thử nghiệm Tích hợp Toàn diện (Staging / Pre-Production E2E Environment), kết nối thiết bị thật (iPhone iOS 17+, Android 14+, Laptop Windows/macOS kết nối máy chiếu lớp học) với cụm Backend NestJS và hệ sinh thái Firebase Cloud Staging.

---

## 2. BẢNG DANH SÁCH SYSTEM TEST CASES (E2E SUITE)

| Mã Testcase | Tên Luồng Quy Trình Nghiệp Vụ Toàn Hệ Thống | Các Thiết Bị & Ứng Dụng Tham Gia | Dữ Liệu Thử Nghiệm Toàn Hệ Thống | Kết Quả Kỳ Vọng Cuối Cùng | Trạng Thái |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **ST01_E2E_Class_Onboarding_TC01** | Quy trình khép kín khởi tạo lớp học tổng, phân công GVBM và phụ huynh vào lớp qua link mời | Web Admin $\rightarrow$ App GVCN $\rightarrow$ Backend NestJS $\rightarrow$ Cloud Firestore $\rightarrow$ App Phụ huynh $\rightarrow$ App GVBM | Lớp `6A1`, 3 học sinh, phân công GVBM Toán/Văn, phụ huynh nhận Invite Link & kết nối OTP | Hồ sơ lớp, học sinh, cờ BHYT khởi tạo hoàn tất; Phụ huynh kết nối đúng con em; GVBM thấy lớp đúng môn phân công |           |
| **ST02_E2E_Attend_LuckyWheel_Grade_TC01** | Quy trình khép kín điểm danh đầu giờ, lọc học sinh có mặt vào Vòng quay may mắn, xử lý nút Bỏ qua (Skip), chấm điểm miệng và đồng bộ sổ điểm môn học | App GVCN $\rightarrow$ App Phụ huynh (FCM) $\rightarrow$ Laptop/Smartboard GVBM $\rightarrow$ Backend $\rightarrow$ Firestore | Lớp `6A1` (Em A, C có mặt; Em B vắng), quay trúng Em C (bấm Skip) $\rightarrow$ Quay trúng Em A, chấm `9.5` điểm môn Toán | Phụ huynh Em B nhận cảnh báo vắng; Vòng quay loại trừ Em B; Nút Skip quay tiếp mượt mà; Điểm `9.5` vào sổ điểm môn Toán của Em A |           |
| **ST03_E2E_AI_Doc_Quiz_Gamification_TC01** | Quy trình trợ giảng số hóa AI: Tải giáo án (.docx/.pdf), Gemini AI sinh câu hỏi trắc nghiệm, trình chiếu 3 Mini-game lớp học và đồng bộ điểm thưởng thi đua | Laptop/Tablet GV $\rightarrow$ Firebase Storage $\rightarrow$ Gemini AI API $\rightarrow$ Web Smartboard $\rightarrow$ Cloud Firestore | File `Bai12_PhanSo.docx`, tạo 5 câu hỏi độ khó `MEDIUM`, chọn Game *Rung Chuông Vàng*, lưu điểm đội thắng | AI sinh 5 câu trắc nghiệm chuẩn xác trong < 15s; Game chạy mượt mà trên bảng chiếu; Điểm thưởng đồng bộ tức thì vào sổ điểm |           |
| **ST04_E2E_Grades_Leaderboard_Publish_FCM_TC01** | Quy trình quản trị sổ điểm đa môn, trình chiếu Bảng xếp hạng (Leaderboard) môn học vinh danh tại lớp và công bố điểm phát FCM tới phụ huynh | Tablet GVBM $\rightarrow$ Smartboard lớp học $\rightarrow$ Backend NestJS $\rightarrow$ Firestore $\rightarrow$ App Phụ huynh | Môn Toán lớp `6A1`, cột điểm 15 phút (`TEST_15P`), danh sách điểm cả lớp, bấm công bố điểm | Bảng xếp hạng vinh danh Top 3 kèm hiệu ứng pháo hoa tại lớp; Cờ `is_published=true`; Toàn bộ phụ huynh nhận FCM xem điểm chi tiết |           |
| **ST05_E2E_Exam_Reminder_And_Student_Remark_TC01** | Quy trình tương tác hai chiều: Phát lời nhắc lịch kiểm tra ôn thi cho cả lớp và gửi nhận xét cá nhân ngắn gọn kèm xác nhận đã đọc | App GV $\rightarrow$ Backend NestJS $\rightarrow$ Firebase FCM $\rightarrow$ App Phụ huynh | Lời nhắc kiểm tra 1 tiết Toán kèm dặn dò; Lời nhận xét text ngắn cho Em A: *"Hôm nay em phát biểu rất hăng hái"* | 100% Phụ huynh nhận lời nhắc kiểm tra ôn tập; Phụ huynh Em A nhận nhận xét riêng, bấm "Đã đọc" và đồng bộ về GV |           |
| **ST06_E2E_Fees_Insurance_Checklist_Remind_TC01** | Quy trình quản trị tài chính học đường: Thu nộp BHYT/Học phí 1-chạm, lọc danh sách chưa nộp và phát thông báo đôn đốc đích danh | App GVCN $\rightarrow$ Backend NestJS $\rightarrow$ Cloud Firestore $\rightarrow$ Firebase FCM $\rightarrow$ App Phụ huynh | Thu BHYT của Em A (`is_paid_insurance=true`), lọc danh sách còn lại chưa nộp và bấm gửi nhắc nhở | Cờ cập nhật tức thì; Phụ huynh Em A thấy trạng thái ĐÃ NỘP; Các phụ huynh chưa nộp nhận ngay FCM đôn đốc nộp đúng hạn |           |
| **ST07_E2E_Parent_Portal_Multi_Child_Sync_TC01** | Quy trình Cổng phụ huynh đa con em: Chuyển đổi linh hoạt hồ sơ con, đồng bộ học bạ, lịch sử chuyên cần và kiểm soát quyền riêng tư chống IDOR | App Phụ huynh $\rightarrow$ API Gateway $\rightarrow$ Backend Services $\rightarrow$ Cloud Firestore | Phụ huynh sở hữu 2 con (Em A lớp `6A1`, Em D lớp `2B`), thử truy vấn trái phép dữ liệu học sinh khác | Chuyển đổi hồ sơ tức thì, dữ liệu độc lập chính xác 100%; Cố tình xem học sinh khác bị chặn với HTTP 403 Forbidden |           |
| **ST08_E2E_Admin_Governance_Ban_Limit_Enforce_TC01** | Quy trình quản trị nền tảng: Thực thi hạn mức tài nguyên (Limits/Quotas) và khóa tài khoản vi phạm (Ban User) thu hồi phiên tức thời | Web Admin Portal $\rightarrow$ Backend NestJS $\rightarrow$ Firebase Auth $\rightarrow$ Firestore $\rightarrow$ App GV/PH | Giới hạn tối đa 5 lớp/GV, khóa tài khoản vi phạm `usr_teacher_bad` đang đăng nhập trên thiết bị | GV đạt 5 lớp bị chặn tạo thêm với HTTP 400; Tài khoản bị Ban bị thu hồi token ngay lập tức, ngắt phiên trên App |           |
| **ST09_E2E_Resilience_Offline_Sync_And_Fault_Tolerance_TC01** | Quy trình phục hồi hệ thống khi mất kết nối mạng (Offline Handling), ngoại lệ AI Timeout và tự làm sạch FCM Token hỏng | App GV (chế độ máy bay) $\rightarrow$ Backend NestJS $\rightarrow$ Gemini AI Mock Timeout $\rightarrow$ Firebase FCM Mock | Điểm danh khi mất mạng; Tải giáo án khi Gemini API phản hồi chậm > 15s; Bắn FCM khi có token phụ huynh bị thu hồi | Dữ liệu offline tự sync an toàn khi có mạng lại, chống trùng lặp; AI Timeout ngắt an toàn hoàn trả quota; FCM token hỏng tự xóa |           |

---

## 3. CHI TIẾT CÁC KỊCH BẢN KIỂM THỬ HỆ THỐNG TOÀN DIỆN (SYSTEM E2E TESTS)

---

### ST01_E2E_Class_Onboarding_TC01 : QUY TRÌNH KHÉP KÍN KHỞI TẠO LỚP HỌC TỔNG, PHÂN CÔNG GVBM VÀ KẾT NỐI PHỤ HUYNH QUA LINK MỜI

- **MỤC TIÊU KIỂM THỬ:**
  Xác minh toàn bộ chuỗi mắt xích khởi tạo năm học mới xuyên suốt từ khâu quản trị hạn mức $\rightarrow$ GVCN thiết lập môn dạy và tạo Lớp tổng $\rightarrow$ Tự động phân công GVBM $\rightarrow$ Tự động khởi tạo danh mục theo dõi BHYT $\rightarrow$ Sinh Invite Code & Link $\rightarrow$ Phụ huynh nhận link mời, đăng nhập SMS OTP/Email và xác nhận kết nối con em $\rightarrow$ GVBM đăng nhập truy cập lớp tổng theo môn phụ trách thành công.

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Thiết bị 1: Máy tính Admin đã đăng nhập Cổng Quản trị trên Web Next.js.
  - Thiết bị 2: Điện thoại GVCN (Cô Lan - `uid_gvcn_lan`) cài App React Native.
  - Thiết bị 3: Điện thoại Phụ huynh (Anh Hùng - cha của học sinh Hoàng Long) cài App React Native.
  - Thiết bị 4: Laptop/Tablet của GVBM Toán (Thầy Tuấn - `uid_gvbm_tuan`) cài App React Native / Web.
  - Cơ sở dữ liệu Cloud Firestore trên môi trường Staging sạch sẵn sàng.

- **DỮ LIỆU ĐẦU VÀO VÀ CÁC THIẾT LẬP:**
  - Thông tin Lớp học: Lớp `6A1`, Khối `6`, Niên khóa `2026-2027`.
  - Danh sách học sinh ban đầu (3 học sinh):
    - Học sinh 1: `stu_long_01` - Nguyễn Hoàng Long (Ngày sinh: 15/05/2014).
    - Học sinh 2: `stu_mai_02` - Trần Phương Mai (Ngày sinh: 20/08/2014).
    - Học sinh 3: `stu_tuan_03` - Lê Minh Tuấn (Ngày sinh: 10/11/2014).
  - Phân công bộ môn: Môn Văn do GVCN phụ trách (`uid_gvcn_lan`), Môn Toán phân công cho Thầy Tuấn (`uid_gvbm_tuan`).

- **CÁC BƯỚC THỰC HIỆN CHI TIẾT (CHUỖI HÀNH ĐỘNG E2E):**

  1. **Bước 1 (Admin thiết lập hạn mức trên Web Next.js):**
     - Trên **Thiết bị 1 (Web Admin)**, Admin vào màn hình "Cấu hình Hạn mức Hệ thống", thiết lập: Tối đa 5 lớp/GV, tối đa 50 học sinh/lớp.
     - Bấm nút **"Lưu cấu hình"** $\rightarrow$ Hệ thống ghi nhận vào Firestore document `/system_configs/limits`.

  2. **Bước 2 (GVCN đăng nhập & thiết lập môn giảng dạy):**
     - Trên **Thiết bị 2 (App GVCN)**, Cô Lan đăng nhập tài khoản.
     - Vào mục Hồ sơ cá nhân, chọn môn trực tiếp giảng dạy: `Ngữ văn (LIT)` $\rightarrow$ Bấm **"Lưu hồ sơ"**.

  3. **Bước 3 (GVCN Tạo Lớp học tổng & Phân công GVBM):**
     - Cô Lan chọn "Tạo Lớp học tổng", nhập tên lớp `6A1`, Khối `6`, Niên khóa `2026-2027`.
     - Nhập danh sách 3 học sinh (Hoàng Long, Phương Mai, Minh Tuấn).
     - Phân công chuyên môn: Môn Toán $\rightarrow$ Chọn GVBM Thầy Tuấn (`uid_gvbm_tuan`).
     - Bấm nút **"Hoàn tất tạo lớp"**.

  4. **Bước 4 (Hệ thống xử lý Backend & Phản hồi Invite Link):**
     - Backend NestJS tiếp nhận yêu cầu, kiểm tra hạn mức $\rightarrow$ Khởi tạo document trong `/classes/cls_6a1_2026` với mã mời ngẫu nhiên (ví dụ: `invite_code = "GVH6A1"`), đường dẫn `invite_link = "https://giaovienhay.vn/join/GVH6A1"`.
     - Lưu 3 bản ghi học sinh vào `/students`.
     - Tự động khởi tạo 3 bản ghi theo dõi nghĩa vụ tài chính trong `/fees_and_insurance` với cờ `is_paid_tuition = false`, `is_paid_insurance = false`.
     - Màn hình App GVCN hiển thị mã mời `GVH6A1`, nút **"Sao chép Link mời"** và mã QR.

  5. **Bước 5 (Phụ huynh tham gia lớp và kết nối con em):**
     - Cô Lan gửi link mời vào nhóm Zalo lớp.
     - Trên **Thiết bị 3 (Điện thoại Phụ huynh Anh Hùng)**, Anh Hùng nhấp vào link `https://giaovienhay.vn/join/GVH6A1`.
     - Ứng dụng mở ra màn hình tham gia lớp `6A1`. Phụ huynh nhập số điện thoại, nhập mã OTP xác thực để đăng nhập.
     - Màn hình hiển thị danh sách 3 học sinh lớp `6A1`. Anh Hùng tích chọn học sinh **Nguyễn Hoàng Long** và bấm nút **"Xác nhận kết nối con em"**.

  6. **Bước 6 (GVBM đăng nhập truy cập lớp tổng theo môn phụ trách):**
     - Trên **Thiết bị 4 (Laptop/Tablet GVBM Thầy Tuấn)**, Thầy Tuấn đăng nhập tài khoản.
     - Mở mục "Lớp học bộ môn", thấy xuất hiện lớp `6A1` (Môn Toán).
     - Thầy Tuấn nhấn vào lớp `6A1` để kiểm tra danh sách học sinh.

- **KẾT QUẢ MONG ĐỢI TOÀN HỆ THỐNG (END-TO-END CRITERIA):**
  1. **Tại Bước 3 & 4:** Lớp học được tạo thành công trong thời gian < 1.5 giây. CSDL Cloud Firestore ghi nhận đầy đủ document `/classes/cls_6a1_2026`, 3 document trong `/students`, và 3 document trong `/fees_and_insurance` với đầy đủ cờ mặc định `false`.
  2. **Tại Bước 5:** Tài khoản Phụ huynh kết nối thành công. Trong document `/students/stu_long_01`, mảng `parent_uids` lập tức được bổ sung UID của Anh Hùng. Document tài khoản của Anh Hùng trong `/users` được cập nhật mảng `enrolled_classes` chứa `cls_6a1_2026`. Màn hình App phụ huynh chuyển sang trang chủ lớp hiển thị đầy đủ thông tin con em.
  3. **Tại Bước 6:** Thầy Tuấn truy cập thành công lớp `6A1` với quyền hạn Môn Toán, xem được danh sách đầy đủ 3 học sinh để sẵn sàng vào điểm, hoàn toàn không bị chặn quyền RBAC.

- **TRẠNG THÁI KIỂM THỬ:** 

---

### ST02_E2E_Attend_LuckyWheel_Grade_TC01 : QUY TRÌNH KHÉP KÍN ĐIỂM DANH ĐẦU GIỜ, LỌC HỌC SINH CÓ MẶT VÀO VÒNG QUAY MAY MẮN, XỬ LÝ NÚT BỎ QUA (SKIP) VÀ ĐỒNG BỘ SỔ ĐIỂM

- **MỤC TIÊU KIỂM THỬ:**
  Xác minh toàn bộ chuỗi mắt xích liên hoàn trong tiết học đầu ngày: GVCN điểm danh nề nếp $\rightarrow$ Phụ huynh học sinh vắng nhận thông báo đẩy FCM tức thì $\rightarrow$ GVBM mở Vòng quay may mắn (Lucky Wheel) kiểm tra bài cũ $\rightarrow$ Hệ thống tự động truy vấn danh sách học sinh có mặt (`status = 'PRESENT'`), tự động loại trừ học sinh vắng $\rightarrow$ Kiểm tra tính năng nút **"Bỏ qua (Skip)"** khi học sinh được chọn gặp sự cố bất khả kháng $\rightarrow$ Học sinh trả lời bài cũ $\rightarrow$ GVBM chấm điểm 1-chạm $\rightarrow$ Điểm miệng được đồng bộ tự động vào cột `ORAL_TEST` trong Sổ điểm môn học trên Cloud Firestore.

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Lớp `6A1` có 3 học sinh: Nguyễn Hoàng Long (`stu_long_01`), Trần Phương Mai (`stu_mai_02`), Lê Minh Tuấn (`stu_tuan_03`).
  - Thiết bị 1: Điện thoại GVCN Cô Lan (App React Native).
  - Thiết bị 2: Điện thoại Phụ huynh của em Trần Phương Mai (đã cài App, đã cấp quyền thông báo FCM).
  - Thiết bị 3: Laptop/Tablet của GVBM Toán Thầy Tuấn kết nối màn hình chiếu lớp học.

- **DỮ LIỆU ĐẦU VÀO VÀ CÁC THIẾT LẬP:**
  - Lớp: `6A1` (ID: `cls_6a1_2026`), Môn học: `Toán học (MATH)`.
  - Trạng thái điểm danh tiết 1 ngày hiện tại:
    - Em Nguyễn Hoàng Long: Có mặt (`PRESENT`).
    - Em Trần Phương Mai: Vắng mặt không phép (`ABSENT_UNEXCUSED`).
    - Em Lê Minh Tuấn: Có mặt (`PRESENT`).
  - Điểm kiểm tra bài cũ dự kiến: `9.5` điểm, lời nhận xét: *"Thuộc bài tốt, giải toán nhanh"*.

- **CÁC BƯỚC THỰC HIỆN CHI TIẾT (CHUỖI HÀNH ĐỘNG E2E):**

  1. **Bước 1 (GVCN thực hiện điểm danh đầu giờ):**
     - Trên **Thiết bị 1 (App GVCN)**, Cô Lan mở màn hình "Điểm danh chuyên cần" của lớp `6A1` tiết 1.
     - Đánh dấu: Em Long (Có mặt), Em Mai (Vắng mặt), Em Tuấn (Có mặt).
     - Nhấn nút **"Lưu điểm danh"**.

  2. **Bước 2 (Kiểm tra cảnh báo tức thì tới Phụ huynh học sinh vắng):**
     - Quan sát **Thiết bị 2 (Điện thoại Phụ huynh em Mai)**.
     - Trong vòng < 3 giây, kiểm tra thanh trạng thái xuất hiện Push Notification FCM: *"Học sinh Trần Phương Mai vắng mặt tiết 1 ngày hôm nay tại lớp 6A1..."*.
     - Phụ huynh chạm vào thông báo $\rightarrow$ App mở đúng vào màn hình Chi tiết chuyên cần của con.

  3. **Bước 3 (GVBM mở Vòng quay may mắn kiểm tra bài cũ trên màn chiếu):**
     - Trên **Thiết bị 3 (Màn chiếu GVBM)**, Thầy Tuấn mở tính năng **"Dò bài cũ & Vòng quay học sinh"** môn Toán.
     - Hệ thống gọi API lấy danh sách ứng viên vòng quay.
     - Quan sát các nan quạt hiển thị trên vòng quay may mắn trên màn chiếu.

  4. **Bước 4 (Kiểm tra thao tác Quay số và nút Bỏ qua - Skip):**
     - Thầy Tuấn nhấn nút **"Quay số"**. Vòng quay khởi chạy kèm hiệu ứng âm thanh hồi hộp và dừng lại ở nan quạt của học sinh **Lê Minh Tuấn**.
     - Giả định học sinh Tuấn bất ngờ bị đau bụng xin xuống phòng y tế.
     - Thầy Tuấn nhấn nút **"Bỏ qua (Skip)"**.
     - Hệ thống lập tức tự động kích hoạt vòng quay mới mà không cần thao tác tải lại trang.
     - Vòng quay dừng lại ở học sinh **Nguyễn Hoàng Long**.

  5. **Bước 5 (Học sinh trả lời bài cũ và Giáo viên nhập điểm tại chỗ):**
     - Em Long lên bảng trả lời câu hỏi bài cũ.
     - Thầy Tuấn chấm điểm tại pop-up trên màn hình: Điểm số `9.5`, nhận xét *"Thuộc bài tốt, giải toán nhanh"*.
     - Bấm nút **"Lưu điểm bài cũ"**.

  6. **Bước 6 (Kiểm tra tính nhất quán toàn diện trên Sổ điểm môn Toán):**
     - Thầy Tuấn chuyển sang tab **"Sổ điểm điện tử"** môn Toán của lớp `6A1`.
     - Kiểm tra cột điểm kiểm tra miệng (`ORAL_TEST`) của học sinh Nguyễn Hoàng Long.

- **KẾT QUẢ MONG ĐỢI TOÀN HỆ THỐNG (END-TO-END CRITERIA):**
  1. **Tại Bước 1 & 2:** Điểm danh lưu thành công vào collection `/attendances` trong < 1 giây; Điện thoại Phụ huynh em Mai nhận thông báo đẩy FCM trong < 3 giây với nội dung rõ ràng, chuẩn xác.
  2. **Tại Bước 3:** Vòng quay may mắn trên màn chiếu chỉ hiển thị duy nhất **2 nan quạt (Em Long và Em Tuấn)**. Học sinh Mai (vắng mặt) **tuyệt đối không xuất hiện** trên vòng quay.
  3. **Tại Bước 4:** Nút **"Bỏ qua (Skip)"** hoạt động trơn tru, vòng quay tự động tiếp tục và chọn học sinh mới một cách khách quan, công bằng.
  4. **Tại Bước 5 & 6:**
     - Bản ghi điểm được lưu thành công vào lịch sử kiểm tra bài cũ `/quiz_results`.
     - Cột điểm miệng (`ORAL_TEST`) môn Toán của Em Long trong `/scores` lập tức hiển thị giá trị `9.5` cùng lời nhận xét mà không cần giáo viên phải nhập lại thủ công.
     - Dữ liệu đồng bộ Realtime nhất quán 100% trên Cloud Firestore.

- **TRẠNG THÁI KIỂM THỬ:** 

---

### ST03_E2E_AI_Doc_Quiz_Gamification_TC01 : QUY TRÌNH TRỢ GIẢNG SỐ HÓA AI: TẢI GIÁO ÁN, GEMINI AI SINH TRẮC NGHIỆM, TRÌNH CHIẾU MINI-GAME LỚP HỌC VÀ ĐỒNG BỘ ĐIỂM THI ĐUA

- **MỤC TIÊU KIỂM THỬ:**
  Xác minh toàn bộ quy trình trợ giảng thông minh 5-10 phút đầu giờ: Giáo viên tải tệp giáo án (`.docx`/`.pdf`) lên Firebase Cloud Storage $\rightarrow$ Google Gemini AI (`gemini-1.5-flash`) bóc tách văn bản sinh câu hỏi trắc nghiệm $\rightarrow$ Giáo viên duyệt bộ câu hỏi $\rightarrow$ Chuyển đổi thành Mini-Game lớp học (*Rung Chuông Vàng / Đua Xe / Hộp Quà*) chiếu lên bảng lớp $\rightarrow$ Cả lớp tham gia thi đua $\rightarrow$ Giáo viên lưu điểm thi đua trực tiếp từ màn hình game $\rightarrow$ Điểm số đồng bộ vào sổ điểm môn học trên Cloud Firestore.

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên bộ môn Toán Thầy Tuấn đã đăng nhập trên Laptop kết nối Smartboard/Máy chiếu phòng học.
  - Tệp giáo án bài giảng: `Bai12_PhepCongPhanSo.docx` (Dung lượng 2.5MB) đã chuẩn bị sẵn trên máy.
  - Môi trường Staging kết nối Google Gemini GenAI API với hạn ngạch gọi AI khả dụng.

- **DỮ LIỆU ĐẦU VÀO VÀ CÁC THIẾT LẬP:**
  - Lớp: `6A1`, Môn học: `Toán học (MATH)`.
  - Cấu hình AI: Số lượng câu hỏi: `5 câu`, Độ khó: `Vừa (MEDIUM)`, Thời gian mỗi câu: `30 giây`.
  - Chế độ Mini-Game lựa chọn: **Rung Chuông Vàng (Golden Bell)**.

- **CÁC BƯỚC THỰC HIỆN CHI TIẾT (CHUỖI HÀNH ĐỘNG E2E):**

  1. **Bước 1 (Tải tệp giáo án lên hệ thống):**
     - Trên Laptop, Thầy Tuấn mở mục **"Kiểm tra bài cũ / Trợ giảng AI"**.
     - Bấm nút "Tải lên giáo án", chọn tệp `Bai12_PhepCongPhanSo.docx`.
     - Chọn số lượng câu: `5`, chọn độ khó: `Vừa`.
     - Nhấn nút **"Bắt đầu sinh câu hỏi bằng AI"**.

  2. **Bước 2 (Kiểm tra quá trình xử lý của Storage & Gemini AI Engine):**
     - Backend NestJS tải tệp an toàn lên Firebase Cloud Storage.
     - Dịch vụ AI trích xuất văn bản giáo án, gửi prompt cấu trúc JSON tới Google Gemini API (`gemini-1.5-flash`).
     - Quan sát màn hình hiển thị thanh tiến trình xử lý trong < 15 giây.

  3. **Bước 3 (Duyệt bộ câu hỏi và Chuyển đổi thành Mini-Game):**
     - Màn hình hiển thị danh sách 5 câu hỏi trắc nghiệm kèm 4 đáp án (A, B, C, D) và lời giải thích chi tiết.
     - Thầy Tuấn duyệt nhanh nội dung, bấm nút **"Biến thành Trò chơi (Gamify)"**.
     - Hệ thống hiển thị 3 chế độ: Rung Chuông Vàng, Đua xe vượt chướng ngại vật, Hộp quà bí mật. Thầy Tuấn chọn **"Rung Chuông Vàng"** và bấm **"Bắt đầu Game"**.

  4. **Bước 4 (Trình chiếu Mini-Game toàn màn hình tại lớp):**
     - Giao diện Web chuyển sang chế độ Fullscreen với đồ họa rực rỡ, nhạc nền sôi động.
     - Thầy Tuấn bấm bắt đầu câu hỏi 1: Đồng hồ đếm ngược 30 giây kích hoạt.
     - Học sinh toàn lớp hào hứng suy nghĩ và cùng giơ bảng chọn đáp án.
     - Thầy Tuấn click mở đáp án đúng: Hiệu ứng pháo hoa bùng nổ, âm thanh reo hò vang lên, các học sinh trả lời đúng được tiếp tục ở lại sàn thi đấu.
     - Lần lượt qua 5 câu hỏi, chọn ra nhóm 3 học sinh xuất sắc nhất trụ lại đến câu cuối cùng (trong đó có Em Long và Em Tuấn).

  5. **Bước 5 (Lưu điểm thưởng thi đua vào Sổ điểm môn học):**
     - Tại màn hình Vinh danh kết thúc game, Thầy Tuấn tích chọn cộng điểm thưởng `10` điểm cho các học sinh chiến thắng.
     - Bấm nút **"Lưu điểm vào Sổ điểm môn học"**.

- **KẾT QUẢ MONG ĐỢI TOÀN HỆ THỐNG (END-TO-END CRITERIA):**
  1. **Tại Bước 1 & 2:** Tệp giáo án lưu thành công trên Firebase Storage; Gemini AI trả về chính xác 5 câu hỏi trắc nghiệm đúng chủ đề bài giảng trong thời gian < 15 giây mà không xảy ra timeout; Hạn mức gọi AI trong ngày của giáo viên tự động trừ 1 lượt.
  2. **Tại Bước 3 & 4:** Mini-game chuyển đổi mượt mà, hiển thị chuẩn tỉ lệ trên máy chiếu không bị vỡ giao diện; Âm thanh, hiệu ứng đếm ngược và mở đáp án hoạt động hoàn hảo.
  3. **Tại Bước 5:** Bản ghi kết quả game được lưu vào `/quiz_results`; Điểm thưởng lập tức được ghi nhận vào cột điểm kiểm tra của học sinh trong `/scores`, đồng bộ nhất quán trên toàn hệ thống.

- **TRẠNG THÁI KIỂM THỬ:** 

---

### ST04_E2E_Grades_Leaderboard_Publish_FCM_TC01 : QUY TRÌNH QUẢN TRỊ SỔ ĐIỂM ĐA MÔN, TRÌNH CHIẾU LEADERBOARD MÔN HỌC VINH DANH VÀ CÔNG BỐ ĐIỂM GỬI FCM

- **MỤC TIÊU KIỂM THỬ:**
  Xác minh quy trình quản trị bảng điểm đa môn học: GVBM chọn lớp, môn giảng dạy, học kỳ & cột điểm thành phần $\rightarrow$ Nhập bảng điểm thang 10 cho cả lớp $\rightarrow$ Hệ thống tự động xếp hạng $\rightarrow$ Trình chiếu **Bảng xếp hạng (Leaderboard) Điểm Môn Học** vinh danh Top 1, Top 2, Top 3 kèm hiệu ứng pháo hoa tại lớp $\rightarrow$ Bấm nút "Công bố điểm" $\rightarrow$ Cập nhật cờ `is_published = true` $\rightarrow$ Firebase FCM phát thông báo điểm mới tức thì tới toàn thể phụ huynh trong lớp $\rightarrow$ Phụ huynh mở app kiểm tra điểm chi tiết của con em.

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Thiết bị 1: Tablet/Laptop của Thầy Tuấn (GVBM Toán) kết nối máy chiếu lớp học.
  - Thiết bị 2: Điện thoại Phụ huynh Anh Hùng (cha em Hoàng Long) cài App React Native.
  - Lớp `6A1` đã có danh sách học sinh; Thầy Tuấn có quyền giảng dạy môn Toán.

- **DỮ LIỆU ĐẦU VÀO VÀ CÁC THIẾT LẬP:**
  - Lớp: `6A1`, Môn học: `Toán học (MATH)`, Học kỳ: `Học kỳ 1 (SEMESTER_1)`.
  - Cột điểm thành phần: Kiểm tra 15 phút thường xuyên (`TEST_15P`).
  - Danh sách điểm nhập:
    - Em Nguyễn Hoàng Long: `10.0`
    - Em Lê Minh Tuấn: `9.0`
    - Em Trần Phương Mai: `8.5`

- **CÁC BƯỚC THỰC HIỆN CHI TIẾT (CHUỖI HÀNH ĐỘNG E2E):**

  1. **Bước 1 (GVBM mở Sổ điểm và nhập điểm môn học):**
     - Trên **Thiết bị 1 (Tablet GVBM)**, Thầy Tuấn vào mục "Sổ điểm điện tử", chọn lớp `6A1`, môn `Toán học`.
     - Chọn Học kỳ `1`, chọn cột điểm `Kiểm tra 15 phút (TEST_15P)`.
     - Nhập điểm: Long (`10.0`), Tuấn (`9.0`), Mai (`8.5`).
     - Bấm nút **"Lưu bảng điểm"**.

  2. **Bước 2 (Kiểm tra lưu trữ Cloud Firestore):**
     - Backend NestJS tiếp nhận dữ liệu, ghi 3 bản ghi điểm vào collection `/scores` với cờ mặc định `is_published = false` (chưa công bố cho phụ huynh).
     - Hệ thống tính toán phân loại thứ hạng điểm môn học.

  3. **Bước 3 (Trình chiếu Bảng xếp hạng Leaderboard tại lớp học):**
     - Thầy Tuấn bấm chọn chức năng **"Trình chiếu Bảng Xếp Hạng Môn Học"**.
     - Màn hình chuyển sang chế độ Leaderboard Fullscreen chiếu lên bảng lớp:
       - Top 1: Nguyễn Hoàng Long (10.0 điểm - Huy hiệu Hoa điểm mười).
       - Top 2: Lê Minh Tuấn (9.0 điểm).
       - Top 3: Trần Phương Mai (8.5 điểm).
     - Hiệu ứng pháo hoa, vương miện rực rỡ hiển thị trên màn hình trong sự vỗ tay của cả lớp.

  4. **Bước 4 (Giáo viên thực hiện Công bố điểm môn học):**
     - Sau khi học sinh xem xong bảng xếp hạng, Thầy Tuấn bấm nút **"Công bố điểm môn học"**.
     - Xác nhận pop-up: *"Bạn có chắc chắn muốn công bố điểm và gửi thông báo tới phụ huynh toàn lớp?"*.

  5. **Bước 5 (Kiểm tra thông báo đẩy FCM trên điện thoại Phụ huynh):**
     - Quan sát **Thiết bị 2 (Điện thoại Phụ huynh Anh Hùng)**.
     - Trong vòng < 3 giây, điện thoại rung và xuất hiện Push Notification: *"Đã có điểm kiểm tra 15 phút môn Toán của học sinh Nguyễn Hoàng Long: 10.0 điểm..."*.
     - Phụ huynh chạm vào thông báo $\rightarrow$ App mở trực tiếp vào Bảng điểm môn Toán hiển thị điểm số `10.0` cùng phổ điểm của lớp.

- **KẾT QUẢ MONG ĐỢI TOÀN HỆ THỐNG (END-TO-END CRITERIA):**
  1. **Tại Bước 1 & 2:** Bảng điểm lưu thành công trong < 1 giây; Hệ thống lưu đúng các cột điểm thành phần theo quy định, không tính GPA chung sai lệch; Cờ `is_published` ban đầu là `false`.
  2. **Tại Bước 3:** Leaderboard hiển thị chuẩn xác Top 1, 2, 3 dựa trên điểm môn Toán; Giao diện trình chiếu trực quan, hiệu ứng động mượt mà, tạo động lực thi đua học tập.
  3. **Tại Bước 4 & 5:** Cờ `is_published` trong `/scores` chuyển sang `true`; FCM gửi multicast tới 100% phụ huynh có con trong danh sách vào điểm; Phụ huynh nhận đúng điểm của con mình trong < 3 giây.

- **TRẠNG THÁI KIỂM THỬ:** 

---

### ST05_E2E_Exam_Reminder_And_Student_Remark_TC01 : QUY TRÌNH TƯƠNG TÁC HAI CHIỀU: PHÁT LỜI NHẮC LỊCH KIỂM TRA ÔN TẬP VÀ GỬI NHẬN XÉT CÁ NHÂN KÈM XÁC NHẬN ĐÃ ĐỌC

- **MỤC TIÊU KIỂM THỬ:**
  Xác minh chuỗi tương tác thông tin sư phạm hai chiều giữa nhà trường và gia đình: Giáo viên tạo lời nhắc lịch kiểm tra sắp tới phát đồng loạt tới cả lớp $\rightarrow$ Giáo viên gửi lời nhận xét cá nhân ngắn gọn bằng văn bản thuần túy (không dùng nhãn tags) $\rightarrow$ Phụ huynh nhận thông báo FCM tức thì $\rightarrow$ Phụ huynh mở ứng dụng xem chi tiết và bấm nút **"Xác nhận đã đọc"** $\rightarrow$ Dữ liệu xác nhận đồng bộ thời gian thực về phía giáo viên.

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Thiết bị 1: Điện thoại của GVCN Cô Lan (App React Native).
  - Thiết bị 2: Điện thoại của Phụ huynh Anh Hùng (App React Native).
  - Học sinh Nguyễn Hoàng Long đã được kết nối với tài khoản của Phụ huynh Anh Hùng.

- **DỮ LIỆU ĐẦU VÀO VÀ CÁC THIẾT LẬP:**
  - Lớp: `6A1`, Môn học: `Ngữ văn (LIT)`.
  - Thông tin Lời nhắc kiểm tra:
    - Loại bài kiểm tra: `Kiểm tra 1 tiết định kỳ (TEST_1P)`.
    - Ngày kiểm tra: Ngày mai (29/09/2026).
    - Lời dặn dò: *"Các em về nhà ôn kỹ các bài thơ bốn chữ, chuẩn bị bút dạ và giấy kiểm tra đầy đủ"*.
  - Thông tin Lời nhận xét cá nhân:
    - Học sinh: Nguyễn Hoàng Long.
    - Nội dung text ngắn: *"Hôm nay Long phát biểu xây dựng bài rất sôi nổi và giúp đỡ bạn cùng bàn"*.

- **CÁC BƯỚC THỰC HIỆN CHI TIẾT (CHUỖI HÀNH ĐỘNG E2E):**

  1. **Bước 1 (Giáo viên tạo và phát Lời nhắc lịch kiểm tra toàn lớp):**
     - Trên **Thiết bị 1 (App GVCN)**, Cô Lan vào mục "Lịch kiểm tra & Dặn dò", chọn tạo lời nhắc mới.
     - Chọn môn Ngữ văn, loại kiểm tra 1 tiết, ngày mai và nhập nội dung dặn dò ôn tập.
     - Bấm nút **"Gửi lời nhắc tới Phụ huynh"**.

  2. **Bước 2 (Kiểm tra Phụ huynh nhận lời nhắc kiểm tra trên App):**
     - Quan sát **Thiết bị 2 (Điện thoại Phụ huynh Anh Hùng)**.
     - Xuất hiện thông báo FCM: *"Lịch kiểm tra môn Ngữ văn ngày 29/09/2026 kèm lời dặn dò của giáo viên..."*.
     - Phụ huynh chạm thông báo $\rightarrow$ App mở màn hình Sổ liên lạc mục Lịch thi hiển thị rõ ràng nội dung dặn dò để đôn đốc con học bài tối nay.

  3. **Bước 3 (Giáo viên gửi nhận xét cá nhân ngắn gọn dạng text):**
     - Trên **Thiết bị 1 (App GVCN)**, Cô Lan mở danh sách học sinh lớp `6A1`, chọn em **Nguyễn Hoàng Long**.
     - Nhập trực tiếp đoạn text ngắn: *"Hôm nay Long phát biểu xây dựng bài rất sôi nổi và giúp đỡ bạn cùng bàn"*.
     - Bấm nút **"Gửi nhận xét"**.

  4. **Bước 4 (Phụ huynh nhận xét và bấm nút Xác nhận đã đọc):**
     - Trên **Thiết bị 2 (Điện thoại Phụ huynh Anh Hùng)**, nhận tiếp Push Notification: *"Cô Lan đã gửi nhận xét mới về học sinh Nguyễn Hoàng Long"*.
     - Phụ huynh mở xem chi tiết lời nhận xét trên App.
     - Tại góc dưới lời nhận xét, xuất hiện nút **"Xác nhận đã đọc"**. Phụ huynh bấm vào nút này.

  5. **Bước 5 (Kiểm tra trạng thái xác nhận trên ứng dụng Giáo viên):**
     - Quay lại **Thiết bị 1 (App GVCN)**, Cô Lan xem chi tiết bản ghi nhận xét của em Long.
     - Kiểm tra trạng thái đã chuyển sang: *"Phụ huynh đã đọc lúc [thời gian hiện tại]"*.

- **KẾT QUẢ MONG ĐỢI TOÀN HỆ THỐNG (END-TO-END CRITERIA):**
  1. **Tại Bước 1 & 2:** Bản ghi lời nhắc lưu vào `/exam_reminders`; FCM phát multicast tới 100% phụ huynh của lớp `6A1` trong thời gian < 3 giây; Nội dung dặn dò hiển thị đầy đủ, không bị cắt xén.
  2. **Tại Bước 3:** Bản ghi nhận xét lưu vào `/remarks` dưới dạng văn bản thuần túy, cờ `is_published = true`, `is_read = false`; FCM gửi đích danh duy nhất tới thiết bị của Phụ huynh Anh Hùng.
  3. **Tại Bước 4 & 5:** Khi phụ huynh bấm xác nhận, API `PATCH /api/v1/remarks/:id/acknowledge` thực thi thành công, cập nhật `is_read = true` và `read_at = timestamp` trong Firestore; App Giáo viên cập nhật trạng thái đã đọc tức thì qua Realtime Snapshot.

- **TRẠNG THÁI KIỂM THỬ:** 

---

### ST06_E2E_Fees_Insurance_Checklist_Remind_TC01 : QUY TRÌNH QUẢN TRỊ TÀI CHÍNH HỌC ĐƯỜNG: THU NỘP BHYT/HỌC PHÍ 1-CHẠM VÀ PHÁT THÔNG BÁO ĐÔN ĐỐC ĐÍCH DANH

- **MỤC TIÊU KIỂM THỬ:**
  Xác minh quy trình quản trị nghĩa vụ tài chính học sinh: GVCN mở danh sách quản lý nộp Học phí & BHYT $\rightarrow$ Phụ huynh nộp tiền trực tiếp tại trường $\rightarrow$ GVCN tích chọn 1-chạm cập nhật cờ boolean (`is_paid_tuition`, `is_paid_insurance`) $\rightarrow$ Cập nhật thời gian thực vào Cloud Firestore $\rightarrow$ GVCN lọc danh sách học sinh "Chưa nộp BHYT" $\rightarrow$ Bấm nút "Gửi nhắc nhở phụ huynh" $\rightarrow$ Hệ thống gửi thông báo FCM đôn đốc tới đúng nhóm phụ huynh chưa nộp $\rightarrow$ Phụ huynh mở app kiểm tra trạng thái nghĩa vụ tài chính của con.

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Thiết bị 1: Điện thoại của GVCN Cô Lan (App React Native).
  - Thiết bị 2: Điện thoại của Phụ huynh Anh Hùng (phụ huynh em Long - chuẩn bị nộp tiền).
  - Thiết bị 3: Điện thoại của Phụ huynh em Lê Minh Tuấn (chưa nộp tiền BHYT).
  - Bản ghi `/fees_and_insurance` của các học sinh lớp `6A1` ban đầu đều có cờ `false`.

- **DỮ LIỆU ĐẦU VÀO VÀ CÁC THIẾT LẬP:**
  - Lớp: `6A1`, Năm học: `2026-2027`.
  - Nghiệp vụ: Xác nhận em Long đã nộp tiền BHYT học sinh; Em Tuấn và Em Mai chưa nộp.

- **CÁC BƯỚC THỰC HIỆN CHI TIẾT (CHUỖI HÀNH ĐỘNG E2E):**

  1. **Bước 1 (GVCN xác nhận thu tiền BHYT của học sinh tại lớp):**
     - Phụ huynh Anh Hùng đến nộp tiền BHYT trực tiếp cho Cô Lan tại trường.
     - Trên **Thiết bị 1 (App GVCN)**, Cô Lan mở mục "Quản lý Thu phí & BHYT" lớp `6A1`.
     - Tìm học sinh Nguyễn Hoàng Long, chạm vào ô checkbox cột **Bảo hiểm Y tế (BHYT)**.
     - Checkbox lập tức chuyển sang màu xanh (Tích chọn hoàn thành).

  2. **Bước 2 (Kiểm tra Phụ huynh xem trạng thái ĐÃ NỘP trên App):**
     - Trên **Thiết bị 2 (Điện thoại Phụ huynh Anh Hùng)**, mở mục "Học phí & BHYT".
     - Kiểm tra trạng thái hiển thị: BHYT: **ĐÃ NỘP (Tích xanh)** kèm ngày giờ xác nhận.

  3. **Bước 3 (GVCN lọc danh sách chưa nộp BHYT và gửi thông báo đôn đốc):**
     - Trên **Thiết bị 1 (App GVCN)**, Cô Lan bấm vào bộ lọc: **"Chưa nộp BHYT"**.
     - Danh sách lập tức lọc ra 2 học sinh: Trần Phương Mai và Lê Minh Tuấn.
     - Cô Lan bấm nút **"Gửi nhắc nhở nộp BHYT tới Phụ huynh"**.
     - Xác nhận hộp thoại gửi thông báo đôn đốc kèm hạn chót đóng phí.

  4. **Bước 4 (Kiểm tra phân luồng thông báo đẩy FCM tới đúng phụ huynh mục tiêu):**
     - Quan sát **Thiết bị 3 (Điện thoại Phụ huynh em Tuấn - chưa nộp)**: Nhận được Push Notification: *"Nhắc nhở nộp Bảo hiểm Y tế: Học sinh Lê Minh Tuấn chưa hoàn thành nộp BHYT, hạn chót ngày 05/10/2026..."*.
     - Quan sát **Thiết bị 2 (Điện thoại Phụ huynh Anh Hùng - đã nộp)**: **Tuyệt đối KHÔNG nhận** thông báo nhắc nhở này.

  5. **Bước 5 (Phụ huynh chưa nộp mở tra cứu thông tin trên App):**
     - Phụ huynh em Tuấn chạm vào thông báo $\rightarrow$ App mở mục BHYT hiển thị cảnh báo màu vàng: **CHƯA NỘP**, kèm số tiền và hướng dẫn đóng trực tiếp cho GVCN.

- **KẾT QUẢ MONG ĐỢI TOÀN HỆ THỐNG (END-TO-END CRITERIA):**
  1. **Tại Bước 1 & 2:** Thao tác chạm toggle thực thi trong < 500ms; Document `/fees_and_insurance` của em Long cập nhật trường `is_paid_insurance = true` và `paid_at = timestamp`; App Phụ huynh em Long cập nhật trạng thái thời gian thực.
  2. **Tại Bước 3 & 4:** Bộ lọc hoạt động chính xác 100%; FCM Dispatcher phân luồng chuẩn xác: chỉ gửi multicast tới phụ huynh của học sinh có cờ `is_paid_insurance = false`, hoàn toàn không gửi nhầm tới phụ huynh đã nộp tiền.
  3. **Tại Bước 5:** Màn hình tài chính của phụ huynh hiển thị minh bạch, rõ ràng, không gây hiểu nhầm.

- **TRẠNG THÁI KIỂM THỬ:** 

---

### ST07_E2E_Parent_Portal_Multi_Child_Sync_TC01 : QUY TRÌNH CỔNG PHỤ HUYNH ĐA CON EM: CHUYỂN ĐỔI LINH HOẠT HỒ SƠ CON, ĐỒNG BỘ DỮ LIỆU HỌC BẠ VÀ CHỐNG TRUY VẬN TRÁI PHÉP (IDOR)

- **MỤC TIÊU KIỂM THỬ:**
  Xác minh tính năng toàn diện của Cổng Phụ huynh (Parent Portal) khi một phụ huynh có nhiều con theo học các lớp khác nhau: Đăng nhập $\rightarrow$ Chuyển đổi linh hoạt giữa các con $\rightarrow$ Đồng bộ tức thời dữ liệu học vụ (Bảng điểm đa môn, ngày vắng chuyên cần, cờ nộp BHYT, nhận xét giáo viên) $\rightarrow$ Đảm bảo tính độc lập dữ liệu tuyệt đối giữa các con $\rightarrow$ Xác minh cơ chế bảo mật phía Backend ngăn chặn hoàn toàn việc xem trái phép hồ sơ con nhà khác (Chống lỗ hổng IDOR).

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Tài khoản Phụ huynh Chị Hạnh (`uid_parent_hanh`) đã đăng nhập trên App React Native.
  - Chị Hạnh có 2 con:
    - Con thứ nhất: Em Nguyễn Hoàng Long (`stu_long_01`), học lớp `6A1`.
    - Con thứ hai: Em Nguyễn Bảo Nam (`stu_nam_04`), học lớp `2B`.
  - Một học sinh khác không liên quan: Em Lê Minh Tuấn (`stu_tuan_03`), học lớp `6A1` (con của phụ huynh khác).

- **DỮ LIỆU ĐẦU VÀO VÀ CÁC THIẾT LẬP:**
  - Token Firebase Auth hợp lệ của Chị Hạnh.
  - Hồ sơ em Long: Lớp `6A1`, Điểm Toán: `10.0`, BHYT: Đã nộp.
  - Hồ sơ em Nam: Lớp `2B`, Điểm Tiếng Việt: `9.0`, BHYT: Chưa nộp.

- **CÁC BƯỚC THỰC HIỆN CHI TIẾT (CHUỖI HÀNH ĐỘNG E2E):**

  1. **Bước 1 (Đăng nhập và kiểm tra hồ sơ con thứ nhất - Em Long lớp 6A1):**
     - Chị Hạnh mở App Phụ huynh trên điện thoại.
     - Thanh tiêu đề hiển thị tên con: **Nguyễn Hoàng Long - Lớp 6A1**.
     - Chị Hạnh kiểm tra tab Sổ điểm: Thấy điểm 15 phút Toán `10.0`.
     - Kiểm tra tab Học phí & BHYT: Thấy trạng thái BHYT **ĐÃ NỘP**.

  2. **Bước 2 (Chuyển đổi hồ sơ sang con thứ hai - Em Nam lớp 2B):**
     - Tại góc trên màn hình, Chị Hạnh bấm vào nút **"Đổi hồ sơ con"** $\rightarrow$ Chọn **Nguyễn Bảo Nam - Lớp 2B**.
     - Màn hình App cập nhật giao diện trong < 1 giây.
     - Kiểm tra tab Sổ điểm: Hiển thị bảng điểm lớp 2B môn Tiếng Việt `9.0`, hoàn toàn không còn dữ liệu điểm môn Toán lớp 6 của anh trai.
     - Kiểm tra tab Học phí & BHYT: Hiển thị trạng thái BHYT **CHƯA NỘP**.

  3. **Bước 3 (Kiểm tra bảo mật: Cố tình truy vấn trái phép dữ liệu học sinh khác - Chống IDOR):**
     - Sử dụng công cụ kiểm thử bảo mật API (Postman / Burp Suite), gắn Access Token của Chị Hạnh nhưng gửi request tra cứu bảng điểm và thông tin BHYT của học sinh không liên quan:
       `GET /api/v1/students/stu_tuan_03/academic`
       `GET /api/v1/students/stu_tuan_03/fees-insurance`
     - Quan sát phản hồi từ API Gateway và Backend NestJS.

- **KẾT QUẢ MONG ĐỢI TOÀN HỆ THỐNG (END-TO-END CRITERIA):**
  1. **Tại Bước 1 & 2:** Thao tác chuyển đổi hồ sơ giữa 2 con diễn ra tức thì, giao diện mượt mà; Dữ liệu điểm số, chuyên cần và BHYT của 2 con hoàn toàn độc lập, tách biệt chính xác 100%, không xảy ra hiện tượng chồng chéo bộ đệm (cache leak).
  2. **Tại Bước 3:** Backend NestJS kiểm tra mảng `parent_uids` của học sinh `stu_tuan_03`, phát hiện UID của Chị Hạnh không nằm trong danh sách $\rightarrow$ Chặn đứng ngay lập tức và trả về **HTTP 403 Forbidden** kèm mã lỗi `PARENT_STUDENT_LINK_NOT_FOUND` ("Bạn không có quyền truy cập hồ sơ của học sinh này"). Dữ liệu học sinh được bảo mật tuyệt đối.

- **TRẠNG THÁI KIỂM THỬ:** 

---

### ST08_E2E_Admin_Governance_Ban_Limit_Enforce_TC01 : QUY TRÌNH QUẢN TRỊ NỀN TẢNG: THỰC THI HẠN MỨC TÀI NGUYÊN (LIMITS) VÀ KHÓA TÀI KHOẢN VI PHẠM (BAN USER) THU HỒI PHIÊN TỨC THÌ

- **MỤC TIÊU KIỂM THỬ:**
  Xác minh năng lực quản trị toàn diện của Quản trị viên Nền tảng (Platform Admin) trên Web Quản trị Next.js: Cập nhật hạn mức tài nguyên hệ thống (số lớp tối đa, quota gọi AI hàng ngày) $\rightarrow$ Hệ thống thực thi giới hạn tức thì ngăn chặn tạo vượt ngưỡng $\rightarrow$ Admin phát hiện tài khoản có hành vi vi phạm, thực hiện thao tác **"Khóa tài khoản (Ban User)"** $\rightarrow$ Backend NestJS cập nhật CSDL Firestore, đồng thời vô hiệu hóa trên Firebase Authentication và thu hồi toàn bộ Refresh Tokens $\rightarrow$ Người dùng bị đẩy khỏi phiên đăng nhập trên thiết bị và từ chối mọi truy cập tiếp theo.

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Thiết bị 1: Máy tính Admin đăng nhập Cổng Quản trị Nền tảng trên Web Next.js.
  - Thiết bị 2: Điện thoại của Giáo viên vi phạm (`usr_teacher_bad`) đang đăng nhập hoạt động bình thường trên App React Native.
  - Giáo viên vi phạm hiện đã sở hữu sẵn 5 lớp học trên hệ thống.

- **DỮ LIỆU ĐẦU VÀO VÀ CÁC THIẾT LẬP:**
  - Thông số hạn mức: `max_classes_per_teacher = 5`, `daily_ai_quiz_quota = 20`.
  - Tài khoản bị xử lý: `usr_teacher_bad` (Giáo viên đăng tải nội dung không phù hợp).
  - Lý do khóa tài khoản: *"Vi phạm nghiêm trọng quy chuẩn đạo đức nhà giáo và điều khoản sử dụng nền tảng"*.

- **CÁC BƯỚC THỰC HIỆN CHI TIẾT (CHUỖI HÀNH ĐỘNG E2E):**

  1. **Bước 1 (Admin thiết lập hạn mức tài nguyên hệ thống):**
     - Trên **Thiết bị 1 (Web Admin)**, Admin vào mục "Cấu hình Hạn mức & Giới hạn".
     - Thiết lập số lớp tối đa cho mỗi giáo viên: `5`.
     - Nhấn nút **"Lưu cấu hình"**.
     - Backend lưu vào `/system_configs/limits`.

  2. **Bước 2 (Kiểm tra thực thi hạn ngạch khi Giáo viên cố tình tạo thêm lớp thứ 6):**
     - Trên **Thiết bị 2 (App của Giáo viên)**, giáo viên chọn "Tạo Lớp học mới" (đây là lớp thứ 6).
     - Nhập thông tin lớp và nhấn nút "Hoàn tất tạo lớp".
     - Quan sát phản hồi trên màn hình ứng dụng của giáo viên.

  3. **Bước 3 (Admin thực hiện Khóa tài khoản Giáo viên vi phạm):**
     - Trên **Thiết bị 1 (Web Admin)**, Admin vào mục "Quản lý Người dùng", tìm kiếm tài khoản `usr_teacher_bad`.
     - Nhấn nút **"Khóa tài khoản (Ban User)"**, nhập lý do vi phạm và xác nhận.

  4. **Bước 4 (Backend xử lý đồng bộ Firebase Auth & Firestore):**
     - Backend NestJS gọi Firebase Admin SDK: `updateUser(uid, { disabled: true })`.
     - Backend gọi `revokeRefreshTokens(uid)` để vô hiệu hóa phiên làm việc của người dùng.
     - Cập nhật trường `is_active = false`, `ban_reason = "..."` trong document `/users/usr_teacher_bad`.

  5. **Bước 5 (Kiểm tra thu hồi phiên tức thời trên thiết bị của Giáo viên):**
     - Trên **Thiết bị 2 (App của Giáo viên)**, giáo viên cố tình chạm vào bất kỳ chức năng nào (ví dụ: mở danh sách học sinh hoặc điểm danh).
     - Quan sát phản ứng của ứng dụng.

- **KẾT QUẢ MONG ĐỢI TOÀN HỆ THỐNG (END-TO-END CRITERIA):**
  1. **Tại Bước 2:** Yêu cầu tạo lớp thứ 6 bị chặn ngay lập tức tại API Gateway / Guard với mã **HTTP 400 Bad Request** kèm mã lỗi `LIMIT_EXCEEDED`; Màn hình ứng dụng hiển thị thông báo rõ ràng: *"Bạn đã đạt giới hạn tối đa 5 lớp học theo quy định của nhà trường"*.
  2. **Tại Bước 3 & 4:** Thao tác Ban hoàn thành trong < 1 giây; Tài khoản bị vô hiệu hóa trên cả Firebase Authentication và Firestore.
  3. **Tại Bước 5:** Mọi request từ thiết bị của giáo viên gửi lên Gateway lập tức bị từ chối với mã **HTTP 403 Forbidden** kèm lỗi `AUTH_USER_BANNED`; App React Native lập tức hiển thị thông báo tài khoản bị khóa kèm lý do, xóa sạch token lưu trữ nội bộ (Secure Storage) và điều hướng người dùng ra màn hình Đăng nhập.

- **TRẠNG THÁI KIỂM THỬ:** 

---

### ST09_E2E_Resilience_Offline_Sync_And_Fault_Tolerance_TC01 : QUY TRÌNH PHỤC HỒI SỰ CỐ, VẬN HÀNH NGOẠI TUYẾN (OFFLINE SYNC) VÀ CHỊU LỖI NGOẠI VI (AI TIMEOUT & FCM CLEANUP)

- **MỤC TIÊU KIỂM THỬ:**
  Xác minh khả năng phục hồi (Resilience), tính sẵn sàng cao và khả năng chịu lỗi (Fault Tolerance) của toàn bộ hệ thống trong các kịch bản môi trường khắc nghiệt:
  1. GVCN điểm danh nề nếp trong điều kiện phòng học bị mất sóng Wi-Fi/4G $\rightarrow$ Ứng dụng lưu bộ đệm offline và tự động đồng bộ khi có mạng trở lại, đảm bảo không trùng lặp dữ liệu (Idempotency).
  2. Tải giáo án sinh câu hỏi khi Google Gemini AI bị quá tải/timeout quá 15 giây $\rightarrow$ Hệ thống ngắt an toàn (Graceful Degradation), giải phóng tài nguyên tạm, không trừ hạn ngạch và thông báo rõ ràng cho giáo viên.
  3. Bắn thông báo đẩy toàn lớp trong trường hợp có thiết bị phụ huynh bị gỡ app / token FCM hết hạn $\rightarrow$ Hệ thống vẫn chuyển phát thành công tới các phụ huynh khác, đồng thời tự động dọn dẹp token hỏng.

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Thiết bị 1: Điện thoại GVCN cài App React Native.
  - Thiết bị 2: Thiết bị kiểm thử có khả năng ngắt kết nối mạng (bật Airplane Mode).
  - Trình giả lập Mock Gemini AI được cấu hình trễ mạng 20 giây (gây Timeout).
  - Một tài khoản phụ huynh trong lớp có FCM Device Token đã bị vô hiệu hóa (`UNREGISTERED_TOKEN`).

- **DỮ LIỆU ĐẦU VÀO VÀ CÁC THIẾT LẬP:**
  - Lớp: `6A1`, Tiết học: Tiết 1 ngày kiểm thử.
  - File giáo án: `BaiKiemTraThu.docx`.

- **CÁC BƯỚC THỰC HIỆN CHI TIẾT (CHUỖI HÀNH ĐỘNG E2E):**

  1. **Bước 1 (Điểm danh trong tình trạng mất sóng mạng - Offline Handling):**
     - Trên **Thiết bị 1 (App GVCN)**, bật chế độ Máy bay (ngắt hoàn toàn Wi-Fi và 4G).
     - Mở mục Điểm danh lớp `6A1`, đánh dấu Em Mai vắng học, bấm nút **"Lưu điểm danh"**.
     - Quan sát màn hình ứng dụng: Hiển thị thông báo *"Đã lưu điểm danh vào bộ nhớ tạm ngoại tuyến. Hệ thống sẽ tự động đồng bộ khi có kết nối mạng"*.

  2. **Bước 2 (Khôi phục kết nối mạng và đối soát đồng bộ tự động):**
     - Bật lại Wi-Fi/4G trên thiết bị.
     - Sau 3 giây khi có mạng trở lại, ứng dụng tự động kích hoạt tiến trình đồng bộ ngầm.
     - Kiểm tra CSDL Cloud Firestore: Bản ghi điểm danh tiết 1 xuất hiện đầy đủ trong collection `/attendances`.
     - Giáo viên thử bấm lại nút "Lưu điểm danh": Hệ thống nhận diện bản ghi đã tồn tại, ngăn chặn trùng lặp an toàn và hiển thị thông báo nề nếp đã được cập nhật.

  3. **Bước 3 (Kiểm tra chịu lỗi khi Google Gemini AI bị Timeout > 15s):**
     - Giáo viên tải file giáo án lên để sinh câu hỏi trắc nghiệm.
     - Kích hoạt kịch bản Mock Gemini AI bị nghẽn mạng (Delay 20s).
     - Sau đúng 15 giây (ngưỡng Circuit Breaker / Timeout), Backend NestJS ngắt an toàn kết nối tới Gemini API.
     - Quan sát phản hồi trên App: Trả về thông báo thân thiện: *"Dịch vụ AI đang phản hồi chậm do quá tải, vui lòng thử lại sau giây lát hoặc sử dụng câu hỏi có sẵn"*.
     - Kiểm tra Firestore: Không phát sinh document rác dở dang; Lượt gọi AI trong ngày của giáo viên **hoàn toàn không bị trừ**.

  4. **Bước 4 (Kiểm tra xử lý dọn dẹp FCM Token hỏng mà không làm đứt đoạn luồng gửi):**
     - Giáo viên công bố điểm môn học cho cả lớp (trong lớp có 1 phụ huynh bị hỏng token thiết bị).
     - Quan sát tiến trình gửi thông báo: Backend FCM Dispatcher ghi nhận mã lỗi `messaging/registration-token-not-registered` đối với token hỏng.
     - Hệ thống tự động bắt ngoại lệ, tiếp tục gửi thành công thông báo tới các phụ huynh còn lại trong lớp.
     - Kiểm tra document `/users` của phụ huynh có token hỏng: Token không hợp lệ được tự động gỡ bỏ khỏi mảng `fcm_tokens` để tránh lãng phí tài nguyên cho các lần gửi sau.

- **KẾT QUẢ MONG ĐỢI TOÀN HỆ THỐNG (END-TO-END CRITERIA):**
  1. **Tại Bước 1 & 2:** App hoạt động trơn tru không bị treo đơ khi mất mạng; Cơ chế Offline Sync đồng bộ dữ liệu toàn vẹn khi có mạng lại trong < 3 giây; Không xảy ra hiện tượng nhân đôi bản ghi điểm danh (Idempotent).
  2. **Tại Bước 3:** Cơ chế Timeout ngắt chính xác ở mốc 15 giây; Hệ thống bảo toàn tính toàn vẹn dữ liệu, giải phóng file rác và hoàn trả hạn ngạch cho người dùng.
  3. **Tại Bước 4:** Tỷ lệ gửi thông báo tới các thiết bị hợp lệ đạt 100%; Token hỏng được tự động nhận diện và làm sạch khỏi cơ sở dữ liệu mà không làm sập tiến trình nền.

- **TRẠNG THÁI KIỂM THỬ:** 

---

## 4. TỔNG KẾT & MA TRẬN ĐÁNH GIÁ MỨC ĐỘ BAO PHỦ HỆ THỐNG (TRACEABILITY MATRIX)

| Mã Use Case Nghiệp Vụ | Tên Use Case Tương Ứng | Mã System Test Case (E2E) Bao Phủ | Kết Quả Đánh Giá E2E |
| :--- | :--- | :--- | :---: |
| **UC-ADM-01, 02, 03** | CRUD, Khóa tài khoản (Ban) & Hạn mức hệ thống (Limits) | **ST01_E2E_Class_Onboarding_TC01**, **ST08_E2E_Admin_Governance_Ban_Limit_Enforce_TC01** |           |
| **UC-CLS-01, 02** | Tạo Lớp học tổng, Phân công GVBM & Sinh Link mời | **ST01_E2E_Class_Onboarding_TC01** |           |
| **UC-PAR-00** | Phụ huynh tham gia lớp qua Link mời & Xác nhận con | **ST01_E2E_Class_Onboarding_TC01** |           |
| **UC-ACA-01** | Điểm danh chuyên cần nề nếp lớp chủ nhiệm | **ST02_E2E_Attend_LuckyWheel_Grade_TC01**, **ST09_E2E_Resilience_Offline_Sync_And_Fault_Tolerance_TC01** |           |
| **UC-ACA-04** | Dò bài cũ & Vòng quay Random học sinh (có nút Bỏ qua - Skip) | **ST02_E2E_Attend_LuckyWheel_Grade_TC01** |           |
| **UC-ACA-05, 06** | Import Docs/PDF AI Gemini sinh câu hỏi & 3 Mini-Game | **ST03_E2E_AI_Doc_Quiz_Gamification_TC01**, **ST09_E2E_Resilience_Offline_Sync_And_Fault_Tolerance_TC01** |           |
| **UC-ACA-02, 07** | Nhập sổ điểm đa môn & Trình chiếu Leaderboard môn học | **ST02_E2E_Attend_LuckyWheel_Grade_TC01**, **ST04_E2E_Grades_Leaderboard_Publish_FCM_TC01** |           |
| **UC-ACA-03** | Gửi nhận xét ngắn gọn thuần text & Phụ huynh xác nhận đọc | **ST05_E2E_Exam_Reminder_And_Student_Remark_TC01** |           |
| **UC-ACA-08** | Phát lời nhắc lịch kiểm tra sắp tới đôn đốc ôn thi | **ST05_E2E_Exam_Reminder_And_Student_Remark_TC01** |           |
| **UC-FEE-01** | Quản lý thu nộp BHYT/Học phí 1-chạm & Gửi nhắc nhở | **ST06_E2E_Fees_Insurance_Checklist_Remind_TC01** |           |
| **UC-PAR-01, 02, 03, 04, 05** | Cổng phụ huynh tra cứu điểm, chuyên cần, BHYT & Chống IDOR | **ST07_E2E_Parent_Portal_Multi_Child_Sync_TC01** |           |
| **HẠ TẦNG & CHỊU LỖI** | Offline Sync, Token Cleanup, Gemini Timeout Resilience | **ST09_E2E_Resilience_Offline_Sync_And_Fault_Tolerance_TC01** |           |

---
*Tài liệu được biên soạn và chuẩn hóa bởi Đội ngũ QA/QC Dự án GiaoVienHay - Phiên bản 1.0 (2026).*
