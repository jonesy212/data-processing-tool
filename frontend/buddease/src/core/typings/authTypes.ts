// authTypes.ts
// types/auth.ts (shared between frontend and backend)
import { Permission } from '@/core/permissions/Permission';

export interface LoginResult {
  success: boolean;
  accessToken: string;
  user?: UserInfo;
  roles?: string[];
  permissions?: Permission[] | string[];
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
  user?: string
}

export interface DashboardLoaderProps {
  dashboardConfig: DashboardConfig;
}