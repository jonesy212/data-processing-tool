import React from 'react';
import DayView from './DayView';
import MonthView from './MonthView';
import WeekView from './WeekView';
import YourCalendarLibrary from './YourCalendarLibrary';

const Calendar = ({ view, tasks, events, milestones }) => {
  return (
    <div>
      {view === 'day' && <DayView tasks={tasks} events={events} />}
      {view === 'week' && <WeekView tasks={tasks} events={events} />}
      {view === 'month' && (
        <MonthView tasks={tasks} events={events} milestones={milestones} />
      )}
        <YourCalendarLibrary />
    </div>
  );
};

export default Calendar;
