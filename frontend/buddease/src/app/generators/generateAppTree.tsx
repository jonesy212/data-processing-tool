import { getUsersData } from "../api/UsersApi";
import { DocumentNode, DocumentTree } from "../components/users/User";
import { isUserLoggedIn } from "../pages/forms/utils/CommonLoginLogic";

// Define a type for your tree structure
type AppTree = {
  [key: string]: AppTree | DocumentNode; // Recursive definition
};

// Define the main generateInitialAppTree function
const generateInitialAppTree = async (): Promise<AppTree | null> => {
  const userStatus = isUserLoggedIn(); // Call without any arguments

  if (userStatus.isLoggedIn) {
    const currentUser = userStatus.dashboardConfig.user;
    const userData = await getUsersData(currentUser.id);
    const appTree = generateAppTree(userData.yourDocuments);
    console.log(appTree);
    return appTree;
  } else {
    // Handle the case when the user is not logged in
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
