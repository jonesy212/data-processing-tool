import { BaseData, Data } from "@/app/components/models/data/Data";
import { FC } from "react";
import { DayOfWeekProps } from "../calendar/DayOfWeek";
import { Month } from "../calendar/Month";
import { Attachment } from "../documents/Attachment/attachment";
import { Content } from "../models/content/AddContent";
import ChecklistItem, { ChecklistItemProps } from "../models/data/ChecklistItem";
import { PriorityStatus, StatusType } from "../models/data/StatusType";
import { Progress } from "../models/tracker/ProgressBar";
import { Tag } from "../models/tracker/Tag";
import { Phase } from "../phases/Phase";
import { AnalysisTypeEnum } from "../projects/DataAnalysisPhase/AnalysisType";
import { DataAnalysisResult } from "../projects/DataAnalysisPhase/DataAnalysisResult";
import { Snapshot } from "../snapshots/LocalStorageSnapshotStore";
import { CustomComment } from "../state/redux/slices/BlogSlice";
import { Idea } from "../users/Ideas";
import { User } from "../users/User";
import { VideoData } from "../video/Video";

export type UserAssignee = Pick<User, 'id' | 'username' | 'firstName' | 'lastName' | 'email' | 'fullName' | 'avatarUrl'>;

export interface Todo extends BaseData {
  _id: string;
  id: string;
  content?: Data | string |  Content | undefined; // Adjust the content property to accept Content type
  done: boolean;
  status?: StatusType;
  priorityStatus?: PriorityStatus | undefined;
  todos: Todo[];
  title: string;
  selectedTodo?: Todo;
  progress?: Progress;
  description: string;
  dueDate: Date | null;
  payload?: any;
  type?: string;
  priority: PriorityStatus | undefined;
  assignedTo: UserAssignee | null;
  assigneeId: string;
  assignee: UserAssignee | null;
  assignedUsers: string[];
  collaborators: string[];
  labels: string[];
  comments?: (Comment | CustomComment)[] | undefined;
  attachments?: Attachment[];
  checklists?: (typeof ChecklistItem)[];
  startDate?: Date;
  elapsedTime?: number;
  timeEstimate?: number;
  timeSpent?: number;
  dependencies?: Todo[];
  recurring?: null | undefined;
  // subtasks?: Todo[];
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
  tags?: string[] | Tag[];


  ideas?: Idea[] 
  videoUrl?: string
  videoThumbnail?: string
  videoDuration?: number 


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
  timestamp: string | Date;
  suggestedDay?: DayOfWeekProps["day"] | null;
  suggestedWeeks?: number[] | null;
  suggestedMonths?: Month[] | null;
  suggestedSeasons?: Season[] | null;
  eventId?: string;
  suggestedStartTime?: string;
  suggestedEndTime?: string;
  suggestedDuration?: string;
  data?: Data | undefined;
  category?: string | undefined;

  // Method to update the order/index
  updateOrder(newOrder: number): void;

  // Method to update UI (could be handled by a React component or service)
  updateUI(): void;
}

export interface TodoManagerState {
  entities: Record<string, Todo>;
}

export const todoInitialState: TodoManagerState = {
  entities: {},
};

class TodoImpl implements Todo{
  _id: string = "";
  id: string = "";
  category?: string = ""
  timestamp: Date = new Date()
  subscriberId: string = ""
  content?: Content;
  status?: StatusType;
  payload?: any;
  type?: string;
  name?: string;
  checklists?: FC<ChecklistItemProps>[];
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
  priorityStatus?: PriorityStatus | undefined;
  text?: string
  todos: Todo[] = [];
  description: string = "";
  dueDate: Date | null = null;
  priority: PriorityStatus | undefined = undefined;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();
  assignedTo: User | null = null;
  assignee: UserAssignee | null = null;
  assigneeId: string = "";
  assignedUsers: string[] = [];
  collaborators: string[] = [];
  labels: string[] = [];
  comments: Comment[] = [];
  attachments: Attachment[] = [];
  subtasks: TodoImpl[] = [];

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
  tags: Tag[] = [];
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
    data: {
      timestamp: new Date(),
      category: "todo",
    },
    content: undefined,
    type: "",
  };
  updateOrder(newOrder: number): void {
    this.order = newOrder;
    // Optionally trigger UI update
    this.updateUI();
  }

  updateUI(): void {
    // Example: Update UI logic (could be React specific)
    // Implement this according to your UI framework
    console.log(`Updating UI for todo with id ${this.id}`);
  }

  data?: Data;


}

export default TodoImpl;
