// TeamCreationConfirmationPage.tsx
import RootLayout from "@/app/RootLayout";
import TeamData from "@/app/components/models/teams/TeamData";
import React from "react";

interface TeamCreationConfirmationPageProps{
    teamData: TeamData
    onConfirm: () => void
}

const TeamCreationConfirmationPage: React.FC<TeamCreationConfirmationPageProps> = ({teamData, onConfirm}) => {
  return (
    <RootLayout>
    <div>
      {/* Your confirmation page UI goes here */}
      <h1>Team Creation Confirmation Page</h1>
      <p>This is the confirmation page for team creation.</p>
      </div>
      </RootLayout>
  );
};

export default TeamCreationConfirmationPage;
