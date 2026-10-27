/**
 * UAT05_GVCN_04 — NGHIỆM THU GỬI NHẬN XÉT HỌC SINH (TEXT THUẦN TÚY) VỀ SỔ LIÊN LẠC
 *                VÀ PHẢN HỒI "ĐÃ ĐỌC" 2 CHIỀU
 * Nguồn: docs/testcases/4-acceptance/acceptance_testcase.md (UAT05)
 */
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RemarksService } from '../../apps/api/src/modules/08-remarks/remarks.service';
import { NotificationsService } from '../../apps/api/src/modules/11-notifications/notifications.service';
import { NotificationType } from '@giaovienhay/shared-types';

const GVCN_ID = 'usr_teacher_lan_01'; // Cô Nguyễn Thị Lan
const PHHS_ID = 'usr_parent_hung_01'; // Bác Trần Văn Hùng
const GVCN_NAME = 'Cô Nguyễn Thị Lan';
const CLASS_1A_ID = 'cls_1a_chuvanan';
const STD_BAO_NAM = 'std_baonam';
const NOI_DUNG_KHEN =
  'Thuần túy: Hôm nay Bảo Nam rất hăng hái giơ tay xây dựng bài Toán, viết chữ ngay ngắn sạch đẹp. Cô khen ngợi con!';

function buildRemarkStack() {
  const remarksDb: any[] = [];
  const notifiedInbox: any[] = [];
  const notificationsDb: any[] = [];

  const mockDataConnect = {
    getStudentById: jest.fn(async (id: string) =>
      id === STD_BAO_NAM
        ? {
            id: STD_BAO_NAM, full_name: 'Trần Bảo Nam', class_id: CLASS_1A_ID,
            parent_phone: '0977112233', parent_uids: [PHHS_ID],
          }
        : null,
    ),
    getUserById: jest.fn(async (id: string) =>
      id === GVCN_ID ? { id, full_name: GVCN_NAME, role: 'TEACHER_HOMEROOM' } : null,
    ),
    createRemark: jest.fn(async (rm: any) => {
      remarksDb.push(rm);
      return rm;
    }),
    getRemarksByStudent: jest.fn(async (sid: string) =>
      remarksDb.filter((r) => r.student_id === sid),
    ),
    getRemarksByClass: jest.fn(async (cid: string) =>
      remarksDb.filter((r) => r.class_id === cid),
    ),
  };

  const mockNotifications = {
    /** Mô phỏng hộp thư PH: mỗi dispatch sẽ tạo bản ghi thông báo is_read = false */
    dispatchToParentsOfStudent: jest.fn(async (student: any, payload: any) => {
      const inbox = {
        id: 'ntf_' + (notificationsDb.length + 1),
        recipient_user_id: student.parent_uids?.[0] || 'usr_parent_hung_01',
        title: payload.title,
        body: payload.body,
        type: payload.type,
        metadata: payload.metadata,
        is_read: false,
      };
      notificationsDb.push(inbox);
      notifiedInbox.push(inbox);
      return { sent: 1, failed: 0, parentUserIds: [inbox.recipient_user_id] };
    }),
  };

  const remarksService = new RemarksService(mockDataConnect as any, mockNotifications as any);
  const notificationsService = new NotificationsService(
    mockDataConnect as any,
    { __mock: true } as any,
  );
  // Ghi đè phần DB Firebase-admin thật — chỉ nghiệm thu nghiệp vụ markAsRead
  (notificationsService as any).firebaseAdmin = {
    ...{ __mock: true },
  };
  (notificationsService as any).dataConnect = {
    getNotificationById: jest.fn(async (id: string) => notificationsDb.find((n) => n.id === id) || null),
    markNotificationRead: jest.fn(async (id: string) => {
      const n = notificationsDb.find((x) => x.id === id);
      if (n) {
        n.is_read = true;
        n.read_at = new Date().toISOString();
      }
      return true;
    }),
    getNotificationsByRecipient: jest.fn(async (uid: string) =>
      notificationsDb.filter((n) => n.recipient_user_id === uid),
    ),
  };

  return { remarksService, notificationsService, mockDataConnect, mockNotifications, remarksDb, notificationsDb };
}

describe('UAT05_GVCN_04 — Nhận xét HS & phản hồi "Đã đọc" 2 chiều', () => {
  let ctx: ReturnType<typeof buildRemarkStack>;

  beforeEach(() => {
    jest.clearAllMocks();
    ctx = buildRemarkStack();
  });

  it('Bước 1: GVCN gửi nhận xét thuần túy tiếng Việt có dấu — không bị tag rườm rà', async () => {
    const res: any = await ctx.remarksService.createRemark(
      GVCN_ID,
      { student_id: STD_BAO_NAM, class_id: CLASS_1A_ID, content: NOI_DUNG_KHEN } as any,
    );

    expect(res.remark_id).toBeDefined();
    expect(res.content).toBe(NOI_DUNG_KHEN);
    // Nhận xét GVCN không gắn subject_code — văn bản tự nhiên chuẩn sư phạm
    expect(res.subject_code).toBeNull();
    expect(res.is_homeroom_remark).toBe(true);
    // Lưu vào DB remarks
    expect(ctx.mockDataConnect.createRemark).toHaveBeenCalledTimes(1);
    const savedRemark = ctx.mockDataConnect.createRemark.mock.calls[0][0];
    expect(savedRemark.teacher_name).toBe(GVCN_NAME);
    expect(savedRemark.teacher_id).toBe(GVCN_ID);
    // Không nhận thể nội dung bị mã hóa/gắn tag
    expect(savedRemark.content).not.toMatch(/<script|@@@|###|%%%/);
  });

  it('Bước 2: Phụ huynh nhận thông báo đẩy kèm chuông báo với nội dung lời khen nguyên văn', async () => {
    await ctx.remarksService.createRemark(
      GVCN_ID,
      { student_id: STD_BAO_NAM, class_id: CLASS_1A_ID, content: NOI_DUNG_KHEN } as any,
    );

    expect(ctx.notificationsDb).toHaveLength(1);
    const inbox = ctx.notificationsDb[0];
    expect(inbox.recipient_user_id).toBe(PHHS_ID);
    expect(inbox.type).toBe(NotificationType.REMARK_NEW);
    expect(inbox.title).toContain('Em Trần Bảo Nam');
    // Nội dung cô viết được nguyên văn trong thông báo
    expect(inbox.body).toContain('rất hăng hái giơ tay xây dựng bài Toán');
    expect(inbox.metadata.student_id).toBe(STD_BAO_NAM);
    expect(inbox.metadata.class_id).toBe(CLASS_1A_ID);
    expect(inbox.is_read).toBe(false); // chưa đọc
  });

  it('Bước 3: Phụ huynh bấm "Xác nhận đã đọc" — trạng thái hoàn tất 2 chiều (success, is_read=true)', async () => {
    // Gửi nhận xét để PH có hộp thư
    await ctx.remarksService.createRemark(
      GVCN_ID,
      { student_id: STD_BAO_NAM, class_id: CLASS_1A_ID, content: NOI_DUNG_KHEN } as any,
    );
    const notifId = ctx.notificationsDb[0].id;

    const res: any = await ctx.notificationsService.markAsRead(PHHS_ID, notifId);
    expect(res.success).toBe(true);

    const inbox = ctx.notificationsDb.find((n) => n.id === notifId);
    expect(inbox?.is_read).toBe(true);
    expect(inbox?.read_at).toBeDefined();
  });

  it("Bước 4: GVCN tải lại — thấy phụ huynh đã đọc trạng thái đọc đúng bản ghi với hộp thư PH", async () => {
    await ctx.remarksService.createRemark(
      GVCN_ID,
      { student_id: STD_BAO_NAM, class_id: CLASS_1A_ID, content: NOI_DUNG_KHEN } as any,
    );
    const notifId = ctx.notificationsDb[0].id;
    await ctx.notificationsService.markAsRead(PHHS_ID, notifId);

    // GVCN không thể nhìn thấy hộp thư vì hộp thư riêng PH — chỉ thấy trạng thái đọc qua inbox
    const phUnread = await ctx.notificationsService.getMyNotifications(PHHS_ID, { is_read: 'true' });
    expect(phUnread.total).toBe(1);
    expect(phUnread.items[0].id).toBe(notifId);

    // GVCN không có hộp thư riêng (vì thông báo chỉ phát cho PH)
    const gvInbox = await ctx.notificationsService.getMyNotifications(GVCN_ID, {});
    expect(gvInbox.total).toBe(0);
  });

  it('Bảo mật IDOR: tài khoản khác không thể đánh dấu đã đọc hộp thư của người khác', async () => {
    await ctx.remarksService.createRemark(
      GVCN_ID,
      { student_id: STD_BAO_NAM, class_id: CLASS_1A_ID, content: NOI_DUNG_KHEN } as any,
    );
    const notifId = ctx.notificationsDb[0].id;

    // GVCN cố "đọc hộ" PH → bị chặn NOTI_NOT_FOUND (rừ chặn thay đổi hộp thư người khác)
    await expect(
      ctx.notificationsService.markAsRead(GVCN_ID, notifId),
    ).rejects.toThrow(NotFoundException);
    // Hộp thư PH vẫn chưa đọc (GVCN không thay đổi hộp thư người khác)
    const phUnread = await ctx.notificationsService.getMyNotifications(PHHS_ID, { is_read: 'false' });
    expect(phUnread.items.some((n: any) => n.id === notifId && n.is_read === false)).toBe(true);
  });

  it('Từ chối nội dung nhận xét rỗng hoặc quá ngắn để đảm bảo tính sư phạm', async () => {
    await expect(
      ctx.remarksService.createRemark(GVCN_ID, {
        student_id: STD_BAO_NAM, class_id: CLASS_1A_ID, content: '  ',
      } as any),
    ).rejects.toThrow(BadRequestException);

    await expect(
      ctx.remarksService.createRemark(GVCN_ID, {
        student_id: STD_BAO_NAM, class_id: CLASS_1A_ID, content: 'Ok',
      } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('Chặn nội dung chứa mã độc payload (script tags / ký tự đặc biệt)', async () => {
    await expect(
      ctx.remarksService.createRemark(GVCN_ID, {
        student_id: STD_BAO_NAM, class_id: CLASS_1A_ID, content: '<script>alert(1)</script>',
      } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('Từ chối nhận xét học sinh không tồn tại trong DB', async () => {
    await expect(
      ctx.remarksService.createRemark(GVCN_ID, {
        student_id: 'std_khong_ton_tai', class_id: CLASS_1A_ID, content: NOI_DUNG_KHEN,
      } as any),
    ).rejects.toThrow(NotFoundException);
  });

  it('Từ chối khi thiếu thông tin phiên làm việc (teacherId rỗng)', async () => {
    await expect(
      ctx.remarksService.createRemark('', {
        student_id: STD_BAO_NAM, class_id: CLASS_1A_ID, content: NOI_DUNG_KHEN,
      } as any),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('Từ chối GVBM gửi nhận xét khi chưa được phân công môn học (RBAC 403)', async () => {
    await expect(
      ctx.remarksService.createRemark(
        'usr_gvbm_cs_01',
        { student_id: STD_BAO_NAM, class_id: CLASS_1A_ID, subject_code: 'ENG', content: NOI_DUNG_KHEN } as any,
        { role: 'TEACHER_SUBJECT', assignedSubjects: ['CS'] },
      ),
    ).rejects.toThrow(ForbiddenException);
  });
});
