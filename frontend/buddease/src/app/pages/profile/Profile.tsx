// Profile.tsx
import React from 'react';
import UserDetails, { User } from '../../components/users/User'; // Import the User interface
import PersonaTypeEnum, { PersonaBuilder, PersonaData } from '../personas/PersonaBuilder';

interface ProfileProps {
  user: User; // Pass the user data as props
  props: ProfileAccessControl;
}

type ActivityStatus =  "active" | "inactive" | "away" | "busy" | "offline";

// Define the profile access control interface
interface ProfileAccessControl {
  friendsOnly: boolean;
  allowTagging: boolean;
  blockList: string[];
  allowMessagesFromNonContacts: boolean,
  shareProfileWithSearchEngines: boolean,
  isPrivate: boolean;
  isPrivateOnly: boolean; 
  isPrivateOnlyForContacts: boolean; 
  isPrivateOnlyForGroups: boolean; 
  allowMessagesFromFriendContacts: boolean;
  activityStatus: ActivityStatus;
  isAuthorized: boolean;
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
export type {ProfileAccessControl, ActivityStatus}