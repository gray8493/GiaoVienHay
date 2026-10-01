/**
 * Danh mục toàn bộ Mã Lỗi Nghiệp Vụ của hệ thống GiaoVienHay
 * Áp dụng thống nhất cho Backend NestJS, Next.js Admin và React Native App
 */
export enum ErrorCode {
  // 01. AUTH MODULE
  AUTH_INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
  AUTH_TOKEN_EXPIRED = 'AUTH_TOKEN_EXPIRED',
  AUTH_TOKEN_INVALID = 'AUTH_TOKEN_INVALID',
  AUTH_UNAUTHORIZED = 'AUTH_UNAUTHORIZED',
  AUTH_ROLE_FORBIDDEN = 'AUTH_ROLE_FORBIDDEN',
  AUTH_ACCOUNT_LOCKED = 'AUTH_ACCOUNT_LOCKED',
  AUTH_REFRESH_TOKEN_INVALID = 'AUTH_REFRESH_TOKEN_INVALID',
  AUTH_FIREBASE_UID_EXISTS = 'AUTH_FIREBASE_UID_EXISTS',

  // 02. USERS MODULE
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_EMAIL_EXISTS = 'USER_EMAIL_EXISTS',
  USER_PHONE_EXISTS = 'USER_PHONE_EXISTS',
  USER_INACTIVE = 'USER_INACTIVE',
  USER_PROFILE_INCOMPLETE = 'USER_PROFILE_INCOMPLETE',
  USER_FCM_TOKEN_INVALID = 'USER_FCM_TOKEN_INVALID',

  // 03. CLASSES MODULE
  CLASS_NOT_FOUND = 'CLASS_NOT_FOUND',
  CLASS_INVITE_CODE_INVALID = 'CLASS_INVITE_CODE_INVALID',
  CLASS_NOT_HOMEROOM_TEACHER = 'CLASS_NOT_HOMEROOM_TEACHER',
  CLASS_STUDENT_CODE_EXISTS = 'CLASS_STUDENT_CODE_EXISTS',
  CLASS_MAX_STUDENTS_EXCEEDED = 'CLASS_MAX_STUDENTS_EXCEEDED',
  CLASS_HOMEROOM_CONFLICT = 'CLASS_HOMEROOM_CONFLICT',
  CLASS_GRADE_LEVEL_INVALID = 'CLASS_GRADE_LEVEL_INVALID',

  // 04. STUDENTS MODULE
  STUDENT_NOT_FOUND = 'STUDENT_NOT_FOUND',
  PARENT_STUDENT_LINK_NOT_FOUND = 'PARENT_STUDENT_LINK_NOT_FOUND',
  STUDENT_ALREADY_LINKED = 'STUDENT_ALREADY_LINKED',
  STUDENT_DOB_INVALID = 'STUDENT_DOB_INVALID',
  STUDENT_NOT_IN_CLASS = 'STUDENT_NOT_IN_CLASS',

  // 05. ATTENDANCE MODULE
  ATTEND_RECORD_NOT_FOUND = 'ATTEND_RECORD_NOT_FOUND',
  ATTEND_ALREADY_EXISTS = 'ATTEND_ALREADY_EXISTS',
  ATTEND_DATE_IN_FUTURE = 'ATTEND_DATE_IN_FUTURE',
  ATTEND_DATE_INVALID = 'ATTEND_DATE_INVALID',
  ATTEND_STATUS_INVALID = 'ATTEND_STATUS_INVALID',

  // 06. GRADES MODULE
  ACAD_NOT_ASSIGNED_TEACHER = 'ACAD_NOT_ASSIGNED_TEACHER',
  ACAD_SCORE_OUT_OF_RANGE = 'ACAD_SCORE_OUT_OF_RANGE',
  ACAD_SEMESTER_LOCKED = 'ACAD_SEMESTER_LOCKED',
  GRADE_RECORD_NOT_FOUND = 'GRADE_RECORD_NOT_FOUND',
  GRADE_NOT_PUBLISHED = 'GRADE_NOT_PUBLISHED',
  GRADE_TYPE_INVALID = 'GRADE_TYPE_INVALID',

  // 07. QUIZZES & GAME MODULE
  QUIZ_NOT_FOUND = 'QUIZ_NOT_FOUND',
  QUIZ_FILE_TOO_LARGE = 'QUIZ_FILE_TOO_LARGE',
  QUIZ_FILE_UNSUPPORTED = 'QUIZ_FILE_UNSUPPORTED',
  QUIZ_AI_GENERATION_FAILED = 'QUIZ_AI_GENERATION_FAILED',
  QUIZ_DAILY_QUOTA_EXCEEDED = 'QUIZ_DAILY_QUOTA_EXCEEDED',
  QUIZ_INVALID_MODE = 'QUIZ_INVALID_MODE',
  GAME_SESSION_NOT_FOUND = 'GAME_SESSION_NOT_FOUND',

  // 08. REMARKS MODULE
  REMARK_NOT_FOUND = 'REMARK_NOT_FOUND',
  REMARK_CONTENT_EMPTY = 'REMARK_CONTENT_EMPTY',
  REMARK_CONTENT_TOO_LONG = 'REMARK_CONTENT_TOO_LONG',
  REMARK_ALREADY_ACKNOWLEDGED = 'REMARK_ALREADY_ACKNOWLEDGED',

  // 09. EXAM REMINDERS MODULE
  EXAM_REMINDER_NOT_FOUND = 'EXAM_REMINDER_NOT_FOUND',
  EXAM_DATE_INVALID = 'EXAM_DATE_INVALID',
  EXAM_TYPE_INVALID = 'EXAM_TYPE_INVALID',
  EXAM_MESSAGE_TOO_SHORT = 'EXAM_MESSAGE_TOO_SHORT',

  // 10. FEES & INSURANCE MODULE
  FEE_RECORD_NOT_FOUND = 'FEE_RECORD_NOT_FOUND',
  FEE_TERM_LOCKED = 'FEE_TERM_LOCKED',
  FEE_INVALID_FLAG = 'FEE_INVALID_FLAG',
  FEE_PAID_DATE_INVALID = 'FEE_PAID_DATE_INVALID',

  // 11. NOTIFICATIONS MODULE
  NOTI_NOT_FOUND = 'NOTI_NOT_FOUND',
  NOTI_DEVICE_TOKEN_INVALID = 'NOTI_DEVICE_TOKEN_INVALID',
  NOTI_DISPATCH_FAILED = 'NOTI_DISPATCH_FAILED',
  NOTI_FORBIDDEN = 'NOTI_FORBIDDEN',

  // 12. ADMIN MODULE
  ADM_ACCOUNT_ALREADY_BANNED = 'ADM_ACCOUNT_ALREADY_BANNED',
  ADM_ACCOUNT_ALREADY_ACTIVE = 'ADM_ACCOUNT_ALREADY_ACTIVE',
  ADM_CANNOT_BAN_ADMIN = 'ADM_CANNOT_BAN_ADMIN',
  ADM_CANNOT_DEACTIVATE_SELF = 'ADM_CANNOT_DEACTIVATE_SELF',
  ADM_INVALID_LIMITS = 'ADM_INVALID_LIMITS',

  // COMMON & SYSTEM ERRORS
  COMMON_VALIDATION_ERROR = 'COMMON_VALIDATION_ERROR',
  REQ_VALIDATION_ERROR = 'REQ_VALIDATION_ERROR',
  SYS_RATE_LIMIT_EXCEEDED = 'SYS_RATE_LIMIT_EXCEEDED',
  SYS_ROUTE_NOT_FOUND = 'SYS_ROUTE_NOT_FOUND',
  SYS_SERVICE_UNAVAILABLE = 'SYS_SERVICE_UNAVAILABLE',
  SYS_INTERNAL_ERROR = 'SYS_INTERNAL_ERROR',
}

/**
 * Bản đồ ánh xạ thông điệp tiếng Việt thân thiện mặc định theo Mã Lỗi
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  // 01. AUTH
  [ErrorCode.AUTH_INVALID_CREDENTIALS]: 'Email hoặc mật khẩu không chính xác.',
  [ErrorCode.AUTH_TOKEN_EXPIRED]: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  [ErrorCode.AUTH_TOKEN_INVALID]: 'Token xác thực không hợp lệ hoặc đã bị thu hồi.',
  [ErrorCode.AUTH_UNAUTHORIZED]: 'Yêu cầu truy cập chưa được xác thực danh tính.',
  [ErrorCode.AUTH_ROLE_FORBIDDEN]: 'Bạn không có quyền truy cập vào chức năng này.',
  [ErrorCode.AUTH_ACCOUNT_LOCKED]: 'Tài khoản của bạn đã bị khóa bởi Quản trị viên.',
  [ErrorCode.AUTH_REFRESH_TOKEN_INVALID]: 'Phiên làm mới không hợp lệ hoặc đã hết hạn.',
  [ErrorCode.AUTH_FIREBASE_UID_EXISTS]: 'Định danh Firebase UID này đã tồn tại.',

  // 02. USERS
  [ErrorCode.USER_NOT_FOUND]: 'Không tìm thấy người dùng trong hệ thống.',
  [ErrorCode.USER_EMAIL_EXISTS]: 'Địa chỉ email này đã được sử dụng cho một tài khoản khác.',
  [ErrorCode.USER_PHONE_EXISTS]: 'Số điện thoại này đã được đăng ký cho tài khoản khác.',
  [ErrorCode.USER_INACTIVE]: 'Tài khoản người dùng đang tạm ngưng hoạt động.',
  [ErrorCode.USER_PROFILE_INCOMPLETE]: 'Thông tin hồ sơ chưa đầy đủ thông tin bắt buộc.',
  [ErrorCode.USER_FCM_TOKEN_INVALID]: 'Mã thiết bị nhận thông báo FCM không hợp lệ.',

  // 03. CLASSES
  [ErrorCode.CLASS_NOT_FOUND]: 'Không tìm thấy lớp học trên hệ thống.',
  [ErrorCode.CLASS_INVITE_CODE_INVALID]: 'Mã mời tham gia lớp học không hợp lệ hoặc đã hết hạn.',
  [ErrorCode.CLASS_NOT_HOMEROOM_TEACHER]: 'Chỉ Giáo viên chủ nhiệm mới có quyền thực hiện thao tác này.',
  [ErrorCode.CLASS_STUDENT_CODE_EXISTS]: 'Mã học sinh đã tồn tại trong danh sách của lớp học này.',
  [ErrorCode.CLASS_MAX_STUDENTS_EXCEEDED]: 'Lớp học đã đạt sĩ số tối đa theo quy định hạn mức hệ thống.',
  [ErrorCode.CLASS_HOMEROOM_CONFLICT]: 'Giáo viên này đã được phân công làm chủ nhiệm cho một lớp học khác.',
  [ErrorCode.CLASS_GRADE_LEVEL_INVALID]: 'Khối lớp không hợp lệ, hệ thống chỉ hỗ trợ từ Khối 1 đến Khối 9.',

  // 04. STUDENTS
  [ErrorCode.STUDENT_NOT_FOUND]: 'Không tìm thấy hồ sơ học sinh trên hệ thống.',
  [ErrorCode.PARENT_STUDENT_LINK_NOT_FOUND]: 'Bạn không có quyền truy cập hồ sơ của học sinh này.',
  [ErrorCode.STUDENT_ALREADY_LINKED]: 'Học sinh này đã được liên kết với tài khoản phụ huynh này.',
  [ErrorCode.STUDENT_DOB_INVALID]: 'Ngày sinh học sinh không hợp lệ hoặc không tồn tại trong lịch thực tế.',
  [ErrorCode.STUDENT_NOT_IN_CLASS]: 'Học sinh không thuộc danh sách biên chế của lớp học này.',

  // 05. ATTENDANCE
  [ErrorCode.ATTEND_RECORD_NOT_FOUND]: 'Không tìm thấy bản ghi điểm danh yêu cầu.',
  [ErrorCode.ATTEND_ALREADY_EXISTS]: 'Tiết học hoặc buổi học này đã được điểm danh trước đó.',
  [ErrorCode.ATTEND_DATE_IN_FUTURE]: 'Không thể thực hiện điểm danh cho ngày trong tương lai.',
  [ErrorCode.ATTEND_DATE_INVALID]: 'Ngày điểm danh không tồn tại trong lịch thực tế.',
  [ErrorCode.ATTEND_STATUS_INVALID]: 'Trạng thái điểm danh không hợp lệ.',

  // 06. GRADES
  [ErrorCode.ACAD_NOT_ASSIGNED_TEACHER]: 'Giáo viên chưa được phân công giảng dạy môn học này tại lớp đã chọn.',
  [ErrorCode.ACAD_SCORE_OUT_OF_RANGE]: 'Điểm số phải nằm trong khoảng từ 0.0 đến 10.0 với tối đa 1 chữ số thập phân.',
  [ErrorCode.ACAD_SEMESTER_LOCKED]: 'Học kỳ này đã được khóa sổ, không thể điều chỉnh điểm số.',
  [ErrorCode.GRADE_RECORD_NOT_FOUND]: 'Không tìm thấy bản ghi điểm số của học sinh.',
  [ErrorCode.GRADE_NOT_PUBLISHED]: 'Bảng điểm môn học chưa được giáo viên công bố tới phụ huynh.',
  [ErrorCode.GRADE_TYPE_INVALID]: 'Cột điểm thành phần không hợp lệ.',

  // 07. QUIZZES
  [ErrorCode.QUIZ_NOT_FOUND]: 'Không tìm thấy bộ câu hỏi kiểm tra bài cũ.',
  [ErrorCode.QUIZ_FILE_TOO_LARGE]: 'Tệp giáo án tải lên vượt quá dung lượng cho phép (tối đa 15MB).',
  [ErrorCode.QUIZ_FILE_UNSUPPORTED]: 'Định dạng tệp không được hỗ trợ (chỉ chấp nhận .pdf và .docx).',
  [ErrorCode.QUIZ_AI_GENERATION_FAILED]: 'Google Gemini AI không thể trích xuất câu hỏi từ tệp giáo án này.',
  [ErrorCode.QUIZ_DAILY_QUOTA_EXCEEDED]: 'Bạn đã sử dụng hết hạn ngạch gọi AI Gemini miễn phí trong ngày.',
  [ErrorCode.QUIZ_INVALID_MODE]: 'Chế độ trình chiếu hoặc loại trò chơi không hợp lệ.',
  [ErrorCode.GAME_SESSION_NOT_FOUND]: 'Phiên trò chơi mini-game không tồn tại hoặc đã kết thúc.',

  // 08. REMARKS
  [ErrorCode.REMARK_NOT_FOUND]: 'Không tìm thấy bản ghi nhận xét của học sinh.',
  [ErrorCode.REMARK_CONTENT_EMPTY]: 'Nội dung nhận xét không được để trống hoặc chỉ có khoảng trắng.',
  [ErrorCode.REMARK_CONTENT_TOO_LONG]: 'Nội dung nhận xét không được vượt quá 1000 ký tự.',
  [ErrorCode.REMARK_ALREADY_ACKNOWLEDGED]: 'Nhận xét này đã được phụ huynh đọc và xác nhận trước đó.',

  // 09. EXAM REMINDERS
  [ErrorCode.EXAM_REMINDER_NOT_FOUND]: 'Không tìm thấy lời nhắc lịch kiểm tra.',
  [ErrorCode.EXAM_DATE_INVALID]: 'Ngày kiểm tra không hợp lệ hoặc đã trôi qua trong quá khứ.',
  [ErrorCode.EXAM_TYPE_INVALID]: 'Loại hình bài kiểm tra không nằm trong danh mục chuẩn.',
  [ErrorCode.EXAM_MESSAGE_TOO_SHORT]: 'Lời dặn dò ôn thi phải có tối thiểu 10 ký tự.',

  // 10. FEES & INSURANCE
  [ErrorCode.FEE_RECORD_NOT_FOUND]: 'Không tìm thấy bản ghi theo dõi học phí hoặc BHYT của học sinh.',
  [ErrorCode.FEE_TERM_LOCKED]: 'Đợt thu nộp này đã được kế toán trường khóa sổ, không thể chỉnh sửa.',
  [ErrorCode.FEE_INVALID_FLAG]: 'Trạng thái cờ nộp phí không hợp lệ.',
  [ErrorCode.FEE_PAID_DATE_INVALID]: 'Ngày nộp tiền không hợp lệ hoặc rơi vào tương lai.',

  // 11. NOTIFICATIONS
  [ErrorCode.NOTI_NOT_FOUND]: 'Không tìm thấy thông báo này trên hệ thống.',
  [ErrorCode.NOTI_DEVICE_TOKEN_INVALID]: 'Thiết bị không hợp lệ để nhận thông báo đẩy FCM.',
  [ErrorCode.NOTI_DISPATCH_FAILED]: 'Lỗi dịch vụ Google Firebase FCM khi gửi thông báo đẩy.',
  [ErrorCode.NOTI_FORBIDDEN]: 'Bạn không có quyền thao tác trên thông báo của tài khoản khác.',

  // 12. ADMIN
  [ErrorCode.ADM_ACCOUNT_ALREADY_BANNED]: 'Tài khoản người dùng này đã ở trạng thái bị khóa từ trước.',
  [ErrorCode.ADM_ACCOUNT_ALREADY_ACTIVE]: 'Tài khoản người dùng đang hoạt động bình thường, không thể mở khóa lại.',
  [ErrorCode.ADM_CANNOT_BAN_ADMIN]: 'Không thể khóa tài khoản có vai trò Quản trị viên cấp cao (ADMIN).',
  [ErrorCode.ADM_CANNOT_DEACTIVATE_SELF]: 'Quản trị viên không thể tự vô hiệu hóa tài khoản của chính mình.',
  [ErrorCode.ADM_INVALID_LIMITS]: 'Thông số cấu hình hạn mức tài nguyên không hợp lệ (phải là số nguyên dương).',

  // COMMON & SYSTEM
  [ErrorCode.COMMON_VALIDATION_ERROR]: 'Dữ liệu gửi lên vi phạm quy tắc ràng buộc hoặc sai định dạng.',
  [ErrorCode.REQ_VALIDATION_ERROR]: 'Dữ liệu đầu vào sai quy cách định dạng DTO Validation.',
  [ErrorCode.SYS_RATE_LIMIT_EXCEEDED]: 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng chờ 1 phút trước khi thử lại.',
  [ErrorCode.SYS_ROUTE_NOT_FOUND]: 'Đường dẫn API yêu cầu không tồn tại trên hệ thống.',
  [ErrorCode.SYS_SERVICE_UNAVAILABLE]: 'Dịch vụ tạm thời không khả dụng do máy chủ đang bảo trì hoặc quá tải.',
  [ErrorCode.SYS_INTERNAL_ERROR]: 'Lỗi máy chủ nội bộ. Vui lòng liên hệ đội ngũ kỹ thuật.',
};
