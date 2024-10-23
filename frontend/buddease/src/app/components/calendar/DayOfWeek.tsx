import React from 'react';
import { Task } from '../models/tasks/Task';
import { CalendarEvent } from '../state/stores/CalendarEvent';
import { CommonCalendarProps } from './Calendar';

interface DayOfWeekProps extends CommonCalendarProps{
  day: string;
  events: CalendarEvent<any, any>[];
  tasks: Task[]; // Assuming each task has a 'name' property
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
