import { DataAnalysis } from '@/app/projects/DataAnalysisPhase/DataAnalysis';

class DataAnalysisService {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  // Existing methods
  async fetchDataAnalysis(): Promise<DataAnalysis[]> {
    const response = await fetch(`${this.baseUrl}/api/data-analysis`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch data analysis');
    }
    
    return response.json();
  }

  async getDataByProjectId(projectId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/data-analysis?projectId=${projectId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch project data');
    }
    
    return response.json();
  }

  async postDataAnalysis(dataAnalysis: DataAnalysis): Promise<DataAnalysis> {
    const response = await fetch(`${this.baseUrl}/api/data-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataAnalysis),
    });
    
    if (!response.ok) {
      throw new Error('Failed to post data analysis');
    }
    
    return response.json();
  }

  // New database operation methods
  async removeData(tableName: string, id: number | string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/database`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'remove',
        tableName,
        id,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to remove data');
    }
    
    return response.json();
  }

  async shareData(tableName: string, shareData: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/database`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'share',
        tableName,
        data: shareData,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to share data');
    }
    
    return response.json();
  }

  async updateData(tableName: string, updateData: any, conditions?: string, params?: any[]): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/database`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'update',
        tableName,
        updateData,
        conditions,
        params,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update data');
    }
    
    return response.json();
  }

  async selectData(tableName: string, conditions?: string, params?: any[]): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/database`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'select',
        tableName,
        conditions,
        params,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to select data');
    }
    
    return response.json();
  }

  // Generic query execution
  async executeQuery(query: string, params: any[] = []): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/database`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'query',
        query,
        params,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Database query failed');
    }
    
    return response.json();
  }
}

export default DataAnalysisService;