import { Global, Module } from '@nestjs/common';
import { SupabaseService, SupabaseAuthService } from './supabase.service';

@Global()
@Module({
  providers: [
    SupabaseService,
    SupabaseAuthService,
    // Cung cấp alias để các module đang inject FirebaseDataConnectService nhận được SupabaseService
    {
      provide: 'FirebaseDataConnectService',
      useExisting: SupabaseService,
    },
    {
      provide: 'FirebaseService',
      useExisting: SupabaseAuthService,
    },
  ],
  exports: [
    SupabaseService,
    SupabaseAuthService,
    'FirebaseDataConnectService',
    'FirebaseService',
  ],
})
export class SupabaseModule {}
