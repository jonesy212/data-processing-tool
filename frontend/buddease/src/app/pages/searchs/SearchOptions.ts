import { CodingLanguageEnum, LanguageEnum } from "@/app/components/communications/LanguageEnum";
import { DashboardPreferenceEnum } from "@/app/components/dashboards/DashboardSettings";
import { FileTypeEnum } from "@/app/components/documents/FileType";
import { PrivacySettingEnum } from "@/app/components/models/data/StatusType";
import { NotificationPreferenceEnum } from "@/app/components/notifications/Notification";
import { SecurityFeatureEnum } from "@/app/components/security/SecurityFeatureEnum";
import { CalendarSettingsEnum } from "@/app/components/settings/CalendarSettingsEnum";
import { FilterOptions } from "@/app/components/models/data/DataFilterForm";


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
  
  interface SortingOption {
    field: string;
    order: "asc" | "desc";
  }
  
  interface PaginationOptions {
    page: number;
    pageSize: number;
  }
    
    
// example implementation of search options
   
// Inside your component

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
        page: 1,
        pageSize: 10,
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
  securityFeatures: []
};
export type { AdditionalOptions, PaginationOptions, SearchAnimationOptions, SearchOptions, SearchSize, SortingOption };
  
export {searchOptions}