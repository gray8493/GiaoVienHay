import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getMessaging, Messaging } from 'firebase-admin/messaging';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private appInstance: App | null = null;
  private authInstance: Auth | null = null;
  private messagingInstance: Messaging | null = null;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    if (!getApps().length) {
      const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID') || 'giaovienhay';
      const storageBucket = this.configService.get<string>('FIREBASE_STORAGE_BUCKET') || 'giaovienhay.firebasestorage.app';
      const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
      const privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n');

      try {
        if (clientEmail && privateKey) {
          this.appInstance = initializeApp({
            credential: cert({
              projectId,
              clientEmail,
              privateKey,
            }),
            projectId,
            storageBucket,
          });
          this.logger.log(`Initialized Firebase Admin (Auth & Messaging) for project: ${projectId}`);
        } else {
          this.logger.log(`No Firebase Service Account credentials configured. Running in simulated mode for Auth & FCM.`);
          return;
        }
      } catch (error: any) {
        this.logger.warn(`Firebase Admin init notice: ${error?.message || error}. Running in simulated mode.`);
        return;
      }
    } else {
      this.appInstance = getApps()[0];
    }

    try {
      if (this.appInstance) {
        this.authInstance = getAuth(this.appInstance);
        this.messagingInstance = getMessaging(this.appInstance);
      }
    } catch (e: any) {
      this.logger.warn(`Firebase services fallback enabled: ${e?.message || e}`);
    }
  }

  get auth(): Auth | null {
    return this.authInstance;
  }

  get messaging(): Messaging | null {
    return this.messagingInstance;
  }
}
