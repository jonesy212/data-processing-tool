import { CalendarEvent } from '@/app/components/calendar/CalendarEvent';
import { WritableDraft } from "../state/redux/ReducerGenerator";
import { SimpleCalendarEvent } from "./CalendarContext";

// Function to format calendar data as CSV string
export const formatCalendarAsCSV = (
  events: (WritableDraft<SimpleCalendarEvent> | WritableDraft<CalendarEvent>)[],
  calendarDisplaySettings: CalendarDisplaySettings): string => {
    // Implement logic to format calendar data as CSV string
    // Example: Convert events and settings to CSV format
    let csvData = 'Event Title,Start Date,End Date\n';
    events.forEach(event => {
      csvData += `${event.title},${event.startDate},${event.endDate}\n`;
    });
    // Include calendar display settings in CSV data if needed
    csvData += `Calendar Display Settings:\n`;
    Object.entries(calendarDisplaySettings).forEach(([key, value]) => {
      csvData += `${key},${value}\n`;
    });
    return csvData;
}
