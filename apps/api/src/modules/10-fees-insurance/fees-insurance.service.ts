import { Injectable, Logger } from '@nestjs/common';
import { FirebaseService } from '../../common/firebase/firebase.service';
import { ToggleFeeDto, RemindFeesDto } from './dto/fees-insurance.dto';
import { FeeType, NotificationType } from '@giaovienhay/shared-types';

@Injectable()
export class FeesInsuranceService {
  private readonly logger = new Logger(FeesInsuranceService.name);

  constructor(private readonly firebaseService: FirebaseService) {}

  async getClassFeesList(classId: string, feeType?: string, unpaidOnly?: boolean) {
    return {
      class_id: classId,
      term_name: 'Học kỳ 1 năm học 2026-2027',
      records: [
        {
          record_id: 'fee_01',
          student_id: 'stu_01',
          student_name: 'Trần Bảo Nam',
          tuition: { is_paid: true, paid_date: '2026-09-15' },
          insurance: { is_paid: true, paid_date: '2026-09-18' },
          note: 'Đã nộp đủ cả năm',
        },
        {
          record_id: 'fee_02',
          student_id: 'stu_02',
          student_name: 'Lê Ngọc Mai',
          tuition: { is_paid: true, paid_date: '2026-09-16' },
          insurance: { is_paid: false, paid_date: null },
          note: null,
        },
      ],
    };
  }

  async toggleFeeStatus(teacherId: string, dto: ToggleFeeDto) {
    const now = new Date().toISOString();
    const paidDate = dto.is_paid ? dto.paid_date || now.split('T')[0] : null;

    if (this.firebaseService.firestore) {
      try {
        const updateField = dto.fee_type === FeeType.TUITION ? 'tuition' : 'insurance';
        await this.firebaseService.firestore.collection('fees_insurance').doc(dto.record_id).update({
          [`${updateField}.is_paid`]: dto.is_paid,
          [`${updateField}.paid_date`]: paidDate,
          [`${updateField}.note`]: dto.note || null,
          updated_by: teacherId,
          updated_at: now,
        });
      } catch (e) {}
    }

    return {
      record_id: dto.record_id,
      fee_type: dto.fee_type,
      is_paid: dto.is_paid,
      paid_date: paidDate,
      updated_at: now,
    };
  }

  /**
   * Xóa mềm bản ghi học phí/bảo hiểm (is_deleted = 1/true)
   */
  async deleteFeeRecord(recordId: string) {
    const now = new Date().toISOString();
    if (this.firebaseService.firestore) {
      try {
        await this.firebaseService.firestore.collection('fees_insurance').doc(recordId).set(
          {
            is_deleted: true,
            deleted_at: now,
          },
          { merge: true },
        );
      } catch (e) {}
    }

    return {
      message: 'Xóa mềm bản ghi học phí thành công',
      record_id: recordId,
      is_deleted: true,
      deleted_at: now,
    };
  }

  async sendFeeReminder(teacherId: string, dto: RemindFeesDto) {
    const feeName = dto.fee_type === FeeType.INSURANCE ? 'Bảo hiểm y tế (BHYT)' : 'Học phí';
    const message = dto.custom_message || `Kính nhờ quý phụ huynh chưa hoàn thành ${feeName} vui lòng nộp cho cô Lan tại lớp.`;

    if (this.firebaseService.firestore) {
      try {
        const notifId = 'notif_fee_' + Date.now();
        await this.firebaseService.firestore.collection('notifications').doc(notifId).set({
          id: notifId,
          title: `Nhắc nhở hoàn thành ${feeName}`,
          body: message,
          type: NotificationType.FEE_REMINDER,
          is_read: false,
          created_at: new Date().toISOString(),
        });
      } catch (e) {}
    }

    return {
      class_id: dto.class_id,
      fee_type: dto.fee_type,
      notified_parents_count: 12,
      reminded_at: new Date().toISOString(),
    };
  }
}
