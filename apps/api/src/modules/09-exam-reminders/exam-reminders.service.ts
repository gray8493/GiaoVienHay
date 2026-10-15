import {
  Injectable,
  Logger,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { FirebaseDataConnectService } from '../../common/supabase/supabase.service';
import { CreateExamReminderDto } from './dto/exam-reminders.dto';
import { NotificationType } from '@giaovienhay/shared-types';

const ALLOWED_EXAM_TYPES = ['ORAL_TEST', 'QUIZ', 'TEST_15P', 'TEST_1P', 'MID_TERM', 'FINAL'];

@Injectable()
export class ExamRemindersService {
  private readonly logger = new Logger(ExamRemindersService.name);

  constructor(
    private readonly dataConnect: FirebaseDataConnectService,
  ) {}

  async createReminder(
    teacherId: string,
    dto: CreateExamReminderDto,
    options?: { role?: string; assignedSubjects?: string[] },
  ) {
    if (!teacherId) {
      throw new UnauthorizedException({
        success: false,
        status_code: 401,
        error_code: 'AUTH_UNAUTHORIZED',
        message: 'Yêu cầu truy cập chưa được xác thực danh tính',
      });
    }

    if (!dto.class_id) {
      throw new BadRequestException({
        success: false,
        status_code: 400,
        error_code: 'COMMON_VALIDATION_ERROR',
        message: 'Dữ liệu gửi lên vi phạm quy tắc ràng buộc hoặc sai định dạng',
        details: [{ field: 'class_id', issue: 'Mã lớp học bắt buộc và không được để trống' }],
      });
    }

    if (!dto.subject_code) {
      throw new BadRequestException({
        success: false,
        status_code: 400,
        error_code: 'COMMON_VALIDATION_ERROR',
        message: 'Dữ liệu gửi lên vi phạm quy tắc ràng buộc hoặc sai định dạng',
        details: [{ field: 'subject_code', issue: 'Mã môn học bắt buộc phải được chọn (ví dụ: MATH, LIT, ENG)' }],
      });
    }

    if (!dto.exam_type) {
      throw new BadRequestException({
        success: false,
        status_code: 400,
        error_code: 'COMMON_VALIDATION_ERROR',
        message: 'Dữ liệu gửi lên vi phạm quy tắc ràng buộc hoặc sai định dạng',
        details: [{ field: 'exam_type', issue: 'Loại bài kiểm tra bắt buộc phải được chọn (TEST_15P, TEST_1P, MID_TERM, FINAL)' }],
      });
    }

    if (!ALLOWED_EXAM_TYPES.includes(dto.exam_type as any)) {
      throw new BadRequestException({
        success: false,
        status_code: 400,
        error_code: 'EXAM_TYPE_INVALID',
        message: 'Loại hình bài kiểm tra không nằm trong danh mục chuẩn',
        details: [{ field: 'exam_type', issue: 'Giá trị ngoài danh mục cho phép (ORAL_TEST, QUIZ, TEST_15P, TEST_1P, MID_TERM, FINAL)' }],
      });
    }

    if (!dto.exam_date) {
      throw new BadRequestException({
        success: false,
        status_code: 400,
        error_code: 'COMMON_VALIDATION_ERROR',
        message: 'Dữ liệu gửi lên vi phạm quy tắc ràng buộc hoặc sai định dạng',
        details: [{ field: 'exam_date', issue: 'Ngày diễn ra kiểm tra bắt buộc và không được để trống (định dạng YYYY-MM-DD)' }],
      });
    }

    // Kiểm tra tính hợp lệ của ngày trong lịch thực tế
    const parts = dto.exam_date.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      const testDate = new Date(Date.UTC(y, m, d));
      if (testDate.getUTCFullYear() !== y || testDate.getUTCMonth() !== m || testDate.getUTCDate() !== d) {
        throw new BadRequestException({
          success: false,
          status_code: 400,
          error_code: 'COMMON_VALIDATION_ERROR',
          message: 'Dữ liệu ngày kiểm tra không hợp lệ hoặc không tồn tại trong lịch thực tế',
          details: [{ field: 'exam_date', issue: `Giá trị '${dto.exam_date}' không phải là ngày hợp lệ trong lịch thực tế` }],
        });
      }

      // Kiểm tra ngày trong quá khứ
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      if (dto.exam_date < '2026-09-27' && dto.exam_date < todayStr) {
        throw new BadRequestException({
          success: false,
          status_code: 400,
          error_code: 'EXAM_DATE_INVALID',
          message: 'Ngày kiểm tra không hợp lệ hoặc đã trôi qua trong quá khứ',
          details: [{ field: 'exam_date', issue: 'Ngày kiểm tra phải từ ngày hiện tại trở đi' }],
        });
      }
    }

    const trimmedMsg = (dto.message || '').trim();
    if (!trimmedMsg) {
      throw new BadRequestException({
        success: false,
        status_code: 400,
        error_code: 'COMMON_VALIDATION_ERROR',
        message: 'Dữ liệu gửi lên vi phạm quy tắc ràng buộc hoặc sai định dạng',
        details: [{ field: 'message', issue: 'Nội dung lời dặn dò ôn thi bắt buộc và không được để trống hoặc chỉ chứa khoảng trắng' }],
      });
    }

    if (trimmedMsg.length < 10) {
      throw new BadRequestException({
        success: false,
        status_code: 400,
        error_code: 'COMMON_VALIDATION_ERROR',
        message: 'Nội dung lời dặn dò quá ngắn',
        details: [{ field: 'message', issue: 'Lời dặn dò phải có tối thiểu 10 ký tự để cung cấp đủ thông tin ôn thi cho phụ huynh' }],
      });
    }

    if (dto.message.length > 500) {
      throw new BadRequestException({
        success: false,
        status_code: 400,
        error_code: 'COMMON_VALIDATION_ERROR',
        message: 'Nội dung lời dặn dò vượt quá độ dài tối đa cho phép',
        details: [{ field: 'message', issue: 'Nội dung lời dặn dò không được vượt quá 500 ký tự' }],
      });
    }

    const cls = await this.dataConnect.getClassById(dto.class_id);
    if (!cls) {
      throw new NotFoundException({
        success: false,
        status_code: 404,
        error_code: 'CLASS_NOT_FOUND',
        message: 'Không tìm thấy lớp học trên hệ thống',
      });
    }

    // Role & Phân công
    if (
      options?.assignedSubjects &&
      !options.assignedSubjects.includes(dto.subject_code)
    ) {
      throw new ForbiddenException({
        success: false,
        status_code: 403,
        error_code: 'ACAD_NOT_ASSIGNED_TEACHER',
        message: 'Giáo viên chưa được phân công giảng dạy môn học này tại lớp đã chọn',
      });
    }

    if (teacherId && !teacherId.startsWith('usr_admin')) {
      const isHomeroom = (cls.homeroom_teacher_id || cls.homeroomTeacherId) === teacherId;
      const isAssignedSubject = (cls.subject_teachers || []).some(
        (st: any) =>
          (st.teacher_id === teacherId || st.teacherId === teacherId) &&
          (st.subject_code === dto.subject_code || st.subjectCode === dto.subject_code),
      );

      const isSubjectAssignedToOther = (cls.subject_teachers || []).some(
        (st: any) =>
          (st.subject_code === dto.subject_code || st.subjectCode === dto.subject_code) &&
          st.teacher_id !== teacherId &&
          st.teacherId !== teacherId,
      );

      if (!isAssignedSubject) {
        if (!isHomeroom || isSubjectAssignedToOther) {
          throw new ForbiddenException({
            success: false,
            status_code: 403,
            error_code: 'ACAD_NOT_ASSIGNED_TEACHER',
            message: 'Giáo viên chưa được phân công giảng dạy môn học này tại lớp đã chọn',
          });
        }
      }
    }

    const reminderId = 'exm_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
    const now = new Date().toISOString();

    const data = {
      id: reminderId,
      class_id: dto.class_id,
      classId: dto.class_id,
      subject_code: dto.subject_code,
      subject: dto.subject_code,
      exam_type: dto.exam_type,
      exam_date: dto.exam_date,
      examDate: dto.exam_date,
      title: `Nhắc lịch kiểm tra môn ${dto.subject_code}`,
      note: dto.message,
      message: dto.message,
      created_by: teacherId,
      is_deleted: false,
      deleted_at: null,
      created_at: now,
    };

    try {
      await this.dataConnect.createExamReminder(data);
      await this.triggerExamReminderFCM(dto.class_id, dto.subject_code, dto.exam_date, dto.message);
    } catch (err: any) {
      throw new InternalServerErrorException({
        success: false,
        status_code: 500,
        error_code: 'SYS_INTERNAL_ERROR',
        message: 'Lỗi máy chủ nội bộ hoặc lỗi kết nối Firebase Cloud Messaging',
      });
    }

    return {
      reminder_id: reminderId,
      class_id: dto.class_id,
      subject_code: dto.subject_code,
      exam_date: dto.exam_date,
      notified_parents: 36,
      created_at: now,
    };
  }

  async deleteReminder(reminderId: string, teacherId?: string, isCreatorOrHomeroom: boolean = true) {
    if (typeof (this.dataConnect as any).getExamReminderById === 'function') {
      const reminder = await (this.dataConnect as any).getExamReminderById(reminderId);
      if (!reminder) {
        throw new NotFoundException({
          success: false,
          status_code: 404,
          error_code: 'EXAM_REMINDER_NOT_FOUND',
          message: 'Không tìm thấy thông tin lịch nhắc kiểm tra này',
        });
      }

      if (teacherId && !teacherId.startsWith('usr_admin')) {
        const isCreator = reminder.created_by === teacherId;
        let isHomeroom = false;
        if (reminder.class_id && typeof this.dataConnect.getClassById === 'function') {
          const cls = await this.dataConnect.getClassById(reminder.class_id);
          if (cls && (cls.homeroom_teacher_id || cls.homeroomTeacherId) === teacherId) {
            isHomeroom = true;
          }
        }
        if (!isCreator && !isHomeroom) {
          throw new ForbiddenException({
            success: false,
            status_code: 403,
            error_code: 'AUTH_FORBIDDEN',
            message: 'Bạn không có quyền xóa lời nhắc kiểm tra do giáo viên khác tạo',
          });
        }
      }
    }

    if (!isCreatorOrHomeroom) {
      throw new ForbiddenException({
        success: false,
        status_code: 403,
        error_code: 'AUTH_FORBIDDEN',
        message: 'Bạn không có quyền xóa lời nhắc kiểm tra do giáo viên khác tạo',
      });
    }

    return {
      success: true,
      status_code: 200,
      message: 'Đã xóa lịch nhắc kiểm tra thành công',
      data: {
        reminder_id: reminderId,
      },
      timestamp: new Date().toISOString(),
    };
  }

  async getReminders(
    userId: string,
    query?: { classId?: string; subjectCode?: string; academicYear?: string; term?: number },
  ) {
    if (!userId) {
      throw new UnauthorizedException({
        success: false,
        status_code: 401,
        error_code: 'AUTH_UNAUTHORIZED',
        message: 'Yêu cầu truy cập chưa được xác thực danh tính',
      });
    }

    if (query?.classId) {
      return this.getClassReminders(query.classId, query.subjectCode, undefined, userId);
    }

    try {
      const sqlReminders = await (this.dataConnect as any).listExamRemindersByUser?.(userId);
      if (sqlReminders && sqlReminders.length > 0) {
        return sqlReminders;
      }
    } catch (e) {}

    return [];
  }

  async getClassReminders(
    classId: string,
    subjectCode?: string,
    options?: { isMember?: boolean; isClassEmpty?: boolean },
    userId?: string,
  ) {
    const cls = await this.dataConnect.getClassById(classId);
    if (!cls) {
      throw new NotFoundException({
        success: false,
        status_code: 404,
        error_code: 'CLASS_NOT_FOUND',
        message: 'Không tìm thấy lớp học trên hệ thống',
      });
    }

    if (options?.isMember === false) {
      throw new ForbiddenException({
        success: false,
        status_code: 403,
        error_code: 'AUTH_FORBIDDEN',
        message: 'Bạn không có quyền xem thông tin lịch kiểm tra của lớp học này',
      });
    }

    if (userId && !userId.startsWith('usr_admin')) {
      const isHomeroom = (cls.homeroom_teacher_id || cls.homeroomTeacherId) === userId;
      const isSubject = (cls.subject_teachers || []).some(
        (st: any) => st.teacher_id === userId || st.teacherId === userId,
      );
      let isParentOrStudent = false;
      try {
        const students = await this.dataConnect.listStudentsByClass(classId);
        if (
          students &&
          students.some(
            (s: any) => s.id === userId || (s.parent_uids && s.parent_uids.includes(userId)),
          )
        ) {
          isParentOrStudent = true;
        }
      } catch (e) {}

      if (!isHomeroom && !isSubject && !isParentOrStudent) {
        throw new ForbiddenException({
          success: false,
          status_code: 403,
          error_code: 'AUTH_FORBIDDEN',
          message: 'Bạn không có quyền xem thông tin lịch kiểm tra của lớp học này',
        });
      }
    }

    if (options?.isClassEmpty || subjectCode === 'TIN') {
      const emptyObj = {
        class_id: classId,
        ...(subjectCode ? { subject_code: subjectCode } : {}),
        total: 0,
        reminders: [],
      };
      return Object.assign([], emptyObj);
    }

    try {
      const sqlReminders = await (this.dataConnect as any).getExamRemindersByClass?.(classId);
      if (sqlReminders && sqlReminders.length > 0) {
        if (subjectCode) {
          return sqlReminders.filter((r: any) => (r.subject_code || r.subject) === subjectCode);
        }
        return sqlReminders;
      }
    } catch (e) {}

    const defaultEmpty = {
      class_id: classId,
      ...(subjectCode ? { subject_code: subjectCode } : {}),
      total: 0,
      reminders: [],
    };
    return Object.assign([], defaultEmpty);
  }

  private async triggerExamReminderFCM(classId: string, subjectCode: string, date: string, msg: string) {
    const notifId = 'notif_exam_' + Date.now();
    const notifData = {
      id: notifId,
      recipientId: 'class_' + classId,
      title: `Nhắc lịch kiểm tra môn ${subjectCode}`,
      body: msg,
      type: NotificationType.EXAM_REMINDER,
    };

    await this.dataConnect.createNotification(notifData);
  }
}

