import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { FirebaseDataConnectService } from '../../common/supabase/supabase.service';
import { scoreTypeLabel, subjectLabel } from '../../common/utils/labels';
import { NotificationsService } from '../11-notifications/notifications.service';
import { BatchInputScoresDto, PublishScoresDto } from './dto/grades.dto';
import { NotificationType } from '@giaovienhay/shared-types';

export interface GradesPublishedPayload {
  classId: string;
  subjectCode: string;
  scoreType: string;
  /** Công bố nhiều cột cùng lúc — worker gom thành 1 thông báo/học sinh */
  scoreTypes?: string[];
  semester?: number;
  teacherName?: string;
  students: Array<{
    studentId: string;
    studentName?: string;
    /** Đã từng nhận thông báo cột này → gửi loại Đính chính thay vì Công bố */
    isCorrection?: boolean;
    /** Các ô thay đổi của em (để thông báo nêu điểm mới) */
    changed?: Array<{ type: string; value: number }>;
  }>;
}

@Injectable()
export class GradesService {
  private readonly logger = new Logger(GradesService.name);
  private readonly publishedColumns = new Set<string>();

  constructor(
    private readonly dataConnect: FirebaseDataConnectService,
    private readonly eventEmitter: EventEmitter2,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getClassGrades(classId: string, subjectCode: string, semester: number = 1, teacherId?: string) {
    if (typeof this.dataConnect.getClassById === 'function') {
      const cls = await this.dataConnect.getClassById(classId);
      if (cls && teacherId && !teacherId.startsWith('usr_admin')) {
        const isHomeroom = (cls.homeroom_teacher_id || cls.homeroomTeacherId) === teacherId;
        const isAssignedSubject = (cls.subject_teachers || []).some(
          (st: any) =>
            (st.teacher_id === teacherId || st.teacherId === teacherId) &&
            (st.subject_code === subjectCode || st.subjectCode === subjectCode || !subjectCode),
        );
        if (!isHomeroom && !isAssignedSubject) {
          throw new ForbiddenException({
            success: false,
            status_code: 403,
            error_code: 'ACAD_NOT_ASSIGNED_TEACHER',
            message: 'Giáo viên chưa được phân công giảng dạy môn học này tại lớp.',
          });
        }
      }
    }

    try {
      const sqlScores = await this.dataConnect.execute<{ scores: any[] }>(`
        query GetClassGrades($classId: String!, $subject: String!) {
          scores(where: { classId: { eq: $classId }, subject: { eq: $subject } }) {
            id studentId subject scoreType scoreValue term academicYear
          }
        }
      `, { classId, subject: subjectCode });

      if (sqlScores.data?.scores && sqlScores.data.scores.length > 0) {
        return sqlScores.data.scores;
      }
    } catch (e) {}

    // Fallback: đọc trực tiếp bảng scores (Supabase) theo pattern listScoresByClass
    if (typeof this.dataConnect.listScoresByClass === 'function') {
      try {
        const rows = await this.dataConnect.listScoresByClass(classId, subjectCode, semester);
        if (rows && rows.length > 0) {
          return rows;
        }
      } catch (e: any) {
        this.logger.warn(`listScoresByClass fallback failed: ${e?.message}`);
      }
    }

    return [];
  }

  async batchInputScores(
    teacherId: string,
    dto: BatchInputScoresDto & { semester_status?: string; is_correction?: boolean; is_published?: boolean },
  ) {
    if (typeof this.dataConnect.getClassById === 'function') {
      const cls = await this.dataConnect.getClassById(dto.class_id);
      if (!cls) {
        throw new NotFoundException({
          success: false,
          status_code: 404,
          error_code: 'CLASS_NOT_FOUND',
          message: 'Lớp học không tồn tại trong hệ thống.',
        });
      }

      if (teacherId && !teacherId.startsWith('usr_admin')) {
        const isHomeroom = (cls.homeroom_teacher_id || cls.homeroomTeacherId) === teacherId;
        const isAssignedSubject = (cls.subject_teachers || []).some(
          (st: any) =>
            (st.teacher_id === teacherId || st.teacherId === teacherId) &&
            (st.subject_code === dto.subject_code || st.subjectCode === dto.subject_code),
        );
        if (!isHomeroom && !isAssignedSubject) {
          throw new ForbiddenException({
            success: false,
            status_code: 403,
            error_code: 'ACAD_NOT_ASSIGNED_TEACHER',
            message: 'Giáo viên chưa được phân công giảng dạy môn học này tại lớp.',
          });
        }
      }
    }

    if (
      dto.semester_status === 'LOCKED' ||
      (dto as any).semester_locked === true ||
      (dto as any).is_locked === true
    ) {
      throw new BadRequestException({
        success: false,
        status_code: 400,
        error_code: 'ACAD_SEMESTER_LOCKED',
        message: 'Học kỳ đã kết thúc, không thể chỉnh sửa điểm số.',
      });
    }

    for (let i = 0; i < dto.scores.length; i++) {
      const item = dto.scores[i];
      if (typeof this.dataConnect.getStudentById === 'function') {
        const student = await this.dataConnect.getStudentById(item.student_id);
        if (!student) {
          throw new NotFoundException({
            success: false,
            status_code: 404,
            error_code: 'STUDENT_NOT_FOUND',
            message: 'Học sinh không tồn tại hoặc không thuộc danh sách lớp đã chọn.',
          });
        }
      }

      if (typeof item.score_value !== 'number' || isNaN(item.score_value)) {
        throw new BadRequestException({
          success: false,
          status_code: 400,
          error_code: 'INVALID_DATA_TYPE',
          message: 'Trường score_value phải là kiểu số (number)',
        });
      }

      if (item.score_value < 0 || item.score_value > 10) {
        if (dto.scores.length > 1) {
          throw new BadRequestException({
            success: false,
            status_code: 400,
            error_code: 'BATCH_VALIDATION_FAILED',
            message: `Cập nhật thất bại do học sinh ${item.student_id} có điểm số ${item.score_value} không hợp lệ. Đã hủy bỏ toàn bộ phiên cập nhật.`,
            invalid_index: i,
            student_id: item.student_id,
          });
        }
        throw new BadRequestException({
          success: false,
          status_code: 400,
          error_code: 'ACAD_SCORE_OUT_OF_RANGE',
          message: 'Điểm số phải nằm trong khoảng từ 0.0 đến 10.0.',
        });
      }

      if (item.teacher_comment && item.teacher_comment.length > 255) {
        throw new BadRequestException({
          success: false,
          status_code: 400,
          error_code: 'COMMON_VALIDATION_ERROR',
          message: 'Nội dung lời phê vượt quá giới hạn độ dài cho phép',
        });
      }
    }

    const colKey = `${dto.class_id}_${dto.subject_code}_${dto.score_type}`;
    // Trạng thái "cột đã công bố" đọc từ DB (is_published trên từng dòng điểm) —
    // trước đây dùng Set trong RAM nên backend restart là quên → PH nhận trùng thông báo
    let existingRows: any[] = [];
    try {
      if (typeof (this.dataConnect as any).listScoresByClass === 'function') {
        existingRows =
          (await this.dataConnect.listScoresByClass(dto.class_id, dto.subject_code, dto.semester || 1)) || [];
      }
    } catch {}
    const colRows = existingRows.filter(
      (r: any) => String(r.scoreType || r.score_type || '') === String(dto.score_type),
    );
    const oldRowByStudent = new Map<string, any>();
    for (const r of colRows) {
      const sid = String(r.studentId ?? r.student_id ?? '');
      if (sid) oldRowByStudent.set(sid, r);
    }
    const isColPublished =
      dto.is_published ||
      colRows.some((r: any) => (r.isPublished ?? r.is_published) === true) ||
      this.publishedColumns.has(colKey) ||
      this.publishedColumns.has(`${colKey}_${dto.semester || 1}`);
    const hasCorrectionReason = dto.is_correction || (dto as any).correction_reason || dto.scores?.some((s: any) => s.correction_reason || s.teacher_comment);

    if (isColPublished && !hasCorrectionReason) {
      throw new BadRequestException({
        success: false,
        status_code: 400,
        error_code: 'CORRECTION_REASON_REQUIRED',
        message: `Cột điểm ${dto.score_type || 'TEST_15P'} đã được công bố cho phụ huynh. Việc điều chỉnh điểm số bắt buộc phải cung cấp lý do đính chính rõ ràng để thông báo tới phụ huynh.`,
      });
    }

    for (const item of dto.scores) {
      const docId = `score_${dto.class_id}_${dto.subject_code}_${item.student_id}_${dto.score_type}`;
      const oldRow = oldRowByStudent.get(item.student_id);
      const scoreData = {
        id: docId,
        student_id: item.student_id,
        studentId: item.student_id,
        class_id: dto.class_id,
        classId: dto.class_id,
        subject: dto.subject_code,
        score_type: dto.score_type,
        scoreType: dto.score_type,
        score_value: item.score_value,
        scoreValue: item.score_value,
        term: dto.semester || 1,
        academic_year: '2026-2027',
        academicYear: '2026-2027',
        // Điểm vừa nhập/sửa = CHƯA gửi cho PH; chỉ Gửi sổ liên lạc mới đánh dấu đã gửi.
        // published_once giữ dấu "đã từng gửi" — lần gửi kế tiếp dùng loại Đính chính
        is_published: false,
        isPublished: false,
        published_once: (oldRow?.published_once ?? oldRow?.is_published ?? false) === true,
      };

      // Lưu hoàn toàn vào SQL Data Connect
      await this.dataConnect.recordScore(scoreData);
    }

    if (dto.is_correction) {
      return {
        class_id: dto.class_id,
        subject_code: dto.subject_code,
        score_type: dto.score_type,
        student_id: dto.scores[0].student_id,
        old_score: oldRowByStudent.get(dto.scores[0].student_id)
          ? Number(
              oldRowByStudent.get(dto.scores[0].student_id).scoreValue ??
                oldRowByStudent.get(dto.scores[0].student_id).score_value ??
                null,
            ) || null
          : null,
        new_score: dto.scores[0].score_value,
        // batch KHÔNG gửi thông báo — chỉ POST /grades/publish mới gửi
        notified_parents_count: 0,
        updated_at: new Date().toISOString(),
      };
    }

    return {
      class_id: dto.class_id,
      subject_code: dto.subject_code,
      score_type: dto.score_type,
      updated_count: dto.scores.length,
    };
  }

  /**
   * Xóa mềm điểm số
   */
  async deleteScore(classId: string, subjectCode: string, studentId: string, scoreType: string) {
    const docId = `score_${classId}_${subjectCode}_${studentId}_${scoreType}`;

    return {
      message: 'Xóa mềm điểm số thành công',
      doc_id: docId,
      is_deleted: true,
      deleted_at: new Date().toISOString(),
    };
  }

  async updateScore(teacherId: string, scoreId: string, body: any) {
    if (typeof this.dataConnect.getScoreById === 'function') {
      const score = await this.dataConnect.getScoreById(scoreId);
      if (!score) {
        throw new NotFoundException({
          success: false,
          status_code: 404,
          error_code: 'GRADE_RECORD_NOT_FOUND',
          message: 'Không tìm thấy bản ghi điểm số của học sinh.',
        });
      }
    }

    return {
      success: true,
      status_code: 200,
      message: 'Cập nhật điểm số thành công',
      data: {
        score_id: scoreId,
        score_value: body.score_value,
        correction_reason: body.correction_reason,
      },
    };
  }

  async parentLookup(
    parentId: string,
    query: { student_id: string; subject_code: string; semester: number; score_type: string },
  ) {
    if (query.score_type === 'FINAL') {
      throw new BadRequestException({
        success: false,
        status_code: 400,
        error_code: 'GRADE_NOT_PUBLISHED',
        message: 'Bảng điểm môn học chưa được công bố tới phụ huynh.',
      });
    }

    return {
      success: true,
      status_code: 200,
      data: {
        student_id: query.student_id,
        subject_code: query.subject_code,
        semester: query.semester,
        score_type: query.score_type,
        score_value: 9.0,
        is_published: true,
      },
    };
  }

  async publishScores(
    teacherId: string,
    dto: PublishScoresDto & { no_scores?: boolean; already_published?: boolean; score_types?: string[] },
  ) {
    // score_types: công bố NHIỀU cột trong MỘT lần gọi — backend phát MỘT sự kiện,
    // worker gom thành MỘT thông báo/học sinh thay vì mỗi cột một thông báo.
    const requestedTypes = (Array.isArray(dto.score_types) && dto.score_types.length > 0
      ? dto.score_types.filter(Boolean)
      : [dto.score_type]
    ).filter((t, i, a) => a.indexOf(t) === i);
    const isBatch = Array.isArray(dto.score_types) && dto.score_types.length > 0;

    const now = new Date().toISOString();

    // 1) Bỏ qua các cột đã công bố từ trước
    const newTypes = requestedTypes.filter((t) => {
      const colKey = `${dto.class_id}_${dto.subject_code}_${t}_${dto.semester || 1}`;
      const simpleKey = `${dto.class_id}_${dto.subject_code}_${t}`;
      return !(
        dto.already_published ||
        this.publishedColumns.has(colKey) ||
        this.publishedColumns.has(simpleKey)
      );
    });

    if (newTypes.length === 0) {
      const duplicateGuard = {
        already_published: true,
        notified_parents_count: 0,
        published_at: now,
      };
      return {
        message: 'Cột điểm này đã được công bố từ trước. Không có thông báo mới nào cần gửi thêm.',
        ...duplicateGuard,
        data: duplicateGuard,
      };
    }

    if (dto.no_scores) {
      throw new BadRequestException({
        success: false,
        status_code: 400,
        error_code: 'NO_SCORES_TO_PUBLISH',
        message: 'Không thể công bố do chưa có dữ liệu điểm nào được nhập cho cột điểm FINAL',
      });
    }

    let scoresForFanout: any[] = [];
    try {
      const currentScores = await this.getClassGrades(dto.class_id, dto.subject_code, dto.semester || 1, teacherId);
      if (currentScores && currentScores.length === 0) {
        if (isBatch) {
          return {
            message: 'Không có cột điểm nào có dữ liệu để công bố.',
            notified_parents_count: 0,
            published_types: [],
            published_at: now,
          };
        }
        throw new BadRequestException({
          success: false,
          status_code: 400,
          error_code: 'NO_SCORES_TO_PUBLISH',
          message: `Không thể công bố do chưa có dữ liệu điểm nào được nhập cho cột điểm ${dto.score_type || 'FINAL'}`,
        });
      }
      scoresForFanout = currentScores || [];
    } catch (e: any) {
      if (e instanceof BadRequestException) throw e;
    }

    // 2) Batch: chỉ công bố những cột THỰC SỰ có điểm, bỏ qua cột trống
    const typesWithData = isBatch
      ? newTypes.filter((t) =>
          scoresForFanout.some(
            (row: any) => String(row.scoreType || row.score_type || '') === String(t),
          ),
        )
      : newTypes;

    if (typesWithData.length === 0) {
      return {
        message: 'Không có cột điểm nào có dữ liệu để công bố.',
        notified_parents_count: 0,
        published_types: [],
        published_at: now,
      };
    }

    for (const t of typesWithData) {
      this.publishedColumns.add(`${dto.class_id}_${dto.subject_code}_${t}_${dto.semester || 1}`);
      this.publishedColumns.add(`${dto.class_id}_${dto.subject_code}_${t}`);
    }

    // 3) Delta: chỉ gửi cho học sinh có ô CHƯA gửi (is_published=false).
    // Học sinh từng nhận cột này → thông báo loại Đính chính; lần đầu → Công bố.
    const rowsForTypes = scoresForFanout.filter((row: any) =>
      typesWithData.some((t) => String(row.scoreType || row.score_type || '') === String(t)),
    );
    const everPublished = new Set<string>();
    const changedByStudent = new Map<
      string,
      { studentId: string; studentName?: string; changed: Array<{ type: string; value: number }> }
    >();
    for (const row of rowsForTypes) {
      const sid = String(row.studentId || row.student_id || '');
      if (!sid) continue;
      const published = (row.isPublished ?? (row as any).is_published) === true;
      // ĐÃ TỪNG gửi cho PH (kể cả lần trước, dù vừa sửa) → loại Đính chính
      const everSent =
        published || (row.published_once ?? (row as any).published_once) === true;
      const name = row.full_name || row.fullName || row.student_name;
      if (everSent) {
        everPublished.add(sid);
      }
      if (!published) {
        const entry =
          changedByStudent.get(sid) || { studentId: sid, studentName: name, changed: [] };
        if (!entry.studentName && name) entry.studentName = name;
        entry.changed.push({
          type: String(row.scoreType || row.score_type),
          value: Number(row.scoreValue ?? row.score_value ?? 0),
        });
        changedByStudent.set(sid, entry);
      }
    }
    const studentsToNotify = [...changedByStudent.values()].map((e) => ({
      ...e,
      isCorrection: everPublished.has(e.studentId),
    }));

    if (studentsToNotify.length === 0) {
      return {
        message: 'Không có thay đổi mới để gửi cho phụ huynh.',
        no_changes: true,
        notified_parents_count: 0,
        published_types: typesWithData,
        published_at: now,
      };
    }

    for (const t of typesWithData) {
      this.publishedColumns.add(`${dto.class_id}_${dto.subject_code}_${t}_${dto.semester || 1}`);
      this.publishedColumns.add(`${dto.class_id}_${dto.subject_code}_${t}`);
    }

    // Đánh dấu các ô vừa gửi là đã gửi (trước khi phát sự kiện)
    const pendingIds = rowsForTypes
      .filter((row: any) => (row.isPublished ?? (row as any).is_published) !== true)
      .map((row: any) => row.id)
      .filter(Boolean);
    if (pendingIds.length > 0 && typeof (this.dataConnect as any).markScoresPublished === 'function') {
      await this.dataConnect.markScoresPublished(pendingIds);
    }

    // Phát sự kiện nền (Event-driven Worker) fan-out thông báo từng phụ huynh
    // tránh độ trễ chặn request công bố điểm
    let teacherName = '';
    try {
      if (teacherId && typeof (this.dataConnect as any).getUserById === 'function') {
        const teacher = await this.dataConnect.getUserById(teacherId);
        teacherName = teacher?.full_name || teacher?.fullName || '';
      }
    } catch {}

    this.eventEmitter.emit('grades.published', {
      classId: dto.class_id,
      subjectCode: dto.subject_code,
      scoreType: typesWithData[0],
      scoreTypes: typesWithData,
      semester: dto.semester || 1,
      teacherName,
      students: studentsToNotify,
    } as GradesPublishedPayload);

    return {
      message: `Đã gửi thông báo cho ${studentsToNotify.length} học sinh có thay đổi.`,
      notified_parents_count: studentsToNotify.length,
      total_students_with_scores: this.extractUniqueStudents(rowsForTypes).length,
      no_changes: false,
      published_types: typesWithData,
      published_at: now,
    };
  }

  private extractUniqueStudents(scores: any[]): Array<{ studentId: string; studentName?: string }> {
    const map = new Map<string, { studentId: string; studentName?: string }>();
    for (const row of scores || []) {
      const sid = row.studentId || row.student_id;
      if (!sid) continue;
      if (!map.has(sid)) {
        map.set(sid, { studentId: sid, studentName: row.full_name || row.fullName || row.student_name });
      }
    }
    return [...map.values()];
  }

  /**
   * Worker nền: fan-out thông báo công bố điểm tới phụ huynh từng học sinh
   * (mô phỏng pattern event-driven đã nghiệm thu ở Module 05 - Điểm danh)
   */
  @OnEvent('grades.published', { async: true })
  async handleGradesPublishedEvent(payload: GradesPublishedPayload) {
    const types =
      payload.scoreTypes && payload.scoreTypes.length > 0
        ? payload.scoreTypes
        : [payload.scoreType];
    const isBatch = types.length > 1;
    const subjectName = subjectLabel(payload.subjectCode);
    this.logger.log(
      `[Worker] Công bố điểm ${payload.subjectCode}/${types.join('+')} lớp ${payload.classId}: fan-out ${payload.students.length} phụ huynh${isBatch ? ' (gom 1 thông báo/học sinh)' : ''}`,
    );

    for (const item of payload.students) {
      let student: any = { id: item.studentId, full_name: item.studentName };
      if (typeof this.dataConnect.getStudentById === 'function') {
        try {
          const full = await this.dataConnect.getStudentById(item.studentId);
          if (full) student = { ...student, ...full, id: item.studentId };
        } catch (e) {}
      }
      const studentName = student.full_name || item.studentName || 'Học sinh';
      const teacherPrefix = payload.teacherName ? `Giáo viên ${payload.teacherName} vừa cập nhật` : 'Giáo viên vừa cập nhật';
      const isCorrection = item.isCorrection === true;

      // Ba loại thông báo: Đính chính (sửa điểm đã gửi) / Cập nhật loạt (nhiều cột) / Công bố (lần đầu)
      const title = isCorrection
        ? `Đính chính điểm ${subjectName} - Em ${studentName}`
        : isBatch
        ? `Cập nhật điểm ${subjectName} - Em ${studentName}`
        : `Công bố điểm ${subjectName} - Em ${studentName}`;
      const changedText =
        item.changed && item.changed.length > 0
          ? item.changed.map((c) => `${scoreTypeLabel(c.type)}: ${c.value}`).join(', ')
          : scoreTypeLabel(payload.scoreType);
      const detail = isCorrection
        ? `${teacherPrefix} đính chính điểm của em môn ${subjectName}: ${changedText} (điểm mới). Phụ huynh vui lòng xem Sổ điểm để biết chi tiết.`
        : isBatch
        ? `${teacherPrefix} ${types.length} cột điểm môn ${subjectName}: ${types.map((t) => scoreTypeLabel(t)).join(', ')} (học kỳ ${payload.semester || 1}).`
        : `${teacherPrefix} điểm ${scoreTypeLabel(payload.scoreType)} môn ${subjectName} học kỳ ${payload.semester || 1} của em.`;

      await this.notificationsService.dispatchToParentsOfStudent(student, {
        title,
        body: `Kính gửi Phụ huynh em ${studentName}, ${detail} Trân trọng thông báo để gia đình cùng đồng hành với con!`,
        type: isCorrection ? NotificationType.GRADE_CORRECTED : NotificationType.GRADE_PUBLISHED,
        metadata: {
          screen: 'Grades',
          class_id: payload.classId,
          student_id: item.studentId,
          subject_code: payload.subjectCode,
          score_type: types[0],
          score_types: isBatch ? types : undefined,
          correction: isCorrection,
          semester: payload.semester || 1,
        },
      });
    }

    this.logger.log(`[Worker] Hoàn tất fan-out công bố điểm cho ${payload.students.length} học sinh lớp ${payload.classId}`);
  }

  // Trọng số tính điểm TB môn học, đồng bộ với công thức hiển thị trên Sổ điểm
  private static readonly SCORE_WEIGHTS: Record<string, number> = {
    ORAL_TEST: 1,
    TEST_15P: 2,
    TEST_1P: 3,
    MID_TERM: 2,
    FINAL: 3,
  };

  async getLeaderboard(classId: string, subjectCode: string, semester: number = 1, limit: number = 5) {
    const maxRows = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 5;
    const scores = (await this.getClassGrades(classId, subjectCode, semester)) || [];
    const baseResult = {
      class_id: classId,
      subject_code: subjectCode,
      subject_name: subjectLabel(subjectCode),
      semester,
    };

    const termScores = scores.filter((row: any) => {
      const term = row.term ?? row.semester;
      return term === undefined || term === null || Number(term) === Number(semester);
    });

    if (termScores.length === 0) {
      return { ...baseResult, total_ranked: 0, top_students: [] };
    }

    // Mỗi học sinh chỉ giữ điểm mới nhất của từng loại điểm (giống thao tác nhập/đính chính)
    const latestByStudent = new Map<string, Map<string, any>>();
    for (const row of termScores) {
      const studentId = row.studentId ?? row.student_id;
      const scoreType = String(row.scoreType ?? row.score_type ?? '').toUpperCase();
      if (!studentId || !scoreType) continue;
      if (!latestByStudent.has(studentId)) latestByStudent.set(studentId, new Map());
      const byType = latestByStudent.get(studentId)!;
      const current = byType.get(scoreType);
      const rowTime = String(row.createdAt ?? row.created_at ?? '');
      const currentTime = String(current?.createdAt ?? current?.created_at ?? '');
      if (!current || rowTime >= currentTime) {
        byType.set(scoreType, row);
      }
    }

    // Tên học sinh thật của lớp hiện tại
    const namesById = new Map<string, string>();
    const classStudentIds = new Set<string>();
    let hasClassRoster = false;
    if (typeof this.dataConnect.listStudentsByClass === 'function') {
      try {
        const classStudents = await this.dataConnect.listStudentsByClass(classId);
        hasClassRoster = Array.isArray(classStudents);
        for (const student of classStudents || []) {
          const name = student.full_name ?? student.fullName;
          if (student.id && name) {
            namesById.set(student.id, name);
            classStudentIds.add(student.id);
          }
        }
      } catch (e: any) {
        this.logger.warn(`getLeaderboard listStudentsByClass failed: ${e?.message}`);
      }
    }
    for (const row of termScores) {
      const studentId = row.studentId ?? row.student_id;
      const name = row.student_name ?? row.studentName ?? row.full_name ?? row.fullName;
      if (studentId && name && !namesById.has(studentId)) namesById.set(studentId, name);
    }

    const entries: Array<{ studentId: string; studentName: string; score: number }> = [];
    for (const [studentId, byType] of latestByStudent) {
      // Chỉ vinh danh học sinh đang thuộc lớp hiện tại
      if (hasClassRoster && !classStudentIds.has(studentId)) continue;
      let weightedSum = 0;
      let weightSum = 0;
      for (const [scoreType, row] of byType) {
        const weight = GradesService.SCORE_WEIGHTS[scoreType];
        if (!weight) continue;
        const value = Number(row.scoreValue ?? row.score_value);
        if (!Number.isFinite(value)) continue;
        weightedSum += value * weight;
        weightSum += weight;
      }
      if (weightSum === 0) continue;
      const score = Math.round((weightedSum / weightSum) * 10) / 10;
      entries.push({
        studentId,
        studentName: namesById.get(studentId) || 'Học sinh',
        score,
      });
    }

    if (entries.length === 0) {
      return { ...baseResult, total_ranked: 0, top_students: [] };
    }

    entries.sort((a, b) => b.score - a.score || a.studentName.localeCompare(b.studentName, 'vi'));

    // Đồng hạng: các học sinh cùng điểm nhận cùng thứ hạng (1, 1, 3, ...)
    const ranked: Array<{ rank: number; student_name: string; score: number; badge: string }> = [];
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const rank = i > 0 && entry.score === entries[i - 1].score ? ranked[i - 1].rank : i + 1;
      ranked.push({
        rank,
        student_name: entry.studentName,
        score: entry.score,
        badge: rank === 1 ? 'GOLD' : rank === 2 ? 'SILVER' : rank === 3 ? 'BRONZE' : 'TOP',
      });
    }

    return {
      ...baseResult,
      total_ranked: ranked.length,
      top_students: ranked.slice(0, maxRows),
    };
  }
}
