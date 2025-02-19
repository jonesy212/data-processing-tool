import { FileCategory, fileMapping } from "@/app/components/documents/FileType";
import { fileCategoryMapping } from "@/app/components/libraries/categories/fileCategoryMapping";
import { determineFileCategoryLogger } from "@/app/components/logging/determineFileCategoryLogger";

// Function to extract category from a file path
function getCategoryFromFilePath(filePath: string): FileCategory | null {
    // Extract the file extension from the file path
    const extension = filePath.split('.').pop() || '';
    const fileName = filePath.split('/').pop() || '';

    // First, check if the file is already mapped in fileMapping
    const existingMapping = fileMapping[fileName];

    if (existingMapping) {
        // If the file is mapped, use the category from fileMapping
        const existingCategory = existingMapping.category;
        console.log(`File: ${fileName} is already mapped to category: ${existingCategory}`);
        return existingCategory;
    }

    // If no mapping exists, check fileCategoryMapping for the category based on the extension
    const category = Object.keys(fileCategoryMapping).find((cat) =>
        fileCategoryMapping[cat as FileCategory].includes(extension)
    );

    if (!category) {
        console.warn(`No category found for extension: ${extension} in file: ${fileName}`);
        return null;
    }

    // If a category is found, return it
    const fileCategory = category as FileCategory;
    console.log(`File: ${fileName} with extension: ${extension} is categorized as: ${fileCategory}`);
    return fileCategory;
}

export { getCategoryFromFilePath };






// Example Usage: 
const filePath = "some/path/to/file.ts";
const category = getCategoryFromFilePath(filePath);
if (category) {
    console.log(`Category for the file: ${category}`);
} else {
    console.log(`No category found for the file`);
}