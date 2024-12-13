// getPermissions.ts

import { UserRoleEnum } from "../users/UserRoles";

// Defining permissions for each role
interface Permissions {
    canViewCryptoDashboard: boolean;
    canTradeCrypto: boolean;
    canAccessAdminPanel: boolean;
    canManageProjects: boolean;
    canAnalyzeData: boolean;
    canViewReports: boolean;
    canProvideSupport: boolean;
    canEnsureCompliance: boolean;
    canManageRegion: boolean;
  }
  
  // Define a function to get permissions for each role
  const getPermissions = (role: UserRoleEnum): Permissions => {
    switch (role) {
      case UserRoleEnum.Administrator:
        return {
          canViewCryptoDashboard: true,
          canTradeCrypto: true,
          canAccessAdminPanel: true,
          canManageProjects: true,
          canAnalyzeData: true,
          canViewReports: true,
          canProvideSupport: true,
          canEnsureCompliance: true,
          canManageRegion: true
        };
      case UserRoleEnum.CryptoInvestor:
        return {
          canViewCryptoDashboard: true,
          canTradeCrypto: true,
          canAccessAdminPanel: false,
          canManageProjects: false,
          canAnalyzeData: false,
          canViewReports: false,
          canProvideSupport: false,
          canEnsureCompliance: false,
          canManageRegion: false
        };
      case UserRoleEnum.CryptoAnalyst:
        return {
          canViewCryptoDashboard: true,
          canTradeCrypto: false,
          canAccessAdminPanel: false,
          canManageProjects: false,
          canAnalyzeData: true,
          canViewReports: true,
          canProvideSupport: false,
          canEnsureCompliance: false,
          canManageRegion: false
        };
      case UserRoleEnum.BlockchainAdmin:
        return {
          canViewCryptoDashboard: true,
          canTradeCrypto: false,
          canAccessAdminPanel: true,
          canManageProjects: false,
          canAnalyzeData: false,
          canViewReports: true,
          canProvideSupport: false,
          canEnsureCompliance: true,
          canManageRegion: false
        };
      case UserRoleEnum.RegionalManager:
        return {
          canViewCryptoDashboard: false,
          canTradeCrypto: false,
          canAccessAdminPanel: false,
          canManageProjects: true,
          canAnalyzeData: false,
          canViewReports: true,
          canProvideSupport: false,
          canEnsureCompliance: false,
          canManageRegion: true
        };
      case UserRoleEnum.LegalAdvisor:
        return {
          canViewCryptoDashboard: false,
          canTradeCrypto: false,
          canAccessAdminPanel: false,
          canManageProjects: false,
          canAnalyzeData: false,
          canViewReports: true,
          canProvideSupport: false,
          canEnsureCompliance: true,
          canManageRegion: false
        };
      case UserRoleEnum.CustomerSupport:
        return {
          canViewCryptoDashboard: false,
          canTradeCrypto: false,
          canAccessAdminPanel: false,
          canManageProjects: false,
          canAnalyzeData: false,
          canViewReports: true,
          canProvideSupport: true,
          canEnsureCompliance: false,
          canManageRegion: false
        };
      default:
        return {
          canViewCryptoDashboard: false,
          canTradeCrypto: false,
          canAccessAdminPanel: false,
          canManageProjects: false,
          canAnalyzeData: false,
          canViewReports: false,
          canProvideSupport: false,
          canEnsureCompliance: false,
          canManageRegion: false
        };
    }
  };





// Example function that checks if a user can view the crypto dashboard
const canUserViewCryptoDashboard = (role: UserRoleEnum): boolean => {
    const permissions = getPermissions(role);
    return permissions.canViewCryptoDashboard;
  };
  
  // Example function that checks if a user can manage projects
  const canUserManageProjects = (role: UserRoleEnum): boolean => {
    const permissions = getPermissions(role);
    return permissions.canManageProjects;
  };
  
  // Example: Checking if a 'CryptoInvestor' can access the crypto dashboard
  const userRole = UserRoleEnum.CryptoInvestor;
  console.log(canUserViewCryptoDashboard(userRole));  // Output: true
  
  // Example: Checking if a 'CryptoInvestor' can manage projects
  console.log(canUserManageProjects(userRole));  // Output: false