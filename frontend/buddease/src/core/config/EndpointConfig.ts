// EndpointConfig.ts
import type { ParameterConfig } from '@/core/config/ParameterConfig';
import type { AnalyticsEndpoints } from '@/core/typings/categories/AnalyticsEndpoints';
import type { ApiConfigEndpoints } from '@/core/typings/categories/ApiConfigEndpoints';
import type { ApiWebBaseEndpoints } from '@/core/typings/categories/ApiWebBaseEndpoints';
import type { AuthEndpoints } from '@/core/typings/categories/AuthEndpoints';
import type { BatchEndpoints } from '@/core/typings/categories/BatchEndpoints';
import type { BlogsEndpoints } from '@/core/typings/categories/BlogsEndpoints';
import type { CalendarEndpoints } from '@/core/typings/categories/CalendarEndpoints';
import type { CategoryEndpoints } from '@/core/typings/categories/CategoryEndpoints';
import type { ChatEndpoints } from '@/core/typings/categories/ChatEndpoints';
import type { ClientEndpoints } from '@/core/typings/categories/ClientEndpoints';
import type { CollaborationToolsEndpoints } from '@/core/typings/categories/CollaborationToolsEndpoints';
import type { CommentsEndpoints } from '@/core/typings/categories/CommentsEndpoints';
import type { CommunicationEndpoints } from '@/core/typings/categories/CommunicationEndpoints';
import type { CommunityInteractionEndpoints } from '@/core/typings/categories/CommunityInteractionEndpoints';
import type { ContentEndpoints } from '@/core/typings/categories/ContentEndpoints';
import type { CryptoEndpoints } from '@/core/typings/categories/CryptoEndpoints';
import type { DataAnalysisEndpoints } from '@/core/typings/categories/DataAnalysisEndpoints';
import type { DatabaseEndpoints } from '@/core/typings/categories/DatabaseEndpoints';
import type { DataEndpoints } from '@/core/typings/categories/DataEndpoints';
import type { DataProvidersEndpoints } from '@/core/typings/categories/DataProvidersEndpoints';
import type { DelegatesEndpoints } from '@/core/typings/categories/DelegatesEndpoints';
import type { DetailsEndpoints } from '@/core/typings/categories/DetailsEndpoints';
import type { DevEndpoints } from '@/core/typings/categories/DevEndpoints';
import type { DexEndpoints } from '@/core/typings/categories/DexEndpoints';
import type { DocumentEndpoints } from '@/core/typings/categories/DocumentEndpoints';
import type { DonationsEndpoints } from '@/core/typings/categories/DonationsEndpoints';
import type { DrawingEndpoints } from '@/core/typings/categories/DrawingEndpoints';
import type { ExternalAuthEndpoints } from '@/core/typings/categories/ExternalAuthEndpoints';
import type { FeedbackEndpoints } from '@/core/typings/categories/FeedbackEndpoints';
import type { FilesEndpoints } from '@/core/typings/categories/FilesEndpoints';
import type { FilteringEndpoints } from '@/core/typings/categories/FilteringEndpoints';
import type { FreelancersEndpoints } from '@/core/typings/categories/FreelancersEndpoints';
import type { GeneratorsEndpoints } from '@/core/typings/categories/GeneratorsEndpoints';
import type { GlobalCollaborationEndpoints } from '@/core/typings/categories/GlobalCollaborationEndpoints';
import type { HighlightsEndpoints } from '@/core/typings/categories/HighlightsEndpoints';
import type { LoggingEndpoints } from '@/core/typings/categories/LoggingEndpoints';
import type { LogsEndpoints } from '@/core/typings/categories/LogsEndpoints';
import type { MarkerEndpoints } from '@/core/typings/categories/MarkerEndpoints';
import type { MessagesEndpoints } from '@/core/typings/categories/MessagesEndpoints';
import type { ModeratorsEndpoints } from '@/core/typings/categories/ModeratorsEndpoints';
import type { MonetizationEndpoints } from '@/core/typings/categories/MonetizationEndpoints';
import type { NewsEndpoints } from '@/core/typings/categories/NewsEndpoints';
import type { NotesEndpoints } from '@/core/typings/categories/NotesEndpoints';
import type { ParameterCustomizationEndpoints } from '@/core/typings/categories/ParameterCustomizationEndpoints';
import type { ParticipantsEndpoints } from '@/core/typings/categories/ParticipantsEndpoints';
import type { PaymentEndpoints } from '@/core/typings/categories/PaymentEndpoints';
import type { PersonasEndpoints } from '@/core/typings/categories/PersonasEndpoints';
import type { PhasesEndpoints } from '@/core/typings/categories/PhasesEndpoints';
import type { ProjectManagementEndpoints } from '@/core/typings/categories/ProjectManagementEndpoints';
import type { ProjectOwnerEndpoints } from '@/core/typings/categories/ProjectOwnerEndpoints';
import type { ProjectsEndpoints } from '@/core/typings/categories/ProjectsEndpoints';
import type { RandomWalkEndpoints } from '@/core/typings/categories/RandomWalkEndpoints';
import type { RealtimeEndpoints } from '@/core/typings/categories/RealtimeEndpoints';
import type { RegistrationEndpoints } from '@/core/typings/categories/RegistrationEndpoints';
import type { ReportsEndpoints } from '@/core/typings/categories/ReportsEndpoints';
import type { ScreenSharingEndpoints } from '@/core/typings/categories/ScreenSharingEndpoints';
import type { SearchingEndpoints } from '@/core/typings/categories/SearchingEndpoints';
import type { SecurityEndpoints } from '@/core/typings/categories/SecurityEndpoints';
import type { SnapshotsEndpoints } from '@/core/typings/categories/SnapshotsEndpoints';
import type { SortingEndpoints } from '@/core/typings/categories/SortingEndpoints';
import type { StateGovCitiesEndpoints } from '@/core/typings/categories/StateGovCitiesEndpoints';
import type { TasksEndpoints } from '@/core/typings/categories/TasksEndpoints';
import type { TeamManagementEndpoints } from '@/core/typings/categories/TeamManagementEndpoints';
import type { TeamsEndpoints } from '@/core/typings/categories/TeamsEndpoints';
import type { ThemeEndpoints } from '@/core/typings/categories/ThemeEndpoints';
import type { TodosEndpoints } from '@/core/typings/categories/TodosEndpoints';
import type { ToolbarEndpoints } from '@/core/typings/categories/ToolbarEndpoints';
import type { TradingEndpoints } from '@/core/typings/categories/TradingEndpoints';
import type { UiEndpoints } from '@/core/typings/categories/UiEndpoints';
import type { UiSettingsEndpoints } from '@/core/typings/categories/UiSettingsEndpoints';
import type { UserManagementEndpoints } from '@/core/typings/categories/UserManagementEndpoints';
import type { UserRolesEndpoints } from '@/core/typings/categories/UserRolesEndpoints';
import type { UserRolesNFTEndpoints } from '@/core/typings/categories/UserRolesNFTEndpoints';
import type { UsersEndpoints } from '@/core/typings/categories/UsersEndpoints';
import type { UserSettingsEndpoints } from '@/core/typings/categories/UserSettingsEndpoints';
import type { VersionEndpoints } from '@/core/typings/categories/VersionEndpoints';
import type { VideosEndpoints } from '@/core/typings/categories/VideosEndpoints';
import type { WebEndpoints } from '@/core/typings/categories/WebEndpoints';

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
  [key: string]: EndpointDefinition | EndpointCategoryConfig;
}


// Then define your specific category types separately
export type EndpointCategory = keyof EndpointConfigurations;
export type EndpointKey<T extends EndpointCategory> = keyof EndpointConfigurations[T];


export interface EndpointConfigurations {
  [category: string]: EndpointCategoryConfig | any;
  apiConfig: ApiConfigEndpoints;
  apiWebBase: ApiWebBaseEndpoints;
  analytics: AnalyticsEndpoints; 
  categoriesEndpoints: CategoryEndpoints,
  comments: CommentsEndpoints;
  // conference: ConferenceEndpoints
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
  dev: DevEndpoints;
  participants: ParticipantsEndpoints;
  messages: MessagesEndpoints;
  screenSharing: ScreenSharingEndpoints;
  dataAnalysis: DataAnalysisEndpoints;
  logs: LogsEndpoints;
  batch: BatchEndpoints;
  uiSettings: UiSettingsEndpoints;
}