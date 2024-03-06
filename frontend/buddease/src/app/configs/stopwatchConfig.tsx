// stopwatchConfig.ts

import BasicStopwatchComponent from "../components/stopwatches/BasicStopwatchComponent";
import CountdownTimerComponent from "../components/stopwatches/CountdownTimerComponent";
import IntervalTimerComponent from "../components/stopwatches/IntervalTimerComponent";
import PomodoroTechniqueComponent from "../components/stopwatches/PomodoroTechniqueComponent";

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