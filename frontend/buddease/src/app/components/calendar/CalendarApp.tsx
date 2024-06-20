// CalendarApp.tsx
import useSnapshotManager from '@/app/components/hooks/useSnapshotManager';
import AnalyzeData from "@/app/components/projects/DataAnalysisPhase/AnalyzeData/AnalyzeData";
import { Todo } from "@/app/components/todos/Todo";
import React from "react";
import { DocumentOptions } from "../documents/DocumentOptions";
import CommonDetails, { CommonData } from "../models/CommonData";
import CalendarDetails from "../models/data/CalendarDetails";
import { Data, DataDetails } from "../models/data/Data";
import { CalendarStatus, StatusType } from "../models/data/StatusType";
import { DataDetailsComponent, Team, TeamDetails } from "../models/teams/Team";
import { Member, TeamMember } from "../models/teams/TeamMembers";
import { AnalysisTypeEnum } from "../projects/DataAnalysisPhase/AnalysisType";
import { useDataStore } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { Project, ProjectType } from "../projects/Project";
import { Payload, Snapshot, UpdateSnapshotPayload } from "../snapshots/LocalStorageSnapshotStore";
import { default as SnapshotStore, default as useSnapshotStore } from "../snapshots/SnapshotStore";
import { CalendarEvent } from "../state/stores/CalendarEvent";
import { implementThen } from "../state/stores/CommonEvent";
import { DetailsItem } from "../state/stores/DetailsListStore";
import { User } from "../users/User";
import UserRoles from "../users/UserRoles";

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

const CalendarApp = () => {
  const { addSnapshot, updateSnapshot, removeSnapshot, clearSnapshots } = new useSnapshotStore((snapshot) => {
    // This callback function can be used to add a snapshot to the snapshot list
    // You can implement the logic to add the snapshot to the component's state or perform any other actions
    // For example:
    // setSnapshots([...snapshots, snapshot]);
  });

  const snapshotManager = useSnapshotManager<Todo>(); // Initialize the snapshot manager

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
      interval: 1, // Every week
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
    then: implementThen,
    _id: "",
    analysisResults: [],
    snapshots: [],
    getData: function (): Promise<SnapshotStore<Snapshot<Data>>[]> {
      throw new Error("Function not implemented.");
    },
    timestamp: undefined,
  };

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
              persona: undefined,
              friends: [],
              blockedUsers: [],
              settings: undefined,
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
              getData: function (): Promise<SnapshotStore<Snapshot<Data>>[]> {
                throw new Error("Function not implemented.");
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
              getData: function (): Promise<SnapshotStore<Snapshot<Data>>[]> {
                throw new Error("Function not implemented.");
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
              getData: function (): Promise<SnapshotStore<Snapshot<Data>>[]> {
                throw new Error("Function not implemented.");
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
                assignProject: function (team: Team, project: Project): void {
                  throw new Error("Function not implemented.");
                },
                reassignProject: function (
                  team: Team,
                  project: Project,
                  previousTeam: Team,
                  reassignmentDate: Date
                ): void {
                  throw new Error("Function not implemented.");
                },
                unassignProject: function (team: Team, project: Project): void {
                  throw new Error("Function not implemented.");
                },
                updateProgress: function (team: Team, project: Project): void {
                  throw new Error("Function not implemented.");
                },
                getData: function (): Promise<SnapshotStore<Snapshot<Data>>[]> {
                  throw new Error("Function not implemented.");
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
            snapshots: [
              {
                
                initSnapshot: snapshotManager().initSnapshot,
                takeSnapshot: useSnapshotManager().takeSnapshot,
                takeSnapshotSuccess: useSnapshotManager().takeSnapshotSuccess,
                takeSnapshotsSuccess: useSnapshotManager().takeSnapshotsSuccess,

                configureSnapshotStore: useSnapshotManager().configureSnapshotStore,
                getData: useSnapshotManager().getData,
                setData: useSnapshotManager().setData,
                getState: useSnapshotManager().getState,

                setState: useSnapshotManager().setState,
                validateSnapshot: useSnapshotManager().validateSnapshot,
                handleSnapshot: useSnapshotManager().handleSnapshot,
                handleActions: ,

                setSnapshot: ,
                setSnapshots: ,
                clearSnapshot: ,
                mergeSnapshots: ,
                reduceSnapshots:,
                sortSnapshots:,
                filterSnapshots:,

                mapSnapshots:,
                findSnapshot:,
                getSubscribers:,
                notify:,

                notifySubscribers:,
                subscribe:,
                unsubscribe:,
                fetchSnapshot:,

                fetchSnapshotSuccess:,
                fetchSnapshotFailure:,
                getSnapshot:,

                getSnapshots:,
                getAllSnapshots:,
                generateId:,
                batchFetchSnapshots:,

                batchTakeSnapshotsRequest:,
                batchUpdateSnapshotsRequest:,
                batchFetchSnapshotsSuccess:,
                batchFetchSnapshotsFailure:,

                batchUpdateSnapshotsSuccess:,
                batchUpdateSnapshotsFailure:,
                batchTakeSnapshot: ,
                snapshots:,
                config:,
                // mergeSnapshot:,
                // mergeSnapshotSuccess, mergeSnapshotsSuccess,
                snapshotId: "snap-1",
                addSnapshot: (snapshot: Snapshot<Data>) => {
                  // Add snapshot logic
                },
                updateSnapshot: (
                  snapshotId: string,
                  newData: Data,
                  payload: UpdateSnapshotPayload<Data>
                ) => {
                  // Update snapshot logic
                },
                removeSnapshot: (snapshotId: string) => {
                  // Remove snapshot logic
                },
                clearSnapshots: () => {
                  // Clear snapshots logic
                },
                // Add other functions and properties required by SnapshotStoreSubset
                createSnapshot: () => {
                  // Create snapshot logic
                },
                createSnapshotSuccess: (snapshot: Snapshot<Data>) => {
                  // Create snapshot success logic
                },
                createSnapshotFailure: (error: Payload) => {
                  // Create snapshot failure logic
                },
                updateSnapshots: () => {
                  // Update snapshots logic
                },
                updateSnapshotSuccess: () => {
                  // Update snapshot success logic
                },
                updateSnapshotFailure: (error: Payload) => {
                  // Update snapshot failure logic
                },
                updateSnapshotsSuccess: () => {
                  // Update snapshots success logic
                },
                updateSnapshotsFailure: (error: Payload) => {
                  // Update snapshots failure logic
                },
                // Add more properties...
              },
            {
              snapshotId: "snap-2",
              addSnapshot: (snapshot: Snapshot<Data>) => {
                // Add snapshot logic
              },
              updateSnapshot: (
                snapshotId: string,
                newData: Data,
                payload: UpdateSnapshotPayload<Data>
              ) => {
                // Update snapshot logic
              },
              removeSnapshot: (snapshotId: string) => {
                // Remove snapshot logic
              },
              clearSnapshots: () => {
                // Clear snapshots logic
              },
              // Add other functions and properties required by SnapshotStoreSubset
              createSnapshot: () => {
                // Create snapshot logic
              },
              createSnapshotSuccess: (snapshot: Snapshot<Data>) => {
                // Create snapshot success logic
              },
              createSnapshotFailure: (error: Payload) => {
                // Create snapshot failure logic
              },
              updateSnapshots: () => {
                // Update snapshots logic
              },
              updateSnapshotSuccess: () => {
                // Update snapshot success logic
              },
              updateSnapshotFailure: (error: Payload) => {
                // Update snapshot failure logic
              },
              updateSnapshotsSuccess: () => {
                // Update snapshots success logic
              },
              updateSnapshotsFailure: (error: Payload) => {
                // Update snapshots failure logic
              },
              // Add more properties...
            },
          ],
          
          team: {
            id: "team-1",
            current: 5,
            max: 10,
            label: "Alpha Team",
            value: 0,
            percentage: 0,
            done: false
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
