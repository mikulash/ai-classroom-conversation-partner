

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."OpenAiVoiceName" AS ENUM (
    'alloy',
    'ash',
    'ballad',
    'coral',
    'echo',
    'fable',
    'onyx',
    'nova',
    'sage',
    'shimmer',
    'verse'
);


ALTER TYPE "public"."OpenAiVoiceName" OWNER TO "postgres";


COMMENT ON TYPE "public"."OpenAiVoiceName" IS 'OpenAI voice name for their speech models';



CREATE TYPE "public"."conversation_type" AS ENUM (
    'VoiceOnly',
    'Video',
    'TextOnly',
    'TextWithAudio'
);


ALTER TYPE "public"."conversation_type" OWNER TO "postgres";


CREATE TYPE "public"."personality_sex" AS ENUM (
    'F',
    'M'
);


ALTER TYPE "public"."personality_sex" OWNER TO "postgres";


COMMENT ON TYPE "public"."personality_sex" IS 'for TTS voice selection';



CREATE TYPE "public"."providers_realtime_model" AS ENUM (
    'OpenAi'
);


ALTER TYPE "public"."providers_realtime_model" OWNER TO "postgres";


CREATE TYPE "public"."providers_realtime_transcription_model" AS ENUM (
    'OpenAi'
);


ALTER TYPE "public"."providers_realtime_transcription_model" OWNER TO "postgres";


CREATE TYPE "public"."providers_response_model" AS ENUM (
    'OpenAi',
    'xAi',
    'Anthropic'
);


ALTER TYPE "public"."providers_response_model" OWNER TO "postgres";


CREATE TYPE "public"."providers_timestamped_transcription_model" AS ENUM (
    'OpenAi'
);


ALTER TYPE "public"."providers_timestamped_transcription_model" OWNER TO "postgres";


CREATE TYPE "public"."providers_tts_model" AS ENUM (
    'OpenAi',
    'ElevenLabs'
);


ALTER TYPE "public"."providers_tts_model" OWNER TO "postgres";


CREATE TYPE "public"."user_role" AS ENUM (
    'basic',
    'admin',
    'owner'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_profile_on_signup"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    INSERT INTO public.profiles (user_id, username)
    VALUES (NEW.id, split_part(NEW.email, ''@'', 1));
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."create_profile_on_signup"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, gender, email)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'gender',
    new.email  -- Directly using new.email assuming it's a string
  );
  RETURN new;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"("user_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$SELECT
    -- returns true if the user_role for this user_id is 'admin' or 'owner'
    (user_role IN ('admin','owner'))
  FROM public.profiles
  WHERE id = user_id$$;


ALTER FUNCTION "public"."is_admin"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_owner"("p_user_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE
    AS $$
  SELECT user_role = 'owner'
    FROM public.profiles
   WHERE id = p_user_id;
$$;


ALTER FUNCTION "public"."is_owner"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_profiles_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at := now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_profiles_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."admin_users_custom_model_selection" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "response_model_id" bigint,
    "tts_model_id" bigint,
    "realtime_model_id" bigint,
    "realtime_transcription_model_id" bigint,
    "timestamped_transcription_model_id" bigint
);


ALTER TABLE "public"."admin_users_custom_model_selection" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."app_config" (
    "id" bigint NOT NULL,
    "edited_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "response_model_id" bigint,
    "tts_model_id" bigint,
    "realtime_model_id" bigint,
    "silence_timeout_in_seconds" integer DEFAULT 30 NOT NULL,
    "allowed_domains" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "app_name" "text" DEFAULT '''AI FIGURANT''::text'::"text" NOT NULL,
    "realtime_transcription_model_id" bigint,
    "timestamped_transcription_model_id" bigint,
    "max_conversation_duration_in_seconds" integer DEFAULT 300 NOT NULL
);


ALTER TABLE "public"."app_config" OWNER TO "postgres";


ALTER TABLE "public"."app_config" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."app_config_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."conversation_roles" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name_en" "text" NOT NULL,
    "name_cs" "text" DEFAULT ''::"text" NOT NULL
);


ALTER TABLE "public"."conversation_roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."conversations" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "personality_id" bigint,
    "scenario_id" bigint,
    "start_time" timestamp with time zone NOT NULL,
    "end_time" timestamp with time zone NOT NULL,
    "ended_reason" "text" NOT NULL,
    "messages" "jsonb",
    "logs" "jsonb",
    "conversation_type" "public"."conversation_type" NOT NULL,
    "used_config" "jsonb"
);


ALTER TABLE "public"."conversations" OWNER TO "postgres";


ALTER TABLE "public"."conversations" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."conversations_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."personalities" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" NOT NULL,
    "age" smallint,
    "avatar_url" "text",
    "problem_summary_en" "text" NOT NULL,
    "gender" "text" DEFAULT ''::"text" NOT NULL,
    "voice_instructions" "text",
    "elevenlabs_voice_id" "text",
    "personality_description_en" "text" DEFAULT ''::"text" NOT NULL,
    "openai_voice_name" "public"."OpenAiVoiceName" DEFAULT 'alloy'::"public"."OpenAiVoiceName" NOT NULL,
    "problem_summary_cs" "text" DEFAULT ''::"text" NOT NULL,
    "personality_description_cs" "text" DEFAULT ''::"text" NOT NULL,
    "sex" "public"."personality_sex" DEFAULT 'M'::"public"."personality_sex" NOT NULL,
    "is_hidden" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."personalities" OWNER TO "postgres";


COMMENT ON COLUMN "public"."personalities"."sex" IS 'for tts selection fallback voice';



ALTER TABLE "public"."personalities" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."personalities_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "full_name" "text",
    "gender" "text",
    "conversation_role" "text" DEFAULT 'teacher'::"text" NOT NULL,
    "bio" "text",
    "user_role" "public"."user_role" DEFAULT 'basic'::"public"."user_role" NOT NULL,
    "email" "text"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."realtime_models" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "friendly_name" "text" NOT NULL,
    "api_name" "text" NOT NULL,
    "docs_url" "text",
    "is_enabled" boolean DEFAULT true NOT NULL,
    "provider" "public"."providers_realtime_model" NOT NULL
);


ALTER TABLE "public"."realtime_models" OWNER TO "postgres";


ALTER TABLE "public"."realtime_models" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."realtime_models_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."realtime_transcription_models" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "friendly_name" "text" NOT NULL,
    "provider" "public"."providers_realtime_transcription_model" NOT NULL,
    "api_name" "text" NOT NULL,
    "docs_url" "text",
    "is_enabled" boolean DEFAULT false,
    "allows_word_level_timestamps" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."realtime_transcription_models" OWNER TO "postgres";


COMMENT ON COLUMN "public"."realtime_transcription_models"."allows_word_level_timestamps" IS 'at least word level';



CREATE TABLE IF NOT EXISTS "public"."response_models" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "friendly_name" "text" NOT NULL,
    "api_name" "text" NOT NULL,
    "docs_url" "text",
    "is_enabled" boolean DEFAULT true NOT NULL,
    "provider" "public"."providers_response_model" NOT NULL
);


ALTER TABLE "public"."response_models" OWNER TO "postgres";


ALTER TABLE "public"."response_models" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."response_models_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."scenarios" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "involved_personality_id" bigint,
    "situation_description_en" "text" DEFAULT ''::"text" NOT NULL,
    "setting_en" "text" DEFAULT ''::"text" NOT NULL,
    "situation_description_cs" "text" DEFAULT ''::"text" NOT NULL,
    "setting_cs" "text" DEFAULT ''::"text" NOT NULL
);


ALTER TABLE "public"."scenarios" OWNER TO "postgres";


ALTER TABLE "public"."scenarios" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."scenarios_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."timestamped_transcription_models" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "friendly_name" "text" NOT NULL,
    "provider" "public"."providers_timestamped_transcription_model" NOT NULL,
    "api_name" "text" NOT NULL,
    "docs_url" "text",
    "is_enabled" boolean NOT NULL
);


ALTER TABLE "public"."timestamped_transcription_models" OWNER TO "postgres";


ALTER TABLE "public"."timestamped_transcription_models" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."timestamped_transcription_models_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE "public"."realtime_transcription_models" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."transcription_models_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."tts_models" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "friendly_name" "text" NOT NULL,
    "api_name" "text" NOT NULL,
    "sample_rate" integer NOT NULL,
    "docs_url" "text" NOT NULL,
    "is_enabled" boolean DEFAULT true NOT NULL,
    "provider" "public"."providers_tts_model" NOT NULL,
    "allows_word_level_timestamped_transcript" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."tts_models" OWNER TO "postgres";


ALTER TABLE "public"."tts_models" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."tts_models_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE "public"."conversation_roles" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."user_roles_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "public"."admin_users_custom_model_selection"
    ADD CONSTRAINT "admin_users_custom_model_selection_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."app_config"
    ADD CONSTRAINT "app_config_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."personalities"
    ADD CONSTRAINT "personalities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."realtime_models"
    ADD CONSTRAINT "realtime_models_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."response_models"
    ADD CONSTRAINT "response_models_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."scenarios"
    ADD CONSTRAINT "scenarios_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."timestamped_transcription_models"
    ADD CONSTRAINT "timestamped_transcription_models_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."realtime_transcription_models"
    ADD CONSTRAINT "transcription_models_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tts_models"
    ADD CONSTRAINT "tts_models_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."conversation_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."admin_users_custom_model_selection"
    ADD CONSTRAINT "admin_users_custom_model_sele_realtime_transcription_model_fkey" FOREIGN KEY ("realtime_transcription_model_id") REFERENCES "public"."realtime_transcription_models"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."admin_users_custom_model_selection"
    ADD CONSTRAINT "admin_users_custom_model_sele_timestamped_transcription_mo_fkey" FOREIGN KEY ("timestamped_transcription_model_id") REFERENCES "public"."timestamped_transcription_models"("id");



ALTER TABLE ONLY "public"."admin_users_custom_model_selection"
    ADD CONSTRAINT "admin_users_custom_model_selection_realtime_model_id_fkey" FOREIGN KEY ("realtime_model_id") REFERENCES "public"."realtime_models"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."admin_users_custom_model_selection"
    ADD CONSTRAINT "admin_users_custom_model_selection_response_model_id_fkey" FOREIGN KEY ("response_model_id") REFERENCES "public"."response_models"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."admin_users_custom_model_selection"
    ADD CONSTRAINT "admin_users_custom_model_selection_tts_model_id_fkey" FOREIGN KEY ("tts_model_id") REFERENCES "public"."tts_models"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."admin_users_custom_model_selection"
    ADD CONSTRAINT "admin_users_custom_model_selection_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."app_config"
    ADD CONSTRAINT "app_config_realtime_model_id_fkey" FOREIGN KEY ("realtime_model_id") REFERENCES "public"."realtime_models"("id");



ALTER TABLE ONLY "public"."app_config"
    ADD CONSTRAINT "app_config_realtime_transcription_model_id_fkey" FOREIGN KEY ("realtime_transcription_model_id") REFERENCES "public"."realtime_transcription_models"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."app_config"
    ADD CONSTRAINT "app_config_response_model_id_fkey" FOREIGN KEY ("response_model_id") REFERENCES "public"."response_models"("id");



ALTER TABLE ONLY "public"."app_config"
    ADD CONSTRAINT "app_config_timestamped_transcription_model_id_fkey" FOREIGN KEY ("timestamped_transcription_model_id") REFERENCES "public"."timestamped_transcription_models"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."app_config"
    ADD CONSTRAINT "app_config_tts_model_id_fkey" FOREIGN KEY ("tts_model_id") REFERENCES "public"."tts_models"("id");



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_personality_id_fkey" FOREIGN KEY ("personality_id") REFERENCES "public"."personalities"("id");



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_scenario_id_fkey" FOREIGN KEY ("scenario_id") REFERENCES "public"."scenarios"("id");



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."scenarios"
    ADD CONSTRAINT "scenarios_involved_personality_fkey" FOREIGN KEY ("involved_personality_id") REFERENCES "public"."personalities"("id");



CREATE POLICY "Config edition for admins" ON "public"."app_config" USING ("public"."is_admin"("auth"."uid"())) WITH CHECK ("public"."is_admin"("auth"."uid"()));



CREATE POLICY "Editing personalities for admin users" ON "public"."personalities" USING ("public"."is_admin"("auth"."uid"())) WITH CHECK ("public"."is_admin"("auth"."uid"()));



CREATE POLICY "Editing scenarios for admin users" ON "public"."scenarios" USING ("public"."is_admin"("auth"."uid"())) WITH CHECK ("public"."is_admin"("auth"."uid"()));



CREATE POLICY "Enable insert for authenticated users only" ON "public"."conversations" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable read access for all users" ON "public"."app_config" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."conversation_roles" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."personalities" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."realtime_models" FOR SELECT USING ("is_enabled");



CREATE POLICY "Enable read access for all users" ON "public"."realtime_transcription_models" FOR SELECT USING ("is_enabled");



CREATE POLICY "Enable read access for all users" ON "public"."response_models" FOR SELECT USING ("is_enabled");



CREATE POLICY "Enable read access for all users" ON "public"."scenarios" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."timestamped_transcription_models" FOR SELECT USING ("is_enabled");



CREATE POLICY "Enable read access for all users" ON "public"."tts_models" FOR SELECT USING ("is_enabled");



CREATE POLICY "Enable users to view their own data only" ON "public"."conversations" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Override selected models for admins" ON "public"."admin_users_custom_model_selection" USING ("public"."is_admin"("auth"."uid"())) WITH CHECK ("public"."is_admin"("auth"."uid"()));



CREATE POLICY "Public profiles are viewable by everyone." ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "See conversation of other users for administrators" ON "public"."conversations" USING ("public"."is_admin"("auth"."uid"())) WITH CHECK ("public"."is_admin"("auth"."uid"()));



CREATE POLICY "Users can insert their own profile." ON "public"."profiles" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "Users can update own profile." ON "public"."profiles" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "id"));



ALTER TABLE "public"."admin_users_custom_model_selection" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."app_config" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."conversation_roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."conversations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "owner can edit profiles" ON "public"."profiles" FOR UPDATE USING ("public"."is_owner"("auth"."uid"())) WITH CHECK ("public"."is_owner"("auth"."uid"()));



CREATE POLICY "owner can view all profiles" ON "public"."profiles" FOR SELECT USING ("public"."is_owner"("auth"."uid"()));



ALTER TABLE "public"."personalities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."realtime_models" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."realtime_transcription_models" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."response_models" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."scenarios" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."timestamped_transcription_models" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tts_models" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."app_config";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."response_models";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";




















































































































































































GRANT ALL ON FUNCTION "public"."create_profile_on_signup"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_profile_on_signup"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_profile_on_signup"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_owner"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_owner"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_owner"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_profiles_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_profiles_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_profiles_updated_at"() TO "service_role";



























GRANT ALL ON TABLE "public"."admin_users_custom_model_selection" TO "anon";
GRANT ALL ON TABLE "public"."admin_users_custom_model_selection" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_users_custom_model_selection" TO "service_role";



GRANT ALL ON TABLE "public"."app_config" TO "anon";
GRANT ALL ON TABLE "public"."app_config" TO "authenticated";
GRANT ALL ON TABLE "public"."app_config" TO "service_role";



GRANT ALL ON SEQUENCE "public"."app_config_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."app_config_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."app_config_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."conversation_roles" TO "anon";
GRANT ALL ON TABLE "public"."conversation_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."conversation_roles" TO "service_role";



GRANT ALL ON TABLE "public"."conversations" TO "anon";
GRANT ALL ON TABLE "public"."conversations" TO "authenticated";
GRANT ALL ON TABLE "public"."conversations" TO "service_role";



GRANT ALL ON SEQUENCE "public"."conversations_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."conversations_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."conversations_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."personalities" TO "anon";
GRANT ALL ON TABLE "public"."personalities" TO "authenticated";
GRANT ALL ON TABLE "public"."personalities" TO "service_role";



GRANT ALL ON SEQUENCE "public"."personalities_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."personalities_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."personalities_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."realtime_models" TO "anon";
GRANT ALL ON TABLE "public"."realtime_models" TO "authenticated";
GRANT ALL ON TABLE "public"."realtime_models" TO "service_role";



GRANT ALL ON SEQUENCE "public"."realtime_models_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."realtime_models_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."realtime_models_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."realtime_transcription_models" TO "anon";
GRANT ALL ON TABLE "public"."realtime_transcription_models" TO "authenticated";
GRANT ALL ON TABLE "public"."realtime_transcription_models" TO "service_role";



GRANT ALL ON TABLE "public"."response_models" TO "anon";
GRANT ALL ON TABLE "public"."response_models" TO "authenticated";
GRANT ALL ON TABLE "public"."response_models" TO "service_role";



GRANT ALL ON SEQUENCE "public"."response_models_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."response_models_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."response_models_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."scenarios" TO "anon";
GRANT ALL ON TABLE "public"."scenarios" TO "authenticated";
GRANT ALL ON TABLE "public"."scenarios" TO "service_role";



GRANT ALL ON SEQUENCE "public"."scenarios_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."scenarios_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."scenarios_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."timestamped_transcription_models" TO "anon";
GRANT ALL ON TABLE "public"."timestamped_transcription_models" TO "authenticated";
GRANT ALL ON TABLE "public"."timestamped_transcription_models" TO "service_role";



GRANT ALL ON SEQUENCE "public"."timestamped_transcription_models_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."timestamped_transcription_models_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."timestamped_transcription_models_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."transcription_models_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."transcription_models_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."transcription_models_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."tts_models" TO "anon";
GRANT ALL ON TABLE "public"."tts_models" TO "authenticated";
GRANT ALL ON TABLE "public"."tts_models" TO "service_role";



GRANT ALL ON SEQUENCE "public"."tts_models_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."tts_models_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."tts_models_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_roles_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_roles_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_roles_id_seq" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
