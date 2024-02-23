// TeamCreationConfirmationPage.tsx
import TeamData from "@/app/components/models/teams/TeamData";
import React from "react";

interface TeamCreationConfirmationPageProps{
    teamData: TeamData
    onConfirm: () => void
}

const TeamCreationConfirmationPage: React.FC<TeamCreationConfirmationPageProps> = ({teamData, onConfirm}) => {
  return (
    <div>
      {/* Your confirmation page UI goes here */}
      <h1>Team Creation Confirmation Page</h1>
      <p>This is the confirmation page for team creation.</p>
    </div>
  );
};

export default TeamCreationConfirmationPage;
