import { PrismaClient } from '../src/generated/prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Response Models
  console.log('Seeding Response Models...');
  await prisma.responseModel.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      createdAt: '2025-04-27T20:16:59.115Z',
      friendlyName: 'Claude 3.7 Sonnet',
      apiName: 'claude-3-7-sonnet-latest',
      docsUrl: 'https://docs.anthropic.com/en/docs/about-claude/models/overview',
      isEnabled: true,
      provider: 'Anthropic',
    },
  });
  await prisma.responseModel.upsert({
    where: { id: 4 },
    update: {},
    create: {
      id: 4,
      createdAt: '2025-04-27T20:17:13.867Z',
      friendlyName: 'Claude 3.5 Haiku',
      apiName: 'claude-3-5-haiku-latest',
      docsUrl: 'https://docs.anthropic.com/en/docs/about-claude/models/overview',
      isEnabled: true,
      provider: 'Anthropic',
    },
  });
  await prisma.responseModel.upsert({
    where: { id: 5 },
    update: {},
    create: {
      id: 5,
      createdAt: '2025-04-27T20:17:31.603Z',
      friendlyName: 'grok-3',
      apiName: 'grok-3-latest',
      docsUrl: 'https://docs.x.ai/docs/models?models-and-pricing',
      isEnabled: true,
      provider: 'xAi',
    },
  });
  await prisma.responseModel.upsert({
    where: { id: 6 },
    update: {},
    create: {
      id: 6,
      createdAt: '2025-04-27T20:17:43.603Z',
      friendlyName: 'grok-3-mini-beta',
      apiName: 'grok-3-mini-beta',
      docsUrl: 'https://docs.x.ai/docs/models?models-and-pricing',
      isEnabled: true,
      provider: 'xAi',
    },
  });
  await prisma.responseModel.upsert({
    where: { id: 7 },
    update: {},
    create: {
      id: 7,
      createdAt: '2025-05-12T22:29:06.450Z',
      friendlyName: 'GPT-4.1',
      apiName: 'gpt-4.1',
      docsUrl: 'https://platform.openai.com/docs/models/gpt-4.1',
      isEnabled: true,
      provider: 'OpenAi',
    },
  });
  await prisma.responseModel.upsert({
    where: { id: 8 },
    update: {},
    create: {
      id: 8,
      createdAt: '2025-05-12T22:29:47.133Z',
      friendlyName: 'GPT-4.1 mini',
      apiName: 'gpt-4.1-mini',
      docsUrl: 'https://platform.openai.com/docs/models/gpt-4.1-mini',
      isEnabled: true,
      provider: 'OpenAi',
    },
  });
  await prisma.responseModel.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      createdAt: '2025-04-27T20:16:16.303Z',
      friendlyName: 'gpt-4o-mini',
      apiName: 'gpt-4o-mini',
      docsUrl: 'https://platform.openai.com/docs/models/gpt-4o-mini',
      isEnabled: true,
      provider: 'OpenAi',
    },
  });
  await prisma.responseModel.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      createdAt: '2025-04-27T20:16:36.142Z',
      friendlyName: 'gpt-4o',
      apiName: 'gpt-4o',
      docsUrl: 'https://platform.openai.com/docs/models/gpt-4o',
      isEnabled: true,
      provider: 'OpenAi',
    },
  });
  await prisma.responseModel.upsert({
    where: { id: 9 },
    update: {},
    create: {
      id: 9,
      createdAt: '2025-09-19T15:44:09.399Z',
      friendlyName: 'GPT-5',
      apiName: 'gpt-5',
      docsUrl: 'https://platform.openai.com/docs/models/gpt-5',
      isEnabled: true,
      provider: 'OpenAi',
    },
  });
  await prisma.responseModel.upsert({
    where: { id: 10 },
    update: {},
    create: {
      id: 10,
      createdAt: '2025-09-19T15:44:49.544Z',
      friendlyName: 'GPT-5 mini',
      apiName: 'gpt-5-mini',
      docsUrl: 'https://platform.openai.com/docs/models/gpt-5-mini',
      isEnabled: true,
      provider: 'OpenAi',
    },
  });
  await prisma.responseModel.upsert({
    where: { id: 11 },
    update: {},
    create: {
      id: 11,
      createdAt: '2025-09-19T15:45:18.456Z',
      friendlyName: 'GPT-5 nano',
      apiName: 'gpt-5-nano',
      docsUrl: null,
      isEnabled: true,
      provider: 'OpenAi',
    },
  });

  // TTS Models
  console.log('Seeding TTS Models...');
  await prisma.ttsModel.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      createdAt: '2025-04-27T20:18:41.875Z',
      friendlyName: 'GPT-4o mini TTS',
      apiName: 'gpt-4o-mini-tts',
      sampleRate: 24000,
      docsUrl: 'https://platform.openai.com/docs/models/gpt-4o-mini-tts',
      isEnabled: true,
      provider: 'OpenAi',
      allowsWordLevelTimestampedTranscript: false,
    },
  });
  await prisma.ttsModel.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      createdAt: '2025-04-27T20:19:07.450Z',
      friendlyName: 'Multilingual v2',
      apiName: 'eleven_multilingual_v2',
      sampleRate: 22050,
      docsUrl: 'https://elevenlabs.io/docs/models#multilingual-v2',
      isEnabled: true,
      provider: 'ElevenLabs',
      allowsWordLevelTimestampedTranscript: false,
    },
  });

  // Realtime Models
  console.log('Seeding Realtime Models...');
  await prisma.realtimeModel.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      createdAt: '2025-04-27T20:21:31.485Z',
      friendlyName: 'GPT 4o mini realtime',
      apiName: 'gpt-4o-mini-realtime-preview',
      docsUrl: 'https://platform.openai.com/docs/models/gpt-4o-mini-realtime-preview',
      isEnabled: true,
      provider: 'OpenAi',
    },
  });
  await prisma.realtimeModel.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      createdAt: '2025-04-27T20:22:43.479Z',
      friendlyName: 'GPT-4o Realtime',
      apiName: 'gpt-4o-realtime-preview',
      docsUrl: 'https://platform.openai.com/docs/models/gpt-4o-realtime-preview',
      isEnabled: true,
      provider: 'OpenAi',
    },
  });
  await prisma.realtimeModel.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      createdAt: '2025-09-19T15:52:51.284Z',
      friendlyName: 'gpt-realtime',
      apiName: 'gpt-realtime',
      docsUrl: null,
      isEnabled: true,
      provider: 'OpenAi',
    },
  });

  // Realtime Transcription Models
  console.log('Seeding Realtime Transcription Models...');
  await prisma.realtimeTranscriptionModel.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      createdAt: '2025-05-17T19:59:55.447Z',
      friendlyName: 'Whisper',
      provider: 'OpenAi',
      apiName: 'whisper-1',
      docsUrl: 'https://platform.openai.com/docs/models/whisper-1',
      isEnabled: true,
      allowsWordLevelTimestamps: true,
    },
  });
  await prisma.realtimeTranscriptionModel.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      createdAt: '2025-05-17T20:00:54.671Z',
      friendlyName: 'GPT-4o mini Transcribe',
      provider: 'OpenAi',
      apiName: 'gpt-4o-mini-transcribe',
      docsUrl: 'https://platform.openai.com/docs/models/gpt-4o-mini-transcribe',
      isEnabled: true,
      allowsWordLevelTimestamps: false,
    },
  });
  await prisma.realtimeTranscriptionModel.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      createdAt: '2025-05-17T20:01:32.301Z',
      friendlyName: 'GPT-4o Transcribe',
      provider: 'OpenAi',
      apiName: 'gpt-4o-transcribe',
      docsUrl: 'https://platform.openai.com/docs/models/gpt-4o-transcribe',
      isEnabled: true,
      allowsWordLevelTimestamps: false,
    },
  });

  // Timestamped Transcription Models
  console.log('Seeding Timestamped Transcription Models...');
  await prisma.timestampedTranscriptionModel.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      createdAt: '2025-05-17T20:23:05.104Z',
      friendlyName: 'Whisper',
      provider: 'OpenAi',
      apiName: 'whisper-1',
      docsUrl: 'https://platform.openai.com/docs/models/whisper-1',
      isEnabled: true,
    },
  });

  // Conversation Roles
  console.log('Seeding Conversation Roles...');
  await prisma.conversationRole.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      createdAt: '2025-04-26T14:34:33.415Z',
      nameEn: 'teacher',
      nameCs: 'učitel/ka',
    },
  });
  await prisma.conversationRole.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      createdAt: '2025-04-26T14:34:44.177Z',
      nameEn: 'advisor',
      nameCs: 'poradce',
    },
  });
  await prisma.conversationRole.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      createdAt: '2025-04-26T14:34:54.819Z',
      nameEn: 'parent',
      nameCs: 'rodič',
    },
  });

  // App Config
  console.log('Seeding App Config...');
  await prisma.appConfig.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      editedAt: new Date().toISOString(),
      responseModelId: 10,
      ttsModelId: 2,
      realtimeModelId: 1,
      silenceTimeoutInSeconds: 20,
      allowedDomains: [
        'muni.cz',
        'mail.muni.cz',
        'ped.muni.cz',
        'ics.muni.cz',
      ],
      appName: 'AI FIGURANT',
      realtimeTranscriptionModelId: 2,
      timestampedTranscriptionModelId: 1,
      maxConversationDurationInSeconds: 300,
    },
  });

  // Personalities
  console.log('Seeding Personalities...');
  await prisma.personality.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      createdAt: '2025-04-26T14:29:38.846Z',
      name: 'Honzík',
      age: 6,
      avatarUrl: 'https://models.readyplayer.me/6820bbc0e036577fe085562c.glb',
      gender: 'M',
      sex: 'M',
      voiceInstructions: 'Personality/Affect: A supportive and empathetic presence representing "Honzík", who experiences specific learning disabilities.\nVoice: A youthful, clear, and gentle male voice with a playful yet reassuring undertone.\nTone: Encouraging, patient, and empathetic.\nDialect: Clear and simple language appropriate for a 6-year-old listener.\nPronunciation: Clear and precise, with gentle emphasis on supportive phrases.\nFeatures: Includes brief pauses for clarity and occasional gentle whispering for emphasis.\nPacing: A moderate pace that allows for extra clarity for young listeners.\nEmotion: Genuine empathy and warmth.',
      elevenlabsVoiceId: null,
      openaiVoiceName: 'verse',
      problemSummaryEn: 'Specific learning disabilities',
      personalityDescriptionEn: 'Honzík is a 6-year-old boy with specific learning disabilities, including dyslexia and graphic motor difficulties. He experiences low frustration tolerance during writing activities and is hesitant to read aloud. He requires structured support and collaborative efforts between school and home to overcome his challenges.',
      problemSummaryCs: 'Specifické poruchy učení',
      personalityDescriptionCs: 'Honzík je šestiletý chlapec se specifickými poruchami učení, včetně dyslexie a grafomotorických obtíží. Zažívá nízkou frustrační toleranci při písemných činnostech a váhá s hlasitým čtením. K překonání svých problémů potřebuje strukturovanou podporu a spolupráci mezi školou a domovem.',
      isHidden: false,
    },
  });
  await prisma.personality.upsert({
    where: { id: 4 },
    update: {},
    create: {
      id: 4,
      createdAt: '2025-04-26T14:48:10.543Z',
      name: 'Petr',
      age: 11,
      avatarUrl: 'https://models.readyplayer.me/6820bbc0e036577fe085562c',
      gender: 'M',
      sex: 'M',
      voiceInstructions: 'Personality/Affect: Logical and detail-oriented storyteller.\nVoice: A calm, more monotone voice with a slight \'robotic\' edge.\nTone: Descriptive, matter-of-fact, and friendly to precise details.\nDialect: Spoken Czech with rare archaisms (encyclopedic reading).\nPronunciation: Careful attention to technical terms.\nFeatures: Pauses when making eye contact, sometimes talks to the wall.\nPacing: Medium-slow pace to allow time to articulate accurately.\nEmotion: Low emotionality on the surface, occasional stress on the inside.',
      elevenlabsVoiceId: null,
      openaiVoiceName: 'alloy',
      problemSummaryEn: 'Social difficulties, unclear diagnosis PAS/Asperger',
      personalityDescriptionEn: 'Encyclopedically educated, competitive, truthful boy with special interests (trains, mineralogy); rigid, sensitive to change.',
      problemSummaryCs: 'Sociální nesnáze, nejasná diagnóza PAS/Asperger',
      personalityDescriptionCs: 'Encyklopedicky vzdělaný, soutěživý, pravdomluvný chlapec se zvláštními zájmy (vlaky, mineralogie); rigidní, citlivý na změny.',
      isHidden: false,
    },
  });
  await prisma.personality.upsert({
    where: { id: 7 },
    update: {},
    create: {
      id: 7,
      createdAt: '2025-04-26T14:48:10.543Z',
      name: 'Robert',
      age: 8,
      avatarUrl: null,
      gender: 'M',
      sex: 'M',
      voiceInstructions: 'Personality/Affect: Energetic and boisterous.\nVoice: A loud, gruff, boyish soprano.\nTone: Explosive, fast, then sudden silence.\nDialect: Colloquial expressions of "hey, yeah".\nPronunciation: Rushing, swallowing syllables.\nFeatures.\nPacing: Alternating very fast and sudden stops.\nEmotion: Frustration, anger, occasional despair.',
      elevenlabsVoiceId: null,
      openaiVoiceName: 'alloy',
      problemSummaryEn: 'Aggressive and disruptive behaviour; conflict with peers',
      personalityDescriptionEn: 'Impulsive and competitive, quick to defend himself by attack; sensitive to criticism, dependent on his mother\'s protection, insecure under the surface.',
      problemSummaryCs: 'Agresivní a rušivé chování; konflikt s vrstevníky;',
      personalityDescriptionCs: 'Impulzivní a soutěživý, rychle se brání útokem; citlivý na kritiku, závislý na matčině ochraně, pod povrchem nejistý.',
      isHidden: false,
    },
  });
  await prisma.personality.upsert({
    where: { id: 6 },
    update: {},
    create: {
      id: 6,
      createdAt: '2025-04-26T14:48:10.543Z',
      name: 'Katka',
      age: 15,
      avatarUrl: null,
      gender: 'F',
      sex: 'F',
      voiceInstructions: 'Personality/Affect: Vulnerable, introspective.\nVoice: Muffled, slightly hoarse alto.\nTone: Slowed down, melancholy, sometimes whispery.\nDialect: Colloquial Czech with short sentences.\nPronunciation: incoherent with stronger emotion.\nFeatures: frequent clearing of throat, sighs.\nPacing: Slow, with sudden accelerations.\nEmotion: Sadness, shame, relief when understood.',
      elevenlabsVoiceId: null,
      openaiVoiceName: 'alloy',
      problemSummaryEn: 'Self-harming\r\n',
      personalityDescriptionEn: 'Quiet, withdrawn girl, emotionally overloaded; loyal to family, seeks acceptance but uses maladaptive coping (cutting).',
      problemSummaryCs: 'sebepoškozování',
      personalityDescriptionCs: 'Tichá, stažená dívka, emočně přetížená; loajální vůči rodině, hledá přijetí, ale využívá maladaptivní coping (řezání).',
      isHidden: false,
    },
  });
  await prisma.personality.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      createdAt: '2025-04-26T14:34:13.524Z',
      name: 'Petra',
      age: 14,
      avatarUrl: '',
      gender: 'F',
      sex: 'F',
      voiceInstructions: 'Personality/Affect: A sensitive and empathetic presence representing "Petra", who faces challenges with an eating disorder.\n        Voice: A clear and articulate female voice with a gentle and caring quality.\n        Tone: Sincere, empathetic, and gently authoritative—conveying care and competence.\n        Dialect: Articulate and clear, with compassionate phrasing.\n        Pronunciation: Clear and precise, emphasizing key reassurances.\n        Features: Incorporates brief pauses for clarity and occasional gentle whispering for emphasis.\n        Pacing: A steady and moderate pace that communicates care and professionalism.\n        Emotion: Genuine empathy, understanding, and warmth.',
      elevenlabsVoiceId: null,
      openaiVoiceName: 'sage',
      problemSummaryEn: 'Eating disorder',
      personalityDescriptionEn: '    "Petra is a 14-year-old student known for her academic excellence and exceptional talent in ballet. Recently, concerns have arisen regarding her eating habits as she avoids meals at school, engages in strict diets, and has experienced significant weight loss. Her preoccupation with food and nutrition has led to discussions with teachers and parents about potential eating disorders.',
      problemSummaryCs: 'Porucha příjmu potravy',
      personalityDescriptionCs: '„Petra je čtrnáctiletá studentka známá svými vynikajícími studijními výsledky a výjimečným baletním talentem. V poslední době se objevily obavy ohledně jejích stravovacích návyků, protože se vyhýbá jídlu ve škole, drží přísné diety a výrazně zhubla. Její zaujetí jídlem a výživou vedlo k diskusím s učiteli a rodiči o možných poruchách příjmu potravy.',
      isHidden: false,
    },
  });
  await prisma.personality.upsert({
    where: { id: 8 },
    update: {},
    create: {
      id: 8,
      createdAt: '2025-04-26T14:48:10.543Z',
      name: 'Aleš',
      age: 15,
      avatarUrl: null,
      gender: 'M',
      sex: 'M',
      voiceInstructions: 'Personality/Affect: Insecure, affable.\nVoice: Quiet, slightly obscured tenor.\nTone: Defensive, but polite.\nDialect: Spoken Czech, occasional hockey slang.\nPronunciation: Uncertain, quiet sentence endings.\nFeatures: frequent cleared throat, nervous laughter.\nPacing: Slow and hesitant.\nEmotion: Shyness, fear, occasionally gratitude.',
      elevenlabsVoiceId: null,
      openaiVoiceName: 'alloy',
      problemSummaryEn: 'Victim of six months of physical and psychological bullying',
      personalityDescriptionEn: 'Talented but shy hockey player; copies stronger role models; emotionally fixated on his mother; striving but lacking confidence.',
      problemSummaryCs: 'Oběť půlroční fyzické a psychické šikany',
      personalityDescriptionCs: 'Talentovaný, ale plachý hokejista; kopíruje silnější vzory; citově fixovaný na matku; snaživý, ale bez sebedůvěry.',
      isHidden: false,
    },
  });
  await prisma.personality.upsert({
    where: { id: 10 },
    update: {},
    create: {
      id: 10,
      createdAt: '2025-04-26T14:48:10.543Z',
      name: 'Marie',
      age: 17,
      avatarUrl: null,
      gender: 'F',
      sex: 'F',
      voiceInstructions: 'Personality/Affect: Protective and assertive.\nVoice: Solid, clear alto.\nTone: Decisive, caring.\nDialect: Colloquial-written, clear arguments.\nPronunciation: Clear, with emphasis.\nFeatures: supportive words to Sarah\'s defense.\nPacing: Medium, with emphasis on appeals.\nEmotion: indignation over injustice, empathy.',
      elevenlabsVoiceId: null,
      openaiVoiceName: 'alloy',
      problemSummaryEn: 'A fellow victim and supporter of Sara, the target of insults online and in the classroom.',
      personalityDescriptionEn: 'Brave, loyal, open; not afraid to stand up to aggressors, sensitive to injustice, serves as a support to Sara.',
      problemSummaryCs: 'Spoluoběť a zastánkyně Sáry, terč urážek online i ve třídě.',
      personalityDescriptionCs: 'Statečná, loajální, otevřená; nebojí se postavit agresorkám, citlivá k nespravedlnosti, slouží jako opora Sáře.',
      isHidden: false,
    },
  });
  await prisma.personality.upsert({
    where: { id: 5 },
    update: {},
    create: {
      id: 5,
      createdAt: '2025-04-26T14:48:10.543Z',
      name: 'Marta',
      age: 15,
      avatarUrl: 'https://models.readyplayer.me/64bfa15f0e72c63d7c3934a6.glb?morphTargets=ARKit,Oculus+Visemes,mouthOpen,mouthSmile,eyesClosed,eyesLookUp,eyesLookDown&textureSizeLimit=1024&textureFormat=png',
      gender: 'F',
      sex: 'F',
      voiceInstructions: 'Personality/Affect: A smiling and easy-going girl with DS.\nVoice: High pitched, slightly husky girl voice.\nTone: Cordial, enthusiastic, sometimes impatient for quick cheer.\nDialect: Simple sentences, sometimes abbreviated words.\nPronunciation: Slight articulatory inaccuracies.\nFeatures: frequent laughter, close personal space.\nPacing: Quick bursts of words, then pause for breath.\nEmotion: Joyful, sometimes frustrated when misunderstood.',
      elevenlabsVoiceId: null,
      openaiVoiceName: 'alloy',
      problemSummaryEn: 'Suspected bullying of a classmate;mild mental retardation.',
      personalityDescriptionEn: 'Friendly, affectionate, hard-working; eager to fit in but unable to gauge others\' boundaries, sensitive to rejection.',
      problemSummaryCs: 'podezření na šikanu spolužačky;lehká mentální retardace.',
      personalityDescriptionCs: 'Přátelská, přítulná, pracovitá; touží zapadnout, ale neumí odhadnout hranice druhých, citlivá na odmítnutí.',
      isHidden: false,
    },
  });
  await prisma.personality.upsert({
    where: { id: 12 },
    update: {},
    create: {
      id: 12,
      createdAt: '2025-05-15T20:41:58.096Z',
      name: 'Libor',
      age: 16,
      avatarUrl: 'https://demo.readyplayer.me/avatar?id=68265168be4c9feb94041ac4',
      gender: 'male',
      sex: 'M',
      voiceInstructions: 'Personality/Affect: Libor represents a disruptive, demotivating classmate who undermines teamwork through passive-aggressive remarks and a lack of cooperation.\\nVoice: Adolescent male voice, slightly monotone, often sounds dismissive or bored.\\nTone: Sarcastic, critical, and emotionally detached, frequently undermining the efforts of others.\\nDialect: Uses teenage slang mixed with formal phrases to mask criticism as \'feedback.\'\\nPronunciation: Sometimes emphasizes negative points, often sighs or interrupts.\\nFeatures: Gives off an air of superiority, is slow to contribute, and regularly questions group decisions without offering alternatives.\\nPacing: Often slow and deliberate, making others uncomfortable.\\nEmotion: Lacks genuine warmth, comes across as uninterested or slightly irritated.',
      elevenlabsVoiceId: null,
      openaiVoiceName: 'onyx',
      problemSummaryEn: 'Group disruptor',
      personalityDescriptionEn: 'Libor is a 16-year-old secondary school student who consistently disrupts group projects. He sends passive-aggressive messages, avoids responsibilities, expects others to do his work, and uses group meetings to criticize rather than contribute ideas. His attitude brings down group morale and makes collaboration difficult.',
      problemSummaryCs: 'Toxický spolužák',
      personalityDescriptionCs: 'Libor je šestnáctiletý student střední školy, který opakovaně narušuje týmovou spolupráci. Posílá pasivně-agresivní zprávy, vyhýbá se povinnostem, očekává, že jeho práci udělají ostatní, a schůzky využívá spíš ke kritice než k návrhům řešení. Jeho přístup snižuje morálku a ztěžuje spolupráci ve skupině.',
      isHidden: false,
    },
  });
  await prisma.personality.upsert({
    where: { id: 9 },
    update: {},
    create: {
      id: 9,
      createdAt: '2025-04-26T14:48:10.543Z',
      name: 'Sára',
      age: 16,
      avatarUrl: null,
      gender: 'F',
      sex: 'F',
      voiceInstructions: 'Personality/Affect: Perceptive perfectionist.\nVoice: Fine soprano, slightly tremulous.\nTone: Polite, cautious, slightly shaky.\nDialect: Spoken Czech, occasional bookish turn of phrase.\nPronunciation: Precise, highlights key words.\nFeatures.\nPacing: Steady, sometimes gets quiet.\nEmotion: Anxiety, shame, determination.',
      elevenlabsVoiceId: null,
      openaiVoiceName: 'alloy',
      problemSummaryEn: 'Target of cyberbullying',
      personalityDescriptionEn: 'An excellent student, quiet and sensitive; eager to be accepted by her peers, she relies on the support of her friend Maria.',
      problemSummaryCs: 'Oběť kyberšikany',
      personalityDescriptionCs: 'Vynikající studentka, tichá a citlivá; touží po přijetí vrstevníky, spoléhá na podporu kamarádky Marie.',
      isHidden: false,
    },
  });
  await prisma.personality.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      createdAt: '2025-04-26T14:30:42.819Z',
      name: 'Emil',
      age: 12,
      avatarUrl: null,
      gender: 'M',
      sex: 'M',
      voiceInstructions: ' Personality/Affect: A dynamic and energetic presence representing "Emil", who experiences ADHD.\n        Voice: A youthful, energetic male voice with a cheeky and lively quality.\n        Tone: Encouraging and playful, making routine tasks feel exciting.\n        Dialect: Casual and upbeat, using accessible language with a touch of informality.\n        Pronunciation: Crisp and lively, with emphasis on key positive words.\n        Features: Incorporates motivational phrases, an energetic rhythm, and brief pauses for clarity.\n        Pacing: A steady pace that balances enthusiasm with clarity.\n        Emotion: An upbeat and motivating emotional range.',
      elevenlabsVoiceId: null,
      openaiVoiceName: 'ballad',
      problemSummaryEn: 'ADHD',
      personalityDescriptionEn: 'Emil is a 12-year-old student characterized by his cheeky and restless nature. Diagnosed with ADHD, he struggles with organization, impulsivity, and sustaining attention during routine tasks. Despite these challenges, Emil occasionally demonstrates innovative thinking and the ability to excel when engaged in complex or stimulating activities.',
      problemSummaryCs: 'ADHD',
      personalityDescriptionCs: 'Emil je dvanáctiletý žák, který se vyznačuje drzou a neposednou povahou. Má diagnózu ADHD a potíže s organizací, impulzivitou a udržením pozornosti při běžných úkolech. Navzdory těmto problémům Emil občas projevuje inovativní myšlení a schopnost vyniknout, když se věnuje složitým nebo podnětným činnostem.',
      isHidden: false,
    },
  });

  // Scenarios
  console.log('Seeding Scenarios...');
  await prisma.scenario.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      createdAt: '2025-04-26T14:50:08.546Z',
      involvedPersonalityId: 1,
      situationDescriptionEn: 'Honzík opens the pen, writes the first line, the pencil tip cracks. The boy starts to smash the pencil on the bench, tears on the edge of his eyes, "I\'ll never write it nicely anyway!" - and refuses to continue. The others start watching the drama instead of working. The teacher is faced with a choice: to calm Honzik down immediately? Break the task into smaller steps? Pull out the "crisis" relaxation exercises? Or ask the assistant to leave with the boy for a short break so the rest of the class can write undisturbed?',
      settingEn: 'First hour of writing after the big break.',
      situationDescriptionCs: 'Honzík otevře písanku, zapíše první řádku, hrot tužky praskne. Chlapec začne tužku třískat o lavici, slzy na krajíčku: „Stejně to nikdy nenapíšu hezky!“ – a odmítá pokračovat. Ostatní začínají sledovat drama místo práce. Učitel stojí před volbou: okamžitě Honzíka uklidnit? Rozdělit úkol na menší kroky? Vytáhnout „krizové“ uvolňovací cviky? Nebo požádat asistentku, aby s chlapcem odešla na krátkou pauzu a zbytek třídy mohl nerušeně psát?',
      settingCs: 'První hodina psaní po velké přestávce.',
    },
  });
  await prisma.scenario.upsert({
    where: { id: 4 },
    update: {},
    create: {
      id: 4,
      createdAt: '2025-04-26T14:54:46.248Z',
      involvedPersonalityId: 4,
      situationDescriptionEn: 'In science class, Peter asks technical questions about minerals, his classmates ridicule him and he shuts down; the teacher struggles to promote interest and pace the lesson.',
      settingEn: 'Classroom – science lesson on minerals',
      situationDescriptionCs: 'Na přírodopisu Petr pokládá odborné otázky k minerálům, spolužáci ho zesměšňují a on se uzavírá; učitel řeší podporu zájmu i tempo výuky.',
      settingCs: 'Třída - přírodovědná lekce o minerálech',
    },
  });
  await prisma.scenario.upsert({
    where: { id: 9 },
    update: {},
    create: {
      id: 9,
      createdAt: '2025-04-26T14:54:46.248Z',
      involvedPersonalityId: 8,
      situationDescriptionEn: 'At the youth home, Ales is tied up by his classmates and humiliated by a livestream; the governess must stop the bullying, find out the extent and consider next steps.',
      settingEn: 'Dormitory room – boarding school',
      situationDescriptionCs: 'V domově mládeže je Aleš svázaný spolužáky a ponižován livestreamem; vychovatelka musí zastavit šikanu, zjistit rozsah a zvážit další kroky.',
      settingCs: 'Internátní pokoj - internátní škola',
    },
  });
  await prisma.scenario.upsert({
    where: { id: 10 },
    update: {},
    create: {
      id: 10,
      createdAt: '2025-04-26T14:54:46.248Z',
      involvedPersonalityId: 9,
      situationDescriptionEn: 'Anonymous photo montages mocking Sara and Maria spread on Instagram; one doesn\'t go to school, the other cries, the teacher has to protect the victims and stop cyberbullying.\r\n',
      settingEn: 'Online (social media) & classroom',
      situationDescriptionCs: 'Na Instagramu se šíří anonymní fotomontáže zesměšňující Sáru a Marii; jedna nechodí do školy, druhá pláče, učitelka musí chránit oběti a zastavit kyberšikanu.',
      settingCs: 'Online (sociální média) a ve třídě\r\n',
    },
  });
  await prisma.scenario.upsert({
    where: { id: 6 },
    update: {},
    create: {
      id: 6,
      createdAt: '2025-04-26T14:54:46.248Z',
      involvedPersonalityId: 3,
      situationDescriptionEn: 'In the school cafeteria, Petra refuses food, looks faint and shares content on social media suggesting a possible eating disorder; the teacher is considering contacting her parents and a psychologist.',
      settingEn: 'School cafeteria – lunch line',
      situationDescriptionCs: 'Ve školní jídelně Petra odmítá jídlo, vypadá na omdlení a na sociálních sítích sdílí obsah naznačující možnou poruchu příjmu potravy; učitelka zvažuje kontaktovat rodiče a psychologa.',
      settingCs: 'Školní jídelna - fronta na obědy\r\n',
    },
  });
  await prisma.scenario.upsert({
    where: { id: 7 },
    update: {},
    create: {
      id: 7,
      createdAt: '2025-04-26T14:54:46.248Z',
      involvedPersonalityId: 6,
      situationDescriptionEn: 'The gym teacher sees fresh cuts on Katka\'s arm, the girl claims she was scratched by a cat and looks numb; the teacher decides how to open the topic of self-harm.',
      settingEn: 'Gym changing room before PE lesson',
      situationDescriptionCs: 'Učitelka tělocviku zahlédne čerstvé řezné rány na Katčině ruce, dívka tvrdí, že ji poškrábal kocour a působí otupěle; učitelka řeší, jak otevřít téma sebepoškozování.',
      settingCs: 'Šatna v tělocvičně před hodinou tělocviku\r\n',
    },
  });
  await prisma.scenario.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      createdAt: '2025-04-26T14:54:46.248Z',
      involvedPersonalityId: 2,
      situationDescriptionEn: 'During a maths lesson, Emil shouts out difficult questions and disturbs his classmates; the teacher has to quickly assign a more challenging task and keep the class\'s attention.',
      settingEn: 'Classroom – math lesson',
      situationDescriptionCs: 'Během hodiny matematiky Emil s hotovými úlohami vykřikuje složité dotazy a vyrušuje spolužáky; učitel musí rychle zadat náročnější úkol a udržet pozornost třídy.',
      settingCs: 'Třída - hodina matematiky',
    },
  });
  await prisma.scenario.upsert({
    where: { id: 8 },
    update: {},
    create: {
      id: 8,
      createdAt: '2025-04-26T14:54:46.248Z',
      involvedPersonalityId: 7,
      situationDescriptionEn: 'During recess Robert throws a tennis ball, hits a classmate and rejects the authority of the assistant; the class becomes afraid of his aggressive outbursts and the parents do not cooperate.\r\n',
      settingEn: 'Primary classroom during break',
      situationDescriptionCs: 'Během přestávky Robert hází tenisákem, zasahuje spolužačku a odmítá autoritu asistentky; třída se začíná bát jeho agresivních výpadů a rodiče nespolupracují.',
      settingCs: 'Třída základní školy o přestávce',
    },
  });
  await prisma.scenario.upsert({
    where: { id: 5 },
    update: {},
    create: {
      id: 5,
      createdAt: '2025-04-26T14:54:46.248Z',
      involvedPersonalityId: 5,
      situationDescriptionEn: 'During break, Marta spontaneously hugs a classmate, who reacts by refusing and shouting; the teacher has to explain the boundaries of personal space and calm the situation.',
      settingEn: 'School corridor during break',
      situationDescriptionCs: 'O přestávce Marta spontánně obejme spolužačku, která reaguje odmítavě a křikem; učitel musí vysvětlit hranice osobního prostoru a zklidnit situaci.',
      settingCs: 'Školní chodba během přestávky',
    },
  });

  console.log('\nDatabase seeded successfully!');
  console.log({
    responseModels: 11,
    ttsModels: 2,
    realtimeModels: 3,
    realtimeTranscriptionModels: 3,
    timestampedTranscriptionModels: 1,
    conversationRoles: 3,
    appConfig: 1,
    personalities: 11,
    scenarios: 9,
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
