/**
 * UAT11_PHHS_01 — NGHIỆM THU PHỤ HUYNH ĐĂNG NHẬP, LIÊN KẾT CON VÀO SỔ LIÊN LẠC ĐIỆN TỬ
 *                QUA MÃ MỜI / MÃ HỌC SINH
 * Nguồn: docs/testcases/4-acceptance/acceptance_testcase.md (UAT11)
 *
 * Ghi chú phạm vi tự động hóa: màn hình đăng nhập app phụ huynh là giao diện — backend
 * nghiệm thu ở đây là Preview mã mời → Xác nhận liên kết (joinClassByInvite) với SĐT
 * phụ huynh khớp, và luồng TỪ CHỐI khi SĐT không khớp phụ huynh của em nào.
 */
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ClassesService } from '../../apps/api/src/modules/03-classes/classes.service';

const BA_HUNG_ID = 'usr_parent_hung_01'; // Bác Trần Văn Hùng (SĐT 0977112233)
const CO_LAN_ID = 'usr_teacher_lan_01';  // GVCN Lớp 1A
const CLASS_1A_ID = 'cls_1a_chuvanan';
const MA_MOI_LOP = '1A2026';
const STD_BAO_NAM = 'std_baonam'; // mã học sinh em Trần Bảo Nam

function buildParentLinkStack() {
  const cacheStore = new Map<string, any>();
  const mockCache = {
    get: jest.fn(async (k: string) => cacheStore.get(k)),
    set: jest.fn(async (k: string, v: any, _ttl?: number) => cacheStore.set(k, v)),
    del: jest.fn(async (k: string) => cacheStore.delete(k)),
  };

  const HS_LOP_1A = [
    { id: STD_BAO_NAM, full_name: 'Trần Bảo Nam', student_code: 'HS003', class_id: CLASS_1A_ID, parent_phone: '0977112233', is_deleted: false },
    { id: 'std_khoi', full_name: 'Lê Minh Khôi', student_code: 'HS001', class_id: CLASS_1A_ID, parent_phone: '0933445566', is_deleted: false },
  ];

  const mockDataConnect = {
    getUserById: jest.fn(async (id: string) =>
      id === BA_HUNG_ID
        ? { id, full_name: 'Trần Văn Hùng', phone: '0977112233', role: 'PARENT', assigned_info: '' }
        : id === CO_LAN_ID
        ? { id, full_name: 'Nguyễn Thị Lan', phone: '0911223300', role: 'TEACHER_HOMEROOM', teaching_subjects: ['MATH'] }
        : null,
    ),
    getUserAssignedInfo: jest.fn(async () => ({ linked_student_ids: [] })),
    mergeUserAssignedInfo: jest.fn(async () => ({})),
    getClassByInviteCode: jest.fn(async (code: string) =>
      code === MA_MOI_LOP
        ? {
            id: CLASS_1A_ID, name: 'Lớp 1A', invite_code: code,
            grade_level: 1, academic_year: '2026-2027',
            school_name: 'Trường Tiểu Học Chu Văn An',
            homeroom_teacher_id: CO_LAN_ID, subject_teachers: [], student_count: 2,
          }
        : null,
    ),
    getClassById: jest.fn(async (id: string) =>
      id === CLASS_1A_ID
        ? { id, name: 'Lớp 1A', invite_code: MA_MOI_LOP, homeroom_teacher_id: CO_LAN_ID, subject_teachers: [], student_count: 2 }
        : null,
    ),
    getStudentById: jest.fn(async (id: string) => HS_LOP_1A.find((s) => s.id === id) || null),
    listStudentsByClass: jest.fn(async () => HS_LOP_1A),
    createStudent: jest.fn(async (s: any) => s),
  };

  const service = new ClassesService(mockDataConnect as any, mockCache as any);
  return { service, mockDataConnect, mockCache };
}

describe('UAT11_PHHS_01 — Phụ huynh liên kết con vào Sổ liên lạc qua mã mời / mã học sinh', () => {
  let ctx: ReturnType<typeof buildParentLinkStack>;

  beforeEach(() => {
    jest.clearAllMocks();
    ctx = buildParentLinkStack();
  });

  it('Bước 2a: Nhập mã mời lớp 1A2026 → xem trước đúng lớp, GVCN là Cô Nguyễn Thị Lan', async () => {
    const preview = await ctx.service.previewClassByInvite(MA_MOI_LOP, BA_HUNG_ID);

    expect(preview.class_id).toBe(CLASS_1A_ID);
    expect(preview.name).toBe('Lớp 1A');
    expect(preview.school_name).toBe('Trường Tiểu Học Chu Văn An');
    expect(preview.homeroom_teacher).toBe('Nguyễn Thị Lan');
  });

  it('Bước 2–3: Xác nhận liên kết bằng mã mời → ghép đúng em Trần Bảo Nam theo SĐT phụ huynh, lưu linked_student_ids', async () => {
    const res: any = await ctx.service.joinClassByInvite(BA_HUNG_ID, {
      invite_code: MA_MOI_LOP,
    } as any);

    expect(res.message).toContain('thành công');
    expect(res.class_name).toBe('Lớp 1A');
    // Chỉ em Bảo Nam có SĐT phụ huynh 0977112233 được ghép — không nhầm con của phụ huynh khác
    expect(res.students).toHaveLength(1);
    expect(res.students[0].full_name).toBe('Trần Bảo Nam');
    expect(res.students[0].student_code).toBe('HS003');
    expect(res.child.full_name).toBe('Trần Bảo Nam');

    // Liên kết chính xác vào dữ liệu PH trong CSDL: linked_student_ids = [std_baonam]
    expect(ctx.mockDataConnect.mergeUserAssignedInfo).toHaveBeenCalledWith(
      BA_HUNG_ID,
      expect.objectContaining({ linked_student_ids: [STD_BAO_NAM] }),
    );
    // Cache profile bị xóa → thẻ hồ sơ con hiển thị tức thì không stale
    expect(ctx.mockCache.del).toHaveBeenCalledWith(`user_profile_${BA_HUNG_ID}`);
  });

  it('Liên kết bằng mã học sinh (std_baonam) → SĐT tài khoản khớp SĐT PH của em, liên kết thành công', async () => {
    const res: any = await ctx.service.joinClassByInvite(BA_HUNG_ID, {
      student_code: STD_BAO_NAM,
    } as any);

    expect(res.students[0].full_name).toBe('Trần Bảo Nam');
    expect(res.class_name).toBe('Lớp 1A');
  });

  it('Chống nhầm quyền: PH khác SĐT không thể liên kết con người khác bằng mã học sinh', async () => {
    // Tạo tài khoản PH khác SĐT
    ctx.mockDataConnect.getUserById = jest.fn(async (id: string) =>
      id === 'usr_parent_khac'
        ? { id, full_name: 'Phụ Huynh Khác', phone: '0966888999', role: 'PARENT' }
        : null,
    );
    await expect(
      ctx.service.joinClassByInvite('usr_parent_khac', { student_code: STD_BAO_NAM } as any),
    ).rejects.toThrow(ForbiddenException);
  });

  it('PH gõ trình bày tên con → tự tạo hồ sơ học sinh mới khi em chưa có trong lớp', async () => {
    const res: any = await ctx.service.joinClassByInvite(BA_HUNG_ID, {
      invite_code: MA_MOI_LOP,
      child_name: 'Trần Bảo Nam Nhánh',
      relationship: 'Bố',
    } as any);

    // Em chưa có trong lớp (tên khác) → tự sinh hồ sơ với SĐT PH của bác Hùng
    expect(ctx.mockDataConnect.createStudent).toHaveBeenCalled();
    const newStudent = ctx.mockDataConnect.createStudent.mock.calls[0][0];
    expect(newStudent.full_name).toBe('Trần Bảo Nam Nhánh');
    expect(newStudent.parent_phone).toBe('0977112233');
    expect(newStudent.class_id).toBe(CLASS_1A_ID);
    expect(newStudent.is_parent_app_connected).toBe(true);
    expect((res as any).students[0].full_name).toBe('Trần Bảo Nam Nhánh');
  });

  it('Từ chối mã mời sai / hết hạn (báo CLASS_INVITE_CODE_INVALID)', async () => {
    await expect(ctx.service.previewClassByInvite('XX9999')).rejects.toThrow(NotFoundException);
    await expect(
      ctx.service.joinClassByInvite(BA_HUNG_ID, { invite_code: 'XX9999' } as any),
    ).rejects.toThrow(NotFoundException);
    await expect(
      ctx.service.joinClassByInvite(BA_HUNG_ID, {} as any),
    ).rejects.toThrow(BadRequestException);
  });
});
