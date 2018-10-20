import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from './model/user/user.repository';
import { User } from './model/user/user.entity';

@Injectable()
export class AppService {

  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
  ) {
  }

  async root() {
    let newUser = this.userRepository.create();
    newUser.name = 'NewUser';
    this.userRepository.save(newUser);
    const users: User[] = await this.userRepository.find({});
    const listOfUsers = users.map(u => u.name).join(', ');
    return `Users: ${listOfUsers}`;
  }
}
