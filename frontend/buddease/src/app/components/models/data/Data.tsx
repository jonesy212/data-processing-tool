import { Persona } from "@/app/pages/personas/Persona";
import PersonaTypeEnum from "@/app/pages/personas/PersonaBuilder";
import { ColorPalettes } from "antd/es/theme/interface";
import { Attachment } from "../../documents/Attachment/attachment";
import { FakeData } from "../../intelligence/FakeDataGenerator";
import { CollaborationOptions } from "../../interfaces/options/CollaborationOptions";
import { Phase } from "../../phases/Phase";
import { AnalysisTypeEnum } from "../../projects/DataAnalysisPhase/AnalysisType";
import { DataAnalysisResult } from "../../projects/DataAnalysisPhase/DataAnalysisResult";
import SnapshotStore, { Snapshot } from "../../snapshots/SnapshotStore";
import { CustomComment } from "../../state/redux/slices/BlogSlice";
import { AllStatus, DetailsItem } from "../../state/stores/DetailsListStore";
import Todo from "../../todos/Todo";
import { AllTypes } from "../../typings/PropTypes";
import { Idea } from "../../users/Ideas";
import { User } from "../../users/User";
import UserRoles from "../../users/UserRoles";
import { VideoData } from "../../video/Video";
import CommonDetails, { SupportedData } from "../CommonData";
import { Member } from "../teams/TeamMembers";
import { ProjectPhaseTypeEnum } from "./StatusType";

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
  comments?: (Comment | CustomComment)[] | undefined
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
  text?: string;
  editedAt?: Date;
  editedBy?: string;
  attachments?: Attachment[];
  replies?: Comment[];
  likes?: number;
  watchLater?: boolean;
  highlightColor?: ColorPalettes;
  tags?: string[];
  highlights?: string[];
  // Consolidating commentBy and author into one field
  author?: string | number | readonly string[] | undefined
  upvotes?: number | undefined
  content?: string | undefined;
  pinned?: boolean;
  // Consolidating upvotes into likes if they serve the same purpose
  postId?: string | number;
  data?: Data | undefined;
  // Add other properties as needed
}


interface Data {
  _id?: string;
  id?: string | number | undefined;
  title?: string;
  description?: string | null;
  startDate?: Date;
  endDate?: Date;
  scheduled?: boolean;
  status?: AllStatus;
  

  isActive?: boolean;
  tags?: string[];
  phase?: Phase | null;
  phaseType?: ProjectPhaseTypeEnum;
  then?: (callback: (newData: Snapshot<Data>) => void) => void;
  
  // Properties specific to Todo
  dueDate?: Date | null;
  priority?: AllStatus
  assignee?: User
  collaborators?: string[];
  comments?: (Comment | CustomComment)[] | undefined
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
  
  audioUrl?: string;
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
  // actions?: SnapshotStoreConfig<Snapshot<Data>[]>[];
  snapshots?: SnapshotStore<Snapshot<Data>>[];
  // Incorporating the data structure from YourResponseType
  text?: string;
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
const data: Data = {
  _id: "1",
  id: "data1",
  title: "Sample Data",
  description: "Sample description",
  startDate: new Date(),
  endDate: new Date(),
  scheduled: true,
  status: "Pending",
  isActive: true,
  tags: ["tag1", "tag2"],
  phase: {} as Phase,
  phaseType: ProjectPhaseTypeEnum.Ideation,
  dueDate: new Date(),
  priority: "High",
  assignee: {
    id: "assignee1",
    username: "Assignee Name",
  } as User,
  collaborators: ["collab1", "collab2"],
  comments: [],
  attachments: [],
  subtasks: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: "creator1",
  updatedBy: "updater1",
  analysisResults: [],
  audioUrl: "sample-audio-url",
  videoUrl: "sample-video-url",
  videoThumbnail: "sample-thumbnail-url",
  videoDuration: 60,
  collaborationOptions: [],
  videoData: {
  //   id: "video1",
  //   campaignId: 123,
  //   resolution: "1080p",
  //   size: "100MB",
  //   aspectRatio: "16:9",
  //   language: "en",
  //   subtitles: [],
  //   duration: 60,
  //   codec: "H.264",
  //   frameRate: 30,
  } as VideoData,
  additionalData: {},
  ideas: [],
  members: [],
  leader: {
    id: "leader1",
    username: "Leader Name",
    email: "leader@example.com",
    fullName: "Leader Full Name",
    bio: "Leader Bio",
    userType: "Admin",
    hasQuota: true,
    tier: "0",
    token: "leader-token",
    uploadQuota: 100,
    usedQuota: 50,
    avatarUrl: "avatar-url",
    createdAt: new Date(),
    updatedAt: new Date(),
    isVerified: false,
    isAdmin: false,
    isActive: true,
    profilePicture: null,
    processingTasks: [],
    role: UserRoles.Leader,
    persona: new Persona(PersonaTypeEnum.Default),
  },
  snapshots: [],
};

export type { Data, DataDetails, DataDetailsComponent, DataDetailsProps };

