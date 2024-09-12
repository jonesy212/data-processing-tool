import { CalendarEvent } from "../../CalendarEvent";
import { RootState } from "../../state/redux/slices/RootSlice";
import {useCallback, useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import { Folder } from '../data/ Folder';
import {useFilterStore } from '../../state/FilterStore';
import { clearFilteredEvents as clearFilteredEventsAction, selectFilteredEvents } from "@/app/components/state/redux/slices/FilteredEventsSlice";
import { ExtendedCalendarEvent } from "../../calendar/CalendarEventTimingOptimization";
import HighlightEvent from "../../documents/screenFunctionality/HighlightEvent";


interface File {
    id: string;
    name: string;
    metadata: FileMetadata;
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


  interface FilteredEventsState {
    payload: (ExtendedCalendarEvent | CalendarEvent | HighlightEvent)[];
  }
  
  
  const FileManager: React.FC<FileManagerProps> = ({ initialFiles, initialFolders, payload }) => {
      const [files, setFiles] = useState<Map<string, File>>(() => new Map(initialFiles.map(file => [file.id, file])));
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
        return new Map(prevFiles).set(fileId, updatedFile);
      });
    };
  
    // Refresh UI for a specific file
    const refreshUIForFile = (fileId: string) => {
      // Trigger a UI update for the specific file (e.g., re-render the file component)
      console.log(`Refreshing UI for file: ${fileId}`);
    };
  
    // Refresh contents of a specific folder
    const refreshFolderContents = (folderId: string) => {
      // Logic to refresh folder contents (e.g., re-fetch folder data from the server)
      console.log(`Refreshing folder contents for folder: ${folderId}`);
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
            <button onClick={() => refreshUIForFile(file.id)}>Refresh UI</button>
          </li>
        ))}
      </ul>
    </div>

    <div>
      <h3>Folders</h3>
      <ul>
        {Array.from(folders.values()).map(folder => (
          <li key={folder.id}>
            {folder.name}
            <button onClick={() => refreshFolderContents(folder.id)}>Refresh Contents</button>
            <button onClick={() => syncFolderWithServer(folder.id)}>Sync with Server</button>
          </li>
        ))}
      </ul>
    </div>
  </div>
    );
  };
  
  export default FileManager

  export type { File, FileMetadata,  FileManagerProps }