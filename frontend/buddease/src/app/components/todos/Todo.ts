import { Data } from '@/app/components/models/data/Data';
import { PriorityStatus } from '../models/data/StatusType';
import { Idea } from '../models/tasks/Task';
import { Phase } from "../phases/Phase";
import { DataAnalysisResult } from '../projects/DataAnalysisPhase/DataAnalysisResult';
import { Snapshot } from "../snapshots/SnapshotStore";
import { User } from "../users/User";
import { VideoData } from '../video/Video';




export interface Todo {
  id: string;
  done: boolean;
  status?: PriorityStatus;
  todos: Todo[];
  title: string;
  description: string;
  dueDate: Date | null;
  priority: PriorityStatus | undefined
  assignedTo: User | null;
  assignee: User | null;
  assignedUsers: string[];
  collaborators: string[];
  labels: string[];
  comments: Comment[];
  attachments?: Attachment[];
  subtasks: Todo[];
  entities?: Todo[];

  isActive?: boolean;
  isDeleted?: boolean;
  isArchived?: boolean;
  isCompleted?: boolean;
  isRecurring?: boolean;

  isBeingEdited?: boolean;
  isBeingCompleted?: boolean;
  isBeingReassigned?: boolean;

  recurringRule?: string;
  recurringEndDate?: Date;
  recurringFrequency?: string;
  recurringCount?: number;
  recurringDaysOfWeek?: number[];
  recurringDaysOfMonth?: number[];
  recurringMonthsOfYear?: number[];

  save: () => Promise<void>;
  snapshot: Snapshot<Data>;
  data?: Data;
}


export interface Attachment extends Data {
  url: string;
  name: string;
  fileType: FileType;
  size: number;
  isImage?: boolean;
  metadata?: Record<string, any>;
}

export type FileType = "image" | "document" | "link" | "audio" | "video" | "other";

export interface TodoManagerState {
  entities: Record<string, Todo>;
}

export const todoInitialState: TodoManagerState = {
  entities: {},
};

class TodoImpl implements Todo {
  _id: string = "";
  id: string = "";
  title: string = "";
  isActive?: boolean = false;
  done: boolean = false;
  priorityStatus: PriorityStatus | undefined;

  todos: Todo[] = [];
  description: string = "";
  dueDate: Date | null = null;
  priority: PriorityStatus | undefined = undefined
  assignedTo: User | null = null;
  assignee: User | null = null;
  assignedUsers: string[] = [];
  collaborators: string[] = [];
  labels: string[] = [];
  comments: Comment[] = [];
  attachments: Attachment[] = [];
  subtasks: Todo[] = [];
  entities: Todo[] = [];

  isDeleted: boolean = false;
  isArchived: boolean = false;
  isCompleted: boolean = false;
  isRecurring: boolean = false;

  isBeingEdited: boolean = false;
  isBeingCompleted: boolean = false;
  isBeingReassigned: boolean = false;

  recurringRule: string = "";
  recurringEndDate: Date = new Date();
  recurringFrequency: string = "";
  recurringCount: number = 0;
  recurringDaysOfWeek: number[] = [];
  recurringDaysOfMonth: number[] = [];
  recurringMonthsOfYear: number[] = [];

  ideas: Idea[] = [];
  tags: string[] = [];
  phase: Phase | null = null;
  then: (callback: (newData: Snapshot<Data>) => void) => void = () => {};
  analysisType: AnalysisTypeEnum = AnalysisTypeEnum.TODO as AnalysisTypeEnum;
  analysisResults: DataAnalysisResult[] = [];
  videoUrl: string = "";
  videoThumbnail: string = "";
  videoDuration: number = 0;
  videoData: VideoData = {} as VideoData
  save: () => Promise<void> = async () => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log("Saving todo item...");
        resolve();
      }, 1000);
    });
  };
  snapshot: Snapshot<Data> = {
    timestamp: new Date,
    data: {} as Data,
  }; 

  data?: Data;
}

export default TodoImpl;
