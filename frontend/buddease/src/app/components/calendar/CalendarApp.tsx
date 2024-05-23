// CalendarApp.tsx
import AnalyzeData from "@/app/components/projects/DataAnalysisPhase/AnalyzeData/AnalyzeData";
import { VideoData } from "@/app/components/video/Video";
import { DocumentOptions } from "../documents/DocumentOptions";
import CommonDetails, { CommonData } from "../models/CommonData";
import CalendarDetails from "../models/data/CalendarDetails";
import { Data, DataDetails } from "../models/data/Data";
import { CalendarStatus, StatusType } from "../models/data/StatusType";
import { DataDetailsComponent, Team, TeamDetails } from "../models/teams/Team";
import { Member } from "../models/teams/TeamMembers";
import { AnalysisTypeEnum } from "../projects/DataAnalysisPhase/AnalysisType";
import { DataAnalysisResult } from "../projects/DataAnalysisPhase/DataAnalysisResult";
import { Project, ProjectType } from "../projects/Project";
import SnapshotStore, { Snapshot } from "../snapshots/SnapshotStore";
import { CalendarEvent } from "../state/stores/CalendarEvent";
import { DetailsItem } from "../state/stores/DetailsListStore";
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
    max: 100,
    label: `${progressPercentage}%`,
    value: team.progress?.value ?? 0,
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

const CalendarApp = () => {
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
    then: function (callback: (newData: Snapshot<Data>) => void): void {
      throw new Error("Function not implemented.");
    },
    _id: "",
    analysisResults: [],
    snapshots: [],
  };

  return (
    <div>
      <h1>Calendar App</h1>
      <CalendarDetails
        data={{
          tags: ["work", "meeting"],
          metadata: {},
        }}
        details={{
          _id: calendarEvent.id,
          id: "1",
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
            calendarEvent: calendarEvent,
          } as CommonData<never>
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
          description:
            "Team Alpha is responsible for the development and maintenance of the core application.",
          members: [
            {
              username: "Alice Johnson", role: UserRoles.Developer,
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
              isAuthorized: false
            },
            { name: "Bob Smith", role: "Project Manager" },
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
              startDate: new Date,
              endDate: new Date,
              isActive: false,
              leader: null,
              budget: null,
              phase: null,
              phases: [],
              type: ProjectType.Internal,
              currentPhase: null
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
              type: "/Users/dixiejones/data_analysis/frontend/buddease/src/app/components/projects/Project".Internal,
              currentPhase: null
            },
          ],
          isActive: true,
          leader: { name: "Charlie Brown", role: "Team Leader" },
          pointOfContact: { name: "Dana White", role: "Coordinator" },
          progress: {
            currentProgress: 70,
            targetProgress: 100,
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
              startDate: new Date,
              endDate: new Date,
              isActive: false,
              leader: null,
              budget: null,
              phase: null,
              phases: [],
              type: ProjectType.Internal,
              currentPhase: null
            },
          ],
          reassignedProjects: [
            {
              projectId: "proj-4",
              projectName: "Project A",
              previousTeam: Team["Team Beta"],
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
          analysisResults: [
            { metric: "Efficiency", result: 85 },
            { metric: "Completion Rate", result: 95 },
          ] as DataAnalysisResult[],
          videoData: {
            url: "http://example.com/video.mp4",
            duration: 120,
            resolution: "1080p",
          } as VideoData,
          snapshots: [
            {
              id: "snap-1",
              data: { someKey: "someValue" },
              timestamp: new Date("2022-02-01"),
            },
            {
              id: "snap-2",
              data: { someKey: "anotherValue" },
              timestamp: new Date("2022-03-01"),
            },
          ] as SnapshotStore<Snapshot<Data>>[],
          team: { id: "team-1", current: 5, max: 10, label: "Alpha Team" },
        }}
      />
    </div>
  );
};

export default CalendarApp;

export { assignProject, reassignProject, unassignProject, updateProgress };
