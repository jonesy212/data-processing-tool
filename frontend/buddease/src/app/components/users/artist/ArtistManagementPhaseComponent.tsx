// ArtistManagementPhaseComponent.tsx
import React, { useState } from "react";
import MeetingSchedulerHost from "../../video/MeetingSchedulerHost";
import MeetingScheduler from "../../communications/scheduler/MeetingScheduler";
import ScheduleEventDashboard from "@/app/ts/ScheduleEventDashboard";
import CreateProductComponent from "./CreateProductComponent";

export enum ArtistManagementPhase {
  CREATE_PRODUCT,
  SCHEDULE_EVENTS,
  MEETING_SCHEDULER,
  MEETING_SCHEDULER_HOST,
}

const ArtistManagementPhaseComponent: React.FC = () => {
  const [currentPhase, setCurrentPhase] = useState<ArtistManagementPhase>(
    ArtistManagementPhase.CREATE_PRODUCT
  );

  // Define handlers for transitioning between phases
  const handlePhaseTransition = (phase: ArtistManagementPhase) => {
    setCurrentPhase(phase);
  };

  return (
    <div>
      {currentPhase === ArtistManagementPhase.CREATE_PRODUCT && (
        <CreateProductComponent onNextPhase={() => handlePhaseTransition(ArtistManagementPhase.SCHEDULE_EVENTS)} />
      )}
      {currentPhase === ArtistManagementPhase.SCHEDULE_EVENTS && (
        <ScheduleEventDashboard onNextPhase={() => handlePhaseTransition(ArtistManagementPhase.MEETING_SCHEDULER)} />
      )}
      {currentPhase === ArtistManagementPhase.MEETING_SCHEDULER && (
        <MeetingScheduler onNextPhase={() => handlePhaseTransition(ArtistManagementPhase.MEETING_SCHEDULER_HOST)} />
      )}
      {currentPhase === ArtistManagementPhase.MEETING_SCHEDULER_HOST && (
        <MeetingSchedulerHost onNextPhase={() => handlePhaseTransition(nextPhase)} />
      )}
    </div>
  );
};

export default ArtistManagementPhaseComponent;
