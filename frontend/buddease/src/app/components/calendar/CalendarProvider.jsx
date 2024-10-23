import React, { useContext, useEffect, useState } from 'react';
import { useTaskManagerStore } from '../state/stores/TaskStore';
import { transformTasksToEvents, transformTodosToEvents } from './CalendarEvents';
 // Create a context to manage shared state
const CalendarContext = React.createContext<any>(null);
 
export const CalendarProvider = ({ children }) => {
  const [calendarData, setCalendarData] = useState<CalendarEvent>([]);
  const taskManagerStore = useTaskManagerStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tasksAsEvents = await transformTasksToEvents(
          taskManagerStore.tasks.pending
        );
        // Assuming you have a todos.realtimeData array
        const todosAsEvents = transformTodosToEvents(taskManagerStore.todos.realtimeData);

        setCalendarData([...tasksAsEvents, ...todosAsEvents]);
      } catch (error) {
        console.error('Error fetching calendar data:', error);
      }
    };

    fetchData();
  }, [taskManagerStore.tasks.pending, taskManagerStore.todos.realtimeData]);

  const value = {
    calendarData,
    updateCalendarData: setCalendarData,
  };

  return (
    <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>
  );
};

export const useCalendarContext = () => {
  return useContext(CalendarContext);
};
