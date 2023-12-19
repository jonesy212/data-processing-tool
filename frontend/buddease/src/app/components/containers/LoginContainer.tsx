// LoginContainer.tsx
import Dashboard from '@/app/pages/dashboards/RecruiterSeekerDashboard';
import { performLogin } from "@/app/pages/forms/utils/CommonLoginLogic";
import LoginForm from '@/forms/LoginForm';
import React, { useState } from 'react';

const LoginContainer: React.FC = () => {
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLoginSubmit = async (
    username: string,
    password: string,
    onSuccess: () => unknown,
    onError: (error: string) => void
  ) => {
    // Add return type to performLogin
    const loginResult: LoginResult = await performLogin(
      username,
      password,
      onSuccess,
      onError
    );

    // Add type to loginResult
    interface LoginResult {
      success: boolean;
      error?: Error;
    }

    let isSuccess = false;
    if (loginResult.success) {
      isSuccess = true;
      setLoggedIn(true);
      onSuccess();
    } else {
      isSuccess = false;
      onError(loginResult.error as unknown as string);
    }

    // Return proper LoginResult value
    return { success: loginResult.success };
  };

  return loggedIn ? <Dashboard /> : <LoginForm onSubmit={handleLoginSubmit} />;
};

export default LoginContainer;
