// src/services/dataAnalysisService.ts
import { DataAnalysis } from '@/app/components/projects/DataAnalysisPhase/DataAnalysis';

class DataAnalysisService {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

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

  // For database operations, call your API route
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