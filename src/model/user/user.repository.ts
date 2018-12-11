import { EntityRepository, Repository } from 'typeorm';
import { User } from './user.entity';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async findOneByEmail(email: string) {
    let users = await this.find({where: {email}});
    return users[0];
  }
}
