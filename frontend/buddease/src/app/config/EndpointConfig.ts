import { AnalyticsEndpoints } from '@/app/typings/categories/AnalyticsEndpoints';
import { ApiConfigEndpoints } from '@/app/typings/categories/ApiConfigEndpoints';
import { ApiWebBaseEndpoints } from '@/app/typings/categories/ApiWebBaseEndpoints';
import { AuthEndpoints } from '@/app/typings/categories/AuthEndpoints';
import { BatchEndpoints } from '@/app/typings/categories/BatchEndpoints';
import { BlogsEndpoints } from '@/app/typings/categories/BlogsEndpoints';
import { CalendarEndpoints } from '@/app/typings/categories/CalendarEndpoints';
import { ChatEndpoints } from '@/app/typings/categories/ChatEndpoints';
import { ClientEndpoints } from '@/app/typings/categories/ClientEndpoints';
import { CollaborationToolsEndpoints } from '@/app/typings/categories/CollaborationToolsEndpoints';
import { CommentsEndpoints } from '@/app/typings/categories/CommentsEndpoints';
import { CommunicationEndpoints } from '@/app/typings/categories/CommunicationEndpoints';
import { CommunityInteractionEndpoints } from '@/app/typings/categories/CommunityInteractionEndpoints';
import { ContentEndpoints } from '@/app/typings/categories/ContentEndpoints';
import { CryptoEndpoints } from '@/app/typings/categories/CryptoEndpoints';
import { DataAnalysisEndpoints } from '@/app/typings/categories/DataAnalysisEndpoints';
import { DatabaseEndpoints } from '@/app/typings/categories/DatabaseEndpoints';
import { DataEndpoints } from '@/app/typings/categories/DataEndpoints';
import { DataProvidersEndpoints } from '@/app/typings/categories/DataProvidersEndpoints';
import { DelegatesEndpoints } from '@/app/typings/categories/DelegatesEndpoints';
import { DetailsEndpoints } from '@/app/typings/categories/DetailsEndpoints';
import { DevEndpoints } from '@/app/typings/categories/DevEndpoints';
import { DexEndpoints } from '@/app/typings/categories/DexEndpoints';
import { DocumentEndpoints } from '@/app/typings/categories/DocumentEndpoints';
import { DonationsEndpoints } from '@/app/typings/categories/DonationsEndpoints';
import { DrawingEndpoints } from '@/app/typings/categories/DrawingEndpoints';
import { ExternalAuthEndpoints } from '@/app/typings/categories/ExternalAuthEndpoints';
import { FeedbackEndpoints } from '@/app/typings/categories/FeedbackEndpoints';
import { FilesEndpoints } from '@/app/typings/categories/FilesEndpoints';
import { FilteringEndpoints } from '@/app/typings/categories/FilteringEndpoints';
import { FreelancersEndpoints } from '@/app/typings/categories/FreelancersEndpoints';
import { GeneratorsEndpoints } from '@/app/typings/categories/GeneratorsEndpoints';
import { GlobalCollaborationEndpoints } from '@/app/typings/categories/GlobalCollaborationEndpoints';
import { HighlightsEndpoints } from '@/app/typings/categories/HighlightsEndpoints';
import { LoggingEndpoints } from '@/app/typings/categories/LoggingEndpoints';
import { LogsEndpoints } from '@/app/typings/categories/LogsEndpoints';
import { MarkerEndpoints } from '@/app/typings/categories/MarkerEndpoints';
import { MessagesEndpoints } from '@/app/typings/categories/MessagesEndpoints';
import { ModeratorsEndpoints } from '@/app/typings/categories/ModeratorsEndpoints';
import { MonetizationEndpoints } from '@/app/typings/categories/MonetizationEndpoints';
import { NewsEndpoints } from '@/app/typings/categories/NewsEndpoints';
import { NotesEndpoints } from '@/app/typings/categories/NotesEndpoints';
import { ParameterCustomizationEndpoints } from '@/app/typings/categories/ParameterCustomizationEndpoints';
import { ParticipantsEndpoints } from '@/app/typings/categories/ParticipantsEndpoints';
import { PaymentEndpoints } from '@/app/typings/categories/PaymentEndpoints';
import { PersonasEndpoints } from '@/app/typings/categories/PersonasEndpoints';
import { PhasesEndpoints } from '@/app/typings/categories/PhasesEndpoints';
import { ProjectManagementEndpoints } from '@/app/typings/categories/ProjectManagementEndpoints';
import { ProjectOwnerEndpoints } from '@/app/typings/categories/ProjectOwnerEndpoints';
import { ProjectsEndpoints } from '@/app/typings/categories/ProjectsEndpoints';
import { RandomWalkEndpoints } from '@/app/typings/categories/RandomWalkEndpoints';
import { RealtimeEndpoints } from '@/app/typings/categories/RealtimeEndpoints';
import { RegistrationEndpoints } from '@/app/typings/categories/RegistrationEndpoints';
import { ReportsEndpoints } from '@/app/typings/categories/ReportsEndpoints';
import { ScreenSharingEndpoints } from '@/app/typings/categories/ScreenSharingEndpoints';
import { SearchingEndpoints } from '@/app/typings/categories/SearchingEndpoints';
import { SecurityEndpoints } from '@/app/typings/categories/SecurityEndpoints';
import { SnapshotsEndpoints } from '@/app/typings/categories/SnapshotsEndpoints';
import { SortingEndpoints } from '@/app/typings/categories/SortingEndpoints';
import { StateGovCitiesEndpoints } from '@/app/typings/categories/StateGovCitiesEndpoints';
import { TasksEndpoints } from '@/app/typings/categories/TasksEndpoints';
import { TeamManagementEndpoints } from '@/app/typings/categories/TeamManagementEndpoints';
import { TeamsEndpoints } from '@/app/typings/categories/TeamsEndpoints';
import { ThemeEndpoints } from '@/app/typings/categories/ThemeEndpoints';
import { TodosEndpoints } from '@/app/typings/categories/TodosEndpoints';
import { ToolbarEndpoints } from '@/app/typings/categories/ToolbarEndpoints';
import { TradingEndpoints } from '@/app/typings/categories/TradingEndpoints';
import { UiEndpoints } from '@/app/typings/categories/UiEndpoints';
import { UiSettingsEndpoints } from '@/app/typings/categories/UiSettingsEndpoints';
import { UserManagementEndpoints } from '@/app/typings/categories/UserManagementEndpoints';
import { UserRolesEndpoints } from '@/app/typings/categories/UserRolesEndpoints';
import { UserRolesNFTEndpoints } from '@/app/typings/categories/UserRolesNFTEndpoints';
import { UsersEndpoints } from '@/app/typings/categories/UsersEndpoints';
import { UserSettingsEndpoints } from '@/app/typings/categories/UserSettingsEndpoints';
import { VersionEndpoints } from '@/app/typings/categories/VersionEndpoints';
import { VideosEndpoints } from '@/app/typings/categories/VideosEndpoints';
import { WebEndpoints } from '@/app/typings/categories/WebEndpoints';
import { ParameterConfig } from '@/app/config/ParameterConfig';

export interface EndpointConfig {
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | 'PATCH';
  description?: string;
  requiresAuth?: boolean;
  parameters?: Record<string, ParameterConfig>;
  headers?: Record<string, string>;
  timeout?: number;
  cacheable?: boolean;
  retryable?: boolean;
  retryAttempts?: number;
}

export type EndpointFunction = (...args: any[]) => EndpointConfig;

export type EndpointDefinition = EndpointConfig | EndpointFunction;

// Remove the duplicate EndpointCategory interface and use this:
export interface EndpointCategoryConfig {
  [key: string]: EndpointDefinition;
}


// Then define your specific category types separately
export type EndpointCategory = keyof EndpointConfigurations;
export type EndpointKey<T extends EndpointCategory> = keyof EndpointConfigurations[T];


export interface EndpointConfigurations {
  [category: string]: EndpointCategoryConfig; 
  apiWebBase: ApiWebBaseEndpoints;
  analytics: AnalyticsEndpoints; 
  comments: CommentsEndpoints;
  content: ContentEndpoints;
  data: DataEndpoints;
  documents: DocumentEndpoints;
  delegates: DelegatesEndpoints;
  web: WebEndpoints;
  sorting: SortingEndpoints;
  filtering: FilteringEndpoints;
  highlights: HighlightsEndpoints;
  logging: LoggingEndpoints;
  news: NewsEndpoints;
  notes: NotesEndpoints;
  projects: ProjectsEndpoints;
  searching: SearchingEndpoints;
  snapshots: SnapshotsEndpoints;
  ui: UiEndpoints;
  version: VersionEndpoints;
  tasks: TasksEndpoints;
  teams: TeamsEndpoints;
  todos: TodosEndpoints;
  users: UsersEndpoints;

  auth: AuthEndpoints;
  blogs: BlogsEndpoints;
  calendar: CalendarEndpoints;
  chat: ChatEndpoints;
  client: ClientEndpoints;
  collaborationTools: CollaborationToolsEndpoints;
  communication: CommunicationEndpoints;
  communityInteraction: CommunityInteractionEndpoints;
  crypto: CryptoEndpoints;
  dataProviders: DataProvidersEndpoints;
  dex: DexEndpoints;
  details: DetailsEndpoints;
  donations: DonationsEndpoints;
  drawing: DrawingEndpoints;
  externalAuth: ExternalAuthEndpoints;
  feedback: FeedbackEndpoints;
  files: FilesEndpoints;
  realtime: RealtimeEndpoints
  freelancers: FreelancersEndpoints;
  generators: GeneratorsEndpoints;
  globalCollaboration: GlobalCollaborationEndpoints;
  marker: MarkerEndpoints;
  moderators: ModeratorsEndpoints;
  monetization: MonetizationEndpoints;
  parameterCustomization: ParameterCustomizationEndpoints;
  payment: PaymentEndpoints;
  personas: PersonasEndpoints;
  phases: PhasesEndpoints;
  projectManagement: ProjectManagementEndpoints;
  projectOwner: ProjectOwnerEndpoints;
  randomWalk: RandomWalkEndpoints;
  registration: RegistrationEndpoints;
  reports: ReportsEndpoints;
  security: SecurityEndpoints;
  stateGovCities: StateGovCitiesEndpoints;
  teamManagement: TeamManagementEndpoints;
  theme: ThemeEndpoints;
  toolbar: ToolbarEndpoints;
  trading: TradingEndpoints;
  userManagement: UserManagementEndpoints;
  userRoles: UserRolesEndpoints;
  userRolesNFT: UserRolesNFTEndpoints;
  userSettings: UserSettingsEndpoints;
  videos: VideosEndpoints;
  database: DatabaseEndpoints;
  apiConfig: ApiConfigEndpoints;
  dev: DevEndpoints;
  participants: ParticipantsEndpoints;
  messages: MessagesEndpoints;
  screenSharing: ScreenSharingEndpoints;
  dataAnalysis: DataAnalysisEndpoints;
  logs: LogsEndpoints;
  batch: BatchEndpoints;
  uiSettings: UiSettingsEndpoints;
}