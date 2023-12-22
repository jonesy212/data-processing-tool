
import { DataProcessingTask } from "../../todos/tasks/DataProcessingTask";
import { User } from "../../todos/tasks/User";
import Project from "../projects/Project";

interface Team {
  id: number;
  name: string;
  description: string | null;
  members: User[];
  projects: Project[];
  creationDate: Date;
  isActive: boolean;
  leader: User | null;
  // Add other team-related fields as needed
}

// Example usage:
const team: Team = {
  id: 1,
  name: "Development Team",
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
      id: 1,
      name: "Project A",
      description: "Description of Project A",
      members: [],
      tasks: [],
      startDate: new Date(),
      endDate: new Date(),
      phase: "Project Planning",
      isActive: true,
      leader: null,
      budget: 0,
    },
    {
      id: 2,
      name: "Project B",
      description: "Description of Project B",
      members: [],
      phase: "Project Ideation",
      tasks: [
        {
          id: 1,
          name: "Task 1",
          description: "Description of Task 1",
          assignedTo: [
            /* ... */
          ],
          dueDate: new Date(),
          status: "todo",
          priority: "low",
          estimatedHours: null,
          actualHours: null,
          startDate: null,
          endDate: new Date(),
          completionDate: new Date(),
          isActive: true,
          tags: [], // Assuming tasks can have tags
          dependencies: [],
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
    processingTasks: [] as DataProcessingTask[]
  },
};


export type { Team };
