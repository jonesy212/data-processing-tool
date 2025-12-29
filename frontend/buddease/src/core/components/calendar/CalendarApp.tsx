// CalendarApp.tsx
"use client";

import * as snapshotApi from '@/api/SnapshotApi';
import { default as findSnapshotStoresById, default as snapshotContainer } from '@/core/api/SnapshotApi';
import { CalendarEvent } from '@/core/calendar/CalendarEvent';
import CalendarDetails from "@/core/components/models/data/CalendarDetails";
import { CommonDetails } from "@/core/components/models/details/CommonDetails";
import { Team, TeamDetails } from "@/core/components/teams/Team";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { createMeta } from "@/core/config/metadata/createMeta";
import { StructuredMetadata } from "@/core/config/StructuredMetadata";
import { useMetadata } from "@/core/config/useMetadata";
import { Attachment } from '@/core/documents/attachment/Attachment';
import { DocumentOptions } from "@/core/documents/DocumentOptions";
import { useSnapshotManager } from "@/core/hooks/useSnapshotManager";
import { Category } from "@/core/libraries/categories/generateCategoryProperties";
import { CommonData } from "@/core/models/CommonData";
import { BaseData, Data, DataDetails, DataDetailsComponent } from '@/core/models/data/Data';
import { CalendarStatus, MeetingStatus, StatusType } from "@/core/models/data/StatusType";
import { Member } from "@/core/models/members/Member";
import { Project, ProjectType } from "@/core/models/projects/Project";
import { TeamMember } from '@/core/models/teams/TeamMembers';
import UserRoles from '@/core/models/UserRoles';
import { CategoryProperties } from "@/core/pages/personas/ScenarioBuilder";
import { CriteriaType } from "@/core/pages/searches/CriteriaType";
import AnalyzeData from "@/core/projects/DataAnalysisPhase/AnalyzeData/AnalyzeData";
import { DataAnalysisResult } from "@/core/projects/DataAnalysisPhase/DataAnalysisResult";
import {
    snapshotFunction,
    SnapshotsArray,
    SnapshotsObject,
    SnapshotUnion
} from "@/core/snapshots/LocalStorageSnapshotStore";
import { refreshUI } from '@/core/snapshots/refreshUI';
import {
    Snapshot
} from "@/core/snapshots/Snapshot";
import { SnapshotContainer } from '@/core/snapshots/SnapshotContainer';
import { CustomSnapshotData, SnapshotData } from '@/core/snapshots/SnapshotData';
import {
    default as SnapshotStore,
    default as useSnapshotStore,
} from "@/core/snapshots/SnapshotStore";
import { SnapshotStoreConfig } from "@/core/snapshots/SnapshotStoreConfig";
import { SnapshotStoreProps } from '@/core/snapshots/SnapshotStoreProps';
import { SnapshotWithCriteria } from '@/core/snapshots/SnapshotWithCriteria';
import {
    DataStore,
    useDataStore,
} from "@/core/state/stores/DataStore";
import { DetailsItem } from "@/core/state/stores/DetailsListStore";
import { Todo } from "@/core/todos/Todo";
import { AnalysisTypeEnum } from "@/core/typings/AnalysisType";
import { AppUnifiedMetadata } from "@/core/typings/entities/AppMetadataEntity";
import { snapshotType } from "@/core/typings/YourSpecificSnapshotType";
import { addToSnapshotList, castToSnapshot, isSnapshotContainer } from '@/utils/snapshotUtils';
import { processSnapshotData } from '@/utils/versionUtils';
import { useEffect, useState } from "react";


// Define SnapshotWithData to include only essential properties and methods
interface SnapshotWithData<
  T extends BaseDataEntity, 
  K extends T, 
  Meta extends DefaultMeta<T, K>, 
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> | null; // Assuming this holds snapshot data
  events: {
    // Define the events object structure based on your needs
    eventRecords?: any; // Adjust type according to actual event record type
    eventIds?: string[];
    onSnapshotAdded?: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
    onSnapshotRemoved?: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
    onSnapshotUpdated?: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
    // Other event handlers...
  };
  meta?: T; // Metadata associated with the snapshot
}


const { fetchData } = useDataStore();


const assignProject = (team: Team, project: Project) => {
  // Implement the logic to assign a project to the team
  team.projects.push(project);
};

const reassignProject = (
  team: Team,
  project: Project,
  previousTeam: Team,
  reassignmentDate: Date
) => {
  // Implement the logic to reassign a project to the team from a previous team
  previousTeam.projects = previousTeam.projects.filter(
    (proj) => proj.id !== project.id
  );
  team.projects.push(project);
};

const updateProgress = (team: Team) => {
  // Implement the logic to update the team's progress
  const totalProjects = team.projects.length;
  const completedProjects = team.projects.filter(
    (project) => project.status === "completed"
  ).length;

  // Calculate progress percentage
  const progressPercentage =
    totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;

  // Update team's progress with Progress type
  team.progress = {
    id: team.progress?.id ?? "",
    current: progressPercentage,
    name: team.progress?.name ?? "",
    color: team.progress?.color ?? "",
    max: 100,
    min: 0,
    label: `${progressPercentage}%`,
    percentage: team.percentage,
    value: team.progress?.value ?? 0,
    description: team.progress?.description ?? "",
    done: team.progress?.done ?? false,
  };
};

const unassignProject = (team: Team, project: Project) => {
  // Implement the logic to unassign a project from the team
  team.projects = team.projects.filter((proj) => proj.id !== project.id);
};


const handleMeetingStatusChange = (
  meeting: CalendarDetails,
  newStatus: MeetingStatus
) => {
  // Implement the logic to update the meeting's status
  meeting.status = newStatus;
};


const analysisType = (project: Project) => {
  if (project.type === "data") {
    return <AnalyzeData projectId={project.id} />;
  } else {
    return (
      <div>
        <h1>Project Type</h1>
        <p>Project Type: {project.type}</p>
      </div>
    );
  }
};



export const addSnapshotHandler = <
  T extends BaseDataEntity, 
  K extends T, 
  Meta extends DefaultMeta<T, K>, 
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  subscribers: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
  delegate: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
  typeGuard: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => snapshot is Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
) => {
  if (delegate && delegate.length > 0) {
    delegate.forEach((config) => {
      if (typeof config.setSnapshots === "function") {
        // Ensure config.snapshots is treated as an array
        const currentSnapshotsArray: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = Array.isArray(config.snapshots)
          ? (config.snapshots as SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>)
          : [];

        // Use type guard to ensure compatibility
        if (typeGuard(snapshot)) {
          config.setSnapshots([...currentSnapshotsArray, snapshot]);
        } else {
          console.error("Snapshot does not match the expected type", snapshot);
        }
      }
    });
  } else {
    console.error("Delegate array is empty or not provided");
  }
};


// First define the interface for your props with generics

// 1. First define a prop interface with generics
interface CalendarAppProps<
  T extends BaseDataEntity, 
  K extends T, 
  Meta extends DefaultMeta<T, K>, 
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  props: SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  // Add other props as needed
}

// 2. Create the component using direct function syntax
function CalendarApp<
  T extends BaseDataEntity, 
  K extends T, 
  Meta extends DefaultMeta<T, K>, 
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>({ props }: CalendarAppProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): JSX.Element {
  
  const [snapshot, setSnapshot] = useState<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>(null);
  const [criteria, setCriteria] = useState<CriteriaType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);


  const currentMeta: StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = createMeta<T, K>({
    id: 'calendar-meta-id',   // Updated ID for calendar context
    description: 'Calendar Meta', // More relevant description
  });
  // Updated area for calendar
  const currentMetadata: AppUnifiedMetadata = useMetadata('calendar-area');

   // Destructure the required properties from props
   const {
    options,
    config,
    operation,
     // ... other props you might need
  } = props;


  const defaultSnapshot: SnapshotWithData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
    data: new Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(), // Initialize with empty map
    events: {}, // Initialize with empty object or suitable default
    meta: {} as T // Initialize with default or empty Data
  };
  const [snapshots, setSnapshots] = useState<SnapshotWithData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>([
    defaultSnapshot, // Add default snapshot to the array
  ]);
  // Default empty snapshot with the required properties
  
  const storage = window.localStorage; // or wherever your storage is defined
  



  const category: CategoryProperties = {
    id: "",
    name: "",
    description: "category description",
    icon: "category_png",
    color: "categorized_color",
    iconColor: "",
    type: "",
    chartType: "", 
    dataProperties: [], 
    formFields: [],
    isActive: false,
    isPublic: false,
    isSystem: false,
    isDefault: false,
    isHidden: false,
    isHiddenInList: false,
    UserInterface: [],
    DataVisualization: [],
    Forms: undefined,
    Analysis: [],
    Communication: [],
    TaskManagement: [],
    Crypto: [],
    brandName: "",
    brandLogo: "",
    brandColor: "",
    brandMessage: "",
  };
  const date = new Date();
  const type = snapshotType.toString();
  const initialState:
    | SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    | null
    | undefined = null;
  const snapshotConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = [];
  const delegate: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = [];
  const dataStoreMethods: DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
    id: "",
    data: undefined,
    storage: undefined,
    metadata: undefined,
    dataStoreConfig: undefined,
    addData: (data: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {},
    updateData: (id: number, newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {},
    removeData: (id: number) => {},
    updateDataTitle: (id: number, title: string) => {},
    updateDataDescription: (id: number, description: string) => {},
    addDataStatus: (id: number, status: StatusType | undefined) => {},
    updateDataStatus: (id: number, status: StatusType | undefined) => {},
    addDataSuccess: (payload: { data: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] }) => {},
    getDataVersions: async (id: number) => {
      // Implement logic to fetch data versions from a data source
      return undefined;
    },
    updateDataVersions: (id: number, versions: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) =>
      Promise.resolve(),
    getBackendVersion: () => Promise.resolve(""),
    getFrontendVersion: () => Promise.resolve(""),
    fetchData: (id: number) => Promise.resolve({} as SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>),
    getItem: (key:  T, id: number): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined> => {
      return new Promise((resolve, reject) => {
        if (storage) {
          const keyString = String(key);
          const item = storage.getItem(keyString);
          if (item) {
            try {
              const parsedItem = JSON.parse(item) as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
              resolve(parsedItem);
            } catch (error: any) {
              reject(new Error(`Failed to parse item: ${error.message}`));
            }
          } else {
            resolve(undefined);
          }
        } else {
          reject(new Error("Storage is not defined"));
        }
      });
    },

    setItem: (id: string, item: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (storage) {
          try {
            storage.setItem(id, JSON.stringify(item));
            resolve();
          } catch (error: any) {
            reject(new Error(`Failed to set item: ${error.message}`));
          }
        } else {
          reject(new Error("Storage is not defined"));
        }
      });
    },

    removeItem: async (key: string): Promise<void> => {
      if (storage) {
        storage.removeItem(key);
      } else {
        throw new Error("Storage is not defined");
      }
    },

    getAllKeys: async (): Promise<string[]> => {
      const keys: string[] = [];

      if (storage) {
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (key) {
            keys.push(key);
          }
        }
      } else {
        throw new Error("Storage is not defined");
      }
      return keys;
    },

    getAllItems: async function(
      storeId: number,
      snapshotId: string,
      categoryProperties: CategoryProperties | undefined,
      snapshot: SnapshotUnion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
      timestamp: string | number | Date | undefined,
      type: string,
      event: Event,
      id: number,
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      data: T,
      category?: Category
    ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
      try {
        const keys = await this.getAllKeys(
          storeId,
          snapshotId,
          categoryProperties,
          castToSnapshot(snapshot),
          timestamp,
          type,
          event,
          id,
          snapshotStore,
          data,
          category
        );

        if (!keys) {
          return [];  // Handle the case where keys are undefined
        }
      
        // Map over keys to retrieve items
        // const keyString = String(key)
        const items: (Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined)[] = await Promise.all(
          keys.map((key: string, index: number) => this.getItem(this.convertKeyToT(key), index))
        );

        const filteredItems = items.filter(
          (item): item is Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => item !== undefined
        );
        return filteredItems;
      } catch (error: any) {
        throw new Error(`Failed to get all items: ${error.message}`);
      }
    },

    // Convert a string key to an object of type T
    convertKeyToT: (key: string): T => {
      const parts = key.split('-'); // Example: '1-John'
  
      // Build a basic object with the expected properties
      const obj: Partial<BaseData> = {
        id: parseInt(parts[0], 10),
        title: parts[1], 
        // Add other properties as needed, possibly as undefined
      };
    
      return obj as unknown as T; // First to unknown, then to T    
    },

    // Define the mapSnapshot function
    mapSnapshot: function (
      id: number,
      storeId: string | number,
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshotId: string,
      snapshotContainer: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      criteria: CriteriaType,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      type: string,
      event: Event,
    ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null | undefined> {
      return new Promise(async (resolve, reject) => {
        try {
          // Ensure getSnapshotStore is correctly used
          const snapshotStoreFromFunction = await snapshotApi.getSnapshotStore(snapshotId,
            snapshotContainer,
            storeId,
            criteria,
            snapshotFunction
          );

          if (!snapshotStoreFromFunction) {
            return reject(new Error("Snapshot store not found"));
          }

          // Call getSnapshot with an appropriate function
          const fetchedSnapshot = await snapshotStoreFromFunction.getSnapshot(async (id: string | number) => {
            // This is your actual logic to retrieve snapshot data by id
            const snapshotData = await snapshotApi.fetchSnapshotById(id);

            if (snapshotData && isSnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(snapshotData)) {
              return {
                snapshotId: parseInt(id.toString(), 10),
                snapshotData,
                category: snapshotData.category,
                categoryProperties: snapshotData.categoryProperties,
                dataStoreMethods: snapshotStoreFromFunction,
                timestamp: new Date(),
                data: snapshotData.data,
              };
            }
            return undefined;
          });

          if (!fetchedSnapshot) {
            return reject(new Error("Snapshot not found"));
          }

          // Continue with the mapped snapshot if fetched successfully
          const mappedSnapshot = await this.mapSnapshot(
            id,
            storeId,
            snapshotStoreFromFunction,
            snapshotId,
            snapshotContainer,
            criteria,
            fetchedSnapshot,
            type,
            event
          );

          resolve(mappedSnapshot);
          
        } catch (error: any) {
          reject(new Error(`Failed to map snapshot: ${error.message}`));
        }
      });
    },

    mapSnapshots: async function (
      storeIds: number[],
      snapshotId: string,
      categoryProperties: CategoryProperties | undefined,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      timestamp: string | number | Date | undefined,
      type: string,
      event: Event,
      id: number,
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      data: K,
      callback: (
        storeIds: number[],
        snapshotId: string,
        categoryProperties: CategoryProperties | undefined,
        snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        timestamp: string | number | Date | undefined,
        type: string,
        event: Event,
        id: number,
        snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        data: K,
        index: number,
        category?: Category,
      ) => SnapshotsObject<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      category?: Category,
    ): Promise<SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
      // Initialize an array to store results from callback executions
      const result: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = [];
    
      // Loop through each storeId and execute the callback
      for (let i = 0; i < storeIds.length; i++) {
        const storeId = storeIds[i];
    
        // Call the provided callback function for each item
        const snapshotObject = callback(
          storeIds,
          snapshotId,
          category,
          categoryProperties,
          snapshot,
          timestamp,
          type,
          event,
          id,
          snapshotStore,
          data,
          i
         // Pass the index of the current item in storeIds
        );
    
        // Convert snapshotObject to an array if needed and accumulate results
        const snapshotArray = Object.values(snapshotObject);
        result.push(...snapshotArray);
      }
    
      // Return the accumulated results as a resolved Promise
      return Promise.resolve(result);
    },
    
    mapSnapshotStore: function (
      storeId: number,
      snapshotId: string,
      categoryProperties: CategoryProperties | undefined,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      timestamp: string | number | Date | undefined,
      type: string,
      event: Event,
      id: number,
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      data: any,
      category?: Category,
    ): Promise<SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined> {
      throw new Error("Function not implemented.");
    },

    getData: async (
      input: number | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | Snapshot<T, CustomSnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
    ): Promise<{ data: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> } | SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined> => {
      try {
        if (typeof input === 'number') {
          // Fetch SnapshotStore array based on the ID using `findSnapshotStoresById`
          const stores = await findSnapshotStoresById(input);
          return stores ? stores : undefined;
        } else {
          // Process snapshot data if `input` is of type `Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>` or `Snapshot<T, CustomSnapshotData>`
          const snapshotData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = processSnapshotData(input);
          return { data: snapshotData };
        }
      } catch (error: any) {
        throw new Error(`Failed to get data: ${error.message}`);
      }
    },
    
    getStoreData: function (id: number): Promise<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
      throw new Error("Function not implemented.");
    },
    updateStoreData: function (
      data: Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      id: number,
      newData: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ): void {
      throw new Error("Function not implemented.");
    },
    getDelegate: function (context: {
      useSimulatedDataSource: boolean;
      simulatedDataSource: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
    }): Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
      throw new Error("Function not implemented.");
    },
    updateDelegate: function (
      config: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
    ): Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
      throw new Error("Function not implemented.");
    },
    getSnapshot: function (
      snapshot: (id: string) =>
        | Promise<{
          snapshotId: number;
          snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
          category?: Category;
          categoryProperties: CategoryProperties;
          dataStoreMethods: DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
          timestamp: string | number | Date | undefined;
          id: string | number | undefined;
          snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
          snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
          data: T;
          }>
        | undefined
    ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined> {
      throw new Error("Function not implemented.");
    },
    getSnapshotWithCriteria: function (
      timestamp: any,
      id: number,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      data: T,
      category?: Category,
    ): Promise<SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined> {
      throw new Error("Function not implemented.");
    },
    getSnapshotContainer: function (
      category: string,
      timestamp: string,
      id: number,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      data: Data<T>,
      snapshotsArray: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshotsObject: SnapshotsObject<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ): Promise<SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined> {
      throw new Error("Function not implemented.");
    },
    getSnapshotVersions: function (
      timestamp: any,
      id: number,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      data: T,
      category?: Category
    ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined> {
      throw new Error("Function not implemented.");
    },
    getSnapshotWithCriteriaVersions: function (
      timestamp: any,
      id: number,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      data: T,
      category?: Category   
    ): Promise<SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined> {
      throw new Error("Function not implemented.");
    },
  };



  useEffect(() => {
    const fetchCriteria = async () => {
      try {
        setIsLoading(true);
        const result = await snapshotApi.getSnapshotCriteria(
          snapshotContainer as unknown as SnapshotContainer<Data<BaseData<any>>, Data<BaseData<any>>>, 
          snapshot
        );
        setCriteria(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchCriteria();
  }, [snapshotContainer, snapshot]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const snapshotId = snapshotApi.getSnapshotId(criteria).toString();
  const storeId = snapshotApi.getSnapshotStoreId(snapshotId);


  const { addSnapshot, updateSnapshot, removeSnapshot, clearSnapshots, } =  new useSnapshotStore(addToSnapshotList);

  const snapshotManager = useSnapshotManager<Todo<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(storeId, storeProps); // Initialize the snapshot manager

  // Define the CalendarEvent object
  const calendarEvent: CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
    id: "1",
    title: "Meeting",
    description: "Discuss project plans",
    startDate: new Date(),
    endDate: new Date(),
    location: "Office",
    attendees: [],
    reminder: "15 minutes before",
    reminderOptions: {
      recurring: true,
      frequency: "weekly",
      interval: 1,
    },
    date: new Date(),
    isActive: false,
    category: "",
    shared: undefined,
    details: {} as DetailsItem<T>,
    bulkEdit: false,
    recurring: false,
    customEventNotifications: "customNotifications",
    comment: "comment",
    attachment: "attachment",
    content: "",
    topics: [],
    highlights: [],
    files: [],
    options: {} as DocumentOptions,
    status: StatusType.Upcoming,
    rsvpStatus: "yes",
    priority: "",
    host: {} as Member<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    teamMemberId: "",
    participants: [],
    then: function<
      T extends BaseDataEntity,
      K extends T = T,
      Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
      AttachmentType extends Attachment = Attachment,
      ExcludedFields extends keyof T = DefaultExcludedFields<T>,
      IncludedFields extends keyof T = keyof T>(callback: (newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined {
      if (this as unknown as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) {
        callback(this as unknown as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>);
      }
      return undefined;
    },
    _id: "",
    analysisResults: [],
    snapshots: [],
    getData: function (): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
      return {} as Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
    },
    timestamp: undefined,
    meta: {} as UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    getSnapshotStoreData: async function (
      startDate, endDate, assignedUser, todoStatus,

    ): Promise<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
      return [];
    }
  };

  // Type guard to check if an object is a SnapshotStore<BaseData>
  function isSnapshotStoreBaseData(
    snapshot: any
  ): snapshot is SnapshotStore< BaseData<any>> {
    return (
      snapshot &&
      typeof snapshot === "object" &&
      "id" in snapshot &&
      "timestamp" in snapshot
    );
  }

  const validAnalysisResults: DataAnalysisResult<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined = isDataAnalysisResult(analysisResults)
  ? [analysisResults]
  : undefined;

  return (
    <div>
      <h1>Calendar App</h1>
      <CalendarDetails
        data={{
          id: "1",
          tags: {},
          metadata: {} as UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        }}
        details={{
          id: "1",
          // _id: calendarEvent.id,
          subtitle: "Discuss project plans",
          title: "Meeting",
          description: "Discuss project plans",
          value: "10:00 AM",
          startDate: new Date(),
          endDate: new Date(),
          updatedAt: new Date(),
          status: CalendarStatus.Pending,
        }}
      />
      <CommonDetails
        data={
          {
            id: "1",
            calendarEvent: calendarEvent,
            label: {
              text: "",
              color: ""
            }, 
            date: new Date(),
            createdBy: "",
            currentMeta, 
            currentMetadata
          } as CommonData<T>
        }
        details={{
          _id: calendarEvent.id,
          id: "1",
          title: "Meeting",
          description: "Discuss project plans",
          reminders: [
            "15 minutes before",
            "30 minutues before",
            "1 day before",
            "1 week before",
          ],
          location: "Online",
          attendees: [],
          updatedAt: new Date(),
          // You can include additional details based on the interface
          isRecurring: false, // Example of additional detail
          status: CalendarStatus.Pending, // Example of status using enum
          analysisResults: validAnalysisResults, 
          createdBy: "",
          currentMeta,
          currentMetadata
        }}
      />
      <DataDetailsComponent
        data={{
          _id: calendarEvent.id,
          id: "1",
          title: "Meeting",
          type: "calendarEvent",
          isActive: false,
          tags: ["work", "meeting"],
          details: {} as DataDetails<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          updatedAt: new Date(),
        }}
        // #todo
      />

      <TeamDetails
        // #todo
     
        team={{
          _id: "team-1",
          id: "1",
          teamName: "Team Alpha",
          color: "#f44336",
          percentage: 0,
          description:
            "Team Alpha is responsible for the development and maintenance of the core application.",
          members: [
            {
              username: "Alice Johnson",
              role: UserRoles.Developer,
              teamId: "",
              roleInTeam: "",
              memberName: "",
              firstName: "",
              lastName: "",
              email: "",
              tier: "",
              roles: [],
              followers: [],
              bannerUrl: "", 
              currentMetadata: {}, 
              currentMeta: {},
              preferences: {
                refreshUI: refreshUI
              },
              storeId: 0,
              refreshUI: {},
              token: null,
              uploadQuota: 0,
              avatarUrl: null,
              createdAt: undefined,
              updatedAt: undefined,
              fullName: null,
              isVerified: false,
              isAdmin: false,
              isActive: false,
              bio: null,
              userType: "",
              hasQuota: false,
              profilePicture: null,
              processingTasks: [],
              persona: null,
              friends: [],
              blockedUsers: [],
              settings: null,
              interests: [],
              privacySettings: undefined,
              notifications: undefined,
              activityLog: [],
              socialLinks: undefined,
              relationshipStatus: null,
              hobbies: [],
              skills: [],
              achievements: [],
              profileVisibility: "",
              profileAccessControl: undefined,
              activityStatus: "",
              isAuthorized: false,
              bannerUrl: "",
              currentMetadata, 
              latestVersion,
              currentMeta: currentMeta
            },
          ],
          projects: [
            {
              _id: "proj-1",
              projectName: "Project X",
              status: "ongoing",
              id: "",
              name: "",
              description: "",
              members: [],
              tasks: [],
              startDate: new Date(),
              endDate: new Date(),
              isActive: false,
              leader: null,
              budget: null,
              phase: null,
              phases: [],
              type: ProjectType.Internal,
              currentPhase: null,
              getData: function (): Promise<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
                return Promise.resolve([]);
              },
              timestamp: undefined,
              category: "",
            },
            {
              _id: "proj-2",
              projectName: "Project Y",
              status: "completed",
              id: "",
              name: "",
              description: "",
              members: [],
              tasks: [],
              startDate: undefined,
              endDate: undefined,
              isActive: false,
              leader: null,
              budget: null,
              phase: null,
              phases: [],
              type: ProjectType.Internal,
              currentPhase: null,
              getData: function (): Promise<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
                return Promise.resolve([]);
              },
              timestamp: undefined,
              category: "",
            },
          ],
          isActive: true,
          leader: {
            username: "Charlie Brown",
            role: UserRoles.TeamLeader,
          },
          pointOfContact: {
            username: "Dana White",
            role: UserRoles.Coordinator,
          } as TeamMember,
          progress: {
            id: "",
            name: "Project Alpha",
            color: "#000000",
            description: "project alpha description",
            value: 70,
            label: "Progress",
            current: 0,
            max: 100,
            min: 0,
            percentage: 70,
            done: false,
          },
          creationDate: new Date("2022-01-15"),
          assignedProjects: [
            {
              _id: "proj-3",
              projectName: "Project Z",
              deadline: new Date("2023-12-31"),
              id: "",
              name: "",
              description: "",
              members: [],
              tasks: [],
              startDate: new Date(),
              endDate: new Date(),
              isActive: false,
              leader: null,
              budget: null,
              phase: null,
              phases: [],
              type: ProjectType.Internal,
              currentPhase: null,
              getData: function (
                id: number
              ): Promise<SnapshotStore<BaseData>[]> {
                return Promise.resolve([]);
              },
              timestamp: undefined,
              category: "",
              status: MeetingStatus.Pending, // Valid
            },
          ],
          reassignedProjects: [
            {
              reassignmentDate: new Date(),
              projectId: "proj-4",
              projectName: "Project A",
              previousTeam: {
                color: 'green',
                team: {
                  id: "",
                  current: 0,
                  max: 0,
                  label: "",
                  value: 0,
                  percentage: 0,
                  done: false,
                  name: "",
                  color: "",
                  min: 0,
                  description: "",
                },
                _id: "",
                id: "",
                teamName: "",
                projects: [],
                creationDate: new Date(),
                isActive: false,
                leader: null,
                progress: null,
                percentage: 0,
                assignedProjects: [],
                reassignedProjects: [],
                assignProject: assignProject,
                reassignProject: reassignProject,
                unassignProject: unassignProject,
                updateProgress: updateProgress,
                getData: function (): Promise<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
                  return Promise.resolve([]);
                },
                timestamp: undefined,
                category: "",
              },
              project: undefined,
            },
          ],
          status: "active",
          assignProject: () => Promise.resolve(console.log("Project assigned")),
          reassignProject: () => Promise.resolve(console.log("Project reassigned")),
          updateProgress: () => Promise.resolve(console.log("Progress updated"), 0),
          unassignProject: () => Promise.resolve(console.log("Project unassigned")),
          analysisType: "quantitative" as AnalysisTypeEnum | undefined,

          snapshots: [],

          team: {
            id: "team-1",
            current: 5,
            max: 10,
            label: "Team A",
            value: 0,
            percentage: 0,
            done: false,
            name: "Alpha Team",
            color: "#000000",
            min: 0,
            description: "Alpha Team",
          },
          // todo
          getData: fetchData,
        }}
      />
    </div>
  );
};

export default CalendarApp;

export { assignProject, reassignProject, unassignProject, updateProgress };
export type { SnapshotWithData };

