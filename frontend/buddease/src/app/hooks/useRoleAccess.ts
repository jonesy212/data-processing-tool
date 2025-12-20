// hooks/useRoleAccess.ts

import React from "react";
import { useState, useEffect } from 'react';
import UserRoles, { UserRoleEnum } from '@/app/models/UserRoles';
import { useAuth } from "[object Object]";
import { UserRoleEnum } from "@/app/models/UserRoles";
import { BaseDataEntity, DefaultMeta, Attachment, DefaultExcludedFields } from "@/app/documents/attachment/Attachment";

export type Permission = 
  | 'view:file-structure'
  | 'view:frontend-structure'
  | 'modify:file-structure'
  | 'manage:file-structure';

interface UseRoleAccessProps {
  userRole: UserRoleEnum;
  requiredPermission: Permission;
}

export const useRoleAccess = ({ userRole, requiredPermission }: UseRoleAccessProps) => {
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const role = UserRoles[userRole];
    if (!role) {
      console.warn(`Role ${userRole} not found`);
      setHasAccess(false);
    } else {
      setHasAccess(role.permissions.includes(requiredPermission));
    }
    setIsLoading(false);
  }, [userRole, requiredPermission]);

  return { hasAccess, isLoading };
};


export const useCurrentUser = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>() => {
  const { state } = useAuth() as {
    state: {
      user: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
      userRoles: string[];
      isLoading: boolean;
    };
  };

  const [userRole, setUserRole] = React.useState<UserRoleEnum>(UserRoleEnum.Member);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (state.user) {
      // Take the first role as primary (customize as needed)
      const roleString = state.userRoles[0] || "Member";
      setUserRole(roleString as UserRoleEnum);
    }
    setIsLoading(state.isLoading);
  }, [state.user, state.userRoles, state.isLoading]);

  return { userRole, isLoading };
};