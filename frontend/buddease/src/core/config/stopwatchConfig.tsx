// stopwatchConfig.tsx
// stopwatchConfig.ts

import BasicStopwatchComponent from "@/core/components/stopwatches/BasicStopwatchComponent";
import CountdownTimerComponent from "@/core/components/stopwatches/CountdownTimerComponent";
import CustomizableTimersComponent from '@/core/components/stopwatches/CustomizableTimersComponent';
import IntervalTimerComponent from "@/core/components/stopwatches/IntervalTimerComponent";
import MultiPhaseTimerComponent from '@/core/components/stopwatches/MultiPhaseTimerComponent';
import PomodoroTechniqueComponent from "@/core/components/stopwatches/PomodoroTechniqueComponent";
import ProgressiveTimerComponent from "@/core/components/stopwatches/ProgressiveTimerComponent";
import ScheduledTimersComponent from "@/core/components/stopwatches/ScheduledTimersComponent";
import TeamCollaborationTimerComponent from '@/core/components/stopwatches/TeamCollaborationTimerComponent';


export interface StopwatchConfiguration {
    mode: StopwatchMode;
    precision: StopwatchPrecision;
    theme: StopwatchTheme;
    displayMode: StopwatchDisplayMode;
    alarms: StopwatchAlarm[];
    // Add more configuration options as needed
  }
  
  export enum StopwatchMode {
    Basic = "Basic",
    Countdown = "Countdown",
    Interval = "Interval",
    Pomodoro = "Pomodoro",
  }
  
  export enum StopwatchPrecision {
    Seconds = "Seconds",
    Milliseconds = "Milliseconds",
  }
  
  export enum StopwatchTheme {
    Light = "Light",
    Dark = "Dark",
  }
  
  export enum StopwatchDisplayMode {
    Normal = "Normal",
    Compact = "Compact",
  }
  
  export interface StopwatchAlarm {
    time: string; // Time in HH:MM:SS format
    message: string;
  }
  




const stopwatchConfiguration = {
  basicStopwatch: BasicStopwatchComponent,
  countdownTimer: CountdownTimerComponent,
  intervalTimer: IntervalTimerComponent,
  pomodoroTechnique: PomodoroTechniqueComponent,
  customizableTimers: CustomizableTimersComponent,
  multiPhaseTimer: MultiPhaseTimerComponent,
  teamCollaborationTimer: TeamCollaborationTimerComponent,
  progressiveTimer: ProgressiveTimerComponent,
  scheduledTimers: ScheduledTimersComponent,
};