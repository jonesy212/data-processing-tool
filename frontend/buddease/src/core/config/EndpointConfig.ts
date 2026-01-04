EndpointConfig.ts
import { ParameterConfig } from '@/core/config/ParameterConfig';
import { AnalyticsEndpoints } from '@/core/typings/categories/AnalyticsEndpoints';
import { ApiConfigEndpoints } from '@/core/typings/categories/ApiConfigEndpoints';
import { ApiWebBaseEndpoints } from '@/core/typings/categories/ApiWebBaseEndpoints';
import { AuthEndpoints } from '@/core/typings/categories/AuthEndpoints';
import { BatchEndpoints } from '@/core/typings/categories/BatchEndpoints';
import { BlogsEndpoints } from '@/core/typings/categories/BlogsEndpoints';
import { CalendarEndpoints } from '@/core/typings/categories/CalendarEndpoints';
import { CategoryEndpoints } from '@/core/typings/categories/CategoryEndpoints';
import { ChatEndpoints } from '@/core/typings/categories/ChatEndpoints';
import { ClientEndpoints } from '@/core/typings/categories/ClientEndpoints';
import { CollaborationToolsEndpoints } from '@/core/typings/categories/CollaborationToolsEndpoints';
import { CommentsEndpoints } from '@/core/typings/categories/CommentsEndpoints';
import { CommunicationEndpoints } from '@/core/typings/categories/CommunicationEndpoints';
import { CommunityInteractionEndpoints } from '@/core/typings/categories/CommunityInteractionEndpoints';
import { ContentEndpoints } from '@/core/typings/categories/ContentEndpoints';
import { CryptoEndpoints } from '@/core/typings/categories/CryptoEndpoints';
import { DataAnalysisEndpoints } from '@/core/typings/categories/DataAnalysisEndpoints';
import { DatabaseEndpoints } from '@/core/typings/categories/DatabaseEndpoints';
import { DataEndpoints } from '@/core/typings/categories/DataEndpoints';
import { DataProvidersEndpoints } from '@/core/typings/categories/DataProvidersEndpoints';
import { DelegatesEndpoints } from '@/core/typings/categories/DelegatesEndpoints';
import { DetailsEndpoints } from '@/core/typings/categories/DetailsEndpoints';
import { DevEndpoints } from '@/core/typings/categories/DevEndpoints';
import { DexEndpoints } from '@/core/typings/categories/DexEndpoints';
import { DocumentEndpoints } from '@/core/typings/categories/DocumentEndpoints';
import { DonationsEndpoints } from '@/core/typings/categories/DonationsEndpoints';
import { DrawingEndpoints } from '@/core/typings/categories/DrawingEndpoints';
import { ExternalAuthEndpoints } from '@/core/typings/categories/ExternalAuthEndpoints';
import { FeedbackEndpoints } from '@/core/typings/categories/FeedbackEndpoints';
import { FilesEndpoints } from '@/core/typings/categories/FilesEndpoints';
import { FilteringEndpoints } from '@/core/typings/categories/FilteringEndpoints';
import { FreelancersEndpoints } from '@/core/typings/categories/FreelancersEndpoints';
import { GeneratorsEndpoints } from '@/core/typings/categories/GeneratorsEndpoints';
import { GlobalCollaborationEndpoints } from '@/core/typings/categories/GlobalCollaborationEndpoints';
import { HighlightsEndpoints } from '@/core/typings/categories/HighlightsEndpoints';
import { LoggingEndpoints } from '@/core/typings/categories/LoggingEndpoints';
import { LogsEndpoints } from '@/core/typings/categories/LogsEndpoints';
import { MarkerEndpoints } from '@/core/typings/categories/MarkerEndpoints';
import { MessagesEndpoints } from '@/core/typings/categories/MessagesEndpoints';
import { ModeratorsEndpoints } from '@/core/typings/categories/ModeratorsEndpoints';
import { MonetizationEndpoints } from '@/core/typings/categories/MonetizationEndpoints';
import { NewsEndpoints } from '@/core/typings/categories/NewsEndpoints';
import { NotesEndpoints } from '@/core/typings/categories/NotesEndpoints';
import { ParameterCustomizationEndpoints } from '@/core/typings/categories/ParameterCustomizationEndpoints';
import { ParticipantsEndpoints } from '@/core/typings/categories/ParticipantsEndpoints';
import { PaymentEndpoints } from '@/core/typings/categories/PaymentEndpoints';
import { PersonasEndpoints } from '@/core/typings/categories/PersonasEndpoints';
import { PhasesEndpoints } from '@/core/typings/categories/PhasesEndpoints';
import { ProjectManagementEndpoints } from '@/core/typings/categories/ProjectManagementEndpoints';
import { ProjectOwnerEndpoints } from '@/core/typings/categories/ProjectOwnerEndpoints';
import { ProjectsEndpoints } from '@/core/typings/categories/ProjectsEndpoints';
import { RandomWalkEndpoints } from '@/core/typings/categories/RandomWalkEndpoints';
import { RealtimeEndpoints } from '@/core/typings/categories/RealtimeEndpoints';
import { RegistrationEndpoints } from '@/core/typings/categories/RegistrationEndpoints';
import { ReportsEndpoints } from '@/core/typings/categories/ReportsEndpoints';
import { ScreenSharingEndpoints } from '@/core/typings/categories/ScreenSharingEndpoints';
import { SearchingEndpoints } from '@/core/typings/categories/SearchingEndpoints';
import { SecurityEndpoints } from '@/core/typings/categories/SecurityEndpoints';
import { SnapshotsEndpoints } from '@/core/typings/categories/SnapshotsEndpoints';
import { SortingEndpoints } from '@/core/typings/categories/SortingEndpoints';
import { StateGovCitiesEndpoints } from '@/core/typings/categories/StateGovCitiesEndpoints';
import { TasksEndpoints } from '@/core/typings/categories/TasksEndpoints';
import { TeamManagementEndpoints } from '@/core/typings/categories/TeamManagementEndpoints';
import { TeamsEndpoints } from '@/core/typings/categories/TeamsEndpoints';
import { ThemeEndpoints } from '@/core/typings/categories/ThemeEndpoints';
import { TodosEndpoints } from '@/core/typings/categories/TodosEndpoints';
import { ToolbarEndpoints } from '@/core/typings/categories/ToolbarEndpoints';
import { TradingEndpoints } from '@/core/typings/categories/TradingEndpoints';
import { UiEndpoints } from '@/core/typings/categories/UiEndpoints';
import { UiSettingsEndpoints } from '@/core/typings/categories/UiSettingsEndpoints';
import { UserManagementEndpoints } from '@/core/typings/categories/UserManagementEndpoints';
import { UserRolesEndpoints } from '@/core/typings/categories/UserRolesEndpoints';
import { UserRolesNFTEndpoints } from '@/core/typings/categories/UserRolesNFTEndpoints';
import { UsersEndpoints } from '@/core/typings/categories/UsersEndpoints';
import { UserSettingsEndpoints } from '@/core/typings/categories/UserSettingsEndpoints';
import { VersionEndpoints } from '@/core/typings/categories/VersionEndpoints';
import { VideosEndpoints } from '@/core/typings/categories/VideosEndpoints';
import { WebEndpoints } from '@/core/typings/categories/WebEndpoints';

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

Remove the duplicate EndpointCategory interface and use this:
export interface EndpointCategoryConfig {
  [key: string]: EndpointDefinition | EndpointCategoryConfig;
}


Then define your specific category types separately
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