import generateTimeBasedCode from "../../../../../models/realtime/TimeBasedCodeGenerator";
import { Phase } from "../../phases/Phase";
import Project, { ProjectType } from "../../projects/Project";
import { WritableDraft } from "../../state/redux/ReducerGenerator";
import { Snapshot } from "../../state/stores/SnapshotStore";
import { DataProcessingTask } from "../../todos/tasks/DataProcessingTask";
import { User } from "../../users/User";
import { UserRole } from "../../users/UserRole";
import UserRoles from "../../users/UserRoles";
import { VideoData } from "../../video/Video";
import CommonDetails from "../CommonData";
import { Data, DataDetailsProps } from "../data/Data";
import { Idea, Task } from "../tasks/Task";
import { Progress } from "../tracker/ProgresBar";
import TeamData from "./TeamData";





interface Team {
  id: number;
  teamName: string;
  description?: string | undefined;
  members: User[];
  projects: Project[];
  creationDate: Date;
  isActive: boolean;
  leader: User | null;
  progress: Progress | null;
  data: TeamData;
  then: (callback: (newData: Snapshot<Team>) => void) => void;
  // Add other team-related fields as needed
}




const timeBasedCode = generateTimeBasedCode()
// Example usage:
const team: Team = {
  id: 1,
  teamName: "Development Team",
  description: "A team focused on software development",
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
    },
  ],
  projects: [
    {
      _id: "project-1",
      id: "1",
      title: "Team Projects",
      status: "pending",
      phase: {} as Phase,
      then: () => {},
      analysisType: "image",
      analysisResults: ["analysisResults"],
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
      then: () => {},
      analysisType: "image",
      analysisResults: ["analysisResults"],
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
          status: "pending",
          priority: "low",
          estimatedHours: null,
          actualHours: null,
          startDate: new Date(),
          endDate: new Date(),
          completionDate: new Date(),
          isActive: true,
          tags: [], // Assuming tasks can have tags
          dependencies: [],
          analysisType: "Text Analysis",
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
  },

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
    };
    callback(newData);
  },
  data: {} as TeamData & Team,
};

// Refactored CommonDetails component to handle specific data types
const TeamDetails: React.FC<{ team: Team }> = ({ team }) => (
  <CommonDetails data={team} />
);

const DataDetailsComponent: React.FC<DataDetailsProps> = ({ data }) => (
  <CommonDetails data={{ data: team }} />
);

export { DataDetailsComponent, TeamDetails };
export default Team;