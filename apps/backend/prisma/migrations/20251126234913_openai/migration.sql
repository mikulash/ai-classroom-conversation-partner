/*
  Warnings:

  - The values [fable,onyx,nova] on the enum `openai_voice_name` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "openai_voice_name_new" AS ENUM ('alloy', 'ash', 'ballad', 'coral', 'echo', 'sage', 'shimmer', 'verse');
ALTER TABLE "public"."personalities" ALTER COLUMN "openai_voice_name" DROP DEFAULT;
ALTER TABLE "personalities" ALTER COLUMN "openai_voice_name" TYPE "openai_voice_name_new" USING ("openai_voice_name"::text::"openai_voice_name_new");
ALTER TYPE "openai_voice_name" RENAME TO "openai_voice_name_old";
ALTER TYPE "openai_voice_name_new" RENAME TO "openai_voice_name";
DROP TYPE "public"."openai_voice_name_old";
ALTER TABLE "personalities" ALTER COLUMN "openai_voice_name" SET DEFAULT 'alloy';
COMMIT;
