import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../model/user/user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../model/user/user.entity';
import {EventCategory} from "../model/event/event-category.enum";
import {stringify} from "querystring";


@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  async patchInterests(interests: Array<string>, user: User) {
      function setCharAt(str,index,chr) {
          if(index > str.length-1) return str;
          return str.substr(0,index) + chr + str.substr(index+1);
      }
      user.interests = "000000";

      for (var i = 0; i < interests.length; ++i){
        const interest: string = interests[i];
        user.interests = setCharAt(user.interests, EventCategory[interest],'1');
      }

      this.userRepository.save(user);
  }

  transformInterests(interests: string) {
        let arr: Array<string> = [];
        for (var i = 0; i < 6; ++i){
            if (interests[i] == '1') arr.push(EventCategory[i]);
        }
        return arr;
  }
}
