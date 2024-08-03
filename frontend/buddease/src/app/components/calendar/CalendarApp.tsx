// CalendarApp.tsx
import useSnapshotManager from '@/app/components/hooks/useSnapshotManager';
import AnalyzeData from "@/app/components/projects/DataAnalysisPhase/AnalyzeData/AnalyzeData";
import { Todo } from "@/app/components/todos/Todo";
import React, { useState } from "react";
import { DocumentOptions } from "../documents/DocumentOptions";
import CommonDetails, { CommonData } from "../models/CommonData";
import CalendarDetails from "../models/data/CalendarDetails";
import { BaseData, Data, DataDetails } from "../models/data/Data";
import { CalendarStatus, StatusType } from "../models/data/StatusType";
import { DataDetailsComponent, Team, TeamDetails } from "../models/teams/Team";
import { Member, TeamMember } from "../models/teams/TeamMembers";
import { AnalysisTypeEnum } from "../projects/DataAnalysisPhase/AnalysisType";
import { DataStore, useDataStore } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { Project, ProjectType } from "../projects/Project";
import { Payload, Snapshot, Snapshots, UpdateSnapshotPayload } from "../snapshots/LocalStorageSnapshotStore";
import { default as SnapshotStore, default as useSnapshotStore } from "../snapshots/SnapshotStore";
import { CalendarEvent } from "../state/stores/CalendarEvent";
import { implementThen } from "../state/stores/CommonEvent";
import { DetailsItem } from "../state/stores/DetailsListStore";
import { User } from "../users/User";
import UserRoles from "../users/UserRoles";
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { K, SnapshotStoreConfig } from '../snapshots/SnapshotConfig';
import { initSnapshot, subscribeToSnapshots } from '../snapshots/snapshotHandlers';
import { takeSnapshot } from '@/app/api/SnapshotApi';
import { snapshotType } from '../typings/YourSpecificSnapshotType';
import { isSnapshotStoreBaseData } from '../utils/snapshotUtils';

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
const { fetchData } = useDataStore();


// Adjusted addSnapshotHandler function
export const addSnapshotHandler = (
  snapshot: Snapshot<Data, K>,
  subscribers: (snapshot: Snapshot<Data, K>) => void,
  delegate: SnapshotStoreConfig<BaseData, BaseData>[]
) => {
  if (delegate && delegate.length > 0 && typeof delegate[0].setSnapshots === 'function') {
    const currentSnapshots: Snapshots<BaseData> = delegate[0].snapshots ? delegate[0].snapshots.filter(isSnapshotStoreBaseData) : [];
    
    // Ensuring snapshot is of type SnapshotStore<BaseData> before adding
    if (isSnapshotStoreBaseData(snapshot)) {
      delegate[0].setSnapshots([...currentSnapshots, snapshot]);
    } else {
      console.error('Snapshot is not of type SnapshotStore<BaseData>', snapshot);
    }
  }
};

const CalendarApp = () => {
  const [snapshot, setSnapshot] = useState<Snapshot<Data, Data> | null>(null);
    // Default empty snapshot with the required properties
    const defaultSnapshot: SnapshotWithData = {
      data: new Map<string, Data>(), // Initialize with empty map
      events: {}, // Initialize with empty object or suitable default
      meta: {} as Data // Initialize with default or empty Data
    };
  
    const [snapshots, setSnapshots] = useState<SnapshotWithData[]>([
      defaultSnapshot // Add default snapshot to the array
    ]);
  
  const category: CategoryProperties = {
    name: "",
    description: "category description",
    icon: "category_png",
    color: "categorized_color",
    iconColor: '',
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
    brandName: '',
    brandLogo: '',
    brandColor: '',
    brandMessage: ''
  };
  const date = new Date();
  const type = snapshotType.toString();
  const initialState: SnapshotStore<BaseData, K> | Snapshot<BaseData, K> | null | undefined = null;
  const snapshotConfig: SnapshotStoreConfig<BaseData, BaseData>[] = [];
  const delegate: SnapshotStoreConfig<BaseData, Data>[] = [];
  
  const dataStoreMethods: DataStore<Data, Data> = {
    data: undefined,
    storage: undefined,
    addData: (data: Snapshot<Data, Data>) => { },
    updateData: (id: number, newData:  Snapshot<Data, Data>) => { },
    removeData: (id: number) => { },
    updateDataTitle: (id: number, title: string) => { },
    updateDataDescription: (id: number, description: string) => { },
    addDataStatus: (id: number, status: "pending" | "inProgress" | "completed") => { },
    updateDataStatus: (id: number, status: "pending" | "inProgress" | "completed") => { },
    addDataSuccess: (payload: { data: Snapshots<Data> }) => { },
    getDataVersions: async (id: number) => {
      // Implement logic to fetch data versions from a data source
      return undefined;
    },
    updateDataVersions: (id: number, versions: Snapshots<Data>) => Promise.resolve(),
    getBackendVersion: () => Promise.resolve(""),
    getFrontendVersion: () => Promise.resolve(""),
    fetchData: (id: number) => Promise.resolve([]),
    getItem: (key: string): Promise<BaseData | undefined> => {
      return new Promise((resolve, reject) => {
       if (this.storage) {
          const item = this.storage.getItem(key);
          if (item) {
            resolve(JSON.parse(item));
          } else {
            resolve(undefined);
          }
        } else {
          reject(new Error("Storage is not defined"));
        }
      });
    },
    setItem: (id: string, item: BaseData): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (this.storage) {
          this.storage.setItem(id, JSON.stringify(item));
          resolve();
        } else {
          reject(new Error("Storage is not defined"));
        }
      });
    },
    removeItem: async (key: string): Promise<void> => {
      if (this.storage) {
        await this.storage.removeItem(key);
      } else {
        throw new Error("Storage is not defined");
      }
    },
    getAllKeys: async (): Promise<string[]> => {
      const keys: string[] = [];
      if (this.storage) {
        for (let i = 0; i < this.storage.length; i++) {
          const key = this.storage.key(i);
          if (key) {
            keys.push(key);
          }
        }
      } else {
        throw new Error("Storage is not defined");
      }
      return keys;
    },
    async getAllItems(): Promise<BaseData[]> {
      try {
        const keys = await this.getAllKeys();
        const items: (BaseData | undefined)[] = await Promise.all(
          keys.map(async (key) => {
            const item = await this.getItem(key);
            return item;
          })
        );
        const filteredItems = items.filter((item): item is BaseData => item !== undefined);
        return filteredItems;
      } catch (error) {
        throw error;
      }
    }
  };
  
  const { addSnapshot, updateSnapshot, removeSnapshot, clearSnapshots } = new useSnapshotStore(
    data,
    initialState,
    category,
    new Date(),
    type,
    snapshotConfig,
    subscribeToSnapshots,
    subscribeToSnapshot,
    delegate,
    dataStoreMethods
  );

  const snapshotManager = useSnapshotManager<Todo>(); // Initialize the snapshot manager

  // Define the CalendarEvent object
const calendarEvent: CalendarEvent = {
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
  details: {} as DetailsItem<DataDetails>,
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
  then: () => {
    console.log("Then function called");
  },
  _id: "",
  analysisResults: [],
  snapshots: [],
  getData: async function (): Promise<SnapshotStore<BaseData>[]> {
    throw new Error("Function not implemented.");
  },
  timestamp: undefined,
};
  

  
// Type guard to check if an object is a SnapshotStore<BaseData>
function isSnapshotStoreBaseData(
  snapshot: any
): snapshot is SnapshotStore<BaseData> {
  return (
    snapshot &&
    typeof snapshot === 'object' &&
    'id' in snapshot &&
    'timestamp' in snapshot
  );
}

  
  
  return (
    <div>
      <h1>Calendar App</h1>
      <CalendarDetails
        data={{
          id: "1",
          tags: ["work", "meeting"],
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
              getData: function (id: number): Promise<SnapshotStore<BaseData>[]> {
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
                team: {
                  id: "",
                  current: 0,
                  max: 0,
                  label: "",
                  value: 0,
                  percentage: 0,
                  done: false,
                  name: '',
                  color: '',
                  min: 0,
                  description: ''
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
};export default CalendarApp;

export { assignProject, reassignProject, unassignProject, updateProgress };
