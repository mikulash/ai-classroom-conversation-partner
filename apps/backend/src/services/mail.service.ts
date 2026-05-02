import { Injectable, Logger } from '@nestjs/common';
import nodemailer from 'nodemailer';
import { EnvConfigService } from '../core/config/env-config.service';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly config: EnvConfigService) {
    this.transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: false,
      auth: config.smtpUser || config.smtpPass ? {
        user: config.smtpUser,
        pass: config.smtpPass,
      } : undefined,
    });
  }

  async sendVerificationEmail(to: string, verifyUrl: string): Promise<void> {
    await this.transporter.sendMail({
      from: this.config.mailFrom,
      to,
      subject: 'Verify your email',
      html: `
        <p>Hi,</p>
        <p>Please verify your email by clicking the link below:</p>
        <p><a href="${verifyUrl}">${verifyUrl}</a></p>
        <p>This link will expire in 10 minutes.</p>
        <p>If you didn't create this account, you can ignore this email.</p>
      `,
    });
    this.logger.log('Verification email queued');
  }

  async sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
    await this.transporter.sendMail({
      from: this.config.mailFrom,
      to,
      subject: 'Reset your password',
      html: `
        <p>Hi,</p>
        <p>You requested to reset your password. Click the link below to reset it:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
      `,
    });
    this.logger.log('Password reset email queued');
  }
}
