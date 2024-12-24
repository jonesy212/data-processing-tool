// MetadataManager.tsx
let fs: any;
if (typeof window === 'undefined') {
  fs = require('fs');
}

import { Snapshot } from '@/app/components/snapshots/LocalStorageSnapshotStore';
import { version } from '@/app/components/versions/Version';
import { BaseMetadata, UnifiedMetaDataOptions } from '@/app/configs/database/MetaDataOptions';
import { fetchUserAreaDimensions } from '@/app/pages/layouts/fetchUserAreaDimensions';
import * as path from 'path';
import * as React from 'react';
import useErrorHandling from '../components/hooks/useErrorHandling';
import { K, T } from '../components/models/data/dataStoreMethods';
import determineFileType from './DetermineFileType';
import { StructuredMetadata, getStructureMetadataPath, useUndoRedo } from './StructuredMetadata';


// Define any extended metadata type if needed
interface ExtendedMetadata extends BaseMetadata {
  extraField?: string; // Add any additional fields
}



const area = fetchUserAreaDimensions().toString()
const metadata: UnifiedMetaDataOptions<T, K<T>> = useMetadata<T, K<T>>(area)
const currentMeta: StructuredMetadata<T, K<T>> = useMeta<T, K<T>>(area)

const initialState: StructuredMetadata<BaseMetadata, UnifiedMetaDataOptions<BaseMetadata>> = {
  name: 'metadata',
  id: '',
  category: '',
  timestamp: '',
  createdBy: '',
  tags: {},
  metadata: {
    area: area, 
    currentMeta: currentMeta,
    metadataEntries: {}
  },
  initialState: {},
  version: version,

  lastUpdated: new Date(),
  isActive: false,
  config: {},
 

  mappedMeta: new Map<
    string,
    Snapshot<BaseMetadata, UnifiedMetaDataOptions<BaseMetadata>, StructuredMetadata<BaseMetadata, UnifiedMetaDataOptions<BaseMetadata>>, never>
  >(),
  meta: {} as StructuredMetadata<BaseMetadata<T>, UnifiedMetaDataOptions<BaseMetadata<T>, BaseMetadata<T>, StructuredMetadata<BaseMetadata<T>, BaseMetadata<T>>, never>>,
  events: { eventRecords: {} },
  description: 'Metadata description',
  metadataEntries: {},
  apiEndpoint: '',
  apiKey: '',
  timeout: 0,
  retryAttempts: 0,
  childIds: [], relatedData: []


};
// Define your metadata management component
const MetadataManager: React.FC = () => {
  const { state, setState, undo, redo } = useUndoRedo(initialState);
  const { handleError } = useErrorHandling();

  // Add undo and redo handlers to the metadata structure
  (state as any).undo = undo;

  // Function to read metadata from a file
  const readMetadata = (filename: string): StructuredMetadata<BaseMetadata, UnifiedMetaDataOptions<BaseMetadata>> => {
    try {
      const structureMetadataPath = getStructureMetadataPath(filename);
      const data = fs.readFileSync(structureMetadataPath, 'utf-8');
      return JSON.parse(data);
    } catch (error: any) {
      handleError(`Error reading metadata file: ${error.message}`); // Handle error
      return initialState; // Return initial state on error
    }
  };

  // Function to write metadata to a file
  const writeMetadata = (
    filename: string,
    metadata: StructuredMetadata<BaseMetadata, UnifiedMetaDataOptions<BaseMetadata>>
  ): void => {
    try {
      const structureMetadataPath = getStructureMetadataPath(filename);
      const data = JSON.stringify(metadata, null, 2);
      fs.writeFileSync(structureMetadataPath, data, 'utf-8');
    } catch (error: any) {
      handleError(`Error writing metadata file: ${error.message}`); // Handle error
    }
  };

  // Function to track structure changes
  const trackStructureChanges = (basePath: string, filename: string): void => {
    const metadata = readMetadata(filename);

    const traverseDirectory = (dir: string) => {
      const files = fs.readdirSync(dir);

      for (const file of files) {
        const filePath = path.join(dir, file);
        const isDirectory = fs.statSync(filePath).isDirectory();
        const fileOrFolderId = Buffer.from(filePath).toString('base64');

        if (!metadata.metadataEntries[fileOrFolderId]) {
          const fileType = determineFileType({ filePath });

          metadata.metadataEntries[fileOrFolderId] = {
            author: '',
            timestamp: new Date(),
            originalPath: filePath,
            alternatePaths: [],
            fileType: (fileType as string) || 'Unknown',
            title: '',
            description: '',
            keywords: [],
            authors: [],
            contributors: [],
            publisher: '',
            copyright: '',
            license: '',
            links: [],
            tags: [],
          };
        }

        if (isDirectory) {
          traverseDirectory(filePath);
        }

        // Update alternate paths if they differ
        if (metadata.metadataEntries[fileOrFolderId].originalPath !== filePath) {
          metadata.metadataEntries[fileOrFolderId].alternatePaths.push(filePath);
        }
      }
    };

    traverseDirectory(basePath);
    writeMetadata(filename, metadata);

    // Update state with the latest metadata
    setState(metadata);
  };

  // Example usage
  const metadataFilePath = 'structure-metadata.json';
  const basePath = path.resolve(__dirname, 'src'); // Set your base path
  trackStructureChanges(basePath, metadataFilePath); // Pass an empty object as cacheStructure

  return (
    <div>
      <h1>Metadata Manager</h1>
      <button onClick={undo}>Undo</button>
      <button onClick={redo}>Redo</button>
    </div>
  );
};

export default MetadataManager;
