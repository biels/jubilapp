import { BadRequestException, Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../model/user/user.entity';

@Controller('profile')
export class ProfileController {
  @Get()
  @UseGuards(AuthGuard())
  async root(@Req() request) {
    if(request.user == null) throw new BadRequestException('You need to be logged in to view your profile')
    const {password, ...rest}: Partial<User> = request.user;
    return rest;
  }
}
