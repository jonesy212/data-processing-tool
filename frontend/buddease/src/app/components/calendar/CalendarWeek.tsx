// WeekView.jsx
import React from 'react';
import { CommonCalendarProps } from '@/app/components/calendar/Calendar';
import { CalendarEvent } from '@/app/state/stores/CalendarEvent';
import CalendarWeek from '@/CalendarWeek';

interface WeekViewProps<T, K> extends CommonCalendarProps<CalendarEvent<T, K>, Date> {
  weekStartDate: Date;
  events: CalendarEvent<T, K>[];
  
}

const WeekView: React.FC<WeekViewProps> = ({ weekStartDate, events, ...taskHandlers }) => {
  return (
    <div>
      <h2>Week View</h2>
      {/* Display tasks and events for the week */}
      <CalendarWeek
        weekStartDate={weekStartDate}
        events={events}
        {...taskHandlers} // Pass taskHandlers to CalendarWeek
      />
    </div>
  );
};

export default WeekView;
