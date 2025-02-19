// appUtils.ts
import { AppTree } from "@/app/generators/generateAppTree";

// Helper function to retrieve a file from the tree structure
const getFileFromTree = (appTree: AppTree, fileName: string): string | null => {
    // Check if components is an object
    if (typeof appTree.components === 'object' && appTree.components !== null) {
        // Logic to traverse the tree structure and retrieve the file
        // Example: appTree.components['example_file.ts']
        const filePath = appTree.components[fileName];

        // Check if filePath is a string
        if (typeof filePath === 'string') {
            return filePath; // Return filePath if it's already a string
        } else if (Array.isArray(filePath) && filePath.length > 0) {
            // If filePath is an array of strings, join the array elements into a single string
            return filePath.join('');
        }
    }
    
    return null; // Return null if filePath is null or not a string
};

  
// Helper function to retrieve a folder from the tree structure
const getFolderFromTree = (appTree: AppTree, folderName: string): { [key: string]: string } | null => {
    // Logic to traverse the tree structure and retrieve the folder
    // Example: appTree['components']
    const folder = appTree[folderName];
    if (folder !== undefined && typeof folder === 'object') {
        if (typeof folder === 'string' || Array.isArray(folder)) {
            return null; // Invalid type, return null
        }
        if (typeof folder === 'object' && folder !== null) {
            // If folder is an object, transform it into { [key: string]: string }
            const folderAsObject: { [key: string]: string } = {};
            Object.entries(folder).forEach(([key, value]) => {
                folderAsObject[key] = value.toString(); // Convert values to strings if necessary
            });
            return folderAsObject; // Return the transformed object
        }
    }
    return null; // Return null if folder not found or not an object
};
  
// Helper function to retrieve a component name
const getComponentName = (componentName: string): string => {
  // Logic to retrieve the component name
  return componentName; // Return the component name
};

// Helper function to retrieve properties
const getProperties = (properties: { [key: string]: string }): { [key: string]: string } => {
  // Logic to retrieve properties
  return properties; // Return the properties
};



// Usage example
const appTree: AppTree = { components: { 'example_file.ts': 'example file content' } };
const file = getFileFromTree(appTree, 'example_file.ts');
const folder = getFolderFromTree(appTree, 'components');
const componentName = getComponentName('ExampleComponent');
const properties = getProperties({ property1: "value1", property2: "value2" });