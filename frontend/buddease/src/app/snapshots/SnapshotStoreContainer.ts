// SnapshotStoreContainer.ts
import { snapshotStoreConfig, SnapshotStoreProps } from '.';

import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";

import { LanguageEnum } from "@/app/communications/LanguageEnum";
import { DataStore } from '@/app/projects/DataAnalysisPhase/DataProcessing/DataStore';
import { Category, generateCategoryProperties } from "@/app/libraries/categories/generateCategoryProperties";
import { Snapshot } from '@/app/snapshots/Snapshot';
import {
    BaseDataEntity,
    DefaultExcludedFields,
    DefaultMeta,
} from "@/config/BaseConfig";
import { SimulatedDataSource } from '@/createSnapshotOptions';
import { SnapshotContainer } from "./SnapshotContainer";
import { snapshotConfig } from '@/snapshotContainerUtils';
import { getSnapshotContainer } from "./snapshotOperations";
import SnapshotStore from "./SnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { SnapshotStoreOptions } from "./SnapshotStoreOptions";
interface SnapshotStoreContainer<
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    ExcludedFields extends DefaultExcludedFields<T> = DefaultExcludedFields<T>
  > {
    id?: string | number | undefined;
    storeId: number;
    snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields> | null;
    snapshotContainers: Map<string, SnapshotContainer<T, K, Meta, ExcludedFields>>;
    timestamp: string | number | Date | undefined;
    currentCategory: Category | undefined;
  
    setSnapshotCategory: (id: string, newCategory: string | Category) => void;
    getSnapshotCategory: (id: string) => Category | undefined;
  
    initializeSnapshotStore: (
      id: string | number | undefined,
      snapshotData: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> | undefined, // Fix type error
      category: Category | undefined,
      categoryProperties: CategoryProperties | undefined
    ) => Promise<void>;
  
    addSnapshotContainer: (snapshotId: string, container: SnapshotContainer<T, K, Meta, ExcludedFields>) => void;
    getSnapshotContainer: (snapshotId: string) => SnapshotContainer<T, K, Meta, ExcludedFields> | undefined;
  
    // Other methods as necessary for managing snapshots and configurations
  }
  
export const snapshotStoreContainer = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>(
    storeId: number,
    storeProps?: SnapshotStoreProps<T, K, Meta, ExcludedFields>
  ): SnapshotStoreContainer<T, K, Meta, ExcludedFields> => {
    if(!storeProps){
      throw new Error("storeProps is undefined");
    }
    const {
      name,
      version,
      schema,
      options,
      category,
      config,
      operation,
      expirationDate
     }
      = storeProps
    const snapshotStoreContainer: SnapshotStoreContainer<T, K, Meta, ExcludedFields> = {
      storeId,
      snapshotStore: null,
      snapshotContainers: new Map<string, SnapshotContainer<T, K, Meta, ExcludedFields>>(),
      timestamp: undefined,
      currentCategory: undefined,
  
      setSnapshotCategory: (id: string, newCategory: string | Category,) => {
        const container = snapshotStoreContainer.getSnapshotContainer(id);
      
        if (container) {
          // If newCategory is a string, generate appropriate CategoryProperties using the 'type' context
          container.currentCategory = typeof newCategory === 'string' 
            ? { 
                ...generateCategoryProperties(newCategory),  // Use generateCategoryProperties to create a full CategoryProperties object
                name: newCategory,
               } 
            : newCategory;  // If it's already a CategoryProperties object, use it directly
        }
      },
  
      getSnapshotCategory: (id: string): Category | undefined => {
        const container = snapshotStoreContainer.getSnapshotContainer(id);
        return container?.currentCategory;
      },
  
      initializeSnapshotStore: async (
        id: string | number | undefined,
        snapshotData: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> | undefined,
        category: Category | undefined,
        categoryProperties: CategoryProperties | undefined
      ): Promise<void> => {
        const snapshotId = id !== undefined ? String(id) : null;
       
        const options: SnapshotStoreOptions<T, K, Meta, ExcludedFields> = {
          retryDelay: 500,
          maxAge: 3600,
          staleWhileRevalidate: 1800,
          cacheKey: "defaultCacheKey",
          eventRecords: null,
          category: category || "defaultCategory",
          date: new Date(),
          type: "defaultType",
          snapshotId: snapshotId ?? "defaultSnapshotId",
          snapshotStoreConfig: snapshotStoreConfig ?? undefined,
          callbacks: {},
          snapshotConfig: snapshotConfig ?? undefined,
          subscribeToSnapshots: (snapshotId, callback, snapshots) => [],
          subscribeToSnapshot: (snapshotId, callback, snapshot) => null,
          unsubscribeToSnapshots: (snapshotId, snapshot, type, event, callback) => {},
          unsubscribeToSnapshot: (snapshotId, snapshot, type, event, callback) => {},
          delegate: async () => [],
          getDelegate: async (context) => {
            // Assuming simulatedDataSource can be cast to DataStore[]
            // If not, you'll need to implement proper conversion
            return context.simulatedDataSource as unknown as DataStore<T, K, Meta, ExcludedFields>[];
          },
          getCategory: (snapshotId, snapshot, type, event) => undefined,
          getSnapshotConfig: (
            snapshotId, snapshotContainer, criteria, category, categoryProperties, delegate, snapshotData, snapshot
          ) => undefined,
          dataStoreMethods: {},
          getDataStoreMethods: (snapshotStoreConfig, dataStoreMethods) => ({}),
          snapshotMethods: undefined,
          handleSnapshotOperation: async (snapshot, data, operation, operationType) => snapshot,
          handleSnapshotStoreOperation: async (snapshotId, snapshotStore, snapshot, operation, operationType, callback) => {},
          displayToast: (message, type: string, duration: number, onClose: () => void): Promise<void> => { console.log(message); },
          addToSnapshotList: (snapshot, subscribers): Promise<any> => {},
          simulatedDataSource: {} as SimulatedDataSource<T, K, Meta, ExcludedFields>,
          id: id ?? "default",
          storeId,
          baseURL: "",
          enabled: true,
          maxRetries: 3,
          data: snapshotData,
          metadata: {
            description: 'Default Description',
            metadataEntries: {
              fileOrFolderId1: {
                originalPath: '/path/to/file',
                alternatePaths: ['/alt/path1', '/alt/path2'],
                author: 'Author Name',
                timestamp: new Date(),
                fileType: 'txt',
                title: 'Default Title',
                keywords: ['default', 'keyword'],
                authors: ['Author 1', 'Author 2'],
                contributors: ['Contributor 1', 'Contributor 2'],
                publisher: 'Default Publisher',
                copyright: 'Default Copyright',
                license: 'Default License',
                links: ['https://example.com'],
                tags: ['tag1', 'tag2'],
              }
            },
            apiEndpoint: 'https://api.example.com',
            apiKey: 'your-api-key',
            structuredMetadata: {
              apiEndpoint: 'https://api.example.com',
              apiKey: 'your-api-key',
              timeout: 5000,
              retryAttempts: 3,
              metadataEntries: {
                'fileOrFolderId1': {
                  originalPath: '/path/to/file',
                  alternatePaths: ['/alt/path1', '/alt/path2'],
                  author: 'Author Name',
                  timestamp: new Date(),
                  fileType: 'txt',
                  title: 'Example Title',
                  description: 'Example Description',
                  keywords: ['example', 'metadata'],
                  authors: ['Author1', 'Author2'],
                  contributors: ['Contributor1'],
                  publisher: 'Publisher Name',
                  copyright: 'Copyright Text',
                  license: 'License Info',
                  links: ['https://example.com'],
                  tags: ['tag1', 'tag2'],
                }
              },
            },
            timeout: 5000,
            retryAttempts: 3,
            description: 'Snapshot Store Metadata Description',
            startDate: new Date(),
            endDate: new Date(),
            budget: 1000,
            status: 'active',
            teamMembers: ['member1', 'member2'],
            tasks: ['task1', 'task2'],
            milestones: ['milestone1', 'milestone2'],
            videos: [{
              title: 'Sample Video',
              url: 'https://example.com/video.mp4',
              duration: 1200,
              resolution: '1920x1080',
              sizeInBytes: 50000000,
              format: 'mp4',
              uploadDate: new Date(),
              uploader: 'Uploader Name',
              views: 1000,
              likes: 200,
              comments: 50,
              tags: ['tag1', 'tag2'],
              categories: ['category1', 'category2'],
              language: LanguageEnum.English,
              location: 'USA',
              data: {},
            }]
          },
          criteria: {}
        };
      
        const config: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
          snapshots: []
        };

        const { 
          payload,
          callback, 
          endpointCategory, initialState
        } = storeProps

        if (id === undefined) {
          snapshotStoreContainer.snapshotStore = new SnapshotStore<T, K, Meta, ExcludedFields>({
            storeId,
            name,
            version,
            schema,
            options,
            category,
            config,
            operation,
            expirationDate,
            payload, callback, storeProps, endpointCategory, initialState
          });
        } else {
          snapshotStoreContainer.snapshotStore = new SnapshotStore<T, K, Meta, ExcludedFields>({
              storeId,
              name,
              version,
              schema,
              options,
              category,
              config,
              operation,
              expirationDate,
              payload, callback, storeProps, endpointCategory, initialState
          });
        }
       
        const name = (await getSnapshotContainer(id ?? "default", snapshotFetcher)).snapshot.name;
        snapshotStoreContainer.snapshotStore = new SnapshotStore<T, K, Meta, ExcludedFields>({
          storeId,
          name,
          version,
          schema,
          options,
          category,
          config,
          operation,
          expirationDate,
          payload, callback, storeProps, endpointCategory, initialState
        });
      },      
      
      addSnapshotContainer: (snapshotId: string, container: SnapshotContainer<T, K, Meta, ExcludedFields>) => {
        snapshotStoreContainer.snapshotContainers.set(snapshotId, container);
      },
  
      getSnapshotContainer: (snapshotId: string) => {
        return snapshotStoreContainer.snapshotContainers.get(snapshotId);
      },
  
      // Add other methods as necessary
    };
  
    return snapshotStoreContainer;
  };
  
  export type { SnapshotStoreContainer };
