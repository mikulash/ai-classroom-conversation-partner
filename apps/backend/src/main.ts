import 'reflect-metadata';
import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cors from 'cors';
import { AppModule } from './app.module';
import { APP_FRONTEND_URL, NODE_ENV, PORT } from './constants/constants';
import { writeFileSync } from 'fs';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(
    cors({
      origin: APP_FRONTEND_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      maxAge: 86400,
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('AI Classroom Conversation Partner API')
    .setDescription('NestJS powered API with OpenAPI documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(PORT);
  console.log(`Backend server listening on port ${PORT}`);
  console.log(`Environment: ${NODE_ENV}`);

  try {
    const outPath = 'openapi.json';
    writeFileSync(outPath, JSON.stringify(document, null, 2), 'utf8');
    console.log(`Wrote OpenAPI JSON to ${outPath}`);
  } catch (err) {
    console.error('Failed to write OpenAPI JSON', err);
  }
}


bootstrap();
