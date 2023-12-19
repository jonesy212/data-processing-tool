import { User } from "../../todos/TodoReducer";
import { Project } from "../projects/Project";

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
      password: "password1",
      tier: "free",
      upload_quota: 0,
      user_type: "individual",
    },
    {
      id: 2,
      username: "user2",
      email: "user2@example.com",
      password: "password2",
      tier: "standard",
      upload_quota: 100,
      user_type: "organization",
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
      isActive: true,
      leader: null,
      budget: 0,
    },
    {
      id: 2,
      name: "Project B",
      description: "Description of Project B",
      members: [],
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
    password: "leaderPassword",
    tier: "premium",
    upload_quota: 200,
    user_type: "organization",
  },
};


export type { Team };
