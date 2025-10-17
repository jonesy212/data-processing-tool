import {
  Label,
  label,
  labels,
} from "@/app/branding/BrandingSettings";
import Calendar, { CommonCalendarProps } from "@/app/calendar/Calendar";
import { month } from "@/app/components/calendar/CalendarMonth";
import Milestone, {
  CalendarManagerState,
} from "@/app/components/calendar/CalendarSlice";
import year, { YearInfo } from "@/app/components/calendar/CalendarYear";
import { Month, MonthInfo } from "@/app/components/calendar/Month";
import CryptoTransaction from "@/app/components/crypto/CryptoTransaction";
import { ContentPost } from "@/app/components/models/content/ContentPost";
import { AttendancePredictionResult } from "@/app/components/models/data/CalendarEventAttendancePrediction";
import { Task } from "@/app/components/models/tasks/Task";
import { Progress } from "@/app/components/models/tracker/ProgressBar";
import { NotificationContextProps } from "@/app/context/NotificationContext";
import { BaseData } from "@/app/data/Data";
import TaskManagementManager from "@/app/projects/TaskManagementPhase";
import { Resource, selectSelectedProject } from "@/app/state/redux/slices/CollaborationSlice";
import { RootState } from "@/app/state/redux/slices/RootSlice";
import { rootStores } from "@/app/state/stores/RootStores";
import ControlPanel from "@/app/utils/ControlPanel";
import React, { useEffect, useState } from "react";

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

export type { Dependency }