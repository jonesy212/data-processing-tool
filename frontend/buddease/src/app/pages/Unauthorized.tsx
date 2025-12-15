// Unauthorized.tsx
import AccessDenied from '@/app/pages/AccessDenied';
import { NotificationTypeEnum } from '@/app/features/support/UnifiedNotificationTypes';
import { NotificationPosition } from '@/app/models/data/StatusType';
import { useAuth } from '@/app/state/context/AuthContext';
import { useNotification } from '@/app/state/context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { unauthorizedService } from '@/app/services/unauthorizedService'

export default function Unauthorized() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleReturnToLogin = () => {
    unauthorizedService.notifyUnauthorizedAccess(user, window.location.pathname);
    navigate('/login');
  };

  const handleGoToDashboard = () => {
    const userRole = user?.roles?.[0] || 'user';
    const dashboardPaths: Record<string, string> = {
      'admin': '/admin-dashboard',
      'manager': '/manager-dashboard', 
      'user': '/dashboard'
    };
    const targetPath = dashboardPaths[userRole] || '/dashboard';
    
    unauthorizedService.notifyDashboardRedirect(user, targetPath);
    navigate(targetPath);
  };

  const handleContactSupport = () => {
    unauthorizedService.notifySupportRequest(user, window.location.pathname);
    navigate('/support', { 
      state: { 
        issue: 'unauthorized_access',
        requestedPath: window.location.pathname 
      } 
    });
  };

  const handleLogout = () => {
    unauthorizedService.notifyLogout(user, 'unauthorized_access_redirect');
    logout();
    navigate('/login');
  };


  // Custom actions for the AccessDenied component
  const customActions = [
    {
      label: 'Go to My Dashboard',
      onClick: handleGoToDashboard,
      primary: true
    },
    {
      label: 'Return to Login',
      onClick: handleReturnToLogin
    },
    {
      label: 'Contact Support',
      onClick: handleContactSupport
    },
    ...(user ? [{
      label: 'Logout & Return to Login',
      onClick: handleLogout,
      danger: true
    }] : [])
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <AccessDenied 
        type="unauthorized"
        feature="this page"
        message="You don't have permission to access this page."
        customActions={customActions}
        userContext={user ? {
          username: user.username,
          roles: user.roles?.join(', ') || 'No roles assigned'
        } : undefined}
        showHelpText={true}
      />
    </div>
  );
}