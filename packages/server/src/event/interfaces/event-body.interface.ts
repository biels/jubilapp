import { EventCategory } from '../../model/event/event-category.enum';
import { User } from '../../model/user/user.entity';

export interface EventBody {
  name: string;
  description?: string;
  type: EventCategory;
  startDate?: Date;
  endDate?: Date;
  location?: string;
  capacity?: string;
}
