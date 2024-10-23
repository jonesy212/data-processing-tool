import React from 'react';
import generateTimeBasedCode from '../models/realtime/TimeBasedCodeGenerator';
import UserDetails, { User } from './User';
import UserRoles from './UserRoles';

const UserDataComponent = () => {
  const timeBasedCode = generateTimeBasedCode();
  const user: User = {
    _id: "",
    id: "",
    username: "",
    email: "",
    tier: "",
    uploadQuota: 0,
    fullName: null,
    bio: null,
    userType: "",
    hasQuota: false,
    profilePicture: null,
    processingTasks: [],
    traits: undefined,
    timeBasedCode: timeBasedCode,
    role: UserRoles.Guest,
    firstName: '',
    lastName: '',
    token: null,
    avatarUrl: null,
    createdAt: undefined,
    updatedAt: undefined,
    persona: undefined,
    friends: [],
    blockedUsers: [],
    settings: undefined,
    interests: [],
    privacySettings: undefined,
    notifications: undefined,
    activityLog: [],
    socialLinks: undefined,
    relationshipStatus: null,
    hobbies: [],
    skills: [],
    achievements: [],
    profileVisibility: '',
    profileAccessControl: undefined,
    activityStatus: '',
    isAuthorized: false
  };

  return <UserDetails user={user} />;
};

export default UserDataComponent;
