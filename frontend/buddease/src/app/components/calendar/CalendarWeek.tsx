// WeekView.jsx
import React from 'react';
import CalendarWeek from './CalendarWeek';
import { CommonCalendarProps } from './Calendar';
import { CalendarEvent } from '../state/stores/CalendarEvent';

interface WeekViewProps extends CommonCalendarProps {
  weekStartDate: Date;
  events: CalendarEvent[];
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
