// Calendar;
import DataFrameAPI from "@/app/api/DataframeApi";
import FullCalendar from "@fullcalendar/react";
import ProgressBar from "../models/tracker/ProgresBar";
import { useCalendarContext } from "./CalendarContext";

const CalendarWrapper = () => {
  const { calendarData, updateCalendarData } = useCalendarContext();
  const dataFrameAPI = new DataFrameAPI(); // Initialize your DataFrameAPI instance
  const progress = calendarData.length > 0 ? calendarData[0].projects[0].progress : 0;

  const handleEventDrop = (event) => {
    try {
      // Assuming you have an updateCalendarData function in your context
      updateCalendarData((prevData) => {
        const updatedData = prevData.map((item) =>
          item.id === event.id ? { ...item, start: event.start } : item
        );
        return updatedData;
      });

      // Assuming DataFrameAPI has a method to update data
      const newData = [...calendarData]; // Replace with your actual data
      newData.forEach((item, index) => {
        if (item.id === event.id) {
          newData[index].start = event.start;
        }
      });
      dataFrameAPI.updateData(newData);
    } catch (error) {
      console.error("Error handling event drop:", error);
    }
  };

  return (
    <div>
      <h2>Task Calendar</h2>
      <FullCalendar events={calendarData} eventDrop={handleEventDrop} />
      <ProgressBar progress={progress} />
    </div>
  );
};

export default CalendarWrapper;
