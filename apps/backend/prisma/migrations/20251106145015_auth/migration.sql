/*
  Warnings:

  - You are about to drop the column `email` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `user_role` on the `profiles` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id]` on the table `profiles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_id` to the `profiles` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."conversations" DROP CONSTRAINT "conversations_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."refresh_tokens" DROP CONSTRAINT "refresh_tokens_user_id_fkey";

-- DropIndex
DROP INDEX "public"."profiles_email_key";

-- AlterTable
ALTER TABLE "personalities" ALTER COLUMN "openai_voice_name" SET DEFAULT 'alloy';

-- AlterTable
ALTER TABLE "profiles" DROP COLUMN "email",
DROP COLUMN "password",
DROP COLUMN "user_role",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "user_role" "user_role" NOT NULL DEFAULT 'basic',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_user_id_key" ON "profiles"("user_id");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
