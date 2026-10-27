import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, randomPhone, TEST_PASSWORD } from './app';
import { registerAndLogin, loginUser, auth } from './helpers';

describe('E2E Auth (đăng ký, đăng nhập, token, đổi mật khẩu)', () => {
  let app: INestApplication;
  let teacher: Awaited<ReturnType<typeof registerAndLogin>>;

  beforeAll(async () => {
    app = await createTestApp();
    teacher = await registerAndLogin(app, {
      role: 'TEACHER_HOMEROOM',
      full_name: 'Cô Giáo E2E',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Đăng ký — validation DTO', () => {
    it('từ chối khi thiếu full_name (400 COMMON_VALIDATION_ERROR)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ phone: randomPhone(), password: TEST_PASSWORD, role: 'PARENT' })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error_code).toBe('COMMON_VALIDATION_ERROR');
      expect(res.body.details).toEqual(
        expect.arrayContaining([expect.objectContaining({ field: 'full_name' })]),
      );
    });

    it('từ chối SĐT sai định dạng (400 COMMON_VALIDATION_ERROR)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ full_name: 'Người Dùng', phone: '12345', password: TEST_PASSWORD, role: 'PARENT' })
        .expect(400);

      expect(res.body.error_code).toBe('COMMON_VALIDATION_ERROR');
      expect(res.body.details).toEqual(
        expect.arrayContaining([expect.objectContaining({ field: 'phone' })]),
      );
    });

    it('từ chối mật khẩu yếu (400 COMMON_VALIDATION_ERROR)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ full_name: 'Người Dùng', phone: randomPhone(), password: 'abc', role: 'PARENT' })
        .expect(400);

      expect(res.body.error_code).toBe('COMMON_VALIDATION_ERROR');
      expect(res.body.details).toEqual(
        expect.arrayContaining([expect.objectContaining({ field: 'password' })]),
      );
    });

    it('bắt buộc school_name với giáo viên (400)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          full_name: 'Thầy Thiếu Trường',
          phone: randomPhone(),
          password: TEST_PASSWORD,
          role: 'TEACHER_HOMEROOM',
          teaching_subjects: ['MATH'],
        })
        .expect(400);

      expect(res.body.error_code).toBe('COMMON_VALIDATION_ERROR');
      expect(res.body.details).toEqual(
        expect.arrayContaining([expect.objectContaining({ field: 'school_name' })]),
      );
    });

    it('bắt buộc teaching_subjects với giáo viên (400)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          full_name: 'Thầy Thiếu Môn',
          phone: randomPhone(),
          password: TEST_PASSWORD,
          role: 'TEACHER_SUBJECT',
          school_name: 'Trường Tiểu Học Chu Văn An',
        })
        .expect(400);

      expect(res.body.error_code).toBe('COMMON_VALIDATION_ERROR');
      expect(res.body.details).toEqual(
        expect.arrayContaining([expect.objectContaining({ field: 'teaching_subjects' })]),
      );
    });

    it('từ chối role không hợp lệ (400)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ full_name: 'Người Dùng', phone: randomPhone(), password: TEST_PASSWORD, role: 'HACKER' })
        .expect(400);

      expect(res.body.error_code).toBe('COMMON_VALIDATION_ERROR');
      expect(res.body.details).toEqual(
        expect.arrayContaining([expect.objectContaining({ field: 'role' })]),
      );
    });
  });

  describe('Đăng ký — luồng thành công & xung đột', () => {
    it('đăng ký giáo viên thành công, trả về user + token', () => {
      expect(teacher.user).toMatchObject({
        full_name: 'Cô Giáo E2E',
        role: 'TEACHER_HOMEROOM',
        phone: teacher.phone,
      });
      expect(teacher.refreshToken).toBeDefined();
    });

    it('từ chối SĐT đã tồn tại (409 USER_PHONE_EXISTS)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          full_name: 'Người Dùng Trùng',
          phone: teacher.phone,
          password: TEST_PASSWORD,
          role: 'PARENT',
        })
        .expect(409);

      expect(res.body.error_code).toBe('USER_PHONE_EXISTS');
    });
  });

  describe('Đăng nhập', () => {
    it('sai mật khẩu → 401 AUTH_INVALID_CREDENTIALS', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ phone: teacher.phone, password: 'SaiMatKhau1@' })
        .expect(401);

      expect(res.body.error_code).toBe('AUTH_INVALID_CREDENTIALS');
    });

    it('SĐT chưa đăng ký → 401 AUTH_INVALID_CREDENTIALS', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ phone: randomPhone(), password: TEST_PASSWORD })
        .expect(401);

      expect(res.body.error_code).toBe('AUTH_INVALID_CREDENTIALS');
    });

    it('thiếu mật khẩu → 400 COMMON_VALIDATION_ERROR', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ phone: teacher.phone })
        .expect(400);

      expect(res.body.error_code).toBe('COMMON_VALIDATION_ERROR');
    });

    it('đăng nhập đúng thông tin → 200 kèm token, /users/me khớp user', async () => {
      const body = await loginUser(app, teacher.phone, teacher.password);
      const data = body.data ?? body;
      expect(data.access_token).toBeDefined();
      expect(data.user.role).toBe('TEACHER_HOMEROOM');

      const me = await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set(auth(data.access_token))
        .expect(200);

      const meData = me.body?.data ?? me.body;
      expect(meData.role).toBe('TEACHER_HOMEROOM');
      expect(meData.phone).toBe(teacher.phone);
    });
  });

  describe('Refresh token', () => {
    it('làm mới access token bằng refresh token hợp lệ', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh-token')
        .send({ refresh_token: teacher.refreshToken })
        .expect(200);

      const data = res.body?.data ?? res.body;
      expect(data.access_token).toBeDefined();
      expect(data.refresh_token).toBeDefined();
    });

    it('refresh token rác → 401', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh-token')
        .send({ refresh_token: 'token_rac_khong_hop_le' })
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  describe('Đổi mật khẩu & đăng xuất', () => {
    const NEW_PASSWORD = 'MatKhauMoi456@';

    it('đổi mật khẩu sai mật khẩu hiện tại → lỗi', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/change-password')
        .set(auth(teacher.accessToken))
        .send({ current_password: 'SaiMatKhau1@', new_password: NEW_PASSWORD })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('đổi mật khẩu thành công, đăng nhập bằng mật khẩu mới', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/change-password')
        .set(auth(teacher.accessToken))
        .send({ current_password: teacher.password, new_password: NEW_PASSWORD })
        .expect(200);

      await loginUser(app, teacher.phone, teacher.password, 401);

      const body = await loginUser(app, teacher.phone, NEW_PASSWORD);
      const data = body.data ?? body;
      expect(data.access_token).toBeDefined();
      teacher.accessToken = data.access_token;
    });

    it('không có token → 401 AUTH_UNAUTHORIZED', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .send({})
        .expect(401);

      expect(res.body.error_code).toBe('AUTH_UNAUTHORIZED');
    });

    it('đăng xuất với token hợp lệ → 200', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set(auth(teacher.accessToken))
        .send({})
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });

  describe('Firebase verify (OTP)', () => {
    it('id_token hợp lệ trả về token truy cập', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/firebase-verify')
        .send({ id_token: 'firebase_id_token_e2e' })
        .expect(200);

      const data = res.body?.data ?? res.body;
      expect(data.access_token).toBeDefined();
    });

    it('thiếu id_token → 400 COMMON_VALIDATION_ERROR', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/firebase-verify')
        .send({})
        .expect(400);

      expect(res.body.error_code).toBe('COMMON_VALIDATION_ERROR');
    });
  });
});
