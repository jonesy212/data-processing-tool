// DataProcessingService.tsx
// DataProcessingService.ts
import { endpoints } from '@/core/api/endpointConfigurations';
import { Team } from "@/core/components/teams/Team";
import { MyDataType } from "@/core/config/MetaDataOptions";
import { Project } from '@/core/models/projects/Project';
import { TransactionData } from '@/core/payment/Transaction';
import { UserData } from "@/core/users/User";

import { DataActions } from '@/core/actions/DataActions';
import axiosInstance from '@/core/api/csrfToken';
import { CryptoPortfolio, ProjectActivity } from '@/core/components/crypto/CryptoPortfolio';
import axios, { AxiosResponse } from 'axios';
import { observable, runInAction } from 'mobx';

// Use the data-processing endpoint from apiEndpoints.ts
const API_BASE_URL = endpoints.dataProcessing;

interface DataProcessing {
  datasetPath: string;
  // Add more properties if needed
}

interface DataProcessingResult {
  // Define the structure of the result if needed
}


interface TeamProject {
  projectId: string;
  role: 'admin' | 'member' | 'viewer';
  joinedAt: Date;
}


type YourDataType = UserData<MyDataType> & {
  cryptoData: {
    portfolio: CryptoPortfolio[];
    transactionHistory: TransactionData[];
    watchlist: string[];
  };
  projectData: {
    activeProjects: Project[];
    recentActivity: ProjectActivity[];
    teamCollaborations: TeamProject[];
    archivedProjects?: Project[];
    favoriteProjects?: string[];
  };

  teams: Team[];
  notifications: {
    unreadCount: number;
    items: Array<{
      id: string;
      type: string;
      timestamp: Date;
      read: boolean;
      content: string;
    }>;
  };
};

const AppDataActions = DataActions();


// Ensure correct types are used in the data processing
const dataProcessingService = observable({
  loadDataAndProcess: async (data: DataProcessing): Promise<DataProcessingResult> => {
    try {
      // Ensure DataProcessingResult is the correct type for the response data
      const response: AxiosResponse<DataProcessingResult> = await axios.post(
        `${API_BASE_URL}`,
        data
      );

      runInAction(() => {
        AppDataActions.loadDataAndProcessSuccess({ result: response.data });
      });

      return response.data;
    } catch (error) {
      const errorMessage = String(error);
      console.error(`Error processing data: ${errorMessage}`);

      runInAction(() => {
        AppDataActions.loadDataAndProcessFailure({ error: errorMessage });
      });

      throw error;
    }
  },

processDataForAnalysis: async (data: DataProcessing): Promise<DataProcessingResult> => {
  try {
    const response: AxiosResponse<DataProcessingResult> = await axiosInstance.post(
      `${API_BASE_URL}/process`,
      data
    );

    runInAction(() => {
      AppDataActions.processDataForAnalysisSuccess({ result: response.data });
    });

    // ✅ Return inside the try block, where `response` is defined
    return response.data;
  } catch (error) {
    const errorMessage = String(error);
    console.error(`Error processing data for analysis: ${errorMessage}`);

    runInAction(() => {
      AppDataActions.processDataForAnalysisFailure({ error: errorMessage });
    });

    throw error;
  }
}
});

export default dataProcessingService;
export type { DataProcessing, DataProcessingResult };
