// useAuthentication.tsx
import { useEffect, useState } from 'react';
import { EventActions } from '../actions/EventActions';

const useAuthentication = () => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = (userData: any) => {
    // Logic to handle user login
    setUser(userData);
    setIsLoggedIn(true);
    EventActions.userLoggedIn(userData)
  };

  const logout = () => {
    // Logic to handle user logout
    setUser(null);
    setIsLoggedIn(false);
    EventActions.userLoggedOut({ payload: null });
  };

  useEffect(() => {
    // Check for session on mount
    // You can implement session management logic here
    // e.g., check if the user is already logged in via localStorage cookies
    EventActions.checkAuthentication();
  }, []);

  return {
    user,
    isLoggedIn,
    login,
    logout,
  };
};

export default useAuthentication;
