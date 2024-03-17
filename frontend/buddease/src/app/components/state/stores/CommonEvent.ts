// CommonEvent.ts

import { StatusType } from '@/app/components/models/data/StatusType';
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { Data } from "../../models/data/Data";
import { Member } from "../../models/teams/TeamMembers";
import { VideoData } from "../../video/Video";
import { Snapshot } from "./SnapshotStore";

interface CommonEvent extends Data {
  title: string;

  // Shared date properties
  date: Date;

  // Shared time properties
  startTime?: string;
  endTime?: string;

  // Recurrence properties
  recurring?: boolean;
  recurrenceRule?: string;

  // Other common properties
  category?: string;
  timezone?: string;
  participants: Member[];
  language?: string;
  agenda?: string;
  collaborationTool?: string;
  metadata?: StructuredMetadata;
}

// Define the function to implement the `then` functionality
export function implementThen(callback: (newData: Snapshot<Data>) => void): Snapshot<Data> {
    return {
      timestamp: new Date(),
      data: {
        _id: "",
        id: "",
        title: "",
        isActive: true,
        status: StatusType.Scheduled,
        isCompleted: false,
        tags: [],
        phase: null,
        then: implementThen, // Reuse the `then` function
        analysisType: "",
        analysisResults: [],
        videoData: {} as VideoData,
      },
    };
  }
  
  // Define the `CommonEvent` interface
  interface CommonEvent extends Data {
    title: string;
    date: Date;
    startTime?: string;
    endTime?: string;
    recurring?: boolean;
    recurrenceRule?: string;
    category?: string;
    timezone?: string;
    participants: Member[];
    language?: string;
    agenda?: string;
    collaborationTool?: string;
    metadata?: StructuredMetadata;
    // Implement the `then` function using the reusable function
    then: (callback: (newData: Snapshot<Data>) => void) => void;
  }
  
  // Define the `commonEvent` object using the `CommonEvent` interface
  const commonEvent: CommonEvent = {
    _id: "",
    id: "",
    title: "",
    date: new Date(),
    startTime: "",
    endTime: "",
    recurring: false,
    recurrenceRule: "",
    category: "",
    timezone: "",
    participants: [],
    language: "",
    agenda: "",
    collaborationTool: "",
    metadata: {
      structuredMetadata: {
        originalPath: "originalPath",
        fileType: "fileType",
        alternatePaths: [],
      },
    },
  
    status: StatusType.Scheduled,
    isActive: false,
    tags: [],
    phase: null,
    // Implement the `then` function using the reusable function
    then: function (callback: (newData: Snapshot<Data>) => void): void {
      const newData = implementThen.bind(this)(callback);
      callback(newData);
    },
    analysisType: "",
    analysisResults: [],
    videoData: {} as VideoData,
  };
  
  export default CommonEvent;
  export { commonEvent };
  
