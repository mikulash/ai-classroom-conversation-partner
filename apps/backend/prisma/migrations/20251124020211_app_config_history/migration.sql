/*
  Warnings:

  - You are about to drop the column `edited_at` on the `app_config` table. All the data in the column will be lost.
  - You are about to drop the column `used_config` on the `conversations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "app_config" DROP COLUMN "edited_at",
ADD COLUMN     "user_id" TEXT,
ADD COLUMN     "valid_from" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "valid_to" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "conversations" DROP COLUMN "used_config";

-- CreateIndex
CREATE INDEX "app_config_valid_from_valid_to_idx" ON "app_config"("valid_from", "valid_to");

-- AddForeignKey
ALTER TABLE "app_config" ADD CONSTRAINT "app_config_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
