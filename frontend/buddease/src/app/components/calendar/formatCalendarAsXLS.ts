// formatCalendarAsXLS.ts
import { WritableDraft } from "../state/redux/ReducerGenerator";
import { CalendarEvent } from "../state/stores/CalendarEvent";
import { SimpleCalendarEvent } from "./CalendarContext";

// Function to format calendar data as XLS string
export const formatCalendarAsXLS = (
  events: (WritableDraft<SimpleCalendarEvent> | WritableDraft<CalendarEvent>)[],
  calendarDisplaySettings: CalendarDisplaySettings
): string => {
  // Implement logic to format calendar data as XLS string
  // Example: Convert events and settings to XLS format
  let xlsData = 'Event Title\tStart Date\tEnd Date\n';
  events.forEach(event => {
    xlsData += `${event.title}\t${event.startDate}\t${event.endDate}\n`;
  });
  // Include calendar display settings in XLS data if needed
  xlsData += `Calendar Display Settings:\n`;
  Object.entries(calendarDisplaySettings).forEach(([key, value]) => {
    xlsData += `${key}\t${value}\n`;
  });
  return xlsData;
};
