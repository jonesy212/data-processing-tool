// ArtistManagementPhase.tsx
import userJourney from '@/app/pages/personas/recruiter_dashboard/PersonaBuilderDashboard';
import { trainerUserJourney } from "@/app/pages/personas/trainerUserJourney";
import ScheduleEventDashboard from "@/app/ts/ScheduleEventDashboard";
import React, { useEffect } from "react";
import MeetingScheduler from "../../communications/scheduler/MeetingScheduler";
import OnlinePopupsComponent from "../../communications/scheduler/OnlinePopupsComponent";
import ScheduleMeetingComponent from "../../communications/scheduler/ScheduleMeetingComponent";
import MeetingSchedulerHost from "../../video/MeetingSchedulerHost";
import SellMerchandiseComponent from "../management/SellMerchandiseComponent";
import CreateProductComponent from "./CreateProductComponent";
import ReceiveDonationsComponent from "./ReceiveDonationsComponent";
import { setCurrentPhase } from ;
export enum ArtistManagementPhaseEnum {
  CREATE_PRODUCT,
  SCHEDULE_EVENTS,
  MEETING_SCHEDULER,
  MEETING_SCHEDULER_HOST,
}

const ArtistManagementPhase: React.FC = () => {
  useEffect(() => {
    // Add logic for artist management
    trainerUserJourney();
    userJourney(selectedPersona);

  }, []);

  return (
    <div>
      <div>
        <h2>Artist Management Phase</h2>
        {/* Add components for artist management */}
        <div>
          <h3>Create Product</h3>
          <CreateProductComponent
            onCreateProduct={() => {
              setCurrentPhase(ArtistManagementPhase.SCHEDULE_EVENTS);
            }}
          />
        </div>
        <div>
          <h3>Schedule Events</h3>
          <ScheduleEventDashboard />
        </div>
        <div>
          <h3>Meeting Scheduler</h3>
          <MeetingScheduler />
        </div>
        <div>
          <h3>Meeting Scheduler - Host</h3>
          <MeetingSchedulerHost />
        </div>
        {/* Add more components for artist management as needed */}
      </div>

      <ScheduleMeetingComponent />
      <OnlinePopupsComponent />
      <SellMerchandiseComponent />
      <ReceiveDonationsComponent />
    </div>
  );
};

export default ArtistManagementPhase;
