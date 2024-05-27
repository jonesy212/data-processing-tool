// CalendarApp.tsx
import AnalyzeData from "@/app/components/projects/DataAnalysisPhase/AnalyzeData/AnalyzeData";
import { VideoData } from "@/app/components/video/Video";
import { DocumentOptions } from "../documents/DocumentOptions";
import CommonDetails, { CommonData } from "../models/CommonData";
import CalendarDetails from "../models/data/CalendarDetails";
import { Data, DataDetails } from "../models/data/Data";
import { CalendarStatus, StatusType } from "../models/data/StatusType";
import { DataDetailsComponent, Team, TeamDetails } from "../models/teams/Team";
import { Member, TeamMember } from "../models/teams/TeamMembers";
import { AnalysisTypeEnum } from "../projects/DataAnalysisPhase/AnalysisType";
import { DataAnalysisResult } from "../projects/DataAnalysisPhase/DataAnalysisResult";
import { Project, ProjectType } from "../projects/Project";
import SnapshotStore, { Snapshot } from "../snapshots/SnapshotStore";
import { CalendarEvent } from "../state/stores/CalendarEvent";
import { DetailsItem } from "../state/stores/DetailsListStore";
import UserRoles from "../users/UserRoles";
import { User } from "../users/User";
import { useDataStore } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";

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
    percentage: team.percentage,
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
    getData: function (): Promise<SnapshotStore<Snapshot<Data>>[]> {
      throw new Error("Function not implemented.");
    }
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
              }
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
              }
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
            value: 70,
            label: "Progress",
            current: 0,
            max: 100,
            percentage: 70,
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
              }
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
                }
              },
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
            {
              id: 1,
              title: "Efficiency",
              insights: [],
              analysisType: "quantitative",
              analysisDate: new Date(), // Add analysisDate
              results: [], // Add results
              result: 85,
              description: "",
              status: "completed",
              createdAt: new Date(),
              updatedAt: undefined,
              recommendations: [], // Add recommendations
              metrics: { // Add metrics
                accuracy: 0,
                precision: 0,
                recall: 0,
                f1Score: 0,
              },
              visualizations: { // Add visualizations
                charts: [],
                diagrams: [],
              },
              communityImpact: false, // Add communityImpact
              globalCollaboration: false, // Add globalCollaboration
              solutionQuality: false, // Add solutionQuality
              unityPromotion: false, // Add unityPromotion
              humanityBenefit: false, // Add humanityBenefit
              conclusions: "", // Add conclusions
              futureSteps: [], // Add futureSteps
            },
            {
              id: 2,
              title: "Completion Rate",
              insights: [],
              analysisType: "quantitative",
              analysisDate: new Date(), // Add analysisDate
              results: [], // Add results
              result: 95,
              description: "",
              status: "completed",
              createdAt: new Date(),
              updatedAt: undefined,
              recommendations: [], // Add recommendations
              metrics: { // Add metrics
                accuracy: 0,
                precision: 0,
                recall: 0,
                f1Score: 0,
              },
              visualizations: { // Add visualizations
                charts: [],
                diagrams: [],
              },
              communityImpact: false, // Add communityImpact
              globalCollaboration: false, // Add globalCollaboration
              solutionQuality: false, // Add solutionQuality
              unityPromotion: false, // Add unityPromotion
              humanityBenefit: false, // Add humanityBenefit
              conclusions: "", // Add conclusions
              futureSteps: [], // Add futureSteps
            },
          ],          
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
          team: {
            id: "team-1",
            current: 5,
            max: 10,
            label: "Alpha Team",
            value: 0,
          },
          // todo
          getData: fetchData
        }}
      />
    </div>
  );
};

export default CalendarApp;

export { assignProject, reassignProject, unassignProject, updateProgress };
