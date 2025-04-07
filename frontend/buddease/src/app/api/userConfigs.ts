import { BaseData } from "../components/models/data/Data";
import { userPreferences } from "../configs/UserPreferences";
import userSettings, { UserSettings } from "../configs/UserSettings";
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { UserData } from "@/app/components/users/User";
import { UserConfig as ViteUserConfig } from 'vite';

import { Attachment } from '@/app/components/documents/Attachment/attachment'


interface UserConfigData<
  T extends BaseData<any>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
> extends BaseData<T, K, Meta>, UserConfig<T, K, Meta>, UserData<T, K, Meta> {
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


export type { UserConfigData }