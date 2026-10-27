import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './app';
import { registerAndLogin, auth } from './helpers';

describe('E2E Notifications (nhật ký thông báo)', () => {
  let app: INestApplication;
  let user: Awaited<ReturnType<typeof registerAndLogin>>;

  beforeAll(async () => {
    app = await createTestApp();
    user = await registerAndLogin(app, { role: 'PARENT', full_name: 'Phụ Huynh Thông Báo' });
  });

  afterAll(async () => {
    await app.close();
  });

  it('danh sách thông báo rỗng với user mới', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/notifications')
      .set(auth(user.accessToken))
      .expect(200);

    const data = res.body?.data ?? res.body;
    expect(data.total).toBe(0);
    expect(data.items).toEqual([]);
    expect(data.unread_count).toBe(0);
  });

  it('đọc thông báo không tồn tại → 404 NOTI_NOT_FOUND', async () => {
    const res = await request(app.getHttpServer())
      .patch('/api/v1/notifications/noti_khong_co/read')
      .set(auth(user.accessToken))
      .expect(404);

    expect(res.body.error_code).toBe('NOTI_NOT_FOUND');
  });

  it('đọc tất cả thông báo → 200', async () => {
    const res = await request(app.getHttpServer())
      .patch('/api/v1/notifications/read-all')
      .set(auth(user.accessToken))
      .expect(200);

    const data = res.body?.data ?? res.body;
    expect(data.updated_count).toBe(0);
  });

  it('bộ lọc is_read sai kiểu → 400 COMMON_VALIDATION_ERROR', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/notifications?is_read=khong-phai-boolean')
      .set(auth(user.accessToken))
      .expect(400);

    expect(res.body.error_code).toBe('COMMON_VALIDATION_ERROR');
  });
});
