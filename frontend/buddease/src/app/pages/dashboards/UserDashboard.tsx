import { useAuth } from '@/app/components/auth/AuthContext';
import ProjectTimelineDashboard from '@/app/components/projects/projectManagement/ProjectTimelineDashboard';
import { User } from '@/app/components/users/User';
import React from 'react';
import { Link } from 'react-router-dom';

const UserDashboard: React.FC = () => {
  // Assuming you have a context or state to get user data
  const { state } = useAuth();
  
  const userData = (state.user as User)?.data;

  return (
    <div>
      <h1>Welcome to the Dashboard</h1>
      <p>User's Datasets: { userData?.datasets }</p>
      <p>Preprocessing Tasks:</p>
      <ul>
        {userData?.tasks?.map((task, index) => (
          <li key={task.id || index}>
            Task ID: {task.id}
            {/* Add additional task details here */}
          </li>
        )) || <p>No tasks available</p>}
      </ul>
      {/* Display the new ProjectTimelineDashboard component */}
      <ProjectTimelineDashboard />
      {/* Add any additional content based on the user's data */}
     {/* Add links to the User Support pages */}
      <ul>
        <li><Link to="/user-support">User Support Dashboard</Link></li>
        <li><Link to="/user-support-feedback">User Support Feedback Page</Link></li>
        <li><Link to="/user-support-chat">User Support Chat Page</Link></li>
        <li><Link to="/user-support-knowledge-base">User Support Knowledge Base Page</Link></li>
      </ul>
    </div>
  );
};

export default UserDashboard;


