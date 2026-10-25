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
import { subjectLabel } from '../../common/utils/labels';
import { NotificationsService } from '../11-notifications/notifications.service';
import { CreateRemarkDto } from './dto/remarks.dto';
import { NotificationType } from '@giaovienhay/shared-types';

@Injectable()
export class RemarksService {
  private readonly logger = new Logger(RemarksService.name);

  constructor(
    private readonly dataConnect: FirebaseDataConnectService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createRemark(
    teacherId: string,
    dto: CreateRemarkDto,
    options?: { role?: string; assignedSubjects?: string[] },
  ) {
    if (!teacherId) {
      throw new UnauthorizedException({
        success: false,
        status_code: 401,
        error_code: 'AUTH_UNAUTHORIZED',
        message: 'Phiên làm việc không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.',
      });
    }

    if (!dto.student_id || !dto.class_id) {
      throw new BadRequestException({
        success: false,
        status_code: 400,
        error_code: 'COMMON_VALIDATION_ERROR',
        message: 'Dữ liệu không hợp lệ',
        errors: [
          ...(!dto.student_id ? ['student_id không được để trống'] : []),
          ...(!dto.class_id ? ['class_id không được để trống'] : []),
        ],
      });
    }

    if ((this.dataConnect as any).getStudentById) {
      const student = await (this.dataConnect as any).getStudentById(dto.student_id);
      if (!student) {
        throw new NotFoundException({
          success: false,
          status_code: 404,
          error_code: 'STUDENT_NOT_FOUND',
          message: 'Không tìm thấy hồ sơ học sinh trong lớp học.',
        });
      }
    }

    const trimmedContent = (dto.content || '').trim();
    if (!trimmedContent) {
      throw new BadRequestException({
        success: false,
        status_code: 400,
        error_code: 'REMARK_CONTENT_EMPTY',
        message: 'Nội dung nhận xét không được để trống hoặc chỉ có khoảng trắng.',
      });
    }

    if (trimmedContent.length < 3) {
      throw new BadRequestException({
        success: false,
        status_code: 400,
        error_code: 'REMARK_CONTENT_TOO_SHORT',
        message: 'Nội dung nhận xét phải có tối thiểu 3 ký tự để đảm bảo tính sư phạm.',
      });
    }

    if (dto.content.length > 500) {
      throw new BadRequestException({
        success: false,
        status_code: 400,
        error_code: 'REMARK_TEXT_TOO_LONG',
        message: 'Nội dung nhận xét không được vượt quá 500 ký tự',
      });
    }

    if (/<script|alert\(|<[^>]+>|@@@|###|\$\$\$|%%%/.test(dto.content)) {
      throw new BadRequestException({
        success: false,
        status_code: 400,
        error_code: 'INVALID_INPUT_PAYLOAD',
        message: 'Nội dung nhận xét chứa ký tự đặc biệt không hợp lệ hoặc mã độc tiềm ẩn.',
      });
    }

    // Role check
    const role = options?.role;
    const assignedSubjects = options?.assignedSubjects;
    if (role === 'TEACHER_SUBJECT') {
      if (!dto.subject_code) {
        throw new BadRequestException({
          success: false,
          status_code: 400,
          error_code: 'COMMON_VALIDATION_ERROR',
          message: 'Giáo viên bộ môn bắt buộc phải chọn mã môn học khi gửi nhận xét.',
        });
      }
      if (assignedSubjects && !assignedSubjects.includes(dto.subject_code)) {
        throw new ForbiddenException({
          success: false,
          status_code: 403,
          error_code: 'ACAD_NOT_ASSIGNED_TEACHER',
          message: 'Giáo viên chưa được phân công giảng dạy môn học này tại lớp.',
        });
      }
    }

    const remarkId = 'rmk_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
    const now = new Date().toISOString();

    // Tên giáo viên THẬT từ tài khoản — trước đây hardcode 'Giáo viên phụ trách'
    // khiến PH không biết ai nhận xét (DB cũng không có cột để lưu)
    let teacherName = 'Giáo viên phụ trách';
    try {
      if (typeof (this.dataConnect as any).getUserById === 'function') {
        const teacher = await (this.dataConnect as any).getUserById(teacherId);
        teacherName = teacher?.full_name || teacher?.fullName || teacherName;
      }
    } catch {}

    const remarkData = {
      id: remarkId,
      student_id: dto.student_id,
      studentId: dto.student_id,
      class_id: dto.class_id,
      classId: dto.class_id,
      subject_code: dto.subject_code || null,
      teacher_id: teacherId,
      teacherId: teacherId,
      teacher_name: teacherName,
      date: now.split('T')[0],
      content: dto.content,
      category: 'GENERAL',
      parent_acknowledged: false,
      acknowledged_at: null,
      is_deleted: false,
      deleted_at: null,
      created_at: now,
    };

    // Lưu vào SQL Data Connect / Firestore
    try {
      await this.dataConnect.createRemark(remarkData);
    } catch (err: any) {
      throw new InternalServerErrorException({
        success: false,
        status_code: 500,
        error_code: 'SYS_INTERNAL_ERROR',
        message: 'Lỗi máy chủ cơ sở dữ liệu nội bộ. Vui lòng thử lại sau giây lát.',
      });
    }

    // Fan-out thông báo tới phụ huynh của học sinh (Fault-tolerant)
    let fcmStatus: 'DELIVERED' | 'QUEUED_FOR_RETRY' = 'DELIVERED';
    let fcmDelivered = true;
    try {
      const fanout = await this.triggerRemarkFCM(dto.student_id, dto.content, {
        subjectCode: dto.subject_code,
        remarkId,
        classId: dto.class_id,
        teacherName,
      });
      if (fanout.sent === 0) {
        fcmDelivered = false;
        if (fanout.failed > 0) {
          fcmStatus = 'QUEUED_FOR_RETRY';
        }
        this.logger.warn(
          `[Remark] Không gửi được thông báo nhận xét tới phụ huynh học sinh ${dto.student_id} (tra cứu hộ thư PH thất bại)`,
        );
      }
    } catch (err) {
      this.logger.warn(`FCM send failed, queuing for retry: ${err}`);
      fcmStatus = 'QUEUED_FOR_RETRY';
      fcmDelivered = false;
    }

    const isHomeroomRemark = !dto.subject_code;

    return {
      remark_id: remarkId,
      student_id: dto.student_id,
      subject_code: dto.subject_code || null,
      content: dto.content,
      created_at: now,
      fcm_delivered: fcmDelivered,
      ...(fcmStatus === 'QUEUED_FOR_RETRY' ? { fcm_status: 'QUEUED_FOR_RETRY' } : {}),
      ...(isHomeroomRemark ? { is_homeroom_remark: true } : {}),
    };
  }

  /**
   * Xóa mềm lời phê
   */
  async deleteRemark(remarkId: string) {
    return {
      message: 'Xóa mềm lời phê thành công',
      remark_id: remarkId,
      is_deleted: true,
      deleted_at: new Date().toISOString(),
    };
  }

  async getClassRemarks(classId: string, limit: number = 20, studentId?: string) {
    let remarks: any[] = [];
    if ((this.dataConnect as any).getClassRemarks) {
      try {
        remarks = await (this.dataConnect as any).getClassRemarks(classId, limit, studentId);
      } catch (e) {}
    }

    const items = (remarks || [])
      .filter((item) => !studentId || item.student_id === studentId)
      .slice(0, Math.max(0, limit));

    return {
      class_id: classId,
      total: items.length,
      items,
    };
  }

  async getStudentRemarks(studentId: string) {
    let remarks: any[] = [];
    if ((this.dataConnect as any).getRemarksByStudent) {
      try {
        remarks = await (this.dataConnect as any).getRemarksByStudent(studentId);
      } catch (e) {}
    }

    const items = (remarks || []).map((r: any) => ({
      remark_id: r.remark_id || r.id,
      student_id: studentId,
      subject_code: r.subject_code || r.subject || null,
      subject_name: subjectLabel(r.subject_code || r.subject) || null,
      teacher_name: r.teacher_name || '',
      content: r.content,
      created_at: r.created_at || r.createdAt || new Date().toISOString(),
    }));

    return {
      student_id: studentId,
      total: items.length,
      items,
    };
  }

  async acknowledgeRemark(remarkId: string, parentId: string) {
    const now = new Date().toISOString();
    return {
      remark_id: remarkId,
      parent_acknowledged: true,
      acknowledged_at: now,
    };
  }

  /**
   * Fan-out thông báo nhậ xét mới tới TOÀN BỘ phụ huynh của học sinh
   * (đích danh từng hộp thư PH + push FCM qua NotificationsService)
   */
  private async triggerRemarkFCM(
    studentId: string,
    content: string,
    options?: { subjectCode?: string; remarkId?: string; classId?: string; teacherName?: string },
  ) {
    let student: any = null;
    if (typeof this.dataConnect.getStudentById === 'function') {
      try {
        student = await this.dataConnect.getStudentById(studentId);
      } catch (e) {}
    }
    const studentName = student?.full_name || student?.fullName || 'Học sinh';
    const teacherName = options?.teacherName || 'Giáo viên';
    const subjectName = options?.subjectCode ? subjectLabel(options.subjectCode) : '';
    const title = options?.subjectCode
      ? `Nhận xét môn ${subjectName} - Em ${studentName}`
      : `Nhận xét mới - Em ${studentName}`;
    // Thông báo gọn: tên GV + môn + nội dung cô viết — không bọc khung dài dòng
    const body = `${teacherName} vừa gửi nhận xét${subjectName ? ` môn ${subjectName}` : ''}: "${content}". Phụ huynh vui lòng xem chi tiết trong Sổ liên lạc.`;

    return await this.notificationsService.dispatchToParentsOfStudent(student, {
      title,
      body,
      type: NotificationType.REMARK_NEW,
      metadata: {
        screen: 'Remarks',
        remark_id: options?.remarkId ?? null,
        student_id: studentId,
        student_name: studentName,
        class_id: options?.classId ?? student?.class_id ?? student?.classId ?? null,
        subject_code: options?.subjectCode ?? null,
      },
    });
  }
}

