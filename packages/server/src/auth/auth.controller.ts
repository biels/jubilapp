import {BadRequestException, Body, Controller, Get, Patch, Post, Req, UseGuards} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { User } from '../model/user/user.entity';
import { RegistrationBody } from './interfaces/registration-body.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async createToken(@Body() body): Promise<any> {
    const {email, password} = body;
    let token = await this.authService.signIn(email, password);
    return {token};
  }

  @Post('register')
  async register(@Body() body: RegistrationBody): Promise<User> {
    return await this.authService.register(body);
  }






}
