ServerConfigurationService.ts
app/server/ServerConfigurationService.ts
import { SystemConfigs, createSystemConfigs } from "@/core/api/systemConfigs";
import { UserConfigs } from "@/core/api/userConfigs";
import { backendConfig } from "@/core/config/BackendConfig";
import { frontendConfig } from "@/core/config/FrontendConfig";
import { userPreferences } from "@/core/config/UserPreferences";
import userSettings from '@/core/config/UserSettings';
import dataVersions from '@/core/configs/DataVersionsConfig';
import StoreConfig from "@/core/shoppingCenter/ShoppingCenterConfig";
import { AquaConfig } from "@/utils/web3/webConfigs/aqua/AquaConfig";
import fs from 'fs';
import path from 'path';

// Define shared base config types that both frontend and backend can use
export interface BaseServerConfig {
  [key: string]: unknown;
}

export interface ServerConfigData {
  system?: Record<string, unknown>;
  user?: Record<string, unknown>;
  settings?: Record<string, unknown>;
}


// Add this function to your file or import it
export function createUserConfigs(): UserConfigs {
  return {
    // User preferences and settings
    preferences: {
      theme: 'light',
      language: 'en',
      notifications: {
        email: true,
        push: true,
        sms: false
      },
      privacy: {
        profileVisible: true,
        dataSharing: false
      }
    },
    
    // User profile configuration
    profile: {
      displayName: '',
      avatar: '',
      bio: ''
    },
    
    // Application-specific user settings
    application: {
      autoSave: true,
      autoSync: true,
      offlineMode: false
    },
    
    // Security settings
    security: {
      twoFactorEnabled: false,
      sessionTimeout: 30,
      loginAlerts: true
    },
    
    // UI/UX preferences
    interface: {
      compactMode: false,
      highContrast: false,
      reducedMotion: false
    }
  } as typeof UserConfigs;
}

export class ServerConfigurationService {
  private static instance: ServerConfigurationService;

  private cachedConfig: ServerConfigData | null = null;
  private cachedSystemConfigs: Record<string, unknown> | null = null;
  private cachedUserConfigs: Record<string, unknown> | null = null;
  private cachedSettingsConfigs: Record<string, unknown> | null = null;

  private readonly configPath = path.join(process.cwd(), "config.json");
  
  // Read entire config file
  private readConfigFile(): any {
    if (!fs.existsSync(this.configPath)) {
      throw new Error('Config file not found');
    }

    const rawData = fs.readFileSync(this.configPath, 'utf-8');
    return JSON.parse(rawData);
  }

  public static getInstance(): ServerConfigurationService {
    if (!ServerConfigurationService.instance) {
      ServerConfigurationService.instance = new ServerConfigurationService();
    }
    return ServerConfigurationService.instance;
  }


   // --- Caching Layer ---

  /** Get cached config snapshot, or load from file if not cached */
  public async getCachedSnapshotConfig(): Promise<any> {
    if (!this.cachedConfig) {
      console.log("[ServerConfigService] Creating new cached snapshot config...");
      this.cachedConfig = await this.getSnapshotConfig();
    }
    return this.cachedConfig;
  }

  /** Clears all caches and reloads fresh configuration */
  public async refreshConfigs(): Promise<void> {
    console.log("[ServerConfigService] Refreshing cached configurations...");
    this.cachedConfig = null;
    this.cachedSystemConfigs = null;
    this.cachedUserConfigs = null;
    this.cachedSettingsConfigs = null;
    await this.getSnapshotConfig();
  }

  /** Manual cache setters */
  public setCachedConfig(config: ServerConfigData): void {
    this.cachedConfig = config;
    console.log("[ServerConfigService] Config cached successfully");
  }

public getCachedConfig(): ServerConfigData | null {
  return this.cachedConfig;
}

  public clearCache(): void {
    this.cachedConfig = null;
    this.cachedSystemConfigs = null;
    this.cachedUserConfigs = null;
    this.cachedSettingsConfigs = null;
    console.log("[ServerConfigService] All caches cleared");
  }

  // --- Config Access Methods ---

  /** Get full config snapshot from file */
  public async getSnapshotConfig(): Promise<any> {
    try {
      const config = this.readConfigFile();
      this.setCachedConfig(config);
      return config;
    } catch (error) {
      console.error("[ServerConfigService] Error reading snapshot config:", error);
      throw error;
    }
  }

  /** Get system config */
  public async getSystemConfig(): Promise<any> {
    if (this.cachedSystemConfigs) return this.cachedSystemConfigs;
    const config = this.readConfigFile();
    this.cachedSystemConfigs = config.system ?? {};
    return this.cachedSystemConfigs;
  }

  /** Update system config */
  public async updateSystemConfig(newConfig: Record<string, any>): Promise<any> {
    const config = this.readConfigFile();
    config.system = { ...config.system, ...newConfig };
    this.writeConfigFile(config);
    this.cachedSystemConfigs = config.system;
    return this.cachedSystemConfigs;
  }

  /** Get user config */
  public async getUserConfig(): Promise<any> {
    if (this.cachedUserConfigs) return this.cachedUserConfigs;
    const config = this.readConfigFile();
    this.cachedUserConfigs = config.user ?? {};
    return this.cachedUserConfigs;
  }

  /** Update user config */
  public async updateUserConfig(newConfig: Record<string, any>): Promise<any> {
    const config = this.readConfigFile();
    config.user = { ...config.user, ...newConfig };
    this.writeConfigFile(config);
    this.cachedUserConfigs = config.user;
    return this.cachedUserConfigs;
  }

  /** Get settings config */
  public async getSettingsConfig(): Promise<any> {
    if (this.cachedSettingsConfigs) return this.cachedSettingsConfigs;
    const config = this.readConfigFile();
    this.cachedSettingsConfigs = config.settings ?? {};
    return this.cachedSettingsConfigs;
  }

  /** Update settings config */
  public async updateSettingsConfig(newConfig: Record<string, any>): Promise<any> {
    const config = this.readConfigFile();
    config.settings = { ...config.settings, ...newConfig };
    this.writeConfigFile(config);
    this.cachedSettingsConfigs = config.settings;
    return this.cachedSettingsConfigs;
  }




  // Write to config file
  writeConfigFile(config: any): void {
    const dir = path.dirname(this.configPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2), 'utf-8');
  }

  // Get specific config value
  getConfigValue(key: string): any {
    const config = this.readConfigFile();
    return config[key];
  }

  // Set specific config value
  setConfigValue(key: string, value: any): void {
    const config = this.readConfigFile();
    config[key] = value;
    this.writeConfigFile(config);
  }

  // Get API key (server-side only)
  getApiKey(): string {
    const config = this.readConfigFile();
    return config.apiKey || '';
  }

  // Get App ID (server-side only)
  getAppId(): string {
    const config = this.readConfigFile();
    return config.appId || '';
  }

  // Get App Description (server-side only)
  getAppDescription(): string {
    const config = this.readConfigFile();
    return config.appDescription || '';
  }

  // Get all system configs (server-side)
  getSystemConfigs(): SystemConfigs {
    return createSystemConfigs();
  }

  getUserConfigs(): ReturnType<typeof createUserConfigs> {
    return createUserConfigs();
  }


  // Get data path (server-side)
  getDataPath(): string {
    const config = this.readConfigFile();
    return config.dataPath || '@/data';
  }


  /** Utility method to check cache status */
  public getCacheStatus(): {
    systemConfigs: boolean;
    userConfigs: boolean;
    snapshotConfig: boolean;
  } {
    return {
      systemConfigs: !!this.cachedSystemConfigs,
      userConfigs: !!this.cachedUserConfigs,
      snapshotConfig: !!this.cachedConfig,
    };
  }

    public resetConfigs(): void {
    this.cachedSystemConfigs = null;
    this.cachedUserConfigs = null;
    console.log("[ConfigService] Configuration cache reset");
  }


  // Get complete configuration (server-side)
  getCompleteConfiguration(): any {
    return {
      systtemConfigs: this.getSystemConfigs(),
      userConfigs: this.getUserConfigs(),
      aquaConfig: {} as AquaConfig,
      storeConfig: {} as StoreConfig,
      dataVersions: dataVersions,
      frontendConfig: frontendConfig,
      backendConfig: backendConfig,
      userPreferences: userPreferences,
      userSettings: userSettings,
      ...this.readConfigFile()
    };
  }

}

// Create singleton instance
export const serverConfigService = new ServerConfigurationService();