
interface DatabaseConfig {
  url: string;
  host: string;
  username: string;
  password: string;
  database?: string;
  authToken: string | undefined;
  port: number;
  saveUserProfiles?(userProfiles: any[]): Promise<void>;
}

export type { DatabaseConfig };
