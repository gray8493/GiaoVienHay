# Tài Liệu Ngăn Xếp Công Nghệ & Sơ Đồ CSDL (Tech Stack & Database Schema)
# Hệ Thống GiaoVienHay – Quản Lý Học Sinh Cấp 1 & Cấp 2

---

## 1. Ngăn Xếp Công Nghệ Chuẩn (Technology Stack)

| Tầng kiến trúc | Công nghệ chính | Mục đích & Chi tiết ứng dụng |
| :--- | :--- | :--- |
| **Web Frontend** | **Next.js 14+ (App Router)** | Web Quản trị cho Admin, GVCN & GVBM. Tích hợp màn hình Vòng quay Random học sinh và Chế độ trình chiếu bài kiểm tra cũ lên bảng lớp. |
| **Mobile Frontend** | **React Native (TypeScript)** | Mobile App cho Giáo viên (điểm danh nhanh) & Phụ huynh (xem điểm, xem chuyên cần, tra cứu tình trạng đóng Học phí & BHYT). |
| **Backend API** | **NestJS 10+ (TypeScript)** | Modular backend, xử lý RBAC Guards phân cấp (Admin, GVCN, GVBM, Parent), tích hợp Background Workers. |
| **AI Integration** | **Google Gemini API** (`@google/genai`) | Bóc tách tài liệu giáo án (.docx, .pdf) và tự động sinh câu hỏi kiểm tra bài cũ 5-10 phút đầu giờ. |
| **Relational Database** | **PostgreSQL (v15+)** | Lưu trữ toàn bộ 10 bảng dữ liệu cốt lõi, quan hệ chặt chẽ, đảm bảo tính toàn vẹn giao dịch (ACID). |
| **ORM / Data Access** | **Prisma ORM / TypeORM** | Quản lý schema, migrations an toàn, type-safe query. |
| **Document & Logs** | **MongoDB (v6+)** | Lưu trữ bài viết bảng tin nhà trường và audit logs lịch sử thay đổi điểm/điểm danh. |
| **Caching & Queues** | **Redis (v7+) & BullMQ** | Caching session, lưu Device Token FCM, quản lý hàng đợi gửi thông báo bất đồng bộ. |
| **Message Broker** | **RabbitMQ** | Định tuyến các sự kiện: `StudentAbsentEvent`, `GradePublishedEvent`, `FeeReminderEvent`. |
| **Push Notification** | **Firebase Cloud Messaging (FCM)** | Đẩy thông báo tức thì tới thiết bị di động của Phụ huynh. |

---

## 2. Thiết Kế Sơ Đồ Cơ Sở Dữ Liệu PostgreSQL (10 Bảng Cốt Lõi)

Hệ thống quản lý dữ liệu học sinh Cấp 1 & 2 xoay quanh 10 bảng thực thể cốt lõi:

```mermaid
erDiagram
    users ||--o{ classes : manages_as_homeroom
    users ||--o{ student_parent_relations : is_parent_of
    classes ||--|{ students : belongs_to
    students ||--o{ student_parent_relations : has_parent
    students ||--o{ scores : receives
    students ||--o{ attendances : checked_in
    students ||--o{ fees_and_insurance : pays
    users ||--o{ quizzes : creates
    quizzes ||--|{ questions : contains
    users ||--o{ notifications : receives_noti

    users {
        uuid id PK
        string email UK
        string phone UK
        string password_hash
        string full_name
        enum role "ADMIN, TEACHER_HOMEROOM, TEACHER_SUBJECT, PARENT"
        datetime created_at
    }

    classes {
        uuid id PK
        string name "Ví dụ: 1A, 6B"
        int grade_level "1 đến 9"
        string academic_year "2026-2027"
        uuid homeroom_teacher_id FK
    }

    students {
        uuid id PK
        string student_code UK "Mã định danh học sinh"
        string full_name
        date dob
        enum gender "MALE, FEMALE"
        uuid class_id FK
    }

    student_parent_relations {
        uuid student_id PK,FK
        uuid parent_user_id PK,FK
        string relationship "FATHER, MOTHER, GUARDIAN"
    }

    scores {
        uuid id PK
        uuid student_id FK
        string subject_code "MATH, LIT, ENG,..."
        int semester "1 hoặc 2"
        enum score_type "ORAL_TEST, TEST_15P, TEST_1P, MID_TERM, FINAL"
        float score_value "Thang điểm 0.0 - 10.0"
        uuid teacher_id FK
        datetime created_at
    }

    attendances {
        uuid id PK
        uuid student_id FK
        uuid class_id FK
        date attendance_date
        int period "Tiết học hoặc Buổi sáng/chiều"
        enum status "PRESENT, ABSENT_EXCUSED, ABSENT_UNEXCUSED"
        string note "Lý do vắng"
        uuid teacher_id FK
    }

    fees_and_insurance {
        uuid id PK
        uuid student_id FK
        string term_name "Học kỳ 1 - 2026"
        decimal tuition_amount
        boolean is_paid_tuition "Cờ trạng thái đã nộp học phí"
        datetime tuition_paid_at
        decimal insurance_amount
        boolean is_paid_insurance "Cờ trạng thái đã nộp BHYT"
        datetime insurance_paid_at
        string payment_method "CASH, ONLINE"
    }

    quizzes {
        uuid id PK
        string title "Kiểm tra bài cũ: Bài 5 - Phân số"
        string subject_code
        uuid class_id FK
        uuid teacher_id FK
        string source_doc_url "Link lưu tài liệu gốc"
        datetime created_at
    }

    questions {
        uuid id PK
        uuid quiz_id FK
        text content "Nội dung câu hỏi"
        jsonb options "Mảng 4 đáp án A, B, C, D"
        string correct_answer "A, B, C hoặc D"
        text explanation "Lời giải thích đáp án"
        int time_limit_seconds "Thời gian suy nghĩ (mặc định 30s-60s)"
    }

    notifications {
        uuid id PK
        uuid recipient_user_id FK
        string title
        text body
        enum type "ATTENDANCE_ALERT, GRADE_ALERT, FEE_REMINDER, GENERAL"
        boolean is_read
        datetime created_at
    }
```

---

## 3. Kiến Trúc Tích Hợp AI (Google Gemini API)

```text
[Giáo viên tải file .docx / .pdf lên Web Next.js]
                        │
                        ▼ (Multipart/Form-Data)
[NestJS: Academic/Quiz Controller]
                        │
                        ▼ (Lưu file gốc vào S3/MinIO & Trích xuất văn bản)
[Doc Parser Service: mammoth / pdf-parse]
                        │
                        ▼ (Gửi text trích xuất + Prompt sư phạm kiểm tra bài cũ)
[Google Gemini API: gemini-1.5-flash]
                        │
                        ▼ (Trả về JSON Schema câu hỏi)
[NestJS: Lưu bảng quizzes & questions] ──► [Web Next.js: Trình chiếu lên bảng lớp]
```

