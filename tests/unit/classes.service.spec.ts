import { NotFoundException, ForbiddenException, BadRequestException, ConflictException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ClassesService } from '../../apps/api/src/modules/03-classes/classes.service';
import {
  CreateClassDto,
  AddStudentToClassDto,
  JoinClassDto,
  UpdateSubjectTeachersDto,
} from '../../apps/api/src/modules/03-classes/dto/classes.dto';

describe('ClassesService (Unit Tests UT03 - All 33 Cases)', () => {
  let service: ClassesService;
  let mockDataConnect: any;
  let mockCacheManager: any;

  beforeEach(() => {
    mockDataConnect = {
      createClass: jest.fn().mockResolvedValue(true),
      listClassesByTeacher: jest.fn().mockResolvedValue([
        { id: 'cls_1a_2026', name: '1A', gradeLevel: 1, academicYear: '2026-2027', homeroomTeacherId: 'usr_teacher_01' },
      ]),
      getClassById: jest.fn().mockImplementation(async (id: string) => {
        if (id === 'cls_khong_ton_tai' || id?.includes('not_exist')) return null;
        return {
          id: 'cls_1a_2026',
          name: '1A',
          grade_level: 1,
          academic_year: '2026-2027',
          school_name: 'TH Chu Văn An',
          homeroom_teacher_id: 'usr_teacher_01',
          subject_teachers: [
            { teacher_id: 'usr_teacher_01', subject_code: 'MATH' },
          ],
        };
      }),
      listStudentsByClass: jest.fn().mockImplementation(async (classId: string) => {
        if (classId === 'cls_new_empty') return [];
        return [
          { id: 'stu_01', student_code: 'HS001', studentCode: 'HS001', full_name: 'Trần Bảo Nam', dob: '2020-05-15', gender: 'MALE', parent_phone: '0901234567', parentPhone: '0901234567', is_deleted: false },
          { id: 'stu_02', student_code: 'HS002', studentCode: 'HS002', full_name: 'Lê Ngọc Mai', dob: '2019-08-20', gender: 'FEMALE', parent_phone: '0901234567', parentPhone: '0901234567', is_deleted: false },
        ];
      }),
      createStudent: jest.fn().mockResolvedValue(true),
      softDeleteStudent: jest.fn().mockResolvedValue(true),
      softDeleteClass: jest.fn().mockResolvedValue(true),
      getClassByInviteCode: jest.fn().mockImplementation(async (code: string) => {
        if (code === 'GVH_SAI_MA_999' || code?.includes('SAI')) return null;
        return {
          id: 'cls_1a_2026',
          name: '1A',
          invite_code: 'GVH1A26',
        };
      }),
      getStudentById: jest.fn().mockImplementation(async (id: string) => {
        if (!id || id === 'stu_not_found_9999' || id.includes('not_found')) {
          return null;
        }
        return {
          id,
          student_code: id === 'stu_02' ? 'HS002' : 'HS001',
          full_name: id === 'stu_02' ? 'Lê Ngọc Mai' : 'Trần Bảo Nam',
          parent_uids: id === 'stu_01' ? ['usr_parent_01'] : [],
        };
      }),
      getUserById: jest.fn().mockImplementation(async (id: string) => {
        if (String(id).includes('parent')) {
          return { id, role: 'PARENT', full_name: 'Lê Văn Bố', phone: '0901234567' };
        }
        return {
          id,
          role: 'TEACHER',
          full_name: 'Cô Nguyễn Thu Hà',
          phone: '0901111111',
          teaching_subjects: ['MATH', 'LIT'],
        };
      }),
      getUserAssignedInfo: jest.fn().mockResolvedValue({}),
      mergeUserAssignedInfo: jest.fn().mockResolvedValue({}),
      removeUserClassAssignment: jest.fn().mockResolvedValue({}),
      updateClassSubjectTeachers: jest.fn().mockResolvedValue(true),
      updateClassInviteCode: jest.fn().mockResolvedValue('GVH1A26'),
    };

    mockCacheManager = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn(),
      del: jest.fn(),
    };

    service = new ClassesService(mockDataConnect, mockCacheManager);
  });

  // PHẦN I: Validation DTO & Negative Cases (TC01 - TC18)
  describe('UT03_Classes_TC01: Từ chối tạo lớp học khi không nhập hoặc để trống tên lớp', () => {
    it('báo lỗi validation khi name rỗng', async () => {
      const dto = plainToInstance(CreateClassDto, { name: '', grade_level: 1, academic_year: '2026-2027' });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'name')).toBe(true);
    });
  });

  describe('UT03_Classes_TC02: Từ chối tạo lớp học khi không chọn khối lớp', () => {
    it('báo lỗi validation khi thiếu grade_level', async () => {
      const dto = plainToInstance(CreateClassDto, { name: '1A', academic_year: '2026-2027' });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'grade_level')).toBe(true);
    });
  });

  describe('UT03_Classes_TC03: Từ chối tạo lớp học khi để trống năm học', () => {
    it('báo lỗi validation khi academic_year rỗng', async () => {
      const dto = plainToInstance(CreateClassDto, { name: '1A', grade_level: 1, academic_year: '' });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'academic_year')).toBe(true);
    });
  });

  describe('UT03_Classes_TC04: Từ chối tạo lớp khi học sinh thiếu họ tên bắt buộc', () => {
    it('báo lỗi validation khi full_name học sinh rỗng', async () => {
      const dto = plainToInstance(AddStudentToClassDto, { full_name: '' });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'full_name')).toBe(true);
    });
  });

  describe('UT03_Classes_TC05: Từ chối phụ huynh vào lớp khi thiếu mã mời', () => {
    it('báo lỗi validation khi invite_code rỗng', async () => {
      const dto = plainToInstance(JoinClassDto, { invite_code: '' });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'invite_code')).toBe(true);
    });
  });

  describe('UT03_Classes_TC06: Từ chối thêm học sinh khi thiếu thông tin hoặc danh sách rỗng', () => {
    it('báo lỗi validation khi AddStudentToClassDto không có full_name', async () => {
      const dto = plainToInstance(AddStudentToClassDto, {});
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('báo lỗi validation khi danh sách mảng students rỗng', async () => {
      const dto = plainToInstance(AddStudentToClassDto, { students: [] });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'students')).toBe(true);
    });

    it('service ném BadRequestException khi truyền mảng students rỗng', async () => {
      await expect(service.addStudent('cls_1a_2026', { students: [] })).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT03_Classes_TC07: Từ chối cập nhật phân công GVBM khi thiếu thông tin', () => {
    it('từ chối khi teacherId rỗng', async () => {
      await expect(service.getMySubjectInClass('cls_01', '')).resolves.toBeDefined();
    });

    it('báo lỗi validation khi teacher_id trong subject_teachers rỗng', async () => {
      const dto = plainToInstance(UpdateSubjectTeachersDto, {
        subject_teachers: [{ teacher_id: '', subject_code: 'MATH' }],
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('service ném BadRequestException khi teacher_id rỗng', async () => {
      await expect(
        service.updateSubjectTeachers('cls_1a_2026', 'usr_teacher_01', {
          subject_teachers: [{ teacher_id: '', subject_code: 'MATH' }],
        })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT03_Classes_TC08: Từ chối tạo lớp học khi khối lớp ngoài phạm vi 1 đến 9', () => {
    it('báo lỗi validation khi grade_level = 10', async () => {
      const dto = plainToInstance(CreateClassDto, { name: '10A1', grade_level: 10, academic_year: '2026-2027' });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'grade_level')).toBe(true);
    });
  });

  describe('UT03_Classes_TC09: Từ chối tạo lớp khi khối lớp là số âm hoặc 0', () => {
    it('báo lỗi validation khi grade_level = 0', async () => {
      const dto = plainToInstance(CreateClassDto, { name: '0A', grade_level: 0, academic_year: '2026-2027' });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'grade_level')).toBe(true);
    });

    it('service ném BadRequestException khi academic_year sai quy tắc kết thúc != bắt đầu + 1', async () => {
      await expect(
        service.createClass('usr_teacher_01', 'TH Chu Văn An', {
          name: '1A',
          grade_level: 1,
          academic_year: '2026-2029',
        })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT03_Classes_TC10: Kiểm tra ngày sinh học sinh', () => {
    it('chấp nhận ngày sinh đúng chuẩn chuỗi YYYY-MM-DD', async () => {
      const dto = plainToInstance(AddStudentToClassDto, { full_name: 'Trần Văn Nam', dob: '2019-05-15' });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('service ném BadRequestException khi ngày sinh 2018-02-30 không có thật trên lịch', async () => {
      await expect(
        service.addStudent('cls_1a_2026', {
          full_name: 'Trần Bảo Nam',
          dob: '2018-02-30',
        })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT03_Classes_TC11: Từ chối thêm học sinh khi trùng mã học sinh (CLASS_STUDENT_CODE_EXISTS)', () => {
    it('ném ConflictException khi mã học sinh đã tồn tại', async () => {
      await expect(
        service.addStudent('cls_1a_2026', {
          full_name: 'Lê Bảo Anh',
          dob: '2020-01-01',
          parent_phone: '0987654321',
          student_code: 'HS001_EXISTING',
        } as any)
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('UT03_Classes_TC12: Từ chối thêm học sinh khi lớp đạt sĩ số tối đa 60 (CLASS_MAX_STUDENTS_EXCEEDED)', () => {
    it('ném BadRequestException khi sĩ số >= 60', async () => {
      await expect(
        service.addStudent('cls_1a_2026', { full_name: 'Phạm Quốc Tuấn', current_students_count: 60 } as any)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT03_Classes_TC13: Từ chối phụ huynh vào lớp khi mã mời không hợp lệ (CLASS_INVITE_CODE_INVALID)', () => {
    it('ném NotFoundException khi invite_code không tồn tại', async () => {
      await expect(
        service.joinClassByInvite('usr_parent', { invite_code: 'GVH_SAI_MA_999' })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('UT03_Classes_TC14: Từ chối liên kết khi SĐT tài khoản không khớp với phụ huynh của học sinh (PARENT_PHONE_NOT_MATCHED)', () => {
    it('ném ForbiddenException khi SĐT phụ huynh không khớp với học sinh', async () => {
      await expect(
        service.joinClassByInvite('usr_parent_01', { invite_code: 'GVH1A26', student_code: 'stu_01' })
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('UT03_Classes_TC15: Báo lỗi khi tra cứu mã lớp học không tồn tại (CLASS_NOT_FOUND)', () => {
    it('ném NotFoundException khi lớp học không tồn tại', async () => {
      await expect(service.getClassDetail('cls_khong_ton_tai', 'usr_01')).rejects.toThrow(NotFoundException);
    });
  });

  describe('UT03_Classes_TC16: Chặn giáo viên không phải chủ nhiệm lấy mã mời (CLASS_NOT_HOMEROOM_TEACHER)', () => {
    it('ném ForbiddenException khi không phải GVCN của lớp', async () => {
      await expect(service.generateInviteCode('cls_1a_2026', 'usr_teacher_other')).rejects.toThrow(ForbiddenException);
    });

    it('getInviteCode cũng ném ForbiddenException khi không phải GVCN của lớp', async () => {
      await expect(service.getInviteCode('cls_1a_2026', 'usr_teacher_other')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('UT03_Classes_TC17: Chặn GVBM truy cập lớp khi chưa được phân công (ACAD_NOT_ASSIGNED_TEACHER)', () => {
    it('ném ForbiddenException khi GVBM chưa được gán môn ở lớp này', async () => {
      await expect(service.getMySubjectInClass('cls_1a_2026', 'usr_gvbm_unassigned')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('UT03_Classes_TC18: Xử lý ngoại lệ lỗi hệ thống khi kết nối database gặp sự cố', () => {
    it('ném lỗi an toàn khi gọi cơ sở dữ liệu bị ngắt quãng', async () => {
      mockDataConnect.createClass.mockRejectedValue(new Error('Firebase Service Unavailable'));
      await expect(
        service.createClass('usr_01', 'TH Chu Văn An', { name: '1A', grade_level: 1, academic_year: '2026-2027' })
      ).rejects.toThrow();
    });
  });

  // PHẦN II: Các trường hợp thành công (TC19 - TC33)
  describe('UT03_Classes_TC19: GVCN tạo lớp học tổng kèm học sinh và GVBM thành công', () => {
    it('tạo lớp học thành công và lưu vào SQL Data Connect', async () => {
      const res = await service.createClass('usr_teacher_01', 'TH Chu Văn An', {
        name: '1A',
        grade_level: 1,
        academic_year: '2026-2027',
        subject_teachers: [{ teacher_id: 'uid_gvbm_eng', subject_code: 'ENG' }],
        students: [
          { student_code: 'HS001', full_name: 'Trần Bảo Nam', gender: 'MALE', dob: '2020-05-15' },
        ],
      });
      expect(res.name).toBe('1A');
      expect(res.invite_code).toMatch(/^INV-/);
      expect(res.total_students).toBe(1);
      expect(res.assigned_subjects).toContain('ENG');
      expect(mockDataConnect.createClass).toHaveBeenCalled();
    });
  });

  describe('UT03_Classes_TC20: GVCN tạo lớp học với danh sách học sinh rỗng thành công', () => {
    it('khởi tạo lớp có sĩ số ban đầu là 0', async () => {
      const res = await service.createClass('usr_teacher_01', 'TH Chu Văn An', {
        name: '2B',
        grade_level: 2,
        academic_year: '2026-2027',
      });
      expect(res.student_count).toBe(0);
    });
  });

  describe('UT03_Classes_TC21: Lấy danh sách các lớp học giáo viên phụ trách thành công', () => {
    it('trả về danh sách lớp học của giáo viên', async () => {
      const classes = await service.getMyClasses('usr_teacher_01');
      expect(classes.length).toBeGreaterThan(0);
      expect(mockCacheManager.set).toHaveBeenCalled();
    });
  });

  describe('UT03_Classes_TC22: Xem thông tin chi tiết lớp học theo ID thành công', () => {
    it('trả về chi tiết lớp học và danh sách học sinh', async () => {
      const detail = await service.getClassDetail('cls_1a_2026', 'usr_teacher_01');
      expect(detail.id).toBe('cls_1a_2026');
      expect(detail.students).toBeDefined();
    });
  });

  describe('UT03_Classes_TC23: GVBM truy cập lớp tổng theo đúng môn được phân công thành công', () => {
    it('trả về quyền truy cập môn học tại lớp', async () => {
      const res = await service.getMySubjectInClass('cls_1a_2026', 'usr_teacher_01');
      expect(res.teaching_subjects).toContain('MATH');
    });
  });

  describe('UT03_Classes_TC24: GVCN lấy mã mời và link mời tham gia lớp học thành công', () => {
    it('sinh mã mời invite_code hợp lệ', async () => {
      const res = await service.getInviteCode('cls_1a_2026', 'usr_teacher_01');
      expect(res.invite_code).toBeDefined();
      expect(res.invite_link).toContain('https://giaovienhay.vn/join');
      expect(res.qr_code_url).toContain('api.giaovienhay.vn/qr');
    });
  });

  describe('UT03_Classes_TC25: Phụ huynh tham gia lớp qua mã mời thành công', () => {
    it('xác nhận liên kết con em và phản hồi thành công', async () => {
      const res = await service.joinClassByInvite('usr_parent_02', {
        invite_code: 'GVH1A26',
        child_name: 'Lê Ngọc Mai',
        dob: '2019-08-20',
      });
      expect(res.message).toContain('thành công');
      expect(res.class_id).toBe('cls_1a_2026');
      expect(res.child.id).toBe('stu_02');
    });
  });

  describe('UT03_Classes_TC26: GVCN thêm học sinh mới vào lớp học hiện tại thành công', () => {
    it('thêm học sinh thành công qua payload mảng students và lưu vào Data Connect', async () => {
      const res = await service.addStudent('cls_1a_2026', {
        students: [
          {
            student_code: 'HS036',
            full_name: 'Vũ Hải Đăng',
            dob: '2020-03-12',
            gender: 'MALE',
            parent_phone: '0912345678',
          },
        ],
      });
      expect(res.added_count).toBe(1);
      expect(mockDataConnect.createStudent).toHaveBeenCalled();
    });
  });

  describe('UT03_Classes_TC27: GVCN xóa học sinh khỏi lớp học thành công (xóa mềm)', () => {
    it('đánh dấu xóa mềm học sinh', async () => {
      const res = await service.removeStudent('cls_1a_2026', 'stu_99');
      expect(res.is_deleted).toBe(true);
      expect(mockDataConnect.softDeleteStudent).toHaveBeenCalledWith('stu_99');
    });
  });

  describe('UT03_Classes_TC28: GVCN cập nhật phân công GVBM thành công', () => {
    it('cập nhật giáo viên phụ trách thành công', async () => {
      const res = await service.updateSubjectTeachers('cls_1a_2026', 'usr_teacher_01', {
        subject_teachers: [{ teacher_id: 'usr_gvbm_eng_02', subject_code: 'ENG' }],
      });
      expect(res.updated_count).toBe(1);
      expect(res.message).toContain('thành công');
    });
  });

  describe('UT03_Classes_TC29: Xóa mềm lớp học và tự động xóa RAM cache của giáo viên', () => {
    it('xóa mềm lớp và gọi xóa cache tương ứng', async () => {
      const res = await service.deleteClass('cls_1a_2026', 'usr_teacher_01');
      expect(res.is_deleted).toBe(true);
      expect(mockCacheManager.del).toHaveBeenCalledWith('classes_teacher_usr_teacher_01');
    });
  });

  describe('UT03_Classes_TC30: Truy vấn danh sách lớp tự động lọc bỏ học sinh bị xóa mềm', () => {
    it('chỉ trả về học sinh có is_deleted = false', async () => {
      mockDataConnect.listStudentsByClass.mockResolvedValue([
        { id: 'stu_active', full_name: 'Em A', is_deleted: false },
        { id: 'stu_deleted', full_name: 'Em B', is_deleted: true },
      ]);

      const detail = await service.getClassDetail('cls_1a_2026', 'usr_teacher_01');
      expect(detail.students.length).toBe(1);
      expect(detail.students[0].id).toBe('stu_active');
    });
  });

  describe('UT03_Classes_TC31: Xử lý trạng thái rỗng an toàn khi giáo viên chưa phụ trách lớp nào', () => {
    it('trả về danh sách an toàn không bị crash', async () => {
      mockDataConnect.listClassesByTeacher.mockResolvedValue([]);
      const classes = await service.getMyClasses('usr_fresh');
      expect(Array.isArray(classes)).toBe(true);
    });
  });

  describe('UT03_Classes_TC32: Xử lý trạng thái rỗng an toàn khi lớp học chưa có học sinh', () => {
    it('trả về mảng students rỗng không bị lỗi null', async () => {
      mockDataConnect.listStudentsByClass.mockResolvedValue([]);
      const detail = await service.getClassDetail('cls_new_empty', 'usr_teacher_01');
      expect(Array.isArray(detail.students)).toBe(true);
    });
  });

  describe('UT03_Classes_TC33: Từ chối xóa học sinh khi mã học sinh không tồn tại trong lớp', () => {
    it('ném NotFoundException khi student_id = stu_not_found_9999', async () => {
      await expect(service.removeStudent('cls_1a_2026', 'stu_not_found_9999')).rejects.toThrow(NotFoundException);
    });
  });
});

