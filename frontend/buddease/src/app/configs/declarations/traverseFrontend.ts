import clientApiService from '@/app/api/ApiClient';
import { getCurrentAppInfo } from '@/app/components/versions/VersionGenerator';
import { AxiosResponse } from 'axios';
import getAppPath from '../../../../appPath';
import { AppStructureItem } from '../appStructure/AppStructure';

interface FrontendStructure {
  // Define your existing structure interface
}

const frontendStructure: FrontendStructure = {};

export const traverseFrontendDirectory = async (
  dir: string
): Promise<AppStructureItem[]> => {
  const filesResponse: AxiosResponse<string[], any> =
    await clientApiService.listFiles(dir); // Use ApiClient to fetch files
  const files: string[] = filesResponse.data;
  const result: AppStructureItem[] = [];

  for (const filePath of files) {
    const isDirectory = false; // Assuming the API doesn't differentiate between files and directories

    if (isDirectory) {
      // Handle directory traversal if needed
    } else {
      // Logic to parse file and update frontendStructure accordingly
      // Example: if (file.endsWith('.tsx')) { /* update frontendStructure */ }
      const content: AxiosResponse<string, any> =
        await clientApiService.getFileContent(filePath); // Use ApiClient to fetch file content
      const appStructureItem: AppStructureItem = {
        path: filePath,
        content: content.data,
        id: '',
        name: '',
        type: 'file',
        items: {}
      };
      result.push(appStructureItem);
    }
  }
  return result;
};



// Update the file path with the correct project path

const { versionNumber, appVersion } = getCurrentAppInfo();
const projectPath = getAppPath(versionNumber, appVersion);
const projectStructure = await traverseFrontendDirectory(projectPath);

console.log(projectStructure);
