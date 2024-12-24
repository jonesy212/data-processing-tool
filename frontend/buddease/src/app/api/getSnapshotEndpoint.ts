import { BaseData } from '@/app/components/models/data/Data';
import { Snapshot } from "../components/snapshots";
import endpointConfigurations, { EndpointConfig } from "./endpointConfigurations";


type SnapshotCategoryType = "User" | "Todo" | "Task" | "Delegate" | "Highlight" |  "Project" |
    "Note" |
    "Comment";

interface SnapshotCategory<
  T extends  BaseData<any>, 
//   ExcludedFields extends keyof T = never, // Declare ExcludedFields first
  K extends T = T,
// K extends Exclude<keyof T, ExcludedFields> = Exclude<keyof T, ExcludedFields> // Then use it in K
> {
    id: string;
    name: SnapshotCategoryType; // Use the string literal type here
    description?: string;
    snapshots: Snapshot<T, K>[]; 
    
    // snapshots: Snapshot<Omit<T, ExcludedFields>, K, Meta>[]; // This should now be valid
}

// Update your function to accept SnapshotCategoryType
function getSnapshotEndpoint(snapshotCategory: SnapshotCategoryType, snapshotId?: string | number): string | EndpointConfig {
    switch (snapshotCategory) {
        case "User":
            return endpointConfigurations.users.single(Number(snapshotId));
        case "Todo":
            return endpointConfigurations.todos.single(Number(snapshotId));
        case "Task":
            return endpointConfigurations.tasks.single(Number(snapshotId));
        case "Delegate":
            return endpointConfigurations.delegates.single(Number(snapshotId));
        case "Highlight":
            return endpointConfigurations.highlights.getSpecific;
        case "Project":
            return endpointConfigurations.projects.single(Number(snapshotId));
        case "Note":
            return endpointConfigurations.news.single(Number(snapshotId));
        case "Comment":
            return endpointConfigurations.comments.single(Number(snapshotId));
        // Add more cases for new categories
        default:
            throw new Error(`Unknown SnapshotCategory: ${snapshotCategory}`);
    }
}


export type { SnapshotCategory, SnapshotCategoryType };

    export { getSnapshotEndpoint };

