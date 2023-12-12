// LoginContainer.tsx
import Dashboard from '@/app/pages/dashboards/RecruiterSeekerDashboard';
import { performLogin } from "@/app/pages/forms/utils/CommonLoginLogic";
import LoginForm from '@/forms/LoginForm';
import React, { useState } from 'react';

const LoginContainer: React.FC = () => {
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLoginSubmit = (username: string, password: string) => {
    performLogin(
      username,
      password,
      () => {
        // onSuccess callback
      },
      (error) => {
        // onError callback
      }
    );
  };

  return loggedIn ? (
    <Dashboard />
  ) : (
    <LoginForm
      setUsername={() => {}}
      setPassword={() => {}}
      onSubmit={handleLoginSubmit}
    />
  );
};

export default LoginContainer;
