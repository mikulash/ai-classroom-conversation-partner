import 'reflect-metadata';
import 'dotenv/config';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import { AppModule } from './app.module';

async function generateOpenApi(): Promise<void> {
  const logger = new Logger('OpenAPI');
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { logger: false });
  const config = new DocumentBuilder()
    .setTitle('AI Classroom Conversation Partner API')
    .setDescription('NestJS powered API with OpenAPI documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);

  writeFileSync('openapi.json', JSON.stringify(document, null, 2), 'utf8');
  logger.log('Wrote OpenAPI JSON to openapi.json');
  await app.close();
}

void generateOpenApi().catch((error: unknown) => {
  const logger = new Logger('OpenAPI');
  logger.error('Failed to write OpenAPI JSON', error instanceof Error ? error.stack : String(error));
  process.exit(1);
});
