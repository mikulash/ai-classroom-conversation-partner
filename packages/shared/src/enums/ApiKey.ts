export const API_KEY = {
  OPENAI: 'OPENAI_API_KEY',
  ELEVENLABS: 'ELEVENLABS_API_KEY',
  CLAUDE: 'CLAUDE_API_KEY',
  GROK: 'GROK_API_KEY',
} as const;

export type ApiKey = (typeof API_KEY)[keyof typeof API_KEY];
