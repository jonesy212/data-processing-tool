import React from "react";
import SummaryStep from "@/app/phases/steps/SummaryStep";

const TeamSummaryStep: React.FC<{ teamData: any }> = ({ teamData }) => {
  return <SummaryStep title="Team Summary" data={teamData} />;
};

export default TeamSummaryStep