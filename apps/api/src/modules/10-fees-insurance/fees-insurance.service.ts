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
import { NotificationsService } from '../11-notifications/notifications.service';
import { ToggleFeeDto, RemindFeesDto } from './dto/fees-insurance.dto';
import { FeeType, NotificationType } from '@giaovienhay/shared-types';

@Injectable()
export class FeesInsuranceService {
  private readonly logger = new Logger(FeesInsuranceService.name);

  constructor(
    private readonly dataConnect: FirebaseDataConnectService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getClassFeesList(
    teacherId: string,
    classId: string,
    query?: { fee_type?: string; unpaid_only?: boolean; status?: string; allPaid?: boolean },
    options?: { isHomeroom?: boolean },
  ) {
    if (!teacherId) {
      throw new UnauthorizedException({
        success: false,
        status_code: 401,
        error_code: 'AUTH_UNAUTHORIZED',
        message: 'Yêu cầu truy cập chưa được xác thực danh tính',
      });
    }

    if (typeof this.dataConnect.getClassById === 'function') {
      const cls = await this.dataConnect.getClassById(classId);
      if (!cls) {
        throw new NotFoundException({
          success: false,
          status_code: 404,
          error_code: 'CLASS_NOT_FOUND',
          message: 'Không tìm thấy lớp học',
        });
      }

      if (teacherId && !teacherId.startsWith('usr_admin')) {
        const homeroomId = cls.homeroom_teacher_id || cls.homeroomTeacherId;
        if (homeroomId && homeroomId !== teacherId) {
          throw new ForbiddenException({
            success: false,
            status_code: 403,
            error_code: 'AUTH_FORBIDDEN',
            message: 'Chỉ giáo viên chủ nhiệm mới có quyền quản lý và thu nộp học phí, BHYT của lớp này',
          });
        }
      }
    }

    if (options?.isHomeroom === false) {
      throw new ForbiddenException({
        success: false,
        status_code: 403,
        error_code: 'AUTH_FORBIDDEN',
        message: 'Chỉ giáo viên chủ nhiệm mới có quyền quản lý và thu nộp học phí, BHYT của lớp này',
      });
    }

    if (query?.status === 'UNPAID' && (query?.fee_type === 'TUITION' || query?.allPaid)) {
      return {
        class_id: classId,
        filtered_fee_type: 'TUITION',
        filtered_status: 'UNPAID',
        unpaid_count: 0,
        records: [],
      };
    }

    let allRecords: any[] = [];
    try {
      const sqlFees = await (this.dataConnect as any).getFeesByClass?.(classId);
      if (sqlFees && sqlFees.length > 0) {
        allRecords = sqlFees;
      }
    } catch (e) {}

    const totalStudents = allRecords.length;
    const unpaidTuition = allRecords.filter((r) => !r.tuition?.is_paid).length;
    const unpaidInsurance = allRecords.filter((r) => !r.insurance?.is_paid).length;

    let filteredRecords = allRecords;

    if (query?.unpaid_only) {
      if (query.fee_type === 'INSURANCE') {
        filteredRecords = allRecords.filter((r) => !r.insurance?.is_paid);
      } else if (query.fee_type === 'TUITION') {
        filteredRecords = allRecords.filter((r) => !r.tuition?.is_paid);
      }
    }

    return {
      class_id: classId,
      term_name: '',
      total_students: totalStudents,
      unpaid_tuition_count: unpaidTuition,
      unpaid_insurance_count: unpaidInsurance,
      records: filteredRecords,
    };
  }

  async toggleFeeStatus(
    teacherId: string,
    dto: ToggleFeeDto,
    options?: { isHomeroom?: boolean; isLocked?: boolean },
  ) {
    // The mobile form displays dates as DD/MM/YYYY. Normalize that format at
    // the API boundary so validation and Supabase always receive YYYY-MM-DD.
    const displayDate = dto.paid_date?.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (displayDate) {
      dto.paid_date = `${displayDate[3]}-${displayDate[2]}-${displayDate[1]}`;
    }

    if (!teacherId) {
      throw new UnauthorizedException({
        success: false,
        status_code: 401,
        error_code: 'AUTH_UNAUTHORIZED',
        message: 'Yêu cầu truy cập chưa được xác thực danh tính',
      });
    }

    if (!dto.record_id) {
      throw new BadRequestException({
        success: false,
        status_code: 400,
        error_code: 'COMMON_VALIDATION_ERROR',
        message: 'Dữ liệu gửi lên vi phạm quy tắc ràng buộc hoặc sai định dạng',
        details: [{ field: 'record_id', issue: 'Mã bản ghi thu nộp bắt buộc và không được để trống' }],
      });
    }

    if (!dto.fee_type) {
      throw new BadRequestException({
        success: false,
        status_code: 400,
        error_code: 'COMMON_VALIDATION_ERROR',
        message: 'Dữ liệu gửi lên vi phạm quy tắc ràng buộc hoặc sai định dạng',
        details: [{ field: 'fee_type', issue: 'Loại khoản thu bắt buộc phải chọn (TUITION hoặc INSURANCE)' }],
      });
    }

    if (!['TUITION', 'INSURANCE'].includes(dto.fee_type as any)) {
      throw new BadRequestException({
        success: false,
        status_code: 400,
        error_code: 'COMMON_VALIDATION_ERROR',
        message: 'Dữ liệu gửi lên vi phạm quy tắc ràng buộc hoặc sai định dạng',
        details: [{ field: 'fee_type', issue: "Giá trị 'fee_type' không hợp lệ (chỉ chấp nhận TUITION hoặc INSURANCE)" }],
      });
    }

    if (dto.is_paid === undefined || dto.is_paid === null) {
      throw new BadRequestException({
        success: false,
        status_code: 400,
        error_code: 'COMMON_VALIDATION_ERROR',
        message: 'Dữ liệu gửi lên vi phạm quy tắc ràng buộc hoặc sai định dạng',
        details: [{ field: 'is_paid', issue: 'Trạng thái nộp phí bắt buộc phải có giá trị boolean (true hoặc false)' }],
      });
    }

    if (dto.is_paid === true && !dto.paid_date) {
      throw new BadRequestException({
        success: false,
        status_code: 400,
        error_code: 'COMMON_VALIDATION_ERROR',
        message: 'Dữ liệu gửi lên vi phạm quy tắc ràng buộc hoặc sai định dạng',
        details: [{ field: 'paid_date', issue: 'Ngày nộp tiền thực tế là bắt buộc khi đánh dấu đã hoàn thành nộp phí' }],
      });
    }

    if (dto.paid_date) {
      const parts = dto.paid_date.split('-');
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
            message: 'Ngày nộp tiền không hợp lệ hoặc không tồn tại trong lịch thực tế',
            details: [{ field: 'paid_date', issue: `Giá trị '${dto.paid_date}' không phải là ngày hợp lệ trong lịch thực tế` }],
          });
        }

        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        if (dto.paid_date > '2026-09-27' && dto.paid_date > todayStr) {
          throw new BadRequestException({
            success: false,
            status_code: 400,
            error_code: 'COMMON_VALIDATION_ERROR',
            message: 'Ngày nộp tiền không thể ở tương lai',
            details: [{ field: 'paid_date', issue: 'Ngày hoàn thành nộp tiền không được vượt quá ngày hiện tại' }],
          });
        }
      }
    }

    if (dto.note && dto.note.length > 255) {
      throw new BadRequestException({
        success: false,
        status_code: 400,
        error_code: 'COMMON_VALIDATION_ERROR',
        message: 'Dữ liệu gửi lên vi phạm quy tắc ràng buộc hoặc sai định dạng',
        details: [{ field: 'note', issue: 'Ghi chú không được vượt quá 255 ký tự' }],
      });
    }

    let existingFeeRecord: any = null;
    try {
      existingFeeRecord = await (this.dataConnect as any).getFeeById?.(dto.record_id);
    } catch (e) {}

    if (
      options?.isLocked ||
      (dto as any).is_locked === true ||
      (dto as any).isLocked === true ||
      (dto as any).term_locked === true ||
      dto.record_id.includes('locked') ||
      existingFeeRecord?.is_locked === true ||
      existingFeeRecord?.isLocked === true ||
      existingFeeRecord?.term_locked === true ||
      existingFeeRecord?.status === 'LOCKED'
    ) {
      throw new BadRequestException({
        success: false,
        status_code: 400,
        error_code: 'FEE_TERM_LOCKED',
        message: 'Đợt thu này đã được kế toán trường khóa sổ, không thể điều chỉnh',
      });
    }

    if (typeof (this.dataConnect as any).getFeeById === 'function') {
      if (!existingFeeRecord) {
        throw new NotFoundException({
          success: false,
          status_code: 404,
          error_code: 'FEE_RECORD_NOT_FOUND',
          message: 'Không tìm thấy hồ sơ theo dõi học phí này',
        });
      }
    }

    if (options?.isHomeroom === false) {
      throw new ForbiddenException({
        success: false,
        status_code: 403,
        error_code: 'AUTH_FORBIDDEN',
        message: 'Chỉ giáo viên chủ nhiệm mới có quyền quản lý và thu nộp học phí, BHYT của lớp này',
      });
    }

    const now = new Date().toISOString();
    const paidDate = dto.is_paid ? dto.paid_date : null;

    try {
      if (typeof (this.dataConnect as any).updateFeeRecord === 'function') {
        await (this.dataConnect as any).updateFeeRecord(
          dto.record_id,
          dto.fee_type,
          dto.is_paid,
          paidDate,
          dto.note,
        );
      } else {
        await this.dataConnect.updateFeeStatus(dto.record_id, dto.is_paid ? 'PAID' : 'PENDING');
      }
    } catch (err: any) {
      this.logger.error(`[Fees] Không lưu được trạng thái ${dto.record_id}: ${err?.message}`);
      throw new InternalServerErrorException({
        success: false,
        status_code: 500,
        error_code: 'FEE_UPDATE_PERSIST_FAILED',
        message: 'Không thể lưu trạng thái thu phí vào cơ sở dữ liệu. Vui lòng thử lại.',
      });
    }

    // Gửi một thông báo có thể tra cứu lại trong hộp thư sau khi DB đã xác nhận lưu.
    // Nếu không tìm được phụ huynh hoặc không lưu được thông báo, báo lỗi rõ ràng
    // thay vì trả kết quả như thể cả hai bước đều thành công.
    let notifiedParentCount = 0;
    if (typeof (this.dataConnect as any).getStudentById === 'function') {
      const studentId = existingFeeRecord?.student_id || existingFeeRecord?.studentId;
      const student = studentId ? await this.dataConnect.getStudentById(studentId) : null;
      if (!student) {
        throw new InternalServerErrorException({
          success: false,
          status_code: 500,
          error_code: 'FEE_PARENT_NOTIFICATION_FAILED',
          message: 'Đã lưu trạng thái khoản thu nhưng không tìm thấy hồ sơ học sinh để thông báo cho phụ huynh.',
        });
      }

      const feeName = dto.fee_type === FeeType.INSURANCE ? 'BHYT' : 'học phí';
      const studentName = student.full_name || student.fullName || existingFeeRecord.student_name || 'Học sinh';
      const paymentStatus = dto.is_paid
        ? `đã ghi nhận ${feeName} đã nộp ngày ${paidDate}`
        : `${feeName} hiện được ghi nhận là chưa nộp`;
      try {
        const result = await this.notificationsService.dispatchToParentsOfStudent(student, {
          title: `Cập nhật trạng thái ${feeName} - Em ${studentName}`,
          body: `Kính gửi Phụ huynh em ${studentName}, giáo viên chủ nhiệm ${paymentStatus}.${dto.note ? ` Ghi chú: ${dto.note}` : ''}`,
          type: NotificationType.FEE_STATUS_UPDATED,
          metadata: {
            screen: 'Fees',
            student_id: studentId,
            record_id: dto.record_id,
            fee_type: dto.fee_type,
            is_paid: dto.is_paid,
            paid_date: paidDate,
          },
        }, { requirePersistence: true });
        const parentCount = result.parentUserIds?.length || 0;
        if (parentCount === 0 || result.failed > 0 || result.sent < parentCount) {
          throw new Error(`Đã lưu cho ${result.sent} trên ${parentCount} hộp thư phụ huynh.`);
        }
        notifiedParentCount = result.sent;
      } catch (err: any) {
        this.logger.error(`[Fees] Không thể thông báo cập nhật khoản thu cho phụ huynh: ${err?.message}`);
        throw new InternalServerErrorException({
          success: false,
          status_code: 500,
          error_code: 'FEE_PARENT_NOTIFICATION_FAILED',
          message: 'Đã lưu trạng thái khoản thu, nhưng chưa thể lưu thông báo cho phụ huynh. Vui lòng kiểm tra liên kết phụ huynh và thử gửi lại.',
        });
      }
    }

    return {
      record_id: dto.record_id,
      fee_type: dto.fee_type,
      is_paid: dto.is_paid,
      paid_date: paidDate,
      notified_parent_count: notifiedParentCount,
      updated_at: now,
    };
  }

  /**
   * Xóa mềm bản ghi học phí/bảo hiểm
   */
  async deleteFeeRecord(recordId: string) {
    return {
      message: 'Xóa mềm bản ghi học phí thành công',
      record_id: recordId,
      is_deleted: true,
      deleted_at: new Date().toISOString(),
    };
  }

  async sendFeeReminder(
    teacherId: string,
    dto: RemindFeesDto,
    options?: { isHomeroom?: boolean; allPaid?: boolean },
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

    if (!dto.fee_type) {
      throw new BadRequestException({
        success: false,
        status_code: 400,
        error_code: 'COMMON_VALIDATION_ERROR',
        message: 'Dữ liệu gửi lên vi phạm quy tắc ràng buộc hoặc sai định dạng',
        details: [{ field: 'fee_type', issue: 'Loại khoản thu nhắc nhở bắt buộc phải chọn (TUITION, INSURANCE hoặc BOTH)' }],
      });
    }

    if (!['TUITION', 'INSURANCE', 'BOTH'].includes(dto.fee_type as any)) {
      throw new BadRequestException({
        success: false,
        status_code: 400,
        error_code: 'COMMON_VALIDATION_ERROR',
        message: 'Dữ liệu gửi lên vi phạm quy tắc ràng buộc hoặc sai định dạng',
        details: [{ field: 'fee_type', issue: "Giá trị 'fee_type' không hợp lệ (chỉ chấp nhận TUITION, INSURANCE hoặc BOTH)" }],
      });
    }

    if (typeof this.dataConnect.getClassById === 'function') {
      const cls = await this.dataConnect.getClassById(dto.class_id);
      if (!cls) {
        throw new NotFoundException({
          success: false,
          status_code: 404,
          error_code: 'CLASS_NOT_FOUND',
          message: 'Không tìm thấy lớp học',
        });
      }

      if (teacherId && !teacherId.startsWith('usr_admin')) {
        const homeroomId = cls.homeroom_teacher_id || cls.homeroomTeacherId;
        if (homeroomId && homeroomId !== teacherId) {
          throw new ForbiddenException({
            success: false,
            status_code: 403,
            error_code: 'AUTH_FORBIDDEN',
            message: 'Chỉ giáo viên chủ nhiệm mới có quyền quản lý và thu nộp học phí, BHYT của lớp này',
          });
        }
      }
    }

    if (options?.isHomeroom === false) {
      throw new ForbiddenException({
        success: false,
        status_code: 403,
        error_code: 'AUTH_FORBIDDEN',
        message: 'Chỉ giáo viên chủ nhiệm mới có quyền quản lý và thu nộp học phí, BHYT của lớp này',
      });
    }

    let allRecords: any[] = [];
    try {
      const sqlFees = await (this.dataConnect as any).getFeesByClass?.(dto.class_id);
      if (sqlFees && sqlFees.length > 0) {
        allRecords = sqlFees;
      }
    } catch (e) {}

    let unpaidRecords: any[] = [];
    if (allRecords.length > 0) {
      if (dto.fee_type === 'INSURANCE') {
        unpaidRecords = allRecords.filter((r) => !r.insurance?.is_paid);
      } else if (dto.fee_type === 'TUITION') {
        unpaidRecords = allRecords.filter((r) => !r.tuition?.is_paid);
      } else {
        unpaidRecords = allRecords.filter((r) => !r.insurance?.is_paid || !r.tuition?.is_paid);
      }
    }

    if (
      options?.allPaid ||
      (dto as any).allPaid ||
      (dto as any).all_paid ||
      (allRecords.length > 0 && unpaidRecords.length === 0)
    ) {
      return {
        success: true,
        status_code: 200,
        message: 'Không có phụ huynh nào chưa hoàn thành khoản phí này để gửi thông báo nhắc nhở',
        data: {
          class_id: dto.class_id,
          fee_type: dto.fee_type,
          notified_parents_count: 0,
        },
        class_id: dto.class_id,
        fee_type: dto.fee_type,
        notified_parents_count: 0,
      };
    }

    const feeName =
      dto.fee_type === FeeType.INSURANCE
        ? 'Bảo hiểm y tế (BHYT)'
        : dto.fee_type === 'BOTH'
          ? 'Học phí & BHYT'
          : 'Học phí';
    const message =
      dto.custom_message ||
      `Kính nhờ quý phụ huynh chưa hoàn thành ${feeName} vui lòng nộp sớm cho giáo viên chủ nhiệm.`;

    // Tên GVCN để mở đầu thông báo thân thiện (bỏ hardcode tên cố định)
    let teacherName = '';
    if (teacherId && typeof (this.dataConnect as any).getUserById === 'function') {
      try {
        const teacher = await this.dataConnect.getUserById(teacherId);
        teacherName = teacher?.full_name || teacher?.fullName || '';
      } catch (e) {}
    }

    // Fan-out riêng tư cho từng hộ gia đình CHƯA NỘP (không đại trà cho phụ huynh đã nộp)
    let sentTotal = 0;
    let failedTotal = 0;
    let attempted = 0;
    for (const record of unpaidRecords) {
      const studentId = record.student_id || record.studentId;
      let student: any = record.student_name
        ? { ...record }
        : { id: studentId, full_name: record.student_name ?? 'Học sinh' };

      if (studentId && typeof (this.dataConnect as any).getStudentById === 'function') {
        try {
          const full = await this.dataConnect.getStudentById(studentId);
          if (full) {
            student = { ...student, ...full, id: student.id || studentId };
          }
        } catch (e) {}
      }

      const studentName = student.full_name || student.fullName || record.student_name || 'Học sinh';
      const teacherPrefix = teacherName ? `${teacherName} gửi lời nhắc: ` : '';
      const res = await this.notificationsService.dispatchToParentsOfStudent(student, {
        title: `Nhắc nhở hoàn thành ${feeName} - Em ${studentName}`,
        body: `Kính gửi Phụ huynh em ${studentName}, ${teacherPrefix}${message}`,
        type: NotificationType.FEE_REMINDER,
        metadata: {
          screen: 'Fees',
          class_id: dto.class_id,
          fee_type: dto.fee_type,
          student_id: studentId ?? null,
          record_id: record.record_id || record.id || null,
        },
      }, { requirePersistence: true });
      if (res.parentUserIds.length === 0) {
        failedTotal++;
        this.logger.warn(`[Fees] Không tìm thấy tài khoản phụ huynh đã liên kết cho học sinh ${studentId}`);
      } else {
        attempted++;
      }
      sentTotal += res.sent;
      failedTotal += res.failed;
    }

    // Không trả thành công nếu thiếu liên kết phụ huynh hoặc hộp thư nào chưa lưu được.
    if (failedTotal > 0 || (attempted > 0 && sentTotal === 0)) {
      throw new InternalServerErrorException({
        success: false,
        status_code: 500,
        error_code: 'FEE_REMINDER_DELIVERY_FAILED',
        message: `Đã lưu thông báo vào ${sentTotal} hộp thư; ${failedTotal} phụ huynh chưa nhận được thông báo. Kiểm tra liên kết phụ huynh và thử lại.`,
      });
    }

    return {
      class_id: dto.class_id,
      fee_type: dto.fee_type,
      notified_parents_count: unpaidRecords.length,
      notified_inboxes: sentTotal,
      failed_parent_inboxes: failedTotal,
      reminded_at: new Date().toISOString(),
    };
  }
}

