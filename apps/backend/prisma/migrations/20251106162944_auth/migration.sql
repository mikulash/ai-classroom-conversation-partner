/*
  Warnings:

  - You are about to drop the column `user_role` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "user_role" "user_role" NOT NULL DEFAULT 'basic';

-- AlterTable
ALTER TABLE "users" DROP COLUMN "user_role",
ADD COLUMN     "confirmed_at" TIMESTAMP(3);
