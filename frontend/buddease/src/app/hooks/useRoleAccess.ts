// useRoleAccess.ts
// hooks/useRoleAccess.ts
import { useState, useEffect } from 'react';
import UserRoles, { UserRoleEnum } from '@/app/models/UserRoles';

export type Permission = 
  | 'view:file-structure'
  | 'view:frontend-structure'
  | 'modify:file-structure'
  | 'manage:file-structure';

interface UseRoleAccessProps {
  userRole: UserRoleEnum;
  requiredPermission: Permission;
}

export const useRoleAccess = ({ userRole, requiredPermission }: UseRoleAccessProps) => {
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAccess = () => {
      try {
        const role = UserRoles[userRole];
        if (!role) {
          console.warn(`Role ${userRole} not found in UserRoles`);
          setHasAccess(false);
          return;
        }

        const userHasAccess = role.permissions.includes(requiredPermission);
        setHasAccess(userHasAccess);
      } catch (error) {
        console.error('Error checking role access:', error);
        setHasAccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [userRole, requiredPermission]);

  return { hasAccess, isLoading };
};

// Hook to get current user role (mock implementation - replace with your auth system)
export const useCurrentUser = () => {
  // In a real app, this would come from your authentication context
  const [userRole, setUserRole] = useState<UserRoleEnum>(UserRoleEnum.Member);
  
  // Mock function to simulate getting user role
  const getUserRole = (): UserRoleEnum => {
    // This would typically come from your auth context or API
    return UserRoleEnum.Member; // Default to Member
  };

  useEffect(() => {
    const role = getUserRole();
    setUserRole(role);
  }, []);

  return { userRole };
};