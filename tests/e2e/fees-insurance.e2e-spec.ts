import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './app';
import { registerAndLogin, auth, createClassWithStudents, getClassDetail } from './helpers';

describe('E2E Fees & Insurance (theo dõi học phí & BHYT)', () => {
  let app: INestApplication;
  let teacher: Awaited<ReturnType<typeof registerAndLogin>>;
  let otherTeacher: Awaited<ReturnType<typeof registerAndLogin>>;
  let parent: Awaited<ReturnType<typeof registerAndLogin>>;
  let parent2: Awaited<ReturnType<typeof registerAndLogin>>;

  let classId: string;
  let studentIds: string[] = [];

  beforeAll(async () => {
    app = await createTestApp();
    teacher = await registerAndLogin(app, { role: 'TEACHER_HOMEROOM', full_name: 'Cô Thu Học Phí' });
    otherTeacher = await registerAndLogin(app, {
      role: 'TEACHER_HOMEROOM',
      full_name: 'Cô Không Chủ Nhiệm',
    });
    parent = await registerAndLogin(app, { role: 'PARENT', full_name: 'Phụ Huynh Học Phí' });
    parent2 = await registerAndLogin(app, { role: 'PARENT', full_name: 'Phụ Huynh Học Phí 2' });

    const created = await createClassWithStudents(app, teacher.accessToken, {
      students: [
        { full_name: 'Bạn Đóng Đủ', student_code: 'FE-001', gender: 'MALE', parent_phone: parent.phone },
        { full_name: 'Bạn Chưa Đóng', student_code: 'FE-002', gender: 'FEMALE', parent_phone: parent2.phone },
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

  describe('Tra cứu học phí lớp', () => {
    it('GVCN xem danh sách học phí lớp (bản ghi sinh tự động) → 200', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/fees-insurance/class/${classId}`)
        .set(auth(teacher.accessToken))
        .expect(200);

      const data = res.body?.data ?? res.body;
      expect(data.class_id).toBe(classId);
      expect(data.total_students).toBe(2);
      expect(data.records.length).toBe(2);
    });

    it('lọc học sinh chưa nộp học phí (unpaid_only=true)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/fees-insurance/class/${classId}?fee_type=TUITION&unpaid_only=true`)
        .set(auth(teacher.accessToken))
        .expect(200);

      const data = res.body?.data ?? res.body;
      expect(data.unpaid_tuition_count).toBeGreaterThanOrEqual(1);
      for (const r of data.records) {
        expect(r.tuition.is_paid).toBe(false);
      }
    });

    it('giáo viên không phải chủ nhiệm bị từ chối (403 AUTH_FORBIDDEN)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/fees-insurance/class/${classId}`)
        .set(auth(otherTeacher.accessToken))
        .expect(403);

      expect(res.body.error_code).toBe('AUTH_FORBIDDEN');
    });
  });

  describe('Cập nhật trạng thái nộp', () => {
    const recordId = () => `fee_${studentIds[0]}`;

    it('đánh dấu đã nộp học phí → 200', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/v1/fees-insurance/toggle')
        .set(auth(teacher.accessToken))
        .send({ record_id: recordId(), fee_type: 'TUITION', is_paid: true, paid_date: '27/10/2026', note: 'Đã thu' })
        .expect(200);

      const data = res.body?.data ?? res.body;
      expect(data.record_id).toBe(recordId());
      expect(data.is_paid).toBe(true);
    });

    it('toggle ngược lại về chưa nộp → 200', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/v1/fees-insurance/toggle')
        .set(auth(teacher.accessToken))
        .send({ record_id: recordId(), fee_type: 'TUITION', is_paid: false })
        .expect(200);

      const data = res.body?.data ?? res.body;
      expect(data.is_paid).toBe(false);
    });

    it('fee_type không hợp lệ → 400 COMMON_VALIDATION_ERROR', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/v1/fees-insurance/toggle')
        .set(auth(teacher.accessToken))
        .send({ record_id: recordId(), fee_type: 'LOAI_LA', is_paid: true })
        .expect(400);

      expect(res.body.error_code).toBe('COMMON_VALIDATION_ERROR');
    });
  });

  describe('Nhắc nộp phụ huynh', () => {
    it('gửi nhắc nộp học phí → 200 kèm số phụ huynh được nhắc', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/fees-insurance/remind')
        .set(auth(teacher.accessToken))
        .send({ class_id: classId, fee_type: 'TUITION' })
        .expect(200);

      const data = res.body?.data ?? res.body;
      expect(data.class_id).toBe(classId);
      expect(data.notified_parents_count).toBe(2);
      expect(data.notified_inboxes).toBe(2);
      expect(data.failed_parent_inboxes).toBe(0);
    });

    it('học sinh chưa liên kết phụ huynh → 500 FEE_REMINDER_DELIVERY_FAILED', async () => {
      const created = await createClassWithStudents(app, teacher.accessToken, {
        name: 'Lớp 5B E2E Học Phí',
        students: [
          { full_name: 'Học Sinh Không Phụ Huynh', student_code: 'FE-003', gender: 'MALE' },
        ],
      });
      const orphanClassId = created.id || created.class_id;

      const res = await request(app.getHttpServer())
        .post('/api/v1/fees-insurance/remind')
        .set(auth(teacher.accessToken))
        .send({ class_id: orphanClassId, fee_type: 'TUITION' })
        .expect(500);

      expect(res.body.error_code).toBe('FEE_REMINDER_DELIVERY_FAILED');
    });
  });
});
