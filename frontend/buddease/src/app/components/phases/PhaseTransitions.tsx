import { ReactNode } from "react";
import { Data } from "../models/data/Data";
import { CustomPhaseHooks, Phase } from "./Phase";
import React from "react";


export const currentPhase: Phase = {
    name: "Current Phase",
    startDate: new Date(),
    endDate: new Date(),
    subPhases: [],
    data: {} as Data,
  hooks: {} as CustomPhaseHooks,
  id, description, date, createdBy,
    component: (props: {}, context?: any): ReactNode => {
      return (
        <div>
          <p>Current Phase: {currentPhase.name}</p>
        </div>
      );
  },
    duration: 0,
  };
export const previousPhase: Phase = {
    name: "Previous Phase",
    startDate: new Date(),
    endDate: new Date(),
    subPhases: [],
    data: {} as Data,
    hooks: {} as CustomPhaseHooks,
    id, description, date, createdBy,
    component: (props: {}, context?: any): ReactNode => {
      return (
        <div>
          <p>Previous Phase: {previousPhase.name}</p>
        </div>
      );
  },
    duration: 0,
  };
  
export const nextPhase: Phase = {
    name: "Next Phase",
    startDate: new Date(),
    endDate: new Date(),
    subPhases: [],
    data: {} as Data,
    hooks: {} as CustomPhaseHooks,
    id, description, date, createdBy,
    component: (props: {}, context?: any): ReactNode => {
      return (
        <div>
          <p>Next Phase: {nextPhase.name}</p>
        </div>
      );
  },
    duration: 0,
  };
  