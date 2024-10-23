// AppSettings.ts
class AppSettings {
  private apiKey: string;
  private appId: string;
  private appDescription: string;

  constructor(apiKey: string, appId: string, appDescription: string) {
    this.apiKey = apiKey;
    this.appId = appId;
    this.appDescription = appDescription;
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
}