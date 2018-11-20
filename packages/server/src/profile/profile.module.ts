import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from '../auth/auth.module';
import { CalendarService } from './calendar.service';

@Module({
  imports: [AuthModule],
  controllers: [ProfileController],
  providers: [CalendarService],
})
export class ProfileModule {}
