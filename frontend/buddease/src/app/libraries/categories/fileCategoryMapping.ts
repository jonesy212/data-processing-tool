// fileCategoryMapping.ts
import { BaseData } from '@/app/models/data/Data';
import { Snapshot } from '@/app/snapshots/Snapshot';
import { Correction } from '@/app/generators/corrections/CorrectionGenerator';
import { SnapshotUnion } from '@/app/snapshots/LocalStorageSnapshotStore';
import { FileCategory, fileMapping } from "@/app/documents/FileType";
import { SnapshotContainer } from '@/app/snapshots/SnapshotContainer';
import { SchemaField } from '@/app/config/metadata/SchemaField';
import { convertSnapshotToMap } from "@/app/typings/YourSpecificSnapshotType";
import { ExtendedVersionData } from '@/app/versions/VersionData';
import { SnapshotStoreConfig } from '@/app/snapshots/SnapshotStoreConfig';
import { determineFileCategoryLogger } from "@/app/logging/determineFileCategoryLogger";
import { T } from "@/app/models/data/dataStoreMethods";
import { getAllSnapshotEntries } from "@/app/snapshots/getSnapshotEntries";
import { UnifiedMetadata } from "@/app/config/MetaDataOptions";
import { CorrectionCategory } from '@/app/typings/correctionTypes';
import { Attachment } from "@/app/documents/attachment/Attachment";
import { BaseDataEntity, DefaultExcludedFields, DefaultIncludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { CategoryMapper } from '@/app/libraries/categories/CategoryMapper'
import  {analyzeWeb3File, analyzeSecurityFile, analyzePerformanceFile } from '@/app/generators/corrections/analyzers/fileCategoryAnalyzers'

// Define a mapping of file categories to their corresponding snapshot entries
/* ----------  missing mapping declaration  ---------- */
const fileCategoryMapping: Record<FileCategory, string[]> = {
  [FileCategory.Component]:        ['tsx', 'jsx', 'vue'],
  [FileCategory.Redux]:            ['ts', 'js'],
  [FileCategory.MobX]:             ['ts', 'js'],
  [FileCategory.API]:              ['ts', 'js'],
  [FileCategory.Utility]:          ['ts', 'js'],
  [FileCategory.Config]:           ['json', 'js', 'ts', 'yaml', 'yml'],
  [FileCategory.Test]:             ['test.ts', 'test.tsx', 'spec.ts', 'spec.tsx', 'test.js', 'spec.js'],
  [FileCategory.Documentation]:    ['md', 'mdx'],
  [FileCategory.Design]:           ['fig', 'sketch', 'xd'],
  [FileCategory.Multimedia]:       ['png', 'jpg', 'jpeg', 'gif', 'svg', 'mp4', 'webm'],
  [FileCategory.Configuration]:    ['config.js', 'config.ts', 'env'],
  [FileCategory.Analytics]:        ['ts', 'js'],
  [FileCategory.Localization]:     ['json', 'ts'],
  [FileCategory.SmartContract]:    ['sol'],
  [FileCategory.Bytecode]:         ['bin', 'hex'],
  [FileCategory.EthereumPackage]:  ['json'],
  [FileCategory.JWT]:              ['ts', 'js'],
  [FileCategory.BlockchainData]:   ['json', 'ts'],
  [FileCategory.CryptoKey]:        ['pem', 'key'],
  [FileCategory.Wallet]:           ['ts', 'js'],
  [FileCategory.Hash]:             ['ts', 'js'],
  [FileCategory.MerkleProof]:      ['ts', 'js'],
  [FileCategory.ENS]:              ['ts', 'js'],
};

// Enhanced mapping that bridges file categories and correction categories
const fileToCorrectionCategoryMap: Record<FileCategory, CorrectionCategory> = {
    [FileCategory.Component]: 'ui',
    [FileCategory.Redux]: 'structure',
    [FileCategory.MobX]: 'structure', 
    [FileCategory.API]: 'api',
    [FileCategory.Utility]: 'maintainability',
    [FileCategory.Config]: 'configuration',
    [FileCategory.Test]: 'testing',
    [FileCategory.Documentation]: 'readability',
    [FileCategory.Design]: 'ui',
    [FileCategory.Multimedia]: 'filesystem',
    [FileCategory.Configuration]: 'configuration',
    [FileCategory.Analytics]: 'performance',
    [FileCategory.Localization]: 'structure',
    [FileCategory.SmartContract]: 'web3',
    [FileCategory.Bytecode]: 'web3',
    [FileCategory.EthereumPackage]: 'web3',
    [FileCategory.JWT]: 'security',
    [FileCategory.BlockchainData]: 'web3',
    [FileCategory.CryptoKey]: 'security',
    [FileCategory.Wallet]: 'web3',
    [FileCategory.Hash]: 'security',
    [FileCategory.MerkleProof]: 'web3',
    [FileCategory.ENS]: 'web3',
};

// Enhanced function to suggest correction category based on file category
export function suggestCorrectionCategoryFromFile(fileName: string, extension: string): CorrectionCategory {
    const fileCategory = determineFileCategoryLogger(fileName, extension);
    
    if (fileCategory && fileToCorrectionCategoryMap[fileCategory]) {
        return fileToCorrectionCategoryMap[fileCategory];
    }
    
    // Fallback to CategoryMapper for files without specific mapping
    return CategoryMapper.suggestCategory(fileName, '', '');
}

/**
 * Creates a single "wrong-category" correction for a file.
 * Fits exactly into the Correction interface you already use.
 */
function createFileCategoryCorrection(
  fileName: string,
  extension: string,
  severity: 'low' | 'medium' | 'high' = 'low'
): Correction {
  return {
    id: `cat-${fileName}-${Date.now()}`, // unique enough for logs
    type: 'warning',
    severity,
    file: fileName,
    line: 1, // we don’t have a line number here
    message: `File extension ".${extension}" does not match any mapped FileCategory.`,
    code: `"${fileName}"`,
    fix: `Check fileCategoryMapping or rename the file to a known extension.`,
    category: 'structure', // generic bucket
  };
}

// Enhanced processing with correction category integration
// ------------------------------------------------------------------
//  Public entry-point : accepts SnapshotUnion  (Map | InitializedSnapshot)
// ------------------------------------------------------------------
function processSnapshotsByCategoryWithCorrections<
  T  extends BaseDataEntity,
  K  extends T = T,
  M  extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  A  extends Attachment = Attachment,
  Ex extends keyof T = DefaultExcludedFields<T>,
  In extends keyof T = keyof T
>(
  incoming: SnapshotUnion<T, K, M, A, Ex, In>,
  category: FileCategory
): { snapshot?: Snapshot<T, K, M, A, Ex, In>; corrections: Correction[] } {
  /* We only care about the branch that actually owns a Map */
  if (!incoming || !('data' in incoming) || !(incoming.data instanceof Map)) {
    return { corrections: [] }; // safe no-op for non-Map branches
  }

  /* Re-use the helper you already debugged – no code duplication */
  return processMapSnapshotsByCategoryWithCorrections(incoming, category);
}

// ------------------------------------------------------------------
//  Private helper : assumes Map-bearing Snapshot  (unchanged)
// ------------------------------------------------------------------
function processMapSnapshotsByCategoryWithCorrections<
  T  extends BaseDataEntity,
  K  extends T = T,
  M  extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  A  extends Attachment = Attachment,
  Ex extends keyof T = DefaultExcludedFields<T>,
  In extends keyof T = keyof T
>(
  snapshot: Snapshot<T, K, M, A, Ex, In>, // Map guaranteed
  category: FileCategory
): { snapshot?: Snapshot<T, K, M, A, Ex, In>; corrections: Correction[] } {
  const corrections: Correction[] = [];
  const dataMap = convertSnapshotToMap(snapshot); // Map<string, T>
  const filtered  = getEntriesByCategory(dataMap, category);

  filtered.forEach((value, key) => {
    const ext = key.split('.').pop() || '';
    if (isValidFileCategory(key, ext)) {
      corrections.push(
        ...analyzeFileForCorrections(key, value, suggestCorrectionCategoryFromFile(key, ext))
      );
    } else {
      corrections.push(createFileCategoryCorrection(key, ext));
    }
  });

  return { snapshot, corrections };
}

// Analyze individual files for corrections
function analyzeFileForCorrections(fileName: string, fileData: any, category: CorrectionCategory): Correction[] {
  const corrections: Correction[] = [];
  
  // Use CategoryMapper to analyze file content
  const suggestedCategory = CategoryMapper.suggestCategory(
    fileName, 
    fileData?.content || '', 
    fileData?.metadata || ''
  );
  
  // Add category-specific analysis here
  switch (category) {
    case 'web3':
      corrections.push(...analyzeWeb3File(fileName, fileData));
      break;
    case 'security':
      corrections.push(...analyzeSecurityFile(fileName, fileData));
      break;
    case 'performance':
      corrections.push(...analyzePerformanceFile(fileName, fileData));
      break;
  }
  
  return corrections;
}
 



  // Function to filter snapshot entries by category
function getEntriesByCategory(snapshot: Map<string, T>, category: FileCategory): Map<string, T> {
    const entries = new Map<string, T>();
    const extensions = fileCategoryMapping[category];
    
    snapshot.forEach((value, key) => {
      const fileInfo = fileMapping[key];
      if (fileInfo && fileInfo.category === category && extensions.includes(fileInfo.type)) {
        entries.set(key, value);
      }
    });
    
    return entries;
}

  
// Integrated function to process all snapshots and filter by file category
function processSnapshotsByCategory<T extends  BaseData<any>>(
  snapshot: Snapshot<T, any>,
  category: FileCategory
): Snapshot<T, any> | undefined {
  // Check if snapshot data is a valid Map
  if (snapshot && snapshot.data instanceof Map) {
    const filteredEntries = getEntriesByCategory(snapshot.data, category);
    
    // Check if there are any filtered entries
    if (filteredEntries.size > 0) {
      console.log(`Processing ${filteredEntries.size} files in the category: ${category}`);

      // Iterate over the filtered entries
      filteredEntries.forEach((value, key) => {
        const extension = key.split('.').pop() || '';

        // Check if the file category is valid and matches the specified category
        if (isValidFileCategory(key, extension)) {
          const determinedCategory = determineFileCategoryLogger(key, extension);
          if (determinedCategory === category) {
            console.log(`Processing file: ${key}`);
            // Add your custom processing logic here (e.g., updating data, logging)
          } else {
            console.warn(`File: ${key} does not match the expected category: ${category}`);
          }
        } else {
          console.warn(`Invalid file category or extension for file: ${key}`);
        }
      });
    } else {
      console.warn(`No entries found for the category: ${category}`);
    }

    // Return the original snapshot or a modified version if needed
    return snapshot;
  } else {
    console.warn("Snapshot is not a valid Map-like structure");
    return undefined;
  }
}

function isValidFileCategory(fileName: string, extension: string): fileName is string {
  const category = determineFileCategoryLogger(fileName, extension);
  return category !== null;
}

function wrapMapInSnapshot<
  T extends BaseDataEntity,
  K extends T = T,
  M extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  A extends Attachment = Attachment,
  Ex extends keyof T = DefaultExcludedFields<T>,
  In extends keyof T = keyof T
>(data: Map<string, T>): Snapshot<T, K, M, A, Ex, In> {
  return {
    data,
    deleted: false,
    initialState: {} as T,
    isCore: true,
    initialConfig: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    
    
    // ---------- CoreSnapshot required stubs ----------
    id: crypto.randomUUID(),
    major: 1,
    minor: 0,
    patch: 0,
    type: 'manual',
    snapshot: crypto.randomUUID(),
    storeId: 0,
    label: '',
    description: '',
    initializedState: '',
    taskIdToAssign: '',
    currentCategory: '',
    tags: [],
    traits: {},
    attachments: [] as A[],
    config: {} as Promise<SnapshotStoreConfig<T, K, M, A, Ex, In> | null>,
    metadata: {} as UnifiedMetadata<T, K, M, A, Ex, In>,
    mappedSnapshotData: {} as Map<string, Snapshot<T, K, M, A, Ex, In>>, 
    versionInfo: {} as ExtendedVersionData<T, K, M, A, Ex, In>, 
    snapshotContainer: {} as SnapshotContainer<T, K, M, A, Ex, In>, 
    onInitialize: (callback: () => void) => {},
    schema: {} as Record<string, SchemaField>,
    // (add any other mandatory CoreSnapshot fields your build demands)
  } as Snapshot<T, K, M, A, Ex, In>;
}

export { fileCategoryMapping, getEntriesByCategory, processSnapshotsByCategory };





// EXAMPE CODE
  // Function to get file extensions for a specific category
function getFileExtensionsForCategory(category: FileCategory): string[] {
    return fileCategoryMapping[category] || [];
}
  
// Example usage
const componentExtensions = getFileExtensionsForCategory(FileCategory.Component);
console.log(`File extensions for Component category: ${componentExtensions.join(", ")}`);


  // Example usage of getAllSnapshotEntries
const allEntries = getAllSnapshotEntries?.() ?? []; 

allEntries.forEach((plainMap) => {
  const snapshot = wrapMapInSnapshot(plainMap);
  const processed = processSnapshotsByCategoryWithCorrections(
    snapshot,
    FileCategory.Component
  );
  if (processed.snapshot) {
    console.log('Processed snapshot successfully.');
  }
});