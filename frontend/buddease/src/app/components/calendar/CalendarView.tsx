// CalendarView.tsx

import React from 'react';
import DayView from '@/ap/components/calendar/CalendarDay';
import { CalendarEvent } from '@/app/calendar/CalendarEvent';
import { CommonCalendarProps } from '@/app/components/calendar/Calendar';
import { Project } from '@/app/models/projects/Project';
import { Task } from '@/app/models/tasks/Task';
import Milestone from '@/app/typings/milestoneTypes'
import { selectSelectedProject } from '@/app/state/redux/slices/CollaborationSlice';
import { Todo } from '@/app/todos/Todo';
import MonthView from '@/app/components/calendar/CalendarMonthView';
import YearView from '@/app/components/calendar/CalendarYearView';
import QuarterView from '@/app/components/calendar/QuarterView'
import WeekView from '@/app/components/calendar/WeekView';

interface CalendarViewProps<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends CommonCalendarProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  year: number;
  events: CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  projects: Project[];
  month: number;
  weekStartDate: Date;
  date: Date;
  tasks: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  todos: Todo[];
  milestones: Milestone 
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
