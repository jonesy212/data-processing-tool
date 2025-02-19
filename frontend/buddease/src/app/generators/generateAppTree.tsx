import { getUsersData } from "../api/UsersApi";
import { DocumentNode, DocumentTree } from "../components/users/User";
import { isUserLoggedIn } from "../pages/forms/utils/CommonLoginLogic";

// Define a type for your tree structure
type AppTree = {
  [key: string]: AppTree | DocumentNode | string; // Allow string values
};

// Define the main generateInitialAppTree function
const generateInitialAppTree = async (): Promise<AppTree | null> => {
  const userStatus = isUserLoggedIn(); // Call without any arguments

  if (userStatus.isLoggedIn) {
    const currentUser = userStatus.dashboardConfig.user;
    const userData = await getUsersData(currentUser.id);
    const appTree = generateAppTree(userData,yourDocuments);
    console.log(appTree);
    return appTree;
  } else {
    // Handle the case when the user is not logged in
    return null;
  }
};



// Define a function to retrieve the tree data from the database or any other source
const getTree = async (): Promise<DocumentTree | null> => {
  try {
    // Implement your logic to retrieve the tree data
    // For example, you might fetch it from a database
      const treeData = await databaseService.getTreeData();
      // For demonstration, let's return a sample tree data
  
      // Sample tree data representing a hierarchical document structure
      const sampleTreeData: DocumentTree = {
        documents: {
          // Main document categories
          category1: {
            // Sub-categories or individual documents
            document1: {
              // Document properties
              title: "Document Title 1",
              content: "Document Content 1",
              createdAt: new Date(),
              updatedAt: new Date(),
              // Other properties as needed
            },
            document2: {
              // Another document within category1
              title: "Document Title 2",
              content: "Document Content 2",
              createdAt: new Date(),
              updatedAt: new Date(),
              // Other properties as needed
            },
            // More documents or sub-categories within category1
          },
          category2: {
            // Another main category with its documents or sub-categories
            // Similar structure as category1
          },
          // More main categories as needed
        },
        // Additional properties or categories if necessary
      };
      return treeData;

  } catch (error) {
    // Handle errors if any occur during the data retrieval process
    console.error('Error while fetching tree data:', error);
    return null;
  }
};


// Define the main generateAppTree function
const generateAppTree = (treeData: DocumentTree): AppTree => {
  const generateAppTreeRecursive = (node: DocumentNode): AppTree => {
    const appTree: AppTree = {};

    Object.keys(node).forEach((category: string) => {
      if (Object.prototype.hasOwnProperty.call(node, category)) {
        const children = node[category];

        if (children && typeof children !== 'string' && !Array.isArray(children)) {
          // If it's an object (DocumentNode), recursively call generateAppTreeRecursive
          appTree[category] = generateAppTreeRecursive(children);
        } else {
          appTree[category] = {}; // Or set it to whatever data you want for leaf nodes
        }
      }
    });

    return appTree;
  };





  return generateAppTreeRecursive(treeData);
};

export default generateAppTree;
export { generateInitialAppTree };
export type { AppTree };

