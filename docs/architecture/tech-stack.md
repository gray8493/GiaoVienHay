# Tài Liệu Ngăn Xếp Công Nghệ & Sơ Đồ CSDL (Tech Stack & Database Architecture)
# Hệ Thống GiaoVienHay – Quản Lý Học Sinh Cấp 1 & Cấp 2

---

## 1. Ngăn Xếp Công Nghệ Chuẩn (Technology Stack)

Hệ thống **GiaoVienHay** chuẩn hóa toàn bộ hạ tầng dữ liệu và dịch vụ đám mây trên nền tảng **Google Firebase**:

| Tầng kiến trúc | Công nghệ chính | Mục đích & Chi tiết ứng dụng |
| :--- | :--- | :--- |
| **Web Frontend** | **Next.js 14+ (App Router)** | **Web Quản trị dành CHỈ RIÊNG CHO PLATFORM ADMIN.** Phụ trách 3 nhóm quyền hạn quản trị: CRUD tài nguyên hệ thống/người dùng, Khóa/Mở khóa tài khoản (Ban/Unban), Quản trị Hạn ngạch (Limit/Quota tài nguyên và lượt gọi AI). Tuyệt đối không chứa route nghiệp vụ sư phạm hay cổng phụ huynh. |
| **Mobile & Tablet Frontend** | **React Native (TypeScript)** | **Ứng dụng di động & máy tính bảng dành cho Giáo viên (GVCN & GVBM) và Phụ huynh.** Giáo viên sử dụng Phone/Tablet để điểm danh, vào sổ điểm, chạy Vòng quay random, tổ chức 3 Mini-game (hỗ trợ chiếu Smartboard/Máy chiếu), gửi nhận xét, dặn dò lịch kiểm tra. Phụ huynh tra cứu học tập, điểm danh, nộp BHYT. |
| **Backend API** | **NestJS 10+ (TypeScript)** | Modular backend, tích hợp **Firebase Admin SDK** (`firebase-admin`) để xử lý nghiệp vụ, phân quyền RBAC và kiểm soát dữ liệu. |
| **Database (Duy nhất)** | **Google Cloud Firestore** | **Cơ sở dữ liệu NoSQL Document Store thời gian thực**, lưu trữ toàn bộ hồ sơ, lớp học, điểm danh, sổ điểm, cờ BHYT/học phí. |
| **Authentication** | **Firebase Authentication** | Quản lý đăng nhập an toàn đa phương thức: Số điện thoại (SMS OTP), Email & Mật khẩu. |
| **File Storage** | **Firebase Cloud Storage** | Lưu trữ tài liệu giáo án bài giảng (`.docx`, `.pdf`) và ảnh đại diện người dùng. |
| **AI Integration** | **Google Gemini API** (`@google/genai`) | Bóc tách tài liệu giáo án (.docx, .pdf) và tự động sinh câu hỏi/mini-game tương tác đầu giờ cho Giáo viên trình chiếu tại lớp. |
| **Push Notification** | **Firebase Cloud Messaging (FCM)** | Đẩy thông báo tức thì (Cảnh báo vắng học, Điểm số mới, Lời nhắc bài kiểm tra, Nhắc đóng BHYT) tới thiết bị di động của Phụ huynh. |
| **Realtime Sync** | **Firestore Snapshot Listeners** | Lắng nghe thay đổi dữ liệu thời gian thực (điểm danh lớp học, cập nhật điểm, bảng xếp hạng). |

---

## 2. Thiết Kế Cấu Trúc Cơ Sở Dữ Liệu Cloud Firestore (Collections & Documents)

Hệ thống quản lý dữ liệu học sinh Cấp 1 & 2 tổ chức theo mô hình NoSQL Collections & Documents trên **Cloud Firestore**:

```mermaid
erDiagram
    users ||--o{ classes : manages_as_homeroom
    classes ||--|{ students : contains_students
    users ||--o{ students : links_parent
    students ||--o{ scores : has_scores
    classes ||--o{ attendances : records_attendance
    students ||--o{ fees_and_insurance : tracks_fees
    users ||--o{ quizzes : creates_quiz
    quizzes ||--|{ questions_subcollection : contains_questions
    quizzes ||--o{ quiz_results : records_in_class_results
    users ||--o{ notifications : receives_notifications

    users {
        string uid PK "Firebase Auth UID"
        string email
        string phone
        string full_name
        string role "ADMIN, TEACHER_HOMEROOM, TEACHER_SUBJECT, PARENT"
        string avatar_url
        array fcm_tokens "Danh sách device tokens"
        timestamp created_at
    }

    classes {
        string id PK "Class Document ID"
        string name "Ví dụ: 1A, 6B"
        int grade_level "1 đến 9"
        string academic_year "2026-2027"
        string homeroom_teacher_id "Ref -> users"
    }

    students {
        string id PK "Student Document ID"
        string student_code UK "Mã định danh học sinh"
        string full_name "Họ và tên học sinh"
        string class_id "Ref -> classes"
        date dob "Ngày sinh"
        string gender "MALE, FEMALE"
        array parent_uids "Danh sách UID phụ huynh liên kết"
    }

    attendances {
        string id PK "Attendance Document ID"
        string class_id "Ref -> classes"
        string student_id "Ref -> students"
        date attendance_date "YYYY-MM-DD"
        string status "PRESENT, ABSENT_EXCUSED, ABSENT_UNEXCUSED"
        string note
        timestamp created_at
    }

    scores {
        string id PK "Score Document ID"
        string student_id "Ref -> students"
        string subject_code "MATH, LIT, ENG,..."
        int semester "1 hoặc 2"
        string score_type "ORAL_TEST, TEST_15P, TEST_1P, MID_TERM, FINAL"
        decimal score_value "0.0 đến 10.0"
        string teacher_id "Ref -> users"
        boolean is_published "Cờ công bố cho phụ huynh"
        timestamp published_at
    }

    fees_and_insurance {
        string id PK "Record Document ID"
        string student_id "Ref -> students"
        string term_name "Học kỳ 1 - 2026"
        decimal tuition_amount
        boolean is_paid_tuition "Cờ trạng thái đã nộp học phí"
        timestamp tuition_paid_at
        decimal insurance_amount
        boolean is_paid_insurance "Cờ trạng thái đã nộp BHYT"
        timestamp insurance_paid_at
        string note "Ghi chú thu nộp của GVCN"
    }

    quizzes {
        string id PK "Quiz Document ID"
        string title "Kiểm tra bài cũ: Bài 5 - Phân số"
        string subject_code
        string class_id "Ref -> classes"
        string teacher_id "Ref -> users"
        string source_doc_url "Link Firebase Storage lưu giáo án"
        string game_type "GOLDEN_BELL, RACING, MYSTERY_BOX"
        timestamp created_at
    }

    questions_subcollection {
        string id PK "Subcollection: /quizzes/{id}/questions/{id}"
        int question_index
        string content "Nội dung câu hỏi"
        array options "Mảng 4 đáp án [A, B, C, D]"
        string correct_answer "A, B, C hoặc D"
        string explanation "Lời giải thích đáp án"
        int time_limit_seconds "Thời gian suy nghĩ (mặc định 30s)"
    }

    quiz_results {
        string id PK "Result Document ID"
        string quiz_id "Ref -> quizzes"
        string student_id "Ref -> students"
        string teacher_id "Ref -> users (GV nhập điểm)"
        decimal score "Điểm số GV chấm/nhập"
        string notes "Nhận xét của GV"
        boolean is_synced_to_grades "Đã chuyển vào sổ điểm"
        timestamp created_at
    }

    notifications {
        string id PK "Notification Document ID"
        string recipient_user_id "Ref -> users"
        string title
        string body
        string type "ATTENDANCE_ALERT, GRADE_ALERT, FEE_REMINDER, GENERAL"
        boolean is_read
        map metadata "student_id, screen"
        timestamp created_at
    }
```

---

## 3. Kiến Trúc Tích Hợp AI & Firebase

```text
[Giáo viên tải file .docx / .pdf từ App React Native (Phone/Tablet)]
                        │
                        ▼ (Lưu file giáo án gốc an toàn)
           [Firebase Cloud Storage]
                        │
                        ▼
           [NestJS Backend Controller]
                        ▼ (Gửi text trích xuất + Prompt sư phạm kiểm tra bài cũ)
        [Google Gemini API: gemini-1.5-flash]
                        │
                        ▼ (Trả về JSON bộ câu hỏi trắc nghiệm)
    [NestJS: Lưu vào Firestore /quizzes & subcollection /questions]
                        │
                        ▼
      [App React Native (Phone/Tablet kết nối Smartboard/Máy chiếu): Trình chiếu Mini-game lên bảng lớp]
                        │
                         ▼ (Giáo viên kiểm tra học sinh & trực tiếp nhập điểm tại lớp)
[Firestore /scores] ───────────────► [Hiển thị Bảng xếp hạng (Leaderboard) Điểm Môn Học cho GV xem]
                         │
                         ▼ (GV công bố điểm ──► Firestore Trigger / NestJS)
           [Firebase Cloud Messaging (FCM)]
                        │
                        ▼
   [Đẩy thông báo điểm tức thì đến App React Native của Phụ huynh]
```
