import FullCalendar from '@fullcalendar/react';
import { useCalendarContext } from './CalendarContext';

const CalendarWrapper = () => {
  const { calendarData, updateCalendarData } = useCalendarContext();

  const handleEventDrop = (event) => {
    try {
      // Assuming you have an updateCalendarData function in your context
      updateCalendarData((prevData) => {
        const updatedData = prevData.map((item) =>
          item.id === event.id ? { ...item, start: event.start } : item
        );
        return updatedData;
      });
    } catch (error) {
      console.error('Error handling event drop:', error);
    }
  };

  return (
    <div>
      <h2>Task Calendar</h2>
      <FullCalendar events={calendarData} eventDrop={handleEventDrop} />
    </div>
  );
};

export default CalendarWrapper;
