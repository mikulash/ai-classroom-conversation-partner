import 'reflect-metadata';
import 'dotenv/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { EnvConfigService } from './core/config/env-config.service';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(EnvConfigService);

  app.enableCors({
    origin: configService.appFrontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableShutdownHooks();

  const config = new DocumentBuilder()
    .setTitle('AI Classroom Conversation Partner API')
    .setDescription('NestJS powered API with OpenAPI documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(configService.port);
  logger.log(`Backend server listening on port ${configService.port}`);
  logger.log(`Environment: ${configService.nodeEnv}`);
}


void bootstrap().catch((error: unknown) => {
  const logger = new Logger('Bootstrap');
  logger.error('Backend failed to start', error instanceof Error ? error.stack : String(error));
  process.exit(1);
});
