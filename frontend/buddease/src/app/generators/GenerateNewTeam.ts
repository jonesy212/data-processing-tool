
import { Team } from "../components/models/teams/Team";

let currentTeamId = 1;

export const generateNewTeam = (): Team => {
  // Make the team ID more unique and identifiable
  const teamId = `team_${currentTeamId}`;
  
  // Increment the team ID for the next team
  currentTeamId++;

  return {
    id: teamId as unknown as number,
    teamName: "",
    // Add other properties as needed
  } as Team;
};
