export const PORT = parseInt(process.env.PORT ?? '4000', 10);
export const NODE_ENV = process.env.NODE_ENV ?? 'development';

export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '15m'; // Short-lived access tokens

export const SMTP_HOST = process.env.SMTP_HOST ?? 'smtp.example.com';
export const SMTP_PORT = parseInt(process.env.SMTP_PORT ?? '587', 10);
export const SMTP_USER = process.env.SMTP_USER ?? '';
export const SMTP_PASS = process.env.SMTP_PASS ?? '';
export const MAIL_FROM = process.env.MAIL_FROM ?? 'no-reply@aifigurant.local';

export const APP_FRONTEND_URL = (process.env.APP_FRONTEND_URL ?? 'http://localhost:5173').replace(/\/$/, '');

export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
export const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
export const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
export const GROK_API_KEY = process.env.GROK_API_KEY;

export const ELEVENLABS_FALLBACK_VOICE_ID_FEMALE = process.env.ELEVENLABS_FALLBACK_VOICE_ID_FEMALE ?? '';
export const ELEVENLABS_FALLBACK_VOICE_ID_MALE = process.env.ELEVENLABS_FALLBACK_VOICE_ID_MALE ?? '';

export const getJwtSecret = () : string => {
  if (process.env.JWT_SECRET === undefined) {
    throw new Error(
      'JWT_SECRET is not defined in the environment variables',
    );
  }
  return process.env.JWT_SECRET;
};
