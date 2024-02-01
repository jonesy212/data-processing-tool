import { Phase } from "../../phases/Phase";
import { Snapshot } from "../../state/stores/SnapshotStore";
import { Attachment, Todo } from "../../todos/Todo";
import { User } from "../../users/User";
import CommonDetails from "../CommonData";

// Define the interface for DataDetails
export interface DataDetails {
  id: string | number;
  title: string;
  description?: string | null;
  startDate?: Date;
  endDate?: Date | null;
  status: "pending" | "inProgress" | "completed";
  isActive: boolean;
  tags: string[];
  // Add other properties as needed
}


// Define the props for the DataDetails component
interface DataDetailsProps {
  data: DataDetails;
}
interface Data {
  _id: string;
  id: string | number;
  title: string;
  description?: string | null; // Updated this line
  startDate?: Date;
  endDate?: Date | null;
  status: "pending" | "inProgress" | "completed";
  isActive: boolean;
  tags: string[];
  phase: Phase | nu
  then: (callback: (newData: Snapshot<Data>) => void) => void;
  // Add other common data properties as needed

  // Properties specific to Todo
  dueDate?: Date | null;
  priority?: "low" | "medium" | "high";
  assignee?: User | null;
  collaborators?: string[];
  comments?: Comment[];
  attachments?: Attachment[];
  subtasks?: Todo[];
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
  isArchived?: boolean;
  isCompleted?: boolean;
  isBeingEdited?: boolean;
  isBeingDeleted?: boolean;
  isBeingCompleted?: boolean;
  isBeingReassigned?: boolean;
  analysisType: string;
  analysisResults: string[];
  collaborationOptions?: CollaborationOption[]; // Or whatever type is appropriate
  videoData: Record<string, any>;
}


// Define the UserDetails component
const DataDetailsComponent: React.FC<DataDetailsProps> = ({ data }) => (
  <CommonDetails data={{ title: 'Data Details', description: 'Data details', data }} />
);


export type { Data };











