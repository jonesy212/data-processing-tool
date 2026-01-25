// Calendar.tsx
import { Label } from '@/core/branding/BrandingSettings';
import type { CalendarEvent } from '@/core/calendar/CalendarEvent';
import YourCalendarLibrary from '@/core/calendar/YourCalendarLibrary';
import MonthView from '@/core/components/calendar/CalendarMonthView';
import { YearInfo } from '@/core/components/calendar/CalendarYear';
import YearView from '@/core/components/calendar/CalendarYearView';
import DayView from '@/core/components/calendar/DayOfWeek';
import type { MonthInfo } from '@/core/components/calendar/Month';
import WeekView from '@/core/components/calendar/WeekView';
import { CryptoHolding } from '@/core/components/crypto/CryptoHolding';
import CryptoTransaction from '@/core/components/crypto/CryptoTransaction';
import { Task } from '@/core/components/models/tasks/Task';
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import { Project } from '@/core/models/projects/Project';
import { Progress } from "@/core/models/tracker/ProgressBar";
import type { CalendarManagerState } from '@/core/state/redux/slices/CalendarSlice';
import { Resource } from '@/core/state/redux/slices/CollaborationSlice';
import type { RootState } from '@/core/state/redux/slices/RootSlice';
import { ContentPost } from '@/core/typings/contentTypes';
import { Milestone } from '@/core/typings/milestoneTypes';
import React from 'react';
import DatePickerComponent from 'react-datepicker';

interface CommonCalendarProps<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T  
> {
  year?: YearInfo[] | number;
  month?: MonthInfo[] | number;
  events: CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  tasks: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  milestones: Milestone[];
  projectId: string; // Add projectId prop
  projects: Project[];
  
  selectedProject: (state: RootState, projectId: string) => Project | null
  onChangeSpeed: (newSpeed: number) => void;

  onTaskClick: (task: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  onTaskDoubleClick: (task: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  onTaskContextMenu: (task: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, event: React.MouseEvent) => void;
  onTaskDragStart: (task: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  onTaskDragEnd: (task: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  onTaskResizingStart: ( task: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, newSize: number) => void;
  onTaskResizingEnd: (task: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, newSize: number) => void;
  onTaskResize: (task: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, newSize: number) => void;
  onTaskDrop: (task: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  onTaskChange: (task: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  onTaskCreate: (task: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  onTaskDelete: (task: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  onTaskTitleChange: (task: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  onTaskStatusChange: (task: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  onTaskProgressChange: (task: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  onTaskDependencyChange: (task: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  onTaskFilterChange: (task: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  onTaskLabelChange: (task: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  onTaskParentChange: (task: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  onTaskExpandedChange: (task: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  onTaskLinkAdd: (task: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  onTaskLinkRemove: (task: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  onTaskDependencyAdd: (task: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  onTaskDependencyRemove: (task: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  onTaskProgressAdd: (task: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  onTaskProgressRemove: (task: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  onTaskLabelAdd: (task: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;

  onAudioCallStart: (participantIds: string[]) => void;
  onAudioCallEnd: (participantIds: string[]) => void;
  onVideoCallStart: (participantIds: string[]) => void;
  onVideoCallEnd: (participantIds: string[]) => void;
  onMessageSend: (message: string, participantIds: string[]) => void;

  onMilestoneClick: (milestone: Milestone) => void;

  cryptoHoldings: CryptoHolding[];
  onCryptoTransaction: (transaction: CryptoTransaction) => void;

  isDarkMode: boolean;
  onThemeToggle: () => void;

  // Additional props for content creators
  contentPosts: ContentPost[];
  onContentPostClick: (post: ContentPost) => void;
  onContentPostCreate: (post: ContentPost) => void;
  onContentPostDelete: (post: ContentPost) => void;
  onContentPostEdit: (post: ContentPost) => void;
  onContentPostSchedule: (post: ContentPost) => void;
  onContentPostPublish: (post: ContentPost) => void;
  onContentPostPerformanceTrack: (post: ContentPost) => void;
}

interface CalendarProps<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>
  extends CommonCalendarProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  view: string | CalendarManagerState;
  container: any;
  speed: number;
  month: MonthInfo[];
  year: YearInfo[];
  dependencies: any;
  progress: Progress;
  label: Label;
  labels: Label[];
  resources: Resource[];
  onDateSelect: (date: Date) => void;
}

const Calendar = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>({
  view,
  container,
  speed,
  onChangeSpeed,
  selectedProject,
  month,
  year,
  tasks,
  projects,
  events,
  milestones,
  onDateSelect,
  ...taskHandlers
}: CalendarProps<T, K>) => {
  return (
    <div>
      {view === "day" && (
        <DayView
          day={"Monday"}
          tasks={tasks}
          events={events}
          projects={projects}
          milestones={milestones}
          selectedProject={selectedProject}
          onChangeSpeed={onChangeSpeed}
          {...taskHandlers}
        />
      )}
      {view === "week" && (
        <WeekView
          weekStartDate={new Date()}
          tasks={tasks}
          events={events}
          projects={projects}
          milestones={milestones}
          selectedProject={selectedProject}
          {...taskHandlers}
        />
      )}
      {view === "month" && (
        <MonthView
          month={month}
          year={year}
          tasks={tasks}
          events={events}
          projects={projects}
          milestones={milestones}
          selectedProject={selectedProject}
          onChangeSpeed={onChangeSpeed}
          {...taskHandlers}
        />
      )}
      {view === "year" && (
        <YearView
          year={year}
          projects={projects}
          tasks={tasks}
          events={events}
          milestones={milestones}
          selectedProject={selectedProject}
          onChangeSpeed={onChangeSpeed}
          {...taskHandlers}
        />
      )}
      {view === "your-calendar" && <YourCalendarLibrary />}
      {/* Additional components or UI elements can be added here */}
    
      <DatePickerComponent
        selectedDates={[new Date()]} // Pass the selected date (you can replace with actual selected date)
        onChange={(date) => console.log(date)} // Define the onChange event handler
      />
      <YourCalendarLibrary />
    </div>
  );
};

export default Calendar;
export type { CommonCalendarProps };
