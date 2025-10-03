// serverFileSystem.ts
// serverFileSystem.ts
import path from 'path';

export class ServerFileSystem {
  private generatedDir: string;
  private apiBaseUrl: string;

  constructor(generatedDir?: string, apiBaseUrl: string = '/api/files') {
    this.generatedDir = generatedDir || 'generated';
    this.apiBaseUrl = apiBaseUrl;
  }

  private async apiCall(endpoint: string, options: RequestInit = {}): Promise<any> {
    const response = await fetch(`${this.apiBaseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    return response.json();
  }

  async ensureGeneratedDir(): Promise<void> {
    // Directory creation is handled by the API
    await this.apiCall(`?operation=exists&path=${this.generatedDir}`);
  }

  async writeFile(fileName: string, content: Buffer | string): Promise<string> {
    const filePath = path.join(this.generatedDir, fileName);
    
    await this.apiCall('', {
      method: 'POST',
      body: JSON.stringify({
        operation: 'writeFile',
        path: filePath,
        content: content.toString(),
        authToken: this.getAuthToken(), // You'll need to implement this
      }),
    });

    return filePath;
  }

  async readFile(filePath: string): Promise<Buffer> {
    const response = await this.apiCall(`?operation=readFile&path=${filePath}`);
    return Buffer.from(response.content);
  }

  async deleteFile(fileName: string): Promise<boolean> {
    try {
      const filePath = path.join(this.generatedDir, fileName);
      // You might need to add a DELETE method to your API
      await fetch(`${this.apiBaseUrl}?operation=delete&path=${filePath}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      console.error("Error deleting document:", error);
      return false;
    }
  }

  async listFiles(): Promise<string[]> {
    try {
      const response = await this.apiCall(`?operation=readdir&path=${this.generatedDir}`);
      return response.files || [];
    } catch (error) {
      console.error("Error reading generated documents:", error);
      return [];
    }
  }

  async fileExists(fileName: string): Promise<boolean> {
    try {
      const filePath = path.join(this.generatedDir, fileName);
      const response = await this.apiCall(`?operation=exists&path=${filePath}`);
      return response.exists || false;
    } catch {
      return false;
    }
  }


  private getAuthToken(): string {
    // Option 1: If using in React components, use the hook directly
    // const authToken = useAuthToken();
    // return authToken || '';
    
    // Option 2: For server-side or non-React contexts, use localStorage directly
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken') || '';
    }
    
    // Option 3: For server-side rendering, you might need a different approach
    return '';
  }
}