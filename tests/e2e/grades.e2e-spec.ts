import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './app';
import { registerAndLogin, auth, createClassWithStudents, getClassDetail } from './helpers';

describe('E2E Grades (sổ điểm điện tử, công bố điểm, bảng vinh danh)', () => {
  let app: INestApplication;
  let teacher: Awaited<ReturnType<typeof registerAndLogin>>;
  let outsiderTeacher: Awaited<ReturnType<typeof registerAndLogin>>;
  let parent: Awaited<ReturnType<typeof registerAndLogin>>;

  let classId: string;
  let studentIds: string[] = [];

  beforeAll(async () => {
    app = await createTestApp();
    teacher = await registerAndLogin(app, { role: 'TEACHER_HOMEROOM', full_name: 'Cô Sổ Điểm' });
    outsiderTeacher = await registerAndLogin(app, {
      role: 'TEACHER_SUBJECT',
      full_name: 'Thầy Môn Văn',
      teaching_subjects: ['LIT'],
    });
    parent = await registerAndLogin(app, { role: 'PARENT', full_name: 'Phụ Huynh Điểm' });

    const created = await createClassWithStudents(app, teacher.accessToken, {
      students: [
        { full_name: 'Học Sinh Giỏi', student_code: 'GR-001', gender: 'MALE', parent_phone: parent.phone },
        { full_name: 'Học Sinh Khá', student_code: 'GR-002', gender: 'FEMALE' },
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

  describe('Nhập điểm hàng loạt', () => {
    it('nhập điểm TEST_15P cho cả lớp → 200 kèm updated_count', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/grades/batch')
        .set(auth(teacher.accessToken))
        .send({
          class_id: classId,
          subject_code: 'MATH',
          semester: 1,
          score_type: 'TEST_15P',
          scores: [
            { student_id: studentIds[0], score_value: 9.5, teacher_comment: 'Tốt' },
            { student_id: studentIds[1], score_value: 7.0 },
          ],
        })
        .expect(200);

      const data = res.body?.data ?? res.body;
      expect(data.class_id).toBe(classId);
      expect(data.updated_count).toBe(2);
    });

    it('từ chối điểm vượt thang 10 (400 ACAD_SCORE_OUT_OF_RANGE)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/grades/batch')
        .set(auth(teacher.accessToken))
        .send({
          class_id: classId,
          subject_code: 'MATH',
          semester: 1,
          score_type: 'TEST_15P',
          scores: [{ student_id: studentIds[0], score_value: 11 }],
        })
        .expect(400);

      expect(res.body.error_code).toBe('ACAD_SCORE_OUT_OF_RANGE');
    });

    it('từ chối score_type không hợp lệ (400 COMMON_VALIDATION_ERROR)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/grades/batch')
        .set(auth(teacher.accessToken))
        .send({
          class_id: classId,
          subject_code: 'MATH',
          score_type: 'LOAI_KHONG_CO',
          scores: [{ student_id: studentIds[0], score_value: 8 }],
        })
        .expect(400);

      expect(res.body.error_code).toBe('COMMON_VALIDATION_ERROR');
    });

    it('giáo viên không dạy môn bị từ chối (403 ACAD_NOT_ASSIGNED_TEACHER)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/grades/batch')
        .set(auth(outsiderTeacher.accessToken))
        .send({
          class_id: classId,
          subject_code: 'LIT',
          score_type: 'TEST_15P',
          scores: [{ student_id: studentIds[0], score_value: 8 }],
        })
        .expect(403);

      expect(res.body.error_code).toBe('ACAD_NOT_ASSIGNED_TEACHER');
    });
  });

  describe('Tra cứu & chỉnh sửa điểm', () => {
    it('xem bảng điểm lớp theo môn', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/grades/class/${classId}?subject_code=MATH&semester=1`)
        .set(auth(teacher.accessToken))
        .expect(200);

      const data = res.body?.data ?? res.body;
      const rows = Array.isArray(data) ? data : data.scores ?? [];
      expect(rows.length).toBeGreaterThanOrEqual(2);
    });

    it('sửa điểm qua PUT /grades/scores/:scoreId', async () => {
      const listRes = await request(app.getHttpServer())
        .get(`/api/v1/grades/class/${classId}?subject_code=MATH&semester=1`)
        .set(auth(teacher.accessToken))
        .expect(200);
      const rows = listRes.body?.data ?? listRes.body;
      const row = (Array.isArray(rows) ? rows : rows.scores ?? [])[0];
      expect(row).toBeDefined();
      const scoreId = row.score_id || row.id;
      expect(scoreId).toBeDefined();

      const res = await request(app.getHttpServer())
        .put(`/api/v1/grades/scores/${scoreId}`)
        .set(auth(teacher.accessToken))
        .send({ score_value: 8.5, correction_reason: 'Chấm nhầm' })
        .expect(200);

      const data = res.body?.data ?? res.body;
      expect(data.score_value).toBe(8.5);
    });

    it('sửa điểm không tồn tại → 404 GRADE_RECORD_NOT_FOUND', async () => {
      const res = await request(app.getHttpServer())
        .put('/api/v1/grades/scores/score_khong_co')
        .set(auth(teacher.accessToken))
        .send({ score_value: 8 })
        .expect(404);

      expect(res.body.error_code).toBe('GRADE_RECORD_NOT_FOUND');
    });
  });

  describe('Công bố điểm & bảng vinh danh', () => {
    it('công bố điểm → 200 kèm số phụ huynh được thông báo', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/grades/publish')
        .set(auth(teacher.accessToken))
        .send({ class_id: classId, subject_code: 'MATH', score_type: 'TEST_15P' })
        .expect(200);

      const data = res.body?.data ?? res.body;
      expect(data.message || data.published_at).toBeDefined();
    });

    it('bảng vinh danh trả về học sinh xếp hạng theo điểm', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/grades/leaderboard/${classId}?subject_code=MATH&semester=1&limit=5`)
        .set(auth(teacher.accessToken))
        .expect(200);

      const data = res.body?.data ?? res.body;
      const list = data.top_students ?? data.leaderboard ?? (Array.isArray(data) ? data : []);
      expect(list.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Cổng phụ huynh tra cứu điểm', () => {
    it('phụ huynh xem điểm con qua /grades/parent/lookup', async () => {
      const res = await request(app.getHttpServer())
        .get(
          `/api/v1/grades/parent/lookup?student_id=${studentIds[0]}&subject_code=MATH&semester=1&score_type=TEST_15P`,
        )
        .set(auth(parent.accessToken))
        .expect(200);

      const data = res.body?.data ?? res.body;
      expect(data.student_id || data.studentId).toBe(studentIds[0]);
      expect(data.is_published).toBe(true);
    });

    it('từ chối tra cứu loại điểm FINAL (400)', async () => {
      const res = await request(app.getHttpServer())
        .get(
          `/api/v1/grades/parent/lookup?student_id=${studentIds[0]}&subject_code=MATH&score_type=FINAL`,
        )
        .set(auth(parent.accessToken))
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('phụ huynh xem bảng điểm tổng hợp của con (students academic)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/students/${studentIds[0]}/academic?semester=1`)
        .set(auth(parent.accessToken))
        .expect(200);

      const data = res.body?.data ?? res.body;
      expect(data.student_id || data.studentId).toBe(studentIds[0]);
      expect(data.subjects).toEqual(
        expect.arrayContaining([expect.objectContaining({ subject_code: 'MATH' })]),
      );
    });
  });
});
