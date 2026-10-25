const SUPABASE_URL = 'https://vhlcirathqrhmltfkhnd.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'sb_secret_MM1I8eRoXr0H1cfW2BBgkA_Z1VcIAKr';

const headers = {
  apikey: SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
};

async function main() {
  // Bcrypt hash của 'MatKhau123@' (cost=10)
  const hash = '$2b$10$Z2jWBxHEIGdQRsneYjB2huf5mpbsUGGrj0JYlD3a7RJSW1XfjFb3K';

  // 1. Cập nhật Giáo viên: Cô Nguyễn Thị Lan (0912345678)
  const gvInfo = JSON.stringify({
    text: 'Chủ nhiệm Lớp 1A',
    password_hash: hash,
    teaching_subjects: ['MATH', 'LIT'],
    joined_class_ids: ['cls_1a_01'],
  });
  let r1 = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.usr_gv_01`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ assigned_info: gvInfo, updated_at: new Date().toISOString() }),
  });
  console.log('GV update status:', r1.status);

  // 2. Cập nhật Phụ huynh: Bác Trần Văn Hùng (0977112233)
  const phInfo = JSON.stringify({
    text: 'Phụ huynh em Trần Bảo Nam (Lớp 1A)',
    password_hash: hash,
    linked_student_ids: ['std_01'],
  });
  let r2 = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.usr_ph_01`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ assigned_info: phInfo, updated_at: new Date().toISOString() }),
  });
  console.log('PH update status:', r2.status);

  console.log('✅ Đã cập nhật xong mật khẩu MatKhau123@ cho 2 tài khoản!');
}

main().catch(console.error);
