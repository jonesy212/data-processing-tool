import { Phase } from "../../phases/Phase";
import Project from "../../projects/Project";
import { DataProcessingTask } from "../../todos/tasks/DataProcessingTask";
import { User } from "../../users/User";
import CommonDetails from "../CommonDetailsProps";
import { Data } from "../data/Data";
import { Progress } from "../tracker/ProgresBar";

interface Team extends Data {
  id: number;
  teamName: string;
  description?: string | undefined;
  members: User[];
  projects: Project[];
  creationDate: Date;
  isActive: boolean;
  leader: User | null;
  progress: Progress | null;
  // Add other team-related fields as needed
}

// Example usage:
const team: Team = {
  id: 1,
  teamName: "Development Team",
  description: "A team focused on software development",
  members: [
    {
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
    },
    {
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
    },
  ],
  projects: [
    {
      id: "1",
      name: "Project A",
      description: "Description of Project A",
      members: [],
      tasks: [],
      startDate: new Date(),
      endDate: new Date(),
      phases: [],
      currentPhase: null,
      isActive: true,
      leader: null,
      budget: 0,
    },
    {
      id: "2",
      name: "Project B",
      description: "Description of Project B",
      members: [],
      phases: [],
      currentPhase: "Planning" as unknown as Phase,
      tasks: [
        {
          id: "1",
          title: "Task 1",
          description: "Description of Task 1",
          assignedTo: [
            /* ... */
          ],
          then(arg0: (newTask: any) => void): unknown {
            const newTask = {
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
          startDate: undefined,
          endDate: new Date(),
          completionDate: new Date(),
          isActive: true,
          tags: [], // Assuming tasks can have tags
          dependencies: [],
          analysisType: "Text Analysis",
          analysisResults: [],
        },
        // Add more tasks as needed
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
  },
  then(callback: (newTeam: Team) => void) {
    const newTeam = {
      id: 2,
      teamName: "New Team",
      description: null,
      members: [],
      projects: [],
      creationDate: new Date(),
      isActive: true,
      leader: null,
      progress: null,
      then: callback,
    };
  },
  title: "",
  status: "pending",
  tags: [],
  analysisType: "",
  analysisResults: []
};

// using commong detais we genrate detais for components by mapping through the objects.
const TeamDetails: React.FC<{ team: Team }> = ({ team }) => (
  <CommonDetails data={team} />
);

export { TeamDetails };

  export type { Team };

