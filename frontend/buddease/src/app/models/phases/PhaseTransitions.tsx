// PhaseTransitions.tsx
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { BaseData } from '@/app/models/data/Data';
import { CustomPhaseHooks } from '@/app/models/phases/Phase';
import { ReactNode } from "react";
import { Phase } from "./Phase";


// Generic helper with defaults (Case 3)
type DefaultApp<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = BaseData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>

// Factory to create scaffolded or specialized phases
const makePhase = <  
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  name: string,
  id: string,
  description: string
): Phase<DefaultApp<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => ({
  name,
  projectId: "project-id",
  startDate: new Date(),
  endDate: new Date(),
  subPhases: [],
  data: {} as DefaultApp<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  hooks: {} as CustomPhaseHooks<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
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
