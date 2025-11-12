import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(to: string, verifyUrl: string) {
  console.log('Sending verification email to:', to);
  const result = await transporter.sendMail({
    from: process.env.MAIL_FROM ?? 'no-reply@example.com',
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
    from: process.env.MAIL_FROM ?? 'no-reply@example.com',
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
