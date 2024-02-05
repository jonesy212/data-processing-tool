import { FC } from 'react';
import { DetailsProps, SupportedData } from '../models/CommonData';
import { User, UserDetails } from './User';

const UserDataComponent = () => {
  const user: User = {
    _id: '',
    id: '',
    username: '',
    email: '',
    tier: '',
    uploadQuota: 0,
    fullName: null,
    bio: null,
    userType: '',
    hasQuota: false,
    profilePicture: null,
    processingTasks: [],
    traits: {} as FC<DetailsProps<SupportedData>>
  };

  return (
    <UserDetails user={user} />
  );
};

export default UserDataComponent;
