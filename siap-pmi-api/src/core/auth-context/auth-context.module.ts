import { Module } from '@nestjs/common';
import { AuthModule } from '../../infrastructure/auth/auth.module';
import { AuthContextService } from './auth-context.service';

@Module({
  imports: [AuthModule],
  providers: [AuthContextService],
  exports: [AuthContextService],
})
export class AuthContextModule {}
