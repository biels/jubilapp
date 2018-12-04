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

  @Patch('distance')
  async addkm(@Req() request): Promise<User> {
    const {km} = request.body;
    if (request.user == null) throw new BadRequestException('You need to be logged to add km');
    return await this.authService.addkm(km, request.user);
  }

  @Get('distance')
    async getkm(@Req() request): Promise<any> {
      if (request.user == null) throw new BadRequestException('You need to be logged to get km');
      return await this.authService.getkm(request.user);
  }
  @Patch('interests')
  async addinterest(@Req() request): Promise<User> {
      const {interests} = request.body;
      if (request.user == null) throw new BadRequestException('You need to be logged to add km');
        return await this.authService.addinterests(interests, request.user);
    }






}
