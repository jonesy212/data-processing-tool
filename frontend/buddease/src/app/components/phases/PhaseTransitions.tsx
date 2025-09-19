import { ReactNode } from "react";
import { Data } from "../models/data/Data";
import { CustomPhaseHooks, Phase } from "./Phase";
import React from "react";

// Generic helper with defaults (Case 3)
type DefaultAppData<
  T = any,
  K extends T = T,
  Meta = any,
  AttachmentType = any,
  ExcludedFields extends keyof T = any
> = Data<T, K, Meta, AttachmentType, ExcludedFields>;

// Factory to create scaffolded or specialized phases
const makePhase = <
  T = any,
  K extends T = T,
  Meta = any,
  AttachmentType = any,
  ExcludedFields extends keyof T = any
>(
  name: string,
  id: string,
  description: string
): Phase<DefaultAppData<T, K, Meta, AttachmentType, ExcludedFields>> => ({
  name,
  startDate: new Date(),
  endDate: new Date(),
  subPhases: [],
  data: {} as DefaultAppData<T, K, Meta, AttachmentType, ExcludedFields>,
  hooks: {} as CustomPhaseHooks,
  id,
  description,
  date: new Date(),
  createdBy: "system",
  component: (props: {}, context?: any): ReactNode => {
    return (
      <div>
        <p>{name}</p>
      </div>
    );
  },
  duration: 0,
});

// --- Scaffolding (defaults kick in) ---
export const currentPhase = makePhase("Current Phase", "current-id", "Current phase description");
export const previousPhase = makePhase("Previous Phase", "previous-id", "Previous phase description");
export const nextPhase = makePhase("Next Phase", "next-id", "Next phase description");

// --- Example: Specialization (entity-specific phase) ---
/*
type TeamEntity = { id: string; members: string[] }; // example
export const teamPhase = makePhase<TeamEntity>(
  "Team Setup",
  "team-phase-id",
  "Phase for team onboarding"
);
*/
