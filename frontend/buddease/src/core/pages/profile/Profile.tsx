// Profile.tsx
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import type { PersonaBuilder, PersonaData } from '@/core/pages/personas/PersonaBuilder';
import PersonaTypeEnum from '@/core/pages/personas/PersonaBuilder';
import UserDetails, { User } from '@/core/users/User';
import React from 'react';

interface ProfileProps<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  props: ProfileAccessControl;
  user: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; // Pass the user data as props
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
