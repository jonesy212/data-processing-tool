import React from "react";
import { Progress } from "@/app/components/models/tracker/ProgressBar";
import DatePickerComponent from "react-datepicker";
import { CryptoHolding } from "../crypto/CryptoHolding";
import CryptoTransaction from "../crypto/CryptoTransaction";
import { ContentPost } from "../models/content/ContentPost";
import { Task } from "../models/tasks/Task";
import { Project } from "../projects/Project";
import { Label } from "../projects/branding/BrandingSettings";
import { Resource } from "../state/redux/slices/CollaborationSlice";
import { RootState } from "../state/redux/slices/RootSlice";
import { CalendarEvent } from "../state/stores/CalendarEvent";
import MonthView from "./CalendarMonthView";
import Milestone, { CalendarManagerState } from "./CalendarSlice";
import WeekView from "./CalendarWeek";
import { YearInfo } from "./CalendarYear";
import YearView from "./CalendarYearView";
import DayView from "./DayOfWeek";
import { MonthInfo } from "./Month";
import YourCalendarLibrary from "./YourCalendarLibrary";

interface CommonCalendarProps {
  year?: YearInfo[];
  month?: MonthInfo[];
  events: CalendarEvent[];
  tasks: Task[];
  milestones: Milestone[];
  projectId: string; // Add projectId prop
  projects: Project[];
  selectedProject: (state: RootState, projectId: string) => Project | null

  onTaskClick: (task: Task) => void;
  onTaskDoubleClick: (task: Task) => void;
  onTaskContextMenu: (task: Task, event: React.MouseEvent) => void;
  onTaskDragStart: (task: Task) => void;
  onTaskDragEnd: (task: Task) => void;
  onTaskResizingStart: ( task: Task, newSize: number) => void;
  onTaskResizingEnd: (task: Task, newSize: number) => void;
  onTaskResize: (task: Task, newSize: number) => void;
  onTaskDrop: (task: Task) => void;
  onTaskChange: (task: Task) => void;
  onTaskCreate: (task: Task) => void;
  onTaskDelete: (task: Task) => void;
  onTaskTitleChange: (task: Task) => void;
  onTaskStatusChange: (task: Task) => void;
  onTaskProgressChange: (task: Task) => void;
  onTaskDependencyChange: (task: Task) => void;
  onTaskFilterChange: (task: Task) => void;
  onTaskLabelChange: (task: Task) => void;
  onTaskParentChange: (task: Task) => void;
  onTaskExpandedChange: (task: Task) => void;
  onTaskLinkAdd: (task: Task) => void;
  onTaskLinkRemove: (task: Task) => void;
  onTaskDependencyAdd: (task: Task) => void;
  onTaskDependencyRemove: (task: Task) => void;
  onTaskProgressAdd: (task: Task) => void;
  onTaskProgressRemove: (task: Task) => void;
  onTaskLabelAdd: (task: Task) => void;

  onAudioCallStart: (participantIds: string[]) => void;
  onVideoCallStart: (participantIds: string[]) => void;
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

interface CalendarProps extends CommonCalendarProps {
  view: string | CalendarManagerState;
  container: any;
  speed: number;
  onChangeSpeed: (newSpeed: number) => void;
  selectedProject: (state: RootState, projectId: string) => Project | null
  month: MonthInfo[];
  year: YearInfo[];
  dependencies: any;
  progress: Progress;
  label: Label;
  labels: Label[];
  resources: Resource[];
}

const Calendar: React.FC<CalendarProps> = ({
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
  ...taskHandlers
}) => {
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
          {...taskHandlers}
        />
      )}
      {view === "year" && (
        <YearView
          year={year}
          projects={projects}
          month={month}
          tasks={tasks}
          events={events}
          milestones={milestones}
          selectedProject={selectedProject}
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
