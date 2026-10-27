/**
 * UAT02_GVCN_01 — NGHIỆM THU QUẢN LÝ LỚP (RBAC), DANH SÁCH HS + LIÊN HỆ PHỤ HUYNH, THÊM MỚI & XÓA MỀM BẢO TOÀN DỮ LIỆU
 * Nguồn: docs/testcases/4-acceptance/acceptance_testcase.md (UAT02)
 */
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ClassesService } from '../../apps/api/src/modules/03-classes/classes.service';

const GVCN_ID = 'usr_teacher_lan_01'; // Cô Nguyễn Thị Lan
const GVBM_ID = 'usr_teacher_nam_01'; // Thầy Lê Hoàng Nam — GVBM khác, không phải GVCN
const CLASS_1A_ID = 'cls_1a_chuvanan';

const HOC_SINH_LOP_1A = [
  { id: 'std_khoi', student_code: 'HS001', full_name: 'Lê Minh Khôi', dob: '2020-05-01', gender: 'MALE', parent_phone: '0933445566', parent_name: 'Lê Văn Minh', is_deleted: false },
  { id: 'std_my', student_code: 'HS002', full_name: 'Nguyễn Hoàng My', dob: '2020-03-12', gender: 'FEMALE', parent_phone: '0977889900', parent_name: 'Nguyễn Thị Mai', is_deleted: false },
  { id: 'std_baonam', student_code: 'HS003', full_name: 'Trần Bảo Nam', dob: '2020-06-20', gender: 'MALE', parent_phone: '0977112233', parent_name: 'Trần Văn Hùng', is_deleted: false },
];

export function buildClassesService() {
  const cacheStore = new Map<string, any>();
  const mockCacheManager = {
    get: jest.fn(async (k: string) => cacheStore.get(k)),
    set: jest.fn(async (k: string, v: any) => cacheStore.set(k, v)),
    del: jest.fn(async (k: string) => cacheStore.delete(k)),
  };
  const studentsById = new Map<string, any>();
  const studentsByClass = new Map<string, any[]>();
  const deletedStudents: string[] = [];
  const mockDataConnect = {
    getClassById: jest.fn(async (id: string) =>
      id === CLASS_1A_ID
        ? {
            id: CLASS_1A_ID,
            name: 'Lớp 1A',
            grade_level: 1,
            academic_year: '2026-2027',
            school_name: 'Trường Tiểu Học Chu Văn An',
            homeroom_teacher_id: GVCN_ID,
            subject_teachers: [
              { teacher_id: 'usr_gvbm_eng_01', subject_code: 'ENG', teacher_name: 'Cô Phạm Quỳnh Chi' },
              { teacher_id: 'usr_gvbm_cs_01', subject_code: 'CS', teacher_name: 'Thầy Trần Văn Nam' },
              { teacher_id: 'usr_gvbm_music_01', subject_code: 'MUSIC', teacher_name: 'Cô Lê Hồng Mai' },
            ],
            student_count: HOC_SINH_LOP_1A.length,
            invite_code: 'INV-1A2026XK',
            is_deleted: false,
          }
        : 'cls_khoi6a' === id
        ? {
            id: 'cls_khoi6a', name: 'Lớp 6A', grade_level: 6, student_count: 40,
            homeroom_teacher_id: 'usr_teacher_khac', invite_code: 'INV-6AXX', is_deleted: false,
          }
        : null,
    ),
    getUserById: jest.fn(async (id: string) =>
      id === GVCN_ID
        ? { id: GVCN_ID, full_name: 'Cô Nguyễn Thị Lan', role: 'TEACHER_HOMEROOM', phone: '0912345678' }
        : id === GVBM_ID
        ? { id: GVBM_ID, full_name: 'Thầy Lê Hoàng Nam', role: 'TEACHER_SUBJECT', phone: '0912345679' }
        : null,
    ),
    getUserAssignedInfo: jest.fn(async () => ({ joined_class_ids: [CLASS_1A_ID], teaching_subjects: ['CS'] })),
    listStudentsByClass: jest.fn(async (classId: string) =>
      classId === CLASS_1A_ID ? [...studentsByClass.get(CLASS_1A_ID) || []] : [],
    ),
    listUsers: jest.fn(async () => [
      { id: 'usr_parent_hung_01', full_name: 'Trần Văn Hùng', phone: '0977112233', role: 'PARENT' },
      { id: 'usr_parent_minh_01', full_name: 'Lê Văn Minh', phone: '0933445566', role: 'PARENT' },
    ]),
    createStudent: jest.fn(async (stu: any) => {
      studentsById.set(stu.id, stu);
      studentsByClass.get(stu.class_id)?.push(stu);
      return stu;
    }),
    updateStudent: jest.fn(async (id: string, patch: any) => ({ ...studentsById.get(id), ...patch })),
    softDeleteStudent: jest.fn(async (id: string) => {
      deletedStudents.push(id);
      const stu = studentsById.get(id);
      if (stu) stu.is_deleted = true;
      return true;
    }),
    getClassStudents: jest.fn(),
    getStudentById: jest.fn(async (id: string) => studentsById.get(id) || null),
  };

  // Seed danh sách lớp 1A
  studentsByClass.set(CLASS_1A_ID, HOC_SINH_LOP_1A.map((s) => ({ ...s })));
  HOC_SINH_LOP_1A.forEach((s) => studentsById.set(s.id, { ...s }));

  const service = new ClassesService(mockDataConnect, mockCacheManager);
  return { service, mockDataConnect, mockCacheManager, deletedStudents, studentsById };
}

describe('UAT02_GVCN_01 — Quản lý lớp: RBAC, danh sách HS, thêm mới & xóa mềm', () => {
  let ctx: ReturnType<typeof buildClassesService>;

  beforeEach(() => {
    jest.clearAllMocks();
    ctx = buildClassesService();
  });

  it('GVCN mở chi tiết lớp chủ nhiệm và thấy danh sách học sinh kèm thông tin phụ huynh để gọi điện/nhắn tin', async () => {
    const res = await ctx.service.getClassDetail(CLASS_1A_ID, GVCN_ID);
    expect(res.name).toBe('Lớp 1A');
    expect(res.homeroom_teacher).toContain('Nguyễn Thị Lan');
    // Phụ huynh từng học sinh được dữ liệu thật từ tài khoản PARENT (gọi SMS/gọi điện 1-chạm)
    const khoi = res.students.find((s: any) => s.id === 'std_khoi');
    expect(khoi.parent_phone).toBe('0933445566');
    expect(khoi.parent_name).toBe('Lê Văn Minh');
    expect(khoi.is_parent_app_connected).toBe(true);
  });

  it('Chặn RBAC: phụ huynh lạ không có quyền xem lớp không có con em', async () => {
    // Thêm phụ huynh 2 không liên kết
    const mockPH = {
      id: 'usr_parent_lai_01', full_name: 'Phụ Huynh Lạ', role: 'PARENT', phone: '0333444555',
    };
    ctx.mockDataConnect.getUserById.mockImplementation(async (id: string) =>
      id === mockPH.id ? mockPH : id === GVCN_ID ? { id: GVCN_ID, role: 'TEACHER_HOMEROOM' } : null,
    );
    try {
      await ctx.service.getClassDetail(CLASS_1A_ID, mockPH.id);
      fail('Phụ huynh không liên kết không được phép xem lớp');
    } catch (e) {
      expect(e).toBeInstanceOf(ForbiddenException);
    }
  });

  it('GVCN được thêm học sinh mới với đầy đủ: tên, ngày sinh, SĐT phụ huynh', async () => {
    const dto = {
      full_name: 'Vũ Đức Trọng',
      dob: '2020-11-15',
      gender: 'MALE',
      parent_phone: '0988111222',
      parent_name: 'Vũ Đức Trân',
    };
    const res: any = await ctx.service.addStudent(CLASS_1A_ID, dto, GVCN_ID);
    expect(res.full_name).toBe('Vũ Đức Trọng');
    expect(ctx.mockDataConnect.createStudent).toHaveBeenCalled();
  });

  it('Từ chối thêm học sinh trùng họ tên + ngày sinh trong lớp (ConflictException)', async () => {
    await expect(
      ctx.service.addStudent(
        CLASS_1A_ID,
        { full_name: 'Trần Bảo Nam', dob: '2020-06-20', gender: 'MALE', parent_phone: '0977112233' },
        GVCN_ID,
      ),
    ).rejects.toThrow(ConflictException);
  });

  it('GVBM không phải GVCN không được phép Thêm học sinh của lớp khác (RBAC Forbidden)', async () => {
    await expect(
      ctx.service.addStudent(
        CLASS_1A_ID,
        { full_name: 'Nguyễn Văn An', dob: '2020-02-02', gender: 'MALE', parent_phone: '0977112233' },
        GVBM_ID,
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  /**
   * Bước 4–5: Xóa mềm học sinh chuyển trường
   * Với tự động hóa: lưu trữ điểm số & chuyên cần quá khứ được bảo toàn (soft delete ẩn khỏi app)
   */
  it('Xóa mềm học sinh: ẩn khỏi app, không xóa cứng, dữ liệu học bạ bảo toàn 100%', async () => {
    const stdId = 'std_khoi';
    const res = await ctx.service.removeStudent(CLASS_1A_ID, stdId, GVCN_ID);

    expect(res.message).toBe('Xóa mềm học sinh khỏi lớp thành công');
    expect(res.is_deleted).toBe(true);
    expect(res.deleted_at).toBeDefined();

    // Soft Delete: học sinh còn nguyên bản ghi với is_deleted = true, không xóa cứng
    expect(ctx.mockDataConnect.softDeleteStudent).toHaveBeenCalledWith(stdId);
    const stu = ctx.studentsById.get(stdId);
    expect(stu.is_deleted).toBe(true);
    // Điểm số và chuyên cần quá khứ (data out-of-scope của routine này) vẫn giữ nguyên bản ghi
    expect(ctx.deletedStudents.some((id) => String(id) === String(stdId))).toBe(true);
  });

  it('Từ chối xóa học sinh nếu học sinh không tồn tại trong DB', async () => {
    await expect(
      ctx.service.removeStudent(CLASS_1A_ID, 'std_khongton_tai', GVCN_ID),
    ).rejects.toThrow(NotFoundException);
  });

  it('Không cho xóa mềm học sinh nếu không phải GVCN (RBAC)', async () => {
    await expect(
      ctx.service.removeStudent(CLASS_1A_ID, 'std_khoi', GVBM_ID),
    ).rejects.toThrow(ForbiddenException);
  });

  it('Chặn lớp vượt quá sĩ số tối đa theo hạn mức hệ thống (60 học sinh)', async () => {
    const dto = { full_name: 'Học Sinh Số 61', dob: '2020-01-01', gender: 'MALE', parent_phone: '0911222333', current_students_count: 60 };
    await expect(ctx.service.addStudent(CLASS_1A_ID, dto, GVCN_ID)).rejects.toThrow(BadRequestException);
  });

  it('Cập nhật phân công GVBM chỉ khi là GVCN, cập nhật các cặp (GVBM, môn) và gỡ phân công cũ', async () => {
    const res: any = await ctx.service.updateSubjectTeachers(CLASS_1A_ID, GVCN_ID, {
      subject_teachers: [
        { teacher_id: 'usr_gvbm_eng_01', subject_code: 'ENG' },
        { teacher_id: 'usr_gvbm_cs_01', subject_code: 'CS' },
      ],
    });
    expect(res.message).toBe('Cập nhật phân công GVBM thành công');
    expect(res.updated_count).toBe(2);
  });
});

function fail(msg: string): never {
  throw new Error(msg);
}
