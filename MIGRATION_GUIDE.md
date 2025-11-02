# Migration Guide: Supabase to Prisma + PostgreSQL + JWT Auth

This guide explains the refactoring from Supabase to a custom backend with Prisma ORM, PostgreSQL, and JWT authentication.

## Overview

### Before
- **Database**: Supabase (PostgreSQL via PostgREST)
- **Auth**: Supabase Auth with JWT
- **Frontend Client**: `@supabase/supabase-js`
- **Backend**: Express + Supabase Admin Client

### After
- **Database**: PostgreSQL (local or hosted)
- **ORM**: Prisma
- **Auth**: Custom JWT authentication with bcrypt
- **Frontend Client**: Custom Axios-based API client
- **Backend**: Express + Prisma + JWT middleware

## Setup Instructions

### 1. Backend Setup

#### Install Dependencies
All dependencies are already installed:
- `@prisma/client`
- `prisma` (dev)
- `bcrypt`
- `jsonwebtoken`
- `tsx` (for running seed files)

#### Configure Environment Variables

Create `/apps/backend/.env`:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ai_classroom

# JWT Authentication
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# API Keys (existing)
OPENAI_API_KEY=your-openai-key
ELEVENLABS_API_KEY=your-elevenlabs-key
GROK_API_KEY=your-grok-key
CLAUDE_API_KEY=your-claude-key

# ElevenLabs Fallback Voices
ELEVENLABS_FALLBACK_VOICE_ID_FEMALE=elevenlabs-voice-id
ELEVENLABS_FALLBACK_VOICE_ID_MALE=elevenlabs-voice-id
```

#### Database Setup

1. **Start PostgreSQL** (if using local):
   ```bash
   # Using Docker
   docker run --name ai-classroom-postgres \
     -e POSTGRES_PASSWORD=postgres \
     -e POSTGRES_DB=ai_classroom \
     -p 5432:5432 \
     -d postgres:16
   ```

2. **Generate Prisma Client**:
   ```bash
   cd apps/backend
   pnpm prisma generate
   ```

3. **Push Database Schema**:
   ```bash
   pnpm prisma db push
   ```

4. **Seed Database**:
   ```bash
   pnpm prisma:seed
   ```

5. **Verify with Prisma Studio** (optional):
   ```bash
   pnpm prisma studio
   ```

### 2. Frontend Setup

#### Update Environment Variables

Create or update `/apps/web/.env`:

```env
VITE_BACKEND_URL=http://localhost:4000
```

For Tauri app, update `/apps/tauri/.env.local`:

```env
VITE_BACKEND_URL=http://localhost:4000
```

#### Update Imports

The codebase now uses new API services. Most components should already be updated, but if you encounter import errors:

**Before**:
```typescript
import { supabase } from '@repo/frontend-utils/src/clients/supabaseClient';
import { authApi, profileApi } from '@repo/frontend-utils/src/supabaseService';
```

**After**:
```typescript
import { authApi, profileApi } from '@repo/frontend-utils/src/apiService';
import { api } from '@repo/frontend-utils/src/apiService';
```

### 3. Running the Application

#### Start Backend
```bash
cd apps/backend
pnpm dev
```

The server will run on `http://localhost:4000`

#### Start Frontend (Web)
```bash
cd apps/web
pnpm dev
```

#### Start Frontend (Tauri)
```bash
cd apps/tauri
pnpm tauri dev
```

## API Changes

### Authentication

#### Register
**Endpoint**: `POST /api/auth/register`

```typescript
const response = await api.post('/api/auth/register', {
  email: 'user@muni.cz',
  password: 'password123',
  fullName: 'John Doe',
  gender: 'male'
});

// Response
{
  user: Profile,
  token: string
}
```

#### Login
**Endpoint**: `POST /api/auth/login`

```typescript
const { data } = await authApi.signInWithPassword(email, password);

// Response
{
  user: Profile,
  session: { access_token: string, user: Profile }
}
```

#### Get Current User
**Endpoint**: `GET /api/auth/me`

```typescript
const response = await api.get('/api/auth/me');
```

### Data Endpoints

All data endpoints are now under `/api/*`:

- **Profiles**: `/api/profiles`
- **Conversations**: `/api/conversations`
- **Personalities**: `/api/personalities`
- **Scenarios**: `/api/scenarios`
- **Models**: `/api/models/*`
- **App Config**: `/api/app-config`
- **Conversation Roles**: `/api/conversation-roles`

### Frontend API Service

The new `apiService.ts` provides the same interface as before:

```typescript
import {
  authApi,
  profileApi,
  conversationApi,
  personalityApi,
  scenarioApi,
  modelApi,
  fetchInitialData
} from '@repo/frontend-utils/src/apiService';

// Usage remains the same
const { data, error } = await profileApi.getById(userId);
const { data, error } = await conversationApi.byUser(userId);
```

## Breaking Changes

### 1. Authentication Storage
- **Before**: Supabase managed auth in cookies/localStorage
- **After**: JWT token stored in `localStorage.auth_token`

### 2. Profile Structure
- **Before**: Separate `auth.users` and `profiles` tables
- **After**: Single `profiles` table with `password` field
- User ID is now a UUID string (same as before)

### 3. Real-time Subscriptions
- **Before**: Supabase Realtime subscriptions
- **After**: Not implemented (polling or WebSocket can be added if needed)

### 4. Row Level Security (RLS)
- **Before**: PostgreSQL RLS policies enforced by Supabase
- **After**: Enforced in Express middleware and route handlers

## Database Schema

The Prisma schema maintains the same structure as Supabase:

- ✅ 13 tables (same as before)
- ✅ All relationships preserved
- ✅ Enums for user roles, conversation types, etc.
- ✅ JSONB fields for messages and logs
- ✅ Timestamps (createdAt, updatedAt)

### Key Tables

1. **profiles**: User accounts with password (replaces auth.users + profiles)
2. **conversations**: Conversation history
3. **personalities**: AI characters
4. **scenarios**: Conversation scenarios
5. **conversation_roles**: User roles in conversations
6. **response_models**: LLM models
7. **tts_models**: Text-to-speech models
8. **realtime_models**: Realtime voice models
9. **realtime_transcription_models**: Realtime STT models
10. **timestamped_transcription_models**: Timestamped STT models
11. **app_config**: Global configuration
12. **admin_users_custom_model_selection**: Admin overrides per user

## Security

### Password Hashing
- Uses `bcrypt` with 10 rounds
- Passwords never exposed in API responses

### JWT Tokens
- Signed with `JWT_SECRET`
- Expires in 7 days (configurable)
- Contains: `userId`, `email`, `userRole`

### Authorization Middleware
- `authenticate`: Requires valid JWT
- `requireAdmin`: Requires admin or owner role
- `requireOwner`: Requires owner role

## Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check connection
pnpm prisma db pull
```

### Prisma Client Issues
```bash
# Regenerate client
pnpm prisma generate

# Reset database (⚠️ deletes all data)
pnpm prisma db push --force-reset
pnpm prisma db seed
```

### Frontend Auth Issues
- Clear localStorage: `localStorage.clear()`
- Check network tab for 401 errors
- Verify `VITE_BACKEND_URL` is correct

### CORS Issues
Backend has CORS enabled for all origins in development. Update `/apps/backend/src/index.ts` for production:

```typescript
app.use(cors({
  origin: ['https://your-frontend-domain.com'],
  credentials: true
}));
```

## Next Steps

### Optional Enhancements

1. **Email Verification**
   - Add email service (SendGrid, etc.)
   - Implement verification token flow

2. **Password Reset**
   - Add password reset token generation
   - Email reset link to users

3. **Refresh Tokens**
   - Implement refresh token rotation
   - Store refresh tokens in database

4. **Rate Limiting**
   - Add express-rate-limit middleware
   - Protect auth endpoints

5. **Real-time Updates**
   - Add WebSocket support
   - Implement server-sent events for live updates

## Support

For issues or questions about the migration:
1. Check the logs: `apps/backend` console output
2. Use Prisma Studio to inspect the database
3. Check the browser console for frontend errors

## File Structure

```
apps/backend/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed data
├── src/
│   ├── clients/
│   │   └── prisma.ts          # Prisma client
│   ├── middleware/
│   │   └── auth.ts            # JWT auth middleware
│   ├── routes/
│   │   └── api/               # All API routes
│   │       ├── auth.ts
│   │       ├── profiles.ts
│   │       ├── conversations.ts
│   │       ├── personalities.ts
│   │       ├── scenarios.ts
│   │       ├── models.ts
│   │       ├── app-config.ts
│   │       └── conversation-roles.ts
│   ├── utils/
│   │   ├── auth.ts            # JWT utilities
│   │   └── getUserId.ts       # Extract user from JWT
│   └── index.ts               # Express app

packages/frontend-utils/
└── src/
    └── apiService.ts          # Custom API client (replaces Supabase)

packages/ui/
└── hooks/
    ├── useAuth.ts             # Updated for JWT
    ├── useSession.ts          # Updated for JWT
    └── useProfile.ts          # Updated for JWT
```

## Migration Checklist

- [x] Backend: Install Prisma and dependencies
- [x] Backend: Create Prisma schema
- [x] Backend: Create database seed file
- [x] Backend: Implement JWT auth utilities
- [x] Backend: Create auth middleware
- [x] Backend: Create API routers
- [x] Backend: Update Express app
- [x] Backend: Update existing routes (replies, etc.)
- [x] Frontend: Create custom API service
- [x] Frontend: Update useAuth hook
- [x] Frontend: Update useSession hook
- [x] Frontend: Update useProfile hook
- [ ] Generate Prisma client: `pnpm prisma generate`
- [ ] Push database schema: `pnpm prisma db push`
- [ ] Seed database: `pnpm prisma:seed`
- [ ] Update frontend components using Supabase imports
- [ ] Test registration flow
- [ ] Test login flow
- [ ] Test conversation creation
- [ ] Test admin features
- [ ] Remove Supabase dependencies
- [ ] Update documentation

## Conclusion

This migration maintains feature parity with the Supabase implementation while giving you full control over the database, authentication, and API. The new architecture is more transparent and easier to customize for your specific needs.
