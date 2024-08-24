import React, { createContext, useContext, useState } from "react";
import { DataDetails } from "../models/data/Data";
import { Member } from "../models/teams/TeamMembers";
import { DetailsItem } from "../state/stores/DetailsListStore";
import { Project } from "../projects/Project";
import { PriorityTypeEnum } from "../models/data/StatusType";

// Define the type for calendar data
type SimpleCalendarEvent = {
  id: string;
  title: string;
  date: Date;
  isVisible?: boolean;
  isActive: boolean;
  reminder: React.ReactNode;
  documentReleased?: boolean;
  reminderOptions?: {
    recurring: boolean; // Indicates if the reminder is recurring
    frequency?: string; // Frequency of recurrence (e.g., "daily", "weekly", "monthly")
    interval?: number; // Interval for recurrence (e.g., every 2 weeks)
    // Add more options as needed
  };
  category: string;
  description: string;
  startDate: Date;
  endDate: Date;
  priority?: PriorityTypeEnum;
  location?: string;
  attendees?: Member[];
  shared: React.ReactNode;
  details: DetailsItem;
  bulkEdit: boolean;
  recurring: boolean;
  customEventNotifications: string; // Update type to string
  comment: string; // Update type to string
  attachment: string; // Update type to string
  projects?: Project[]; // Add projects property
  // Add more properties as needed
};

// Define the type for the context props
type CalendarContextProps = {
  calendarData: SimpleCalendarEvent[]; // Use the defined type for calendar data
  updateCalendarData: (
    newData:
      | SimpleCalendarEvent[]
      | ((prevState: SimpleCalendarEvent[]) => SimpleCalendarEvent[])
  ) => void;
  children: React.ReactNode;
};

// Define the context type
type CalendarContextType = {
  calendarData: SimpleCalendarEvent[];
  updateCalendarData: (
    newData:
      | SimpleCalendarEvent[]
      | ((prevState: SimpleCalendarEvent[]) => SimpleCalendarEvent[])
  ) => void;
};

// Create the context
const CalendarContext = createContext<CalendarContextType | undefined>(
  undefined
);

// Custom hook for consuming the context
export const useCalendarContext = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error(
      "useCalendarContext must be used within a CalendarProvider"
    );
  }
  return context;
};

// Provider component for managing calendar data
export const CalendarProvider: React.FC<CalendarContextProps> = ({
  children,
}) => {
  // State to store calendar data
  const [calendarData, setCalendarData] = useState<SimpleCalendarEvent[]>([]);

  // Function to update calendar data
  const updateCalendarData = (
    newData:
      | SimpleCalendarEvent[]
      | ((prevState: SimpleCalendarEvent[]) => SimpleCalendarEvent[])
  ) => {
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

export type { SimpleCalendarEvent };
