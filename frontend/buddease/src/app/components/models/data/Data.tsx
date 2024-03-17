import { ColorPalettes } from "antd/es/theme/interface";
import { FakeData } from "../../Inteigents/FakeDataGenerator";
import { Phase } from "../../phases/Phase";
import { Priority } from "../../state/stores/CalendarEvent";
import { AllStatus, DetailsItem } from "../../state/stores/DetailsListStore";
import { Snapshot } from "../../state/stores/SnapshotStore";
import { Attachment, Todo } from "../../todos/Todo";
import { User } from "../../users/User";
import { VideoData } from "../../video/Video";
import CommonDetails, { SupportedData } from "../CommonData";
import { Idea } from "../tasks/Task";
import { Member } from "../teams/TeamMembers";
import { DataStatus, StatusType, TaskStatus, TeamStatus } from "./StatusType";

// Define the interface for DataDetails
export interface DataDetails {
  id: string;
  title?: string;
  description?: string | null | undefined;
  details?: DetailsItem<SupportedData>;
  startDate?: Date;
  endDate?: Date;
  createdAt?: Date;
  uploadedAt?: Date;
  type?: string;
  tags?: string[];
  isActive?: boolean;
  status?: AllStatus
  
  ; // Use enums for status property
  phase?: Phase | null;
  fakeData?: FakeData;
  comments?: Comment[] | undefined;
  // Add other properties as needed
}

// Define the props for the DataDetails component
interface DataDetailsProps {
  data: DataDetails;
}

interface Comment {
  id: string;
  text: string;
  editedAt?: Date;
  highlightColor?: ColorPalettes;
  tags?: string[];
  highlights?: string[];
  commentBy?: User | Member;
  content?: string | undefined;
  pinned?: boolean;
  watchLater: boolean;
  // Add other properties as needed
}

interface Data {
  _id: string;
  id: string | number;
  title?: string;
  description?: string | null;
  startDate?: Date;
  endDate?: Date;
  scheduled?: boolean;
  status?:AllStatus

  isActive?: boolean;
  tags?: string[];
  phase?: Phase | null;
  then?: (callback: (newData: Snapshot<Data>) => void) => void;
  // Properties specific to Todo
  dueDate?: Date | null;
  priority?: Priority | boolean;
  assignee?: User | null;
  collaborators?: string[];
  comments?: Comment[] | undefined;
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
  videoUrl?: string;
  videoThumbnail?: string;
  videoDuration?: number;
  collaborationOptions?: CollaborationOptions[]; // Or whatever type is appropriate
  videoData: VideoData;
  [key: string]: any;
  ideas?: Idea[];
  members?: Member[];
  // tasks?: Todo[];
  leader?: User | null;
}

// Define the UserDetails component
const DataDetailsComponent: React.FC<DataDetailsProps> = ({ data }) => (
  <CommonDetails
    data={{
      title: "Data Details",
      description: "Data descriptions",
      details: data.details,
    }}
    details={{
      id: data.id as string,
      title: data.title,
      description: data.description,
      phase: data.details?.phase,
      isActive: data.isActive,
      tags: data.tags,
      status: data.status,
      type: data.type,
      // fakeData: data.fakeData,
      // Add other properties as needed
    }}
  />
);

export type { Data, DataDetailsComponent, DataDetailsProps };
