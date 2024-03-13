import React from 'react';
import DatePickerComponent from 'react-datepicker';
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
      <DatePickerComponent
        selectedDate={new Date()} // Pass the selected date (you can replace with actual selected date)
        onChange={(date) => console.log(date)} // Define the onChange event handler
      />
        <YourCalendarLibrary />
    </div>
  );
};

export default Calendar;
