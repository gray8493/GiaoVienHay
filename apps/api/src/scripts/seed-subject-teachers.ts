/**
 * Nạp dữ liệu thật cho phân công Giáo viên Bộ môn (GVBM).
 *
 * - Upsert tài khoản TEACHER_SUBJECT vào bảng users (môn học + lớp đã tham gia lưu trong assigned_info JSON)
 * - Ghi danh sách phân công vào classes.subject_teachers (jsonb) trên Supabase
 *
 * Yêu cầu: cột classes.subject_teachers đã được thêm qua
 *   apps/api/db/migrations/001_classes_subject_teachers.sql
 *
 * Chạy: pnpm --filter @giaovienhay/api seed:subject-teachers
 *       (tùy chọn: SUBJECT_TEACHER_CLASS_ID=cls_1b_02 ...)
 */

import { createClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcryptjs';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vhlcirathqrhmltfkhnd.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  'sb_secret_MM1I8eRoXr0H1cfW2BBgkA_Z1VcIAKr';

const CLASS_ID = process.env.SUBJECT_TEACHER_CLASS_ID || 'cls_1a_01';
const SCHOOL_NAME = 'Trường Tiểu Học Chu Văn An';
const DEFAULT_PASSWORD = 'MatKhau123@';

const SUBJECT_NAMES: Record<string, string> = {
  ENG: 'Tiếng Anh',
  CS: 'Tin học',
  MUSIC: 'Âm nhạc',
  ART: 'Mỹ thuật',
  PE: 'Giáo dục thể chất',
  MATH: 'Toán học',
  LIT: 'Ngữ văn',
  SCIENCE: 'Khoa học tự nhiên',
};

interface SubjectTeacherSeed {
  id: string;
  code: string;
  full_name: string;
  phone: string;
  email: string;
  subject_code: string;
}

const subjectTeachers: SubjectTeacherSeed[] = [
  { id: 'usr_gvbm_eng_01', code: 'GV-2101', full_name: 'Cô Phạm Quỳnh Chi', phone: '0903111222', email: 'chi.pham@chuvanan.edu.vn', subject_code: 'ENG' },
  { id: 'usr_gvbm_cs_01', code: 'GV-2102', full_name: 'Thầy Trần Văn Nam', phone: '0903222333', email: 'nam.tran@chuvanan.edu.vn', subject_code: 'CS' },
  { id: 'usr_gvbm_music_01', code: 'GV-2103', full_name: 'Cô Lê Hồng Mai', phone: '0903333444', email: 'mai.le@chuvanan.edu.vn', subject_code: 'MUSIC' },
  { id: 'usr_gvbm_art_01', code: 'GV-2104', full_name: 'Cô Đỗ Hoàng Yến', phone: '0903444555', email: 'yen.do@chuvanan.edu.vn', subject_code: 'ART' },
  { id: 'usr_gvbm_pe_01', code: 'GV-2105', full_name: 'Thầy Nguyễn Quốc Bảo', phone: '0903555666', email: 'bao.nguyen@chuvanan.edu.vn', subject_code: 'PE' },
];

async function run() {
  console.log('🚀 Nạp dữ liệu thật cho phân công GVBM...');
  console.log(`🔗 Supabase URL: ${SUPABASE_URL}`);
  console.log(`📚 Lớp đích: ${CLASS_ID}`);

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  const now = new Date().toISOString();

  // 1. Tài khoản GVBM
  const userRows = subjectTeachers.map((t) => ({
    id: t.id,
    code: t.code,
    full_name: t.full_name,
    phone: t.phone,
    email: t.email,
    role: 'TEACHER_SUBJECT',
    school_name: SCHOOL_NAME,
    assigned_info: JSON.stringify({
      text: `Giáo viên bộ môn ${SUBJECT_NAMES[t.subject_code] || t.subject_code}`,
      password_hash: passwordHash,
      teaching_subjects: [t.subject_code],
      joined_class_ids: [CLASS_ID],
    }),
    is_active: true,
    is_deleted: false,
    ai_daily_quota: 30,
    ai_used_today: 0,
    ai_model_tier: 'AUTO',
    updated_at: now,
  }));

  const { error: userError } = await supabase.from('users').upsert(userRows);
  if (userError) {
    console.error('❌ Lỗi khi nạp bảng users:', userError.message, userError.code);
    process.exit(1);
  }
  console.log(`✅ Đã nạp/upsert ${userRows.length} tài khoản GVBM (mật khẩu mặc định: ${DEFAULT_PASSWORD}).`);

  // 2. Phân công vào lớp
  const { data: classRow, error: classError } = await supabase
    .from('classes')
    .select('id, name, subject_teachers')
    .eq('id', CLASS_ID)
    .maybeSingle();

  if (classError) {
    if (classError.code === '42703' || /subject_teachers/.test(classError.message || '')) {
      console.error('❌ Cột classes.subject_teachers chưa tồn tại.');
      console.error('   Hãy chạy SQL trong apps/api/db/migrations/001_classes_subject_teachers.sql trước, rồi chạy lại script này.');
    } else {
      console.error('❌ Lỗi khi đọc bảng classes:', classError.message, classError.code);
    }
    process.exit(1);
  }

  if (!classRow) {
    console.error(`❌ Không tìm thấy lớp ${CLASS_ID}.`);
    process.exit(1);
  }

  const existing: any[] = Array.isArray(classRow.subject_teachers) ? classRow.subject_teachers : [];
  const merged = [...existing];
  for (const t of subjectTeachers) {
    const idx = merged.findIndex(
      (e: any) => (e.teacher_id || e.teacherId) === t.id && (e.subject_code || e.subjectCode) === t.subject_code,
    );
    const entry = {
      teacher_id: t.id,
      subject_code: t.subject_code,
      teacher_name: t.full_name,
      assigned_at: idx >= 0 ? merged[idx].assigned_at || now : now,
    };
    if (idx >= 0) merged[idx] = entry;
    else merged.push(entry);
  }

  const { error: updateError } = await supabase
    .from('classes')
    .update({ subject_teachers: merged, updated_at: now })
    .eq('id', CLASS_ID);

  if (updateError) {
    console.error('❌ Lỗi khi ghi phân công GVBM:', updateError.message, updateError.code);
    process.exit(1);
  }

  console.log(`✅ Lớp "${classRow.name}" (${CLASS_ID}) có ${merged.length} phân công GVBM:`);
  for (const m of merged) {
    console.log(`   - ${m.teacher_name} (${m.teacher_id}) phụ trách ${m.subject_code}`);
  }
}

run().catch((err) => {
  console.error('❌ Seed thất bại:', err?.message || err);
  process.exit(1);
});
