/*
  Warnings:

  - Made the column `is_enabled` on table `realtime_transcription_models` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "realtime_transcription_models" ALTER COLUMN "is_enabled" SET NOT NULL;
