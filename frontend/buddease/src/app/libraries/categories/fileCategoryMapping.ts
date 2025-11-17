// fileCategoryMapping.ts
import { BaseData } from '@/app/models/data/Data';
import { Snapshot } from '@/app/snapshots/Snapshot';
import { FileCategory, fileMapping } from "@/app/documents/FileType";
import { determineFileCategoryLogger } from "@/app/libraries/logging/determineFileCategoryLogger";
import { T } from "@/app/models/data/dataStoreMethods";
import { getAllSnapshotEntries } from "@/app/snapshots/getSnapshotEntries";

// Define a mapping of file categories to their corresponding snapshot entries

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

// Enhanced processing with correction category integration
function processSnapshotsByCategoryWithCorrections<T extends BaseData<any>>(
  snapshot: Snapshot<T, any>,
  category: FileCategory
): { snapshot?: Snapshot<T, any>, corrections: Correction[] } {
  const corrections: Correction[] = [];
  
  if (snapshot && snapshot.data instanceof Map) {
    const filteredEntries = getEntriesByCategory(snapshot.data, category);
    
    if (filteredEntries.size > 0) {
      console.log(`Processing ${filteredEntries.size} files in category: ${category}`);

      filteredEntries.forEach((value, key) => {
        const extension = key.split('.').pop() || '';
        
        if (isValidFileCategory(key, extension)) {
          const determinedCategory = determineFileCategoryLogger(key, extension);
          const correctionCategory = suggestCorrectionCategoryFromFile(key, extension);
          
          // Generate corrections based on file analysis
          const fileCorrections = analyzeFileForCorrections(key, value, correctionCategory);
          corrections.push(...fileCorrections);
          
        } else {
          corrections.push(createFileCategoryCorrection(key, extension));
        }
      });
    }
  }

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
const allEntries = getAllSnapshotEntries(); // Get all entries
allEntries.forEach((snapshotMap) => {
  const processedSnapshot = processSnapshotsByCategory(snapshotMap, FileCategory.Component);
  if (processedSnapshot) {
    console.log("Processed snapshot successfully.");
  }
});