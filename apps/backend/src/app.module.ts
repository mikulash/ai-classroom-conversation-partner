import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { AuthController } from './controllers/auth.controller';
import { ProfilesController } from './controllers/profiles.controller';

@Module({
  controllers: [AppController, AuthController, ProfilesController],
})
export class AppModule {}
