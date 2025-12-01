-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('basic', 'admin', 'owner');

-- CreateEnum
CREATE TYPE "conversation_type" AS ENUM ('VoiceOnly', 'Video', 'TextOnly', 'TextWithAudio');

-- CreateEnum
CREATE TYPE "openai_voice_name" AS ENUM ('alloy', 'ash', 'ballad', 'coral', 'echo', 'sage', 'shimmer');

-- CreateEnum
CREATE TYPE "personality_sex" AS ENUM ('F', 'M');

-- CreateEnum
CREATE TYPE "providers_response_model" AS ENUM ('OpenAi', 'xAi', 'Anthropic');

-- CreateEnum
CREATE TYPE "providers_tts_model" AS ENUM ('OpenAi', 'ElevenLabs');

-- CreateEnum
CREATE TYPE "providers_realtime_model" AS ENUM ('OpenAi');

-- CreateEnum
CREATE TYPE "providers_realtime_transcription_model" AS ENUM ('OpenAi');

-- CreateEnum
CREATE TYPE "providers_timestamped_transcription_model" AS ENUM ('OpenAi');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "confirmed_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "used" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "full_name" TEXT NOT NULL DEFAULT '',
    "gender" TEXT NOT NULL DEFAULT '',
    "conversation_role" TEXT NOT NULL DEFAULT '',
    "bio" TEXT NOT NULL DEFAULT '',
    "user_role" "user_role" NOT NULL DEFAULT 'basic',

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_users_custom_model_selection" (
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "response_model_id" INTEGER,
    "tts_model_id" INTEGER,
    "realtime_model_id" INTEGER,
    "realtime_transcription_model_id" INTEGER,
    "timestamped_transcription_model_id" INTEGER,

    CONSTRAINT "admin_users_custom_model_selection_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "personalities" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "age" INTEGER,
    "avatar_url" TEXT,
    "gender" TEXT NOT NULL DEFAULT '',
    "sex" "personality_sex" NOT NULL DEFAULT 'M',
    "voice_instructions" TEXT,
    "elevenlabs_voice_id" TEXT,
    "openai_voice_name" "openai_voice_name" NOT NULL DEFAULT 'alloy',
    "problem_summary_en" TEXT NOT NULL DEFAULT '',
    "personality_description_en" TEXT NOT NULL DEFAULT '',
    "problem_summary_cs" TEXT NOT NULL DEFAULT '',
    "personality_description_cs" TEXT NOT NULL DEFAULT '',
    "is_hidden" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "personalities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scenarios" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "involved_personality_id" INTEGER,
    "situation_description_en" TEXT NOT NULL DEFAULT '',
    "setting_en" TEXT NOT NULL DEFAULT '',
    "situation_description_cs" TEXT NOT NULL DEFAULT '',
    "setting_cs" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "scenarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_roles" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name_en" TEXT NOT NULL,
    "name_cs" TEXT NOT NULL,

    CONSTRAINT "conversation_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "personality_id" INTEGER,
    "scenario_id" INTEGER,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_reason" TEXT NOT NULL DEFAULT '',
    "messages" JSONB,
    "logs" JSONB,
    "conversation_type" "conversation_type" NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "response_models" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "friendly_name" TEXT NOT NULL,
    "api_name" TEXT NOT NULL,
    "docs_url" TEXT,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "provider" "providers_response_model" NOT NULL,

    CONSTRAINT "response_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tts_models" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "friendly_name" TEXT NOT NULL,
    "api_name" TEXT NOT NULL,
    "sample_rate" INTEGER NOT NULL,
    "docs_url" TEXT NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "provider" "providers_tts_model" NOT NULL,
    "allows_word_level_timestamped_transcript" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tts_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "realtime_models" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "friendly_name" TEXT NOT NULL,
    "api_name" TEXT NOT NULL,
    "docs_url" TEXT,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "provider" "providers_realtime_model" NOT NULL,

    CONSTRAINT "realtime_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "realtime_transcription_models" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "friendly_name" TEXT NOT NULL,
    "provider" "providers_realtime_transcription_model" NOT NULL,
    "api_name" TEXT NOT NULL,
    "docs_url" TEXT,
    "is_enabled" BOOLEAN DEFAULT true,
    "allows_word_level_timestamps" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "realtime_transcription_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timestamped_transcription_models" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "friendly_name" TEXT NOT NULL,
    "provider" "providers_timestamped_transcription_model" NOT NULL,
    "api_name" TEXT NOT NULL,
    "docs_url" TEXT,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "timestamped_transcription_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_config" (
    "id" SERIAL NOT NULL,
    "valid_from" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valid_to" TIMESTAMP(3),
    "user_id" TEXT,
    "response_model_id" INTEGER,
    "tts_model_id" INTEGER,
    "realtime_model_id" INTEGER,
    "silence_timeout_in_seconds" INTEGER NOT NULL DEFAULT 30,
    "allowed_domains" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "app_name" TEXT NOT NULL DEFAULT 'AI FIGURANT',
    "realtime_transcription_model_id" INTEGER,
    "timestamped_transcription_model_id" INTEGER,
    "max_conversation_duration_in_seconds" INTEGER NOT NULL DEFAULT 300,

    CONSTRAINT "app_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_idx" ON "refresh_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "password_reset_tokens_user_id_idx" ON "password_reset_tokens"("user_id");

-- CreateIndex
CREATE INDEX "password_reset_tokens_token_idx" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "app_config_valid_from_valid_to_idx" ON "app_config"("valid_from", "valid_to");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_users_custom_model_selection" ADD CONSTRAINT "admin_users_custom_model_selection_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_users_custom_model_selection" ADD CONSTRAINT "admin_users_custom_model_selection_response_model_id_fkey" FOREIGN KEY ("response_model_id") REFERENCES "response_models"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_users_custom_model_selection" ADD CONSTRAINT "admin_users_custom_model_selection_tts_model_id_fkey" FOREIGN KEY ("tts_model_id") REFERENCES "tts_models"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_users_custom_model_selection" ADD CONSTRAINT "admin_users_custom_model_selection_realtime_model_id_fkey" FOREIGN KEY ("realtime_model_id") REFERENCES "realtime_models"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_users_custom_model_selection" ADD CONSTRAINT "admin_users_custom_model_selection_realtime_transcription__fkey" FOREIGN KEY ("realtime_transcription_model_id") REFERENCES "realtime_transcription_models"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_users_custom_model_selection" ADD CONSTRAINT "admin_users_custom_model_selection_timestamped_transcripti_fkey" FOREIGN KEY ("timestamped_transcription_model_id") REFERENCES "timestamped_transcription_models"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scenarios" ADD CONSTRAINT "scenarios_involved_personality_id_fkey" FOREIGN KEY ("involved_personality_id") REFERENCES "personalities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_personality_id_fkey" FOREIGN KEY ("personality_id") REFERENCES "personalities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_scenario_id_fkey" FOREIGN KEY ("scenario_id") REFERENCES "scenarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_config" ADD CONSTRAINT "app_config_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_config" ADD CONSTRAINT "app_config_response_model_id_fkey" FOREIGN KEY ("response_model_id") REFERENCES "response_models"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_config" ADD CONSTRAINT "app_config_tts_model_id_fkey" FOREIGN KEY ("tts_model_id") REFERENCES "tts_models"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_config" ADD CONSTRAINT "app_config_realtime_model_id_fkey" FOREIGN KEY ("realtime_model_id") REFERENCES "realtime_models"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_config" ADD CONSTRAINT "app_config_realtime_transcription_model_id_fkey" FOREIGN KEY ("realtime_transcription_model_id") REFERENCES "realtime_transcription_models"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_config" ADD CONSTRAINT "app_config_timestamped_transcription_model_id_fkey" FOREIGN KEY ("timestamped_transcription_model_id") REFERENCES "timestamped_transcription_models"("id") ON DELETE SET NULL ON UPDATE CASCADE;
