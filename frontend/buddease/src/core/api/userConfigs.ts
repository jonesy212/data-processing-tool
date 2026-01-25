// userConfigs.ts
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { userPreferences } from "@/core/config/UserPreferences";
import type { UserSettings } from '@/core/config/UserSettings';
import userSettings from '@/core/config/UserSettings';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import { UserConfig } from "@/core/snapshots/SnapshotStoreConfig";
import { UserData } from "@/core/users/User";

interface UserConfigData<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends UserData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    UserConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> 
{
     // Add configuration-specific fields here
    settings: UserSettings;
    enabledFeatures: string[];
    userSpecificData: T;  // Could be the user's data, parameterized
  }

  
export const UserConfigs = {
    apiUrl: 'https://user.api.com',
    theme: 'light',
    notificationConfig: {
        enabled: true,
        frequency: 'daily',
    },
    // Add more configurations as needed
    userPreferences: userPreferences,  // Example addition for UserPreferences
    userSettings: userSettings,  // Example addition for UserSettings
};


export type { UserConfigData };
