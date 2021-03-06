import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../model/user/user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { User } from '../model/user/user.entity';
import { RegistrationBody } from './interfaces/registration-body.interface';
import {EventCategory} from "../model/event/event-category.enum";


@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(email: string, password: string): Promise<string> {
    const user = await this.userRepository.findOneByEmail(email);
    if(user == null) throw new UnauthorizedException();
    if(user.password !== password) throw new UnauthorizedException();
    const jwtPayload: JwtPayload = { email };
    return this.jwtService.sign(jwtPayload);
  }

  async register(body: RegistrationBody): Promise<User> {
    try {
      return (await this.userRepository.save({...body})) as User
    }catch (e) {
      if(e.code === '23505')
        throw new BadRequestException(`A user with email ${body.email} already exists`);
      throw new BadRequestException(e.message);
    }
  }

  async validateUser(payload: JwtPayload): Promise<any> {
    return await this.userRepository.findOneByEmail(payload.email);
  }

}
