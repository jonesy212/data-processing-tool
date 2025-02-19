// GenerateDatabase.tsx
import { NotificationType } from "@/app/components/support/NotificationContext";
import axios from "axios";
import React, { useState } from "react";
import {
  NotificationTypeEnum,
  useNotification,
} from "../components/support/NotificationContext";
import NOTIFICATION_MESSAGES from "../components/support/NotificationMessages";
import { databaseService } from "../components/database/DatabaseOperations";
import { databaseConfig, databaseQuery } from "../configs/DatabaseConfig";


const {notify} = useNotification()
const DatabaseGenerator: React.FC = () => {
  const [databaseType, setDatabaseType] = useState<string>("");
  const [databaseName, setDatabaseName] = useState<string>("");
  const { notify } = useNotification(); // Destructure notify from useNotification

  const handleGenerate = async () => {
    // Validate inputs
    if (!databaseType || !databaseName) {
      notify(
        "databaseGenerationError",
        "Database type and name are required.",
        NOTIFICATION_MESSAGES.Database.ERROR_CONNECTING,
        new Date(),
        "ERROR" as NotificationType
      );
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
      notify(
        "Success",
        "Database setup successful.",
        NOTIFICATION_MESSAGES.Database.CONNECTING_SUCCESS,
        new Date(),
        NotificationTypeEnum.OperationSuccess
      );
    } catch (error) {
      console.error("Error setting up database:", error);
      notify(
        "databaseGenerationError",
        "Error setting up database. Please try again.",
        NOTIFICATION_MESSAGES.Database.ERROR_CONNECTING,
        new Date(),
        NotificationTypeEnum.OperationError
      );
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
export {database}