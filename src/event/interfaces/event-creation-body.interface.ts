import { EventCategory } from '../../model/event/event-category.enum';

export interface EventCreationBody {
  name: string
  description: string,
  type: EventCategory;
  startDate: Date,
  endDate: Date
  longitude: number
  latitude: number
}
