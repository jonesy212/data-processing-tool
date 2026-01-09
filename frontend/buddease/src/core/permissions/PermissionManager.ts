PermissionManager.ts
// Permission management utilities that extend your existing structure
class PermissionManager {
  static hasPermission(
    userPermissions: UserPermissions,
    action: string,
    resourceType: string,
    scope?: string,
    resourceId?: string
  ): boolean {
    // Get the relevant permission category based on resourceType
    const permissionCategory = this.getPermissionCategory(resourceType);
    const categoryPermissions = userPermissions[permissionCategory];
    
    if (!categoryPermissions) return false;

    // Check if the action is allowed in this category
    const hasAction = this.checkActionPermission(categoryPermissions, action);
    if (!hasAction) return false;

    // Check scope if specified
    if (scope && categoryPermissions.scope) {
      if (categoryPermissions.scope !== scope) return false;
      
      // Check resource ID for team scope
      if (scope === 'team' && resourceId && categoryPermissions.teamId !== resourceId) {
        return false;
      }
    }

    return true;
  }

  private static getPermissionCategory(resourceType: string): keyof UserPermissions {
    // Map resource types to your existing permission categories
    const categoryMap: Record<string, keyof UserPermissions> = {
      'data': 'data',
      'board': 'board',
      'task': 'task',
      'team': 'team',
      'project': 'projectManagement',
      'community': 'community',
      'document': 'documentEditing',
      // Add more mappings as needed
    };
    
    return categoryMap[resourceType] || 'data'; // default to data
  }

  private static checkActionPermission(permissions: BasePermissions, action: string): boolean {
    const actionMap: Record<string, keyof BasePermissions> = {
      'view': 'canView',
      'edit': 'canEdit',
      'delete': 'canDelete',
      'read': 'read',
      'write': 'write',
      'share': 'share',
      'execute': 'execute'
    };
    
    const permissionKey = actionMap[action];
    return permissionKey ? !!permissions[permissionKey] : false;
  }

  static createScopedPermissions(
    basePermissions: UserPermissions,
    scope: 'team' | 'member',
    resourceId?: string
  ): UserPermissions {
    // Create a copy of permissions with scope applied
    const scopedPermissions = { ...basePermissions };
    
    // Apply scope to all permission categories
    Object.keys(scopedPermissions).forEach(key => {
      const category = key as keyof UserPermissions;
      const permissions = scopedPermissions[category];
      if (permissions) {
        permissions.scope = scope;
        if (scope === 'team' && resourceId) {
          permissions.teamId = resourceId;
        } else if (scope === 'member' && resourceId) {
          permissions.memberId = resourceId;
        }
      }
    });
    
    return scopedPermissions;
  }
}