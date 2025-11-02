import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import { Database } from '@repo/shared/types/supabase/database.types';

// Supabase connection (source)
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// New PostgreSQL connection (destination)
const prisma = new PrismaClient();
const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

/**
 * Migrate data from Supabase to new PostgreSQL database
 */
async function migrateData() {
  console.log('🚀 Starting data migration from Supabase...\n');

  try {
    // 1. Migrate Response Models
    console.log('📦 Migrating response_models...');
    const { data: responseModels, error: rmError } = await supabase
      .from('response_models')
      .select('*');

    if (rmError) throw new Error(`Failed to fetch response_models: ${rmError.message}`);

    for (const model of responseModels || []) {
      await prisma.responseModel.upsert({
        where: { id: model.id },
        create: {
          id: model.id,
          createdAt: new Date(model.created_at),
          friendlyName: model.friendly_name,
          apiName: model.api_name,
          docsUrl: model.docs_url,
          isEnabled: model.is_enabled,
          provider: model.provider as any,
        },
        update: {
          friendlyName: model.friendly_name,
          apiName: model.api_name,
          docsUrl: model.docs_url,
          isEnabled: model.is_enabled,
          provider: model.provider as any,
        },
      });
    }
    console.log(`✅ Migrated ${responseModels?.length || 0} response models\n`);

    // 2. Migrate TTS Models
    console.log('📦 Migrating tts_models...');
    const { data: ttsModels, error: ttsError } = await supabase
      .from('tts_models')
      .select('*');

    if (ttsError) throw new Error(`Failed to fetch tts_models: ${ttsError.message}`);

    for (const model of ttsModels || []) {
      await prisma.ttsModel.upsert({
        where: { id: model.id },
        create: {
          id: model.id,
          createdAt: new Date(model.created_at),
          friendlyName: model.friendly_name,
          apiName: model.api_name,
          sampleRate: model.sample_rate,
          docsUrl: model.docs_url,
          isEnabled: model.is_enabled,
          provider: model.provider as any,
          allowsWordLevelTimestampedTranscript: model.allows_word_level_timestamped_transcript,
        },
        update: {
          friendlyName: model.friendly_name,
          apiName: model.api_name,
          sampleRate: model.sample_rate,
          docsUrl: model.docs_url,
          isEnabled: model.is_enabled,
          provider: model.provider as any,
          allowsWordLevelTimestampedTranscript: model.allows_word_level_timestamped_transcript,
        },
      });
    }
    console.log(`✅ Migrated ${ttsModels?.length || 0} TTS models\n`);

    // 3. Migrate Realtime Models
    console.log('📦 Migrating realtime_models...');
    const { data: realtimeModels, error: rtError } = await supabase
      .from('realtime_models')
      .select('*');

    if (rtError) throw new Error(`Failed to fetch realtime_models: ${rtError.message}`);

    for (const model of realtimeModels || []) {
      await prisma.realtimeModel.upsert({
        where: { id: model.id },
        create: {
          id: model.id,
          createdAt: new Date(model.created_at),
          friendlyName: model.friendly_name,
          apiName: model.api_name,
          docsUrl: model.docs_url,
          isEnabled: model.is_enabled,
          provider: model.provider as any,
        },
        update: {
          friendlyName: model.friendly_name,
          apiName: model.api_name,
          docsUrl: model.docs_url,
          isEnabled: model.is_enabled,
          provider: model.provider as any,
        },
      });
    }
    console.log(`✅ Migrated ${realtimeModels?.length || 0} realtime models\n`);

    // 4. Migrate Realtime Transcription Models
    console.log('📦 Migrating realtime_transcription_models...');
    const { data: rtTransModels, error: rttError } = await supabase
      .from('realtime_transcription_models')
      .select('*');

    if (rttError) throw new Error(`Failed to fetch realtime_transcription_models: ${rttError.message}`);

    for (const model of rtTransModels || []) {
      await prisma.realtimeTranscriptionModel.upsert({
        where: { id: model.id },
        create: {
          id: model.id,
          createdAt: new Date(model.created_at),
          friendlyName: model.friendly_name,
          provider: model.provider as any,
          apiName: model.api_name,
          docsUrl: model.docs_url,
          isEnabled: model.is_enabled,
          allowsWordLevelTimestamps: model.allows_word_level_timestamps,
        },
        update: {
          friendlyName: model.friendly_name,
          provider: model.provider as any,
          apiName: model.api_name,
          docsUrl: model.docs_url,
          isEnabled: model.is_enabled,
          allowsWordLevelTimestamps: model.allows_word_level_timestamps,
        },
      });
    }
    console.log(`✅ Migrated ${rtTransModels?.length || 0} realtime transcription models\n`);

    // 5. Migrate Timestamped Transcription Models
    console.log('📦 Migrating timestamped_transcription_models...');
    const { data: tsTransModels, error: tstError } = await supabase
      .from('timestamped_transcription_models')
      .select('*');

    if (tstError) throw new Error(`Failed to fetch timestamped_transcription_models: ${tstError.message}`);

    for (const model of tsTransModels || []) {
      await prisma.timestampedTranscriptionModel.upsert({
        where: { id: model.id },
        create: {
          id: model.id,
          createdAt: new Date(model.created_at),
          friendlyName: model.friendly_name,
          provider: model.provider as any,
          apiName: model.api_name,
          docsUrl: model.docs_url,
          isEnabled: model.is_enabled,
        },
        update: {
          friendlyName: model.friendly_name,
          provider: model.provider as any,
          apiName: model.api_name,
          docsUrl: model.docs_url,
          isEnabled: model.is_enabled,
        },
      });
    }
    console.log(`✅ Migrated ${tsTransModels?.length || 0} timestamped transcription models\n`);

    // 6. Migrate App Config
    console.log('📦 Migrating app_config...');
    const { data: appConfig, error: acError } = await supabase
      .from('app_config')
      .select('*')
      .single();

    if (acError) throw new Error(`Failed to fetch app_config: ${acError.message}`);

    if (appConfig) {
      await prisma.appConfig.upsert({
        where: { id: appConfig.id },
        create: {
          id: appConfig.id,
          editedAt: new Date(appConfig.edited_at),
          responseModelId: appConfig.response_model_id,
          ttsModelId: appConfig.tts_model_id,
          realtimeModelId: appConfig.realtime_model_id,
          realtimeTranscriptionModelId: appConfig.realtime_transcription_model_id,
          timestampedTranscriptionModelId: appConfig.timestamped_transcription_model_id,
          silenceTimeoutInSeconds: appConfig.silence_timeout_in_seconds,
          maxConversationDurationInSeconds: appConfig.max_conversation_duration_in_seconds,
          appName: appConfig.app_name,
          allowedDomains: appConfig.allowed_domains,
        },
        update: {
          editedAt: new Date(appConfig.edited_at),
          responseModelId: appConfig.response_model_id,
          ttsModelId: appConfig.tts_model_id,
          realtimeModelId: appConfig.realtime_model_id,
          realtimeTranscriptionModelId: appConfig.realtime_transcription_model_id,
          timestampedTranscriptionModelId: appConfig.timestamped_transcription_model_id,
          silenceTimeoutInSeconds: appConfig.silence_timeout_in_seconds,
          maxConversationDurationInSeconds: appConfig.max_conversation_duration_in_seconds,
          appName: appConfig.app_name,
          allowedDomains: appConfig.allowed_domains,
        },
      });
      console.log('✅ Migrated app config\n');
    }

    // 7. Migrate Conversation Roles
    console.log('📦 Migrating conversation_roles...');
    const { data: conversationRoles, error: crError } = await supabase
      .from('conversation_roles')
      .select('*');

    if (crError) throw new Error(`Failed to fetch conversation_roles: ${crError.message}`);

    for (const role of conversationRoles || []) {
      await prisma.conversationRole.upsert({
        where: { id: role.id },
        create: {
          id: role.id,
          createdAt: new Date(role.created_at),
          nameEn: role.name_en,
          nameCz: role.name_cs,
        },
        update: {
          nameEn: role.name_en,
          nameCz: role.name_cs,
        },
      });
    }
    console.log(`✅ Migrated ${conversationRoles?.length || 0} conversation roles\n`);

    // 8. Migrate Personalities
    console.log('📦 Migrating personalities...');
    const { data: personalities, error: pError } = await supabase
      .from('personalities')
      .select('*');

    if (pError) throw new Error(`Failed to fetch personalities: ${pError.message}`);

    for (const personality of personalities || []) {
      await prisma.personality.upsert({
        where: { id: personality.id },
        create: {
          id: personality.id,
          createdAt: new Date(personality.created_at),
          name: personality.name,
          age: personality.age,
          avatarUrl: personality.avatar_url,
          gender: personality.gender,
          sex: personality.sex as any,
          voiceInstructions: personality.voice_instructions,
          elevenlabsVoiceId: personality.elevenlabs_voice_id,
          openaiVoiceName: personality.openai_voice_name as any,
          problemSummaryEn: personality.problem_summary_en,
          personalityDescriptionEn: personality.personality_description_en,
          problemSummaryCz: personality.problem_summary_cs,
          personalityDescriptionCz: personality.personality_description_cs,
          settingEn: personality.setting_en,
          settingCz: personality.setting_cs,
          isHidden: personality.is_hidden,
        },
        update: {
          name: personality.name,
          age: personality.age,
          avatarUrl: personality.avatar_url,
          gender: personality.gender,
          sex: personality.sex as any,
          voiceInstructions: personality.voice_instructions,
          elevenlabsVoiceId: personality.elevenlabs_voice_id,
          openaiVoiceName: personality.openai_voice_name as any,
          problemSummaryEn: personality.problem_summary_en,
          personalityDescriptionEn: personality.personality_description_en,
          problemSummaryCz: personality.problem_summary_cs,
          personalityDescriptionCz: personality.personality_description_cs,
          settingEn: personality.setting_en,
          settingCz: personality.setting_cs,
          isHidden: personality.is_hidden,
        },
      });
    }
    console.log(`✅ Migrated ${personalities?.length || 0} personalities\n`);

    // 9. Migrate Scenarios
    console.log('📦 Migrating scenarios...');
    const { data: scenarios, error: sError } = await supabase
      .from('scenarios')
      .select('*');

    if (sError) throw new Error(`Failed to fetch scenarios: ${sError.message}`);

    for (const scenario of scenarios || []) {
      await prisma.scenario.upsert({
        where: { id: scenario.id },
        create: {
          id: scenario.id,
          createdAt: new Date(scenario.created_at),
          involvedPersonalityId: scenario.involved_personality_id,
          situationDescriptionEn: scenario.situation_description_en,
          settingEn: scenario.setting_en,
          situationDescriptionCz: scenario.situation_description_cs,
          settingCz: scenario.setting_cs,
        },
        update: {
          involvedPersonalityId: scenario.involved_personality_id,
          situationDescriptionEn: scenario.situation_description_en,
          settingEn: scenario.setting_en,
          situationDescriptionCz: scenario.situation_description_cs,
          settingCz: scenario.setting_cs,
        },
      });
    }
    console.log(`✅ Migrated ${scenarios?.length || 0} scenarios\n`);

    // 10. Migrate Profiles (from auth.users + profiles)
    console.log('📦 Migrating profiles...');
    const { data: profiles, error: profError } = await supabase
      .from('profiles')
      .select('*');

    if (profError) throw new Error(`Failed to fetch profiles: ${profError.message}`);

    // Try to fetch auth users to get emails (optional - may fail with permission error)
    let userEmailMap = new Map<string, string>();
    try {
      const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
      if (!usersError && users) {
        userEmailMap = new Map(users.map(u => [u.id, u.email!]));
        console.log(`   Found ${users.length} auth users with emails`);
      } else {
        console.log('   ⚠️  Cannot fetch auth users (permission denied) - will use emails from profiles table');
      }
    } catch (error) {
      console.log('   ⚠️  Cannot fetch auth users (permission denied) - will use emails from profiles table');
    }

    for (const profile of profiles || []) {
      // Priority: 1) auth.users email, 2) profiles.email, 3) generated email
      const email = userEmailMap.get(profile.id) || profile.email || `user-${profile.id}@migrated.local`;

      await prisma.profile.upsert({
        where: { id: profile.id },
        create: {
          id: profile.id,
          createdAt: new Date(profile.created_at),
          updatedAt: new Date(profile.updated_at),
          email: email,
          password: '$2b$10$MIGRATION.PLACEHOLDER.USERS.NEED.TO.RESET.PASSWORD', // Placeholder - users need to reset
          fullName: profile.full_name,
          gender: profile.gender,
          conversationRole: profile.conversation_role,
          bio: profile.bio,
          userRole: profile.user_role as any,
        },
        update: {
          email: email,
          fullName: profile.full_name,
          gender: profile.gender,
          conversationRole: profile.conversation_role,
          bio: profile.bio,
          userRole: profile.user_role as any,
        },
      });
    }
    console.log(`✅ Migrated ${profiles?.length || 0} profiles`);
    console.log(`⚠️  NOTE: All users have placeholder passwords and will need to contact admin to reset\n`);

    // 11. Migrate Admin User Custom Model Selection
    console.log('📦 Migrating admin_users_custom_model_selection...');
    const { data: adminSelections, error: asError } = await supabase
      .from('admin_users_custom_model_selection')
      .select('*');

    if (asError) throw new Error(`Failed to fetch admin_users_custom_model_selection: ${asError.message}`);

    for (const selection of adminSelections || []) {
      await prisma.adminUserCustomModelSelection.upsert({
        where: { userId: selection.user_id },
        create: {
          userId: selection.user_id,
          createdAt: new Date(selection.created_at),
          responseModelId: selection.response_model_id,
          ttsModelId: selection.tts_model_id,
          realtimeModelId: selection.realtime_model_id,
          realtimeTranscriptionModelId: selection.realtime_transcription_model_id,
          timestampedTranscriptionModelId: selection.timestamped_transcription_model_id,
        },
        update: {
          responseModelId: selection.response_model_id,
          ttsModelId: selection.tts_model_id,
          realtimeModelId: selection.realtime_model_id,
          realtimeTranscriptionModelId: selection.realtime_transcription_model_id,
          timestampedTranscriptionModelId: selection.timestamped_transcription_model_id,
        },
      });
    }
    console.log(`✅ Migrated ${adminSelections?.length || 0} admin custom model selections\n`);

    // 12. Migrate Conversations
    console.log('📦 Migrating conversations...');
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('*');

    if (convError) throw new Error(`Failed to fetch conversations: ${convError.message}`);

    for (const conversation of conversations || []) {
      await prisma.conversation.upsert({
        where: { id: conversation.id },
        create: {
          id: conversation.id,
          createdAt: new Date(conversation.created_at),
          userId: conversation.user_id,
          personalityId: conversation.personality_id,
          scenarioId: conversation.scenario_id,
          startTime: new Date(conversation.start_time),
          endTime: conversation.end_time ? new Date(conversation.end_time) : null,
          endedReason: conversation.ended_reason,
          messages: conversation.messages as any,
          logs: conversation.logs as any,
          conversationType: conversation.conversation_type as any,
          usedConfig: conversation.used_config as any,
        },
        update: {
          userId: conversation.user_id,
          personalityId: conversation.personality_id,
          scenarioId: conversation.scenario_id,
          startTime: new Date(conversation.start_time),
          endTime: conversation.end_time ? new Date(conversation.end_time) : null,
          endedReason: conversation.ended_reason,
          messages: conversation.messages as any,
          logs: conversation.logs as any,
          conversationType: conversation.conversation_type as any,
          usedConfig: conversation.used_config as any,
        },
      });
    }
    console.log(`✅ Migrated ${conversations?.length || 0} conversations\n`);

    console.log('🎉 Migration completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Response Models: ${responseModels?.length || 0}`);
    console.log(`   - TTS Models: ${ttsModels?.length || 0}`);
    console.log(`   - Realtime Models: ${realtimeModels?.length || 0}`);
    console.log(`   - Realtime Transcription Models: ${rtTransModels?.length || 0}`);
    console.log(`   - Timestamped Transcription Models: ${tsTransModels?.length || 0}`);
    console.log(`   - App Config: 1`);
    console.log(`   - Conversation Roles: ${conversationRoles?.length || 0}`);
    console.log(`   - Personalities: ${personalities?.length || 0}`);
    console.log(`   - Scenarios: ${scenarios?.length || 0}`);
    console.log(`   - Profiles: ${profiles?.length || 0}`);
    console.log(`   - Admin Custom Selections: ${adminSelections?.length || 0}`);
    console.log(`   - Conversations: ${conversations?.length || 0}`);
    console.log('\n⚠️  IMPORTANT: All migrated users have placeholder passwords.');
    console.log('   Users will need to contact an admin to reset their passwords.\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateData()
  .then(() => {
    console.log('✅ Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  });
