// DayOfWeek.tsx
import { CalendarEvent } from '@/core/calendar/CalendarEvent';
import { CommonCalendarProps } from '@/core/components/calendar/Calendar';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { Attachment } from '@/core/documents/attachment/Attachment';
import { Task } from '@/core/models/tasks/Task';
import React from 'react';

interface DayOfWeekProps<
  T extends BaseDataEntity, 
  K extends T, 
  Meta extends DefaultMeta<T, K>, 
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends CommonCalendarProps{
  day: string;
  events: CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  tasks: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]; // Assuming each task has a 'name' property
}

const DayOfWeek: React.FC<DayOfWeekProps> = ({ day, events, tasks,  ...taskHandlers  }) => {
  // Validate props
  if (!day) {
    return <div>Error: Day name not provided</div>;
  }

  return (
    <div>
      <h3>{day}</h3>
      {/* Render events */}
      <ul>
        {events && events.length > 0 ? (
          events.map((event, index) => (
            <li key={index}>{event.name}</li>
          ))
        ) : (
          <li>No events for this day</li>
        )}
      </ul>
      {/* Render tasks */}
      <ul>
        {tasks && tasks.length > 0 ? (
          tasks.map((task, index) => (
            <li key={index}>{task.name}</li>
          ))
        ) : (
          <li>No tasks for this day</li>
        )}
      </ul>
    </div>
  );
};

// PropTypes for type-checking (not necessary with TypeScript)
// DayOfWeek.propTypes = {
//   day: PropTypes.string.isRequired,
//   events: PropTypes.arrayOf(PropTypes.object),
//   tasks: PropTypes.arrayOf(PropTypes.object),
// };

export default DayOfWeek;
export type { DayOfWeekProps };
