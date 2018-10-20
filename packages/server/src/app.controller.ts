import { Get, Controller, UseGuards, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async root() {
    return "Jubilapp application running";
  }

  @Get('private')
  @UseGuards(AuthGuard())
  findAll(@Req() request) {
    const user = (request as any).user;
    return `Private data for ${user.email}`;
  }
}
