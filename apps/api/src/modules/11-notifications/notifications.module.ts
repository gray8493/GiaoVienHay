import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { AuthModule } from '../01-auth/auth.module';
import { FirebaseAdminModule } from '../../common/firebase/firebase-admin.module';
import { SupabaseModule } from '../../common/supabase/supabase.module';

@Module({
  imports: [AuthModule, SupabaseModule, FirebaseAdminModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}

