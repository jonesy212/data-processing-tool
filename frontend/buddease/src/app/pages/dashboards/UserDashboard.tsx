import { useAuth } from '@/app/components/auth/AuthContext';
import { User } from '@/app/components/todos/tasks/User';
import React from 'react';

const UserDashboard: React.FC = () => {
  // Assuming you have a context or state to get user data
  const { state } = useAuth();
  

  const userData = (state.user as User)?.data;

  return (
    <div>
      <h1>Welcome to the Dashboard</h1>
      <p>User's Datasets: {userData?.datasets}</p>
      <p>Preprocessing Tasks: {userData?.tasks}</p>
      {/* Add any additional content based on the user's data */}
    </div>
  );
};

export default UserDashboard;


