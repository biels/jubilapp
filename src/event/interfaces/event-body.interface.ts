import { EventCategory } from '../../model/event/event-category.enum';
import { User } from '../../model/user/user.entity';

export interface EventBody {
  name: string;
  description?: string;
  type: string;
  startDate?: Date;
  endDate?: Date;
  longitude: number
  latitude: number
  capacity?: number;
}
