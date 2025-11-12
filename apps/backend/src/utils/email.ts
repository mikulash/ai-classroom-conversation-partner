import nodemailer from 'nodemailer';
import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM } from '../constants/constants';

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: false,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

export async function sendVerificationEmail(to: string, verifyUrl: string) {
  console.log('Sending verification email to:', to);
  const result = await transporter.sendMail({
    from: MAIL_FROM,
    to,
    subject: 'Verify your email',
    html: `
      <p>Hi,</p>
      <p>Please verify your email by clicking the link below:</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      <p>If you didn't create this account, you can ignore this email.</p>
    `,
  });
  console.log('Email sent:', result);
  return result;
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  console.log('Sending password reset email to:', to);
  const result = await transporter.sendMail({
    from: MAIL_FROM,
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
  console.log('Password reset email sent:', result);
  return result;
}
