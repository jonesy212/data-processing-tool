import { BaseEvent, TaskEvent, UserEvent } from "@/app/typings/eventTypes";
import { EventAttendance } from '@/calendar/AttendancePrediction';
import { SystemEvent } from '@/components/event/BaseEvent';

  // Check if the event is a Task Event
  function isTaskEvent<T, K>(event: BaseEvent): event is TaskEvent<T, K> {
    return event.eventType === "task";
  }
  
  // Check if the event is a User Event
  function isUserEvent<T, K>(event: BaseEvent): event is UserEvent<T, K> {
    return event.eventType === "user";
  }
  
  // Check if the event is an Event Attendance Event
  function isEventAttendance<T, K>(event: BaseEvent): event is EventAttendance {
    return event.eventType === "attendance";
  }
  
  // Check if the event is a System Event
  function isSystemEvent<T, K>(event: BaseEvent): event is SystemEvent<T, K> {
    return event.eventType === "system";
  }
  
    
export { isEventAttendance, isSystemEvent, isTaskEvent, isUserEvent };
