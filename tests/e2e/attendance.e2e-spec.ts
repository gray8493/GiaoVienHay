import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './app';
import { registerAndLogin, auth, createClassWithStudents, getClassDetail } from './helpers';

describe('E2E Attendance (điểm danh 1-chạm & cảnh báo vắng)', () => {
  let app: INestApplication;
  let teacher: Awaited<ReturnType<typeof registerAndLogin>>;
  let otherTeacher: Awaited<ReturnType<typeof registerAndLogin>>;

  let classId: string;
  let studentIds: string[] = [];

  const today = new Date().toISOString().slice(0, 10);

  beforeAll(async () => {
    app = await createTestApp();
    teacher = await registerAndLogin(app, { role: 'TEACHER_HOMEROOM', full_name: 'Cô Chủ Nhiệm Điểm Danh' });
    otherTeacher = await registerAndLogin(app, {
      role: 'TEACHER_HOMEROOM',
      full_name: 'Cô Chủ Nhiệm Lớp Khác',
    });

    const created = await createClassWithStudents(app, teacher.accessToken, {
      students: [
        { full_name: 'Bạn Có Mặt', student_code: 'AT-001', gender: 'MALE' },
        { full_name: 'Bạn Vắng Phép', student_code: 'AT-002', gender: 'FEMALE' },
        { full_name: 'Bạn Đi Trễ', student_code: 'AT-003', gender: 'MALE' },
      ],
    });
    classId = created.id || created.class_id;
    const detail = await getClassDetail(app, teacher.accessToken, classId);
    studentIds = (detail.students || []).map((s: any) => s.id || s.student_id);
    expect(studentIds).toHaveLength(3);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Nộp điểm danh', () => {
    it('từ chối ngày sai định dạng (400 ATTEND_DATE_INVALID)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/attendance/submit')
        .set(auth(teacher.accessToken))
        .send({
          class_id: classId,
          attendance_date: '2026-13-01',
          records: [{ student_id: studentIds[0], status: 'PRESENT' }],
        })
        .expect(400);

      expect(res.body.error_code).toBe('ATTEND_DATE_INVALID');
    });

    it('từ chối ngày trong tương lai (400 ATTEND_DATE_IN_FUTURE)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/attendance/submit')
        .set(auth(teacher.accessToken))
        .send({
          class_id: classId,
          attendance_date: '2099-01-01',
          records: [{ student_id: studentIds[0], status: 'PRESENT' }],
        })
        .expect(400);

      expect(res.body.error_code).toBe('ATTEND_DATE_IN_FUTURE');
    });

    it('từ chối danh sách records rỗng (400)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/attendance/submit')
        .set(auth(teacher.accessToken))
        .send({ class_id: classId, attendance_date: today, records: [] })
        .expect(400);

      expect(res.body.error_code).toBe('COMMON_VALIDATION_ERROR');
    });

    it('điểm danh cả lớp với đủ trạng thái → 201, đếm đúng số có mặt/vắng', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/attendance/submit')
        .set(auth(teacher.accessToken))
        .send({
          class_id: classId,
          attendance_date: today,
          records: [
            { student_id: studentIds[0], status: 'PRESENT' },
            { student_id: studentIds[1], status: 'ABSENT_UNEXCUSED', note: 'Không phép' },
            { student_id: studentIds[2], status: 'LATE', note: 'Vào muộn 15 phút' },
          ],
        })
        .expect(201);

      const data = res.body?.data ?? res.body;
      expect(data.attendance_date).toBe(today);
      expect(data.total_students).toBe(3);
      expect(data.present_count).toBe(1);
      expect(data.absent_count).toBe(2);
    });

    it('điểm danh lại trong ngày = upsert (201)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/attendance/submit')
        .set(auth(teacher.accessToken))
        .send({
          class_id: classId,
          attendance_date: today,
          records: [
            { student_id: studentIds[0], status: 'PRESENT' },
            { student_id: studentIds[1], status: 'PRESENT' },
            { student_id: studentIds[2], status: 'PRESENT' },
          ],
        })
        .expect(201);

      const data = res.body?.data ?? res.body;
      expect(data.present_count).toBe(3);
    });

    it('giáo viên không phải chủ nhiệm bị từ chối (403 CLASS_NOT_HOMEROOM_TEACHER)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/attendance/submit')
        .set(auth(otherTeacher.accessToken))
        .send({
          class_id: classId,
          attendance_date: today,
          records: [{ student_id: studentIds[0], status: 'PRESENT' }],
        })
        .expect(403);

      expect(res.body.error_code).toBe('CLASS_NOT_HOMEROOM_TEACHER');
    });

    it('lớp không tồn tại → 404 CLASS_NOT_FOUND', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/attendance/submit')
        .set(auth(teacher.accessToken))
        .send({
          class_id: 'cls_khong_co',
          attendance_date: today,
          records: [{ student_id: studentIds[0], status: 'PRESENT' }],
        })
        .expect(404);

      expect(res.body.error_code).toBe('CLASS_NOT_FOUND');
    });
  });

  describe('Tra cứu điểm danh', () => {
    it('GET /attendance/today/:classId trả về học sinh có mặt', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/attendance/today/${classId}`)
        .set(auth(teacher.accessToken))
        .expect(200);

      const data = res.body?.data ?? res.body;
      expect(data.class_id).toBe(classId);
      expect(data.present_students.length).toBe(3);
    });

    it('GET /attendance/class/:classId trả về lịch sử', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/attendance/class/${classId}`)
        .set(auth(teacher.accessToken))
        .expect(200);

      const data = res.body?.data ?? res.body;
      expect(data.total_records).toBeGreaterThanOrEqual(3);
    });

    it('sửa trạng thái 1 bản ghi qua PATCH /attendance/:id', async () => {
      const history = await request(app.getHttpServer())
        .get(`/api/v1/attendance/class/${classId}`)
        .set(auth(teacher.accessToken))
        .expect(200);
      const record = (history.body?.data?.records ?? history.body?.records ?? [])[0];
      expect(record).toBeDefined();
      const recordId = record.id || record.attendance_id;

      await request(app.getHttpServer())
        .patch(`/api/v1/attendance/${recordId}`)
        .set(auth(teacher.accessToken))
        .send({ status: 'ABSENT_UNEXCUSED', note: 'Sửa lại: vắng không phép' })
        .expect(200);
    });

    it('học sinh xem lịch sử điểm danh theo tháng (cổng phụ huynh)', async () => {
      const month = today.slice(0, 7);
      const res = await request(app.getHttpServer())
        .get(`/api/v1/students/${studentIds[0]}/attendance?month=${month}`)
        .set(auth(teacher.accessToken))
        .expect(200);

      const data = res.body?.data ?? res.body;
      expect(data.student_id || data.studentId || data.id).toBeDefined();
    });
  });
});
