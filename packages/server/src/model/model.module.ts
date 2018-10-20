import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { EventModule } from './event/event.module';
import { config } from 'dotenv';

config();

@Module({
  imports: [
    UserModule,
    EventModule,
  ],
  exports: [
    UserModule
  ]
})
export class ModelModule {}
