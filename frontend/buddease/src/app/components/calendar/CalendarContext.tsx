// CalendarContext.tsx
import { PriorityTypeEnum } from "@/app/models/data/StatusType";
import { Member } from '@/app/models/members/Member';
import { Project } from '@/app/models/projects/Project';
import { DetailsItem } from "@/app/state/stores/DetailsListStore";
import React, { createContext, useContext, useState } from "react";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from "@/app/documents/attachment/Attachment";

// Define the type for calendar data
type SimpleCalendarEvent<    
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = {
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
  attendees?: Member<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
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
type CalendarContextProps<    
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = {
  calendarData: SimpleCalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]; // Use the defined type for calendar data
  updateCalendarData: (
    newData:
      | SimpleCalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
      | ((prevState: SimpleCalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => SimpleCalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[])
  ) => void;
  children: React.ReactNode;
};

// Define the context type
type CalendarContextType<    
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = {
  calendarData: SimpleCalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  updateCalendarData: (
    newData:
      | SimpleCalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
      | ((prevState: SimpleCalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => SimpleCalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[])
  ) => void;
};

// Create the context
const CalendarContext = createContext<CalendarContextType<CalendarEntity, CalendarK, CalendarMeta, CalendarAttachment, CalendarExcludedFields, CalendarIncludedFields> | undefined>(
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
export const CalendarProvider: React.FC<CalendarContextProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> = ({
  children,
}) => {
  // State to store calendar data
  const [calendarData, setCalendarData] = useState<SimpleCalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>([]);

  // Function to update calendar data
  const updateCalendarData = (
    newData:
      | SimpleCalendarEvent<CalendarEntity, CalendarK, CalendarMeta, CalendarAttachment, CalendarExcludedFields, CalendarIncludedFields>[]
      | ((prevState: SimpleCalendarEvent<CalendarEntity, CalendarK, CalendarMeta, CalendarAttachment, CalendarExcludedFields, CalendarIncludedFields>[]) => SimpleCalendarEvent<CalendarEntity, CalendarK, CalendarMeta, CalendarAttachment, CalendarExcludedFields, CalendarIncludedFields>[])
  ) => {
    setCalendarData(newData);
  };

  // Context value to provide to consumers
  const contextValue: CalendarContextType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
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
