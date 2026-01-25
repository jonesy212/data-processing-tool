// TeamSummaryStep.tsx
import SummaryStep from "@/core/phases/steps/SummaryStep";
import React from "react";

const TeamSummaryStep: React.FC<{ teamData: any }> = ({ teamData }) => {
  return <SummaryStep title="Team Summary" data={teamData} />;
};

export default TeamSummaryStep