import { ColorPalettes } from "antd/es/theme/interface";
import { FakeData } from "../../Inteigents/FakeDataGenerator";
import { Phase } from "../../phases/Phase";
import { DataAnalysisResult } from "../../projects/DataAnalysisPhase/DataAnalysisResult";
import SnapshotStore, { Snapshot } from "../../snapshots/SnapshotStore";
import { CustomComment } from "../../state/redux/slices/BlogSlice";
import { AllStatus, DetailsItem } from "../../state/stores/DetailsListStore";
import Todo from "../../todos/Todo";
import { AllTypes } from "../../typings/PropTypes";
import { User } from "../../users/User";
import { VideoData } from "../../video/Video";
import CommonDetails, { SupportedData } from "../CommonData";
import { Idea } from "../tasks/Task";
import { Member } from "../teams/TeamMembers";
import { Attachment } from "../../documents/Attachment/attachment";

// Define the interface for DataDetails
interface DataDetails {
  _id?: string;
  id: string;
  title?: string;
  description?: string | null | undefined;
  details?: DetailsItem<SupportedData>;
  startDate?: Date;
  endDate?: Date;
  createdAt?: Date;
  uploadedAt?: Date;
  type?: AllTypes;
  tags?: string[];
  isActive?: boolean;
  status?: AllStatus;
  
  // Use enums for status property
  phase?: Phase | null;
  fakeData?: FakeData;
  comments?: (Comment | CustomComment)[];
  todos?: Todo[];
  analysisData?: {
    snapshots?: SnapshotStore<Snapshot<Data>>[];
    analysisResults?: DataAnalysisResult[]
  }
  data?: Data
  analysisType?: AnalysisTypeEnum
  analysisResults?: DataAnalysisResult[]
  todo?: Todo
  // Add other properties as needed
}

// Define the props for the DataDetails component
interface DataDetailsProps {
  data: DataDetails;
}

export interface Comment {
  id: string;
  text: string;
  editedAt?: Date;
  editedBy?: string;
  attachments?: Attachment[];
  replies?: Comment[];
  likes?: User[];
  watchLater?: boolean;
  highlightColor?: ColorPalettes;
  tags?: string[];
  highlights?: string[];
  commentBy?: User | Member;
  content?: string | undefined;
  pinned?: boolean;
  postId?: string | number; // Added postId field to match the other Comment interface
  author?: string; // Added author field to match the other Comment interface
  upvotes?: number; // Added upvotes field to match the other Comment interface
  data: string
  // Add other properties as needed
}

interface Data {
  _id?: string;
  id: string | number;
  title?: string;
  description?: string | null;
  startDate?: Date;
  endDate?: Date;
  scheduled?: boolean;
  status?: AllStatus

  isActive?: boolean;
  tags?: string[];
  phase?: Phase | null;
  then?: (callback: (newData: Snapshot<Data>) => void) => void;
  // Properties specific to Todo
  dueDate?: Date | null;
  priority?: AllStatus
  assignee?: User | null;
  collaborators?: string[];
  comments?: (Comment | CustomComment)[];
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
  analysisType?: AnalysisTypeEnum;
  analysisResults?: DataAnalysisResult[];
  
  videoUrl?: string;
  videoThumbnail?: string;
  videoDuration?: number;
  collaborationOptions?: CollaborationOptions[]; // Or whatever type is appropriate
  videoData?: VideoData;
  additionalData?: any;
  [key: string]: any;
  ideas?: Idea[];
  members?: Member[];
  // tasks?: Todo[];
  leader?: User | null;
  snapshots?: SnapshotStore<Snapshot<Data>>[];
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
      _id: data._id,
      id: data.id as string,
      title: data.title,
      description: data.description,
      phase: data.details?.phase,
      isActive: data.isActive,
      tags: data.tags,
      status: data.status,
      type: data.type,
      analysisType: data.analysisType,
      analysisResults: data.analysisResults,
      // fakeData: data.fakeData,
      // Add other properties as needed
    }}
  />
);

export type { Data, DataDetails, DataDetailsComponent, DataDetailsProps };

