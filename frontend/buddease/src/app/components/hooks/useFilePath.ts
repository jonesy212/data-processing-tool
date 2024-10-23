// Updated useFilePath hook
import { useEffect, useState } from 'react';
import getAppPath from '../../../../appPath';

const useFilePath = () => {
  const [filePath, setFilePath] = useState<string>('');

  useEffect(() => {
    const fetchVersionInfo = async () => {
      try {
        // Fetch version number and app version from an API endpoint or environment variables
        const response = await fetch('/api/version');
        const { versionNumber, appVersion } = await response.json();
        
        // Get the app path using the getAppPath function
        const appPath = getAppPath(versionNumber, appVersion);

        // Set the file path state
        setFilePath(appPath);
      } catch (error) {
        console.error('Error fetching version info:', error);
        // Handle error gracefully, e.g., show a notification to the user
      }
    };

    fetchVersionInfo();
  }, []);

  return filePath;
};

export default useFilePath;
