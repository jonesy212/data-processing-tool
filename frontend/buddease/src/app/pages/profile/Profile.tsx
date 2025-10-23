// Profile.tsx
import UserDetails, { User } from '@/app/components/users/User'; // Import the User interface
import PersonaTypeEnum, { PersonaBuilder, PersonaData } from '@/personas/PersonaBuilder';
import React from 'react';

interface ProfileProps {
  user: User; // Pass the user data as props
  props: ProfileAccessControl;
}

type ActivityStatus =  "active" | "inactive" | "away" | "busy" | "offline";

// Define the profile access control interface
interface ProfileAccessControl {
  // Privacy Levels
  isPrivate: boolean;
  isPrivateOnly: boolean; 
  isPrivateOnlyForContacts: boolean; 
  isPrivateOnlyForGroups: boolean; 
  friendsOnly: boolean;
  
  // Messaging Controls
  allowMessagesFromNonContacts: boolean;
  allowMessagesFromFriendContacts: boolean;
  canSendMessages: boolean;
  
  // Visibility Controls
  canViewProfile: boolean;
  canSeeFriends: boolean;
  canSeeActivity: boolean;
  canSeeOnlineStatus: boolean;
  canSeeLastSeen: boolean;
  canSeeProfilePicture: boolean;
  canSeePosts: boolean;
  canSeeContactInfo: boolean;
  canSeeMutualFriends: boolean;
  
  // Interaction Controls
  allowTagging: boolean;
  canCommentOnPosts: boolean;
  canAddToGroups: boolean;
  canShareProfile: boolean;
  
  // Security & Blocking
  blockList: string[];
  isAuthorized: boolean;
  shareProfileWithSearchEngines: boolean;
  
  // Status
  activityStatus: ActivityStatus;
}

const Profile: React.FC<ProfileProps> = ({ user, props }) => {
  // Assume personaData is available
  const personaData: PersonaData = {
    // Populate persona data as needed
  };

  const personaType = PersonaTypeEnum.Developer; // Define the persona type

  // Build the persona based on the provided type
  const persona = PersonaBuilder.buildPersona(personaType, props);

  return (
    <div>
      <h1>User Profile</h1>
      <UserDetails user={user} /> {/* Render the UserDetails component */}
      {/* Render persona-related components using persona data */}
      <div>
        <h2>Persona</h2>
        {/* Render persona components based on persona data */}
      </div>
      {/* Additional profile-related components and functionality */}
    </div>
  );
};

export default Profile;
export type { ActivityStatus, ProfileAccessControl };
