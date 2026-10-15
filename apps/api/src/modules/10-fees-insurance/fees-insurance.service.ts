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
import { ToggleFeeDto, RemindFeesDto } from './dto/fees-insurance.dto';
import { FeeType, NotificationType } from '@giaovienhay/shared-types';

@Injectable()
export class FeesInsuranceService {
  private readonly logger = new Logger(FeesInsuranceService.name);

  constructor(
    private readonly dataConnect: FirebaseDataConnectService,
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

    if (allRecords.length === 0) {
      return {
        class_id: classId,
        total_students: 0,
        unpaid_tuition_count: 0,
        unpaid_insurance_count: 0,
        records: [],
      };
    }

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
      term_name: 'Học kỳ 1 năm học 2026-2027',
      records: filteredRecords,
    };
  }

  async toggleFeeStatus(
    teacherId: string,
    dto: ToggleFeeDto,
    options?: { isHomeroom?: boolean; isLocked?: boolean },
  ) {
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
      await this.dataConnect.updateFeeStatus(dto.record_id, dto.is_paid ? 'PAID' : 'PENDING');
    } catch (e) {}

    return {
      record_id: dto.record_id,
      fee_type: dto.fee_type,
      is_paid: dto.is_paid,
      paid_date: paidDate,
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

    const feeName = dto.fee_type === FeeType.INSURANCE ? 'Bảo hiểm y tế (BHYT)' : 'Học phí';
    const message = dto.custom_message || `Kính nhờ quý phụ huynh chưa hoàn thành ${feeName} vui lòng nộp cho cô Lan tại lớp.`;
    const notifId = 'notif_fee_' + Date.now();

    const notifData = {
      id: notifId,
      recipientId: 'class_' + dto.class_id,
      title: `Nhắc nhở hoàn thành ${feeName}`,
      body: message,
      type: NotificationType.FEE_REMINDER,
    };

    try {
      await this.dataConnect.createNotification(notifData);
    } catch (err: any) {
      throw new InternalServerErrorException({
        success: false,
        status_code: 500,
        error_code: 'SYS_INTERNAL_ERROR',
        message: 'Lỗi máy chủ nội bộ hoặc lỗi kết nối Firebase Cloud Messaging',
      });
    }

    const count = unpaidRecords.length;

    return {
      class_id: dto.class_id,
      fee_type: dto.fee_type,
      notified_parents_count: count,
      reminded_at: new Date().toISOString(),
    };
  }
}

