// WeekView.jsx
import React from 'react';
import { CalendarEvent } from '../state/stores/CalendarEvent';
import { CommonCalendarProps } from './Calendar';
import CalendarWeek from './CalendarWeek';

interface WeekViewProps<T, Meta, K> extends CommonCalendarProps<CalendarEvent<T, Meta, K>, Date> {
  weekStartDate: Date;
  events: CalendarEvent<T, Meta, K>[];
  
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
