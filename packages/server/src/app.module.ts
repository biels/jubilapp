import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ModelModule } from './model/model.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileModule } from './profile/profile.module';
import { PassportModule } from '@nestjs/passport';
import {EventModule} from "./event/event.module";

let isProduction = process.env.NODE_ENV === 'production';
const sourceDir = isProduction ? 'dist' : 'src';
@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [`${__dirname}./../${sourceDir}/**/*.entity{.ts,.js}`],
      synchronize: true,
      dropSchema: !isProduction,
    }),
    AuthModule, ModelModule, ProfileModule, EventModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
