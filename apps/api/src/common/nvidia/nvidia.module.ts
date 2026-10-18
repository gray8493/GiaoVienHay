import { Global, Module } from '@nestjs/common';
import { NvidiaService } from './nvidia.service';

@Global()
@Module({
  providers: [NvidiaService],
  exports: [NvidiaService],
})
export class NvidiaModule {}
