// ServerConfigurationService.ts
// app/server/ServerConfigurationService.ts
import fs from 'fs';
import path from 'path';
import { SystemConfigs } from "@/app/api/systemConfigs";
import { UserConfigs } from "@/app/api/userConfigs";
import { AquaConfig } from "@/app/utils/web3/webConfigs/AquaConfig";
import StoreConfig from "@/app/shoppingCenter/ShoppingCenterConfig";
import { BackendConfig, backendConfig } from "./BackendConfig";
import { frontendConfig } from "./FrontendConfig";
import dataVersions from "./DataVersionsConfig";
import { userPreferences } from "./UserPreferences";
import userSettings from "./UserSettings";

export class ServerConfigurationService {
  private configPath: string;

  constructor(configPath?: string) {
    this.configPath = configPath || path.join(process.cwd(), 'config.json');
  }

  // Read entire config file
  readConfigFile(): any {
    if (!fs.existsSync(this.configPath)) {
      throw new Error('Config file not found');
    }

    const rawData = fs.readFileSync(this.configPath, 'utf-8');
    return JSON.parse(rawData);
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
  getSystemConfigs(): typeof SystemConfigs {
    return SystemConfigs;
  }

  // Get all user configs (server-side)
  getUserConfigs(): typeof UserConfigs {
    return UserConfigs;
  }

  // Get data path (server-side)
  getDataPath(): string {
    const config = this.readConfigFile();
    return config.dataPath || '@/data';
  }

  // Get complete configuration (server-side)
  getCompleteConfiguration(): any {
    return {
      systemConfigs: SystemConfigs,
      userConfigs: UserConfigs,
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