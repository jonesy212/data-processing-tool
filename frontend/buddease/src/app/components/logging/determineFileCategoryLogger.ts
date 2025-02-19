// determineFileCategoryLogger.ts
import { FileCategory, fileMapping } from "@/app/components/documents/FileType";
import {fileCategoryMapping} from '@/app/components/libraries//categories/fileCategoryMapping'


// Function to determine file category and log any conflicts
function determineFileCategoryLogger(fileName: string, extension: string): FileCategory | null {
    const category = Object.keys(fileCategoryMapping).find(
      (cat) => fileCategoryMapping[cat as FileCategory].includes(extension)
    );
  
    if (!category) {
      console.warn(`No category found for extension: ${extension} in file: ${fileName}`);
      return null;
    }
  
    const fileCategory = category as FileCategory;
    
    // Log conflict if the file category doesn't match the expected category
    if (fileMapping[fileName] && fileMapping[fileName].category !== fileCategory) {
      console.warn(`Category mismatch for file: ${fileName}. Expected: ${fileCategory}, Found: ${fileMapping[fileName].category}`);
    }
  
    return fileCategory;
  }
  export {determineFileCategoryLogger}