/**
 * SCRIPT 03-Lien-ket-phu-huynh-1A:
 * Đảm bảo MỌI học sinh lớp 1A (cls_1a_01) đều có PHỤ HUYNH RIÊNG trong DB thật:
 *  - Tạo tài khoản PARENT còn thiếu (mỗi HS một phụ huynh khác nhau, SĐT không trùng)
 *  - Ghi students.parent_phone = SĐT phụ huynh
 *  - Ghi users.assigned_info.linked_student_ids để app phụ huynh thấy con
 * Idempotent: chạy lại không trùng dữ liệu.
 */
const { createClient } = require('@supabase/supabase-js');

const URL = 'https://vhlcirathqrhmltfkhnd.supabase.co';
const KEY = 'sb_secret_MM1I8eRoXr0H1cfW2BBgkA_Z1VcIAKr';
const CLASS_ID = 'cls_1a_01';
const SCHOOL = 'Trường Tiểu Học Chu Văn An';
const DEFAULT_PASSWORD = 'Parenthk1@2026';

const sb = createClient(URL, KEY, { auth: { persistSession: false } });

(async () => {
  const { data: students, error: sErr } = await sb
    .from('students')
    .select('*')
    .eq('class_id', CLASS_ID)
    .eq('is_deleted', false)
    .order('full_name', { ascending: true });
  if (sErr) { console.error('ERR load students', sErr); process.exit(1); }
  console.log(`Load ${students.length} học sinh lớp 1A`);

  const { data: allUsers } = await sb.from('users').select('*');
  const takenPhones = new Set(
    (allUsers || []).map((u) => String(u.phone || '').replace(/\D/g, ''))
  );

  let created = 0, updatedStudents = 0, alreadyOk = 0;

  for (const st of students) {
    const sid = st.id;
    const name = st.full_name;
    console.log(`\n--- ${name} (${st.student_code}) ---`);

    let phone = String(st.parent_phone || '').replace(/\D/g, '');
    let parentUser = phone
      ? (allUsers || []).find(
          (u) => String(u.phone || '').replace(/\D/g, '') === phone && u.role === 'PARENT' && !u.is_deleted
        )
      : null;

    if (parentUser) {
      // Đã có phụ huynh đúng SĐT (role PARENT): chỉ cần ensure linked_student_ids
      let info = {};
      try { info = JSON.parse(parentUser.assigned_info || '{}'); } catch {
        info = { text: parentUser.assigned_info };
      }
      const linked = Array.isArray(info.linked_student_ids) ? info.linked_student_ids.map(String) : [];
      if (!linked.includes(sid)) {
        info.linked_student_ids = [...linked, sid];
        await sb.from('users').update({ assigned_info: JSON.stringify(info), updated_at: new Date().toISOString() })
          .eq('id', parentUser.id);
        console.log(`  + Đã ghép phụ huynh ${parentUser.id} (${parentUser.phone}) -> linked ${sid}`);
      } else {
        alreadyOk++;
        console.log(`  = Phụ huynh ${parentUser.id} (${parentUser.phone}) đã liên kết sẵn`);
      }
      continue;
    }

    // Tạo phụ huynh mới. Nếu SĐT hiện tại trùng tài khoản KHÔNG phải PARENT (vd giáo viên)
    // hoặc null -> sinh SĐT mới chưa bị chiếm.
    let usedExistingPhone = false;
    if (phone && !takenPhones.has(phone)) {
      usedExistingPhone = true;
    } else {
      phone = null;
      for (let i = 0; i < 50 && !phone; i++) {
        const cand = '0912' + String(Math.floor(100000 + Math.random() * 900000));
        if (!takenPhones.has(cand)) phone = cand;
      }
    }
    takenPhones.add(phone);
    const userId = 'usr_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
    const { data: rnd } = await sb.from('users').select('code').eq('role','PARENT');
    const usedCodes = new Set((rnd || []).map((r) => r.code));
    let code;
    for (let i = 0; i < 50; i++) {
      const c = 'PH-' + String(Math.floor(1000 + Math.random() * 9000));
      if (!usedCodes.has(c)) { code = c; break; }
    }

    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    const userRecord = {
      id: userId,
      code,
      full_name: `Phụ huynh em ${name}`,
      phone,
      email: null,
      role: 'PARENT',
      school_name: SCHOOL,
      assigned_info: JSON.stringify({
        text: `Phụ huynh em ${name} (Lớp 1A)`,
        linked_student_ids: [sid],
        password_hash: hash,
      }),
      is_active: true,
      is_deleted: false,
      ai_daily_quota: 15,
      ai_used_today: 0,
      ai_model_tier: 'FLASH',
    };
    const { error: uErr } = await sb.from('users').upsert(userRecord);
    if (uErr) { console.error('  ! Tạo phụ huynh lỗi:', uErr.message); continue; }
    created++;

    const { error: stErr } = await sb.from('students')
      .update({ parent_phone: phone })
      .eq('id', sid);
    if (stErr) console.error('  ! Update student lỗi:', stErr.message);
    else updatedStudents++;

    console.log(
      `  * Tạo phụ huynh ${userId} (${code}) SĐT ${phone}${usedExistingPhone ? ' (dùng SĐT sẵn của HS)' : ' (SĐT mới)'} -> ${sid}`
    );
  }

  console.log(`\n=== KẾT QUẢ: Tạo ${created} phụ huynh mới | ${updatedStudents} HS cập nhật parent_phone | ${alreadyOk} HS đã sẵn sàng ===`);
  console.log(`Mật khẩu mặc định phụ huynh mới: ${DEFAULT_PASSWORD}`);
})();
