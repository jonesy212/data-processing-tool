// CalendarApp.tsx
import CommonDetails, { CommonData } from "../models/CommonData";
import CalendarDetails from "../models/data/CalendarDetails";
import { DataDetails } from "../models/data/Data";
import Team, { DataDetailsComponent, TeamDetails } from "../models/teams/Team";
import { Progress } from "../models/tracker/ProgresBar";
import Project from "../projects/Project";
import { DetailsItem } from "../state/stores/DetailsListStore";
import { CalendarEvent } from "./CalendarContext";


const assignProject = (team: Team, project: Project) => {
  // Implement the logic to assign a project to the team
  team.projects.push(project);
};

const reassignProject = (team: Team, project: Project, previousTeam: Team, reassignmentDate: Date) => {
  // Implement the logic to reassign a project to the team from a previous team
  previousTeam.projects = previousTeam.projects.filter(proj => proj.id !== project.id);
  team.projects.push(project);
};

const updateProgress = (team: Team) => {
  // Implement the logic to update the team's progress
  const totalProjects = team.projects.length;
  const completedProjects = team.projects.filter(project => project.status === 'completed').length;
  
  // Calculate progress percentage
  const progressPercentage = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;
  
  // Update team's progress with Progress type
  team.progress = { value: progressPercentage, label: `${progressPercentage}%` };
};

const unassignProject = (team: Team, project: Project) => { 
  // Implement the logic to unassign a project from the team
  team.projects = team.projects.filter(proj => proj.id !== project.id);

}



const CalendarApp = () => {
  const calendarEvent: CalendarEvent = {
    id: "1",
    title: "Meeting",
    description: "Discuss project plans",
    startDate: new Date(),
    endDate: new Date(),
    location: "Office",
    attendees: [],
    reminder: "15 minutes before",
    reminderOptions: {
      recurring: true,
      frequency: "weekly",
      interval: 1, // Every week
    },
    date: new Date,
    isActive: false,
    category: "",
    shared: undefined,
    details: {} as DetailsItem<DataDetails>,
    bulkEdit: false,
    recurring: false,
    customEventNotifications: "customNotifications",
    comment: 'comment',
    attachment: 'attachment',
  };



  return (
    <div>
      <h1>Calendar App</h1>
      <CalendarDetails
        data={{
          tags: ["work", "meeting"],
          metadata: {},
          
        }}
        details={{
          id: "1",
          title: "Meeting",
          description: "Discuss project plans",
          startDate: new Date(),
          endDate: new Date(),
        }}
      />
      <CommonDetails
        data={{
          calendarEvent:
            calendarEvent
        } as CommonData<never>}
        details={{
          // id: "1",
          description: "Discuss project plans",
          reminders: ["15 minutes before", "30 minutues before", "1 day before", "1 week before"],
          location: "Online",
          attendees: [],
        }}
      />
      <DataDetailsComponent
        data={{
          id: "1",
          type: "calendarEvent",
          isActive: false,
          title: "Meeting",
          tags: ["work", "meeting"],
          details: {} as DataDetails,
        }}
      

      />

      <TeamDetails
        team={{
          id: "1",
          teamName: "Team A",
          description: "Description of Team A",
          members: [],
          projects: [],
          isActive: true,
          leader: null,
          pointOfContact: null,
          progress: {} as Progress,
          creationDate: new Date(),
          assignedProjects: [],
          reassignedProjects: [],

          assignProject: assignProject,
          reassignProject: reassignProject,
          updateProgress: updateProgress,
          unassignProject: unassignProject
        }}
      />
    </div>
  );
};

export default CalendarApp;

export { assignProject, reassignProject, unassignProject, updateProgress };

