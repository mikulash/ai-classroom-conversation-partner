import { Module } from '@nestjs/common';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';
import { MailService } from '../services/mail.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, MailService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AuthModule {}
