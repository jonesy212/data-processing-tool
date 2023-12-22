// useAuthentication.tsx
import { useEffect, useState } from 'react';

const useAuthentication = () => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = (userData: any) => {
    // Logic to handle user login
    setUser(userData);
    setIsLoggedIn(true);
  };

  const logout = () => {
    // Logic to handle user logout
    setUser(null);
    setIsLoggedIn(false);
  };

  useEffect(() => {
    // Check for session on mount
    // You can implement session management logic here
    // e.g., check if the user is already logged in
  }, []);

  return {
    user,
    isLoggedIn,
    login,
    logout,
  };
};

export default useAuthentication;
