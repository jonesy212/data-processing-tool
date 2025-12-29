// IntegrationLogic.tsx
import { Label } from "@/core/branding/BrandingSettings";
import { CommonCalendarProps } from "@/core/components/calendar/Calendar";
import { YearInfo } from "@/core/components/calendar/CalendarYear";
import { Month, MonthInfo } from "@/core/components/calendar/Month";
import { Task } from "@/core/components/models/tasks/Task";
import { BaseData } from '@/core/models/data/Data';
import { Progress } from "@/core/models/tracker/ProgressBar";
import { NotificationContextProps } from '@/core/state/context/NotificationContext';
import { Resource } from "@/core/state/redux/slices/CollaborationSlice";
import Milestone from '@/core/typings/milestoneTypes';

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
