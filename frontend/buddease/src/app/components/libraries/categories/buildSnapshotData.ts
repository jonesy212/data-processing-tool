import { BaseData } from '@/app/components/models/data/Data';
import { AllCategoryValues } from "@/app/components/models/data/DataStructureCategories";
import { CustomSnapshotData } from "@/app/components/snapshots/SnapshotData";
// Type to represent data structures for various categories
type CategoryData<T> = {
  id: string;
  data: T;
  timestamp?: string | number | Date;
  additionalData?: CustomSnapshotData<T>;
};

// Build snapshot data dynamically based on category and role (developer or non-developer)
const buildSnapshotData = <T extends  BaseData<any>>(context: string, category: AllCategoryValues, userRole: boolean, initialData: Partial<T> = {}): CategoryData<T> => {
  let snapshotData: T;

  // Adjust category structure based on role
  switch (category) {
    case 'assignedNotes':
      snapshotData = userRole
        ? { ...initialData, id: "noteId", content: "Note content", assignedTo: "Developer User" } as T
        : { ...initialData, id: "noteId", content: "General note content", assignedTo: "Non-developer User" } as T;
      break;

    case 'assignedGoals':
      snapshotData = {
        ...initialData,
        id: "goalId",
        goalName: "Example Goal",
        status: "In Progress",
      } as T;
      break;

    case 'assignedBoardItems':
      snapshotData = userRole
        ? { ...initialData, id: "boardItemId", taskName: "Development Task", priority: "High" } as T
        : { ...initialData, id: "boardItemId", taskName: "General Task", priority: "Low" } as T;
      break;

    case 'assignedTodos':
      snapshotData = {
        ...initialData,
        id: "todoId",
        task: "Finish task",
        dueDate: new Date().toISOString(),
      } as T;
      break;

    case 'assignedTeams':
      snapshotData = {
        ...initialData,
        id: "teamId",
        teamName: "Development Team",
        members: ["Member1", "Member2"],
      } as T;
      break;

    // Add more categories as needed
    default:
      snapshotData = { ...initialData, id: "defaultId" } as T;
      break;
  }

  // Return the snapshot data with optional additional data and timestamp
  const additionalData: CustomSnapshotData<T> = {
    timestamp: new Date(),
    value: "Example value",
    orders: [],
  };

  return {
    id: snapshotData.id,
    data: snapshotData,
    timestamp: additionalData.timestamp,
    additionalData,
  };
};

// Example usage:
const context = "project"; // Example context (could be dynamic)
const category: AllCategoryValues = 'assignedNotes'; // Example category
const userRole = true; // Example role (true for developer, false for non-developer)

const snapshot = buildSnapshotData(context, category, userRole);

console.log("Created snapshot:", snapshot);
