import { BaseData } from '@/app/models/data/Data';
import { UserConfig } from "@/app/snapshots";
import { UserData } from "@/app/users/User";
import { StructuredMetadata } from "@/config/StructuredMetadata";
import { userPreferences } from "@/config/UserPreferences";
import userSettings, { UserSettings } from "@/config/UserSettings";


interface UserConfigData<
  T extends BaseData<any>,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>
> extends UserData<T, K, Meta>,  // ← This already includes BaseData via inheritance
    UserConfig<T, K, Meta>       // ← Add UserConfig properties
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
