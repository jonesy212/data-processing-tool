import { UserConfig } from "@/app/snapshots";
import { UserData } from "@/app/users/User";
import { userPreferences } from "@/app/config/UserPreferences";
import userSettings, { UserSettings } from "@/app/config/UserSettings";
import { Attachment } from '@/app/documents/attachment/Attachment';
import { BaseDataEntity, DefaultExcludedFields, DefaultIncludedFields, DefaultMeta } from '@/app/config/BaseConfig';

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

  
// userConfigs.ts
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
