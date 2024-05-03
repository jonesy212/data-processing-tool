import { Data } from "@/app/components/models/data/Data";
import { FC } from "react";
import { Attachment } from "../documents/Attachment/attachment";
import ChecklistItem, {
  ChecklistItemProps,
} from "../models/data/ChecklistItem";
import { PriorityStatus, StatusType } from "../models/data/StatusType";
import { Progress } from "../models/tracker/ProgressBar";
import { Phase } from "../phases/Phase";
import { AnalysisTypeEnum } from "../projects/DataAnalysisPhase/AnalysisType";
import { DataAnalysisResult } from "../projects/DataAnalysisPhase/DataAnalysisResult";
import { Snapshot } from "../snapshots/SnapshotStore";
import { Idea } from "../users/Ideas";
import { User } from "../users/User";
import { VideoData } from "../video/Video";
export interface Todo {
  _id: string;
  id: string;
  done: boolean;
  status?: StatusType;
  todos: Todo[];
  title: string;
  selectedTodo?: Todo;
  progress?: Progress;
  description: string;
  dueDate: Date | null;
  payload?: any;
  type?: string;
  priority: PriorityStatus | undefined;
  assignedTo: User | null;
  assigneeId: string;
  assignee: User | null;
  assignedUsers: string[];
  collaborators: string[];
  labels: string[];
  comments: Comment[];
  attachments?: Attachment[];
  checklists?: (typeof ChecklistItem)[];
  startDate?: Date;
  elapsedTime?: number;
  timeEstimate?: number;
  timeSpent?: number;
  dependencies?: Todo[];
  recurring?: null | undefined;
  subtasks: Todo[];
  entities?: Todo[];
  projectId?: string;
  milestoneId?: string;
  phaseId?: string;
  taskId?: string;
  teamId?: string;
  creatorId?: string;
  order?: number;
  parentId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
  tags?: string[];
  isDeleted?: boolean;
  isArchived?: boolean;
  isCompleted?: boolean;
  isRecurring?: boolean;

  isBeingDeleted?: false;
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
  analysisType?: AnalysisTypeEnum;
  analysisResults?: DataAnalysisResult[];
  videoData?: VideoData;
  
  data?: Data;
}

export interface TodoManagerState {
  entities: Record<string, Todo>;
}

export const todoInitialState: TodoManagerState = {
  entities: {},
};

class TodoImpl implements Todo {
  _id: string = "";
  id: string = "";
  status?: StatusType | undefined;
  payload?: any;
  type?: string | undefined;
  checklists?: FC<ChecklistItemProps>[] | undefined;
  startDate?: Date | undefined;
  elapsedTime?: number | undefined;
  timeEstimate?: number | undefined;
  timeSpent?: number | undefined;
  dependencies?: Todo[] | undefined;
  recurring?: null | undefined;
  projectId?: string | undefined;
  milestoneId?: string | undefined;
  phaseId?: string | undefined;
  taskId?: string | undefined;
  teamId?: string | undefined;
  creatorId?: string | undefined;
  order?: number | undefined;
  parentId?: string | null | undefined;
  title: string = "";
  isActive?: boolean = false;
  done: boolean = false;
  priorityStatus: PriorityStatus | undefined;

  todos: Todo[] = [];
  description: string = "";
  dueDate: Date | null = null;
  priority: PriorityStatus | undefined = undefined;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();
  assignedTo: User | null = null;
  assignee: User | null = null;
  assigneeId: string = "";
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
  analysisResults?: DataAnalysisResult[] = [];
  videoUrl: string = "";
  videoThumbnail: string = "";
  videoDuration: number = 0;
  videoData: VideoData = {} as VideoData;
  save: () => Promise<void> = async () => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log("Saving todo item...");
        resolve();
      }, 1000);
    });
  };
  snapshot: Snapshot<Data> = {
    category: "todo",
    timestamp: new Date(),
    data: {} as Data,
  };

  data?: Data;
}

export default TodoImpl;
