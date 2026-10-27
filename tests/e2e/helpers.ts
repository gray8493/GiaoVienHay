import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, randomPhone, TEST_PASSWORD } from './app';

export interface RegisterOptions {
  role: string;
  full_name?: string;
  phone?: string;
  password?: string;
  email?: string;
  school_name?: string;
  teaching_subjects?: string[];
}

export interface RegisteredUser {
  user: any;
  accessToken: string;
  refreshToken: string;
  phone: string;
  password: string;
  payload: Record<string, any>;
}

export async function registerAndLogin(
  app: INestApplication,
  opts: RegisterOptions,
): Promise<RegisteredUser> {
  const phone = opts.phone || randomPhone();
  const password = opts.password || TEST_PASSWORD;
  const payload: Record<string, any> = {
    full_name: opts.full_name || 'Người Dùng E2E',
    phone,
    password,
    role: opts.role,
  };
  if (opts.email) payload.email = opts.email;
  if (opts.role !== 'PARENT') {
    payload.school_name = opts.school_name || 'Trường Tiểu Học Chu Văn An';
    payload.teaching_subjects = opts.teaching_subjects || ['MATH'];
  }

  const res = await request(app.getHttpServer())
    .post('/api/v1/auth/register')
    .send(payload)
    .expect(201);

  const data = res.body?.data ?? res.body;
  expect(data.access_token).toBeDefined();

  return {
    user: data.user,
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    phone,
    password,
    payload,
  };
}

export async function loginUser(
  app: INestApplication,
  phone: string,
  password: string,
  expectedStatus = 200,
) {
  const res = await request(app.getHttpServer())
    .post('/api/v1/auth/login')
    .send({ phone, password })
    .expect(expectedStatus);
  return res.body;
}

export function auth(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

export async function createClassWithStudents(
  app: INestApplication,
  accessToken: string,
  overrides: Record<string, any> = {},
) {
  const payload = {
    name: 'Lớp 5A E2E',
    grade_level: 5,
    academic_year: '2025-2026',
    students: [
      { full_name: 'Học Sinh Một', student_code: 'HS-E2E-001', gender: 'MALE' },
      { full_name: 'Học Sinh Hai', student_code: 'HS-E2E-002', gender: 'FEMALE' },
    ],
    ...overrides,
  };
  const res = await request(app.getHttpServer())
    .post('/api/v1/classes')
    .set(auth(accessToken))
    .send(payload)
    .expect(201);
  return res.body?.data ?? res.body;
}

export async function getClassDetail(
  app: INestApplication,
  accessToken: string,
  classId: string,
) {
  const res = await request(app.getHttpServer())
    .get(`/api/v1/classes/${classId}`)
    .set(auth(accessToken))
    .expect(200);
  return res.body?.data ?? res.body;
}
