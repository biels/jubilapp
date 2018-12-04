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
    const {password, interests, ...rest}: Partial<User> = request.user;
    const transformedInterests = this.profileService.transformInterests(interests);
    return {...rest,interests: transformedInterests};
  }

  @Patch()
  @UseGuards(AuthGuard())
  async patchProfile(@Req() request) {
    if (request.user == null) throw new BadRequestException('You need to be logged to add interest');
    const interests: Array<string> = request.body.interests;
    if (interests != null) await this.profileService.patchInterests(interests, request.user);

  }

}
