import { PrismaClient } from '../generated/prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create Response Models
  const responseModels = await prisma.responseModel.createMany({
    data: [
      {
        friendlyName: 'GPT-4o',
        apiName: 'gpt-4o',
        provider: 'OpenAi',
        docsUrl: 'https://platform.openai.com/docs/models/gpt-4o',
        isEnabled: true,
      },
      {
        friendlyName: 'GPT-4o Mini',
        apiName: 'gpt-4o-mini',
        provider: 'OpenAi',
        docsUrl: 'https://platform.openai.com/docs/models/gpt-4o-mini',
        isEnabled: true,
      },
      {
        friendlyName: 'Claude 3.5 Sonnet',
        apiName: 'claude-3-5-sonnet-20241022',
        provider: 'Anthropic',
        docsUrl: 'https://docs.anthropic.com/claude/docs/models-overview',
        isEnabled: true,
      },
      {
        friendlyName: 'Grok Beta',
        apiName: 'grok-beta',
        provider: 'xAi',
        docsUrl: 'https://docs.x.ai/docs',
        isEnabled: true,
      },
    ],
    skipDuplicates: true,
  });

  // Create TTS Models
  const ttsModels = await prisma.ttsModel.createMany({
    data: [
      {
        friendlyName: 'OpenAI TTS 1',
        apiName: 'tts-1',
        provider: 'OpenAi',
        sampleRate: 24000,
        docsUrl: 'https://platform.openai.com/docs/guides/text-to-speech',
        isEnabled: true,
        allowsWordLevelTimestampedTranscript: false,
      },
      {
        friendlyName: 'OpenAI TTS 1 HD',
        apiName: 'tts-1-hd',
        provider: 'OpenAi',
        sampleRate: 24000,
        docsUrl: 'https://platform.openai.com/docs/guides/text-to-speech',
        isEnabled: true,
        allowsWordLevelTimestampedTranscript: false,
      },
      {
        friendlyName: 'ElevenLabs Multilingual v2',
        apiName: 'eleven_multilingual_v2',
        provider: 'ElevenLabs',
        sampleRate: 44100,
        docsUrl: 'https://elevenlabs.io/docs/speech-synthesis/models',
        isEnabled: true,
        allowsWordLevelTimestampedTranscript: true,
      },
    ],
    skipDuplicates: true,
  });

  // Create Realtime Models
  const realtimeModels = await prisma.realtimeModel.createMany({
    data: [
      {
        friendlyName: 'GPT-4o Realtime',
        apiName: 'gpt-4o-realtime-preview',
        provider: 'OpenAi',
        docsUrl: 'https://platform.openai.com/docs/guides/realtime',
        isEnabled: true,
      },
      {
        friendlyName: 'GPT-4o Realtime (2024-10-01)',
        apiName: 'gpt-4o-realtime-preview-2024-10-01',
        provider: 'OpenAi',
        docsUrl: 'https://platform.openai.com/docs/guides/realtime',
        isEnabled: true,
      },
    ],
    skipDuplicates: true,
  });

  // Create Realtime Transcription Models
  const realtimeTranscriptionModels = await prisma.realtimeTranscriptionModel.createMany({
    data: [
      {
        friendlyName: 'Whisper (Realtime)',
        apiName: 'whisper-1',
        provider: 'OpenAi',
        docsUrl: 'https://platform.openai.com/docs/guides/speech-to-text',
        isEnabled: true,
        allowsWordLevelTimestamps: false,
      },
    ],
    skipDuplicates: true,
  });

  // Create Timestamped Transcription Models
  const timestampedTranscriptionModels = await prisma.timestampedTranscriptionModel.createMany({
    data: [
      {
        friendlyName: 'Whisper 1',
        apiName: 'whisper-1',
        provider: 'OpenAi',
        docsUrl: 'https://platform.openai.com/docs/guides/speech-to-text',
        isEnabled: true,
      },
    ],
    skipDuplicates: true,
  });

  // Create Conversation Roles
  const conversationRoles = await prisma.conversationRole.createMany({
    data: [
      {
        nameEn: 'Student',
        nameCs: 'Student',
      },
      {
        nameEn: 'Teacher',
        nameCs: 'Učitel',
      },
      {
        nameEn: 'Professional',
        nameCs: 'Profesionál',
      },
    ],
    skipDuplicates: true,
  });

  // Create App Config
  const appConfig = await prisma.appConfig.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      responseModelId: 1, // GPT-4o
      ttsModelId: 1, // OpenAI TTS 1
      realtimeModelId: 1, // GPT-4o Realtime
      realtimeTranscriptionModelId: 1, // Whisper
      timestampedTranscriptionModelId: 1, // Whisper
      silenceTimeoutInSeconds: 30,
      maxConversationDurationInSeconds: 300,
      appName: 'AI FIGURANT',
      allowedDomains: ['@muni.cz', '@example.com'],
    },
  });

  // Create Sample Personality
  const personality = await prisma.personality.create({
    data: {
      name: 'Emma',
      age: 28,
      sex: 'F',
      gender: 'female',
      openaiVoiceName: 'nova',
      problemSummaryEn: 'Struggling with work-life balance',
      personalityDescriptionEn:
        'A young professional dealing with stress and time management issues. Friendly and open to conversation.',
      problemSummaryCs: 'Bojuje s rovnováhou mezi pracovním a osobním životem',
      personalityDescriptionCs:
        'Mladá profesionálka, která se potýká se stresem a problémy s time managementem. Přátelská a otevřená konverzaci.',
      isHidden: false,
    },
  });

  // Create Sample Scenario
  const scenario = await prisma.scenario.create({
    data: {
      involvedPersonalityId: personality.id,
      situationDescriptionEn: 'Meeting at a coffee shop to discuss career challenges',
      settingEn: 'Casual coffee shop environment',
      situationDescriptionCs: 'Setkání v kavárně k diskusi o kariérních výzvách',
      settingCs: 'Neformální prostředí kavárny',
    },
  });

  console.log('Database seeded successfully!');
  console.log({
    responseModels: 4,
    ttsModels: 3,
    realtimeModels: 2,
    realtimeTranscriptionModels: 1,
    timestampedTranscriptionModels: 1,
    conversationRoles: 3,
    appConfig: 1,
    personalities: 1,
    scenarios: 1,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
