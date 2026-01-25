// CalendarContext.tsx
import { transformTasksToEvents, transformTodosToEvents } from '@/core/calendar/CalendarEvents';
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import type { PriorityTypeEnum } from "@/core/models/data/StatusType";
import { Member } from '@/core/models/members/Member';
import { Project } from '@/core/models/projects/Project';
import type { DetailsItem } from "@/core/state/stores/DetailsListStore";
import { useTaskManagerStore } from '@/core/state/stores/TaskStore';
import type { CalendarAttachment, CalendarEntity, CalendarExcludedFields, CalendarIncludedFields, CalendarMeta } from "@/core/typings/entities/CalendarEntity";
import type { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import React from 'react';

// Define the type for calendar data
export type SimpleCalendarEvent<
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
  reminder: ReactNode;
  documentReleased?: boolean;
  reminderOptions?: {
    recurring: boolean;
    frequency?: string;
    interval?: number;
  };
  category: string;
  description: string;
  startDate: Date;
  endDate: Date;
  priority?: PriorityTypeEnum;
  location?: string;
  shared: ReactNode;
  bulkEdit: boolean;
  recurring: boolean;
  comment: string;
  attachment: string;
  customEventNotifications: string;
  details: DetailsItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  attendees?: Member<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  projects?: Project<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
};

// Define the context type
type CalendarContextType<    
  T extends BaseDataEntity = CalendarEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = CalendarMeta,
  AttachmentType extends Attachment = CalendarAttachment,
  ExcludedFields extends keyof T = CalendarExcludedFields,
  IncludedFields extends keyof T = CalendarIncludedFields
> = {
  calendarData: SimpleCalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  updateCalendarData: (
    newData:
      | SimpleCalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
      | ((prevState: SimpleCalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => SimpleCalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[])
  ) => void;
};

// Create the context with defaults
const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

// Props for the provider
interface CalendarProviderProps {
  children: ReactNode;
  useTaskManager?: boolean; // Optional: whether to auto-fetch from task manager
}

// Provider component
export const CalendarProvider: React.FC<CalendarProviderProps> = ({ 
  children, 
  useTaskManager = false 
}) => {
  const [calendarData, setCalendarData] = useState<SimpleCalendarEvent[]>([]);
  const taskManagerStore = useTaskManagerStore();

  // Auto-fetch data from task manager if enabled
  useEffect(() => {
    if (useTaskManager && taskManagerStore) {
      const fetchData = async () => {
        try {
          const tasksAsEvents = await transformTasksToEvents(
            taskManagerStore.tasks.pending
          );
          const todosAsEvents = transformTodosToEvents(taskManagerStore.todos.realtimeData);
          setCalendarData([...tasksAsEvents, ...todosAsEvents]);
        } catch (error) {
          console.error('Error fetching calendar data:', error);
        }
      };
      fetchData();
    }
  }, [useTaskManager, taskManagerStore?.tasks.pending, taskManagerStore?.todos.realtimeData]);

  // Function to update calendar data
  const updateCalendarData = (
    newData:
      | SimpleCalendarEvent[]
      | ((prevState: SimpleCalendarEvent[]) => SimpleCalendarEvent[])
  ) => {
    setCalendarData(newData);
  };

  const contextValue: CalendarContextType = {
    calendarData,
    updateCalendarData,
  };

  return (
    <CalendarContext.Provider value={contextValue}>
      {children}
    </CalendarContext.Provider>
  );
};

// Custom hook for consuming the context
export const useCalendarContext = (): CalendarContextType => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error(
      "useCalendarContext must be used within a CalendarProvider"
    );
  }
  return context;
};

// Additional hook for calendar operations
export const useCalendarOperations = () => {
  const { calendarData, updateCalendarData } = useCalendarContext();

  const addEvent = (event: SimpleCalendarEvent) => {
    updateCalendarData(prev => [...prev, event]);
  };

  const updateEvent = (id: string, updatedEvent: Partial<SimpleCalendarEvent>) => {
    updateCalendarData(prev => 
      prev.map(event => 
        event.id === id ? { ...event, ...updatedEvent } : event
      )
    );
  };

  const deleteEvent = (id: string) => {
    updateCalendarData(prev => prev.filter(event => event.id !== id));
  };

  const getEventById = (id: string) => {
    return calendarData.find(event => event.id === id);
  };

  const getEventsByDate = (date: Date) => {
    return calendarData.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  return {
    calendarData,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventById,
    getEventsByDate,
  };
};