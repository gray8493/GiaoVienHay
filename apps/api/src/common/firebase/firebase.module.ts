import { Global, Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { FirebaseDataConnectService } from './data-connect.service';

@Global()
@Module({
  providers: [FirebaseService, FirebaseDataConnectService],
  exports: [FirebaseService, FirebaseDataConnectService],
})
export class FirebaseModule {}
