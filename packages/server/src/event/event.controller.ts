import { BadRequestException, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { User } from '../model/user/user.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('event')
export class EventController {
  @Post()
  @UseGuards(AuthGuard())
  async create(@Req() request) {
    if(request.user == null) throw new BadRequestException('You need to be logged in to view your profile');
    const {password, ...rest}: Partial<User> = request.user;
    return rest;
  }
}
