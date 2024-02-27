// GenerateDatabase.tsx
import axios from 'axios';
import React, { useState } from 'react';
import { useNotification } from '../components/support/NotificationContext';
import NOTIFICATION_MESSAGES from '../components/support/NotificationMessages';
import { NOTIFICATION_TYPES } from '../components/support/NotificationTypes';
import { NotificationType } from '@/app/components/support/NotificationContext';

const DatabaseGenerator: React.FC = () => {
  const [databaseType, setDatabaseType] = useState<string>('');
  const [databaseName, setDatabaseName] = useState<string>('');
  const { notify } = useNotification(); // Destructure notify from useNotification

  const handleGenerate = async () => {
    // Validate inputs
    if (!databaseType || !databaseName) {
        notify('Database type and name are required.', NOTIFICATION_MESSAGES.Database.ERROR_CONNECTING, new Date(), "Success" as NotificationType);
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
      const response = await axios.post('/api/setup-database', databaseConfig);
      console.log('Database setup successful:', response.data);
      notify(NOTIFICATION_TYPES.SUCCESS, 'Success', new Date(), 'Database setup successful.');
    } catch (error) {
      console.error('Error setting up database:', error);
      notify(NOTIFICATION_TYPES.ERROR, 'Error', new Date(), 'Error setting up database. Please try again.');
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

