formatCalendarAsXLSX.ts
import { CalendarEvent } from '@/core/calendar/CalendarEvent';
import { SimpleCalendarEvent } from '@/core/components/calendar/CalendarContext';
import { WritableDraft } from "@/core/state/redux/ReducerGenerator";
import * as XLSX from 'xlsx';

// Function to format calendar data as XLSX binary string
export const formatCalendarAsXLSX = (
  events: (WritableDraft<SimpleCalendarEvent> | WritableDraft<CalendarEvent>)[],
  calendarDisplaySettings: CalendarDisplaySettings
): string => {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  
  // Convert events to a worksheet
  const worksheet = XLSX.utils.json_to_sheet(events);

  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Calendar Events');

  // Include calendar display settings as metadata
  const metaData = {
    CalendarDisplaySettings: calendarDisplaySettings
  };

  // Ensure metaData is compatible with Properties
  const metaDataWithProperties: XLSX.FullProperties & typeof metaData = metaData;

  // Convert the workbook to XLSX binary string
  const xlsxData = XLSX.write(workbook, { type: 'binary', Props: metaDataWithProperties });

  return xlsxData;
};
