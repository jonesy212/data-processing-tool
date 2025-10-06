// configHelper.ts
// app/server/configHelper.ts
import fs from 'fs';
import path from 'path';

export interface AppConfig {
  apiKey: string;
  appId: string;
  appDescription: string;
  dataPath: string;
  baseURL: string;
  // Add other config properties as needed
}

export function getEnvironmentConfig(): AppConfig {
  const configPath = path.join(process.cwd(), 'config.json');
  
  // Default fallback configuration
  const defaultConfig: AppConfig = {
    apiKey: process.env.API_KEY || '',
    appId: process.env.APP_ID || '',
    appDescription: process.env.APP_DESCRIPTION || '',
    dataPath: process.env.DATA_PATH || '@/data',
    baseURL: process.env.API_BASE_URL || 'https://api.example.com'
  };

  try {
    if (fs.existsSync(configPath)) {
      const rawData = fs.readFileSync(configPath, 'utf-8');
      const fileConfig = JSON.parse(rawData);
      return { ...defaultConfig, ...fileConfig };
    }
  } catch (error) {
    console.warn('Could not read config file, using environment variables:', error);
  }

  return defaultConfig;
}

// Utility to check if config file exists
export function configFileExists(): boolean {
  const configPath = path.join(process.cwd(), 'config.json');
  return fs.existsSync(configPath);
}