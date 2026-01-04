AppSettings.ts
export class AppSettings {
  private apiKey: string;
  private appId: string;
  private appDescription: string;
  private username: string;

  constructor(apiKey: string, appId: string, appDescription: string, username: string) {
    this.apiKey = apiKey;
    this.appId = appId;
    this.appDescription = appDescription;
    this.username = username;
  }

  getApiKey(): string {
    return this.apiKey;
  }

  getAppId(): string {
    return this.appId;
  }

  getAppDescription(): string {
    return this.appDescription;
  }

  getUsername(): string {
    return this.username;      // <-- add a getter
  }
}

