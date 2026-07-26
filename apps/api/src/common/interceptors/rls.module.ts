import { Module, Global } from '@nestjs/common';
import { RlsInterceptor } from './rls.interceptor';

@Global()
@Module({
  providers: [RlsInterceptor],
  exports: [RlsInterceptor],
})
export class RlsModule {}
