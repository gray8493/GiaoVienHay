# TÀI LIỆU KỊCH BẢN KIỂM THỬ ĐƠN VỊ - PHÂN HỆ SỔ ĐIỂM & BẢNG XẾP HẠNG
# MÃ PHÂN HỆ: 03 - GRADEBOOK & ASSESSMENT MODULE
# CẤP ĐỘ KIỂM THỬ: KIỂM THỬ ĐƠN VỊ (UNIT TEST)

---

## 1. THÔNG TIN CHUNG

- **PHÂN HỆ HỆ THỐNG:** `03` - Phân hệ Quản lý Sổ điểm & Đánh giá học sinh
- **MÔ TẢ MODULE API:** Sổ điểm điện tử môn học (`GradesService`, `GradesController`)
- **TẬP TIN KIỂM THỬ:** 
- **MÔI TRƯỜNG KIỂM THỬ:** Testing

---

## 2. CHI TIẾT CÁC KỊCH BẢN KIỂM THỬ ĐƠN VỊ

---

### UT03_Grades_TC01 : NHẬP BẢNG ĐIỂM THÀNH PHẦN CHO HỌC SINH THÀNH CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên đã đăng nhập thành công vào hệ thống với vai trò Giáo viên Bộ môn hoặc Giáo viên Chủ nhiệm.
  - Lớp học mã `cls_1a_2026` và học sinh mã `stu_01` đã tồn tại sẵn trong cơ sở dữ liệu.
  - Giáo viên có quyết định phân công giảng dạy môn Toán tại lớp học này.

- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "class_id": "cls_1a_2026",
    "subject_code": "MATH",
    "semester": 1,
    "score_type": "ORAL_TEST",
    "scores": [
      {
        "student_id": "stu_01",
        "score_value": 9.5,
        "teacher_comment": "Thuộc bài tốt, tính nhẩm nhanh"
      }
    ]
  }
  ```

- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của giáo viên vào mục **Headers** (`Authorization: Bearer <token_giao_vien>`).
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/grades/batch`.
  3. Thêm dữ liệu vào phần **Body** định dạng `raw (application/json)` theo cấu trúc JSON ở trên.
  4. Bấm nút **Gửi (Send)** để thực thi request.

- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Cập nhật thành công 1 bản ghi điểm vào cơ sở dữ liệu Firestore.
  - Dữ liệu trả về đúng định dạng JSON chuẩn như sau:

  ```json
  {
    "success": true,
    "status_code": 200,
    "message": "Lưu bảng điểm thành phần thành công",
    "data": {
      "class_id": "cls_1a_2026",
      "subject_code": "MATH",
      "score_type": "ORAL_TEST",
      "updated_count": 1
    }
  }
  ```

- **TRẠNG THÁI KIỂM THỬ:** 

---

### UT03_Grades_TC02 : TỪ CHỐI VÀ CHẶN NHẬP ĐIỂM VƯỢT QUÁ THANG ĐIỂM 10

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên đã đăng nhập hợp lệ vào hệ thống.
  - Lớp học mã `cls_1a_2026` và học sinh mã `stu_01` tồn tại trong hệ thống.

- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "class_id": "cls_1a_2026",
    "subject_code": "MATH",
    "semester": 1,
    "score_type": "ORAL_TEST",
    "scores": [
      {
        "student_id": "stu_01",
        "score_value": 12.0
      }
    ]
  }
  ```

- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của giáo viên vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/grades/batch`.
  3. Thêm dữ liệu chứa điểm số sai (`score_value = 12.0`) vào phần **Body** định dạng JSON ở trên.
  4. Bấm nút **Gửi (Send)** để thực thi request.

- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống ném ra ngoại lệ yêu cầu không hợp lệ **HTTP 400 (BAD REQUEST - YÊU CẦU SAI)**.
  - Tuyệt đối không ghi dữ liệu sai vào Firestore.
  - Dữ liệu lỗi trả về đúng định dạng JSON như sau:

  ```json
  {
    "success": false,
    "status_code": 400,
    "error_code": "INVALID_SCORE_VALUE",
    "message": "Điểm số phải trong khoảng từ 0.0 đến 10.0"
  }
  ```

- **TRẠNG THÁI KIỂM THỬ:** 

---

### UT03_Grades_TC03 : PHÊ DUYỆT CÔNG BỐ ĐIỂM CHO PHỤ HUYNH VÀ KÍCH HOẠT THÔNG BÁO ĐẨY

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Lớp `cls_1a_2026` đã lưu sẵn danh sách điểm môn `MATH` loại `TEST_15P` trong cơ sở dữ liệu với trạng thái chưa công bố (`is_published = false`).
  - Dịch vụ phát thông báo đẩy Firebase Cloud Messaging (FCM) ở trạng thái sẵn sàng.

- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Dữ liệu thân (Body JSON):**

  ```json
  {
    "class_id": "cls_1a_2026",
    "subject_code": "MATH",
    "score_type": "TEST_15P",
    "semester": 1
  }
  ```

- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của giáo viên vào mục **Headers**.
  2. Chọn phương thức **`POST`**, nhập đường dẫn API: `/api/v1/grades/publish`.
  3. Thêm dữ liệu công bố điểm vào phần **Body** định dạng `raw (application/json)` theo mẫu JSON ở trên.
  4. Bấm nút **Gửi (Send)** để thực thi request.

- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Cờ `is_published` được cập nhật thành `true` và kích hoạt thông báo FCM tới phụ huynh.
  - Dữ liệu trả về đúng định dạng JSON chuẩn như sau:

  ```json
  {
    "success": true,
    "status_code": 200,
    "message": "Đã công bố điểm môn học tới phụ huynh",
    "data": {
      "notified_parents_count": 35,
      "published_at": "2026-09-27T10:00:00.000Z"
    }
  }
  ```

- **TRẠNG THÁI KIỂM THỬ:** 

---

### UT03_Grades_TC04 : TRUY XUẤT BẢNG XẾP HẠNG VINH DANH HỌC SINH CÓ ĐIỂM SỐ CAO NHẤT

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Lớp học `cls_1a_2026` đã có đầy đủ dữ liệu điểm môn `MATH` học kỳ 1 trong bộ sưu tập `/scores`.

- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien>`
  - **Tham số truy vấn (Query Params JSON):**

  ```json
  {
    "classId": "cls_1a_2026",
    "subject_code": "MATH",
    "semester": 1,
    "limit": 5
  }
  ```

- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của giáo viên vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API kèm tham số: `/api/v1/grades/leaderboard/cls_1a_2026?subject_code=MATH&semester=1&limit=5`.
  3. Không cần truyền dữ liệu vào phần Body.
  4. Bấm nút **Gửi (Send)** để thực thi request.

- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống phản hồi mã trạng thái **HTTP 200 (OK - THÀNH CÔNG)**.
  - Danh sách học sinh được sắp xếp giảm dần theo điểm và tự động phân bổ huy hiệu Vàng, Bạc, Đồng.
  - Dữ liệu trả về đúng định dạng JSON chuẩn như sau:

  ```json
  {
    "success": true,
    "status_code": 200,
    "data": {
      "subject_code": "MATH",
      "subject_name": "Toán học",
      "top_students": [
        { "rank": 1, "student_name": "Trần Bảo Nam", "score": 9.8, "badge": "GOLD" },
        { "rank": 2, "student_name": "Lê Ngọc Mai", "score": 9.5, "badge": "SILVER" },
        { "rank": 3, "student_name": "Hoàng Minh Khôi", "score": 9.2, "badge": "BRONZE" }
      ]
    }
  }
  ```

- **TRẠNG THÁI KIỂM THỬ:** 

---

### UT03_Grades_TC05 : CHẶN VÀ TỪ CHỐI GIÁO VIÊN XEM BẢNG ĐIỂM LỚP KHÔNG ĐƯỢC PHÂN CÔNG

- **ĐIỀU KIỆN TIÊN QUYẾT:**
  - Giáo viên mang định danh `usr_teacher_other` đã đăng nhập nhưng **hoàn toàn không được phân công** giảng dạy hoặc làm chủ nhiệm tại lớp `cls_1a_2026`.

- **DỮ LIỆU ĐẦU VÀO:**
  - **Tiêu đề (Headers):** `Authorization: Bearer <token_giao_vien_la>`
  - **Tham số truy vấn (Query Params JSON):**

  ```json
  {
    "classId": "cls_1a_2026",
    "subject_code": "MATH",
    "semester": 1
  }
  ```

- **CÁC BƯỚC THỰC HIỆN:**
  1. Truyền mã xác thực `Authentication Token` của giáo viên không có thẩm quyền vào mục **Headers**.
  2. Chọn phương thức **`GET`**, nhập đường dẫn API: `/api/v1/grades/class/cls_1a_2026?subject_code=MATH&semester=1`.
  3. Bấm nút **Gửi (Send)** để thực thi request.

- **KẾT QUẢ MONG ĐỢI:**
  - Hệ thống ném ra ngoại lệ từ chối quyền truy cập **HTTP 403 (FORBIDDEN - CẤM TRUY CẬP)**.
  - Dữ liệu lỗi trả về đúng định dạng JSON như sau:

  ```json
  {
    "success": false,
    "status_code": 403,
    "error_code": "FORBIDDEN_CLASS_ACCESS",
    "message": "Giáo viên không có quyền truy cập bảng điểm lớp này"
  }
  ```

- **TRẠNG THÁI KIỂM THỬ:** 
