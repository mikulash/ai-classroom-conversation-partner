# Backend

## Overview
The backend package hosts the Express API that powers Figurant's conversational features. It exposes authentication and reply routes, coordinates with multiple AI providers for responses and speech synthesis, and fetches config data from Supabase.

## Environment variables
| Variable | Required                                                      | Description | 
| --- |---------------------------------------------------------------| --- |
| `SUPABASE_URL` | **Required**                                                  | Supabase project URL used to instantiate the admin client. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Required**                                                  | Service role key that allows the backend to read configuration tables and Vault secrets. |
| `OPENAI_API_KEY` | Optional - if provider is currently set as active in config   | API key used when calling OpenAI models through the universal reply pipeline. |
| `ELEVENLABS_API_KEY` | Optional - if provider is currently set as active in config   | ElevenLabs API key used to synthesize speech for replies. |
| `CLAUDE_API_KEY` | Optional - if provider is currently set as active in config   | Anthropic Claude API key used for alternate response generation. |
| `GROK_API_KEY` | Optional - if provider is currently set as active in config   | xAI Grok API key used for additional response model support. |
| `ELEVENLABS_FALLBACK_VOICE_ID_FEMALE` | Optional - if Elevenlabs is currently set as active in config | Default ElevenLabs voice identifier to use for female personalities without an explicit voice configured. |
| `ELEVENLABS_FALLBACK_VOICE_ID_MALE` | Optional - if Elevenlabs is currently set as active in config | Default ElevenLabs voice identifier to use for male personalities without an explicit voice configured. |
