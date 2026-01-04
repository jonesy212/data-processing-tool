RouteGuard.tsx
import { fuzzyMatchEntities } from '@/core/routing/FuzzyMatch';
import { useAuth } from '@/core/state/context/AuthContext';
import { useRouter } from 'next/navigation';
import React from 'react';

interface RouteGuardProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  requiredRoles?: string[];
  fallbackPath?: string;
  enableFuzzyAuth?: boolean;
}

Main component as default export
const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  requiredPermissions = [],
  requiredRoles = [],
  fallbackPath = '/unauthorized',
  enableFuzzyAuth = false
}) => {
  const { user, isAuthenticated, hasPermission, hasRole } = useAuth();
  const router = useRouter();

  // Check if user has required permissions using fuzzy matching if enabled
  const checkPermissions = async (): Promise<boolean> => {
    if (!enableFuzzyAuth) {
      return requiredPermissions.every(permission => 
        hasPermission(permission)
      );
    }

    // Fuzzy permission matching for similar permissions
    const userPermissions = user?.permissions || [];
    const permissionEntities = userPermissions.map(perm => ({
      id: perm,
      name: perm,
      description: `Permission: ${perm}`,
      source: 'user',
      type: 'permission' as const,
      createdBy: user?.id,
      createdAt: new Date()
    }));

    const matchedPermissions = await fuzzyMatchEntities(
      requiredPermissions.join(' '),
      permissionEntities
    );

    return matchedPermissions.length >= requiredPermissions.length;
  };

  // Check if user has required roles
  const checkRoles = (): boolean => {
    return requiredRoles.every(role => hasRole(role));
  };

  React.useEffect(() => {
    const validateAccess = async () => {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      const hasRequiredPermissions = await checkPermissions();
      const hasRequiredRoles = checkRoles();

      if (!hasRequiredPermissions || !hasRequiredRoles) {
        router.push(fallbackPath);
      }
    };

    validateAccess();
  }, [isAuthenticated, user, requiredPermissions.join(','), requiredRoles.join(',')]);

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};

Higher Order Component version (named export)
export const withRouteGuard = (
  Component: React.ComponentType,
  guardOptions: Omit<RouteGuardProps, 'children'> = {}
) => {
  return function ProtectedComponent(props: any) {
    return (
      <RouteGuard {...guardOptions}>
        <Component {...props} />
      </RouteGuard>
    );
  };
};

Export RouteGuard as default
export default RouteGuard;