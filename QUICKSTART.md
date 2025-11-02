# Quick Start Guide: Migrating from Supabase

**TL;DR**: Your app has been refactored to use PostgreSQL + Prisma + JWT instead of Supabase. Follow these steps to migrate your existing data and start using the new system.

## 🚀 Quick Setup (5 minutes)

### 1. Start PostgreSQL

```bash
docker run --name ai-classroom-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=ai_classroom \
  -p 5432:5432 \
  -d postgres:16
```

### 2. Configure Environment

```bash
cd apps/backend
cp .env.example .env
```

Edit `.env` and add your Supabase credentials (keep your old instance for migration):

```env
# New database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ai_classroom

# JWT (set a secure secret!)
JWT_SECRET=change-this-to-a-random-string
JWT_EXPIRES_IN=7d

# Supabase (for migration only)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Your existing API keys (copy from old .env)
OPENAI_API_KEY=...
ELEVENLABS_API_KEY=...
# etc.
```

### 3. Setup Database & Migrate Data

```bash
cd apps/backend

# Install dependencies
pnpm install

# Generate Prisma client
pnpm prisma:generate

# Create database schema
pnpm db:push

# Migrate ALL data from Supabase (this is the magic!)
pnpm migrate:supabase
```

**Expected output:**
```
🚀 Starting data migration from Supabase...
📦 Migrating response_models...
✅ Migrated 4 response models
📦 Migrating personalities...
✅ Migrated X personalities
... (continues for all 12 tables)
🎉 Migration completed successfully!
```

### 4. Create Admin User

Since migrated users can't log in (password issue explained below), create a fresh admin:

```bash
# Start backend
pnpm dev

# In another terminal:
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@muni.cz",
    "password": "YourSecurePassword123!",
    "fullName": "Admin User"
  }'
```

Then set the user role to "owner":
```bash
# Open Prisma Studio
pnpm prisma:studio

# Navigate to 'profiles' table
# Find your admin user
# Change 'userRole' to 'owner'
# Save
```

### 5. Start the Application

```bash
# Terminal 1: Backend
cd apps/backend
pnpm dev

# Terminal 2: Frontend
cd apps/web
pnpm dev
```

Visit: `http://localhost:5173` (or whatever port Vite shows)

## ⚠️ Password Migration Issue

**Why can't existing users log in?**

Supabase stores password hashes in the `auth.users` table, which we cannot access with the service role key. The migration script:
- ✅ Migrates all user profiles
- ✅ Preserves all user data
- ❌ Sets a placeholder password (not the real one)

**Solutions:**

**Option 1: Admin resets passwords**
Use Prisma Studio to set new passwords for users:
```typescript
import { hashPassword } from './utils/auth';
const hashed = await hashPassword('TempPassword123');
// Update in Prisma Studio
```

**Option 2: Users reset via email** (implement password reset flow)
- See `MIGRATION_GUIDE.md` for implementation details

**Option 3: Fresh start**
If you don't need existing users, just have everyone re-register.

## 📊 What Got Migrated?

✅ **All conversations** - Every chat, voice, and video conversation with messages and logs
✅ **All personalities** - All AI characters with voices and settings
✅ **All scenarios** - All conversation scenarios
✅ **All model configs** - Response, TTS, realtime models
✅ **App configuration** - Global settings, allowed domains
✅ **User profiles** - All user data (except passwords)
✅ **Admin settings** - Custom model selections per user

## 🧪 Testing Checklist

- [ ] Backend starts: `pnpm dev` in `apps/backend`
- [ ] Frontend starts: `pnpm dev` in `apps/web`
- [ ] Admin can log in
- [ ] Admin can view migrated personalities
- [ ] Admin can view migrated conversations
- [ ] Can create a new conversation
- [ ] Admin panel works (if you're owner)

## 📖 Detailed Guides

- **DATA_MIGRATION_GUIDE.md** - Comprehensive migration instructions
- **MIGRATION_GUIDE.md** - Full refactoring documentation
- **REMAINING_TASKS.md** - Already complete! ✅

## 🐛 Common Issues

### "Cannot connect to database"
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# If not running, start it:
docker start ai-classroom-postgres
```

### "Prisma client not generated"
```bash
cd apps/backend
pnpm prisma:generate
```

### "Migration fails on conversations"
Usually means foreign keys don't match. Check Supabase has all related data:
```bash
# Reset and try again
pnpm db:push --force-reset
pnpm migrate:supabase
```

### Frontend shows "401 Unauthorized"
- Clear localStorage: `localStorage.clear()` in browser console
- Re-login with your admin account
- Check `VITE_BACKEND_URL` is set correctly

## 🎯 Next Steps

1. ✅ Migrate data
2. ✅ Test basic functionality
3. 🔲 Reset passwords for existing users
4. 🔲 Implement password reset flow (optional)
5. 🔲 Monitor for issues
6. 🔲 Eventually remove Supabase dependencies

## 💡 Pro Tips

**Use Prisma Studio** - Best way to inspect and edit database:
```bash
pnpm prisma:studio
```

**Keep Supabase running** - Don't cancel your subscription yet. Keep it as a backup for a few weeks.

**Check logs** - Backend console will show any errors. Most issues are auth-related or missing env vars.

**pnpm commands** - All commands use pnpm now (not npm):
```bash
pnpm dev              # Start dev server
pnpm prisma:studio    # Open database GUI
pnpm migrate:supabase # Run migration again (safe)
pnpm db:push          # Reset schema (⚠️ deletes data)
```

## 🆘 Need Help?

1. Check the error message
2. Look in `DATA_MIGRATION_GUIDE.md` troubleshooting section
3. Use `pnpm prisma:studio` to inspect data
4. Check backend logs in terminal
5. Verify all environment variables are set

## 🎉 Success!

If you can:
- ✅ Log in as admin
- ✅ See migrated personalities
- ✅ View old conversations
- ✅ Create a new conversation

**You're done!** Your app is now running on PostgreSQL + Prisma with full control over your data and auth.

Welcome to the Supabase-free world! 🚀
