TeamMemberPermissionsImpl.ts
import { TeamMemberPermissions } from '@/core/models/teams/TeamMembers';
import { MemberPermission, Permission, TeamPermission } from '@/core/permissions/Permission';

class TeamMemberPermissionsImpl implements TeamMemberPermissions {
  constructor(
    public basePermissions: Permission[] = [],
    public memberPermissions: MemberPermission[] = [],
    public teamPermissions: TeamPermission[] = []
  ) {}

  hasPermission(action: string, resourceType: string, scope?: string): boolean {
    // Check base permissions
    const hasBasePermission = this.basePermissions.some(perm => 
      perm.permissionType === 'write' || // Simplified logic
      perm[action] === true
    );

    // Check member permissions
    const hasMemberPermission = this.memberPermissions.some(perm =>
      perm.resourceType === resourceType && perm[action] === true
    );

    // Check team permissions if scope is provided
    const hasTeamPermission = scope ? this.teamPermissions.some(perm =>
      perm.scope === scope && perm.teamId === scope && perm[action] === true
    ) : false;

    return hasBasePermission || hasMemberPermission || hasTeamPermission;
  }

  getTeamPermissions(teamId: string): TeamPermission[] {
    return this.teamPermissions.filter(perm => perm.teamId === teamId);
  }

  getMemberPermissions(): MemberPermission[] {
    return this.memberPermissions;
  }

  // Helper methods for managing permissions
  addTeamPermission(permission: TeamPermission): void {
    this.teamPermissions.push(permission);
  }

  addMemberPermission(permission: MemberPermission): void {
    this.memberPermissions.push(permission);
  }

  removeTeamPermission(teamId: string, action: string): void {
    this.teamPermissions = this.teamPermissions.filter(perm => 
      !(perm.teamId === teamId && perm[action] === true)
    );
  }
}

export default TeamMemberPermissionsImpl