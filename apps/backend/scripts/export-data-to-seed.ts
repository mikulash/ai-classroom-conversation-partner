import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { writeFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

async function exportData() {
  console.log('📦 Exporting database data...\n');

  const data = {
    responseModels: await prisma.responseModel.findMany(),
    ttsModels: await prisma.ttsModel.findMany(),
    realtimeModels: await prisma.realtimeModel.findMany(),
    realtimeTranscriptionModels: await prisma.realtimeTranscriptionModel.findMany(),
    timestampedTranscriptionModels: await prisma.timestampedTranscriptionModel.findMany(),
    conversationRoles: await prisma.conversationRole.findMany(),
    appConfig: await prisma.appConfig.findMany(),
    personalities: await prisma.personality.findMany(),
    scenarios: await prisma.scenario.findMany(),
  };

  // Generate seed file content
  const seedContent = `import { PrismaClient } from '../src/generated/prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Response Models 
  console.log('Seeding Response Models...');
${data.responseModels.map((model) => `  await prisma.responseModel.upsert({
    where: { id: ${model.id} },
    update: {},
    create: ${JSON.stringify(model, null, 6).replace(/"(\w+)":/g, '$1:')},
  });`).join('\n')}

  // TTS Models
  console.log('Seeding TTS Models...');
${data.ttsModels.map((model) => `  await prisma.ttsModel.upsert({
    where: { id: ${model.id} },
    update: {},
    create: ${JSON.stringify(model, null, 6).replace(/"(\w+)":/g, '$1:')},
  });`).join('\n')}

  // Realtime Models
  console.log('Seeding Realtime Models...');
${data.realtimeModels.map((model) => `  await prisma.realtimeModel.upsert({
    where: { id: ${model.id} },
    update: {},
    create: ${JSON.stringify(model, null, 6).replace(/"(\w+)":/g, '$1:')},
  });`).join('\n')}

  // Realtime Transcription Models
  console.log('Seeding Realtime Transcription Models...');
${data.realtimeTranscriptionModels.map((model) => `  await prisma.realtimeTranscriptionModel.upsert({
    where: { id: ${model.id} },
    update: {},
    create: ${JSON.stringify(model, null, 6).replace(/"(\w+)":/g, '$1:')},
  });`).join('\n')}

  // Timestamped Transcription Models
  console.log('Seeding Timestamped Transcription Models...');
${data.timestampedTranscriptionModels.map((model) => `  await prisma.timestampedTranscriptionModel.upsert({
    where: { id: ${model.id} },
    update: {},
    create: ${JSON.stringify(model, null, 6).replace(/"(\w+)":/g, '$1:')},
  });`).join('\n')}

  // Conversation Roles
  console.log('Seeding Conversation Roles...');
${data.conversationRoles.map((role) => `  await prisma.conversationRole.upsert({
    where: { id: ${role.id} },
    update: {},
    create: ${JSON.stringify(role, null, 6).replace(/"(\w+)":/g, '$1:')},
  });`).join('\n')}

  // App Config
  console.log('Seeding App Config...');
${data.appConfig.map((config) => `  await prisma.appConfig.upsert({
    where: { id: ${config.id} },
    update: {},
    create: ${JSON.stringify(config, null, 6).replace(/"(\w+)":/g, '$1:')},
  });`).join('\n')}

  // Personalities
  console.log('Seeding Personalities...');
${data.personalities.map((personality) => `  await prisma.personality.upsert({
    where: { id: ${personality.id} },
    update: {},
    create: ${JSON.stringify(personality, null, 6).replace(/"(\w+)":/g, '$1:')},
  });`).join('\n')}

  // Scenarios
  console.log('Seeding Scenarios...');
${data.scenarios.map((scenario) => `  await prisma.scenario.upsert({
    where: { id: ${scenario.id} },
    update: {},
    create: ${JSON.stringify(scenario, null, 6).replace(/"(\w+)":/g, '$1:')},
  });`).join('\n')}

  console.log('\\nDatabase seeded successfully!');
  console.log({
    responseModels: ${data.responseModels.length},
    ttsModels: ${data.ttsModels.length},
    realtimeModels: ${data.realtimeModels.length},
    realtimeTranscriptionModels: ${data.realtimeTranscriptionModels.length},
    timestampedTranscriptionModels: ${data.timestampedTranscriptionModels.length},
    conversationRoles: ${data.conversationRoles.length},
    appConfig: ${data.appConfig.length},
    personalities: ${data.personalities.length},
    scenarios: ${data.scenarios.length},
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
`;

  const outputPath = join(process.cwd(), 'prisma', 'seed.ts');
  writeFileSync(outputPath, seedContent);

  console.log('✅ Seed file generated successfully!');
  console.log(`📄 Location: ${outputPath}\n`);
  console.log('📊 Summary:');
  console.log(`   - Response Models: ${data.responseModels.length}`);
  console.log(`   - TTS Models: ${data.ttsModels.length}`);
  console.log(`   - Realtime Models: ${data.realtimeModels.length}`);
  console.log(`   - Realtime Transcription Models: ${data.realtimeTranscriptionModels.length}`);
  console.log(`   - Timestamped Transcription Models: ${data.timestampedTranscriptionModels.length}`);
  console.log(`   - Conversation Roles: ${data.conversationRoles.length}`);
  console.log(`   - App Config: ${data.appConfig.length}`);
  console.log(`   - Personalities: ${data.personalities.length}`);
  console.log(`   - Scenarios: ${data.scenarios.length}`);
}

exportData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Export failed:', error);
    process.exit(1);
  });
