import { Injectable } from '@nestjs/common';
import { UserRepository } from '../model/user/user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { EventCategory } from '../model/event/event-category.enum';


@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
  ) {
  }

  encodeInterests(interests: Array<string>) {
    return interests.map(int => EventCategory[int])
      .reduce((arr, n, i) => {
        arr[n] = '1';
        return arr;
      }, '000000'.split('')).join('');
  }

  decodeInterests(interests: string) {
    if (interests == null) return null;
    let arr: Array<string> = [];
    for (let i = 0; i < 6; ++i) {
      if (interests[i] === '1') arr.push(EventCategory[i]);
    }
    return arr;
  }
}
