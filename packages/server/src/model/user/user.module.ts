import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { User } from './user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserRepository])],
  providers: [UserRepository],
  exports: [UserRepository],
})
export class UserModule {}
