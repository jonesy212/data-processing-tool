import { CalendarEvent } from '@/app/components/calendar/CalendarEvent';
import { BaseData } from '@/app/components/models/data/Data';
import { K, T } from "@/app/components/models/data/dataStoreMethods";
import { Progress } from "@/app/components/models/tracker/ProgressBar";
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import React from "react";
import DatePickerComponent from "react-datepicker";
import { CryptoHolding } from "../crypto/CryptoHolding";
import CryptoTransaction from "../crypto/CryptoTransaction";
import { ContentPost } from "../models/content/ContentPost";
import { Task } from "../models/tasks/Task";
import { Project } from "../projects/Project";
import { Label } from "../projects/branding/BrandingSettings";
import { Resource } from "../state/redux/slices/CollaborationSlice";
import { RootState } from "../state/redux/slices/RootSlice";
import MonthView from "./CalendarMonthView";
import Milestone, { CalendarManagerState } from "./CalendarSlice";
import WeekView from "./CalendarWeek";
import { YearInfo } from "./CalendarYear";
import YearView from "./CalendarYearView";
import DayView from "./DayOfWeek";
import { MonthInfo } from "./Month";
import YourCalendarLibrary from "./YourCalendarLibrary";

interface CommonCalendarProps {
  year?: YearInfo[] | number;
  month?: MonthInfo[] | number;
  events: CalendarEvent<any, any>[];
  tasks: Task<T, K<T>>[];
  milestones: Milestone[];
  projectId: string; // Add projectId prop
  projects: Project[];
  
  selectedProject: (state: RootState, projectId: string) => Project | null
  onChangeSpeed: (newSpeed: number) => void;

  onTaskClick: (task: Task<T, K<T>>) => void;
  onTaskDoubleClick: (task: Task<T, K<T>>) => void;
  onTaskContextMenu: (task: Task<T, K<T>>, event: React.MouseEvent) => void;
  onTaskDragStart: (task: Task<T, K<T>>) => void;
  onTaskDragEnd: (task: Task<T, K<T>>) => void;
  onTaskResizingStart: ( task: Task<T, K<T>>, newSize: number) => void;
  onTaskResizingEnd: (task: Task<T, K<T>>, newSize: number) => void;
  onTaskResize: (task: Task<T, K<T>>, newSize: number) => void;
  onTaskDrop: (task: Task<T, K<T>>) => void;
  onTaskChange: (task: Task<T, K<T>>) => void;
  onTaskCreate: (task: Task<T, K<T>>) => void;
  onTaskDelete: (task: Task<T, K<T>>) => void;
  onTaskTitleChange: (task: Task<T, K<T>>) => void;
  onTaskStatusChange: (task: Task<T, K<T>>) => void;
  onTaskProgressChange: (task: Task<T, K<T>>) => void;
  onTaskDependencyChange: (task: Task<T, K<T>>) => void;
  onTaskFilterChange: (task: Task<T, K<T>>) => void;
  onTaskLabelChange: (task: Task<T, K<T>>) => void;
  onTaskParentChange: (task: Task<T, K<T>>) => void;
  onTaskExpandedChange: (task: Task<T, K<T>>) => void;
  onTaskLinkAdd: (task: Task<T, K<T>>) => void;
  onTaskLinkRemove: (task: Task<T, K<T>>) => void;
  onTaskDependencyAdd: (task: Task<T, K<T>>) => void;
  onTaskDependencyRemove: (task: Task<T, K<T>>) => void;
  onTaskProgressAdd: (task: Task<T, K<T>>) => void;
  onTaskProgressRemove: (task: Task<T, K<T>>) => void;
  onTaskLabelAdd: (task: Task<T, K<T>>) => void;

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

interface CalendarProps<T extends BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>
  extends CommonCalendarProps {
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

const Calendar = <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>({
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
