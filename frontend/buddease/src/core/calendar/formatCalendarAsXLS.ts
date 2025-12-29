// formatCalendarAsXLS.ts
import { CalendarEvent } from '@/core/calendar/CalendarEvent';
import { SimpleCalendarEvent } from '@/core/components/calendar/CalendarContext';
import { WritableDraft } from "@/core/state/redux/ReducerGenerator";

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
