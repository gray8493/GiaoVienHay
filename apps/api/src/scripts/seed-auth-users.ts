/**
 * Kịch bản đồng bộ Tài khoản Supabase Auth cho toàn bộ người dùng thực tế trong CSDL.
 *
 * - Đọc danh sách users từ bảng `users` (PostgreSQL Supabase).
 * - Xác định auth email chuẩn: dùng `users.email` nếu non-empty và duy nhất,
 *   ngược lại dùng email tổng hợp `${phone}@giaovienhay.vn`.
 * - Tạo mới hoặc cập nhật mật khẩu Supabase Auth cho từng người dùng.
 *
 * Cách chạy:
 *   pnpm --filter @giaovienhay/api seed:auth
 *   hoặc: npx ts-node src/scripts/seed-auth-users.ts
 *
 * Biến môi trường:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  (bắt buộc, đọc từ .env)
 *   SEED_AUTH_PASSWORD                        (tùy chọn, mặc định 'MatKhau123@')
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

function loadEnvFile() {
  const envPath = path.resolve(__dirname, '../../.env');
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const key = match[1];
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SEED_AUTH_PASSWORD = process.env.SEED_AUTH_PASSWORD || 'MatKhau123@';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    '❌ Thiếu cấu hình SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY. Vui lòng khai báo trong apps/api/.env trước khi chạy seed.',
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
  global: { headers: { 'User-Agent': 'GiaoVienHay-Seed-Auth/1.0' } },
});

function resolveAuthEmail(
  user: { phone: string; email?: string | null },
  emailCounts: Map<string, number>,
): string {
  const email = (user.email || '').trim().toLowerCase();
  if (email && (emailCounts.get(email) || 0) === 1) {
    return email;
  }
  return `${user.phone}@giaovienhay.vn`;
}

async function listAllAuthUsers() {
  const all: any[] = [];
  let page = 1;
  const perPage = 100;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(`Không thể đọc danh sách auth users: ${error.message}`);
    all.push(...(data?.users || []));
    if ((data?.users || []).length < perPage) break;
    page++;
  }
  return all;
}

async function run() {
  console.log('🚀 Đồng bộ tài khoản Supabase Auth cho người dùng thực tế trong CSDL...');
  console.log(`🔗 Supabase URL: ${SUPABASE_URL}`);

  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .eq('is_deleted', false);
  if (error) {
    console.error(`❌ Không thể đọc bảng users: ${error.message}`);
    process.exit(1);
  }

  const emailCounts = new Map<string, number>();
  for (const u of users || []) {
    const email = (u.email || '').trim().toLowerCase();
    if (email) emailCounts.set(email, (emailCounts.get(email) || 0) + 1);
  }

  const authUsers = await listAllAuthUsers();
  const authByEmail = new Map<string, any>();
  for (const au of authUsers) {
    if (au.email) authByEmail.set(au.email.toLowerCase(), au);
  }

  let created = 0;
  let updated = 0;
  let failed = 0;

  for (const user of users || []) {
    const authEmail = resolveAuthEmail(user, emailCounts);
    const existing = authByEmail.get(authEmail);

    if (existing) {
      const { error: updateError } = await supabase.auth.admin.updateUserById(existing.id, {
        password: SEED_AUTH_PASSWORD,
        email_confirm: true,
        user_metadata: { phone: user.phone, db_user_id: user.id, role: user.role },
      });
      if (updateError) {
        failed++;
        console.error(`   ❌ ${user.id} (${authEmail}): ${updateError.message}`);
      } else {
        updated++;
        console.log(`   ♻️  Cập nhật mật khẩu OK: ${user.id} · ${user.phone} · ${authEmail}`);
      }
      continue;
    }

    const { data, error: createError } = await supabase.auth.admin.createUser({
      email: authEmail,
      password: SEED_AUTH_PASSWORD,
      email_confirm: true,
      user_metadata: { phone: user.phone, db_user_id: user.id, role: user.role },
    });
    if (createError) {
      failed++;
      console.error(`   ❌ ${user.id} (${authEmail}): ${createError.message}`);
    } else {
      created++;
      console.log(`   ✅ Tạo mới OK: ${user.id} · ${user.phone} · ${authEmail} · auth_uid=${data?.user?.id}`);
    }
  }

  console.log('\n📊 KẾT QUẢ ĐỒNG BỘ SUPABASE AUTH:');
  console.log(`   • Tổng số user trong CSDL : ${(users || []).length}`);
  console.log(`   • Tạo mới                 : ${created}`);
  console.log(`   • Cập nhật mật khẩu       : ${updated}`);
  console.log(`   • Thất bại                : ${failed}`);
  console.log(`   • Mật khẩu seed           : ${SEED_AUTH_PASSWORD}`);

  if (failed > 0) process.exit(1);
}

run().catch((err) => {
  console.error('❌ Lỗi ngoại lệ khi đồng bộ Supabase Auth:', err?.message || err);
  process.exit(1);
});
