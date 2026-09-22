# Tài Liệu Đặc Tả Chi Tiết Trường Hợp Sử Dụng (Use Case Descriptions)
# Hệ Thống GiaoVienHay – Quản Lý Học Sinh Cấp 1 & Cấp 2

---

## 1. Giới thiệu

Tài liệu này đặc tả chi tiết từng bước cho các trường hợp sử dụng trọng tâm của hệ thống quản lý học sinh Cấp 1 & Cấp 2, đặc biệt là các nghiệp vụ sư phạm tương tác lớp học: **Dò bài cũ, Sinh câu hỏi bằng AI, Vòng quay Random học sinh và Tạo Mini-game lớp học**.

---

## 2. Chi tiết các Use Case Cốt Lõi

### UC-CLS-01: Giáo Viên Tự Tạo Lớp & Thêm Danh Sách Học Sinh
- **Mã Use Case:** `UC-CLS-01`
- **Tác nhân chính:** Giáo viên (GVCN & GVBM).
- **Tác nhân hỗ trợ:** Backend NestJS, Google Cloud Firestore (Collections `/classes`, `/students`, `/fees_and_insurance`).
- **Mô tả:** Giáo viên chủ động tạo lớp học mới trên hệ thống, thêm học sinh vào lớp và hệ thống tự động sinh Mã mời (Invite Code) cùng Link mời (Invite Link) để chia sẻ cho Phụ huynh.
- **Tiền điều kiện:** Giáo viên đã đăng nhập thành công vào hệ thống.
- **Hậu điều kiện:** Lớp học được khởi tạo, danh sách học sinh được lưu, link mời sẵn sàng để chia sẻ.
- **Luồng sự kiện chính (Main Flow):**
  1. Giáo viên mở màn hình "Quản lý lớp học" trên Web hoặc Mobile App, chọn "Tạo lớp học mới".
  2. Giáo viên nhập thông tin lớp: Tên lớp (ví dụ: `2A`), Khối (`2`), Niên khóa (`2026-2027`).
  3. Giáo viên thêm danh sách học sinh (nhập trực tiếp họ tên/ngày sinh hoặc dán danh sách từ bảng tính).
  4. Giáo viên nhấn "Hoàn tất tạo lớp".
  5. Backend NestJS sinh mã mời ngẫu nhiên 6-8 ký tự (`invite_code`) và đường dẫn mời (`invite_link`), lưu vào collection `/classes`.
  6. Backend lưu thông tin từng học sinh vào collection `/students` và khởi tạo bản ghi `/fees_and_insurance` với cờ FALSE.
  7. Hệ thống hiển thị thông tin lớp học thành công kèm nút "Sao chép Link mời" và "Mã QR" để gửi vào nhóm Phụ huynh (Zalo, tin nhắn).

---

### UC-PAR-00: Phụ Huynh Tham Gia Lớp Bằng Link Mời & Xác Nhận Con Em
- **Mã Use Case:** `UC-PAR-00`
- **Tác nhân chính:** Phụ huynh (Parent).
- **Tác nhân hỗ trợ:** Backend NestJS, Google Cloud Firestore (Collections `/classes`, `/students`, `/users`).
- **Mô tả:** Phụ huynh nhấp vào Link mời do Giáo viên chia sẻ, đăng nhập ứng dụng và chọn xác nhận học sinh là con của mình để kết nối vào lớp học.
- **Tiền điều kiện:** Giáo viên đã tạo lớp và chia sẻ Link mời; Phụ huynh có điện thoại thông minh.
- **Hậu điều kiện:** Tài khoản Phụ huynh được liên kết với học sinh (`parent_uids`), nhận được các thông báo và theo dõi học tập của con.
- **Luồng sự kiện chính (Main Flow):**
  1. Phụ huynh nhấp vào **Link mời tham gia lớp học** nhận được qua Zalo hoặc tin nhắn SMS.
  2. Ứng dụng (Web hoặc Mobile App React Native) mở ra với thông tin Lớp học (Tên lớp, Tên giáo viên chủ nhiệm).
  3. Phụ huynh thực hiện đăng nhập nhanh bằng Số điện thoại (xác thực mã OTP gửi về máy) hoặc Email.
  4. Sau khi đăng nhập, màn hình hiển thị danh sách học sinh của lớp.
  5. Phụ huynh tìm và tích chọn đúng tên con em mình trong danh sách, sau đó bấm "Xác nhận kết nối".
  6. Backend NestJS ghi nhận UID của phụ huynh vào mảng `parent_uids` của document học sinh trong `/students`, đồng thời gán `classId` vào thông tin tài khoản phụ huynh trong `/users`.
  7. Ứng dụng thông báo "Kết nối lớp học thành công", chuyển hướng Phụ huynh vào màn hình trang chủ của lớp để xem thông tin học vụ, chuyên cần và học phí của con.

---

### UC-ACA-02: Nhập & Phê Duyệt Sổ Điểm Đa Môn Học & Đa Cột Điểm
- **Mã Use Case:** `UC-ACA-02`
- **Tác nhân chính:** Giáo viên Bộ môn (GVBM), Giáo viên Chủ nhiệm (GVCN).
- **Tác nhân hỗ trợ:** Backend NestJS, Google Cloud Firestore (Collection `/scores`), Firebase FCM.
- **Mô tả:** Giáo viên mở sổ điểm điện tử, lựa chọn Môn học phụ trách (Toán, Tiếng Việt, Tiếng Anh, Khoa học, Sử - Địa, Tin học...), Học kỳ và loại điểm thành phần (Miệng, 15 phút, 1 tiết, Giữa kỳ, Cuối kỳ) để nhập điểm cho học sinh. Hệ thống tự động tính Điểm trung bình môn (GPA môn) và hỗ trợ công bố điểm cho phụ huynh.
- **Tiền điều kiện:** Lớp học đã có danh sách học sinh; Giáo viên có quyền giảng dạy môn học tại lớp.
- **Hậu điều kiện:** Điểm số các môn được lưu an toàn vào `/scores`, điểm trung bình môn được tự động tính toán, thông báo điểm mới được gửi tới phụ huynh.
- **Luồng sự kiện chính (Main Flow):**
  1. Giáo viên mở tab "Sổ điểm điện tử" trên Web Next.js hoặc Mobile App.
  2. Chọn Lớp học cần nhập điểm và chọn **Môn học phụ trách** (Ví dụ: `Toán`, `Tiếng Việt`, `Tiếng Anh`, `Khoa học`...).
  3. Chọn **Học kỳ** (`Học kỳ 1` hoặc `Học kỳ 2`).
  4. Chọn **Cột điểm thành phần** cần nhập:
     - Điểm kiểm tra miệng / Dò bài cũ (`ORAL_TEST` - hệ số 1)
     - Điểm kiểm tra 15 phút thường xuyên (`TEST_15P` - hệ số 1)
     - Điểm kiểm tra 1 tiết / Định kỳ (`TEST_1P` - hệ số 2)
     - Điểm thi Giữa học kỳ (`MID_TERM` - hệ số 2)
     - Điểm thi Cuối học kỳ (`FINAL` - hệ số 3).
  5. Màn hình hiển thị bảng danh sách học sinh; Giáo viên nhập điểm số (thang điểm 10, bước nhảy 0.1) cho từng học sinh hoặc nhập hàng loạt từ bàn phím.
  6. Giáo viên bấm "Lưu bảng điểm".
  7. Backend NestJS lưu trữ các document điểm vào collection `/scores`, tự động tổng hợp tính **Điểm trung bình môn (GPA môn)** theo công thức hệ số quy định.
  8. Giáo viên kiểm tra lại bảng tổng hợp điểm; khi sẵn sàng, bấm nút **"Công bố điểm môn học"**.
  9. Backend cập nhật cờ `is_published = true` trong `/scores` và kích hoạt FCM phát thông báo điểm mới kèm tên môn học và loại điểm đến ứng dụng của Phụ huynh.

---

### UC-ACA-04: Dò Bài Cũ & Vòng Quay / Random Học Sinh Lên Bảng
- **Mã Use Case:** `UC-ACA-04`
- **Tác nhân chính:** Giáo viên (Cả GVCN và GVBM).
- **Tác nhân hỗ trợ:** Backend NestJS, Google Cloud Firestore (Collections `/attendances` và `/students`).
- **Mô tả:** Giáo viên sử dụng công cụ quay số / bốc thăm ngẫu nhiên để chọn học sinh lên bảng kiểm tra bài cũ. Thuật toán tự động đối chiếu dữ liệu điểm danh và chỉ lọc ra các học sinh **CÓ MẶT HÔM NAY**.
- **Tiền điều kiện:** Lớp học đã được điểm danh trong ngày hiện tại.
- **Hậu điều kiện:** Một học sinh có mặt được chọn ngẫu nhiên, điểm kiểm tra bài cũ có thể nhập trực tiếp vào sổ điểm.
- **Luồng sự kiện chính (Main Flow):**
  1. Tại màn hình lớp học trên Web Next.js, giáo viên bấm "Dò bài cũ & Gọi học sinh lên bảng".
  2. Web gửi request `GET /api/v1/classes/:id/present-students-today` tới Backend NestJS.
  3. Backend truy vấn Firestore collection `/attendances` với điều kiện: `class_id == :id AND attendance_date == TODAY AND status == 'PRESENT'`.
  4. Backend trả về danh sách chỉ gồm các học sinh ĐANG CÓ MẶT trong lớp (loại trừ các học sinh vắng).
  5. Web Next.js hiển thị giao diện Vòng quay may mắn (Lucky Wheel) hoặc Hiệu ứng rút thẻ bài sinh động.
  6. Giáo viên bấm "Quay số", vòng quay khởi chạy kèm âm thanh hồi hộp.
  7. Vòng quay dừng lại tại học sinh trúng thưởng (Ví dụ: "Em Trần Thị Bình - STT 08").
  8. Học sinh lên bảng trả lời câu hỏi bài cũ đang chiếu.
  9. Giáo viên nhập điểm trực tiếp tại pop-up (cột điểm miệng) và nhấn "Lưu điểm".
  10. Điểm số được lưu ngay vào bảng `scores`.

---

### UC-ACA-05: Import Docs/PDF bằng AI (Gemini API) Sinh Câu Hỏi Kiểm Tra Bài Cũ
- **Mã Use Case:** `UC-ACA-05`
- **Tác nhân chính:** Giáo viên (Cả GVCN và GVBM).
- **Tác nhân hỗ trợ:** Google Gemini API, Backend NestJS.
- **Mô tả:** Giáo viên tải lên tài liệu bài học (Word `.docx`, `.pdf`), hệ thống bóc tách văn bản và gọi Google Gemini API để tự động tạo bộ câu hỏi kiểm tra bài cũ 5-10 phút đầu giờ.
- **Tiền điều kiện:** Giáo viên đã đăng nhập và chọn đúng lớp/môn giảng dạy.
- **Hậu điều kiện:** Bộ câu hỏi được tạo trong bảng `quizzes` và `questions`, sẵn sàng trình chiếu hoặc chuyển thành Game.
- **Luồng sự kiện chính (Main Flow):**
  1. Giáo viên mở màn hình "Kiểm tra bài cũ" trên Web Next.js.
  2. Chọn tệp tài liệu giáo án bài giảng (`.docx` hoặc `.pdf`) và tải lên.
  3. Chọn cấu hình: Số lượng câu hỏi (ví dụ: 3-5 câu trắc nghiệm), độ khó (nhận biết, thông hiểu), thời gian làm bài (30s/câu).
  4. Nhấn nút "Tạo câu hỏi bằng AI".
  5. Backend NestJS tiếp nhận file, dùng thư viện trích xuất văn bản (Text Extraction).
  6. Backend gửi prompt tối ưu tới Google Gemini API (`gemini-1.5-flash`) yêu cầu trả về cấu trúc JSON câu hỏi.
  7. Gemini API phản hồi mảng câu hỏi (nội dung, 4 đáp án, đáp án đúng, lời giải thích).
  8. Backend lưu vào CSDL (bảng `quizzes` và `questions`).
  9. Web Next.js hiển thị danh sách câu hỏi để giáo viên duyệt, chỉnh sửa nếu cần.

---

### UC-ACA-06: Tạo & Khởi Chạy Mini-Game Tương Tác Lớp Học (Classroom Gamification)
- **Mã Use Case:** `UC-ACA-06`
- **Tác nhân chính:** Giáo viên (Cả GVCN và GVBM).
- **Tác nhân hỗ trợ:** Web Next.js UI, Backend NestJS.
- **Mô tả:** Giáo viên chuyển đổi bộ câu hỏi vừa tạo thành các trò chơi lớp học sinh động để cả lớp cùng tham gia chơi trên bảng tương tác / máy chiếu.
- **Tiền điều kiện:** Đã có bộ câu hỏi trong bảng `quizzes` và `questions`.
- **Hậu điều kiện:** Trò chơi được khởi chạy toàn màn hình, học sinh tham gia và được cộng điểm thưởng.
- **Luồng sự kiện chính (Main Flow):**
  1. Từ bộ câu hỏi đã duyệt, giáo viên nhấn "Biến thành Trò chơi (Gamify)".
  2. Hệ thống cung cấp 3 chế độ game:
     - *Chế độ 1: Rung chuông vàng (Đấu trí cả lớp).*
     - *Chế độ 2: Đua xe / Vượt chướng ngại vật (Chia tổ thi đua).*
     - *Chế độ 3: Hộp quà bí mật (Mystery Box - Trả lời trúng quà).*
  3. Giáo viên chọn chế độ chơi và bấm "Bắt đầu Game".
  4. Màn hình Next.js chuyển sang chế độ Fullscreen với đồ họa game bắt mắt, nhạc nền sôi động.
  5. Giáo viên điều khiển câu hỏi hiển thị, bấm bắt đầu đếm ngược thời gian (30s).
  6. Học sinh trong lớp tham gia trả lời (bằng cách giơ bảng chọn đáp án hoặc cử đại diện trả lời miệng).
  7. Giáo viên click hiển thị đáp án đúng $\rightarrow$ hệ thống kích hoạt hiệu ứng pháo hoa, âm thanh reo hò và cập nhật điểm số cho đội/học sinh.
  8. Khi kết thúc game, bảng xếp hạng vinh danh học sinh/tổ xuất sắc nhất được trình chiếu.

---

### UC-ACA-07: Giáo Viên Nhập Điểm Kiểm Tra Lớp Học & Xem Bảng Xếp Hạng
- **Mã Use Case:** `UC-ACA-07`
- **Tác nhân chính:** Giáo viên Bộ môn (GVBM), Giáo viên Chủ nhiệm (GVCN).
- **Tác nhân hỗ trợ:** Backend NestJS, Google Cloud Firestore (Collections `/scores` & `/quiz_results`), Firebase FCM.
- **Mô tả:** Sau khi tổ chức cho học sinh kiểm tra bài cũ hoặc thi đua mini-game tại lớp, Giáo viên trực tiếp nhập điểm số cho học sinh trên ứng dụng. Hệ thống tự động xếp hạng và hiển thị Bảng xếp hạng (Leaderboard) điểm số của lớp cho Giáo viên theo dõi và công bố.
- **Luồng sự kiện chính (Main Flow):**
  1. Giáo viên tổ chức kiểm tra ở lớp (dò bài cũ, câu hỏi AI hoặc mini-game trình chiếu trên bảng). Học sinh trả lời trực tiếp tại lớp (không qua app).
  2. Giáo viên mở giao diện nhập điểm của lớp trên Web/Mobile, nhập điểm số và nhận xét cho từng học sinh.
  3. Hệ thống lưu điểm và tự động sắp xếp thứ hạng học sinh trong lớp theo điểm số từ cao xuống thấp.
  4. Hệ thống hiển thị **Bảng xếp hạng (Leaderboard)** lớp học cho Giáo viên xem:
     - Vinh danh Top học sinh điểm cao nhất (Top 1, Top 2, Top 3) kèm huy hiệu.
     - Danh sách thứ hạng điểm toàn lớp và thống kê phổ điểm.
  5. Giáo viên xem lại, chỉnh sửa nếu cần và bấm **"Công bố điểm"**.
  6. Điểm số được công bố vào Sổ điểm điện tử (`/scores`) và gửi thông báo đẩy (FCM) đến điện thoại của phụ huynh.

---

### UC-FEE-01: Quản Lý Thu Học Phí & Bảo Hiểm Y Tế (BHYT)
- **Mã Use Case:** `UC-FEE-01`
- **Tác nhân chính:** Giáo viên Chủ nhiệm (GVCN) & Admin.
- **Tác nhân hỗ trợ:** Backend NestJS, Google Cloud Firestore (Collection `/fees_and_insurance`), Firebase FCM.
- **Mô tả:** GVCN theo dõi và quản lý danh sách học sinh của lớp đã hoặc chưa hoàn thành nộp Học phí và Bảo hiểm Y tế thông qua 2 cờ boolean `is_paid_tuition` và `is_paid_insurance`.
- **Luồng sự kiện chính (Main Flow):**
  1. GVCN mở tab "Quản lý Thu phí & BHYT" của lớp chủ nhiệm trên Web Next.js hoặc Mobile App.
  2. Hệ thống hiển thị bảng danh sách học sinh với 2 cột checkbox: `Học phí` (`is_paid_tuition`) và `BHYT` (`is_paid_insurance`).
  3. Khi phụ huynh nộp tiền tại trường/lớp: GVCN tích chọn vào ô checkbox tương ứng để xác nhận hoàn thành (hệ thống không có tính năng thanh toán trực tuyến).
  4. GVCN lọc danh sách các em "Chưa nộp BHYT" và nhấn nút "Gửi nhắc nhở phụ huynh".
  5. Backend gửi thông báo đẩy (Push Notification) qua FCM tới phụ huynh của các học sinh đó.

---

### UC-ADM-01: CRUD Tài khoản & Dữ liệu Hệ thống
- **Mã Use Case:** `UC-ADM-01`
- **Tác nhân chính:** Quản trị viên Nền tảng (Platform Admin).
- **Tác nhân hỗ trợ:** Backend NestJS, Firebase Auth, Google Cloud Firestore.
- **Mô tả:** Admin thực hiện tra cứu danh sách, xem chi tiết, tạo mới hoặc cập nhật thông tin tài khoản người dùng (Giáo viên, Phụ huynh) và các danh mục dữ liệu khi cần hỗ trợ kỹ thuật.
- **Luồng sự kiện chính:**
  1. Admin đăng nhập vào Web Quản trị Nền tảng.
  2. Mở mục Quản lý Người dùng / Dữ liệu.
  3. Thực hiện tìm kiếm, lọc theo vai trò (`TEACHER_HOMEROOM`, `TEACHER_SUBJECT`, `PARENT`).
  4. Xem chi tiết thông tin, chỉnh sửa hoặc cập nhật trạng thái khi có yêu cầu hỗ trợ.

---

### UC-ADM-02: Khóa & Mở khóa Tài khoản (Ban / Unban User)
- **Mã Use Case:** `UC-ADM-02`
- **Tác nhân chính:** Quản trị viên Nền tảng (Platform Admin).
- **Tác nhân hỗ trợ:** Backend NestJS, Firebase Auth, Google Cloud Firestore (`/users`).
- **Mô tả:** Admin tiến hành cấm/khóa tài khoản (`Ban`) đối với các tài khoản vi phạm điều khoản sử dụng hoặc có hành vi bất thường, và mở khóa (`Unban`) khi đã giải quyết.
- **Luồng sự kiện chính:**
  1. Admin mở hồ sơ tài khoản người dùng cần xử lý.
  2. Nhấn nút "Khóa tài khoản (Ban User)", nhập lý do khóa.
  3. Backend cập nhật `is_active = false` trong Firestore và vô hiệu hóa tài khoản trên Firebase Auth (`disabled = true`).
  4. Mọi token phiên đăng nhập hiện tại của người dùng bị thu hồi tức thì; người dùng không thể thực hiện thêm bất kỳ thao tác nào.
  5. Khi cần mở khóa: Admin nhấn "Mở khóa tài khoản (Unban User)", trạng thái tài khoản chuyển lại `is_active = true`.

---

### UC-ADM-03: Cấu hình Hạn mức Tài nguyên (Limit / Quota)
- **Mã Use Case:** `UC-ADM-03`
- **Tác nhân chính:** Quản trị viên Nền tảng (Platform Admin).
- **Tác nhân hỗ trợ:** Backend NestJS, Google Cloud Firestore (`/system_configs`).
- **Mô tả:** Admin thiết lập các ngưỡng giới hạn sử dụng tài nguyên hệ thống nhằm kiểm soát chi phí hạ tầng và chống lạm dụng dịch vụ.
- **Luồng sự kiện chính:**
  1. Admin mở màn hình "Cấu hình Hạn mức & Giới hạn (System Limits)".
  2. Cấu hình các tham số hạn mức:
     - Số lớp học tối đa mỗi Giáo viên được tạo (ví dụ: tối đa 5 lớp/GV).
     - Số học sinh tối đa trong 1 lớp (ví dụ: tối đa 55 học sinh/lớp).
     - Hạn ngạch gọi AI Gemini sinh câu hỏi bài giảng (ví dụ: 20 lượt gọi/ngày/GV).
     - Dung lượng upload tài liệu giáo án tối đa (ví dụ: 10MB/file).
  3. Nhấn "Lưu cấu hình".
  4. Backend lưu thông số vào `/system_configs` và áp dụng ngay lập tức qua các Middleware / Guards kiểm soát hạn mức trên toàn bộ API.

