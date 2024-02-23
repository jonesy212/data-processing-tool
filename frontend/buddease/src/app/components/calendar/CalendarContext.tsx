import React, { createContext, useContext, useState } from 'react';

// Define the type for calendar data
type CalendarEvent = {
  id: string;
  title: string;
  date: Date;
  // Add more properties as needed
};

// Define the type for the context props
type CalendarContextProps = {
  calendarData: CalendarEvent[]; // Use the defined type for calendar data
  updateCalendarData: (newData: CalendarEvent[] | ((prevState: CalendarEvent[]) => CalendarEvent[])) => void;
  children: React.ReactNode;
};

// Define the context type
type CalendarContextType = {
  calendarData: CalendarEvent[];
  updateCalendarData: (newData: CalendarEvent[] | ((prevState: CalendarEvent[]) => CalendarEvent[])) => void;
};

// Create the context
const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

// Custom hook for consuming the context
export const useCalendarContext = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendarContext must be used within a CalendarProvider');
  }
  return context;
};

// Provider component for managing calendar data
export const CalendarProvider: React.FC<CalendarContextProps> = ({ children }) => {
  // State to store calendar data
  const [calendarData, setCalendarData] = useState<CalendarEvent[]>([]);

  // Function to update calendar data
  const updateCalendarData = (newData: CalendarEvent[] | ((prevState: CalendarEvent[]) => CalendarEvent[])) => {
    setCalendarData(newData);
  };

  // Context value to provide to consumers
  const contextValue: CalendarContextType = {
    calendarData,
    updateCalendarData,
  };

  // Render the provider with the context value
  return (
    <CalendarContext.Provider value={contextValue}>
      {children}
    </CalendarContext.Provider>
  );
};
