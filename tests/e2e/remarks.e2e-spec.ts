import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './app';
import { registerAndLogin, auth, createClassWithStudents, getClassDetail } from './helpers';

describe('E2E Remarks (nhận xét học sinh & phụ huynh xác nhận)', () => {
  let app: INestApplication;
  let teacher: Awaited<ReturnType<typeof registerAndLogin>>;
  let parent: Awaited<ReturnType<typeof registerAndLogin>>;

  let classId: string;
  let studentIds: string[] = [];

  beforeAll(async () => {
    app = await createTestApp();
    teacher = await registerAndLogin(app, { role: 'TEACHER_HOMEROOM', full_name: 'Cô Nhận Xét' });
    parent = await registerAndLogin(app, { role: 'PARENT', full_name: 'Phụ Huynh Nhận Xét' });

    const created = await createClassWithStudents(app, teacher.accessToken, {
      students: [
        { full_name: 'Bé Ngoan', student_code: 'RM-001', gender: 'MALE', parent_phone: parent.phone },
        { full_name: 'Bé Nghịch', student_code: 'RM-002', gender: 'FEMALE' },
      ],
    });
    classId = created.id || created.class_id;
    const detail = await getClassDetail(app, teacher.accessToken, classId);
    studentIds = (detail.students || []).map((s: any) => s.id || s.student_id);
    expect(studentIds).toHaveLength(2);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Tạo nhận xét', () => {
    it('tạo nhận xét thành công → 201', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/remarks')
        .set(auth(teacher.accessToken))
        .send({
          student_id: studentIds[0],
          class_id: classId,
          content: 'Bé ngoan, chăm phát biểu xây dựng bài.',
        })
        .expect(201);

      const data = res.body?.data ?? res.body;
      expect(data.remark_id).toBeDefined();
      expect(data.student_id).toBe(studentIds[0]);
      expect(data.content).toContain('Bé ngoan');
    });

    it('từ chối nội dung rỗng (400 REMARK_CONTENT_EMPTY)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/remarks')
        .set(auth(teacher.accessToken))
        .send({ student_id: studentIds[0], class_id: classId, content: '   ' })
        .expect(400);

      expect(res.body.error_code).toBe('REMARK_CONTENT_EMPTY');
    });

    it('từ chối thiếu student_id (400 COMMON_VALIDATION_ERROR)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/remarks')
        .set(auth(teacher.accessToken))
        .send({ class_id: classId, content: 'Nhận xét thiếu học sinh' })
        .expect(400);

      expect(res.body.error_code).toBe('COMMON_VALIDATION_ERROR');
    });
  });

  describe('Tra cứu nhận xét', () => {
    it('danh sách nhận xét của học sinh', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/remarks/student/${studentIds[0]}`)
        .set(auth(teacher.accessToken))
        .expect(200);

      const data = res.body?.data ?? res.body;
      expect(data.student_id).toBe(studentIds[0]);
      expect(data.total).toBeGreaterThanOrEqual(1);
      expect(data.items[0].content).toContain('Bé ngoan');
    });

    it('danh sách nhận xét của cả lớp', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/remarks/class/${classId}`)
        .set(auth(teacher.accessToken))
        .expect(200);

      const data = res.body?.data ?? res.body;
      expect(data.class_id).toBe(classId);
      expect(data.total).toBeGreaterThanOrEqual(1);
    });

    it('phụ huynh xem nhận xét của con qua cổng học sinh', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/students/${studentIds[0]}/remarks?semester=1`)
        .set(auth(parent.accessToken))
        .expect(200);

      const data = res.body?.data ?? res.body;
      expect(data.student_id || data.studentId).toBe(studentIds[0]);
    });
  });
});
