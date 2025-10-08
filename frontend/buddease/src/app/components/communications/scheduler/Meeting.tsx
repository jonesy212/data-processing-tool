import { CalendarEvent } from '@/app/calendar/CalendarEvent';
import { K, T } from '@/app/components/models/data/dataStoreMethods';
import { Todo } from "@/app/todos/Todo";
import { UserData } from "@/app/users/User";

export interface Meeting extends UserData {
  id: number;
  title: string;
  date: Date;
  duration: number;
  description: string;
  participants: string[]; // This can be an array of user IDs or names
  eventId?: CalendarEvent['id']
  assignedTo?: Todo<T, K>['assignedTo']
  
  // Add any other properties relevant to a meeting
}
