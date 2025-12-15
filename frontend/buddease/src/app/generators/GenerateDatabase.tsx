// GenerateDatabase.tsx
import { databaseConfig } from '@/app/config/endpoints/databaseConfig';
import { databaseQuery }  from '@/app/server/database/DatabaseService'
import NOTIFICATION_MESSAGES from "@/app/features/support/NotificationMessages";
import { databaseService } from "@/app/server/database/DatabaseOperations";
import { useNotification } from '@/app/state/context/NotificationContext';
import { NotificationType, NotificationTypeEnum } from '@/app/features/support/UnifiedNotificationTypes';

import axios from "axios";
import React, { useState } from "react";


const { notify } = useNotification()
const DatabaseGenerator: React.FC = () => {
  const [databaseType, setDatabaseType] = useState<string>("");
  const [databaseName, setDatabaseName] = useState<string>("");
  const { notify } = useNotification();

  const handleGenerate = async () => {
    // Validate inputs
    if (!databaseType || !databaseName) {
      notify({
        id: "database_validation_error",
        message: "Database type and name are required",
        data: {
          entityType: 'database',
          extra: {
            databaseType,
            databaseName,
            action: 'validation'
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error' as const
      });
      return;
    }

    // Generate database configuration based on user input
    const databaseConfig = {
      type: databaseType,
      name: databaseName,
      // Add more configuration options as needed
    };

    try {
      // Send database configuration to backend for setup
      const response = await axios.post("/api/setup-database", databaseConfig);
      console.log("Database setup successful:", response.data);
      
      // Success notification using the same pattern as ApiNote.ts
      notify({
        id: `database_setup_success_${Date.now()}`,
        message: "Database setup successful",
        data: {
          entityId: databaseName,
          entityType: 'database',
          extra: {
            databaseType,
            databaseName,
            action: 'setup',
            responseData: response.data
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success' as const
      });
    } catch (error) {
      console.error("Error setting up database:", error);
      
      // Create an error handler similar to handleNoteApiErrorAndNotify
      const axiosError = error as AxiosError;
      let message = "Error setting up database";
      
      if (axiosError.response?.status === 400) {
        message = "Invalid database configuration";
      } else if (axiosError.response?.status === 409) {
        message = "Database already exists";
      } else if (axiosError.response?.status === 500) {
        message = "Server error occurred during database setup";
      }
      
      notify({
        id: `database_setup_error_${Date.now()}`,
        message,
        data: {
          entityType: 'database',
          extra: {
            databaseType,
            databaseName,
            action: 'setup',
            errorCode: axiosError.response?.status,
            errorMessage: axiosError.message || 'Unknown error',
            timestamp: new Date().toISOString()
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error' as const
      });
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Database Type"
        value={databaseType}
        onChange={(e) => setDatabaseType(e.target.value)}
      />
      <input
        type="text"
        placeholder="Database Name"
        value={databaseName}
        onChange={(e) => setDatabaseName(e.target.value)}
      />
      <button onClick={handleGenerate}>Generate Database</button>
    </div>
  );
};

export default DatabaseGenerator;

const database = await databaseService.createDatabase(databaseConfig, String(databaseQuery));
export { database };
