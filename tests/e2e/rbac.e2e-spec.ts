import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './app';
import { registerAndLogin, auth } from './helpers';

describe('E2E RBAC (phân quyền theo vai trò)', () => {
  let app: INestApplication;
  let teacher: Awaited<ReturnType<typeof registerAndLogin>>;
  let parent: Awaited<ReturnType<typeof registerAndLogin>>;

  beforeAll(async () => {
    app = await createTestApp();
    teacher = await registerAndLogin(app, { role: 'TEACHER_HOMEROOM', full_name: 'Cô RBAC' });
    parent = await registerAndLogin(app, { role: 'PARENT', full_name: 'Phụ Huynh RBAC' });
  });

  afterAll(async () => {
    await app.close();
  });

  it('thiếu token → 401 AUTH_UNAUTHORIZED', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/classes').expect(401);
    expect(res.body.error_code).toBe('AUTH_UNAUTHORIZED');
  });

  it('token rác → 401 AUTH_UNAUTHORIZED', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/classes')
      .set(auth('token_rac'))
      .expect(401);
    expect(res.body.error_code).toBe('AUTH_UNAUTHORIZED');
  });

  it('phụ huynh bị chặn khỏi endpoint quản lý lớp (403 AUTH_ROLE_FORBIDDEN)', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/classes')
      .set(auth(parent.accessToken))
      .expect(403);
    expect(res.body.error_code).toBe('AUTH_ROLE_FORBIDDEN');
  });

  it('phụ huynh bị chặn khỏi endpoint điểm danh (403)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/attendance/submit')
      .set(auth(parent.accessToken))
      .send({ class_id: 'cls_nao_do', attendance_date: '2026-10-27', records: [] })
      .expect(403);
    expect(res.body.error_code).toBe('AUTH_ROLE_FORBIDDEN');
  });

  it('phụ huynh bị chặn khỏi endpoint nhập điểm (403)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/grades/batch')
      .set(auth(parent.accessToken))
      .send({
        class_id: 'cls_nao_do',
        subject_code: 'MATH',
        score_type: 'TEST_15P',
        scores: [],
      })
      .expect(403);
    expect(res.body.error_code).toBe('AUTH_ROLE_FORBIDDEN');
  });

  it('giáo viên bị chặn khỏi endpoint quản trị (403 AUTH_ROLE_FORBIDDEN)', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/admin/users')
      .set(auth(teacher.accessToken))
      .expect(403);
    expect(res.body.error_code).toBe('AUTH_ROLE_FORBIDDEN');
  });

  it('phụ huynh bị chặn khỏi endpoint quản trị (403)', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/admin/dashboard-stats')
      .set(auth(parent.accessToken))
      .expect(403);
    expect(res.body.error_code).toBe('AUTH_ROLE_FORBIDDEN');
  });

  it('phụ huynh vẫn truy cập được endpoint công khai có auth (users/me)', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/users/me')
      .set(auth(parent.accessToken))
      .expect(200);
    expect(res.body.success).toBe(true);
  });
});
