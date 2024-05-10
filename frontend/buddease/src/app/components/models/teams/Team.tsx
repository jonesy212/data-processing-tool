import { Persona } from '@/app/pages/personas/Persona';
import React from 'react';
import generateTimeBasedCode from "../../../../../models/realtime/TimeBasedCodeGenerator";
import { Phase } from "../../phases/Phase";
import { DataAnalysisResult } from '../../projects/DataAnalysisPhase/DataAnalysisResult';
import { Project, ProjectType } from "../../projects/Project";
import SnapshotStore, { Snapshot } from "../../snapshots/SnapshotStore";
import { WritableDraft } from "../../state/redux/ReducerGenerator";
import { implementThen } from '../../state/stores/CommonEvent';
import { DataProcessingTask } from "../../todos/tasks/DataProcessingTask";
import { Idea } from '../../users/Ideas';
import { User } from "../../users/User";
import { UserRole } from "../../users/UserRole";
import UserRoles from "../../users/UserRoles";
import { VideoData } from "../../video/Video";
import CommonDetails, { CommonData } from "../CommonData";
import { Data, DataDetailsProps } from "../data/Data";
import { StatusType, TeamStatus } from '../data/StatusType';
import { Task } from "../tasks/Task";
import { Progress } from "../tracker/ProgressBar";
import TeamData from "./TeamData";
import { Member, TeamMember } from './TeamMembers';
import { AnalysisTypeEnum } from '../../projects/DataAnalysisPhase/AnalysisType';

interface Team extends Data {
  team: {
    value: number; label: string; // Example label
  };
  _id: string;
  id: string;
  teamName: string;
  description?: string | undefined;
  projects: Project[];
  creationDate: Date;
  isActive: boolean;
  leader: User | null;
  progress: Progress | null;
  data?: TeamData;
  members?: Member[]
  then?: (callback: (newData: Snapshot<Data>) => void) => void;
  pointOfContact?: TeamMember[] | null;
  currentProject?: Project | null;
  currentTeam?: Team | null;
  collaborationTools?: TeamData["collaborationTools"];
  globalCollaboration?: TeamData["globalCollaboration"];
  collaborationPreferences?: TeamData["collaborationPreferences"];


  assignedProjects: Project[];
  reassignedProjects: { project: Project; previousTeam: Team; reassignmentDate: Date }[];
  assignProject(team: Team, project: Project): void
  reassignProject(team: Team, project: Project, previousTeam: Team, reassignmentDate: Date): void;
  unassignProject(team: Team, project: Project): void;
  updateProgress(team: Team, project: Project): void
   // Add other team-related fields as needed
}






const timeBasedCode = generateTimeBasedCode()
// Example usage:
const team: Team = {
  id: '1',
  teamName: "Development Team",
  description: "A team focused on software development",
  team: {
    value: 0,
    label: ''
  },
  members: [
    {
      _id: "member-1",
      id: 1,
      username: "user1",
      email: "user1@example.com",
      tier: "free",
      uploadQuota: 0,
      userType: "individual",
      fullName: "Sam Smith",
      bio: "bio content",
      hasQuota: true,
      profilePicture: "",
      processingTasks: [] as DataProcessingTask[],
      traits: "traits" as unknown as typeof CommonDetails,
      role: {} as UserRole,
      timeBasedCode: timeBasedCode,
      teamId: "1",
      roleInTeam: "admin",
      memberName: "Sam Smith",
      teams: [] as Team[],
      persona: {} as Persona,
      snapshots: [] as SnapshotStore<Snapshot<Data>>[],
      token: null,
      avatarUrl: null,
      createdAt: new Date,
      updatedAt: new Date,
      isVerified: false,
      isAdmin: false,
      isActive: false
    },
    {
      _id: "member-2",
      id: 2,
      username: "user2",
      email: "user2@example.com",
      tier: "standard",
      uploadQuota: 100,
      userType: "organization",

      fullName: "Benny Johnson",
      bio: "bio content",
      hasQuota: false,
      profilePicture: "",
      processingTasks: [] as DataProcessingTask[],
      role: {} as UserRole,
      traits: "traits" as unknown as typeof CommonDetails,
      timeBasedCode: timeBasedCode,
      teamId: "1",
      roleInTeam: "moderator",
      memberName: "Jane English",
      persona: {} as Persona,
      snapshots: [] as SnapshotStore<Snapshot<Data>>[],
      token: null,
      avatarUrl: null,
      createdAt: new Date,
      updatedAt: new Date,
      isVerified: false,
      isAdmin: false,
      isActive: false
    },
  ],
  projects: [
    {
      _id: "project-1",
      id: "1",
      title: "Team Projects",
      status: "pending",
      phase: {} as Phase,
      then: implementThen,
      analysisType: AnalysisTypeEnum.IMAGE,
      analysisResults: {} as DataAnalysisResult[],
      tags: [],
      name: "Project A",
      description: "Description of Project A",
      members: [],
      tasks: [],
      videoData: {} as VideoData,
      videoUrl: "videoUrl",
      videoThumbnail: "videoThumbnail",
      videoDuration: 0,
      startDate: new Date(),
      endDate: new Date(),
      phases: [],
      currentPhase: null,
      isActive: true,
      leader: null,
      budget: 0,
      ideas: {} as Idea[],
      type: ProjectType.Default
    },
    {
      _id: "project-2",
      id: "2",
      title: "Team Projects",
      status: "pending",
      phase: {} as Phase,
      then: implementThen,
      analysisType: AnalysisTypeEnum.IMAGE,
      analysisResults: {} as DataAnalysisResult[],
      tags: [],
      name: "Project B",
      description: "Description of Project B",
      members: [],
      phases: [],
      currentPhase: "Planning" as unknown as Phase,
      videoUrl: "videoUrl",
      videoThumbnail: "videoThumbnail",
      videoDuration: 0,
      videoData: {} as VideoData,
      ideas: {} as Idea[],
      type: ProjectType.Internal,
      tasks: [
        {
          _id: "project",
          id: "1",
          title: "Task 1",
          description: "Description of Task 1",
          phase: {} as Phase,
          assignedTo: {} as WritableDraft<User>,

          then(arg0: (newTask: any) => void): unknown {
            const newTask = {
              _id: "task-2",
              id: "2",
              title: "Task 2",
              description: "Description of Task 2",
              assignedTo: [],
              previouslyAssignedTo: [],
              done: false,
              dueDate: new Date(),
              status: "todo",
              priority: "low",
              estimatedHours: null,
              actualHours: null,
              startDate: null,
              endDate: new Date(),
              completionDate: new Date(),
              isActive: true,
              tags: [],
              dependencies: [],
            };
            arg0(newTask);
            return;
          },
          previouslyAssignedTo: [],
          done: false,
          dueDate: new Date(),
          status: TeamStatus.Pending,
          priority: "low",
          estimatedHours: null,
          actualHours: null,
          startDate: new Date(),
          endDate: new Date(),
          completionDate: new Date(),
          isActive: true,
          tags: [], // Assuming tasks can have tags
          dependencies: [],
          analysisType: AnalysisTypeEnum.TEXT,
          analysisResults: [],
          assigneeId: "1",
          payload: {},
          type: "addTask",
          videoThumbnail: "",
          videoDuration: 0,
          videoUrl: "",
          [Symbol.iterator]: () => {
            // Add more tasks as needed
            return {
              next: () => {
                return {
                  done: true,
                  value: {
                    _id: "task-2",
                    id: "2",
                    title: "Task 2",
                    description: "Description of Task 2",
                    assignedTo: [],
                    previouslyAssignedTo: [],
                    done: false,
                    dueDate: new Date(),
                    status: "todo",
                    priority: "low",
                    estimatedHours: null,
                    actualHours: null,
                    startDate: null,
                    endDate: new Date(),
                    completionDate: new Date(),
                    isActive: true,
                    tags: [],
                    dependencies: [],
                  },
                };
              },
            };
          },
          data: {} as Data,
          source: "user",
          some: (
            callbackfn: (value: Task, index: number, array: Task[]) => unknown,
            thisArg?: any
          ) => {
            // Add more tasks as needed
            return true;
          },
          videoData: {} as VideoData,
          ideas: {} as Idea[],
          // Add more tasks as needed
        },
      ],
      startDate: new Date(),
      endDate: new Date(),
      isActive: true,
      leader: null,
      budget: 0,
    },
  ],
  creationDate: new Date(),
  progress: {} as Progress,
  isActive: true,
  leader: {
    _id: "3",
    id: 3,
    username: "teamLeader",
    email: "leader@example.com",
    tier: "premium",
    uploadQuota: 200,
    userType: "organization",
    fullName: "Baine Sanders",
    bio: "bio content",
    hasQuota: false,
    profilePicture: "profile picture",
    processingTasks: [] as DataProcessingTask[],
    traits: "traits" as unknown as typeof CommonDetails,
    role: UserRoles.Guest,
    timeBasedCode: timeBasedCode,
    persona: {} as Persona,
    snapshots: [] as SnapshotStore<Snapshot<Data>>[],
  } as User,

  then(callback: (newData: Snapshot<Team>) => void) {
    const newData = {
      _id: "team-1",
      id: "1",
      name: "Team A",
      description: "Description of Team A",
      members: [],
      projects: [],
      creationDate: new Date(),
      progress: {} as Progress,
      isActive: true,
      leader: null,
      budget: 0,
      timestamp: new Date,
      data: {} as TeamData & Team,
      category: "Technology",
    };
    callback(newData);
  },
  data: {} as TeamData & Team,
  assignedProjects: [],
  reassignedProjects: [],
  assignProject(team: Team, project: Project): void {
    // Implement the logic to assign a project to the team
    team.assignedProjects.push(project);
  },
  unassignProject: function (team: Team, project: Project) {
    // Implement the logic to unassign a project from the team
    const index = team.assignedProjects.findIndex(p => p.id === project.id);
    if (index !== -1) {
      team.assignedProjects.splice(index, 1); // Remove from current team's assigned projects
    }
  },


  reassignProject: (team: Team, project: Project, previousTeam: Team, reassignmentDate: Date) => {
    // Update the project's team reference
    project.team = team;

    // Remove the project from the previous team's projects
    previousTeam.projects = previousTeam.projects.filter(proj => proj.id !== project.id);

    // Add the project to the new team's projects
    team.projects.push(project);
  },



  updateProgress: function (team: Team, project: Project) {
    // Implement the logic to update the team's progress
    // Example: Calculate progress based on assigned projects
    const totalAssignedProjects = team.assignedProjects.length;
    const completedProjects = team.assignedProjects.filter(project => project.status === 'completed').length;

    const progressValue = totalAssignedProjects > 0 ? (completedProjects / totalAssignedProjects) * 100 : 0;

    // Update the progress object
    team.progress = {
      id: team._id,
      value: progressValue,
      label: `${progressValue}% completed`,// Example label
      current: 0, // Update current progress value
      max: 100 // Set max progress value
    };
  },
  currentProject: null,
  _id: '',
  title: '',
  status: 'scheduled',
  tags: [],
  phase: null,
  analysisType: AnalysisTypeEnum.PROJECT,
  analysisResults: [],
  videoData: {} as VideoData,
};


const TeamDetails: React.FC<{ team: Team }> = ({ team }) => {
  // Check if team is not undefined before passing it to CommonDetails
  const data: CommonData<Team> | undefined = team ? { data: team } : undefined;

  const setCurrentProject = (project: Project) => {
    // Set the current project for the team
    team.currentProject = project;
  };

  const clearCurrentProject = () => {
    // Clear the current project for the team
    team.currentProject = null;
  };

  const setCurrentTeam = (team: Team) => { 
    // Set the current team for the team
    team.currentTeam = team;
  
  }


  return (
    <CommonDetails
      data={{team: team} as  CommonData<never>}
      details={{
        _id: team._id,
        id: team.id,
        type: "team",
        title: team.title || "",
        name: team.teamName,
        isActive: team.isActive,
        description: team.description,
        assignedProjects: team.assignedProjects,
        reassignedProjects: team.reassignedProjects,
        progress: team.progress,
        setCurrentProject: setCurrentProject,
        clearCurrentProject: clearCurrentProject,
        setCurrentTeam: setCurrentTeam,
        analysisResults: team.analysisResults,
        // Include other team-specific properties here
      }}
    />
  );
};




const DataDetailsComponent: React.FC<DataDetailsProps> = ({ data }) => (
  <CommonDetails
    data={{
      title: data.title,
      description: data.description,
      status: data.status as StatusType | undefined,
    }}
    details={{
      _id: data._id,
      id: data.id as string,
      phase: data.phase,
      description: data.description,
      isActive: data.isActive,
      type: data.type,
      // analysisResults: data.analysisResults,
      // Include other generic data properties here
    }}
  />
);



export { DataDetailsComponent, TeamDetails, team };
export type { Team };

