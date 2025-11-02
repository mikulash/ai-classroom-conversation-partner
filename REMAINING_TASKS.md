# Remaining Tasks for Supabase Migration

## ✅ Completed

### Backend
- ✅ Prisma setup with PostgreSQL schema (12 tables)
- ✅ JWT authentication utilities (bcrypt + jsonwebtoken)
- ✅ Authentication middleware (authenticate, requireAdmin, requireOwner)
- ✅ All API routes created:
  - Auth (login, register, password management)
  - Profiles, Conversations, Personalities, Scenarios
  - Models (response, TTS, realtime, transcription)
  - App Config, Conversation Roles
- ✅ Updated existing routes to use Prisma
- ✅ Database seed file with sample data

### Frontend
- ✅ Custom API service (apiService.ts)  with all methods
- ✅ Updated hooks: useAuth, useSession, useProfile
- ✅ Updated Layout component
- ✅ Updated useConversationSaver

### Documentation
- ✅ Comprehensive MIGRATION_GUIDE.md
- ✅ Git commit with detailed changes
- ✅ Pushed to remote branch

## 🔨 TODO: Finish Remaining Frontend Components

The following files still import from the old `supabaseService` and need to be updated to use `apiService`:

### Admin Pages (Priority: High)
1. **`packages/ui/pages/admin/AdminPersonalitiesPage.tsx`**
   - Update import: `import { personalityApi } from '@repo/frontend-utils/src/apiService';`
   - Methods remain the same: `personalityApi.all()`, `personalityApi.insert()`, `personalityApi.update()`, `personalityApi.delete()`

2. **`packages/ui/pages/admin/AdminProfilesPage.tsx`**
   - Update import: `import { profileApi } from '@repo/frontend-utils/src/apiService';`
   - Methods remain the same: `profileApi.getAll()`, `profileApi.updateRole()`

3. **`packages/ui/pages/admin/AdminScenariosPage.tsx`**
   - Update import: `import { scenarioApi } from '@repo/frontend-utils/src/apiService';`
   - Methods remain the same: `scenarioApi.all()`, `scenarioApi.insert()`, `scenarioApi.update()`, `scenarioApi.delete()`

4. **`packages/ui/pages/admin/AdminCustomModelSelectionPage.tsx`**
   - Update import: `import { modelApi } from '@repo/frontend-utils/src/apiService';`
   - Methods: `modelApi.adminUserSelection()`, `modelApi.upsertAdminUserSelection()`, plus all model getters

5. **`packages/ui/pages/admin/AdminGlobalModelSelectionPage.tsx`**
   - Update import: `import { modelApi } from '@repo/frontend-utils/src/apiService';`
   - Methods: `modelApi.updateAppConfigModels()`, plus all model getters

### User Pages (Priority: Medium)
6. **`packages/ui/pages/ProfilePage.tsx`**
   - Update import: `import { profileApi } from '@repo/frontend-utils/src/apiService';`
   - Methods: `profileApi.getById()`, `profileApi.upsert()`

### Components (Priority: Medium)
7. **`packages/ui/components/ConversationTranscriptDialog.tsx`**
   - Update import: `import { conversationApi } from '@repo/frontend-utils/src/apiService';`
   - Methods: `conversationApi.delete()`

### Components - Auth (Priority: Low - Optional Features)
8. **`packages/ui/components/ResetPasswordRequestForm.tsx`**
   - Update import: `import { authApi } from '@repo/frontend-utils/src/apiService';`
   - Note: `authApi.resetPasswordForEmail()` is not fully implemented yet (returns not implemented message)
   - This feature needs backend implementation first

9. **`packages/ui/components/ResetPasswordForm.tsx`**
   - Update import: `import { authApi } from '@repo/frontend-utils/src/apiService';`
   - Use: `authApi.updatePassword(currentPassword, newPassword)`

## 🛠️ Quick Find & Replace Guide

For most files, you can use this simple find & replace:

**Find:**
```typescript
from '@repo/frontend-utils/src/supabaseService'
```

**Replace:**
```typescript
from '@repo/frontend-utils/src/apiService'
```

**Important Notes:**
- The API methods have the same names and signatures
- The response format is slightly different but compatible
- Error handling is the same: `if (error) { ... }`

## 🗄️ Database Setup (Required Before Testing)

Before the application will work, you need to set up the database:

```bash
# 1. Start PostgreSQL (if not running)
docker run --name ai-classroom-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=ai_classroom \
  -p 5432:5432 \
  -d postgres:16

# 2. Create .env file in apps/backend
cd apps/backend
cp .env.example .env

# Edit .env and set:
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ai_classroom
# JWT_SECRET=your-secret-key-change-this

# 3. Generate Prisma Client
npx prisma generate

# 4. Push schema to database
npx prisma db push

# 5. Seed database with initial data
npm run prisma:seed

# 6. (Optional) Open Prisma Studio to verify
npx prisma studio
```

## 🧪 Testing Checklist

After completing the remaining tasks and database setup:

- [ ] Backend starts without errors: `cd apps/backend && npm run dev`
- [ ] Frontend starts without errors: `cd apps/web && npm run dev`
- [ ] User registration works
- [ ] User login works
- [ ] Conversations are saved
- [ ] Admin pages load (personalities, scenarios, profiles)
- [ ] Model selection works
- [ ] Profile editing works

## 📝 Optional Enhancements

These are not required but would improve the system:

1. **Password Reset Flow**
   - Implement password reset token generation in backend
   - Add email service integration
   - Complete frontend password reset components

2. **Refresh Tokens**
   - Implement refresh token rotation
   - Store refresh tokens in database
   - Add `/api/auth/refresh` endpoint

3. **Remove Supabase Dependencies**
   - After all frontend files are updated
   - Remove `@supabase/supabase-js` from package.json
   - Remove old Supabase client files
   - Remove old auth middleware

4. **Real-time Features**
   - Add WebSocket support for live updates
   - Implement server-sent events
   - Add real-time conversation status

5. **Rate Limiting**
   - Add express-rate-limit middleware
   - Protect auth endpoints from brute force

## 🐛 Known Issues to Fix

1. **Type Compatibility**
   - Some Prisma types might need mapping to match old Supabase types
   - Check `ConversationInsert` and other insert types

2. **Date Handling**
   - Ensure date serialization is consistent
   - Check `start_time` vs `startTime` naming

3. **Admin Pages**
   - Test all CRUD operations
   - Verify pagination and filtering

## 📚 Reference

- **Migration Guide**: See `MIGRATION_GUIDE.md` for full documentation
- **Prisma Schema**: `apps/backend/prisma/schema.prisma`
- **API Routes**: `apps/backend/src/routes/api/*`
- **Frontend API Service**: `packages/frontend-utils/src/apiService.ts`

## 💡 Tips

1. **Start with Admin Pages**: They're the most complex and will reveal any API issues early
2. **Test Each Page**: After updating imports, test the page in the browser
3. **Check Network Tab**: Look for 401 errors (auth issues) or 500 errors (backend bugs)
4. **Use Prisma Studio**: Great for debugging database issues
5. **Keep Supabase Temporarily**: Don't remove Supabase deps until everything works

## 🎯 Estimated Completion Time

- Updating remaining imports: ~30 minutes
- Testing and fixing issues: ~1-2 hours
- Database setup: ~15 minutes
- **Total: ~2-3 hours**

Good luck! 🚀
