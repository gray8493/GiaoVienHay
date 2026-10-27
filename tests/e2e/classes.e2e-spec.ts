import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, randomPhone } from './app';
import { registerAndLogin, auth, createClassWithStudents, getClassDetail } from './helpers';

describe('E2E Classes & Students (GVCN quản lý lớp, phụ huynh tham gia)', () => {
  let app: INestApplication;
  let teacher: Awaited<ReturnType<typeof registerAndLogin>>;
  let engTeacher: Awaited<ReturnType<typeof registerAndLogin>>;
  let outsiderTeacher: Awaited<ReturnType<typeof registerAndLogin>>;
  let parent: Awaited<ReturnType<typeof registerAndLogin>>;

  let classId: string;
  let inviteCode: string;
  let studentIds: string[] = [];

  beforeAll(async () => {
    app = await createTestApp();
    teacher = await registerAndLogin(app, { role: 'TEACHER_HOMEROOM', full_name: 'Cô Chủ Nhiệm' });
    engTeacher = await registerAndLogin(app, {
      role: 'TEACHER_SUBJECT',
      full_name: 'Cô Anh Văn',
      teaching_subjects: ['ENG'],
    });
    outsiderTeacher = await registerAndLogin(app, {
      role: 'TEACHER_SUBJECT',
      full_name: 'Thầy Ngoài Cuộc',
      teaching_subjects: ['LIT'],
    });
    parent = await registerAndLogin(app, { role: 'PARENT', full_name: 'Phụ Huynh E2E' });

    const created = await createClassWithStudents(app, teacher.accessToken, {
      students: [
        { full_name: 'Học Sinh Một', student_code: 'HS-E2E-001', gender: 'MALE', parent_phone: parent.phone },
        { full_name: 'Học Sinh Hai', student_code: 'HS-E2E-002', gender: 'FEMALE' },
      ],
    });
    classId = created.id || created.class_id;
    expect(classId).toBeDefined();

    const detail = await getClassDetail(app, teacher.accessToken, classId);
    studentIds = (detail.students || []).map((s: any) => s.id || s.student_id);
    expect(studentIds).toHaveLength(2);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Tạo & liệt kê lớp', () => {
    it('tạo lớp học thành công với đầy đủ thông tin', async () => {
      const detail = await getClassDetail(app, teacher.accessToken, classId);
      expect(detail.name).toBe('Lớp 5A E2E');
      expect(detail.grade_level).toBe(5);
      expect(detail.academic_year).toBe('2025-2026');
      expect(detail.students).toHaveLength(2);
    });

    it('tạo lớp thiếu name → 400 COMMON_VALIDATION_ERROR', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/classes')
        .set(auth(teacher.accessToken))
        .send({ grade_level: 5, academic_year: '2025-2026' })
        .expect(400);

      expect(res.body.error_code).toBe('COMMON_VALIDATION_ERROR');
      expect(res.body.details).toEqual(
        expect.arrayContaining([expect.objectContaining({ field: 'name' })]),
      );
    });

    it('tạo lớp grade_level vượt 1-9 → 400', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/classes')
        .set(auth(teacher.accessToken))
        .send({ name: 'Lớp 99', grade_level: 99, academic_year: '2025-2026' })
        .expect(400);

      expect(res.body.error_code).toBe('COMMON_VALIDATION_ERROR');
    });

    it('liệt kê danh sách lớp của giáo viên', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/classes')
        .set(auth(teacher.accessToken))
        .expect(200);

      const data = res.body?.data ?? res.body;
      expect(data.classes).toEqual(
        expect.arrayContaining([expect.objectContaining({ name: 'Lớp 5A E2E' })]),
      );
    });

    it('GET /classes/my-classes trả về vai trò HOMEROOM', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/classes/my-classes')
        .set(auth(teacher.accessToken))
        .expect(200);

      const data = res.body?.data ?? res.body;
      const classes = data.data?.classes ?? data.classes ?? [];
      const myClass = classes.find((c: any) => (c.id || c.class_id) === classId);
      expect(myClass).toBeDefined();
      expect(myClass.role_in_class).toBe('HOMEROOM');
    });
  });

  describe('Quản lý học sinh trong lớp', () => {
    it('thêm học sinh hàng loạt → 201', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/classes/${classId}/students`)
        .set(auth(teacher.accessToken))
        .send({
          students: [
            { full_name: 'Học Sinh Ba', student_code: 'HS-E2E-003', gender: 'MALE', dob: '2017-05-10', parent_phone: '0987000003' },
            { full_name: 'Học Sinh Bốn', student_code: 'HS-E2E-004', gender: 'FEMALE', dob: '2017-06-11', parent_phone: '0987000004' },
          ],
        })
        .expect(201);

      expect(res.body.success).toBe(true);
    });

    it('thêm học sinh thiếu full_name → 400', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/classes/${classId}/students`)
        .set(auth(teacher.accessToken))
        .send({ students: [{ student_code: 'HS-X' }] })
        .expect(400);

      expect(res.body.error_code).toBe('COMMON_VALIDATION_ERROR');
    });

    it('đổi tên học sinh → 200', async () => {
      await request(app.getHttpServer())
        .put(`/api/v1/classes/${classId}/students/${studentIds[0]}`)
        .set(auth(teacher.accessToken))
        .send({ full_name: 'Học Sinh Một Đổi Tên' })
        .expect(200);

      const detail = await getClassDetail(app, teacher.accessToken, classId);
      const renamed = (detail.students || []).find(
        (s: any) => (s.id || s.student_id) === studentIds[0],
      );
      expect(renamed.full_name).toBe('Học Sinh Một Đổi Tên');
    });

    it('xóa học sinh khỏi lớp → 200', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/classes/${classId}/students/${studentIds[1]}`)
        .set(auth(teacher.accessToken))
        .expect(200);

      const detail = await getClassDetail(app, teacher.accessToken, classId);
      const remaining = (detail.students || []).filter(
        (s: any) => !(s as any).is_deleted && !(s as any).isDeleted,
      );
      expect(remaining.length).toBeLessThan(4);
    });
  });

  describe('Mời tham gia lớp', () => {
    it('lấy mã mời của lớp', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/classes/${classId}/invite`)
        .set(auth(teacher.accessToken))
        .expect(200);

      const data = res.body?.data ?? res.body;
      expect(data.invite_code).toBeDefined();
      inviteCode = data.invite_code;
    });

    it('xem trước thông tin lớp bằng mã mời', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/classes/preview-invite/${inviteCode}`)
        .set(auth(teacher.accessToken))
        .expect(200);

      const data = res.body?.data ?? res.body;
      expect(data.name).toBe('Lớp 5A E2E');
    });

    it('mã mời không tồn tại → 404', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/classes/preview-invite/MAKHONGCO')
        .set(auth(teacher.accessToken))
        .expect(404);

      expect(res.body.success).toBe(false);
    });

    it('phụ huynh tham gia lớp bằng mã mời', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/classes/join')
        .set(auth(parent.accessToken))
        .send({ invite_code: inviteCode, child_name: 'Học Sinh Một Đổi Tên', relationship: 'Mẹ' })
        .expect(201);

      expect(res.body.success).toBe(true);
    });

    it('phụ huynh xem được hồ sơ con đã liên kết', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/students/${studentIds[0]}`)
        .set(auth(parent.accessToken))
        .expect(200);

      const data = res.body?.data ?? res.body;
      expect(data.full_name).toBe('Học Sinh Một Đổi Tên');
    });

    it('phụ huynh bị chặn xem hồ sơ học sinh không liên kết (403)', async () => {
      const otherStudentId = (await getClassDetail(app, teacher.accessToken, classId)).students.find(
        (s: any) => (s.id || s.student_id) !== studentIds[0] && !(s as any).is_deleted,
      );
      if (!otherStudentId) return; // không còn học sinh khác để kiểm tra

      const res = await request(app.getHttpServer())
        .get(`/api/v1/students/${otherStudentId.id || otherStudentId.student_id}`)
        .set(auth(parent.accessToken))
        .expect(403);

      expect(res.body.error_code).toBe('FORBIDDEN_STUDENT_ACCESS');
    });
  });

  describe('Phân công giáo viên bộ môn', () => {
    it('phân công GVBM Tiếng Anh → 200', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/v1/classes/${classId}/subject-teachers`)
        .set(auth(teacher.accessToken))
        .send({ subject_teachers: [{ teacher_id: engTeacher.user.id, subject_code: 'ENG' }] })
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('GVBM được phân công xem được môn của mình', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/classes/${classId}/my-subject`)
        .set(auth(engTeacher.accessToken))
        .expect(200);

      const data = res.body?.data ?? res.body;
      expect(data.teaching_subjects).toContain('ENG');
    });

    it('giáo viên không được phân công bị từ chối (403 ACAD_NOT_ASSIGNED_TEACHER)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/classes/${classId}/my-subject`)
        .set(auth(outsiderTeacher.accessToken))
        .expect(403);

      expect(res.body.error_code).toBe('ACAD_NOT_ASSIGNED_TEACHER');
    });

    it('GVBM không phải chủ nhiệm không xóa được lớp (403)', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/v1/classes/${classId}`)
        .set(auth(engTeacher.accessToken))
        .expect(403);

      expect(res.body.error_code).toBe('CLASS_NOT_HOMEROOM_TEACHER');
    });
  });

  describe('Tra cứu hồ sơ học sinh', () => {
    it('xem hồ sơ học sinh bằng token giáo viên', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/students/${studentIds[0]}`)
        .set(auth(teacher.accessToken))
        .expect(200);

      const data = res.body?.data ?? res.body;
      expect(data.student_id || data.id).toBeDefined();
    });

    it('hồ sơ không tồn tại → 404 STUDENT_NOT_FOUND', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/students/stu_khong_ton_tai')
        .set(auth(teacher.accessToken))
        .expect(404);

      expect(res.body.error_code).toBe('STUDENT_NOT_FOUND');
    });

    it('tra cứu bảng điểm học tập với semester không hợp lệ → 400', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/students/${studentIds[0]}/academic?semester=9`)
        .set(auth(teacher.accessToken))
        .expect(400);

      expect(res.body.error_code).toBe('COMMON_VALIDATION_ERROR');
    });

    it('tra cứu điểm danh tháng sai định dạng → 400', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/students/${studentIds[0]}/attendance?month=2026-99`)
        .set(auth(teacher.accessToken))
        .expect(400);

      expect(res.body.error_code).toBe('COMMON_VALIDATION_ERROR');
    });
  });
});
