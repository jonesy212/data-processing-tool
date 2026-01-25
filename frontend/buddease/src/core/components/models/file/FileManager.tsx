// FileManager.tsx
// Props for FileManager
import { fetchFolderContentsAPI } from '@/core/api/ApiFiles';
import { Folder } from '@/core/models/data/Folder';
import { refreshUIForFile } from '@/core/snapshots/refreshUI';
import type { RootState } from '@/core/state/redux/slices/RootSlice';
import type { FilteredEventsState } from '@/core/state/stores/FilterStore';
import { useFilterStore } from '@/core/state/stores/FilterStore';
import type { FilterAttachment, FilterEntity, FilterExcludedFields, FilterIncludedFields, FilterK, FilterMeta } from '@/core/typings/entities/FilterEntity';
import type { AppFile, FileMetadata } from '@/core/typings/file/fileTypes';
import { React } from 'react';
import { useDispatch, useSelector } from 'react-redux';

interface FileManagerProps {
  initialFiles: AppFile[];
  initialFolders: Folder[];
  payload: any;
}

const FileManager: React.FC<FileManagerProps> = ({ initialFiles, initialFolders, payload }) => {
  // Filter out files with undefined ids and ensure that ids are strings
  const [files, setFiles] = useState<Map<string, AppFile>>(() => {
    const fileMap = new Map<string, AppFile>();
    initialFiles.forEach(file => {
      if (file.id) { 
        // Ensure that id is defined
        fileMap.set(file.id, file);
      }
    });
    return fileMap;
  });

  const [folders, setFolders] = useState<Map<string, Folder>>(() => new Map(initialFolders.map(folder => [folder.id, folder])));
    
  const filterStore = useFilterStore(); // Use FilterStore instance
  const dispatch = useDispatch();
  const filtered = useSelector((state: RootState) => 
    state.filteredEvents as FilteredEventsState<FilterEntity, FilterK, FilterMeta, FilterAttachment, FilterExcludedFields, FilterIncludedFields>
  );

  const filteredEvents = filtered.payload;

  useEffect(() => {
    // Apply filter when filtered events change
    filterStore.setFilteredEvents(filteredEvents);
  }, [filteredEvents, filterStore]);

  // Update fileMetadata for a specific file
  const updateFileMetadata = (fileId: string, newMetadata: Partial<FileMetadata>) => {
    setFiles(prevFiles => {
      const existingFile = prevFiles.get(fileId);
      
      if (!existingFile) {
        console.warn(`File with ID ${fileId} not found`);
        return prevFiles; // Return unchanged if file doesn't exist
      }

      // Create a properly typed updated file
      const updatedFile: AppFile = {
        ...existingFile,
        fileMetadata: {
          ...existingFile.fileMetadata,
          ...newMetadata
        }
      };

      // Validate required fields
      if (!updatedFile.fileMetadata.fileName) {
        throw new Error("File must have a fileName in fileMetadata");
      }

      return new Map(prevFiles).set(fileId, updatedFile);
    });
  };
  // Refresh UI for a specific file
  const handleRefreshUIForFile = (fileId: number) => {
    refreshUIForFile(fileId); // Call the imported function
  };


  // Refresh contents of a specific folder
  const refreshFolderContents = async (folderId: string) => {
    try {
      // Fetch the updated folder contents from the API
      const updatedFolderContents = await fetchFolderContentsAPI(folderId); // You would define this API call
  
      // Update the local state with the new contents
      setFolders((prevFolders) => {
        const newFolders = new Map(prevFolders); // Create a copy of the current folders
        const updatedFolder = updatedFolderContents; // Assuming the API returns the updated folder data
  
        newFolders.set(updatedFolder.id, updatedFolder); // Update or add the folder in the map
        return newFolders; // Return the new state
      });
  
      console.log(`Folder contents refreshed for folder: ${folderId}`);
    } catch (error) {
      console.error(`Failed to refresh folder contents for folder ID ${folderId}:`, error);
    }
  };
    

  // Sync folder with server
  const syncFolderWithServer = async (folderId: string) => {
    try {
      // Example API call to sync folder data
      const response = await fetch(`/api/folders/${folderId}/sync`, { method: 'POST' });
      const updatedFolder = await response.json();
      setFolders(prevFolders => new Map(prevFolders).set(folderId, updatedFolder));
    } catch (error) {
      console.error(`Failed to sync folder with server: ${folderId}`, error);
    }
  };

  // Handle filter actions
  const applyFilter = useCallback(() => {
    filterStore.applyFilter();
  }, [filterStore]);

  const clearFilter = useCallback(() => {
    filterStore.clearFilter();
  }, [filterStore]);

  return (
      <div>
  <button onClick={applyFilter}>Apply Filter</button>
  <button onClick={clearFilter}>Clear Filter</button>

  {/* Render files and folders */}
  <div>
    <h3>Files</h3>
    <ul>
      {Array.from(files.values()).map(file => (
        <li key={file.id}>
          {file.name} - Size: {file.fileMetadata.size}
          <button onClick={() => refreshUIForFile(Number(file.id))}>Refresh UI</button>
        </li>
      ))}
    </ul>
  </div>

  <div>
    <h3>Folders</h3>
    <ul>
      {Array.from(folders.values()).map(folder => (
        <div>
          <li key={folder.id}>
            {folder.name}
            <button onClick={() => refreshFolderContents(folder.id)}>Refresh Contents</button>
            <button onClick={() => syncFolderWithServer(folder.id)}>Sync with Server</button>
          </li>
          <button onClick={() => handleRefreshUIForFile(folder.id)}>Refresh UI</button>
        </div>
      ))}
    </ul>
  </div>
</div>
  );
};

export default FileManager

export type { FileManagerProps };

