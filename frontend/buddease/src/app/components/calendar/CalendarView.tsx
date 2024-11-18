// CalendarView.tsx

import { CalendarEvent } from '@/app/components/calendar/CalendarEvent';
import React from "react";
import { Task } from "../models/tasks/Task";
import { Project } from "../projects/Project";
import { selectSelectedProject } from "../state/redux/slices/CollaborationSlice";
import { Todo } from "../todos/Todo";
import { CommonCalendarProps } from "./Calendar";
import DayView from "./CalendarDay";
import MonthView from "./CalendarMonthView";
import WeekView from "./CalendarWeek";
import YearView from "./CalendarYearView";
import QuarterView from "./QuarterView";

interface CalendarViewProps extends CommonCalendarProps {
  year: number;
  events: CalendarEvent[];
  projects: Project[];
  month: number;
  weekStartDate: Date;
  date: Date;
  tasks: Task[];
  todos: Todo[];
}

const CalendarView: React.FC<CalendarViewProps> = ({
  weekStartDate,
  year,
  month,
  events,
  projects,
  date,
  tasks,
  todos,
  milestones,
  ...taskHandlers

}) => {
  return (
    <div>
      <h1>Calendar View - {year}</h1>
      {/* Display year view */}
      <YearView
        year={year}
        projects={projects}
        selectedProject={selectSelectedProject(state, projectId)}
        month={month}
        events={events}
        tasks={tasks}
        milestones={milestones}
        {...taskHandlers}

        // Add other required props here
      />

      {/* Display quarter views for the year */}
      {[1, 2, 3, 4].map((quarter) => (
        <QuarterView
          key={quarter}
          year={year}
          quarter={quarter}
          events={events}
          {...taskHandlers}
        />
      ))}

      {/* Display month view */}
      <MonthView
        year={year}
        month={month}
        events={events}
        tasks={tasks}
        milestones={milestones}
        // onTaskClick={handleOnTaskClick}
        {...taskHandlers}
        // Add other required props here
      />

      {/* Display week view */}
      <WeekView
        weekStartDate={weekStartDate}
        events={events}
        year={year}
        month={month}
        tasks={tasks}
        projects={projects}
        milestones={milestones}
        {...taskHandlers}
        // Add other required props here
      />

      {/* Display day view */}
      <DayView
        date={date}
        events={events}
        tasks={tasks}
        projects={projects}
        todos={todos}
        {...taskHandlers}
      />
    </div>
  );
};

export default CalendarView;
export type { CalendarViewProps };
