// CommonEvent.ts

import { StatusType } from '@/app/components/models/data/StatusType';
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { BaseData, Data } from "../../models/data/Data";
import { Member } from "../../models/teams/TeamMembers";
import { Tag } from '../../models/tracker/Tag';
import { AnalysisTypeEnum } from '../../projects/DataAnalysisPhase/AnalysisType';
import { Snapshot, Snapshots } from '../../snapshots/LocalStorageSnapshotStore';
import { VideoData } from "../../video/Video";
import { SnapshotWithCriteria } from '../../snapshots/SnapshotWithCriteria';
import { Type } from 'docx';
import { Callback } from '../../snapshots/subscribeToSnapshotsImplementation';
import { SnapshotData } from '../../snapshots/SnapshotStore';
import { Subscriber } from '../../users/Subscriber';

interface CommonEvent extends Data {
  title: string;

  // Shared date properties
  date: Date | undefined;

  // Shared time properties
  startTime?: string;
  endTime?: string;
  tags?:  string[] | Tag[]

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
  then?: <T extends Data, K extends Data>(callback: (newData: Snapshot<BaseData, K>) => void) => Snapshot<Data, K> | undefined;
}

// Define the function to implement the `then` functionality
export function implementThen<T extends BaseData, K extends BaseData>(
  callback: (newData: Snapshot<T, K>) => void
): Snapshot<T, K> | undefined {
  const snapshot: Snapshot<T, K> = {
    id: "someId",
    data: new Map([
      ["someId", {
        id: "someId",
        title: "someTitle",
        description: "someDescription",
        timestamp: new Date(),
        length: 0,
        data: {} as T,
        events: undefined,
        meta: undefined
      } as Snapshot<T, K>]
    ]),
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
      data: {} as T,
    },
    store: undefined,
    events: undefined,
    meta: undefined,
    getSnapshotId: function (key: Snapshot<T, K> | SnapshotData<T, K>): unknown {
      // fetch snapshot id then check if there is a snapshot Id
      const snapshotId = key as Snapshot<T, K>;
      if (snapshotId) {
        return snapshotId;
      }
      
      return snapshotId;
    },
    compareSnapshotState: function (arg0: Snapshot<T, K> | null, state: any): unknown {
      const snapshot = arg0 as Snapshot<T, K>;
      if (snapshot) {
        return snapshot.state;
      }
      return state;
    },
    eventRecords: null,
    snapshotStore: null,
      dataItems: null,
      newData: undefined,
      stores: null,
      unsubscribe: function (callback: Callback<Snapshot<T, K>> | null): void {
        // Remove reference to callback
        let callbackRef = callback;
        callbackRef = null;
        // Remove reference to callback
        callback = null;
        
      },

      fetchSnapshot: function (
        callback: (
          snapshotId: string,
          snapshot: Snapshot<T, K> | undefined
        ) => void
      ): string | undefined {
        if (callback) {
          callback("someId", undefined);
        }
        return;
      },
      
    handleSnapshot: function (
      snapshotId: string,
      snapshot: Snapshot<T, K> | null,
      snapshots: Snapshots<T>,
      type: string,
      event: Event,
    ): void {
     
      const snapshotInstance = snapshot as Snapshot<T, K>;
      if (snapshotInstance) {
        snapshotInstance.state = snapshots;
        snapshotInstance.event = event;
        snapshotInstance.type = type;
      }
      return;
    },
    subscribe: function (
      arg0: Subscriber<T, K> | null,
      arg1: T,
      arg2: Event,
      callback: Callback<Snapshot<T, K>> ,
      value: T,
    ): void {
      const subscriber = arg0 as Subscriber<T, K>;
      if (subscriber) {
        subscriber.getState(arg1)
        subscriber.setEvent(arg2, value);
      }

      callback(snapshot);
    }
  };
  callback(snapshot);
  return snapshot;
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
  then: <T extends Data, K extends Data>(
    callback: (newData: Snapshot<Data, K>) => void) => implementThen(callback),
  analysisType: {} as AnalysisTypeEnum.COMPARATIVE,
  analysisResults: [],
  videoData: {} as VideoData,
};

export default CommonEvent;
export { commonEvent };
