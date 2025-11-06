-- Migration: Separate User credentials from Profile information
-- This migration splits the profiles table into users (credentials) and profiles (editable info)

BEGIN;

-- Step 1: Create the new users table
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "user_role" "user_role" NOT NULL DEFAULT 'basic'
);

-- Step 2: Create unique index on email
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- Step 3: Migrate credential data from profiles to users
INSERT INTO "users" ("id", "created_at", "updated_at", "email", "password", "user_role")
SELECT
    "id",
    "created_at",
    "updated_at",
    COALESCE("email", 'temp_' || "id" || '@example.com'), -- Handle null emails
    COALESCE("password", 'temp_password_hash'), -- Handle null passwords
    "user_role"
FROM "profiles"
WHERE "email" IS NOT NULL AND "password" IS NOT NULL;

-- Step 4: Create a new profiles_new table with the updated structure
CREATE TABLE IF NOT EXISTS "profiles_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "full_name" TEXT,
    "gender" TEXT,
    "conversation_role" TEXT NOT NULL DEFAULT '',
    "bio" TEXT,
    CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Step 5: Create unique index on user_id
CREATE UNIQUE INDEX "profiles_new_user_id_key" ON "profiles_new"("user_id");

-- Step 6: Migrate profile data to new profiles table
INSERT INTO "profiles_new" ("id", "user_id", "created_at", "updated_at", "full_name", "gender", "conversation_role", "bio")
SELECT
    gen_random_uuid()::text, -- Generate new UUID for profile
    "id" as "user_id", -- The old profile ID becomes the user_id (FK to users)
    "created_at",
    "updated_at",
    "full_name",
    "gender",
    "conversation_role",
    "bio"
FROM "profiles"
WHERE "id" IN (SELECT "id" FROM "users"); -- Only migrate profiles that have corresponding users

-- Step 7: Update refresh_tokens foreign key to point to users table
-- (Already points to user_id which will reference users.id)
-- No change needed as the reference remains the same

-- Step 8: Update admin_users_custom_model_selection foreign key
-- (Already points to user_id, no schema change needed)
-- No change needed as the reference remains the same

-- Step 9: Update conversations foreign key
-- (Already points to user_id which will reference users.id)
-- No change needed as the reference remains the same

-- Step 10: Drop the old profiles table and rename the new one
DROP TABLE "profiles" CASCADE;
ALTER TABLE "profiles_new" RENAME TO "profiles";

-- Step 11: Recreate foreign key constraints that were dropped with CASCADE
ALTER TABLE "refresh_tokens"
    DROP CONSTRAINT IF EXISTS "refresh_tokens_user_id_fkey",
    ADD CONSTRAINT "refresh_tokens_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "conversations"
    DROP CONSTRAINT IF EXISTS "conversations_user_id_fkey",
    ADD CONSTRAINT "conversations_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "admin_users_custom_model_selection"
    DROP CONSTRAINT IF EXISTS "admin_users_custom_model_selection_user_id_fkey",
    ADD CONSTRAINT "admin_users_custom_model_selection_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;
