import React from 'react';
import { LazyRouteFunction, Navigate, NonIndexRouteObject, RouteProps as ReactRouteProps, Route } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

interface ProtectedRouteProps extends Omit<ReactRouteProps, 'component'> {
  component: React.ComponentType<any>;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  component: Component,
  ...rest
}) => {
  const { state } = useAuth();

  const renderContent: React.FC<any> = (props) => {
    return state.isAuthenticated ? (
      <Component {...props} />
    ) : (
      <Navigate to="/login" replace />
    );
  };

  // Adjusted lazy to be a function that returns a Promise with JSX.Element type
  const lazy = state.isAuthenticated
    ? undefined
    : async () => {
        const protectedRoute = await import("@/forms/LoginForm");
        const Component = protectedRoute.default;
        return {
          default: (props: any) => <Component onSubmit={() => {}} {...props} />,
        };
      };

  return (
    <Route
      {...rest}
      element={<>{renderContent}</>}
      lazy={lazy as unknown as LazyRouteFunction<NonIndexRouteObject>}
      index={false}
    />
  );
};

export default ProtectedRoute;
export type { ProtectedRouteProps };
