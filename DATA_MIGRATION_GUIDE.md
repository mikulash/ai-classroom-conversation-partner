# Data Migration Guide: Supabase → PostgreSQL + Prisma

This guide explains how to migrate all your existing data from Supabase to the new PostgreSQL database.

## Overview

The migration script will:
1. Connect to your existing Supabase instance
2. Export all data from the public schema (12 tables)
3. Import data into your new PostgreSQL database via Prisma
4. Preserve all relationships and data integrity

## ⚠️ Important Notes

### Password Migration
**Users from Supabase will need to reset their passwords!**

Why? Supabase stores password hashes in `auth.users` table which we cannot access. The migration script will:
- Migrate all user profiles
- Set a placeholder password for each user
- Users must contact an admin to reset their password

### Data Preserved
✅ All conversation history
✅ All personalities and scenarios
✅ All model configurations
✅ All admin settings
✅ User profiles (except passwords)
✅ Relationships between tables

## Prerequisites

1. **Supabase credentials** (keep your old instance running during migration)
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

2. **New PostgreSQL database** (empty or seeded)

3. **pnpm installed** (you're already using it)

## Step-by-Step Migration

### 1. Setup New Database

```bash
# Start PostgreSQL
docker run --name ai-classroom-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=ai_classroom \
  -p 5432:5432 \
  -d postgres:16
```

### 2. Configure Environment

Create or update `apps/backend/.env`:

```env
# New PostgreSQL database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ai_classroom

# JWT Authentication (new)
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# Supabase (keep these for migration)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# API Keys (existing)
OPENAI_API_KEY=your-openai-key
ELEVENLABS_API_KEY=your-elevenlabs-key
GROK_API_KEY=your-grok-key
CLAUDE_API_KEY=your-claude-key
ELEVENLABS_FALLBACK_VOICE_ID_FEMALE=voice-id
ELEVENLABS_FALLBACK_VOICE_ID_MALE=voice-id
```

### 3. Install Dependencies & Generate Prisma Client

```bash
cd apps/backend

# Install all dependencies (including Prisma)
pnpm install

# Generate Prisma client
pnpm prisma:generate
```

### 4. Create Database Schema

```bash
# Push Prisma schema to PostgreSQL
pnpm db:push
```

This will create all 12 tables in your new PostgreSQL database.

### 5. Run Data Migration

```bash
# Migrate all data from Supabase
pnpm migrate:supabase
```

**Expected output:**
```
🚀 Starting data migration from Supabase...

📦 Migrating response_models...
✅ Migrated 4 response models

📦 Migrating tts_models...
✅ Migrated 3 TTS models

📦 Migrating realtime_models...
✅ Migrated 2 realtime models

📦 Migrating realtime_transcription_models...
✅ Migrated 1 realtime transcription models

📦 Migrating timestamped_transcription_models...
✅ Migrated 1 timestamped transcription models

📦 Migrating app_config...
✅ Migrated app config

📦 Migrating conversation_roles...
✅ Migrated 3 conversation roles

📦 Migrating personalities...
✅ Migrated X personalities

📦 Migrating scenarios...
✅ Migrated X scenarios

📦 Migrating profiles...
✅ Migrated X profiles
⚠️  NOTE: All users have placeholder passwords and will need to contact admin to reset

📦 Migrating admin_users_custom_model_selection...
✅ Migrated X admin custom model selections

📦 Migrating conversations...
✅ Migrated X conversations

🎉 Migration completed successfully!
```

### 6. Verify Migration

```bash
# Open Prisma Studio to inspect data
pnpm prisma:studio
```

Check:
- ✅ All tables have data
- ✅ Counts match Supabase
- ✅ Relationships are intact
- ✅ JSON fields (messages, logs) are preserved

### 7. Create Admin User (if needed)

Since migrated users can't log in (placeholder passwords), create a fresh admin account:

```bash
# Start the backend
pnpm dev

# In another terminal, use curl or Postman:
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@muni.cz",
    "password": "SecurePassword123!",
    "fullName": "Admin User",
    "gender": "other"
  }'

# Get the user ID from response, then update role in Prisma Studio:
# 1. Open: pnpm prisma:studio
# 2. Go to profiles table
# 3. Find your admin user
# 4. Change userRole to "owner"
```

### 8. Update User Passwords

**Option A: Admin resets for each user**
```typescript
// Using Prisma Studio or via API endpoint
import { hashPassword } from './utils/auth';

const newPassword = await hashPassword('TemporaryPassword123');
await prisma.profile.update({
  where: { id: 'user-id' },
  data: { password: newPassword }
});
```

**Option B: Implement password reset flow**
1. User clicks "Forgot Password"
2. Backend generates reset token
3. Send email with reset link
4. User sets new password

See `MIGRATION_GUIDE.md` for implementing password reset.

### 9. Test Application

```bash
# Terminal 1: Backend
cd apps/backend
pnpm dev

# Terminal 2: Frontend
cd apps/web
pnpm dev
```

Test:
- ✅ Admin login works
- ✅ View all migrated data
- ✅ Conversations load correctly
- ✅ Create new conversation
- ✅ Admin pages work

## Migration Script Details

### Tables Migrated (in order)

1. **Models** (no dependencies)
   - response_models
   - tts_models
   - realtime_models
   - realtime_transcription_models
   - timestamped_transcription_models

2. **Config** (depends on models)
   - app_config
   - conversation_roles

3. **Content** (no dependencies)
   - personalities

4. **Scenarios** (depends on personalities)
   - scenarios

5. **Users** (no dependencies)
   - profiles (from auth.users + profiles)

6. **User Config** (depends on users and models)
   - admin_users_custom_model_selection

7. **Conversations** (depends on users, personalities, scenarios)
   - conversations

### Data Transformations

The script handles:
- ✅ Snake_case → camelCase field names
- ✅ Date string → Date objects
- ✅ JSON fields (messages, logs, used_config)
- ✅ Foreign key relationships
- ✅ Enums (user_role, conversation_type, providers, etc.)
- ✅ Nullable fields
- ✅ Array fields (allowed_domains)

### Error Handling

If migration fails:
1. Check error message - it will tell you which table failed
2. Fix the issue (usually missing Supabase credentials or network)
3. Re-run: `pnpm migrate:supabase`
4. The script uses `upsert`, so it's safe to run multiple times

## Rollback Plan

If something goes wrong:

```bash
# Option 1: Reset database and try again
pnpm db:push --force-reset
pnpm migrate:supabase

# Option 2: Keep using Supabase
# Just don't switch your frontend to use the new API yet
# Your old Supabase instance is still running
```

## After Migration

### Keep Supabase Running?

**Short-term:** Yes, keep it running as a backup while you test the new system.

**Long-term:** Once you've verified everything works:
1. Export final backup from Supabase
2. Cancel Supabase subscription
3. Remove Supabase dependencies:
   ```bash
   # Remove from all packages
   pnpm remove @supabase/supabase-js

   # Delete old files
   rm -rf apps/backend/src/clients/supabase.ts
   rm -rf apps/backend/src/middleware/verifySupabaseAuth.ts
   rm -rf packages/frontend-utils/src/clients/supabaseClient.ts
   rm -rf packages/frontend-utils/src/supabaseService.ts
   ```

### Update Frontend

If you haven't already, update frontend to use new API:
```bash
# This should already be done from the refactoring
# But verify all imports are updated:
grep -r "supabaseService" packages/ui/
# Should return no results
```

## Troubleshooting

### Error: "Cannot connect to Supabase"
```bash
# Check your Supabase credentials
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY

# Test connection
curl $SUPABASE_URL/rest/v1/ \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY"
```

### Error: "Table already has data"
The migration script uses `upsert`, so it's safe. But if you want to start fresh:
```bash
pnpm db:push --force-reset
pnpm migrate:supabase
```

### Error: "Foreign key constraint failed"
This means data references don't exist. Usually caused by:
- Running migration multiple times with partial failures
- Data corruption in Supabase

**Fix:**
```bash
# Reset and migrate again
pnpm db:push --force-reset
pnpm migrate:supabase
```

### Some users can't log in
Expected! All migrated users have placeholder passwords. Options:
1. Admin manually resets passwords via Prisma Studio
2. Send all users a "system migration" email with new password
3. Implement password reset flow

### Conversation history is missing
Check:
1. Run migration script again (it's safe)
2. Verify in Prisma Studio: `pnpm prisma:studio`
3. Check Supabase RLS policies - service role key should bypass them

## Performance Notes

Migration speed depends on data size:
- **< 1000 conversations**: ~30 seconds
- **1000-10000 conversations**: ~2-5 minutes
- **> 10000 conversations**: ~5-15 minutes

The script shows progress for each table.

## Support

If you encounter issues:
1. Check the error message carefully
2. Look at `apps/backend/scripts/migrate-from-supabase.ts`
3. Add console.logs to debug
4. Check Prisma Studio to see what data was migrated
5. Verify Supabase credentials are correct

## Summary Checklist

- [ ] PostgreSQL is running
- [ ] Environment variables configured (DATABASE_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
- [ ] Dependencies installed: `pnpm install`
- [ ] Prisma client generated: `pnpm prisma:generate`
- [ ] Database schema created: `pnpm db:push`
- [ ] Data migrated: `pnpm migrate:supabase`
- [ ] Data verified in Prisma Studio: `pnpm prisma:studio`
- [ ] Admin user created and role set to "owner"
- [ ] Backend tested: `pnpm dev`
- [ ] Frontend tested: login, view data, create conversation
- [ ] Users notified about password reset
- [ ] Old Supabase instance kept as backup (for now)

## Next Steps

After successful migration:
1. Monitor logs for any issues
2. Test all features thoroughly
3. Set up password reset flow
4. Eventually remove Supabase dependencies
5. Celebrate! 🎉

You now have full control over your database and authentication!
