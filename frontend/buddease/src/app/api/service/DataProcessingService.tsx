// DataProcessingService.ts
import { endpoints } from '@/app/api/ApiEndpoints';
import { Team } from "@/app/components/models/teams/Team";
import { TransactionData } from '@/app/payment/Transaction';
import { Project } from '@/app/models/projects/Project';
import { UserData } from "@/app/users/User";
import { MyDataType } from "@/server/database/MetaDataOptions";

import axiosInstance from '@/app/api/csrfToken';
import { CryptoPortfolio, ProjectActivity } from '@/app/components/crypto/CryptoPortfolio';
import axios, { AxiosResponse } from 'axios';
import { observable, runInAction } from 'mobx';
import { DataActions } from '@/app/actions/DataActions';

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

const AppDataActions = DataActions<YourDataType>();


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