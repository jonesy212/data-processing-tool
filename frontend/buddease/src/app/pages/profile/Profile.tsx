// Profile.tsx
import React from 'react';
import UserDetails, { User } from '../../components/users/User'; // Import the User interface

interface ProfileProps {
  user: User; // Pass the user data as props
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  return (
    <div>
      <h1>User Profile</h1>
      <UserDetails user={user} /> {/* Render the UserDetails component */}
      {/* Additional profile-related components and functionality */}
    </div>
  );
};

export default Profile;
