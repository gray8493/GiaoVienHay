import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, randomPhone } from './app';
import { registerAndLogin, auth } from './helpers';

describe('E2E Admin (quản trị người dùng, lớp, trường, giới hạn hệ thống)', () => {
  let app: INestApplication;
  let admin: Awaited<ReturnType<typeof registerAndLogin>>;

  let createdUserId: string;
  let createdUserPhone: string;
  let createdSchoolId: string;

  beforeAll(async () => {
    app = await createTestApp();
    admin = await registerAndLogin(app, { role: 'ADMIN', full_name: 'Quản Trị Viên E2E' });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Quản lý người dùng', () => {
    it('liệt kê người dùng (bao gồm user seed)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/users')
        .set(auth(admin.accessToken))
        .expect(200);

      const data = res.body?.data ?? res.body;
      const users = data.items ?? data.users ?? data;
      expect(users.length).toBeGreaterThanOrEqual(5);
    });

    it('lọc theo vai trò TEACHER_HOMEROOM', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/users?role=TEACHER_HOMEROOM')
        .set(auth(admin.accessToken))
        .expect(200);

      const data = res.body?.data ?? res.body;
      const users = data.items ?? data.users ?? data;
      for (const u of users) {
        expect(u.role).toBe('TEACHER_HOMEROOM');
      }
    });

    it('tạo người dùng mới → 201', async () => {
      const phone = randomPhone();
      const res = await request(app.getHttpServer())
        .post('/api/v1/admin/users')
        .set(auth(admin.accessToken))
        .send({
          full_name: 'User Admin Tạo',
          phone,
          role: 'PARENT',
          email: `parent-${phone}@example.com`,
        })
        .expect(201);

      const data = res.body?.data ?? res.body;
      createdUserId = data.id || data.user_id;
      createdUserPhone = phone;
      expect(createdUserId).toBeDefined();
    });

    it('tạo người dùng thiếu role → 400', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/admin/users')
        .set(auth(admin.accessToken))
        .send({ full_name: 'Thiếu Role', phone: randomPhone() })
        .expect(400);

      expect(res.body.error_code).toBe('COMMON_VALIDATION_ERROR');
    });

    it('khóa tài khoản → 200, đăng nhập bị từ chối 401 AUTH_ACCOUNT_LOCKED', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/admin/users/${createdUserId}/status`)
        .set(auth(admin.accessToken))
        .send({ is_active: false, reason: 'Vi phạm quy định' })
        .expect(200);

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ phone: createdUserPhone, password: 'MatKhau123@' })
        .expect(401);

      expect(res.body.error_code).toBe('AUTH_ACCOUNT_LOCKED');
    });

    // LƯU Ý: chạy sau test khóa vì PUT /admin/users/:id hiện đang ghi đè
    // phone/email bằng undefined khi payload thiếu 2 trường này (bug API).
    it('cập nhật người dùng → 200', async () => {
      await request(app.getHttpServer())
        .put(`/api/v1/admin/users/${createdUserId}`)
        .set(auth(admin.accessToken))
        .send({ full_name: 'User Đã Đổi Tên', phone: createdUserPhone, email: `parent-${createdUserPhone}@example.com` })
        .expect(200);
    });

    it('cập nhật hạn mức AI → 200', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/admin/users/${createdUserId}/ai-quota`)
        .set(auth(admin.accessToken))
        .send({ ai_daily_quota: 55, ai_model_tier: 'PRO' })
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });

  describe('Quản lý lớp & trường', () => {
    it('liệt kê lớp toàn hệ thống (bao gồm lớp seed)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/classes')
        .set(auth(admin.accessToken))
        .expect(200);

      const data = res.body?.data ?? res.body;
      const items = data.items ?? data.classes ?? data;
      expect(items.length).toBeGreaterThanOrEqual(2);
    });

    it('tạo trường mới → 201, xóa trường → 200', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/api/v1/admin/schools')
        .set(auth(admin.accessToken))
        .send({ name: 'Trường E2E Mới', type: 'PRIMARY' })
        .expect(201);

      const data = createRes.body?.data ?? createRes.body;
      createdSchoolId = data.id || data.school_id;
      expect(createdSchoolId).toBeDefined();

      await request(app.getHttpServer())
        .delete(`/api/v1/admin/schools/${createdSchoolId}`)
        .set(auth(admin.accessToken))
        .expect(200);
    });

    it('liệt kê trường học', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/schools')
        .set(auth(admin.accessToken))
        .expect(200);

      const data = res.body?.data ?? res.body;
      const schools = data.items ?? data.schools ?? data;
      expect(schools.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Giới hạn hệ thống & thống kê', () => {
    it('đọc giới hạn hệ thống → 200', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/system-limits')
        .set(auth(admin.accessToken))
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('cập nhật giới hạn hệ thống → 200', async () => {
      const res = await request(app.getHttpServer())
        .put('/api/v1/admin/system-limits')
        .set(auth(admin.accessToken))
        .send({ max_students_per_class: 45 })
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('thống kê dashboard → 200', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/dashboard-stats')
        .set(auth(admin.accessToken))
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });
});
