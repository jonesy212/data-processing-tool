// CommonEvent.ts

import { StatusType } from '@/app/components/models/data/StatusType';
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { BaseData, Data } from "../../models/data/Data";
import { Member } from "../../models/teams/TeamMembers";
import { Tag } from '../../models/tracker/Tag';
import { AnalysisTypeEnum } from '../../projects/DataAnalysisPhase/AnalysisType';
import { Snapshot } from '../../snapshots/LocalStorageSnapshotStore';
import { VideoData } from "../../video/Video";

interface CommonEvent extends Data {
  title: string;

  // Shared date properties
  date: Date;

  // Shared time properties
  startTime?: string;
  endTime?: string;
  tags?: string[] | Tag[];

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
  // Implement the `then` function using the reusable function
  then?: (callback: (newData: Snapshot<Data>) => void) =>  Snapshot<Data> | undefined;
}

// Define the function to implement the `then` functionality
export function implementThen(callback: (newData: Snapshot<Data>) => void): Snapshot<Data> | undefined {
  const snapshot: Snapshot<Data> = {
    id: "someId",
    data: { key: "exampleKey", value: "exampleValue" },
    timestamp: new Date(),
    subscriberId: "someSubscriberId",
    category: "someCategory",
    content: {
      id: "someId",
      title: "someTitle",
      description: "someDescription",
      subscriberId: "someSubscriberId",
      category: "someCategory",
      timestamp: new Date(),
      length: 0,
      data: { key: "exampleKey", value: "exampleValue" },
    },
    store: undefined,
  };
  callback(snapshot);
  return snapshot;
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
    then?: (callback: (newData: Snapshot<Data>) => void) =>  Snapshot<Data> | undefined;
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
        title: '',
        description: '',
        keywords: [],
        authors: [],
        contributors: [],
        publisher: '',
        copyright: '',
        license: '',
        links: [],
        tags: [],
        author: '',
        timestamp: undefined
      },
    },
  
    status: StatusType.Scheduled,
    isActive: false,
    tags: [],
    phase: null,
    // Implement the `then` function using the reusable function
    then: implementThen,
    analysisType: {} as AnalysisTypeEnum.COMPARATIVE,
    analysisResults: [],
    videoData: {} as VideoData,
  };
  
  export default CommonEvent;
  export { commonEvent };
