# Tài Liệu Đặc Tả Tác Nhân & Trường Hợp Sử Dụng (Actors & Use Cases Specification)
# Hệ Thống GiaoVienHay – Quản Lý Học Sinh Cấp 1 & Cấp 2

---

## 1. Giới thiệu & Ranh giới phân quyền hệ thống

Hệ thống phân định rõ rệt quyền hạn giữa các nhóm tác nhân, trong đó **Giáo viên chủ nhiệm (GVCN)** sở hữu toàn bộ các quyền giảng dạy sư phạm của **Giáo viên bộ môn (GVBM)** và có thêm các quyền quản trị riêng cho lớp chủ nhiệm:

```text
               ┌────────────────────────────────────────────────────────┐
               │              Giáo viên Bộ môn (GVBM)                   │
               │ - Tải giáo án để AI sinh câu hỏi & Tạo Quiz bài cũ     │
               │ - Tạo Mini-game lớp học (Rung chuông, Đua xe, Hộp quà) │
               │ - Dò bài cũ, Vòng quay Random học sinh                 │
               │ - Nhập điểm môn học phụ trách                          │
               └───────────────────────────┬────────────────────────────┘
                                           │ (Kế thừa toàn bộ quyền giảng dạy)
                                           ▼
               ┌────────────────────────────────────────────────────────┐
               │              Giáo viên Chủ nhiệm (GVCN)                │
               │ + TOÀN QUYỀN GIẢNG DẠY (Tạo Quiz bằng AI, Mini-game,   │
               │   Dò bài cũ, Vào điểm môn học mình phụ trách)          │
               │ + Tạo Lớp học tổng, thêm học sinh & phân công GVBM     │
               │ + Điểm danh chuyên cần lớp chủ nhiệm                   │
               │ + Quản lý danh sách nộp Học phí & BHYT                 │
               │ + Nhận xét học sinh & phát thông báo tới phụ huynh     │
               └────────────────────────────────────────────────────────┘
```

---

## 2. Danh mục Tác nhân Chi tiết (System Actors)

| Mã Tác nhân | Tên Tác nhân | Vai trò chi tiết | Quyền hạn nghiệp vụ |
| :--- | :--- | :--- | :--- |
| **ACT-01** | **Admin** | Quản trị viên Nền tảng (Platform Admin) | Quản trị kỹ thuật hệ thống: CRUD người dùng & dữ liệu, Ban (khóa/mở khóa tài khoản), Limit (cấu hình hạn mức lớp học, học sinh, lượt gọi AI). |
| **ACT-02A** | **GVCN** (Teacher Homeroom) | Giáo viên Chủ nhiệm | **Toàn quyền giảng dạy (Tải giáo án để AI sinh câu hỏi / Tạo Quiz kiểm tra bài cũ, Tổ chức Mini-game, Dò bài cũ, Chấm điểm môn phụ trách)** + Tạo Lớp tổng, gán GVBM, quản lý nề nếp, điểm danh, theo dõi cờ nộp BHYT (`fees_and_insurance`), gửi nhận xét. |
| **ACT-02B** | **GVBM** (Teacher Subject) | Giáo viên Bộ môn | Tải giáo án để AI sinh câu hỏi / Tạo Quiz bài cũ, tổ chức mini-game, quay random học sinh, nhập/sửa điểm môn học mình được phân công trong lớp tổng. |
| **ACT-03** | **Parent** (Phụ huynh) | Phụ huynh học sinh | Nhận thông báo đẩy (vắng học, điểm mới, nhắc BHYT, nhận xét), theo dõi sổ liên lạc, tra cứu tình trạng BHYT của con em. |
| **SYS-01** | **Gemini AI Engine** | Dịch vụ AI (Google Gemini API) | Trích xuất văn bản từ Docs/PDF giáo án, tự động tạo câu hỏi trắc nghiệm/tự luận ngắn (Quiz) phục vụ kiểm tra bài cũ. |
| **SYS-02** | **Firebase FCM** | Dịch vụ Push Notification | Gửi thông báo tức thì tới ứng dụng di động React Native của Phụ huynh. |

> **LƯU Ý VỀ PHẠM VI TÁC NHÂN (ACTOR SCOPE):**  
> Hệ thống GiaoVienHay **KHÔNG CÓ TÁC NHÂN HỌC SINH (Student)**. Học sinh không được cấp tài khoản và không có chức năng/giao diện làm bài kiểm tra trực tuyến. Mọi hoạt động khởi động, ôn tập, mini-game diễn ra trực tiếp tại phòng học (chiếu bảng, giơ bảng đáp án, thao tác bảng thông minh); Giáo viên là người duy nhất thực hiện chấm và nhập điểm lên hệ thống.

---

## 3. Ma Trận Phân Quyền Use Case Toàn Diện

| Mã Use Case | Tên Trường hợp sử dụng | Admin | GVCN | GVBM | Phụ huynh |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **UC-AUTH-01** | Đăng nhập hệ thống (Web / Mobile App) | ✔ | ✔ | ✔ | ✔ |
| **UC-AUTH-02** | Thiết lập hồ sơ cá nhân & Chọn môn giảng dạy (1 hoặc nhiều môn) | ✔ | ✔ | ✔ | ✔ |
| **UC-ADM-01** | CRUD Tài khoản & Dữ liệu Hệ thống | ✔ | ✖ | ✖ | ✖ |
| **UC-ADM-02** | Khóa & Mở khóa Tài khoản (Ban / Unban) | ✔ | ✖ | ✖ | ✖ |
| **UC-ADM-03** | Cấu hình Hạn mức Tài nguyên (Limit / Quota) | ✔ | ✖ | ✖ | ✖ |
| **UC-CLS-01** | Tạo Lớp học tổng, Thêm Học sinh & Phân công GVBM | Xem | ✔ | ✖ | ✖ |
| **UC-CLS-02** | Sinh & Chia sẻ Link mời vào lớp (Invite Link & QR) | ✖ | ✔ | ✖ | ✖ |
| **UC-PAR-00** | Tham gia Lớp bằng Link mời & Xác nhận liên kết con em | ✖ | ✖ | ✖ | ✔ |
| **UC-ACA-01** | Điểm danh chuyên cần lớp chủ nhiệm | ✖ | ✔ | ✖ | ✖ |
| **UC-ACA-02** | Nhập sổ điểm môn học phụ trách (không tính GPA) | ✖ | ✔ | ✔ | ✖ |
| **UC-ACA-03** | Nhập nhận xét ngắn gọn (đoạn text ngắn gửi phụ huynh) | ✖ | ✔ | ✔ | ✖ |
| **UC-ACA-04** | Dò bài cũ & Quay Random học sinh (nút Bỏ qua khi vắng) | ✖ | ✔ | ✔ | ✖ |
| **UC-ACA-05** | **Import Docs/PDF bằng AI (Gemini) sinh câu hỏi / Tạo Quiz** | ✖ | **✔ (Có)** | **✔ (Có)** | ✖ |
| **UC-ACA-06** | **Tạo & Khởi chạy Mini-game tương tác lớp học** | ✖ | **✔ (Có)** | **✔ (Có)** | ✖ |
| **UC-ACA-07** | Trình chiếu Bảng xếp hạng (Leaderboard) Điểm Môn Học | ✖ | ✔ | ✔ | ✖ |
| **UC-ACA-08** | **Tạo lời nhắc lịch kiểm tra gửi Phụ huynh đôn đốc con** | ✖ | **✔ (Có)** | **✔ (Có)** | ✖ |
| **UC-FEE-01** | Quản lý cờ thu Học phí & BHYT (`fees_and_insurance`)| Xem | ✔ | ✖ | ✖ |
| **UC-PAR-01** | Tra cứu bảng điểm đa môn & Học bạ điện tử của con | ✖ | ✖ | ✖ | ✔ |
| **UC-PAR-02** | Theo dõi lịch sử chuyên cần & Cảnh báo vắng | ✖ | ✖ | ✖ | ✔ |
| **UC-PAR-03** | Xem trạng thái đóng Học phí & BHYT của con | ✖ | ✖ | ✖ | ✔ |
| **UC-PAR-04** | Nhận thông báo đẩy thời gian thực từ nhà trường | ✖ | ✖ | ✖ | ✔ |
| **UC-PAR-05** | **Nhận lời nhắc lịch kiểm tra & Đôn đốc con ôn tập** | ✖ | ✖ | ✖ | **✔ (Có)** |

---

## 4. Mô Tả Các Nghiệp Vụ Tương Tác Giảng Dạy Của Giáo Viên (Cả GVCN & GVBM)

### 4.1. Import Docs/PDF Bằng AI (Gemini) Để Tạo Quiz Kiểm Tra Bài Cũ (UC-ACA-05)
- **Tác nhân thực hiện:** **Cả GVCN và GVBM đều có toàn quyền thực hiện.**
- **Mô tả:** Giáo viên tải tệp giáo án (`.docx`, `.pdf`) bài giảng lên hệ thống, chủ động chọn **Số lượng câu hỏi** (3, 5, 10...) và **Độ khó** (`EASY`, `MEDIUM`, `HARD`, `MIXED`). AI Gemini sẽ tự động phân tích và sinh bộ câu hỏi trắc nghiệm kiểm tra bài cũ (Quiz) 5-10 phút đầu giờ theo đúng yêu cầu.
- **Lựa chọn 2 hình thức tổ chức:**
  1. Trình chiếu dạng Quiz trắc nghiệm tiêu chuẩn (kèm Vòng quay may mắn có nút Bỏ qua khi vắng).
  2. Nếu không muốn Quiz thì chuyển đổi trực tiếp sang Chế độ Game (UC-ACA-06).
- **Ý nghĩa thực tế:**
  - **Với GVCN Cấp 1:** Trực tiếp đứng lớp dạy hầu hết các môn (Toán, Tiếng Việt, Tự nhiên Xã hội...) nên GVCN thường xuyên tạo Quiz hàng ngày cho các môn này.
  - **Với GVCN Cấp 2:** Tạo Quiz cho môn chuyên môn mình dạy và tạo câu hỏi đố vui trong các tiết Sinh hoạt lớp cuối tuần.
  - **Với GVBM:** Tạo Quiz cho môn học mình được phân công giảng dạy.

### 4.2. Tạo & Vận Hành Mini-game Tương Tác Lớp Học (UC-ACA-06)
- **Tác nhân thực hiện:** **GVCN hoặc GVBM.**
- **Mô tả:** Khi giáo viên không muốn chiếu Quiz thông thường, giáo viên chọn Chế độ Game để nạp toàn bộ bộ câu hỏi AI vừa tạo vào 1 trong 3 Mini-game chiếu lên bảng lớp:
  - **Game 1 - Rung Chuông Vàng:** Học sinh trong lớp cùng giơ bảng chọn A/B/C/D, giáo viên bấm đáp án trên màn hình để kiểm tra ai ở lại sàn thi đấu.
  - **Game 2 - Vượt Chướng Ngại Vật (Đua xe):** Chia lớp thành các tổ thi đua, trả lời đúng câu hỏi thì xe của đội tiến 1 ô.
  - **Game 3 - Mở Hộp Quà May Mắn:** Chọn câu hỏi bất kỳ, trả lời đúng mở được phần thưởng điểm số hoặc sticker khen thưởng.

### 4.3. Dò Bài Cũ & Vòng Quay Random Học Sinh (UC-ACA-04)
- Áp dụng cho cả **GVCN** và **GVBM** đầu mỗi tiết học.
- Vòng quay may mắn gọi ngẫu nhiên học sinh lên bảng kiểm tra bài cũ. Nếu học sinh nghỉ học/vắng mặt, giáo viên bấm **"Bỏ qua (Skip)"** để tự động quay bạn khác.
- Cho phép giáo viên trực tiếp chấm và nhập điểm miệng vào môn học đang dạy.

### 4.4. Tạo Lời Nhắc Lịch Kiểm Tra Cho Phụ Huynh Đôn Đốc Con (UC-ACA-08)
- Áp dụng cho cả **GVCN** và **GVBM**.
- Giáo viên tạo thông báo trước ngày kiểm tra (15 phút, 1 tiết, Giữa kỳ...) kèm theo môn học, ngày kiểm tra và nội dung dặn dò bài học.
- Hệ thống gửi thông báo đẩy (FCM) tức thì tới toàn thể phụ huynh trong lớp, giúp gia đình chủ động nhắc nhở, đồng hành cùng con em ôn tập tốt nhất.

