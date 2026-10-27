/**
 * UAT15_PHHS_05 — NGHIỆM THU CHỈNH SỬA HỒ SƠ PHỤ HUYNH (LIVE 3D AVATAR PREVIEW, SĐT CỐ ĐỊNH)
 *                VÀ ĐỒNG BỘ CƠ SỞ DỮ LIỆU TỨC THÌ
 * Nguồn: docs/testcases/4-acceptance/acceptance_testcase.md (UAT15)
 *
 * Ghi chú phạm vi tự động hóa: Live 3D Avatar Preview là giao diện — backend nghiệm thu
 * ở đây là PATCH profile: lưu full_name/email mới vào bảng users (updated_at mới),
 * SĐT đăng nhập KHÔNG thể sửa qua profile (cố định), xóa cache stale tức thì.
 */
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { UsersService } from '../../apps/api/src/modules/02-users/users.service';

const BA_HUNG_ID = 'usr_parent_hung_01'; // SĐT 0977112233

function buildProfileStack(opts: { isActive?: boolean } = {}) {
  const usersDb: Record<string, any> = {
    [BA_HUNG_ID]: {
      id: BA_HUNG_ID,
      full_name: 'Trần Văn Hùng',
      phone: '0977112233',
      email: 'hung.old@gmail.com',
      role: 'PARENT',
      is_active: opts.isActive !== false,
      is_deleted: false,
    },
  };

  const cacheStore = new Map<string, any>();
  const mockCache = {
    get: jest.fn(async (k: string) => cacheStore.get(k)),
    set: jest.fn(async (k: string, v: any, _ttl?: number) => cacheStore.set(k, v)),
    del: jest.fn(async (k: string) => cacheStore.delete(k)),
  };

  const mockDataConnect = {
    getUserById: jest.fn(async (id: string) => usersDb[id] || null),
    // "createUser" đóng vai UPSERT bảng users (hành vi dữ liệu của Data Connect)
    createUser: jest.fn(async (userData: any) => {
      usersDb[userData.id] = userData;
      return userData;
    }),
  };

  const service = new UsersService(mockDataConnect as any, mockCache as any);
  return { service, mockDataConnect, mockCache, usersDb };
}

describe('UAT15_PHHS_05 — Phụ huynh chỉnh sửa hồ sơ & đồng bộ CSDL tức thì', () => {
  let ctx: ReturnType<typeof buildProfileStack>;

  beforeEach(() => {
    jest.clearAllMocks();
    ctx = buildProfileStack();
  });

  it('Bước 3–4: Bác Hùng đổi Họ tên + Email và "Lưu Thay Đổi" — thành công, trả hồ sơ mới ngay lập tức', async () => {
    const res: any = await ctx.service.updateProfile(BA_HUNG_ID, {
      full_name: 'Trần Văn Hùng (Bố Bảo Nam)',
      email: 'hung.tran.profile@gmail.com',
    } as any);

    expect(res.full_name).toBe('Trần Văn Hùng (Bố Bảo Nam)');
    expect(res.email).toBe('hung.tran.profile@gmail.com');
    // Thẻ hồ sơ bên ngoài hiện thông tin mới ngay: userId, role không đổi
    expect(res.id).toBe(BA_HUNG_ID);
    expect(res.role).toBe('PARENT');
  });

  it('Bước 5: Đối soát CSDL bảng users — full_name/email mới kèm updated_at mới, giá trị cũ bị ghi đè', async () => {
    await ctx.service.updateProfile(BA_HUNG_ID, {
      full_name: 'Trần Văn Hùng (Bố Bảo Nam)',
      email: 'hung.tran.profile@gmail.com',
    } as any);

    const record = ctx.mockDataConnect.createUser.mock.calls[0][0];
    expect(record.full_name).toBe('Trần Văn Hùng (Bố Bảo Nam)');
    expect(record.email).toBe('hung.tran.profile@gmail.com');
    expect(record.updated_at).toBeTruthy();
    // Số điện thoại đăng nhập được bảo toàn nguyên vẹn (không có trong dto)
    expect(record.phone).toBe('0977112233');
  });

  it('SĐT đăng nhập CỐ ĐỊNH: không có trong nội dung UpdateProfileDto và giá trị SĐT giữ nguyên vẹn', async () => {
    // DTO profile chỉ khai báo full_name/email/avatar_url/school_name — không có phone
    await ctx.service.updateProfile(BA_HUNG_ID, {
      full_name: 'Trần Văn Hùng (Bố Bảo Nam)',
    } as any);

    const record = ctx.mockDataConnect.createUser.mock.calls[0][0];
    // SĐT cũ vẫn nguyên vẹn → không mất quyền đăng nhập định danh
    expect(record.phone).toBe('0977112233');
  });

  it('Đồng bộ tức thì: cache user_profile bị xóa bỏ sau khi lưu (không stale cache)', async () => {
    await ctx.service.updateProfile(BA_HUNG_ID, {
      full_name: 'Trần Văn Hùng (Bố Bảo Nam)',
    } as any);
    expect(ctx.mockCache.del).toHaveBeenCalledWith(`user_profile_${BA_HUNG_ID}`);
  });

  it('Tài khoản bị khóa bởi Admin (UAT17) KHÔNG thể sửa hồ sơ (báo Forbidden)', async () => {
    const ctxLocked = buildProfileStack({ isActive: false });
    await expect(
      ctxLocked.service.updateProfile(BA_HUNG_ID, { full_name: 'Trần Văn Hùng (Bố Bảo Nam)' } as any),
    ).rejects.toThrow(ForbiddenException);
  });

  it('Lỗi trường hợp học sinh chưa tồn tại hồ sơ (USER_NOT_FOUND)', async () => {
    await expect(
      ctx.service.updateProfile('usr_khong_co', { full_name: 'Ai Đó' } as any),
    ).rejects.toThrow(NotFoundException);
  });
});
