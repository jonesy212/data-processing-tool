import { fetchFolderContentsAPI } from '../../api/ApiFiles'
import { RootState } from "../../state/redux/slices/RootSlice";
import {useCallback, useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import { Folder } from '../data/ Folder';
import { clearFilteredEvents as clearFilteredEventsAction, selectFilteredEvents } from "@/app/components/state/redux/slices/FilteredEventsSlice";
import { ExtendedCalendarEvent } from "../../calendar/CalendarEventTimingOptimization";
import HighlightEvent from "../../documents/screenFunctionality/HighlightEvent";
import * as React from 'react'
import { CalendarEvent } from "../../calendar/CalendarEvent";
import { useFilterStore } from "../../state/stores/FilterStore";
import { refreshUIForFile } from "../../snapshots/refreshUI"
import { FilteredEventsState } from '../../state/redux/slices/FilteredEventState'

interface File {
    id?: string;
    name?: string | undefined;
    metadata: FileMetadata
  }
interface FileMetadata {
    size: number;
    createdAt: Date;
    updatedAt: Date;
    [key: string]: any; // Additional metadata fields
  }


// Props for FileManager
interface FileManagerProps {
    initialFiles: File[];
    initialFolders: Folder[];
    payload: any;
  }


  
  const FileManager: React.FC<FileManagerProps> = ({ initialFiles, initialFolders, payload }) => {
    // Filter out files with undefined ids and ensure that ids are strings
    const [files, setFiles] = useState<Map<string, File>>(() => {
      const fileMap = new Map<string, File>();
      initialFiles.forEach(file => {
        if (file.id) { // Ensure that id is defined
          fileMap.set(file.id, file);
        }
      });
      return fileMap;
    });

    const [folders, setFolders] = useState<Map<string, Folder>>(() => new Map(initialFolders.map(folder => [folder.id, folder])));
      
      const filterStore = useFilterStore(); // Use FilterStore instance
      const dispatch = useDispatch();
      const filtered = useSelector<RootState, FilteredEventsState>(selectFilteredEvents);
    
    const filteredEvents = filtered.payload;
  
    useEffect(() => {
      // Apply filter when filtered events change
      filterStore.setFilteredEvents(filteredEvents);
    }, [filteredEvents, filterStore]);
  
    // Update metadata for a specific file
    const updateFileMetadata = (fileId: string, newMetadata: Partial<FileMetadata>) => {
      setFiles(prevFiles => {
        const updatedFile = { ...prevFiles.get(fileId), metadata: { ...prevFiles.get(fileId)?.metadata, ...newMetadata } };

        if(updatedFile.name === undefined){
          throw new Error("Must provide a file name to update file")
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
            {file.name} - Size: {file.metadata.size}
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

  export type { File, FileMetadata,  FileManagerProps }