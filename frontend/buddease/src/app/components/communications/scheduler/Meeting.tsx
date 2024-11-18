import { CalendarEvent } from '@/app/components/calendar/CalendarEvent';
import { Todo } from "../../todos/Todo";
import { UserData } from "../../users/User";
import { T, K } from "@/app/components/models/data/dataStoreMethods";

export interface Meeting extends UserData {
  id: number;
  title: string;
  date: Date;
  duration: number;
  description: string;
  participants: string[]; // This can be an array of user IDs or names
  eventId?: CalendarEvent['id']
  assignedTo?: Todo<T, K<T>>['assignedTo']
  
  // Add any other properties relevant to a meeting
}
