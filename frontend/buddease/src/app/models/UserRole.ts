// UserRole.ts
import { UserRoleEnum } from '@/app/models/UserRoles';

// Assuming this is your UserRole interface and enum
export interface UserRole {
    roleType: UserRoleEnum; 
    responsibilities: string[];
    permissions: string[];
    positions: { title: string; level: number }[]; // Define positions as an array of objects
    salary?: number; // Example salary for Moderator
    includes: string[]; // Example includes for Moderator
}

    