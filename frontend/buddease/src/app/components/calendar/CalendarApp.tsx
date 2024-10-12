// CalendarApp.tsx
import { getSnapshotStore } from "@/app/api/SnapshotApi";
import { useSnapshotManager } from "@/app/components/hooks/useSnapshotManager";
import AnalyzeData from "@/app/components/projects/DataAnalysisPhase/AnalyzeData/AnalyzeData";
import { Todo } from "@/app/components/todos/Todo";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import React, { useState } from "react";
import * as snapshotApi from '../../api/SnapshotApi';
import { DocumentOptions } from "../documents/DocumentOptions";
import { Category } from "../libraries/categories/generateCategoryProperties";
import CommonDetails, { CommonData } from "../models/CommonData";
import CalendarDetails from "../models/data/CalendarDetails";
import { BaseData, Data, DataDetails } from "../models/data/Data";
import { CalendarStatus, StatusType } from "../models/data/StatusType";
import { DataDetailsComponent, Team, TeamDetails } from "../models/teams/Team";
import { Member, TeamMember } from "../models/teams/TeamMembers";
import { AnalysisTypeEnum } from "../projects/DataAnalysisPhase/AnalysisType";
import {
  DataStore,
  useDataStore,
} from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { Project, ProjectType } from "../projects/Project";
import { SnapshotContainer, SnapshotData, SnapshotWithCriteria } from "../snapshots";
import {
  Snapshot,
  SnapshotsArray,
  SnapshotsObject
} from "../snapshots/LocalStorageSnapshotStore";
import {
  default as SnapshotStore,
  default as useSnapshotStore,
} from "../snapshots/SnapshotStore";
import { SnapshotStoreConfig } from "../snapshots/SnapshotStoreConfig";
import { CalendarEvent } from "../state/stores/CalendarEvent";
import { DetailsItem } from "../state/stores/DetailsListStore";
import { snapshotType } from "../typings/YourSpecificSnapshotType";
import { User } from "../users/User";
import UserRoles from "../users/UserRoles";



// Define SnapshotWithData to include only essential properties and methods
interface SnapshotWithData<T extends Data, K extends Data = T> {
  data: Map<string, Snapshot<T, K>> | null; // Assuming this holds snapshot data
  events: {
    // Define the events object structure based on your needs
    eventRecords?: any; // Adjust type according to actual event record type
    eventIds?: string[];
    onSnapshotAdded?: (snapshot: Snapshot<T, K>) => void;
    onSnapshotRemoved?: (snapshot: Snapshot<T, K>) => void;
    onSnapshotUpdated?: (snapshot: Snapshot<T, K>) => void;
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



export const addSnapshotHandler = <T extends Data, K extends BaseData>(
  snapshot: Snapshot<T, K>,
  subscribers: (snapshot: Snapshot<T, K>) => void,
  delegate: SnapshotStoreConfig<T, K>[],
  typeGuard: (snapshot: Snapshot<T, K>) => snapshot is Snapshot<T, K>
) => {
  if (delegate && delegate.length > 0) {
    delegate.forEach((config) => {
      if (typeof config.setSnapshots === "function") {
        // Ensure config.snapshots is treated as an array
        const currentSnapshotsArray: SnapshotsArray<T> = Array.isArray(config.snapshots)
          ? (config.snapshots as SnapshotsArray<T>)
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

const CalendarApp = async <T extends Data, K extends Data>() => {
  const [snapshot, setSnapshot] = useState<Snapshot<Data, Data> | null>(null);
  // Default empty snapshot with the required properties
  
  const storage = window.localStorage; // or wherever your storage is defined
  
  const defaultSnapshot: SnapshotWithData<T, K> = {
    data: new Map<string, Snapshot<T, K>>(), // Initialize with empty map
    events: {}, // Initialize with empty object or suitable default
    meta: {} as T // Initialize with default or empty Data
  };

  const [snapshots, setSnapshots] = useState<SnapshotWithData<T, K>[]>([
    defaultSnapshot, // Add default snapshot to the array
  ]);

  const category: CategoryProperties = {
    name: "",
    description: "category description",
    icon: "category_png",
    color: "categorized_color",
    iconColor: "",
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
    | SnapshotStore<BaseData, K>
    | Snapshot<BaseData, K>
    | null
    | undefined = null;
  const snapshotConfig: SnapshotStoreConfig<T, BaseData>[] = [];
  const delegate: SnapshotStoreConfig<T, Data>[] = [];
  const dataStoreMethods: DataStore<T, K> = {
    id: "",
    data: undefined,
    storage: undefined,
    metadata: undefined,
    dataStoreConfig: undefined,
    addData: (data: Snapshot<T, K>) => {},
    updateData: (id: number, newData: Snapshot<T, K>) => {},
    removeData: (id: number) => {},
    updateDataTitle: (id: number, title: string) => {},
    updateDataDescription: (id: number, description: string) => {},
    addDataStatus: (id: number, status: StatusType | undefined) => {},
    updateDataStatus: (id: number, status: StatusType | undefined) => {},
    addDataSuccess: (payload: { data: Snapshot<T, K>[] }) => {},
    getDataVersions: async (id: number) => {
      // Implement logic to fetch data versions from a data source
      return undefined;
    },
    updateDataVersions: (id: number, versions: Snapshot<T, K>[]) =>
      Promise.resolve(),
    getBackendVersion: () => Promise.resolve(""),
    getFrontendVersion: () => Promise.resolve(""),
    fetchData: (id: number) => Promise.resolve({} as SnapshotStore<T, K>),
    getItem: (key:  string): Promise<Snapshot<T, K> | undefined> => {
      return new Promise((resolve, reject) => {
        if (storage) {
          const item = storage.getItem(key);
          if (item) {
            try {
              const parsedItem = JSON.parse(item) as Snapshot<T, K>;
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

    setItem: (id: string, item: Snapshot<T, any>): Promise<void> => {
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
      category: symbol | string | Category | undefined,
      categoryProperties: CategoryProperties | undefined,
      snapshot: Snapshot<T, K> | null,
      timestamp: string | number | Date | undefined,
      type: string,
      event: Event,
      id: number,
      snapshotStore: SnapshotStore<T, K>,
      data: T,
    ): Promise<Snapshot<T, any>[]> {
      try {
        const keys = await this.getAllKeys(
          storeId,
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
        );

        if (!keys) {
          return [];  // Handle the case where keys are undefined
        }
        const items: (Snapshot<T, K> | undefined)[] = await Promise.all(
          keys.map((key, index) => this.getItem(key, index))
        );

        const filteredItems = items.filter(
          (item): item is Snapshot<T, K> => item !== undefined
        );
        return filteredItems;
      } catch (error: any) {
        throw new Error(`Failed to get all items: ${error.message}`);
      }
    },

    // Define the mapSnapshot function
    mapSnapshot: function (
      storeId: number,
      snapshotStore: SnapshotStore<T, K>,
      snapshotContainer: SnapshotContainer<T, K>,
      snapshotId: string,
      criteria: 
      ,
      snapshot: Snapshot<T, K>,
      type: string,
      event: Event
    ): Promise<Snapshot<T, K> | null | undefined> {
      return new Promise(async (resolve, reject) => {
        try {
          // Ensure getSnapshotStore is correctly used
          const snapshotStoreFromFunction = await getSnapshotStore(storeId, snapshotContainer, criteria);
          if (snapshotStoreFromFunction) {
            const snapshot = snapshotStoreFromFunction.getSnapshot(snapshot);
            if (snapshot) {
              const mappedSnapshot = this.mapSnapshot(
                storeId,
                snapshotStoreFromFunction,
                snapshotContainer,
                snapshotId,
                criteria,
                snapshot,
                type,
                event
              );
              resolve(mappedSnapshot);
            } else {
              reject(new Error("Snapshot not found"));
            }
          } else {
            reject(new Error("Snapshot store not found"));
          }
        } catch (error: any) {
          reject(new Error(`Failed to map snapshot: ${error.message}`));
        }
      });
    },

    mapSnapshots: function (
      storeIds: number[],
      snapshotId: string,
      category: symbol | string | Category | undefined,
      categoryProperties: CategoryProperties | undefined,
      snapshot: Snapshot<T, K>,
      timestamp: string | number | Date | undefined,
      type: string,
      event: Event,
      id: number,
      snapshotStore: SnapshotStore<T, K>,
      data: T,
      callback: (
        storeIds: number[],
        snapshotId: string,
        category: symbol | string | Category | undefined,
        categoryProperties: CategoryProperties | undefined,
        snapshot: Snapshot<T, K>,
        timestamp: string | number | Date | undefined,
        type: string,
        event: Event,
        id: number,
        snapshotStore: SnapshotStore<T, K>,
        data: K,
        index: number
      ) => SnapshotsObject<T>
    ): SnapshotsObject<T> {
      throw new Error("Function not implemented.");
    },
    mapSnapshotStore: function (
      storeId: number,
      snapshotId: string,
      category: symbol | string | Category | undefined,
      categoryProperties: CategoryProperties | undefined,
      snapshot: Snapshot<any, any>,
      timestamp: string | number | Date | undefined,
      type: string,
      event: Event,
      id: number,
      snapshotStore: SnapshotStore<any, any>,
      data: any
    ): Promise<SnapshotContainer<T, K> | undefined> {
      throw new Error("Function not implemented.");
    },

    getData: function (
      id: number
    ): Promise<SnapshotStore<T, K>[] | undefined> {
      throw new Error("Function not implemented.");
    },
    getStoreData: function (id: number): Promise<SnapshotStore<T, K>[]> {
      throw new Error("Function not implemented.");
    },
    updateStoreData: function (
      data: Data,
      id: number,
      newData: SnapshotStore<T, K>
    ): void {
      throw new Error("Function not implemented.");
    },
    getDelegate: function (context: {
      useSimulatedDataSource: boolean;
      simulatedDataSource: SnapshotStoreConfig<T, K>[];
    }): Promise<SnapshotStoreConfig<T, K>[]> {
      throw new Error("Function not implemented.");
    },
    updateDelegate: function (
      config: SnapshotStoreConfig<T, K>[]
    ): Promise<SnapshotStoreConfig<T, K>[]> {
      throw new Error("Function not implemented.");
    },
    getSnapshot: function (
      snapshot: (id: string) =>
        | Promise<{
          snapshotId: number;
          snapshotData: T;
          category: Category | undefined;
          categoryProperties: CategoryProperties;
          dataStoreMethods: DataStore<T, K>;
          timestamp: string | number | Date | undefined;
          id: string | number | undefined;
          snapshot: Snapshot<T, K>;
          snapshotStore: SnapshotStore<T, K>;
          data: T;
          }>
        | undefined
    ): Promise<Snapshot<T, K> | undefined> {
      throw new Error("Function not implemented.");
    },
    getSnapshotWithCriteria: function (
      category: any,
      timestamp: any,
      id: number,
      snapshot: Snapshot<T, K>,
      snapshotStore: SnapshotStore<T, K>,
      data: T
    ): Promise<SnapshotWithCriteria<T, K> | undefined> {
      throw new Error("Function not implemented.");
    },
    getSnapshotContainer: function (
      category: string,
      timestamp: string,
      id: number,
      snapshot: Snapshot<T, K>,
      snapshotStore: SnapshotStore<T, K>,
      snapshotData: SnapshotStore<T, K>,
      data: Data,
      snapshotsArray: SnapshotsArray<T>,
      snapshotsObject: SnapshotsObject<T>
    ): Promise<SnapshotContainer<T, K> | undefined> {
      throw new Error("Function not implemented.");
    },
    getSnapshotVersions: function (
      category: any,
      timestamp: any,
      id: number,
      snapshot: Snapshot<T, K>,
      snapshotStore: SnapshotStore<T, K>,
      data: T
    ): Promise<Snapshot<T, K>[] | undefined> {
      throw new Error("Function not implemented.");
    },
    getSnapshotWithCriteriaVersions: function (
      category: any,
      timestamp: any,
      id: number,
      snapshot: Snapshot<T, K>,
      snapshotStore: SnapshotStore<T, K>,
      data: T
    ): Promise<SnapshotWithCriteria<T, K>[] | undefined> {
      throw new Error("Function not implemented.");
    },
  };

  

  const snapshotId = snapshotApi.getSnapshotId(snapshotFetcher).toString();
  const storeId = snapshotApi.getSnapshotStoreId(Number(snapshotId));

  const { addSnapshot, updateSnapshot, removeSnapshot, clearSnapshots,  } =  new useSnapshotStore(storeId, options, category, config, operation);

  const snapshotManager = useSnapshotManager<Todo, K>(await storeId); // Initialize the snapshot manager

  // Define the CalendarEvent object
  const calendarEvent: CalendarEvent<T, K> = {
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
    host: {} as Member,
    teamMemberId: "",
    participants: [],
    then: function<T extends Data, K extends Data>(callback: (newData: Snapshot<T, K>) => void): Snapshot<T, K> | undefined {
      if (this as unknown as Snapshot<T, K>) {
        callback(this as unknown as Snapshot<T, K>);
      }
      return undefined;
    },
    _id: "",
    analysisResults: [],
    snapshots: [],
    getData: function (): Promise<Snapshot<T, K>> {
      return [];
    },
    timestamp: undefined,
    meta: {},
    getSnapshotStoreData: async function (): Promise<SnapshotStore<CalendarEvent<T, K>, K>[]> {
      return [];
    }
  };

  // Type guard to check if an object is a SnapshotStore<BaseData>
  function isSnapshotStoreBaseData(
    snapshot: any
  ): snapshot is SnapshotStore<BaseData> {
    return (
      snapshot &&
      typeof snapshot === "object" &&
      "id" in snapshot &&
      "timestamp" in snapshot
    );
  }

  return (
    <div>
      <h1>Calendar App</h1>
      <CalendarDetails
        data={{
          id: "1",
          tags: {},
          metadata: {},
        }}
        details={{
          id: "1",
          // _id: calendarEvent.id,
          subtitle: "Discuss project plans",
          value: "10:00 AM",
          title: "Meeting",
          description: "Discuss project plans",
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
          } as CommonData
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
          details: {} as DataDetails,
          updatedAt: new Date(),
        }}
      />

      <TeamDetails
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
            },
          ],
          projects: [
            {
              projectId: "proj-1",
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
              getData: function (): Promise<SnapshotStore<BaseData>[]> {
                return Promise.resolve([]);
              },
              timestamp: undefined,
              category: "",
            },
            {
              projectId: "proj-2",
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
              getData: function (): Promise<SnapshotStore<BaseData>[]> {
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
          } as User,
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
              projectId: "proj-3",
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
                getData: function (): Promise<SnapshotStore<BaseData>[]> {
                  return Promise.resolve([]);
                },
                timestamp: undefined,
                category: "",
              },
              project: undefined,
            },
          ],
          status: "active",
          assignProject: (project) => console.log("Project assigned:", project),
          reassignProject: (project) =>
            console.log("Project reassigned:", project),
          updateProgress: (progress) =>
            console.log("Progress updated:", progress),
          unassignProject: (project) =>
            console.log("Project unassigned:", project),
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

