import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ProfileController],
})
export class ProfileModule {}
