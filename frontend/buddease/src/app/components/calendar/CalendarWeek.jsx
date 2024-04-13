// WeekView.jsx
import CalendarWeek from './CalendarWeek';

const WeekView = ({ weekStartDate, events }) => {
  return (
    <div>
      <h2>Week View</h2>
      {/* Display tasks and events for the week */}
      <CalendarWeek weekStartDate={weekStartDate} events={events} />
    </div>
  );
};

export default WeekView;
