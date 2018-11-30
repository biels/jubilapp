import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from '../auth/auth.module';
import {ModelModule} from "../model/model.module";
import {ProfileService} from "./profile.service";

@Module({
  imports: [AuthModule, ModelModule],
  controllers: [ProfileController],
    providers: [ProfileService]
})
export class ProfileModule {}
