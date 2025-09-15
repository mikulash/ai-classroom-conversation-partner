This SQL shows the structure of tables in the database.


```sql
-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.admin_users_custom_model_selection (
                                                           created_at timestamp with time zone NOT NULL DEFAULT now(),
                                                           user_id uuid NOT NULL,
                                                           response_model_id bigint,
                                                           tts_model_id bigint,
                                                           realtime_model_id bigint,
                                                           realtime_transcription_model_id bigint,
                                                           timestamped_transcription_model_id bigint,
                                                           CONSTRAINT admin_users_custom_model_selection_pkey PRIMARY KEY (user_id),
                                                           CONSTRAINT admin_users_custom_model_sele_timestamped_transcription_mo_fkey FOREIGN KEY (timestamped_transcription_model_id) REFERENCES public.timestamped_transcription_models(id),
                                                           CONSTRAINT admin_users_custom_model_selection_response_model_id_fkey FOREIGN KEY (response_model_id) REFERENCES public.response_models(id),
                                                           CONSTRAINT admin_users_custom_model_selection_tts_model_id_fkey FOREIGN KEY (tts_model_id) REFERENCES public.tts_models(id),
                                                           CONSTRAINT admin_users_custom_model_selection_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
                                                           CONSTRAINT admin_users_custom_model_sele_realtime_transcription_model_fkey FOREIGN KEY (realtime_transcription_model_id) REFERENCES public.realtime_transcription_models(id),
                                                           CONSTRAINT admin_users_custom_model_selection_realtime_model_id_fkey FOREIGN KEY (realtime_model_id) REFERENCES public.realtime_models(id)
);
CREATE TABLE public.app_config (
                                   id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
                                   edited_at timestamp with time zone NOT NULL DEFAULT now(),
                                   response_model_id bigint,
                                   tts_model_id bigint,
                                   realtime_model_id bigint,
                                   silence_timeout_in_seconds integer NOT NULL DEFAULT 30,
                                   allowed_domains ARRAY NOT NULL DEFAULT '{}'::text[],
                                   app_name text NOT NULL DEFAULT '''AI FIGURANT''::text'::text,
                                   realtime_transcription_model_id bigint,
                                   timestamped_transcription_model_id bigint,
                                   max_conversation_duration_in_seconds integer NOT NULL DEFAULT 300,
                                   CONSTRAINT app_config_pkey PRIMARY KEY (id),
                                   CONSTRAINT app_config_timestamped_transcription_model_id_fkey FOREIGN KEY (timestamped_transcription_model_id) REFERENCES public.timestamped_transcription_models(id),
                                   CONSTRAINT app_config_tts_model_id_fkey FOREIGN KEY (tts_model_id) REFERENCES public.tts_models(id),
                                   CONSTRAINT app_config_realtime_model_id_fkey FOREIGN KEY (realtime_model_id) REFERENCES public.realtime_models(id),
                                   CONSTRAINT app_config_realtime_transcription_model_id_fkey FOREIGN KEY (realtime_transcription_model_id) REFERENCES public.realtime_transcription_models(id),
                                   CONSTRAINT app_config_response_model_id_fkey FOREIGN KEY (response_model_id) REFERENCES public.response_models(id)
);
CREATE TABLE public.conversation_roles (
                                           id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
                                           created_at timestamp with time zone NOT NULL DEFAULT now(),
                                           name_en text NOT NULL,
                                           name_cs text NOT NULL DEFAULT ''::text,
                                           CONSTRAINT conversation_roles_pkey PRIMARY KEY (id)
);
CREATE TABLE public.conversations (
                                      id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
                                      created_at timestamp with time zone NOT NULL DEFAULT now(),
                                      user_id uuid NOT NULL,
                                      personality_id bigint,
                                      scenario_id bigint,
                                      start_time timestamp with time zone NOT NULL,
                                      end_time timestamp with time zone NOT NULL,
                                      ended_reason text NOT NULL,
                                      messages jsonb,
                                      logs jsonb,
                                      conversation_type USER-DEFINED NOT NULL,
                                      used_config jsonb,
                                      CONSTRAINT conversations_pkey PRIMARY KEY (id),
                                      CONSTRAINT conversations_scenario_id_fkey FOREIGN KEY (scenario_id) REFERENCES public.scenarios(id),
                                      CONSTRAINT conversations_personality_id_fkey FOREIGN KEY (personality_id) REFERENCES public.personalities(id),
                                      CONSTRAINT conversations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.personalities (
                                      id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
                                      created_at timestamp with time zone NOT NULL DEFAULT now(),
                                      name text NOT NULL,
                                      age smallint,
                                      avatar_url text,
                                      problem_summary_en text NOT NULL,
                                      gender text NOT NULL DEFAULT ''::text,
                                      voice_instructions text,
                                      elevenlabs_voice_id text,
                                      personality_description_en text NOT NULL DEFAULT ''::text,
                                      openai_voice_name USER-DEFINED NOT NULL DEFAULT 'alloy'::"OpenAiVoiceName",
                                      problem_summary_cs text NOT NULL DEFAULT ''::text,
                                      personality_description_cs text NOT NULL DEFAULT ''::text,
                                      sex USER-DEFINED NOT NULL DEFAULT 'M'::personality_sex,
                                      is_hidden boolean NOT NULL DEFAULT false,
                                      CONSTRAINT personalities_pkey PRIMARY KEY (id)
);
CREATE TABLE public.profiles (
                                 id uuid NOT NULL,
                                 created_at timestamp with time zone NOT NULL DEFAULT now(),
                                 updated_at timestamp with time zone NOT NULL DEFAULT now(),
                                 full_name text,
                                 gender text,
                                 conversation_role text NOT NULL DEFAULT 'teacher'::text,
                                 bio text,
                                 user_role USER-DEFINED NOT NULL DEFAULT 'basic'::user_role,
                                 email text,
                                 CONSTRAINT profiles_pkey PRIMARY KEY (id),
                                 CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.realtime_models (
                                        id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
                                        created_at timestamp with time zone NOT NULL DEFAULT now(),
                                        friendly_name text NOT NULL,
                                        api_name text NOT NULL,
                                        docs_url text,
                                        is_enabled boolean NOT NULL DEFAULT true,
                                        provider USER-DEFINED NOT NULL,
                                        CONSTRAINT realtime_models_pkey PRIMARY KEY (id)
);
CREATE TABLE public.realtime_transcription_models (
                                                      id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
                                                      created_at timestamp with time zone NOT NULL DEFAULT now(),
                                                      friendly_name text NOT NULL,
                                                      provider USER-DEFINED NOT NULL,
                                                      api_name text NOT NULL,
                                                      docs_url text,
                                                      is_enabled boolean DEFAULT false,
                                                      allows_word_level_timestamps boolean NOT NULL DEFAULT false,
                                                      CONSTRAINT realtime_transcription_models_pkey PRIMARY KEY (id)
);
CREATE TABLE public.response_models (
                                        id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
                                        created_at timestamp with time zone NOT NULL DEFAULT now(),
                                        friendly_name text NOT NULL,
                                        api_name text NOT NULL,
                                        docs_url text,
                                        is_enabled boolean NOT NULL DEFAULT true,
                                        provider USER-DEFINED NOT NULL,
                                        CONSTRAINT response_models_pkey PRIMARY KEY (id)
);
CREATE TABLE public.scenarios (
                                  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
                                  created_at timestamp with time zone NOT NULL DEFAULT now(),
                                  involved_personality_id bigint,
                                  situation_description_en text NOT NULL DEFAULT ''::text,
                                  setting_en text NOT NULL DEFAULT ''::text,
                                  situation_description_cs text NOT NULL DEFAULT ''::text,
                                  setting_cs text NOT NULL DEFAULT ''::text,
                                  CONSTRAINT scenarios_pkey PRIMARY KEY (id),
                                  CONSTRAINT scenarios_involved_personality_fkey FOREIGN KEY (involved_personality_id) REFERENCES public.personalities(id)
);
CREATE TABLE public.timestamped_transcription_models (
                                                         id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
                                                         created_at timestamp with time zone NOT NULL DEFAULT now(),
                                                         friendly_name text NOT NULL,
                                                         provider USER-DEFINED NOT NULL,
                                                         api_name text NOT NULL,
                                                         docs_url text,
                                                         is_enabled boolean NOT NULL,
                                                         CONSTRAINT timestamped_transcription_models_pkey PRIMARY KEY (id)
);
CREATE TABLE public.tts_models (
                                   id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
                                   created_at timestamp with time zone NOT NULL DEFAULT now(),
                                   friendly_name text NOT NULL,
                                   api_name text NOT NULL,
                                   sample_rate integer NOT NULL,
                                   docs_url text NOT NULL,
                                   is_enabled boolean NOT NULL DEFAULT true,
                                   provider USER-DEFINED NOT NULL,
                                   allows_word_level_timestamped_transcript boolean NOT NULL DEFAULT false,
                                   CONSTRAINT tts_models_pkey PRIMARY KEY (id)
);

```
