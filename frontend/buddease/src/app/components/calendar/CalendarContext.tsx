// CalendarContext.tsx
import React, { createContext, useContext, useState } from 'react';

type CalendarContextProps = {
  calendarData: any[]; // Replace with your actual data type
  updateCalendarData: React.Dispatch<React.SetStateAction<any[]>>;
  children: React.ReactNode;
};

type CalendarContextType = {
  calendarData: any[]; // Replace with your actual data type
  updateCalendarData: React.Dispatch<React.SetStateAction<any[]>>;
};

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export const useCalendarContext = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendarContext must be used within a CalendarProvider');
  }
  return context;
};

export const CalendarProvider: React.FC<CalendarContextProps> = ({ children }) => {
  const [calendarData, setCalendarData] = useState<any[]>([]); // Replace with your actual data type

  const contextValue: CalendarContextType = {
    calendarData,
    updateCalendarData: setCalendarData,
  };

  return (
    <CalendarContext.Provider value={contextValue}>
      {children}
    </CalendarContext.Provider>
  );
};
