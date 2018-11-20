import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../model/user/user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../model/user/user.entity';
import {EventCategory} from "../model/event/event-category.enum";


@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  async addInterests(interests: Array<string>, user: User) {
      console.log("hola!!!")
      console.log(interests)
      console.log(interests[0])

      for (var i = 0; i < interests.length; ++i){
        const interest: string = interests[i];
        console.log(EventCategory[interest]);
        console.log("hola2!!!")
      }
      console.log(EventCategory[2]);

      //this.userRepository.save(user);
      return (user) as User;
  }
}
