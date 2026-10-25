import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { FirebaseDataConnectService } from '../../common/supabase/supabase.service';
import { FirebaseAdminService } from '../../common/firebase/firebase-admin.service';
import { QueryNotificationsDto } from './dto/notifications.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly dataConnect: FirebaseDataConnectService,
    private readonly firebaseAdmin: FirebaseAdminService,
  ) {}

  async getMyNotifications(userId: string, query: any) {
    if (!userId) {
      throw new UnauthorizedException({
        success: false,
        status_code: 401,
        error_code: 'AUTH_UNAUTHORIZED',
        message: 'Phiên làm việc không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.',
      });
    }

    if (query?.page !== undefined && Number(query.page) <= 0) {
      throw new BadRequestException({
        success: false,
        status_code: 400,
        error_code: 'COMMON_VALIDATION_ERROR',
        message: 'Số trang (page) phải là số nguyên dương lớn hơn hoặc bằng 1',
      });
    }

    if (query?.limit !== undefined && Number(query.limit) > 100) {
      throw new BadRequestException({
        success: false,
        status_code: 400,
        error_code: 'COMMON_VALIDATION_ERROR',
        message: 'Số lượng bản ghi mỗi trang (limit) không được vượt quá 100',
      });
    }

    if (query?.is_read !== undefined && query?.is_read !== 'true' && query?.is_read !== 'false' && typeof query?.is_read !== 'boolean') {
      throw new BadRequestException({
        success: false,
        status_code: 400,
        error_code: 'COMMON_VALIDATION_ERROR',
        message: 'Tham số is_read phải là kiểu boolean (true hoặc false)',
      });
    }

    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 20;

    let allItems: any[] = [];
    try {
      allItems = await this.dataConnect.getNotificationsByRecipient(userId);
    } catch (err: any) {
      this.logger.error(`[Notifications] getNotificationsByRecipient error: ${err?.message}`);
      throw new InternalServerErrorException({
        success: false,
        status_code: 500,
        error_code: 'NOTI_READ_FAILED',
        message: 'Không thể tải hộp thư thông báo từ cơ sở dữ liệu. Vui lòng thử lại.',
      });
    }

    let items = allItems;
    if (query?.is_read !== undefined) {
      const boolVal = query.is_read === true || query.is_read === 'true';
      items = items.filter((n) => n.is_read === boolVal);
    }

    const unreadCount = allItems.filter((n) => !n.is_read).length;
    const startIndex = (page - 1) * limit;
    const paginatedItems = items.slice(startIndex, startIndex + limit);

    return {
      message: 'Lấy danh sách thông báo thành công',
      unread_count: unreadCount,
      total: items.length,
      items: paginatedItems,
    };
  }

  async markAsRead(userId: string, notifId: string) {
    const notif = await this.dataConnect.getNotificationById(notifId);
    if (!notif) {
      throw new NotFoundException({
        success: false,
        status_code: 404,
        error_code: 'NOTI_NOT_FOUND',
        message: 'Không tìm thấy bản ghi thông báo trong hộp thư.',
      });
    }

    // Bảo mật: tài khoản chỉ được đánh dấu đã đọc thông báo của chính mình
    const notifAny = notif as any;
    const owner = notifAny.recipient_user_id ?? notifAny.recipient_id ?? notifAny.recipientId;
    if (owner && owner !== userId) {
      throw new NotFoundException({
        success: false,
        status_code: 404,
        error_code: 'NOTI_NOT_FOUND',
        message: 'Thông báo này không thuộc hộp thư của tài khoản hiện tại.',
      });
    }

    await this.dataConnect.markNotificationRead(notifId);

    return {
      success: true,
      status_code: 200,
      message: 'Đã đánh dấu thông báo là đã đọc',
    };
  }

  async markAllAsRead(userId: string) {
    let allItems: any[] = [];
    try {
      allItems = await this.dataConnect.getNotificationsByRecipient(userId);
    } catch {
      allItems = [];
    }

    const unread = allItems.filter((n) => !n.is_read);

    if (unread.length === 0) {
      return {
        success: true,
        status_code: 200,
        message: 'Không có thông báo chưa đọc nào cần cập nhật',
        data: { updated_count: 0 },
      };
    }

    // Đánh dấu đọc tất cả (song song để nhanh)
    await Promise.all(unread.map((n) => this.dataConnect.markNotificationRead(n.id).catch(() => null)));

    return {
      success: true,
      status_code: 200,
      message: 'Đã đánh dấu toàn bộ thông báo là đã đọc',
      data: {
        updated_count: unread.length,
        unread_count: 0,
      },
    };
  }

  /**
   * Gửi thông báo đẩy FCM + lưu vào DB
   * Được gọi từ các module nghiệp vụ (Attendance, Grades, Fees...)
   */
  async dispatchNotification(payload: {
    recipientUserId: string;
    title: string;
    body: string;
    type: string;
    deviceTokens?: string[];
    metadata?: any;
  }, options: { requirePersistence?: boolean } = {}): Promise<{ saved: boolean; pushed: boolean }> {
    if (
      !payload ||
      !payload.recipientUserId ||
      !payload.title ||
      !payload.body ||
      !payload.type
    ) {
      throw new InternalServerErrorException({
        success: false,
        status_code: 500,
        error_code: 'NOTI_DISPATCH_FAILED',
        message: 'Đạo tuyến thông báo thiếu tham số bắt buộc (người nhận/tiêu đề/nội dung/kiểu).',
      });
    }

    // Persist the inbox item before push. Fee updates/reminders require durable
    // storage; other notification callers retain their existing memory fallback.
    let saved = false;
    try {
      await this.dataConnect.createNotification({
        recipient_user_id: payload.recipientUserId,
        title: payload.title,
        body: payload.body,
        type: payload.type,
        metadata: payload.metadata ?? null,
      }, options);
      saved = true;
      this.logger.log(`[Notify] Đã lưu thông báo cho ${payload.recipientUserId}: ${payload.title}`);
    } catch (err: any) {
      this.logger.error(`[Notify] Lỗi lưu thông báo: ${err?.message}`);
      if (options.requirePersistence) {
        throw new InternalServerErrorException({
          success: false,
          status_code: 500,
          error_code: 'NOTI_PERSIST_FAILED',
          message: 'Không thể lưu thông báo vào hộp thư. Thông báo đẩy chưa được gửi.',
        });
      }
    }

    // 2. Tra cứu device tokens từ DB nếu caller không truyền trực tiếp
    let targetTokens = payload.deviceTokens || [];
    if (targetTokens.length === 0 && payload.recipientUserId) {
      try {
        const user = await this.dataConnect.getUserById(payload.recipientUserId);
        if (user) {
          const raw = user.assigned_info ?? user.assignedInfo;
          const assigned = typeof raw === 'string' ? JSON.parse(raw) : (raw || {});
          targetTokens = Array.isArray(assigned.device_tokens)
            ? assigned.device_tokens
            : (assigned.fcm_token ? [assigned.fcm_token] : []);
        }
      } catch (err: any) {
        this.logger.debug(`[Notify] Không thể lấy token từ user ${payload.recipientUserId}: ${err?.message}`);
      }
    }

    // 3. Gửi FCM Push nếu có device tokens hợp lệ
    let pushed = false;
    const validTokens = targetTokens.filter(
      (t) => t && typeof t === 'string' && t.trim().length > 0 && !t.startsWith('fcm_android_') && !t.startsWith('fcm_ios_'),
    );

    if (validTokens.length > 0 && this.firebaseAdmin.isReady()) {
      try {
        const result = await this.firebaseAdmin.sendMulticast({
          tokens: validTokens,
          title: payload.title,
          body: payload.body,
          data: {
            type: payload.type,
            recipient_user_id: payload.recipientUserId,
            ...(payload.metadata ? { metadata: JSON.stringify(payload.metadata) } : {}),
          },
        });
        pushed = result.successCount > 0;
        this.logger.log(`[FCM Push] Gửi tới ${validTokens.length} thiết bị — thành công: ${result.successCount}`);
      } catch (err: any) {
        this.logger.error(`[FCM Push] Lỗi gửi multicast: ${err?.message}`);
      }
    } else if (validTokens.length === 0) {
      this.logger.warn(`[Notify] Không có FCM token hợp lệ cho user ${payload.recipientUserId}`);
    }

    return { saved, pushed };
  }

  /**
   * Tra cứu danh sách userId phụ huynh của một học sinh
   * Ưu tiên danh sách parent_uids (chuẩn bị hỗ trợ đa phụ huynh),
   * fallback parent_phone -> getUserByPhone
   */
  async resolveParentUserIdsForStudent(student: any): Promise<string[]> {
    const parentUserIds: string[] = [];
    const pushUnique = (id: any) => {
      if (id && typeof id === 'string' && !parentUserIds.includes(id)) {
        parentUserIds.push(id);
      }
    };

    const rawUids = student?.parent_uids ?? student?.parentUids ?? [];
    if (Array.isArray(rawUids)) {
      rawUids.forEach(pushUnique);
    }

    const parentPhone = student?.parent_phone ?? student?.parentPhone;
    if (parentPhone && typeof this.dataConnect.getUserByPhone === 'function') {
      try {
        const parentUser = await this.dataConnect.getUserByPhone(parentPhone);
        pushUnique(parentUser?.id);
      } catch (err: any) {
        this.logger.warn(
          `[Fan-out] Không tra cứu được phụ huynh theo SĐT (${parentPhone}): ${err?.message}`,
        );
      }
    }

    return parentUserIds;
  }

  /**
   * Fan-out thông báo tới TOÀN BỘ phụ huynh của một học sinh (đích danh từng hộp thư)
   * Fault-tolerant: lỗi 1 phụ huynh không ảnh hưởng phụ huynh khác, không đổ lỗi lên nghiệp vụ
   */
  async dispatchToParentsOfStudent(
    student: any,
    payload: { title: string; body: string; type: string; metadata?: any },
    options: { requirePersistence?: boolean } = {},
  ): Promise<{ sent: number; failed: number; parentUserIds: string[] }> {
    const parentUserIds = await this.resolveParentUserIdsForStudent(student);
    let sent = 0;
    let failed = 0;

    for (const parentUserId of parentUserIds) {
      try {
        const result = await this.dispatchNotification({ recipientUserId: parentUserId, ...payload }, options);
        if (options.requirePersistence && !result.saved) {
          throw new Error('Thông báo không được lưu bền vững vào DB.');
        }
        sent++;
      } catch (err: any) {
        this.logger.warn(`[Fan-out] Dispatch tới phụ huynh ${parentUserId} thất bại: ${err?.message}`);
        failed++;
      }
    }

    return { sent, failed, parentUserIds };
  }

  /**
   * Fan-out thông báo cho phụ huynh TOÀN BỘ học sinh trong lớp
   * build() tạo nội dung riêng theo từng học sinh (tên, metadata deep-link)
   */
  async dispatchToParentsOfClass(
    classId: string,
    build: (student: any) => { title: string; body: string; type: string; metadata?: any } | null,
  ): Promise<{ sent: number; failed: number; students: number }> {
    let students: any[] = [];
    if (typeof this.dataConnect.listStudentsByClass === 'function') {
      try {
        students = (await this.dataConnect.listStudentsByClass(classId)) || [];
      } catch (err: any) {
        this.logger.warn(`[Fan-out] Lỗi lấy danh sách học sinh lớp ${classId}: ${err?.message}`);
      }
    }

    let sent = 0;
    let failed = 0;
    for (const student of students) {
      const payload = build(student);
      if (!payload) continue;
      const res = await this.dispatchToParentsOfStudent(student, payload);
      sent += res.sent;
      failed += res.failed;
    }

    return { sent, failed, students: students.length };
  }

  /**
   * Xóa mềm thông báo
   */
  async deleteNotification(notifId: string) {
    try {
      if (typeof this.dataConnect.softDeleteNotification === 'function') {
        await this.dataConnect.softDeleteNotification(notifId);
      }
    } catch (err: any) {
      this.logger.warn(`[Notify] Lỗi xóa mềm thông báo ${notifId}: ${err?.message}`);
    }
    return {
      message: 'Xóa mềm thông báo thành công',
      id: notifId,
      is_deleted: true,
      deleted_at: new Date().toISOString(),
    };
  }
}
