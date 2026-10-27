import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './app';

describe('E2E Health Check', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/health trả về trạng thái UP với envelope chuẩn', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/health').expect(200);

    expect(res.body).toMatchObject({
      success: true,
      status_code: 200,
      message: 'Thao tác thành công',
    });
    expect(res.body.data).toMatchObject({ status: 'UP' });
    expect(res.body.data.timestamp).toBeDefined();
    expect(res.headers['x-response-time']).toBeDefined();
  });

  it('GET /api/v1/health/test-500 chuẩn hóa lỗi 500 qua ExceptionFilter', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/health/test-500').expect(500);

    expect(res.body).toMatchObject({
      success: false,
      status_code: 500,
    });
    expect(res.body.error_code).toBeDefined();
  });

  it('GET /api/v1/health/test-503 chuẩn hóa lỗi 503', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/health/test-503').expect(503);

    expect(res.body).toMatchObject({
      success: false,
      status_code: 503,
    });
  });

  it('GET route không tồn tại trả về 404', async () => {
    await request(app.getHttpServer()).get('/api/v1/khong-ton-tai').expect(404);
  });
});
