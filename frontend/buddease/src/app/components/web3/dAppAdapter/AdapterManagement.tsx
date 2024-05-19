import { generateNewTask } from "@/app/generators/GenerateNewTask";
import { Task } from "../../models/tasks/Task";
import { ShareProps } from '../../shared/Share';

class ManagementSystem {
  private static instance: ManagementSystem;
  private sharedProps: ShareProps | null = null;

  private constructor() {
    // Initialization logic, if needed
  }

  public static getInstance(): ManagementSystem {
    if (!ManagementSystem.instance) {
      ManagementSystem.instance = new ManagementSystem();
    }

    return ManagementSystem.instance;
  }

  public setSharedProps(sharedProps: ShareProps): void {
    this.sharedProps = sharedProps;
  }

  public getSharedProps(): ShareProps | null {
    return this.sharedProps;
  }

  public manageUsers(): ManagementSystem {
    // Implement your logic here for user management
    console.log("User management functionality enabled");

    // Additional logic...

    return this;
  }

  public manageProjects(): ManagementSystem {
    // Implement your logic here for project management
    console.log("Project management functionality enabled");

    // Additional logic...

    return this;
  }

  public manageTasks(newTask: Task): ManagementSystem {
    // Implement your logic here for task management
    console.log("Task management functionality enabled");

    // Ensure sharedProps is defined before accessing its properties
    if (this.sharedProps) {
      const projectId = this.sharedProps.projectId;
      const title = this.sharedProps.title;

      // For example, add a new task to the current project
      this.config.dappProps.currentProject.tasks.push(newTask);

      // Additional logic...
    } else {
      console.error("SharedProps is not set. Cannot manage tasks.");
    }

    return this;
  }

  // Additional methods can be added as needed

  private config: {
    // Define the configuration properties needed for the management system
    dappProps: {
      currentProject: {
        tasks: Task[];
        // Add other properties as needed
      };
      // Add other properties as needed
    };
    // Add other properties as needed
  } = {
    dappProps: {
      currentProject: {
        tasks: [],
      },
    },
  };
}

// Usage example:

const managementSystem = ManagementSystem.getInstance();
// Assume sharedProps are set before this usage
const sharedProps = managementSystem.getSharedProps(); // Get sharedProps
if (sharedProps) {
  const projectId = sharedProps.projectId;
  const title = sharedProps.title;

  managementSystem.manageUsers().manageProjects().manageTasks(generateNewTask(
    projectId,
    title,
    true,
    0
  ));
} else {
  console.error("SharedProps is not set. Cannot manage tasks.");
}

