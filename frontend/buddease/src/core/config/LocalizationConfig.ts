LocalizationConfig.ts
export interface LocalizationConfig {
  defaultLocale: string;
  supportedLocales: string[];
  fallbackLocale: string;
  loadPath?: string;
  cacheDuration?: number;
  autoDetect: boolean;
  currency?: {
    default: string;
    display: 'symbol' | 'code' | 'name';
  };
  dateTime?: {
    timezone: string;
    format: 'short' | 'medium' | 'long' | 'full';
  };
  numberFormat?: {
    style: 'decimal' | 'currency' | 'percent';
    minimumFractionDigits: number;
    maximumFractionDigits: number;
  };
}

