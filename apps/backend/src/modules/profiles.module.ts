import { Module } from '@nestjs/common';
import { ProfilesController } from '../controllers/profiles.controller';
import { ProfilesService } from '../services/profiles.service';

@Module({
  controllers: [ProfilesController],
  providers: [ProfilesService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ProfilesModule {}
