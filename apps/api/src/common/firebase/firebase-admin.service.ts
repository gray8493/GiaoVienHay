import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getMessaging, Messaging } from 'firebase-admin/messaging';
import { getAuth, Auth } from 'firebase-admin/auth';
import * as fs from 'fs';
import * as path from 'path';

export interface SendPushNotificationOptions {
  token: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

export interface SendMulticastOptions {
  tokens: string[];
  title: string;
  body: string;
  data?: Record<string, string>;
}

@Injectable()
export class FirebaseAdminService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseAdminService.name);
  private app: App | null = null;
  private messaging: Messaging | null = null;
  private auth: Auth | null = null;
  private isAvailable = false;

  onModuleInit() {
    this.initFirebase();
  }

  private initFirebase() {
    const existingApps = getApps();
    if (existingApps.length > 0) {
      this.app = existingApps[0];
      this.messaging = getMessaging(this.app);
      this.auth = getAuth(this.app);
      this.isAvailable = true;
      this.logger.log('Firebase Admin SDK đã được khởi tạo trước đó.');
      return;
    }

    // 1. Kiểm tra cấu hình qua biến môi trường JSON trực tiếp (tiện nhất cho Render/Vercel)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
        this.app = initializeApp({
          credential: cert(serviceAccount),
          projectId: serviceAccount.project_id || process.env.FIREBASE_PROJECT_ID || 'giaovienhay-fcm',
        });
        this.messaging = getMessaging(this.app);
        this.auth = getAuth(this.app);
        this.isAvailable = true;
        this.logger.log(`✅ Khởi tạo Firebase Admin SDK thành công từ FIREBASE_SERVICE_ACCOUNT_JSON: ${serviceAccount.project_id}`);
        return;
      } catch (err: any) {
        this.logger.error(`Lỗi khi parse FIREBASE_SERVICE_ACCOUNT_JSON: ${err.message}`, err.stack);
      }
    }

    // 2. Kiểm tra cấu hình qua FIREBASE_CLIENT_EMAIL và FIREBASE_PRIVATE_KEY
    if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      try {
        this.app = initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID || 'giaovienhay-fcm',
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          }),
          projectId: process.env.FIREBASE_PROJECT_ID || 'giaovienhay-fcm',
        });
        this.messaging = getMessaging(this.app);
        this.auth = getAuth(this.app);
        this.isAvailable = true;
        this.logger.log(`✅ Khởi tạo Firebase Admin SDK thành công từ ENV credentials`);
        return;
      } catch (err: any) {
        this.logger.error(`Lỗi khi khởi tạo Firebase Admin SDK từ Client Email & Key: ${err.message}`, err.stack);
      }
    }

    // 3. Tìm qua file vật lý (bao gồm Render Secret File mặc định: /etc/secrets/serviceAccountKey.json)
    const searchPaths = [
      process.env.FIREBASE_CREDENTIAL_PATH,
      '/etc/secrets/serviceAccountKey.json',
      path.resolve(process.cwd(), 'serviceAccountKey.json'),
      path.resolve(process.cwd(), 'apps/api/serviceAccountKey.json'),
      path.resolve(__dirname, '../../../serviceAccountKey.json'),
      path.resolve(__dirname, '../../../../serviceAccountKey.json'),
    ].filter(Boolean) as string[];

    let resolvedPath: string | null = null;
    for (const p of searchPaths) {
      if (fs.existsSync(p)) {
        resolvedPath = p;
        break;
      }
    }

    if (!resolvedPath) {
      this.logger.warn('Chưa tìm thấy serviceAccountKey.json. Tính năng gửi push FCM sẽ ở chế độ dự phòng.');
      return;
    }

    try {
      const serviceAccount = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
      this.app = initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id || 'giaovienhay-fcm',
      });
      this.messaging = getMessaging(this.app);
      this.auth = getAuth(this.app);
      this.isAvailable = true;
      this.logger.log(`✅ Khởi tạo Firebase Admin SDK thành công với Project: ${serviceAccount.project_id}`);
    } catch (err: any) {
      this.logger.error(`Lỗi khi khởi tạo Firebase Admin SDK từ ${resolvedPath}: ${err.message}`, err.stack);
    }
  }

  /**
   * Kiểm tra Firebase Admin đã sẵn sàng gửi tin hay chưa
   */
  isReady(): boolean {
    return this.isAvailable && !!this.messaging;
  }

  /**
   * Xác thực Firebase ID Token do Client gửi lên
   */
  async verifyIdToken(idToken: string): Promise<any> {
    if (!this.isAvailable || !this.auth) {
      throw new Error('Firebase Admin SDK chưa được cấu hình. Không thể xác thực ID Token.');
    }
    return this.auth.verifyIdToken(idToken);
  }

  /**
   * Gửi thông báo Push đến 1 thiết bị cụ thể
   */
  async sendPushNotification(options: SendPushNotificationOptions) {
    if (!this.isReady() || !this.messaging) {
      this.logger.warn('[FCM] Firebase Admin chưa được cấu hình. Bỏ qua gửi thông báo đẩy.');
      return { success: false, error: 'FCM_NOT_CONFIGURED', messageId: null as any };
    }

    try {
      const response = await this.messaging.send({
        token: options.token,
        notification: {
          title: options.title,
          body: options.body,
        },
        data: options.data || {},
      });
      this.logger.log(`[FCM] Đã gửi thông báo thành công tới ${options.token}: ${response}`);
      return { success: true, messageId: response };
    } catch (error: any) {
      this.logger.error(`[FCM] Lỗi gửi thông báo: ${error.message}`, error.stack);
      return { success: false, error: error.message };
    }
  }

  /**
   * Gửi thông báo Push đồng loạt (Multicast) tới danh sách thiết bị
   */
  async sendMulticast(options: SendMulticastOptions) {
    if (!options.tokens || options.tokens.length === 0) {
      return { successCount: 0, failureCount: 0, responses: [] };
    }

    if (!this.isReady() || !this.messaging) {
      this.logger.warn('[FCM] Firebase Admin chưa được cấu hình. Bỏ qua gửi thông báo đẩy.');
      return {
        successCount: 0,
        failureCount: options.tokens.length,
        responses: [],
      };
    }

    try {
      const response = await this.messaging.sendEachForMulticast({
        tokens: options.tokens,
        notification: {
          title: options.title,
          body: options.body,
        },
        data: options.data || {},
      });

      this.logger.log(`[FCM Multicast] Gửi thành công: ${response.successCount}/${options.tokens.length}`);
      return response;
    } catch (error: any) {
      this.logger.error(`[FCM Multicast] Lỗi gửi: ${error.message}`, error.stack);
      throw error;
    }
  }
}
