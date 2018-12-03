import {BadRequestException, Controller, Get, Patch, Req, UseGuards} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../model/user/user.entity';
import {ProfileService} from "./profile.service";

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @UseGuards(AuthGuard())
  async root(@Req() request) {
    if(request.user == null) throw new BadRequestException('You need to be logged in to view your profile')
    const {password, ...rest}: Partial<User> = request.user;
    return rest;
  }

  @Patch('interests')
  @UseGuards(AuthGuard())
  async addInterest(@Req() request): Promise<User> {
    console.log(request.body.interests);
    const interests: Array<string> = request.body.interests;
    if (request.user == null) throw new BadRequestException('You need to be logged to add interest');
    return await this.profileService.addInterests(interests, request.user);
  }

  @Get('interests')
  @UseGuards(AuthGuard())
  async getInterest(@Req() request): Promise<any> {
      console.log(request.body.interests);
      if (request.user == null) throw new BadRequestException('You need to be logged to add interest');
      return await this.profileService.getInterests(request.user);
  }
}
