// app/components/calendar/CalendarWeek.tsx
import { CalendarEvent } from '@/app/calendar/CalendarEvent';
import { Task } from '@/app/components/models/tasks/Task';
import { BaseDataEntity } from '@/app/config/BaseConfig';

interface CalendarWeekProps<
  T extends BaseDataEntity,
  K extends T = T
> {
  weekStartDate: Date;
  events: CalendarEvent<T, K>[];
  tasks: Task<any>[]; // Use appropriate Task type
  // Add other props needed specifically for week view
}

const CalendarWeek = <
  T extends BaseDataEntity,
  K extends T = T
>({
  weekStartDate,
  events,
  tasks,
  ...props
}: CalendarWeekProps<T, K>) => {
  return (
    <div className="calendar-week">
      <h3>Week View</h3>
      {/* Week view implementation */}
      <div>Week starting: {weekStartDate.toDateString()}</div>
      {/* Display days, events, tasks for the week */}
    </div>
  );
};

export default CalendarWeek;