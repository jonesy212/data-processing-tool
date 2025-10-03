// Unauthorized.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { NotificationTypeEnum } from '@/context/NotificationContext';
import { NotificationPosition } from '@/app/models/data/StatusType';

export default function Unauthorized() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { notify } = useNotification();

  const handleReturnToLogin = () => {
    // Log unauthorized access attempt
    notify(
      'unauthorized_access',
      `Unauthorized access attempt by ${user?.username || 'unknown user'}`,
      '',
      new Date(),
      NotificationTypeEnum.WARNING,
      NotificationPosition.TopRight
    );
    
    // Redirect to login
    navigate('/login');
  };

  const handleGoToDashboard = () => {
    // Redirect to user's appropriate dashboard based on role
    const userRole = user?.roles?.[0] || 'user';
    const dashboardPaths: Record<string, string> = {
      'admin': '/admin-dashboard',
      'manager': '/manager-dashboard', 
      'user': '/dashboard'
    };
    
    navigate(dashboardPaths[userRole] || '/dashboard');
  };

  const handleContactSupport = () => {
    // Log support request
    notify(
      'support_request',
      'User requested support for unauthorized access',
      '',
      new Date(),
      NotificationTypeEnum.INFO,
      NotificationPosition.TopRight
    );
    
    // Redirect to support or open contact form
    navigate('/support', { 
      state: { 
        issue: 'unauthorized_access',
        requestedPath: window.location.pathname 
      } 
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🚫</span>
          </div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this page.
          </p>
          
          {/* Show user context if available */}
          {user && (
            <div className="bg-gray-50 p-3 rounded-md text-sm mb-4">
              <p className="text-gray-700">
                Logged in as: <strong>{user.username}</strong>
              </p>
              <p className="text-gray-600">
                Roles: {user.roles?.join(', ') || 'No roles assigned'}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {/* Primary action - return to safe area */}
          <button
            onClick={handleGoToDashboard}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Go to My Dashboard
          </button>

          {/* Secondary actions */}
          <button
            onClick={handleReturnToLogin}
            className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Return to Login
          </button>

          {/* Support action */}
          <button
            onClick={handleContactSupport}
            className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Contact Support
          </button>

          {/* Logout option */}
          {user && (
            <button
              onClick={handleLogout}
              className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Logout & Return to Login
            </button>
          )}
        </div>

        {/* Additional help text */}
        <div className="mt-6 text-sm text-gray-500">
          <p>
            If you believe this is an error, please contact your administrator 
            or system support with details about what you were trying to access.
          </p>
        </div>
      </div>
    </div>
  );
}