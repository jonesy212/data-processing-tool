import { CodingLanguageEnum, LanguageEnum } from "@/app/components/communications/LanguageEnum";
import { DashboardPreferenceEnum } from "@/app/components/dashboards/DashboardSettings";
import { FileTypeEnum } from "@/app/components/documents/FileType";
import { FilterOptions } from "@/app/components/models/data/DataFilterForm";
import { PrivacySettingEnum } from "@/app/components/models/data/StatusType";
import { NotificationPreferenceEnum } from "@/app/components/notifications/Notification";
import { SecurityFeatureEnum } from "@/app/components/security/SecurityFeatureEnum";
import { CalendarSettingsEnum } from "@/app/components/settings/CalendarSettingsEnum";
import { SortCriteria } from "@/app/components/settings/SortCriteria";

interface NewsOptions {
  newsCategory: string; // Example: 'technology', 'business', etc.
  newsLanguage: string; // Example: 'english', 'spanish', etc.
  sortBy: SortCriteria; // Sorting criteria for news articles
  searchKeywords: string[]; // Keywords to search within news content
  excludeKeywords: string[]; // Keywords to exclude from news content
  fromDateTime?: Date; // Filter news from a specific date/time
  toDateTime?: Date; // Filter news until a specific date/time
  maxResults?: number; // Maximum number of news articles to fetch
  country?: string; // Country filter for news sources (e.g., 'us', 'uk')
  sources?: string[]; // Specific news sources to include
  excludeSources?: string[]; // Specific news sources to exclude
  isBreakingNews?: boolean; // Filter for breaking news articles
  isOpinionPiece?: boolean; // Filter for opinion/editorial articles
  isExclusive?: boolean; // Filter for exclusive news content
  isLocalNews?: boolean; // Filter for local news articles
  topicsOfInterest?: string[]; // User-defined topics of interest for personalized news
  minReadTimeMinutes?: number; // Minimum required reading time for news articles
  maxReadTimeMinutes?: number; // Maximum allowed reading time for news articles
  isHighlight?: boolean; // Filter for highlighted or featured news
  isPaidContent?: boolean; // Filter for paid subscription content
  // Add more specific properties related to news if needed
}


interface SearchOptions extends FilterOptions {
  size: SearchSize;
    animations: SearchAnimationOptions;
    additionalOptions: AdditionalOptions;
  additionalOption2: string | undefined;
  communicationMode: "email" | "phone" | "chat";
  defaultFileType: FileTypeEnum
  realTimeUpdates: boolean;
  theme: string;
  language: LanguageEnum | CodingLanguageEnum;
  notificationPreferences: NotificationPreferenceEnum;
  privacySettings: PrivacySettingEnum[];
  taskManagement: boolean;
  projectView: string;
  calendarSettings: CalendarSettingsEnum | undefined;
  dashboardPreferences: DashboardPreferenceEnum | undefined;
  securityFeatures: SecurityFeatureEnum[];
  newsOptions: NewsOptions;
  }
  
  type SearchSize = "small" | "medium" | "large" | "custom";
  

  interface SearchAnimationOptions {
    type: AnimationType;
    duration?: number;
    easing?: string;
  }
  
  type AnimationType = "slide" | "fade" | "custom" | "show";
  
  interface AdditionalOptions {
    filters?: Filter[];
    sorting?: SortingOption;
    pagination?: PaginationOptions;
    // Add more additional options as needed
  }
  
  interface Filter {
    name: string;
    value: any;
    // Add more filter properties as needed
  }

  // Define your custom filter structure
interface CustomFilter {
  [key: string]: any;
  operator: "",
  value: ""
}

  
  interface SortingOption {
    field: string;
    order: "asc" | "desc";
  }
  
  interface PaginationOptions {
    currentPage?: number;
    pageSize?: number;
    mode?: "client" | "server" | "off";
    totalItems: number;
    totalPages: number;
  }
    

  
  // Define searchOptions object
  const searchOptions: SearchOptions = {
    size: "medium",
    animations: {
      type: "slide",
      duration: 300,
    },
    additionalOptions: {
      filters: [],
      sorting: {
        field: "title",
        order: "asc",
      },
      pagination: {
        currentPage: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 0
      }
    },
    additionalOption2: undefined,
    communicationMode: "email",
    defaultFileType: FileTypeEnum.UnknownType,
    realTimeUpdates: false,
    theme: "",
    language: LanguageEnum.English,
    notificationPreferences: NotificationPreferenceEnum.Email,
    privacySettings: [],
    taskManagement: false,
    projectView: "",
    calendarSettings: undefined,
    dashboardPreferences: undefined,
    securityFeatures: [],
    newsOptions: {
      newsCategory: "",
      newsLanguage: "",
      sortBy: SortCriteria.Newest,
      searchKeywords: [],
      excludeKeywords: []
    }
  };




// Assume 'options' is provided elsewhere
const options: SearchOptions = {
  communicationMode: "email", // Example communication mode
  size: "medium",
  animations: {
    type: "slide",
    duration: 300,
  },
  additionalOptions: {
    filters: [],
  },
  additionalOption2: undefined,
  defaultFileType: FileTypeEnum.Document,
  realTimeUpdates: false,
  theme: "",
  language: LanguageEnum.English,
  notificationPreferences: NotificationPreferenceEnum.Email,
  privacySettings: [],
  taskManagement: false,
  projectView: "",
  calendarSettings: undefined,
  dashboardPreferences: undefined,
  securityFeatures: [],
  newsOptions: {
    newsCategory: "",
    newsLanguage: "",
    sortBy: SortCriteria.Date,
    searchKeywords: [],
    excludeKeywords: []
  }
};
export type { CustomFilter, AdditionalOptions, PaginationOptions, SearchAnimationOptions, SearchOptions, SearchSize, SortingOption };
  
  export { searchOptions };
