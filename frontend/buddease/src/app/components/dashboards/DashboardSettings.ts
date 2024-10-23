// Define the DashboardPreferenceEnum to represent various dashboard preferences
export enum DashboardPreferenceEnum {
  Theme = 'Theme',
  Layout = 'Layout',
  ShowNotifications = 'ShowNotifications',
  ShowRecentActivities = 'ShowRecentActivities',
  ShowTasks = 'ShowTasks',
  ShowCalendar = 'ShowCalendar',
  ShowWeather = 'ShowWeather',
  DefaultTab = 'DefaultTab',
  EnableWidgets = 'EnableWidgets',
  WidgetPreferences = 'WidgetPreferences',
  ShowProjectSummary = 'ShowProjectSummary',
  ShowTeamSummary = 'ShowTeamSummary',
  DashboardType = 'DashboardType',  // New preference for dashboard type

}

export enum DashboardTypeEnum {
    AnimatedDashboard = 'AnimatedDashboard',
    AdapterDashboard = 'AdapterDashboard',
    BugTrackingDashboard = 'BugTrackingDashboard',
    ChatDashboard = 'ChatDashboard',
    CollaborationDashboard = 'CollaborationDashboard',
    DataDashboard = 'DataDashboard',
    DesignDashboard = 'DesignDashboard',
    RealTimeDashboardPage = 'RealTimeDashboardPage',
    RecruiterSeekerDashboard = 'RecruiterSeekerDashboard',
    SearchableVisualFlowDashboard = 'SearchableVisualFlowDashboard',
    UserDashboard = 'UserDashboard',
    UserPreferencesDashboard = 'UserPreferencesDashboard',
    VisualFlowDashboard = 'VisualFlowDashboard',
    PricingDashboard = 'PricingDashboard',
    MediaDashboard = 'MediaDashboard',
    BugComments = 'BugComments',
    BugFilter = 'BugFilter',
    BugList = 'BugList',
    BugSort = 'BugSort',
    BugStatusUpdate = 'BugStatusUpdate',
    BugTable = 'BugTable',
    CollaborationPanel = 'CollaborationPanel',
    DashboardLoader = 'DashboardLoader',
    DashboardOverview = 'DashboardOverview',
    DirectoryExplorer = 'DirectoryExplorer',
    FileStructureViewer = 'FileStructureViewer',
    ScheduleEventDashboard = 'ScheduleEventDashboard',
  }
  


interface DashboardSettings {
  [key: string]: any; // General type for various settings
  theme: string; // E.g., 'light', 'dark'
  layout: string; // E.g., 'grid', 'list'
  showNotifications: boolean;
  showRecentActivities: boolean;
  showTasks: boolean;
  showCalendar: boolean;
  showWeather: boolean;
  defaultTab: string; // E.g., 'home', 'tasks'
  enableWidgets: boolean;
  widgetPreferences: WidgetPreferences; // Assuming WidgetPreferences is a defined interface
  showProjectSummary: boolean;
  showTeamSummary: boolean;
}

interface WidgetPreferences {
  [widgetName: string]: {
    position: string; // E.g., 'top-left', 'bottom-right'
    size: string; // E.g., 'small', 'medium', 'large'
  };
}

// Example usage
const userDashboardSettings: DashboardSettings = {
  theme: 'dark',
  layout: 'grid',
  showNotifications: true,
  showRecentActivities: true,
  showTasks: true,
  showCalendar: false,
  showWeather: true,
  defaultTab: 'home',
  enableWidgets: true,
  widgetPreferences: {
    weatherWidget: {
      position: 'top-right',
      size: 'medium',
    },
    taskWidget: {
      position: 'top-left',
      size: 'large',
    },
  },
  showProjectSummary: true,
  showTeamSummary: false,
};

export type {DashboardSettings}