// Thiết lập chung cho toàn bộ E2E tests:
// vô hiệu hóa các kết nối ngoài (Supabase, Firebase Admin) để suite chạy offline,
// toàn bộ dữ liệu đi qua in-memory store có sẵn của SupabaseService.

// 1. Mock @supabase/supabase-js: createClient trả về một client "rỗng" —
//    các query builder là thenable, mọi lệnh đọc resolve { data: null, error: null }
//    để SupabaseService fallback về memoryStore (fallback xảy ra khi data == null),
//    mọi lệnh ghi resolve { error: null } để các guard "đã lưu" không ném lỗi.

function createQueryBuilder(): any {
  const builder: any = {};
  // Các phương thức lọc/điều kiện: trả về builder mới để chain tiếp.
  for (const method of [
    'select', 'insert', 'update', 'delete', 'upsert',
    'eq', 'neq', 'in', 'is', 'gte', 'lte', 'gt', 'lt',
    'order', 'limit', 'range', 'ilike', 'or', 'match',
  ]) {
    builder[method] = () => createQueryBuilder();
  }
  // Terminal methods: đọc về "không có dữ liệu" (kích hoạt fallback memory).
  builder.maybeSingle = () => Promise.resolve({ data: null, error: null });
  builder.single = () => Promise.resolve({ data: null, error: null });
  // Một số nơi await thẳng chuỗi select().eq().order() — builder phải thenable.
  builder.then = (resolve: (v: any) => any) =>
    Promise.resolve({ data: null, error: null }).then(resolve);
  return builder;
}

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: () => createQueryBuilder(),
  })),
}));

// 2. Mock Firebase Admin SDK: không có credentials, không gửi FCM thật,
//    FirebaseAdminService tự chuyển sang "chế độ dự phòng" (isAvailable = false).
jest.mock('firebase-admin/app', () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(() => []),
  cert: jest.fn(),
}));

jest.mock('firebase-admin/auth', () => ({
  getAuth: jest.fn(() => ({})),
}));

jest.mock('firebase-admin/messaging', () => ({
  getMessaging: jest.fn(() => ({})),
}));
