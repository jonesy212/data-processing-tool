import { FC } from 'react';
import generateTimeBasedCode from '../../../../models/realtime/TimeBasedCodeGenerator';
import { DetailsProps, SupportedData } from '../models/CommonData';
import { User, UserDetails } from './User';
import UserRoles from './UserRoles';
import React from 'react';

const UserDataComponent = () => {
  const timeBasedCode = generateTimeBasedCode()
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
    traits: {} as FC<DetailsProps<SupportedData>>,
    timeBasedCode: timeBasedCode,
    role: UserRoles.Guest
  };

  return (
    <UserDetails user={user} />
  );
};

export default UserDataComponent;
