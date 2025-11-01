// stopwatchConfig.ts

import BasicStopwatchComponent from "@/app/components/stopwatches/BasicStopwatchComponent";
import CountdownTimerComponent from "@/app/components/stopwatches/CountdownTimerComponent";
import IntervalTimerComponent from "@/app/components/stopwatches/IntervalTimerComponent";
import PomodoroTechniqueComponent from "@/app/components/stopwatches/PomodoroTechniqueComponent";
import ProgressiveTimerComponent from "@/app/components/stopwatches/ProgressiveTimerComponent";
import ScheduledTimersComponent from "@/app/components/stopwatches/ScheduledTimersComponent";
import CustomizableTimersComponent from '@/app/components/stopwatches/CustomizableTimersComponent';
import MultiPhaseTimerComponent from '@/app/components/stopwatches/MultiPhaseTimerComponent';
import TeamCollaborationTimerComponent from '@/app/components/stopwatches/TeamCollaborationTimerComponent';


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