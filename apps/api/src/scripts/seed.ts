/**
 * Kịch bản Nạp Dữ Liệu Mẫu (Seed Data) cho Hệ Thống GiaoVienHay trên Supabase PostgreSQL
 * Thực thi trực tiếp qua @supabase/supabase-js
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vhlcirathqrhmltfkhnd.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  'sb_secret_MM1I8eRoXr0H1cfW2BBgkA_Z1VcIAKr';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
  global: {
    headers: {
      'User-Agent': 'GiaoVienHay-Seed-Script/1.0',
    },
  },
});

async function runSeed() {
  console.log('🚀 Bắt đầu quá trình nạp Dữ liệu Mẫu (Seed Data) lên Supabase...');
  console.log(`🔗 Supabase URL: ${SUPABASE_URL}`);

  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toISOString();

  try {
    // 1. Trường học (Schools)
    console.log('🏫 1. Đang nạp danh sách Trường học (Schools)...');
    const schools = [
      {
        id: 'sch_cva_01',
        code: 'SCH-101',
        name: 'Trường Tiểu Học Chu Văn An',
        academic_year: '2024-2025',
        address: '115 Thụy Khuê, Tây Hồ, Hà Nội',
        phone: '02438452331',
        email: 'c1chuvanan@hanoiedu.vn',
        is_deleted: false,
      },
      {
        id: 'sch_lqd_02',
        code: 'SCH-102',
        name: 'Trường THCS Lê Quý Đôn',
        academic_year: '2024-2025',
        address: 'Số 9 Võ Văn Tần, Quận 3, TP. Hồ Chí Minh',
        phone: '02839304445',
        email: 'thcslequydon@tphcm.edu.vn',
        is_deleted: false,
      },
    ];
    const { error: errSchool } = await supabase.from('schools').upsert(schools);
    if (errSchool) console.warn('   ⚠️ Ghi chú bảng schools:', errSchool.message);
    else console.log('   ✅ Đã nạp thành công 2 trường học.');

    // 2. Tài khoản Người dùng (Users)
    console.log('👤 2. Đang nạp danh sách Tài khoản Người dùng (Users)...');
    const users = [
      {
        id: 'usr_admin_01',
        code: 'ADM-1001',
        full_name: 'Thầy Trần Văn Bình',
        phone: '0988001122',
        email: 'hieutruong.binh@school.edu.vn',
        role: 'ADMIN',
        school_name: 'Trường Tiểu Học Chu Văn An',
        assigned_info: 'Ban Giám Hiệu - Quản trị viên cấp cao',
        is_active: true,
        is_deleted: false,
        ai_daily_quota: 100,
        ai_used_today: 0,
        ai_model_tier: 'PRO',
      },
      {
        id: 'usr_gv_01',
        code: 'GV-1001',
        full_name: 'Cô Nguyễn Thị Lan',
        phone: '0912345678',
        email: 'lan.nguyen@school.edu.vn',
        role: 'TEACHER_HOMEROOM',
        school_name: 'Trường Tiểu Học Chu Văn An',
        assigned_info: 'Chủ nhiệm Lớp 1A',
        is_active: true,
        is_deleted: false,
        ai_daily_quota: 40,
        ai_used_today: 0,
        ai_model_tier: 'AUTO',
      },
      {
        id: 'usr_gv_02',
        code: 'GV-1002',
        full_name: 'Thầy Lê Hoàng Nam',
        phone: '0912345679',
        email: 'nam.le@school.edu.vn',
        role: 'TEACHER_SUBJECT',
        school_name: 'Trường Tiểu Học Chu Văn An',
        assigned_info: 'Giáo viên bộ môn Tin học & Tiếng Anh',
        is_active: true,
        is_deleted: false,
        ai_daily_quota: 30,
        ai_used_today: 0,
        ai_model_tier: 'AUTO',
      },
      {
        id: 'usr_ph_01',
        code: 'PH-1001',
        full_name: 'Trần Văn Hùng',
        phone: '0977112233',
        email: 'hung.tran@gmail.com',
        role: 'PARENT',
        school_name: 'Trường Tiểu Học Chu Văn An',
        assigned_info: 'Phụ huynh em Trần Bảo Nam (Lớp 1A)',
        is_active: true,
        is_deleted: false,
        ai_daily_quota: 15,
        ai_used_today: 0,
        ai_model_tier: 'FLASH',
      },
    ];
    const { error: errUser } = await supabase.from('users').upsert(users);
    if (errUser) console.warn('   ⚠️ Ghi chú bảng users:', errUser.message);
    else console.log('   ✅ Đã nạp thành công 4 tài khoản người dùng.');

    // 3. Lớp học (Classes)
    console.log('📚 3. Đang nạp danh sách Lớp học (Classes)...');
    const classes = [
      {
        id: 'cls_1a_01',
        name: 'Lớp 1A',
        grade_level: 1,
        academic_year: '2024-2025',
        school_name: 'Trường Tiểu Học Chu Văn An',
        homeroom_teacher_id: 'usr_gv_01',
        invite_code: 'GVH-1A-2024',
        student_count: 5,
        is_deleted: false,
      },
      {
        id: 'cls_1b_02',
        name: 'Lớp 1B',
        grade_level: 1,
        academic_year: '2024-2025',
        school_name: 'Trường Tiểu Học Chu Văn An',
        homeroom_teacher_id: 'usr_gv_02',
        invite_code: 'GVH-1B-2024',
        student_count: 3,
        is_deleted: false,
      },
    ];
    const { error: errClass } = await supabase.from('classes').upsert(classes);
    if (errClass) console.warn('   ⚠️ Ghi chú bảng classes:', errClass.message);
    else console.log('   ✅ Đã nạp thành công 2 lớp học.');

    // 4. Học sinh (Students)
    console.log('👦 4. Đang nạp danh sách Học sinh (Students)...');
    const students = [
      {
        id: 'std_01',
        class_id: 'cls_1a_01',
        student_code: 'HS-1A-01',
        full_name: 'Trần Bảo Nam',
        dob: '2018-05-15',
        gender: 'MALE',
        parent_phone: '0977112233',
        is_deleted: false,
      },
      {
        id: 'std_02',
        class_id: 'cls_1a_01',
        student_code: 'HS-1A-02',
        full_name: 'Nguyễn Hoàng My',
        dob: '2018-08-20',
        gender: 'FEMALE',
        parent_phone: '0911223344',
        is_deleted: false,
      },
      {
        id: 'std_03',
        class_id: 'cls_1a_01',
        student_code: 'HS-1A-03',
        full_name: 'Lê Minh Khôi',
        dob: '2018-02-10',
        gender: 'MALE',
        parent_phone: '0933445566',
        is_deleted: false,
      },
      {
        id: 'std_04',
        class_id: 'cls_1a_01',
        student_code: 'HS-1A-04',
        full_name: 'Phạm Quỳnh Anh',
        dob: '2018-11-04',
        gender: 'FEMALE',
        parent_phone: '0944556677',
        is_deleted: false,
      },
      {
        id: 'std_05',
        class_id: 'cls_1a_01',
        student_code: 'HS-1A-05',
        full_name: 'Vũ Đức Trọng',
        dob: '2018-09-12',
        gender: 'MALE',
        parent_phone: '0955667788',
        is_deleted: false,
      },
    ];
    const { error: errStudent } = await supabase.from('students').upsert(students);
    if (errStudent) console.warn('   ⚠️ Ghi chú bảng students:', errStudent.message);
    else console.log('   ✅ Đã nạp thành công 5 học sinh lớp 1A.');

    // 5. Điểm danh (Attendances)
    console.log('📅 5. Đang nạp dữ liệu Điểm danh (Attendances)...');
    const attendances = [
      {
        id: 'att_01',
        class_id: 'cls_1a_01',
        student_id: 'std_01',
        date: today,
        status: 'PRESENT',
        note: 'Đúng giờ, trang phục chỉnh tề',
        is_deleted: false,
      },
      {
        id: 'att_02',
        class_id: 'cls_1a_01',
        student_id: 'std_02',
        date: today,
        status: 'PRESENT',
        note: 'Đúng giờ',
        is_deleted: false,
      },
      {
        id: 'att_03',
        class_id: 'cls_1a_01',
        student_id: 'std_03',
        date: today,
        status: 'LATE',
        note: 'Đến muộn 15 phút do kẹt xe',
        is_deleted: false,
      },
      {
        id: 'att_04',
        class_id: 'cls_1a_01',
        student_id: 'std_04',
        date: today,
        status: 'ABSENT_EXCUSED',
        note: 'Nghỉ ốm có phép của phụ huynh',
        is_deleted: false,
      },
      {
        id: 'att_05',
        class_id: 'cls_1a_01',
        student_id: 'std_05',
        date: today,
        status: 'PRESENT',
        note: 'Đúng giờ',
        is_deleted: false,
      },
    ];
    const { error: errAtt } = await supabase.from('attendances').upsert(attendances);
    if (errAtt) console.warn('   ⚠️ Ghi chú bảng attendances:', errAtt.message);
    else console.log('   ✅ Đã nạp thành công điểm danh ngày hôm nay.');

    // 6. Bảng điểm (Scores)
    console.log('📊 6. Đang nạp dữ liệu Bảng điểm (Scores)...');
    const scores = [
      {
        id: 'scr_01',
        student_id: 'std_01',
        class_id: 'cls_1a_01',
        subject: 'Toán học',
        score_type: '15MIN',
        score_value: 9.5,
        term: 1,
        academic_year: '2024-2025',
        is_deleted: false,
      },
      {
        id: 'scr_02',
        student_id: 'std_01',
        class_id: 'cls_1a_01',
        subject: 'Tiếng Việt',
        score_type: '15MIN',
        score_value: 9.0,
        term: 1,
        academic_year: '2024-2025',
        is_deleted: false,
      },
      {
        id: 'scr_03',
        student_id: 'std_02',
        class_id: 'cls_1a_01',
        subject: 'Toán học',
        score_type: '15MIN',
        score_value: 10.0,
        term: 1,
        academic_year: '2024-2025',
        is_deleted: false,
      },
      {
        id: 'scr_04',
        student_id: 'std_03',
        class_id: 'cls_1a_01',
        subject: 'Toán học',
        score_type: '15MIN',
        score_value: 8.0,
        term: 1,
        academic_year: '2024-2025',
        is_deleted: false,
      },
    ];
    const { error: errScore } = await supabase.from('scores').upsert(scores);
    if (errScore) console.warn('   ⚠️ Ghi chú bảng scores:', errScore.message);
    else console.log('   ✅ Đã nạp thành công 4 bản ghi điểm.');

    // 7. Bài tập trắc nghiệm (Quizzes)
    console.log('📝 7. Đang nạp dữ liệu Bài tập Trắc nghiệm (Quizzes)...');
    const quizzes = [
      {
        id: 'qz_math_01',
        teacher_id: 'usr_gv_01',
        class_id: 'cls_1a_01',
        subject: 'Toán học',
        title: 'Ôn tập Phép cộng trong phạm vi 10',
        questions_json: JSON.stringify([
          {
            id: 'q1',
            question: '3 + 4 bằng bao nhiêu?',
            options: ['6', '7', '8', '9'],
            correctAnswer: '7',
            explanation: '3 cộng 4 bằng 7.',
          },
          {
            id: 'q2',
            question: 'Số nào lớn nhất trong các số: 5, 8, 2, 9?',
            options: ['5', '8', '2', '9'],
            correctAnswer: '9',
            explanation: 'Số 9 là số lớn nhất.',
          },
        ]),
        is_deleted: false,
      },
    ];
    const { error: errQuiz } = await supabase.from('quizzes').upsert(quizzes);
    if (errQuiz) console.warn('   ⚠️ Ghi chú bảng quizzes:', errQuiz.message);
    else console.log('   ✅ Đã nạp thành công bài quiz Toán lớp 1.');

    // 8. Sổ liên lạc / Nhận xét (Remarks)
    console.log('💬 8. Đang nạp dữ liệu Nhận xét (Remarks)...');
    const remarks = [
      {
        id: 'rmk_01',
        student_id: 'std_01',
        teacher_id: 'usr_gv_01',
        date: today,
        content: 'Em Bảo Nam hôm nay hăng hái phát biểu xây dựng bài, làm toán rất nhanh và chính xác.',
        category: 'ACADEMIC',
        is_deleted: false,
      },
      {
        id: 'rmk_02',
        student_id: 'std_02',
        teacher_id: 'usr_gv_01',
        date: today,
        content: 'Em Hoàng My viết chữ sạch đẹp, có ý thức giúp đỡ bạn bè trong giờ ra chơi.',
        category: 'BEHAVIOR',
        is_deleted: false,
      },
    ];
    const { error: errRemark } = await supabase.from('remarks').upsert(remarks);
    if (errRemark) console.warn('   ⚠️ Ghi chú bảng remarks:', errRemark.message);
    else console.log('   ✅ Đã nạp thành công nhận xét học sinh.');

    // 9. Lịch thi / Nhắc hẹn (Exam Reminders)
    console.log('⏰ 9. Đang nạp dữ liệu Lịch kiểm tra (Exam Reminders)...');
    const examReminders = [
      {
        id: 'exm_01',
        class_id: 'cls_1a_01',
        subject: 'Toán học',
        exam_date: '2024-11-20',
        title: 'Kiểm tra Giữa Học Kỳ 1 - Môn Toán',
        note: 'Các em chuẩn bị bút chì, thước kẻ và ôn tập kỹ phép cộng trừ dưới 10.',
        is_deleted: false,
      },
    ];
    const { error: errExam } = await supabase.from('exam_reminders').upsert(examReminders);
    if (errExam) console.warn('   ⚠️ Ghi chú bảng exam_reminders:', errExam.message);
    else console.log('   ✅ Đã nạp thành công lịch kiểm tra.');

    // 10. Khoản thu / Học phí (Fees)
    console.log('💳 10. Đang nạp dữ liệu Học phí & Bảo hiểm (Fees)...');
    const fees = [
      {
        id: 'fee_01',
        student_id: 'std_01',
        title: 'Tiền ăn bán trú Tháng 10/2024',
        amount: 850000,
        status: 'PAID',
        due_date: '2024-10-15',
        paid_at: now,
        is_deleted: false,
      },
      {
        id: 'fee_02',
        student_id: 'std_02',
        title: 'Bảo hiểm Y tế Học sinh 2024-2025',
        amount: 680400,
        status: 'PENDING',
        due_date: '2024-10-30',
        is_deleted: false,
      },
    ];
    const { error: errFee } = await supabase.from('fees').upsert(fees);
    if (errFee) console.warn('   ⚠️ Ghi chú bảng fees:', errFee.message);
    else console.log('   ✅ Đã nạp thành công dữ liệu học phí.');

    // 11. Thông báo (Notifications)
    console.log('🔔 11. Đang nạp dữ liệu Thông báo Hệ thống (Notifications)...');
    const notifications = [
      {
        id: 'notif_01',
        recipient_id: 'usr_ph_01',
        title: 'Thông báo Điểm danh ngày ' + today,
        body: 'Em Trần Bảo Nam đã có mặt tại lớp lúc 07:45 đúng giờ.',
        type: 'ATTENDANCE',
        is_read: false,
        is_deleted: false,
      },
      {
        id: 'notif_02',
        recipient_id: 'usr_ph_01',
        title: 'Đã nhận điểm kiểm tra môn Toán',
        body: 'Em Bảo Nam đạt điểm 9.5 bài kiểm tra 15 phút môn Toán.',
        type: 'SCORE',
        is_read: false,
        is_deleted: false,
      },
    ];
    const { error: errNotif } = await supabase.from('notifications').upsert(notifications);
    if (errNotif) console.warn('   ⚠️ Ghi chú bảng notifications:', errNotif.message);
    else console.log('   ✅ Đã nạp thành công 2 thông báo.');

    // 12. Hạn mức & Cấu hình AI Hệ thống (System Limits)
    console.log('⚙️ 12. Đang nạp Cấu hình Hạn mức Hệ thống (System Limits)...');
    const systemLimits = {
      id: 'sys_limits_default',
      gemini_quota_per_teacher: 35,
      max_quiz_questions: 25,
      max_upload_size_mb: 20,
      max_students_per_class: 55,
      max_classes_per_teacher: 5,
      ai_model: 'openai/gpt-oss-20b',
      allow_subject_teacher_create_class: true,
      enable_fallback_cache: true,
      updated_at: now,
    };
    const { error: errLimit } = await supabase.from('system_limits').upsert(systemLimits);
    if (errLimit) console.warn('   ⚠️ Ghi chú bảng system_limits:', errLimit.message);
    else console.log('   ✅ Đã nạp cấu hình System Limits chuẩn xác.');

    console.log('\n🎉 HOÀN THÀNH TOÀN BỘ QUÁ TRÌNH SEED DỮ LIỆU LÊN SUPABASE!');
  } catch (error: any) {
    console.error('❌ Lỗi ngoại lệ trong quá trình nạp dữ liệu mẫu:', error?.message || error);
  }
}

runSeed();
