// CalendarView.tsx

import React from "react";
import { Task } from "../models/tasks/Task";
import { Project } from "../projects/Project";
import { Todo } from "../todos/Todo";
import DayView from "./CalendarDay";
import MonthView from "./CalendarMonth";
import WeekView from "./CalendarWeek";
import YearView from "./CalendarYearView";
import QuarterView from "./QuarterView";

interface CalendarViewProps {
  year: number;
  events: Event[];
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
}) => {
  return (
    <div>
      <h1>Calendar View - {year}</h1>
      {/* Display year view */}
      <YearView year={year} projects={projects} />

      {/* Display quarter views for the year */}
      {[1, 2, 3, 4].map((quarter) => (
        <QuarterView
          key={quarter}
          year={year}
          quarter={quarter}
          events={events}
        />
      ))}

      {/* Display month view */}
      <MonthView year={year} month={month} events={events} />

      {/* Display week view */}
      <WeekView weekStartDate={weekStartDate} events={events} />

      {/* Display day view */}
      <DayView date={date} events={events} tasks={tasks} projects={projects} todos={todos} />
    </div>
  );
};

export default CalendarView;
export type { CalendarViewProps };
