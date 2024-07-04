
import { Team } from "../components/models/teams/Team";
import { Project } from "../components/projects/Project";

let currentTeamId = 1;

export const generateNewTeam = (): Team => {
  const teamId = `team_${currentTeamId}`;
  currentTeamId++;

  return {
    id: teamId,
    teamName: "",
    team: {
      value: 0,
      label: "Active",
    },
    _id: "",
    projects: [],
    creationDate: new Date(),
    teamDescription: "",
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
    assignProject: (team: Team, project: Project) => {},
    reassignProject: (
      team: Team,
      project: Project,
      previousTeam: Team,
      reassignmentDate: Date) => { },
    unassignProject: (team: Team, project: Project) =>{},
    updateProgress: (team: Team, project: Project) => {},
  };
};
