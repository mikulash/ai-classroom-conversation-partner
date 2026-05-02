import { Injectable } from '@nestjs/common';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not defined in the environment variables`);
  }
  return value;
}

function parsePort(name: string, fallback: string): number {
  const raw = process.env[name] ?? fallback;
  const value = Number.parseInt(raw, 10);
  if (!Number.isInteger(value) || value <= 0 || value > 65535) {
    throw new Error(`${name} must be a valid TCP port`);
  }
  return value;
}

function optionalUrl(name: string, fallback: string): string {
  const value = process.env[name] ?? fallback;
  try {
    return new URL(value).toString().replace(/\/$/, '');
  } catch {
    throw new Error(`${name} must be a valid URL`);
  }
}

@Injectable()
export class EnvConfigService {
  readonly port = parsePort('PORT', '4000');
  readonly nodeEnv = process.env.NODE_ENV ?? 'development';
  readonly databaseUrl = requireEnv('DATABASE_URL');
  readonly jwtSecret = requireEnv('JWT_SECRET');
  readonly jwtExpiresIn = process.env.JWT_EXPIRES_IN ?? '15m';
  readonly appFrontendUrl = optionalUrl('APP_FRONTEND_URL', 'http://localhost:5173');

  readonly smtpHost = process.env.SMTP_HOST ?? 'smtp.example.com';
  readonly smtpPort = parsePort('SMTP_PORT', '587');
  readonly smtpUser = process.env.SMTP_USER ?? '';
  readonly smtpPass = process.env.SMTP_PASS ?? '';
  readonly mailFrom = process.env.MAIL_FROM ?? 'no-reply@aifigurant.local';

  readonly openAiApiKey = process.env.OPENAI_API_KEY;
  readonly elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
  readonly claudeApiKey = process.env.CLAUDE_API_KEY;
  readonly grokApiKey = process.env.GROK_API_KEY;

  readonly elevenLabsFallbackVoiceIdFemale = process.env.ELEVENLABS_FALLBACK_VOICE_ID_FEMALE ?? '';
  readonly elevenLabsFallbackVoiceIdMale = process.env.ELEVENLABS_FALLBACK_VOICE_ID_MALE ?? '';
  readonly tokenCleanupSchedule = process.env.TOKEN_CLEANUP_SCHEDULE;
}
