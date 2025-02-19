
import { Team } from "../components/models/teams/Team";
import { Project } from "../components/projects/Project";

let currentTeamId = 1;
export const generateNewTeam = (): Team => {
  const teamId = `team_${currentTeamId}`;
  currentTeamId++;

  return {
    id: teamId,
    teamName: "Sample Team Name", 
    team: {
      id: "",
      current: false, 
      name: "Team Sample Name", 
      color: "#FFFFFF", 
      max: 100, 
      min: 0, 
      label: "Sample Label", 
      percentage: 0, 
      value: 0, 
      description: "Sample Description", 
      done: false, 
      label: "Active", 
    },
    _id: "",
    projects: [], 
    creationDate: new Date(), 
    teamDescription: "Sample description for the team", 
    teamLogo: "", 
    teamMembers: [], 
    teamAdmins: [],
    teamTags: [],
    teamInvites: [],
    teamRequests: [],
    isActive: false,
    leader: null,
    progress: null,
    assignedProjects: [],
    reassignedProjects: [],
    assignProject: (team: Team, project: Project, assignedDate: Date) => {},
    reassignProject: (
      team: Team,
      project: Project,
      previousTeam: Team,
      reassignmentDate: Date) => { },
    unassignProject: (team: Team, project: Project) =>{},
    updateProgress: (team: Team, project: Project) => {},
  };
};
