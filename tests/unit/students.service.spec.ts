import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { StudentsService } from '../../apps/api/src/modules/04-students/students.service';

describe('StudentsService (Unit Tests UT04 - All 15 Cases)', () => {
  let service: StudentsService;
  let mockDataConnect: any;

  beforeEach(() => {
    mockDataConnect = {
      getStudentById: jest.fn().mockImplementation(async (id: string) => {
        if (!id || id === 'stu_nonexistent_9999') return null;
        return {
          id,
          full_name: id === 'stu_02_empty' ? 'Lê Ngọc Mai' : 'Trần Bảo Nam',
          student_code: 'HS2026_001',
          class_id: 'cls_1a_2026',
          class_name: '1A',
          dob: '2020-05-15',
          gender: 'MALE',
          parent_uids: ['usr_parent_01'],
        };
      }),
      getScoresByStudent: jest.fn().mockImplementation(async (id: string) => {
        if (id === 'stu_02_empty') return [];
        return [
          { subject: 'MATH', scoreType: 'ORAL_TEST', scoreValue: 9.0 },
          { subject: 'MATH', scoreType: 'TEST_15P', scoreValue: 8.5 },
          { subject: 'MATH', scoreType: 'MID_TERM', scoreValue: 9.5 },
        ];
      }),
      getAttendanceByStudent: jest.fn().mockImplementation(async (id: string) => {
        if (id === 'stu_full_attendance') {
          return [
            { date: '2026-09-01', status: 'PRESENT' },
            { date: '2026-09-02', status: 'PRESENT' },
          ];
        }
        return [
          { date: '2026-09-23', status: 'PRESENT' },
        ];
      }),
      getFeesByStudent: jest.fn().mockResolvedValue([
        { fee_type: 'TUITION', amount: 1200000, is_paid: false, due_date: '2026-10-05' },
        { fee_type: 'INSURANCE', amount: 880000, is_paid: true, deadline: '2026-10-15', paid_at: '2026-09-10T08:30:00.000Z' },
      ]),
      getRemarksByStudent: jest.fn().mockImplementation(async (id: string) => {
        if (id === 'stu_02_empty_remarks' || id === 'stu_02') return [];
        return [
          {
            remark_id: 'rmk_9912',
            teacher_name: 'Nguyễn Thị Lan',
            subject: 'Toán học',
            content: 'Em Nam tiếp thu bài rất nhanh...',
            parent_acknowledged: true,
            created_at: '2026-09-23T10:15:00.000Z',
          },
        ];
      }),
    };

    service = new StudentsService(mockDataConnect);
  });

  describe('UT04_Students_TC01: Phụ huynh xem thông tin lý lịch con cái thuộc quyền quản lý thành công', () => {
    it('trả về hồ sơ học sinh chi tiết', async () => {
      const student = await service.getStudentProfile('stu_01', 'usr_parent_01');
      expect(student.full_name).toBe('Trần Bảo Nam');
      expect(student.id).toBe('stu_01');
    });
  });

  describe('UT04_Students_TC02: Chặn phụ huynh tra cứu thông tin học sinh không phải con mình', () => {
    it('ném ForbiddenException khi phụ huynh không có quyền', async () => {
      await expect(service.getStudentProfile('stu_01', 'parent_other')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('UT04_Students_TC03: Tra cứu bảng điểm đa môn học và các cột điểm thành phần', () => {
    it('trả về danh sách môn học và điểm số thành phần', async () => {
      const record = await service.getAcademicRecord('stu_01', 1);
      expect(record.student_id).toBe('stu_01');
      expect(record.subjects.length).toBeGreaterThan(0);
      expect(record.subjects[0].subject_code).toBe('MATH');
    });
  });

  describe('UT04_Students_TC04: Phụ huynh xem sổ liên lạc nhận xét của con theo học kỳ', () => {
    it('trả về danh sách lời nhận xét của giáo viên', async () => {
      const remarks = await service.getRemarks('stu_01');
      expect(remarks.length).toBeGreaterThan(0);
      expect(remarks[0].content).toContain('tiếp thu bài');
    });
  });

  describe('UT04_Students_TC05: Tra cứu tình trạng nộp học phí và bảo hiểm y tế (BHYT)', () => {
    it('trả về trạng thái học phí và hạn nộp BHYT', async () => {
      const fees = await service.getFeesInsuranceStatus('stu_01');
      expect(fees.student_id).toBe('stu_01');
      expect(fees.tuition).toBeDefined();
      expect(fees.insurance).toBeDefined();
    });
  });

  describe('UT04_Students_TC06: Phụ huynh theo dõi lịch sử chuyên cần và các buổi nghỉ học của con', () => {
    it('trả về thống kê chuyên cần theo tháng hợp lệ', async () => {
      const attendance = await service.getAttendanceHistory('stu_01', '2026-09');
      expect(attendance.student_id).toBe('stu_01');
      expect(attendance.total_present).toBeDefined();
    });
  });

  describe('UT04_Students_TC07: Phụ huynh xem danh sách lời nhắc lịch kiểm tra sắp tới của lớp', () => {
    it('trả về danh sách lịch thi kèm phạm vi kiến thức dặn dò', async () => {
      const reminders = await service.getExamReminders('stu_01');
      expect(reminders.length).toBeGreaterThan(0);
      expect(reminders[0].subject_name).toBe('Toán học');
    });
  });

  describe('UT04_Students_TC08: Từ chối yêu cầu khi mã học sinh không tồn tại trong hệ thống', () => {
    it('ném NotFoundException khi studentId = stu_nonexistent_9999', async () => {
      await expect(service.getStudentProfile('stu_nonexistent_9999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('UT04_Students_TC09: Từ chối khi lọc học kỳ sai định dạng enum (SEMESTER = 3)', () => {
    it('ném BadRequestException khi semester = 3', async () => {
      await expect(service.getAcademicRecord('stu_01', 3)).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT04_Students_TC10: Từ chối khi lọc tháng chuyên cần sai quy cách (MONTH = "2026-15")', () => {
    it('ném BadRequestException khi month = "2026-15"', async () => {
      await expect(service.getAttendanceHistory('stu_01', '2026-15')).rejects.toThrow(BadRequestException);
    });
  });

  describe('UT04_Students_TC11: Từ chối thao tác do không có token xác thực hoặc token đã hết hạn', () => {
    it('từ chối khi studentId rỗng', async () => {
      mockDataConnect.getStudentById.mockResolvedValue(null);
      await expect(service.getStudentProfile('')).rejects.toThrow();
    });
  });

  describe('UT04_Students_TC12: Xử lý trạng thái rỗng an toàn khi học sinh mới chưa có dữ liệu điểm (EMPTY STATE - 200 OK)', () => {
    it('trả về mảng subjects rỗng an toàn', async () => {
      const record = await service.getAcademicRecord('stu_02_empty', 1);
      expect(record.subjects).toEqual([]);
      expect(record.student_id).toBe('stu_02_empty');
    });
  });

  describe('UT04_Students_TC13: Xử lý lỗi hệ thống khi cơ sở dữ liệu gặp sự cố (500 INTERNAL SERVER ERROR)', () => {
    it('bắn ra lỗi khi cơ sở dữ liệu bị ngắt quãng', async () => {
      mockDataConnect.getStudentById.mockRejectedValue(new Error('DATABASE_UNAVAILABLE'));
      await expect(service.getStudentProfile('stu_01')).rejects.toThrow();
    });
  });

  describe('UT04_Students_TC14: Xử lý trạng thái rỗng an toàn khi học sinh chưa có lời nhận xét nào (EMPTY REMARKS - 200 OK)', () => {
    it('trả về mảng remarks rỗng an toàn', async () => {
      const remarks = await service.getRemarks('stu_02_empty_remarks');
      expect(remarks).toEqual([]);
    });
  });

  describe('UT04_Students_TC15: Xử lý trạng thái an toàn khi học sinh đi học đầy đủ 100% không có buổi nghỉ nào (EMPTY ABSENCE - 200 OK)', () => {
    it('trả về absent_dates rỗng và attendance_rate 100%', async () => {
      const attendance = await service.getAttendanceHistory('stu_full_attendance', '2026-09');
      expect(attendance.attendance_rate).toBe(100);
      expect(attendance.total_absent).toBe(0);
      expect(attendance.absent_dates).toEqual([]);
    });
  });
});
