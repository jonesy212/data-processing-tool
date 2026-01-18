const TEAM_PERMISSION_PRESETS = {
  owner: (teamId: string, userId: string): TeamPermission => ({
    userId,
    permissions: { all: true },
    permissionType: 'write',
    scope: 'team',
    resourceType: 'team',
    teamId,
    
    // Grouped by category
    teamManagement: {
      canManageTeam: true,
      canEditTeamSettings: true,
      canViewTeamAnalytics: true,
    },
    
    memberManagement: {
      canManageMembers: true,
      canInviteMembers: true,
      canRemoveMembers: true,
      canManageTeamMembers: true,
    },
    
    projectManagement: {
      canCreateProjects: true,
      canDeleteProjects: true,
      canAssignTasks: true,
      canViewAnalytics: true,
      canCreatePhases: true,
      canAdvancePhase: true,
    },
    
    collaboration: {
      canUseAudio: true,
      canUseVideo: true,
      canUseTextChat: true,
      canInitiateRealTime: true,
    },
    
    crypto: {
      canManageCryptoPortfolio: true,
      canExecuteTrades: true,
      canViewMarketData: true,
      canAccessCommunityForum: true,
    },
    
    // Additional permissions
    canManageGlobalChannels: true,
    canAddCollaborationPlatforms: true,
  }),
  
  member: (teamId: string, userId: string): TeamPermission => ({
    userId,
    permissions: { basic: true },
    permissionType: 'read',
    scope: 'team',
    resourceType: 'team',
    teamId,
    
    // Limited permissions
    teamManagement: {
      canManageTeam: false,
      canEditTeamSettings: false,
      canViewTeamAnalytics: true,
    },
    
    memberManagement: {
      canManageMembers: false,
      canInviteMembers: false,
      canRemoveMembers: false,
      canManageTeamMembers: false,
    },
    
    projectManagement: {
      canCreateProjects: false,
      canDeleteProjects: false,
      canAssignTasks: false,
      canViewAnalytics: true,
      canCreatePhases: false,
      canAdvancePhase: false,
    },
    
    collaboration: {
      canUseAudio: true,
      canUseVideo: true,
      canUseTextChat: true,
      canInitiateRealTime: false,
    },
    
    crypto: {
      canManageCryptoPortfolio: false,
      canExecuteTrades: false,
      canViewMarketData: true,
      canAccessCommunityForum: true,
    },
    
    // Additional permissions
    canManageGlobalChannels: false,
    canAddCollaborationPlatforms: false,
  }),
  
  admin: (teamId: string, userId: string): TeamPermission => ({
    userId,
    permissions: { admin: true },
    permissionType: 'write',
    scope: 'team',
    resourceType: 'team',
    teamId,
    
    teamManagement: {
      canManageTeam: true,
      canEditTeamSettings: true,
      canViewTeamAnalytics: true,
    },
    
    memberManagement: {
      canManageMembers: true,
      canInviteMembers: true,
      canRemoveMembers: true,
      canManageTeamMembers: true,
    },
    
    projectManagement: {
      canCreateProjects: true,
      canDeleteProjects: true,
      canAssignTasks: true,
      canViewAnalytics: true,
      canCreatePhases: true,
      canAdvancePhase: true,
    },
    
    collaboration: {
      canUseAudio: true,
      canUseVideo: true,
      canUseTextChat: true,
      canInitiateRealTime: true,
    },
    
    crypto: {
      canManageCryptoPortfolio: false, // No crypto access for admins
      canExecuteTrades: false,
      canViewMarketData: false,
      canAccessCommunityForum: false,
    },
  }),
};



function createNewTeam(
  teamName: string,
  creatorId: string,
  options?: Partial<TeamEntity>
): TeamEntity {
  const teamId = `team-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    id: teamId,
    name: teamName,
    ownerId: creatorId,
    memberIds: [creatorId],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    members: [],
    createdDate: new Date(),
    
    // Collaboration features
    collaborationFeatures: {
      audio: true,
      video: true,
      text: true,
      realTime: true
    },
    
    // Crypto features (from your app description)
    cryptoEnabled: true,
    cryptoFeatures: {
      portfolioManagement: true,
      trading: true,
      marketData: true,
      communityForum: true
    },
    
    // Project phases
    currentPhase: 'ideation',
    phasesCompleted: [],
    
    // Global collaboration
    globalCollaboration: {
      isEnabled: true,
      communicationChannels: [],
      collaborationPlatforms: []
    },
    
    // Permissions for creator (now category-based)
    permissions: TEAM_PERMISSION_PRESETS.owner(teamId, creatorId),
    
    ...options
  };
}


// Default team configuration for new teams
const DEFAULT_TEAM_DATA: Partial<TeamEntity> = {
  // Team status
  isActive: true,
  
  // Collaboration features
  collaborationFeatures: {
    audio: true,
    video: true,
    text: true,
    realTime: true
  },
  
  // Crypto features (from your app description)
  cryptoEnabled: true,
  cryptoFeatures: {
    portfolioManagement: true,
    trading: true,
    marketData: true,
    communityForum: true
  },
  
  // Project phases
  currentPhase: 'ideation',
  phasesCompleted: [],
  
  // Global collaboration
  globalCollaboration: {
    isEnabled: true,
    communicationChannels: ['slack', 'zoom'],
    collaborationPlatforms: ['github', 'figma']
  },
  
  // Team settings defaults
  description: "A collaborative team for managing projects and crypto assets",
  
  // Default team settings structure
  settings: {
    // Communication preferences
    defaultCommunicationMethod: 'text',
    meetingSchedule: {
      frequency: 'weekly',
      day: 'monday',
      time: '14:00'
    },
    
    // Notification settings
    notifications: {
      email: true,
      push: true,
      inApp: true
    },
    
    // Crypto settings
    cryptoPreferences: {
      defaultCurrency: 'USD',
      riskTolerance: 'medium',
      tradingEnabled: true
    },
    
    // Project management settings
    projectDefaults: {
      autoCreateTasks: true,
      requireApproval: false,
      defaultVisibility: 'team'
    },
    
    // Collaboration tools
    toolPreferences: {
      versionControl: 'github',
      design: 'figma',
      communication: 'slack'
    }
  },
  
  // Avatar placeholder
  avatar: '/default-team-avatar.svg',
  
  // Default collaboration preferences
  collaborationPreferences: {
    preferredTools: ['slack', 'zoom', 'github', 'figma'],
    meetingFrequency: 'weekly',
    communicationStyle: 'async-first',
    workingHours: {
      start: '09:00',
      end: '17:00',
      timezone: 'UTC'
    }
  }
};

// Helper to create a new team with defaults
function createNewTeamWithDefaults(
  teamName: string,
  creatorId: string,
  creatorName: string = "Creator",
  options?: Partial<TeamEntity>
): TeamEntity {
  const teamId = `team-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Create initial member (the creator)
  const creatorMember = {
    id: creatorId,
    name: creatorName,
    role: 'owner',
    joinDate: new Date(),
    permissions: TEAM_PERMISSION_PRESETS.owner(teamId, creatorId)
  };
  
  // Build the complete team entity
  const team: TeamEntity = {
    id: teamId,
    name: teamName,
    description: `Team ${teamName} for project collaboration and crypto management`,
    ownerId: creatorId,
    memberIds: [creatorId],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    members: [creatorMember],
    createdDate: new Date(),
    permissions: TEAM_PERMISSION_PRESETS.owner(teamId, creatorId),
    
    // Apply defaults
    ...DEFAULT_TEAM_DATA,
    
    // Apply any custom options
    ...options
  };
  
  // Update team ID references in permissions
  if (team.permissions) {
    team.permissions.teamId = teamId;
  }
  
  // Update team ID in member permissions
  team.members.forEach(member => {
    if (member.permissions) {
      member.permissions.teamId = teamId;
    }
  });
  
  console.log(`✅ Created new team: ${teamName} (${teamId})`);
  console.log(`👤 Creator: ${creatorName} (${creatorId})`);
  console.log(`🔧 Features: ${team.collaborationFeatures.audio ? 'Audio' : ''} ${team.collaborationFeatures.video ? 'Video' : ''} ${team.collaborationFeatures.text ? 'Text' : ''}`);
  console.log(`💰 Crypto: ${team.cryptoEnabled ? 'Enabled' : 'Disabled'}`);
  console.log(`📊 Phase: ${team.currentPhase}`);
  
  return team;
}

// Example usage:
const exampleTeam = createNewTeamWithDefaults(
  "Development Team",
  "user-123",
  "John Doe",
  {
    // Override any defaults
    description: "Team focused on developing new crypto features",
    cryptoFeatures: {
      portfolioManagement: true,
      trading: true,
      marketData: true,
      communityForum: false // This team doesn't need forum access
    }
  }
);

// Also create a simpler version for basic team creation
function createBasicTeam(
  teamName: string,
  creatorId: string
): TeamEntity {
  return createNewTeamWithDefaults(teamName, creatorId);
}


function hasTeamPermission(
  userId: string,
  team: TeamEntity,
  permissionPath: string // e.g., "teamManagement.canManageTeam"
): boolean {
  const userMember = team.members.find(m => m.id === userId);
  if (!userMember || !userMember.permissions) return false;
  
  // Navigate through category structure
  const pathParts = permissionPath.split('.');
  let current: any = userMember.permissions;
  
  for (const part of pathParts) {
    if (current[part] === undefined) return false;
    current = current[part];
  }
  
  return current === true;
}

// Get all permissions for a user in a team
function getUserTeamPermissions(
  userId: string,
  team: TeamEntity
): TeamPermission | null {
  const userMember = team.members.find(m => m.id === userId);
  return userMember?.permissions || null;
}

// Update user permissions in a team
function updateTeamMemberPermissions(
  team: TeamEntity,
  memberId: string,
  role: 'owner' | 'admin' | 'member'
): TeamEntity {
  const updatedTeam = { ...team };
  const memberIndex = updatedTeam.members.findIndex(m => m.id === memberId);
  
  if (memberIndex !== -1) {
    updatedTeam.members[memberIndex].permissions = TEAM_PERMISSION_PRESETS[role](
      team.id,
      memberId
    );
    updatedTeam.members[memberIndex].role = role;
  }
  
  return updatedTeam;
}

// Add a new member to a team
function addTeamMember(
  team: TeamEntity,
  userId: string,
  userName: string,
  role: 'owner' | 'admin' | 'member' = 'member'
): TeamEntity {
  const updatedTeam = { ...team };
  
  // Add to memberIds array
  if (!updatedTeam.memberIds.includes(userId)) {
    updatedTeam.memberIds.push(userId);
  }
  
  // Add to members array
  const existingMemberIndex = updatedTeam.members.findIndex(m => m.id === userId);
  const newMember = {
    id: userId,
    name: userName,
    role,
    joinDate: new Date(),
    permissions: TEAM_PERMISSION_PRESETS[role](team.id, userId)
  };
  
  if (existingMemberIndex !== -1) {
    // Update existing member
    updatedTeam.members[existingMemberIndex] = newMember;
  } else {
    // Add new member
    updatedTeam.members.push(newMember);
  }
  
  updatedTeam.updatedAt = new Date();
  
  return updatedTeam;
}

// Export everything
export {
  DEFAULT_TEAM_DATA,
  createNewTeamWithDefaults,
  createBasicTeam,
  TEAM_PERMISSION_PRESETS
};