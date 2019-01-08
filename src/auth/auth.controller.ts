import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegistrationBody } from './interfaces/registration-body.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {
  }

  @Post('login')
  async createToken(@Body() body): Promise<any> {
    const { email, password } = body;
    let token = await this.authService.signIn(email.toLowerCase(), password.toLowerCase());
    return { token };
  }

  @Post('register')
  async register(@Body() body: RegistrationBody): Promise<any> {
    const register = await this.authService.register(body);
    let token = await this.authService.signIn(body.email.toLowerCase(), body.password.toString().toLowerCase());
    return {
      profile: register,
      token,
    };
  }


}
