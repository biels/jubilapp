import { BadRequestException, Controller, Get, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../model/user/user.entity';
import { ProfileService } from './profile.service';
import { UserRepository } from '../model/user/user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { CalendarService } from './calendar.service';

@Controller('profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly calendarService: CalendarService,
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
  ) {
  }

  @Get()
  @UseGuards(AuthGuard())
  async root(@Req() request) {
    if (request.user == null) throw new BadRequestException('You need to be logged in to view your profile');
    const { password, interests, ...rest }: Partial<User> = request.user;
    const transformedInterests = this.profileService.decodeInterests(interests);
    return { ...rest, interests: transformedInterests };
  }

  @Get('calendar')
  async calendar(@Req() request, @Query('email') email) {
    if (email == null) throw new BadRequestException('You need to provide your email to view your calendar');
    const user = await this.userRepository.findOneByEmail(email)
    if (user == null) throw new BadRequestException('You need to provide a valid email to view your calendar');
    return this.calendarService.generateCalendarForUser(user);
  }

  @Patch()
  @UseGuards(AuthGuard())
  async patchProfile(@Req() request) {
    const user = request.user;
    if (user == null) throw new BadRequestException('You need to be logged to update your profile');
    const { interests, ...rest } = request.body;
    const existingInterests = this.profileService.decodeInterests(user.interests);
    const encodedInterests = this.profileService.encodeInterests(interests || existingInterests);
    const newUser = { ...user, ...rest, interests: encodedInterests };
    return await this.userRepository.save(newUser);
  }

}
