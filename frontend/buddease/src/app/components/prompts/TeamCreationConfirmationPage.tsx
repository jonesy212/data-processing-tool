import { Button as AntdButton } from "antd";
import React from "react";
import { Button as NativeButton } from "react-native";
import TeamData from "../models/teams/TeamData";
import RootLayout from "@/app/RootLayout";


interface TeamCreationConfirmationPageProps {
  teamData?: TeamData;
  onConfirm: () => void;
  onCancel: () => void; // Add onCancel function to props
}

const TeamCreationConfirmationPage: React.FC<
  TeamCreationConfirmationPageProps
> = ({ teamData, onConfirm, onCancel }) => {
  // Render the confirmation page using teamData
  return (
    <RootLayout>

    <div>
      {/* Render your confirmation page UI here */}
      <h2>Team Creation Confirmation</h2>
      {teamData && (
        <>
          <p>Team ID: {teamData.id}</p>
          <p>Team Name: {teamData.teamName}</p>
          {/* Additional team details */}
          <p>Team Members: {teamData.members.join(", ")}</p>
          <p>Creation Date: {teamData.creationDate.toString()}</p>
          {/* Add more team data properties as needed */}
        </>
      )}
      <p>Please confirm that the information is correct:</p>
      <NativeButton title="Confirm Team Creation" onPress={onConfirm} />
      {/* Add a cancel button or option if needed */}
      <AntdButton title="Cancel" />
      </div>
      </RootLayout>

  );
};

export default TeamCreationConfirmationPage;
