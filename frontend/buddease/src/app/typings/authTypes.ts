// authTypes.ts
// types/auth.ts (shared between frontend and backend)


export interface LoginResult {
  success: boolean;
  accessToken?: string;
  user?: any;
  roles?: string[];
  permissions?: string[];
  error?: string;
  code?: string;
  dashboardConfig?: DashboardConfig;
}

export interface DashboardConfig {
  title: string;
  content: React.ReactNode;
  sidebarContent?: React.ReactNode;
  redirectPath?: string;
  userRole?: string;
  permissions?: string[];
}

export interface DashboardLoaderProps {
  dashboardConfig: DashboardConfig;
}