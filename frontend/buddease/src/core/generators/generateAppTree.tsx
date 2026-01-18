// generateAppTree.tsx
import { treeDataService } from '@/core/api/service/TreeDataService';
import { getUsersData } from "@/core/api/UsersApi";
import { isUserLoggedIn } from "@/core/pages/forms/utils/CommonLoginLogic";
import { DocumentNode, DocumentTree } from "@/core/users/User";

// Define a type for your tree structure
type AppTree = {
  [key: string]: AppTree | DocumentNode | string; // Allow string values
};

// The rest of your existing functions remain the same...
const generateInitialAppTree = async (): Promise<AppTree | null> => {
  try {
    const userStatus = await isUserLoggedIn();

    if (userStatus.isLoggedIn) {
      if (!userStatus.dashboardConfig?.user) {
        console.warn('No user data found in dashboard config');
        return null;
      }

      const currentUser = userStatus.dashboardConfig.user;
      const userData = await getUsersData(currentUser.id);
      
      if (!userData) {
        console.warn('No user data retrieved');
        return null;
      }

      const documentTree = convertToDocumentTree(userData);
      const appTree = generateAppTree(documentTree);
      
      console.log(appTree);
      return appTree;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error generating app tree:', error);
    return null;
  }
};

// Define a function to retrieve the tree data from the database or any other source
const getTree = async (): Promise<DocumentTree | null> => {
  try {
    // Use the hybrid service
    const treeData = await treeDataService.getTreeData();
    
    if (!treeData) {
      // Return sample data if no data available
      return {
        documents: {
          category1: {
            document1: {
              title: "Document Title 1",
              content: "Document Content 1",
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            document2: {
              title: "Document Title 2", 
              content: "Document Content 2",
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
        },
      };
    }
    
    return treeData;
  } catch (error) {
    console.error('Error while fetching tree data:', error);
    return null;
  }
};

const generateAppTree = (treeData: DocumentTree): AppTree => {
  const generateAppTreeRecursive = (node: DocumentNode): AppTree => {
    const appTree: AppTree = {};

    Object.keys(node).forEach((category: string) => {
      if (Object.prototype.hasOwnProperty.call(node, category)) {
        const children = node[category];

        if (children && typeof children !== 'string' && !Array.isArray(children)) {
          appTree[category] = generateAppTreeRecursive(children);
        } else {
          appTree[category] = {};
        }
      }
    });

    return appTree;
  };

  return generateAppTreeRecursive(treeData);
};


// Convert user data to document tree structure
const convertToDocumentTree = (userData: any): DocumentTree => {
  if (!userData) return {};

  const documentTree: DocumentTree = {
    profile: {
      personal: {
        username: userData.username || '',
        email: userData.email || '',
        fullName: userData.fullName || '',
        bio: userData.bio || '',
      },
      contact: {
        phone: userData.phoneNumber || '',
        address: userData.address ? JSON.stringify(userData.address) : '',
      }
    },
    documents: {
      personal: {},
      shared: {},
      projects: {},
      visualizations: {}
    },
    projects: {},
    teams: {},
    settings: {
      privacy: userData.privacySettings ? JSON.stringify(userData.privacySettings) : {},
      notifications: userData.notificationPreferences ? JSON.stringify(userData.notificationPreferences) : {},
      security: userData.securitySettings ? JSON.stringify(userData.securitySettings) : {},
    }
  };

  // Merge existing documents
  if (userData.yourDocuments && typeof userData.yourDocuments === 'object') {
    documentTree.documents = { ...documentTree.documents, ...userData.yourDocuments };
  }

  // Add projects
  if (userData.projects && Array.isArray(userData.projects)) {
    userData.projects.forEach((project: any, index: number) => {
      if (project && project.name) {
        documentTree.projects[`project_${index}`] = {
          name: project.name,
          description: project.description || '',
          status: project.status || '',
          createdAt: project.createdAt || new Date(),
        };
      }
    });
  }

  // Add teams
  if (userData.teams && Array.isArray(userData.teams)) {
    userData.teams.forEach((team: any, index: number) => {
      if (team && team.name) {
        documentTree.teams[`team_${index}`] = {
          name: team.name,
          role: team.role || '',
          joinedAt: team.joinedAt || new Date(),
        };
      }
    });
  }

  return documentTree;
};


export default generateAppTree;
export { convertToDocumentTree, generateInitialAppTree };
export type { AppTree };

