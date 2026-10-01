# TÀI LIỆU KỊCH BẢN KIỂM THỬ TÍCH HỢP HỆ THỐNG TOÀN DIỆN (COMPREHENSIVE INTEGRATION TEST SPECIFICATION)

# DỰ ÁN: GIAOVIENHAY – HỆ THỐNG QUẢN LÝ & TƯƠNG TÁC HỌC SINH CẤP 1 & CẤP 2

# MÃ TÀI LIỆU: SYS_IT – SYSTEM INTEGRATION TEST SUITE

# CẤP ĐỘ KIỂM THỬ: KIỂM THỬ TÍCH HỢP LIÊN PHÂN HỆ (CROSS-MODULE INTEGRATION TEST - IT)

---

## 1. THÔNG TIN CHUNG

- **HỆ THỐNG KIỂM THỬ:** Nền tảng GiaoVienHay (Backend NestJS Modular Monolith, Web Quản trị Next.js, Mobile App React Native, 100% Google Cloud Firestore & Firebase Ecosystem).
- **CÁC DỊCH VỤ & MODULE TÍCH HỢP LIÊN QUAN:**
  - **Module Khởi phát & Xử lý Nghiệp vụ:**
    - `AuthModule` & `UsersModule`: Xác thực Firebase ID Token, kiểm tra quyền RBAC (`ADMIN`, `TEACHER_HOMEROOM`, `TEACHER_SUBJECT`, `PARENT`), quản lý Profile và FCM Device Tokens.
    - `AdminModule`: Quản lý tài khoản, Ban/Unban người dùng, cấu hình hạn mức tài nguyên hệ thống (`/system_configs/limits`).
    - `ClassesModule`: Khởi tạo lớp học tổng, quản lý danh sách học sinh, phân công Giáo viên Bộ môn (GVBM), sinh mã mời (`invite_code`) và liên kết mời (`invite_link`).
    - `StudentsModule`: Quản lý hồ sơ học sinh, xử lý liên kết phụ huynh (`parent_uids`).
    - `AttendanceModule`: Điểm danh nề nếp chuyên cần, kiểm tra xung đột trùng lặp, cung cấp danh sách học sinh có mặt hôm nay (`PRESENT`).
    - `QuizzesModule`: Tiếp nhận file giáo án (.docx/.pdf), tích hợp Google Gemini AI sinh câu hỏi, quản lý Vòng quay ngẫu nhiên (Lucky Wheel kèm nút Skip) và 3 chế độ Mini-Game lớp học (`GOLDEN_BELL`, `RACING`, `MYSTERY_BOX`).
    - `GradesModule`: Nhập điểm đa môn, đa cột điểm (`ORAL_TEST`, `TEST_15P`, `TEST_1P`, `MID_TERM`, `FINAL`), sắp xếp Bảng xếp hạng (Leaderboard) điểm môn học, phê duyệt công bố điểm.
    - `RemarksModule`: Gửi lời nhận xét ngắn gọn thuần túy text từ giáo viên tới phụ huynh.
    - `ExamRemindersModule`: Thiết lập lời nhắc lịch kiểm tra sắp tới và lời dặn dò ôn thi cho toàn lớp.
    - `FeesInsuranceModule`: Quản lý cờ Boolean thu nộp Học phí (`is_paid_tuition`) và Bảo hiểm Y tế (`is_paid_insurance`), kích hoạt đôn đốc nộp phí.
    - `NotificationsModule`: Trung tâm điều phối thông báo đẩy đa kênh (FCM Dispatcher) lưu trữ vết thông báo vào `/notifications`.
  - **Dịch vụ Ngoại vi & Cơ sở Dữ liệu Phụ thuộc:**
    - `Google Cloud Firestore`: Cơ sở dữ liệu NoSQL lưu trữ Document/Collection phân tán.
    - `Firebase Authentication`: Quản lý danh tính người dùng và Custom Claims.
    - `Firebase Cloud Storage`: Lưu trữ an toàn các tệp tài liệu giáo án bài giảng.
    - `Firebase Cloud Messaging (FCM)`: Dịch vụ thông báo đẩy thời gian thực tới thiết bị di động của phụ huynh.
    - `Google Gemini AI API (gemini-1.5-flash)`: Trợ lý AI bóc tách tài liệu bài giảng và sinh đề trắc nghiệm kiểm tra bài cũ.
- **MÔ TẢ NGHIỆP VỤ TÍCH HỢP:** Kiểm thử toàn diện sự tương tác dữ liệu, tính toàn vẹn giao dịch (Transactions & Rollbacks), khả năng phục hồi khi dịch vụ ngoại vi gặp sự cố (Resilience & Graceful Degradation), cơ chế ủy quyền đa cấp (RBAC), kiểm soát hạn ngạch và tính nhất quán thời gian thực giữa 12 phân hệ nghiệp vụ xuyên suốt vòng đời học đường.
- **NGƯỜI THỰC HIỆN / VIẾT TESTCASE:** Đội ngũ Đảm bảo Chất lượng Phần mềm (QA/QC Team) - Dự án GiaoVienHay.
- **TẬP TIN ĐẶC TẢ API LIÊN QUAN:**
  - Kiến trúc hệ thống: [GiaoVienHay_System_Architecture.md](file:///c:/GiaoVienHay/giaovienhay_project/GiaoVienHay/GiaoVienHay_System_Architecture.md)
  - Sơ đồ tuần tự: [sequence_diagram.puml](file:///c:/GiaoVienHay/giaovienhay_project/GiaoVienHay/docs/diagrams/puml/sequence_diagram.puml)
  - Cấu trúc CSDL: [database-schema.md](file:///c:/GiaoVienHay/giaovienhay_project/GiaoVienHay/docs/architecture/database-schema.md)
  - Quy chuẩn phản hồi & Mã lỗi: [api-response-codes.md](file:///c:/GiaoVienHay/giaovienhay_project/GiaoVienHay/docs/architecture/api-response-codes.md)
- **MÔI TRƯỜNG KIỂM THỬ:** Firebase Local Emulator Suite (Firestore, Auth, Storage Emulator), Mock FCM Provider, Mock Google Gemini GenAI SDK, Jest & Supertest Testing Framework trên nền tảng Node.js / NestJS.

---

## 2. BẢNG MA TRẬN KỊCH BẢN KIỂM THỬ TÍCH HỢP (INTEGRATION TEST SUITE)

| Mã Testcase | Tên Kịch Bản Tích Hợp | Các Thành Phần Tương Tác | Dữ Liệu Đầu Vào Chính | Kết Quả Tích Hợp Kỳ Vọng | Trạng Thái |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **IT01_Admin_Limits** | Áp dụng cấu hình hạn mức tài nguyên từ Admin sang các Module | AdminModule $\leftrightarrow$ Firestore $\leftrightarrow$ ClassesModule & QuizzesModule | `PUT /api/v1/admin/system/limits` (quota lớp, quota AI) | Cập nhật `/system_configs/limits`, Guard các module áp dụng chặn tức thì |           |
| **IT02_Admin_Ban_User** | Khóa tài khoản thu hồi phiên và chặn quyền truy cập Gateway | AdminModule $\leftrightarrow$ Firebase Auth $\leftrightarrow$ Firestore $\leftrightarrow$ API Gateway | `PATCH /api/v1/admin/users/:id/ban` kèm lý do vi phạm | `is_active=false`, Firebase Auth `disabled=true`, chặn token ngay lập tức với HTTP 403 |           |
| **IT03_Class_Create_Fees_Init** | GVCN tạo lớp tổng, lưu học sinh và tự động khởi tạo danh mục BHYT/học phí | ClassesService $\leftrightarrow$ Firestore $\leftrightarrow$ FeesInsuranceService | `POST /api/v1/classes` (thông tin lớp, HS, phân công GVBM) | Tạo document `/classes`, `/students`, tự động tạo `/fees_and_insurance` với cờ FALSE |           |
| **IT04_Subject_Teacher_Assign** | GVBM đăng nhập truy cập lớp tổng theo phân công bộ môn | ClassesService $\leftrightarrow$ UsersModule $\leftrightarrow$ Firestore `/classes` | `GET /api/v1/classes/:id/my-subject` với token GVBM | Xác thực quyền theo `subject_teachers`, trả về danh sách học sinh để vào điểm |           |
| **IT05_Parent_Join_Class** | Phụ huynh tham gia lớp qua link mời và xác nhận liên kết con em | ClassesService $\leftrightarrow$ StudentsService $\leftrightarrow$ UsersService $\leftrightarrow$ Firestore | `POST /api/v1/classes/join` (`invite_code`, `student_id`) | Cập nhật `parent_uids` trong `/students`, gán `class_id` vào `/users` phụ huynh |           |
| **IT06_Attendance_FCM_Push** | Điểm danh học sinh vắng tự động ghi Firestore và phát thông báo FCM | AttendanceService $\leftrightarrow$ Firestore $\leftrightarrow$ NotificationsModule $\leftrightarrow$ FCM SDK | `POST /api/v1/attendance/submit` (danh sách có vắng mặt) | HTTP 201, lưu `/attendances`, trigger FCM multicast tới phụ huynh học sinh vắng |           |
| **IT07_LuckyWheel_Scoring** | Dò bài cũ lấy học sinh có mặt hôm nay và nhập điểm miệng vào sổ điểm | AttendanceService $\leftrightarrow$ QuizzesService $\leftrightarrow$ GradesService $\leftrightarrow$ Firestore | `GET wheel-candidates` $\rightarrow$ `POST in-class-scores` | Lọc đúng `PRESENT` hôm nay, hỗ trợ Skip, lưu đồng thời vào `/quiz_results` và `/scores` |           |
| **IT08_AI_Gemini_Quiz_Gen** | Tải giáo án lên Storage, Gemini AI sinh trắc nghiệm và lưu đề thi | QuizzesService $\leftrightarrow$ Firebase Storage $\leftrightarrow$ Gemini API $\leftrightarrow$ Firestore | `POST /api/v1/quizzes/generate-ai` (file .docx/.pdf, options) | Upload Storage, Gemini sinh JSON câu hỏi, lưu document `/quizzes` và subcollection `/questions` |           |
| **IT09_Gamification_Grades_Sync** | Chơi Mini-game lớp học (Rung chuông/Đua xe/Hộp quà) và đồng bộ điểm | Web Next.js $\leftrightarrow$ QuizzesService $\leftrightarrow$ GradesService $\leftrightarrow$ Firestore | `POST /api/v1/quizzes/:id/in-class-scores` (điểm mini-game) | Lưu điểm thưởng vào `/quiz_results`, chuyển trực tiếp vào cột điểm môn học `/scores` |           |
| **IT10_Grades_Leaderboard_Publish** | Nhập bảng điểm môn học, xem Leaderboard và công bố gửi FCM tới PH | GradesService $\leftrightarrow$ NotificationsModule $\leftrightarrow$ FCM $\leftrightarrow$ Firestore | `POST /api/v1/grades/batch` $\rightarrow$ `POST publish` | Lưu `/scores`, tính Leaderboard môn học, cập nhật `is_published=true`, phát FCM cho cả lớp |           |
| **IT11_Remarks_Direct_FCM** | GV gửi nhận xét ngắn dạng text, bắn thông báo FCM và PH xác nhận đọc | RemarksService $\leftrightarrow$ NotificationsModule $\leftrightarrow$ FCM $\leftrightarrow$ Firestore | `POST /api/v1/remarks` $\rightarrow$ `PATCH acknowledge` | Lưu `/remarks`, FCM đẩy nội dung text tới điện thoại PH, PH bấm xác nhận đã đọc |           |
| **IT12_Exam_Reminders_Broadcast** | GV tạo lời nhắc lịch kiểm tra sắp tới phát thông báo đồng loạt tới cả lớp | ExamRemindersService $\leftrightarrow$ NotificationsModule $\leftrightarrow$ FCM | `POST /api/v1/exam-reminders` (ngày thi, môn, dặn dò) | Lưu `/exam_reminders`, FCM multicast gửi thông báo tới 100% phụ huynh trong lớp |           |
| **IT13_Fees_Toggle_And_Remind** | GVCN tích nộp tiền 1-chạm và phát thông báo FCM đôn đốc nộp BHYT | FeesInsuranceService $\leftrightarrow$ NotificationsModule $\leftrightarrow$ FCM | `PATCH toggle` $\rightarrow$ `POST /api/v1/fees-insurance/remind` | Cập nhật `is_paid_insurance=true`, lọc danh sách chưa nộp để gửi cảnh báo FCM |           |
| **IT14_Parent_Portal_Aggregate** | Cổng phụ huynh tra cứu tổng hợp học bạ, chuyên cần và tài chính của con | Gateway $\leftrightarrow$ StudentsService $\leftrightarrow$ Grades $\leftrightarrow$ Attendance $\leftrightarrow$ Fees | `GET /api/v1/students/:id/academic` & `fees-insurance` | Kiểm tra quyền sở hữu con em (`parent_uids`), tổng hợp điểm số, ngày vắng, cờ BHYT |           |
| **IT15_AI_Timeout_Resilience** | Google Gemini AI bị Timeout hoặc 504 khi sinh câu hỏi từ giáo án | QuizzesService $\leftrightarrow$ Gemini Client Mock (Delay > 15s) | `POST /api/v1/quizzes/generate-ai` | Ngắt an toàn, trả HTTP 503 `QUIZ_AI_GENERATION_FAILED`, không sinh document rác |           |
| **IT16_FCM_Invalid_Token_Cleanup** | Xử lý lỗi Token thiết bị FCM không hợp lệ hoặc hết hạn mà không ngắt luồng | NotificationsService $\leftrightarrow$ FCM SDK Mock (Token Not Registered) | Trigger thông báo sự kiện điểm danh/điểm số | Bắt ngoại lệ graceful, ghi log, tự động xóa token hỏng khỏi `/users`, luồng chính thành công |           |
| **IT17_Storage_Failure_Rollback** | Upload file giáo án lên Firebase Storage thất bại do lỗi đường truyền | QuizzesService $\leftrightarrow$ Firebase Storage Mock (Network Error) | `POST /api/v1/quizzes/generate-ai` (file hỏng/ngắt mạng) | Hủy giao dịch, không gọi Gemini AI, không tạo dữ liệu dở dang trong Firestore |           |
| **IT18_Attendance_Duplicate_Block** | Chặn xung đột khi gửi điểm danh trùng lặp cùng lớp, ngày và tiết học | AttendanceService $\leftrightarrow$ Firestore Composite Index Query | `POST /api/v1/attendance/submit` (gửi lại lần 2 cùng tiết) | Trả về HTTP 409 Conflict (`ATTEND_ALREADY_EXISTS`), giữ nguyên bản ghi trước đó |           |
| **IT19_Class_Create_Rollback** | Rollback toàn bộ giao dịch tạo lớp khi trùng mã học sinh trong danh sách | ClassesService $\leftrightarrow$ Firestore Batched Write / Transaction | `POST /api/v1/classes` (danh sách có mã học sinh bị trùng) | Trả về HTTP 409 (`CLASS_STUDENT_CODE_EXISTS`), rollback sạch lớp và học sinh |           |
| **IT20_Subject_Teacher_RBAC_Block** | Chặn GVBM cố tình nhập điểm cho môn học không được phân công giảng dạy | GradesService $\leftrightarrow$ ClassesService $\leftrightarrow$ RBAC Guard | `POST /api/v1/grades/batch` (GVBM môn Văn nhập điểm môn Toán) | Trả về HTTP 403 Forbidden (`ACAD_NOT_ASSIGNED_TEACHER`), từ chối ghi dữ liệu |           |
| **IT21_Parent_IDOR_Access_Block** | Chặn phụ huynh cố tình xem điểm và BHYT của học sinh khác (lỗi IDOR) | Gateway $\leftrightarrow$ StudentsService $\leftrightarrow$ Firestore Security Check | `GET /api/v1/students/:otherId/academic` với token PH A | Trả về HTTP 403 (`PARENT_STUDENT_LINK_NOT_FOUND`), bảo mật dữ liệu học sinh |           |
| **IT22_AI_Daily_Quota_Exceeded** | Chặn yêu cầu sinh đề trắc nghiệm AI khi giáo viên đã vượt hạn mức trong ngày | QuizzesService $\leftrightarrow$ Firestore Quota Counter $\leftrightarrow$ Limit Guard | `POST /api/v1/quizzes/generate-ai` (lần gọi thứ 21/ngày) | Trả về HTTP 429 Too Many Requests (`QUIZ_DAILY_QUOTA_EXCEEDED`), chặn trước khi tốn phí |           |

---

## 3. CHI TIẾT CÁC KỊCH BẢN KIỂM THỬ TÍCH HỢP

---

### PHẦN I: CÁC KỊCH BẢN TÍCH HỢP THÀNH CÔNG (POSITIVE / INTEGRATION FLOW CASES)

---

#### 1. Nhóm Kịch Bản Quản Trị Hệ Thống & Vòng Đời Người Dùng (Admin & User Lifecycle Integration)

---

##### IT01_Admin_Limits : CẬP NHẬT HẠN MỨC HỆ THỐNG VÀ THỰC THI RÀNG BUỘC THỜI GIAN THỰC

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Tài khoản Quản trị viên Nền tảng (Platform Admin) đã đăng nhập, sở hữu Firebase ID Token hợp lệ với Custom Claim `role = "ADMIN"`.
  - Firebase Local Emulator Suite đang khởi chạy với collection `/system_configs` sẵn sàng.
- **CÁC THÀNH PHẦN THAM GIA TÍCH HỢP:**
  - `AdminController` & `AdminService` (Tiếp nhận cấu hình hạn ngạch mới).
  - `Cloud Firestore` (Lưu thông số vào Document `/system_configs/limits`).
  - `ClassesModule` & `QuizzesModule` (Đọc hạn mức từ Firestore Cache/Listener để áp dụng kiểm tra khi giáo viên tạo tài nguyên).
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):**
    - `Authorization: Bearer <token_admin_hop_le>`
    - `Content-Type: application/json`
  - **Dữ liệu thân (Body JSON):**
    ```json
    {
      "max_classes_per_teacher": 5,
      "max_students_per_class": 50,
      "daily_ai_quiz_quota": 20,
      "max_upload_file_size_mb": 15
    }
    ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Gửi yêu cầu HTTP **`PUT`** tới endpoint: `/api/v1/admin/system/limits`.
  2. Lắng nghe phản hồi từ Admin API và ghi nhận mã trạng thái.
  3. Truy vấn Firestore document `/system_configs/limits` để đối soát dữ liệu cấu hình.
  4. Đăng nhập với tài khoản GVCN (`uid_teacher_01`) đã sở hữu sẵn 5 lớp học.
  5. Thử gửi yêu cầu tạo thêm lớp thứ 6 qua API `POST /api/v1/classes`.
- **KẾT QUẢ MONG ĐỢI (ASSERTIONS):**
  - **Phản hồi API Admin:** Trả về **HTTP 200 (OK)** với dữ liệu:
    ```json
    {
      "success": true,
      "status_code": 200,
      "message": "Cập nhật thông số hạn mức hệ thống thành công",
      "data": {
        "max_classes_per_teacher": 5,
        "max_students_per_class": 50,
        "daily_ai_quiz_quota": 20,
        "max_upload_file_size_mb": 15,
        "updated_at": "2026-10-01T08:00:00.000Z"
      },
      "timestamp": "2026-10-01T08:00:00.000Z"
    }
    ```
  - **Trạng thái Database (Firestore):** Document `/system_configs/limits` được cập nhật chính xác các giá trị số nguyên dương.
  - **Tương tác Liên Module:** Yêu cầu tạo lớp thứ 6 của GVCN bị Guard chặn lại với mã **HTTP 400 (BAD REQUEST)** kèm mã lỗi `LIMIT_EXCEEDED` ("Giáo viên đã đạt giới hạn tối đa 5 lớp học").
- **TRẠNG THÁI KIỂM THỬ:** 

---

##### IT02_Admin_Ban_User : KHÓA TÀI KHOẢN, VÔ HIỆU HÓA TRÊN FIREBASE AUTH VÀ THU HỒI TOKEN TRUY CẬP

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Admin có token hợp lệ. Người dùng mục tiêu (`usr_gv_violation`) đang ở trạng thái hoạt động bình thường (`is_active = true`, `disabled = false`).
- **CÁC THÀNH PHẦN THAM GIA TÍCH HỢP:**
  - `AdminController` & `AdminService`.
  - `Firebase Admin SDK (Auth)` (Gọi `updateUser(uid, { disabled: true })` và `revokeRefreshTokens(uid)`).
  - `Cloud Firestore` (Cập nhật trường `is_active = false`, `ban_reason` trong `/users/{uid}`).
  - `AuthGuard` (Kiểm tra trạng thái tài khoản thời gian thực khi token cũ gửi request).
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_admin_hop_le>`
  - **Endpoint & Method:** `PATCH /api/v1/admin/users/usr_gv_violation/ban`
  - **Body JSON:**
    ```json
    {
      "reason": "Phát tán tài liệu không phù hợp chuẩn mực sư phạm"
    }
    ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Gửi request khóa tài khoản từ Admin Portal.
  2. Kiểm tra phản hồi từ Admin API.
  3. Lấy lại token phiên cũ của người dùng `usr_gv_violation` và thực hiện gửi request `GET /api/v1/classes`.
  4. Kiểm tra phản hồi trả về từ API Gateway.
- **KẾT QUẢ MONG ĐỢI (ASSERTIONS):**
  - **Phản hồi Admin API:** HTTP 200 (OK), `message: "Khóa tài khoản người dùng thành công"`.
  - **Trạng thái Firebase Auth:** User record có thuộc tính `disabled: true`, token revocation timestamp được cập nhật.
  - **Trạng thái Database (Firestore):** Document `/users/usr_gv_violation` có `is_active: false`, `ban_reason: "Phát tán tài liệu..."`.
  - **Xác thực Bảo mật Tích hợp:** Khi người dùng bị khóa dùng token cũ truy cập bất kỳ API nào, `AuthGuard` lập tức từ chối và trả về **HTTP 403 (FORBIDDEN)** kèm `error_code: "AUTH_ACCOUNT_LOCKED"`.
- **TRẠNG THÁI KIỂM THỬ:** 

---

#### 2. Nhóm Kịch Bản Khởi Tạo Lớp Học, Phân Công Bộ Môn & Kết Nối Phụ Huynh

---

##### IT03_Class_Create_Fees_Init : GVCN TẠO LỚP HỌC TỔNG, LƯU HỌC SINH VÀ TỰ ĐỘNG KHỞI TẠO BẢN GHI BHYT/HỌC PHÍ

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - GVCN (`uid_gvcn_01`) đã cấu hình hồ sơ giảng dạy môn Toán (`teaching_subjects: ["MATH"]`).
  - Giáo viên bộ môn tiếng Anh (`uid_gvbm_eng`) và Thể dục (`uid_gvbm_pe`) đã có tài khoản trên hệ thống.
- **CÁC THÀNH PHẦN THAM GIA TÍCH HỢP:**
  - `ClassesController` & `ClassesService` (Tiếp nhận khởi tạo lớp, sinh `invite_code`).
  - `FeesInsuranceService` (Lắng nghe sự kiện tạo lớp hoặc được gọi trong giao dịch để khởi tạo danh mục thu nộp).
  - `Cloud Firestore` (Ghi đồng thời vào các collection `/classes`, `/students`, `/fees_and_insurance`).
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_gvcn_01>`, `Content-Type: application/json`
  - **Body JSON:**
    ```json
    {
      "name": "6A1",
      "grade_level": 6,
      "academic_year": "2026-2027",
      "subject_teachers": [
        { "teacher_id": "uid_gvbm_eng", "subject_code": "ENG" },
        { "teacher_id": "uid_gvbm_pe", "subject_code": "PE" }
      ],
      "students": [
        { "student_code": "HS601", "full_name": "Nguyễn Hoàng Long", "gender": "MALE", "dob": "2014-03-12" },
        { "student_code": "HS602", "full_name": "Đỗ Thùy Trang", "gender": "FEMALE", "dob": "2014-07-25" }
      ]
    }
    ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Gửi request tạo lớp qua phương thức **`POST`** tới: `/api/v1/classes`.
  2. Nhận phản hồi envelope từ server.
  3. Truy vấn trực tiếp Firestore Emulator tại `/classes`, `/students` và `/fees_and_insurance`.
- **KẾT QUẢ MONG ĐỢI (ASSERTIONS):**
  - **Phản hồi API:** HTTP 201 (CREATED) kèm cấu trúc dữ liệu:
    ```json
    {
      "success": true,
      "status_code": 201,
      "message": "Tạo lớp học tổng và khởi tạo dữ liệu học sinh thành công",
      "data": {
        "class_id": "cls_6a1_auto_id",
        "name": "6A1",
        "grade_level": 6,
        "academic_year": "2026-2027",
        "homeroom_teacher_id": "uid_gvcn_01",
        "invite_code": "GVH8624",
        "invite_link": "https://giaovienhay.vn/join/GVH8624",
        "total_students": 2
      },
      "timestamp": "2026-10-01T08:10:00.000Z"
    }
    ```
  - **Trạng thái Database (Firestore):**
    - Collection `/classes` có document mới chứa thông tin lớp, `invite_code` duy nhất và danh sách phân công GVBM (`subject_teachers`).
    - Collection `/students` lưu 2 document mới tương ứng với `HS601` và `HS602`, có trường `class_id = "cls_6a1_auto_id"`, mảng `parent_uids: []`.
    - Collection `/fees_and_insurance` tự động được khởi tạo 2 document theo dõi cho 2 học sinh trên, với cờ mặc định: `is_paid_tuition: false`, `is_paid_insurance: false`.
- **TRẠNG THÁI KIỂM THỬ:** 

---

##### IT04_Subject_Teacher_Assign : GVBM ĐĂNG NHẬP TRUY CẬP LỚP TỔNG THEO MÔN PHỤ TRÁCH ĐƯỢC PHÂN CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Lớp `cls_6a1_auto_id` đã được tạo thành công từ testcase `IT03`, phân công `uid_gvbm_eng` dạy môn tiếng Anh (`ENG`).
  - GVBM tiếng Anh đã đăng nhập và sở hữu token hợp lệ.
- **CÁC THÀNH PHẦN THAM GIA TÍCH HỢP:**
  - `ClassesController` & `ClassesService` (`getMySubjectClass`).
  - `Cloud Firestore` (Truy vấn phân quyền trong mảng `subject_teachers` của `/classes/{id}`).
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_gvbm_eng>`
  - **Endpoint & Method:** `GET /api/v1/classes/cls_6a1_auto_id/my-subject`
- **CÁC BƯỚC THỰC HIỆN:**
  1. Gửi yêu cầu HTTP **`GET`** với token GVBM.
  2. Hệ thống kiểm tra ID của GVBM có nằm trong danh sách phân công bộ môn của lớp hay không.
  3. Trả về thông tin lớp học kèm danh sách học sinh theo phạm vi môn học phụ trách.
- **KẾT QUẢ MONG ĐỢI (ASSERTIONS):**
  - **Phản hồi API:** HTTP 200 (OK), trả về thông tin lớp và danh sách 2 học sinh (`HS601`, `HS602`) kèm môn học được phân quyền là `ENG`.
  - **Xác thực Phân Quyền:** GVBM có toàn quyền xem học sinh lớp tổng để tiến hành các nghiệp vụ: Dò bài cũ, tổ chức Mini-game và nhập điểm môn tiếng Anh.
- **TRẠNG THÁI KIỂM THỬ:** 

---

##### IT05_Parent_Join_Class : PHỤ HUYNH THAM GIA LỚP BẰNG MÃ MỜI VÀ XÁC NHẬN CON EM

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Lớp học đã được cấp mã mời `invite_code: "GVH8624"`.
  - Phụ huynh (`uid_parent_long`) đã đăng nhập qua số điện thoại/OTP và có tài khoản trong `/users`.
  - Học sinh `HS601` (`Nguyễn Hoàng Long`, ID: `stu_long_01`) chưa có phụ huynh nào liên kết.
- **CÁC THÀNH PHẦN THAM GIA TÍCH HỢP:**
  - `ClassesService` (Xác thực mã mời lớp học).
  - `StudentsService` (Cập nhật mảng phụ huynh).
  - `UsersService` (Gán lớp học vào hồ sơ phụ huynh).
  - `Cloud Firestore` (Giao dịch liên kết 2 chiều giữa `/students` và `/users`).
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_parent_long>`, `Content-Type: application/json`
  - **Body JSON:**
    ```json
    {
      "invite_code": "GVH8624",
      "student_id": "stu_long_01"
    }
    ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Phụ huynh gửi request tham gia lớp qua endpoint `POST /api/v1/classes/join`.
  2. Backend kiểm tra tính hợp lệ của `invite_code` trên collection `/classes`.
  3. Kiểm tra học sinh `stu_long_01` thuộc lớp học đó.
  4. Thực hiện transaction liên kết UID phụ huynh vào học sinh và ngược lại.
- **KẾT QUẢ MONG ĐỢI (ASSERTIONS):**
  - **Phản hồi API:** HTTP 200 (OK) với message `"Kết nối học sinh và tham gia lớp học thành công"`, kèm thông tin lớp `6A1` và thông tin con em `Nguyễn Hoàng Long`.
  - **Trạng thái Database (Firestore):**
    - Document `/students/stu_long_01` có mảng `parent_uids` chứa `"uid_parent_long"`.
    - Document `/users/uid_parent_long` được cập nhật trường `class_id = "cls_6a1_auto_id"`.
- **TRẠNG THÁI KIỂM THỬ:** 

---

#### 3. Nhóm Kịch Bản Điểm Danh Chuyên Cần & Bắn Thông Báo Đẩy FCM

---

##### IT06_Attendance_FCM_Push : ĐIỂM DANH HỌC SINH VẮNG TỰ ĐỘNG GHI FIRESTORE VÀ BẮN NOTIFICATION QUA FCM

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Lớp `6A1` đã có học sinh `stu_long_01` liên kết với phụ huynh `uid_parent_long`.
  - Phụ huynh đã cấp quyền và đăng ký FCM Device Token `["fcm_token_parent_long_device1"]` trong `/users/uid_parent_long`.
  - Firebase Local Emulator & Mock FCM Provider đang hoạt động.
- **CÁC THÀNH PHẦN THAM GIA TÍCH HỢP:**
  - `AttendanceController` & `AttendanceService`.
  - `Cloud Firestore` (Lưu bản ghi vào `/attendances`).
  - `NotificationsModule` & `Firebase Admin FCM SDK` (Lấy token phụ huynh và gửi thông báo vắng học).
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_gvcn_01>`, `Content-Type: application/json`
  - **Body JSON:**
    ```json
    {
      "class_id": "cls_6a1_auto_id",
      "attendance_date": "2026-10-01",
      "period": 1,
      "records": [
        {
          "student_id": "stu_long_01",
          "status": "ABSENT_UNEXCUSED",
          "note": "Không thấy có mặt đầu giờ học"
        },
        {
          "student_id": "stu_trang_02",
          "status": "PRESENT",
          "note": ""
        }
      ]
    }
    ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Gửi request điểm danh nề nếp qua method **`POST`** tới: `/api/v1/attendance/submit`.
  2. Backend xác thực GVCN, kiểm tra tính hợp lệ của ngày và tiết học.
  3. Lưu bản ghi điểm danh vào Firestore `/attendances`.
  4. Lọc danh sách học sinh có trạng thái `ABSENT_UNEXCUSED` hoặc `ABSENT_EXCUSED`.
  5. NotificationsModule truy vấn mảng `parent_uids` và gửi thông báo đẩy multicast qua FCM.
- **KẾT QUẢ MONG ĐỢI (ASSERTIONS):**
  - **Phản hồi API:** HTTP 201 (CREATED) với thống kê: `total_students: 2`, `present_count: 1`, `absent_count: 1`, `notified_parents: 1`.
  - **Trạng thái Database (Firestore):**
    - 2 document mới được tạo trong collection `/attendances` cho ngày `2026-10-01`, tiết `1`.
    - 1 document thông báo mới được tạo trong `/notifications` với `recipient_user_id: "uid_parent_long"`, `type: "ATTENDANCE_ALERT"`, `title: "Thông báo vắng học tiết 1"`.
  - **Tương tác Ngoại vi (FCM):** Mock FCM SDK nhận lệnh gọi `sendMulticast()` với đúng token `fcm_token_parent_long_device1` và payload cảnh báo vắng học.
- **TRẠNG THÁI KIỂM THỬ:** 

---

#### 4. Nhóm Kịch Bản Dò Bài Cũ, Vòng Quay May Mắn & Nhập Điểm Trực Tiếp

---

##### IT07_LuckyWheel_Scoring : VÒNG QUAY MAY MẮN CHỈ LỌC HỌC SINH CÓ MẶT VÀ NHẬP ĐIỂM MIỆNG LƯU ĐỒNG THỜI VÀO SỔ ĐIỂM

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Lớp `6A1` đã hoàn tất điểm danh hôm nay (`2026-10-01`): `stu_long_01` vắng (`ABSENT_UNEXCUSED`), `stu_trang_02` có mặt (`PRESENT`).
  - GVBM Toán đăng nhập vào màn hình Dò bài cũ đầu giờ.
- **CÁC THÀNH PHẦN THAM GIA TÍCH HỢP:**
  - `AttendanceService` (Truy vấn danh sách học sinh có mặt hôm nay).
  - `QuizzesService` (Cung cấp ứng viên vòng quay may mắn).
  - `GradesService` (Tiếp nhận điểm chấm miệng trực tiếp tại lớp).
  - `Cloud Firestore` (Ghi nhận kết quả vào `/quiz_results` và sổ điểm `/scores`).
- **DỮ LIỆU ĐẦU VÀO:**
  - **Bước 1 (Lấy danh sách quay số):** `GET /api/v1/quizzes/cls_6a1_auto_id/wheel-candidates`
  - **Bước 2 (Nhập điểm miệng sau khi quay):**
    - Endpoint: `POST /api/v1/quizzes/cls_6a1_auto_id/in-class-scores`
    - Body JSON:
      ```json
      {
        "subject_code": "MATH",
        "scores": [
          {
            "student_id": "stu_trang_02",
            "score": 9.0,
            "notes": "Thuộc bài cũ và giải đúng bài tập số 3"
          }
        ]
      }
      ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Gửi request `GET` lấy danh sách ứng viên vòng quay may mắn.
  2. Kiểm tra danh sách ứng viên chỉ bao gồm học sinh có mặt, đã loại bỏ học sinh vắng.
  3. Mô phỏng giáo viên quay vòng quay, chọn trúng em Đỗ Thùy Trang (`stu_trang_02`).
  4. Giáo viên chấm điểm và gửi request lưu điểm miệng lên server.
- **KẾT QUẢ MONG ĐỢI (ASSERTIONS):**
  - **Danh sách ứng viên Vòng quay:** Trả về danh sách chỉ gồm duy nhất `stu_trang_02` (loại bỏ hoàn toàn `stu_long_01` do nghỉ học).
  - **Phản hồi Lưu điểm API:** HTTP 201 (CREATED) với message `"Lưu điểm dò bài cũ thành công"`.
  - **Trạng thái Database (Firestore):**
    - Document mới được tạo trong `/quiz_results` ghi nhận bài kiểm tra miệng.
    - Sổ điểm điện tử môn Toán `/scores` tự động được thêm 1 document với: `student_id: "stu_trang_02"`, `subject_code: "MATH"`, `score_type: "ORAL_TEST"`, `score_value: 9.0`, `is_published: false`.
- **TRẠNG THÁI KIỂM THỬ:** 

---

#### 5. Nhóm Kịch Bản Trợ Giảng AI Gemini, Firebase Storage & Game Hóa Lớp Học

---

##### IT08_AI_Gemini_Quiz_Gen : TẢI GIÁO ÁN LÊN FIREBASE STORAGE, GOOGLE GEMINI AI BÓC TÁCH VÀ SINH BỘ CÂU HỎI TRẮC NGHIỆM

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên có token hợp lệ.
  - Tệp giáo án Word hợp lệ: `giao_an_toan_so_hoc_6.docx` (dung lượng 2.5MB).
  - Firebase Storage Emulator và Mock Google Gemini API (`gemini-1.5-flash`) sẵn sàng nhận kết nối.
- **CÁC THÀNH PHẦN THAM GIA TÍCH HỢP:**
  - `QuizzesController` & `QuizzesService`.
  - `Firebase Storage SDK` (Upload file và tạo Signed/Public URL an toàn).
  - `GoogleGenAI Client Library` (Gửi prompt kèm nội dung text giáo án, nhận về cấu trúc JSON).
  - `Cloud Firestore` (Tạo document trong `/quizzes` và các document con trong subcollection `/questions`).
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_gv_toan>`, `Content-Type: multipart/form-data`
  - **Form Data:**
    - `file`: (binary buffer của `giao_an_toan_so_hoc_6.docx`)
    - `class_id`: `"cls_6a1_auto_id"`
    - `subject_code`: `"MATH"`
    - `title`: `"Kiểm tra bài cũ: Ước số và Bội số"`
    - `num_questions`: 3
    - `difficulty_level`: `"MEDIUM"`
    - `preferred_mode`: `"GOLDEN_BELL"`
- **CÁC BƯỚC THỰC HIỆN:**
  1. Gửi request multipart tới endpoint `POST /api/v1/quizzes/generate-ai`.
  2. Backend upload file lên Firebase Storage tại bucket `/lesson_plans/{class_id}/{timestamp}.docx`.
  3. Trích xuất text từ file docx và truyền prompt vào Google Gemini AI API.
  4. Gemini AI phân tích và trả về mảng 3 câu hỏi trắc nghiệm kèm 4 đáp án (A, B, C, D) và giải thích.
  5. Backend lưu bộ đề vào Firestore và trả dữ liệu về client.
- **KẾT QUẢ MONG ĐỢI (ASSERTIONS):**
  - **Phản hồi API:** HTTP 201 (CREATED) kèm ID bộ quiz và danh sách câu hỏi:
    ```json
    {
      "success": true,
      "status_code": 201,
      "message": "AI Gemini đã sinh bộ câu hỏi kiểm tra bài cũ thành công",
      "data": {
        "quiz_id": "qz_uoc_boi_6a1",
        "title": "Kiểm tra bài cũ: Ước số và Bội số",
        "subject_code": "MATH",
        "source_doc_url": "https://firebasestorage.googleapis.com/.../lesson_plans/...",
        "total_questions": 3,
        "questions": [
          {
            "question_index": 1,
            "content": "Số nào sau đây là ước chung của 12 và 18?",
            "options": ["A. 4", "B. 6", "C. 8", "D. 9"],
            "correct_answer": "B",
            "explanation": "6 chia hết cho cả 12 và 18."
          }
        ]
      }
    }
    ```
  - **Trạng thái Database (Firestore):**
    - Document `/quizzes/qz_uoc_boi_6a1` được khởi tạo đầy đủ metadata.
    - Subcollection `/quizzes/qz_uoc_boi_6a1/questions` lưu trữ chính xác 3 document câu hỏi.
  - **Trạng thái Firebase Storage:** Tệp docx được lưu trữ nguyên vẹn tại bucket quy định.
- **TRẠNG THÁI KIỂM THỬ:** 

---

##### IT09_Gamification_Grades_Sync : CHƠI MINI-GAME LỚP HỌC (RUNG CHUÔNG VÀNG / ĐUA XE / HỘP QUÀ) VÀ ĐỒNG BỘ ĐIỂM THƯỞNG VÀO SỔ ĐIỂM

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Bộ đề quiz `qz_uoc_boi_6a1` đã được tạo thành công từ testcase `IT08`.
  - Giáo viên trình chiếu chế độ game **Rung Chuông Vàng** (`GOLDEN_BELL`) trên Web Next.js tại lớp học.
- **CÁC THÀNH PHẦN THAM GIA TÍCH HỢP:**
  - `QuizzesService` (Quản lý trạng thái hoàn thành mini-game).
  - `GradesService` (Tiếp nhận kết quả điểm thưởng của học sinh đạt giải).
  - `Cloud Firestore` (Ghi nhận vào `/quiz_results` và chuyển đổi sang sổ điểm `/scores`).
- **DỮ LIỆU ĐẦU VÀO:**
  - **Endpoint & Method:** `POST /api/v1/quizzes/qz_uoc_boi_6a1/in-class-scores`
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_gv_toan>`, `Content-Type: application/json`
  - **Body JSON:**
    ```json
    {
      "subject_code": "MATH",
      "scores": [
        {
          "student_id": "stu_trang_02",
          "score": 10.0,
          "notes": "Quán quân Rung Chuông Vàng - Trả lời đúng toàn bộ câu hỏi"
        }
      ]
    }
    ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Giáo viên bấm "Kết thúc Game" trên giao diện Web Next.js và xác nhận lưu điểm thưởng.
  2. Gửi request lưu điểm game lên server.
  3. Kiểm tra tính toàn vẹn dữ liệu giữa module Quizzes và module Grades.
- **KẾT QUẢ MONG ĐỢI (ASSERTIONS):**
  - **Phản hồi API:** HTTP 201 (CREATED) kèm xác nhận: `"Điểm Mini-game đã được ghi nhận và đồng bộ vào Sổ điểm môn học"`.
  - **Trạng thái Database (Firestore):**
    - Collection `/quiz_results` có bản ghi lưu kết quả mini-game với `score: 10.0`, `is_synced_to_grades: true`.
    - Collection `/scores` có document mới: `student_id: "stu_trang_02"`, `score_type: "QUIZ"`, `score_value: 10.0`, `teacher_comment: "Quán quân Rung Chuông Vàng..."`.
- **TRẠNG THÁI KIỂM THỬ:** 

---

#### 6. Nhóm Kịch Bản Quản Lý Sổ Điểm, Bảng Xếp Hạng & Công Bố Điểm

---

##### IT10_Grades_Leaderboard_Publish : NHẬP ĐIỂM THƯỜNG XUYÊN, XUẤT LEADERBOARD MÔN HỌC VÀ CÔNG BỐ ĐIỂM BẮN FCM TOÀN LỚP

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - GVBM tiếng Anh đã được phân công dạy lớp `6A1`.
  - Lớp có các học sinh đã được liên kết phụ huynh.
- **CÁC THÀNH PHẦN THAM GIA TÍCH HỢP:**
  - `GradesController` & `GradesService`.
  - `NotificationsModule` & `Firebase Admin FCM SDK`.
  - `Cloud Firestore` (Cập nhật hàng loạt document trong `/scores` và `/notifications`).
- **DỮ LIỆU ĐẦU VÀO:**
  - **Bước 1: Nhập điểm 15 phút (POST /api/v1/grades/batch):**
    ```json
    {
      "class_id": "cls_6a1_auto_id",
      "subject_code": "ENG",
      "semester": 1,
      "score_type": "TEST_15P",
      "scores": [
        { "student_id": "stu_long_01", "score_value": 8.5, "teacher_comment": "Từ vựng tốt" },
        { "student_id": "stu_trang_02", "score_value": 9.5, "teacher_comment": "Xuất sắc" }
      ]
    }
    ```
  - **Bước 2: Lấy dữ liệu Leaderboard:** `GET /api/v1/grades/leaderboard/cls_6a1_auto_id?subject_code=ENG&score_type=TEST_15P`
  - **Bước 3: Công bố bảng điểm (POST /api/v1/grades/publish):**
    ```json
    {
      "class_id": "cls_6a1_auto_id",
      "subject_code": "ENG",
      "semester": 1,
      "score_type": "TEST_15P"
    }
    ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Gửi request nhập điểm batch cho 2 học sinh.
  2. Gửi request lấy dữ liệu Bảng xếp hạng điểm môn học để trình chiếu vinh danh trên bảng.
  3. Giáo viên kiểm tra lại và bấm nút "Công bố điểm môn học".
  4. Backend cập nhật cờ công bố và kích hoạt FCM thông báo điểm mới tới toàn bộ phụ huynh.
- **KẾT QUẢ MONG ĐỢI (ASSERTIONS):**
  - **Nhập điểm:** HTTP 201 (CREATED), lưu 2 document điểm vào collection `/scores` với `is_published: false`. Không tự động tính điểm GPA trung bình (đảm bảo trung thực dữ liệu).
  - **Leaderboard:** Trả về thứ hạng Top học sinh điểm cao nhất: Hạng 1 là `stu_trang_02` (9.5 điểm), Hạng 2 là `stu_long_01` (8.5 điểm).
  - **Công bố điểm:** HTTP 200 (OK), các document điểm trong `/scores` chuyển sang `is_published: true`.
  - **Thông báo FCM:** Mock FCM SDK phát thông báo multicast tới tất cả phụ huynh trong lớp với nội dung: *"Đã có bảng điểm kiểm tra 15 phút môn Tiếng Anh"*.
- **TRẠNG THÁI KIỂM THỬ:** 

---

#### 7. Nhóm Kịch Bản Nhận Xét Học Sinh & Lời Nhắc Lịch Kiểm Tra

---

##### IT11_Remarks_Direct_FCM : GIÁO VIÊN GỬI NHẬN XÉT VĂN BẢN NGẮN, PHÁT FCM VÀ PHỤ HUYNH BẤM XÁC NHẬN ĐÃ ĐỌC

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên có token hợp lệ. Học sinh `stu_long_01` có phụ huynh `uid_parent_long` với FCM token sẵn sàng.
- **CÁC THÀNH PHẦN THAM GIA TÍCH HỢP:**
  - `RemarksController` & `RemarksService`.
  - `NotificationsModule` & `FCM Provider`.
  - `Cloud Firestore` (Ghi nhận vào `/remarks` và `/notifications`).
- **DỮ LIỆU ĐẦU VÀO:**
  - **Bước 1 (Gửi nhận xét):** `POST /api/v1/remarks`
    ```json
    {
      "student_id": "stu_long_01",
      "class_id": "cls_6a1_auto_id",
      "subject_code": "MATH",
      "content": "Hôm nay em Long chú ý nghe giảng và xung phong lên bảng chữa bài tập rất tốt."
    }
    ```
  - **Bước 2 (Phụ huynh xác nhận đọc):** `PATCH /api/v1/remarks/{remark_id}/acknowledge`
- **CÁC BƯỚC THỰC HIỆN:**
  1. Giáo viên gửi nhận xét thuần túy văn bản ngắn (không dùng hệ thống thẻ tag).
  2. Backend lưu vào Firestore `/remarks` và bắn FCM notification tức thì đến điện thoại phụ huynh.
  3. Phụ huynh mở ứng dụng và gửi request xác nhận đã đọc nhận xét.
- **KẾT QUẢ MONG ĐỢI (ASSERTIONS):**
  - **Tạo nhận xét:** HTTP 201 (CREATED), document mới trong `/remarks` có trường `is_published: true`, `is_acknowledged: false`.
  - **Thông báo FCM:** FCM bắn tin nhắn chứa tiêu đề `"Nhận xét mới từ giáo viên môn Toán"` và nội dung text ngắn.
  - **Xác nhận đọc:** HTTP 200 (OK), document trong `/remarks` chuyển trạng thái `is_acknowledged: true`, `acknowledged_at` được gán timestamp hiện tại.
- **TRẠNG THÁI KIỂM THỬ:** 

---

##### IT12_Exam_Reminders_Broadcast : GIÁO VIÊN TẠO LỜI NHẮC LỊCH KIỂM TRA PHÁT THÔNG BÁO ĐẨY ĐỒNG LOẠT TOÀN THỂ PHỤ HUYNH

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên bộ môn Toán đăng nhập vào lớp `6A1`.
  - Lớp học đã có phụ huynh tham gia đầy đủ.
- **CÁC THÀNH PHẦN THAM GIA TÍCH HỢP:**
  - `ExamRemindersController` & `ExamRemindersService`.
  - `NotificationsModule` & `FCM Provider`.
  - `Cloud Firestore` (Collection `/exam_reminders`).
- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_gv_toan>`, `Content-Type: application/json`
  - **Body JSON:**
    ```json
    {
      "class_id": "cls_6a1_auto_id",
      "subject_code": "MATH",
      "exam_type": "TEST_15P",
      "exam_date": "2026-10-05",
      "message": "Thứ Hai tới lớp sẽ có bài kiểm tra 15 phút về Phép nhân phân số. Kính nhờ quý phụ huynh nhắc các con ôn kỹ bài tập trang 24."
    }
    ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. Gửi request tạo lời nhắc kiểm tra qua `POST /api/v1/exam-reminders`.
  2. Backend kiểm tra ngày kiểm tra `>= today`.
  3. Lưu thông tin vào Firestore collection `/exam_reminders`.
  4. FCM Dispatcher truy vấn toàn bộ phụ huynh thuộc lớp và gửi thông báo đẩy hàng loạt.
- **KẾT QUẢ MONG ĐỢI (ASSERTIONS):**
  - **Phản hồi API:** HTTP 201 (CREATED) với message `"Tạo lời nhắc lịch kiểm tra và phát thông báo thành công"`.
  - **Trạng thái Database (Firestore):** Document mới được tạo trong `/exam_reminders` chứa đầy đủ thông tin ngày thi, môn và nội dung dặn dò.
  - **Tương tác Ngoại vi (FCM):** FCM multicast gửi đồng thời tới toàn bộ thiết bị phụ huynh của lớp `6A1`.
- **TRẠNG THÁI KIỂM THỬ:** 

---

#### 8. Nhóm Kịch Bản Quản Lý Học Phí & Bảo Hiểm Y Tế (BHYT)

---

##### IT13_Fees_Toggle_And_Remind : GVCN CẬP NHẬT TRẠNG THÁI NỘP BHYT 1-CHẠM VÀ PHÁT FCM ĐÔN ĐỐC PHỤ HUYNH CHƯA NỘP

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Lớp `6A1` đã có 2 bản ghi `/fees_and_insurance` (khởi tạo từ testcase `IT03`) với cờ mặc định `false`.
  - Học sinh `stu_long_01` đã đóng tiền BHYT trực tiếp tại lớp cho GVCN; `stu_trang_02` chưa nộp.
- **CÁC THÀNH PHẦN THAM GIA TÍCH HỢP:**
  - `FeesInsuranceController` & `FeesInsuranceService`.
  - `NotificationsModule` & `FCM Provider`.
  - `Cloud Firestore` (Collection `/fees_and_insurance`).
- **DỮ LIỆU ĐẦU VÀO:**
  - **Bước 1 (Toggle cờ BHYT cho Long):**
    - Endpoint: `PATCH /api/v1/fees-insurance/toggle`
    - Body JSON:
      ```json
      {
        "class_id": "cls_6a1_auto_id",
        "student_id": "stu_long_01",
        "fee_type": "INSURANCE",
        "is_paid": true,
        "paid_date": "2026-10-01"
      }
      ```
  - **Bước 2 (Gửi nhắc nhở phụ huynh chưa nộp BHYT):**
    - Endpoint: `POST /api/v1/fees-insurance/remind`
    - Body JSON:
      ```json
      {
        "class_id": "cls_6a1_auto_id",
        "fee_type": "INSURANCE",
        "reminder_message": "Kính nhắc phụ huynh hoàn thành đóng tiền BHYT cho học sinh trước ngày 10/10."
      }
      ```
- **CÁC BƯỚC THỰC HIỆN:**
  1. GVCN gửi request cập nhật cờ `is_paid_insurance = true` cho `stu_long_01`.
  2. Kiểm tra Firestore cập nhật cờ và ngày nộp `2026-10-01`.
  3. GVCN bấm "Gửi nhắc nhở phụ huynh chưa nộp".
  4. Backend lọc các học sinh có `is_paid_insurance == false` (chỉ còn `stu_trang_02`) và kích hoạt FCM tới phụ huynh tương ứng.
- **KẾT QUẢ MONG ĐỢI (ASSERTIONS):**
  - **Cập nhật cờ:** HTTP 200 (OK), document của `stu_long_01` trong `/fees_and_insurance` có: `is_paid_insurance: true`, `insurance_paid_date: "2026-10-01"`.
  - **Đôn đốc FCM:** HTTP 200 (OK) với thống kê `"Đã gửi thông báo nhắc nhở tới 1 phụ huynh chưa hoàn thành BHYT"`.
  - **Bảo mật & Chính xác:** Chỉ phụ huynh của `stu_trang_02` nhận được thông báo nhắc nợ BHYT; phụ huynh của `stu_long_01` tuyệt đối không bị nhận nhầm thông báo.
- **TRẠNG THÁI KIỂM THỬ:** 

---

#### 9. Nhóm Kịch Bản Cổng Phụ Huynh Tra Cứu Toàn Diện

---

##### IT14_Parent_Portal_Aggregate : PHỤ HUYNH TRA CỨU HỌC BẠ, CHUYÊN CẦN VÀ TÌNH TRẠNG BHYT/HỌC PHÍ CỦA CON

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Phụ huynh `uid_parent_long` có token hợp lệ, đã liên kết với con `stu_long_01`.
  - Dữ liệu điểm số (testcase `IT10`), điểm danh (testcase `IT06`) và BHYT (testcase `IT13`) đã sẵn sàng trong Firestore.
- **CÁC THÀNH PHẦN THAM GIA TÍCH HỢP:**
  - `API Gateway` (Kiểm tra Custom Claim và quyền truy cập `parent_uids`).
  - `StudentsModule`, `GradesModule`, `AttendanceModule`, `FeesInsuranceModule`.
  - `Cloud Firestore`.
- **DỮ LIỆU ĐẦU VÀO:**
  - **Endpoint 1 (Sổ điểm học bạ):** `GET /api/v1/students/stu_long_01/academic`
  - **Endpoint 2 (Tình trạng Học phí & BHYT):** `GET /api/v1/students/stu_long_01/fees-insurance`
- **CÁC BƯỚC THỰC HIỆN:**
  1. Phụ huynh mở màn hình "Học bạ của con" trên Mobile App React Native.
  2. Gửi request tra cứu dữ liệu học vụ.
  3. Chuyển sang tab "Học phí & BHYT" và gửi request tra cứu tài chính.
- **KẾT QUẢ MONG ĐỢI (ASSERTIONS):**
  - **Tra cứu Học bạ:** HTTP 200 (OK), trả về đầy đủ các cột điểm đã công bố (`is_published: true`), điểm 15p môn Tiếng Anh: 8.5; thống kê chuyên cần ghi nhận 1 buổi vắng không phép.
  - **Tra cứu Học phí & BHYT:** HTTP 200 (OK), trả về trạng thái hiển thị rõ ràng:
    - BHYT: **ĐÃ NỘP** (`is_paid: true`, ngày nộp: `2026-10-01`, tích xanh).
    - Học phí: **CHƯA NỘP** (`is_paid: false`, cảnh báo kèm ghi chú).
- **TRẠNG THÁI KIỂM THỬ:** 

---

### PHẦN II: CÁC KỊCH BẢN XỬ LÝ LỖI TÍCH HỢP & NGOẠI LỆ (FAILURE, RESILIENCE & ROLLBACK CASES)

---

#### 1. Nhóm Kịch Bản Dịch Vụ Phụ Thuộc Bị Lỗi Hoặc Gián Đoạn (External Service Failures & Timeouts)

---

##### IT15_AI_Timeout_Resilience : GOOGLE GEMINI AI BỊ TIMEOUT KHI SINH CÂU HỎI TỪ GIÁO ÁN

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên tải tệp giáo án hợp lệ.
  - Mock Google Gemini API được cấu hình giả lập phản hồi trễ quá 15 giây hoặc trả về mã HTTP 504 Gateway Timeout.
- **CÁC THÀNH PHẦN THAM GIA TÍCH HỢP:**
  - `QuizzesController` & `QuizzesService`.
  - `GoogleGenAI Client Library` (Gemini 1.5 Flash).
  - `Firebase Storage` (Đã tải file lên tạm thời).
- **DỮ LIỆU ĐẦU VÀO:**
  - **Endpoint & Method:** `POST /api/v1/quizzes/generate-ai`
  - **Headers:** `Authorization: Bearer <token_gv>`, `Content-Type: multipart/form-data`
  - **Payload:** File `giao_an_toan_dai_so.docx`, `subject_code: "MATH"`, `num_questions: 5`.
- **CÁC BƯỚC THỰC HIỆN:**
  1. Gửi request sinh câu hỏi bằng AI.
  2. Mock Gemini API giả lập nghẽn mạng quá thời gian chờ (15s timeout threshold).
  3. Lắng nghe phản hồi từ NestJS Server và kiểm tra logs hệ thống.
  4. Kiểm tra collection `/quizzes` trên Firestore.
- **KẾT QUẢ MONG ĐỢI (ASSERTIONS):**
  - Hệ thống không bị treo hay crash tiến trình NestJS.
  - Xử lý timeout an toàn, trả về **HTTP 503 (SERVICE UNAVAILABLE)** hoặc **HTTP 504 (GATEWAY TIMEOUT)**.
  - Cấu trúc phản hồi lỗi chuẩn Envelope:
    ```json
    {
      "success": false,
      "status_code": 503,
      "message": "Dịch vụ Trợ lý AI đang bận hoặc phản hồi chậm, vui lòng thử lại sau giây lát",
      "error_code": "QUIZ_AI_GENERATION_FAILED",
      "timestamp": "2026-10-01T08:30:00.000Z"
    }
    ```
  - **Toàn vẹn CSDL:** Tuyệt đối không tạo ra bất kỳ document rác nào trong collection `/quizzes` và subcollection `/questions`. File tạm trên Firebase Storage được dọn dẹp hoặc đánh dấu hủy.
- **TRẠNG THÁI KIỂM THỬ:** 

---

##### IT16_FCM_Invalid_Token_Cleanup : XỬ LÝ LỖI DEVICE TOKEN FCM HẾT HẠN MÀ KHÔNG GÂY LỖI LUỒNG CHÍNH

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Phụ huynh có 2 thiết bị: Thiết bị 1 có token hợp lệ, Thiết bị 2 có token đã bị thu hồi/gỡ app (`registration-token-not-registered`).
- **CÁC THÀNH PHẦN THAM GIA TÍCH HỢP:**
  - `NotificationsModule` & `FCM Dispatcher`.
  - `UsersService` (Dọn dẹp token hỏng).
  - `Cloud Firestore` (Collection `/users`).
- **DỮ LIỆU ĐẦU VÀO:**
  - Lệnh gửi thông báo điểm danh hoặc nhận xét mới tới phụ huynh.
- **CÁC BƯỚC THỰC HIỆN:**
  1. Kích hoạt sự kiện gửi thông báo đẩy qua FCM.
  2. Mock FCM trả về lỗi `messaging/registration-token-not-registered` cho token thứ 2.
  3. Quan sát cách `NotificationService` xử lý lỗi bất đồng bộ.
  4. Kiểm tra mảng `fcm_tokens` của phụ huynh trong collection `/users`.
- **KẾT QUẢ MONG ĐỢI (ASSERTIONS):**
  - Request nghiệp vụ chính (Điểm danh / Nhập điểm / Gửi nhận xét) vẫn trả về **HTTP 200 / 201 Thành công**, không bị gián đoạn hay ném ngoại lệ 500 ra ngoài API Gateway.
  - FCM Dispatcher bắt lỗi graceful, ghi log cảnh báo và tự động thực hiện thao tác xóa bỏ token chết ra khỏi mảng `fcm_tokens` của user trong Firestore `/users`.
  - Thiết bị 1 của phụ huynh vẫn nhận thông báo bình thường.
- **TRẠNG THÁI KIỂM THỬ:** 

---

##### IT17_Storage_Failure_Rollback : UPLOAD GIÁO ÁN THẤT BẠI DO LỖI FIREBASE STORAGE ĐƯỢC ROLLBACK HOÀN TOÀN

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên thực hiện upload tệp giáo án `.docx`.
  - Firebase Storage SDK được giả lập ngắt kết nối mạng (`STORAGE_NETWORK_DISCONNECTED`).
- **CÁC THÀNH PHẦN THAM GIA TÍCH HỢP:**
  - `QuizzesController` & `QuizzesService`.
  - `Firebase Storage Client`.
  - `Cloud Firestore`.
- **DỮ LIỆU ĐẦU VÀO:**
  - Request multipart upload file giáo án.
- **CÁC BƯỚC THỰC HIỆN:**
  1. Gửi request `POST /api/v1/quizzes/generate-ai`.
  2. Kích hoạt lỗi gián đoạn tại bước lưu file lên Cloud Storage.
  3. Kiểm tra phản hồi lỗi và kiểm tra trạng thái CSDL.
- **KẾT QUẢ MONG ĐỢI (ASSERTIONS):**
  - Trả về mã lỗi **HTTP 503 (SERVICE UNAVAILABLE)** kèm `error_code: "SYS_SERVICE_UNAVAILABLE"`.
  - Luồng bị ngắt ngay lập tức: Không gọi sang Google Gemini AI (tiết kiệm chi phí API), không tạo bản ghi nào trong Firestore.
- **TRẠNG THÁI KIỂM THỬ:** 

---

#### 2. Nhóm Kịch Bản Xung Đột Dữ Liệu & Toàn Vẹn Giao Dịch (Conflict & Rollback Cases)

---

##### IT18_Attendance_Duplicate_Block : CHẶN XUNG ĐỘT GỬI ĐIỂM DANH TRÙNG LẶP CÙNG TIẾT VÀ BẢO TOÀN DỮ LIỆU CŨ

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Lớp `6A1` đã được điểm danh tiết 1 ngày `2026-10-01` thành công (testcase `IT06`).
- **CÁC THÀNH PHẦN THAM GIA TÍCH HỢP:**
  - `AttendanceService` & `Cloud Firestore` (Truy vấn kiểm tra Composite Index `[class_id, attendance_date, period]`).
- **DỮ LIỆU ĐẦU VÀO:**
  - Gửi lại cùng payload điểm danh cho lớp `6A1`, ngày `2026-10-01`, tiết `1`.
- **CÁC BƯỚC THỰC HIỆN:**
  1. Thực hiện gửi yêu cầu `POST /api/v1/attendance/submit`.
  2. Backend truy vấn bản ghi hiện hữu trước khi thực hiện ghi dữ liệu.
- **KẾT QUẢ MONG ĐỢI (ASSERTIONS):**
  - Hệ thống từ chối ghi nhận và trả về **HTTP 409 (CONFLICT)**.
  - Cấu trúc mã lỗi chuẩn:
    ```json
    {
      "success": false,
      "status_code": 409,
      "message": "Tiết học này đã được điểm danh trước đó, không thể ghi đè",
      "error_code": "ATTEND_ALREADY_EXISTS",
      "timestamp": "2026-10-01T08:35:00.000Z"
    }
    ```
  - Dữ liệu điểm danh cũ trong Firestore được bảo toàn nguyên vẹn 100%, không kích hoạt lại thông báo FCM trùng lặp cho phụ huynh.
- **TRẠNG THÁI KIỂM THỬ:** 

---

##### IT19_Class_Create_Rollback : ROLLBACK TOÀN BỘ GIAO DỊCH KHI TRÙNG MÃ HỌC SINH TRONG DANH SÁCH TẠO LỚP

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - GVCN gửi danh sách 5 học sinh, trong đó học sinh thứ 5 có `student_code` bị trùng với học sinh thứ 2 (`"HS002"`).
- **CÁC THÀNH PHẦN THAM GIA TÍCH HỢP:**
  - `ClassesService` & `Firestore Batched Writes / Transactions`.
- **DỮ LIỆU ĐẦU VÀO:**
  - Request `POST /api/v1/classes` với body chứa danh sách học sinh có mã trùng lặp nội bộ.
- **CÁC BƯỚC THỰC HIỆN:**
  1. Gửi request tạo lớp.
  2. Transaction phát hiện vi phạm tính duy nhất của mã học sinh trong lớp.
  3. Kích hoạt cơ chế Rollback toàn bộ.
- **KẾT QUẢ MONG ĐỢI (ASSERTIONS):**
  - Trả về mã lỗi **HTTP 409 (CONFLICT)** kèm `error_code: "CLASS_STUDENT_CODE_EXISTS"`.
  - **Tính toàn vẹn Transaction:** Lớp học KHÔNG được tạo trong `/classes`, 4 học sinh hợp lệ trước đó KHÔNG bị lưu mồ côi trong `/students`, và bảng `/fees_and_insurance` KHÔNG có dữ liệu rác. Trạng thái database giữ nguyên như trước khi gửi request.
- **TRẠNG THÁI KIỂM THỬ:** 

---

#### 3. Nhóm Kịch Bản Vi Phạm Phân Quyền & Bảo Mật (RBAC & Cross-Resource Security)

---

##### IT20_Subject_Teacher_RBAC_Block : CHẶN GIÁO VIÊN BỘ MÔN NHẬP ĐIỂM CHO MÔN HỌC KHÔNG ĐƯỢC PHÂN CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên bộ môn tiếng Anh (`uid_gvbm_eng`) chỉ được phân công dạy môn `ENG` tại lớp `6A1`.
- **CÁC THÀNH PHẦN THAM GIA TÍCH HỢP:**
  - `GradesController` & `GradesService` (Kiểm tra chéo với `subject_teachers` của `ClassesService`).
- **DỮ LIỆU ĐẦU VÀO:**
  - Headers mang token của `uid_gvbm_eng`.
  - Payload gửi tới `POST /api/v1/grades/batch` yêu cầu nhập điểm cho môn Toán (`subject_code: "MATH"`).
- **CÁC BƯỚC THỰC HIỆN:**
  1. Gửi request nhập điểm trái thẩm quyền.
  2. Service đối chiếu ID giáo viên trong token với phân công môn học của lớp.
- **KẾT QUẢ MONG ĐỢI (ASSERTIONS):**
  - Yêu cầu bị từ chối với mã **HTTP 403 (FORBIDDEN)**.
  - Phản hồi mã lỗi nghiệp vụ:
    ```json
    {
      "success": false,
      "status_code": 403,
      "message": "Bạn không có quyền nhập hoặc chỉnh sửa điểm cho môn học này",
      "error_code": "ACAD_NOT_ASSIGNED_TEACHER",
      "timestamp": "2026-10-01T08:40:00.000Z"
    }
    ```
  - Sổ điểm môn Toán `/scores` không bị sửa đổi bất kỳ giá trị nào.
- **TRẠNG THÁI KIỂM THỬ:** 

---

##### IT21_Parent_IDOR_Access_Block : CHẶN PHỤ HUYNH TRUY CẬP DỮ LIỆU HỌC TẬP VÀ BHYT CỦA CON EM KHÁC (IDOR SECURITY)

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Phụ huynh A (`uid_parent_long`) chỉ là bố của học sinh Long (`stu_long_01`).
  - Học sinh Trang (`stu_trang_02`) là con của phụ huynh khác.
- **CÁC THÀNH PHẦN THAM GIA TÍCH HỢP:**
  - `StudentsController` & `StudentsService` (Security Guard kiểm tra quan hệ `parent_uids`).
- **DỮ LIỆU ĐẦU VÀO:**
  - Headers mang token của Phụ huynh A.
  - Request: `GET /api/v1/students/stu_trang_02/academic` hoặc `GET /api/v1/students/stu_trang_02/fees-insurance`.
- **CÁC BƯỚC THỰC HIỆN:**
  1. Phụ huynh A thay đổi studentId trên đường dẫn URL để xem thông tin học sinh khác.
  2. Guard kiểm tra xem UID của Phụ huynh A có tồn tại trong mảng `parent_uids` của `stu_trang_02` không.
- **KẾT QUẢ MONG ĐỢI (ASSERTIONS):**
  - Chặn đứng hành vi với mã **HTTP 403 (FORBIDDEN)**.
  - Trả về mã lỗi: `PARENT_STUDENT_LINK_NOT_FOUND` ("Bạn không có quyền truy cập hồ sơ của học sinh này").
  - Bảo mật tuyệt đối quyền riêng tư dữ liệu cá nhân của học sinh.
- **TRẠNG THÁI KIỂM THỬ:** 

---

#### 4. Nhóm Kịch Bản Kiểm Soát Hạn Ngạch Tài Nguyên (Quota Enforcement)

---

##### IT22_AI_Daily_Quota_Exceeded : CHẶN SINH CÂU HỎI BẰNG AI KHI GIÁO VIÊN ĐÃ SỬ DỤNG HẾT HẠN MỨC TRONG NGÀY

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Hạn mức hệ thống quy định 20 lượt gọi AI/ngày/GV (testcase `IT01`).
  - Giáo viên `uid_teacher_01` đã thực hiện đủ 20 lượt tạo đề thành công trong ngày hôm nay.
- **CÁC THÀNH PHẦN THAM GIA TÍCH HỢP:**
  - `QuotaGuard` & `QuizzesService`.
  - `Cloud Firestore` (Kiểm tra bộ đếm lượt gọi trong document `/quota_tracking/{teacher_id}_{date}`).
- **DỮ LIỆU ĐẦU VÀO:**
  - Gửi request `POST /api/v1/quizzes/generate-ai` lần thứ 21 trong ngày.
- **CÁC BƯỚC THỰC HIỆN:**
  1. Giáo viên gửi yêu cầu tạo thêm đề kiểm tra bài cũ bằng AI.
  2. QuotaGuard kiểm tra bộ đếm trước khi tiếp nhận file.
- **KẾT QUẢ MONG ĐỢI (ASSERTIONS):**
  - Request bị chặn ngay tại tầng Guard với mã **HTTP 429 (TOO MANY REQUESTS)**.
  - Cấu trúc phản hồi thông báo rõ nguyên nhân:
    ```json
    {
      "success": false,
      "status_code": 429,
      "message": "Bạn đã sử dụng hết hạn ngạch 20 lượt sinh câu hỏi AI miễn phí trong ngày hôm nay. Vui lòng quay lại vào ngày mai.",
      "error_code": "QUIZ_DAILY_QUOTA_EXCEEDED",
      "timestamp": "2026-10-01T08:45:00.000Z"
    }
    ```
  - Không tốn tài nguyên upload file lên Storage và không gọi API Gemini tiêu tốn chi phí.
- **TRẠNG THÁI KIỂM THỬ:** 

---

## 4. KẾT LUẬN & HƯỚNG DẪN THỰC THI KIỂM THỬ TÍCH HỢP TỰ ĐỘNG

1. **Bộ Test Suite Chuẩn Hóa:** Tài liệu này bao quát trọn vẹn 22 kịch bản kiểm thử tích hợp (14 kịch bản Positive Flows và 8 kịch bản Failure/Resilience/Security Cases), bao quát 100% vòng đời vận hành thực tế của hệ thống GiaoVienHay từ cấp độ Quản trị Nền tảng, Giáo viên Chủ nhiệm, Giáo viên Bộ môn đến Cổng Phụ huynh.
2. **Khởi chạy trên Firebase Emulator Suite:**
   ```bash
   # Khởi động cụm giả lập Firebase (Firestore, Auth, Storage)
   firebase emulators:start --only firestore,auth,storage
   
   # Chạy bộ kiểm thử tích hợp Jest / Supertest
   pnpm test:integration
   ```
3. **Tiêu chuẩn Hoàn tất (Definition of Done - DoD):** Tất cả 22 testcase khi chạy kiểm thử thực tế phải đạt kết quả **PASS**, đảm bảo tính toàn vẹn dữ liệu Firestore NoSQL, không rò rỉ bộ nhớ, xử lý lỗi ngoại lệ an toàn và tuân thủ tuyệt đối cấu trúc Response Envelope chuẩn.
