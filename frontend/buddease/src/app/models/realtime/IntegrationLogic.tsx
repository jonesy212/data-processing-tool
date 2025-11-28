// IntegrationLogic.tsx
import { Label } from "@/app/branding/BrandingSettings";
import { CommonCalendarProps } from "@/app/components/calendar/Calendar";
import Milestone from "@/app/components/calendar/CalendarSlice";
import { YearInfo } from "@/app/components/calendar/CalendarYear";
import { Month, MonthInfo } from "@/app/components/calendar/Month";
import { Task } from "@/app/components/models/tasks/Task";
import { Progress } from "@/app/components/models/tracker/ProgressBar";
import { BaseData } from '@/app/models/data/Data';
import { NotificationContextProps } from '@/app/state/context/NotificationContext';
import { Resource } from "@/app/state/redux/slices/CollaborationSlice";

interface Dependency {
  // Define the properties of the Dependency type
  // For example:
  id: number;
  name: string;
  // Add more properties as needed
}

type Year = number;
type Years = Year[];

interface IntegrateComponentsProps extends CommonCalendarProps {
  speed: number;
  onChangeSpeed: (newSpeed: number) => void;
  container: NotificationContextProps;
  view: string;
  tasks: Task<BaseData, BaseData>[];
  event: any;
  milestones: Milestone[];
  dependencies: Dependency[];
  progress: Progress;
  label: Label;
  labels: Label[];
  resources: Resource[];
  month: MonthInfo[];
  months: Month[];
  year: YearInfo[];
  years: Years;
  projectId: string
  events: any[],
  onDateSelect: (date: Date) => void;
}

export type { Dependency, IntegrateComponentsProps };
