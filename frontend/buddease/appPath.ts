// appPath.ts
import path from 'path';

const getAppPath = () => {
  const currentFilePath = __filename;
  const appPath = path.resolve(currentFilePath, '../..'); // Go up three levels to reach the app root

  // Handle variations in app folder names (convert to lowercase)
  const normalizedAppPath = appPath.toLowerCase().replace(/[_ ]/g, ''); 

  return normalizedAppPath;
};

export default getAppPath;
