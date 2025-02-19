// FuzzyMatch.ts
import AppTreeService from "@/app/services/AppTreeService";
import fuzzysort from "fuzzysort";
import { useAuth } from "../auth/AuthContext";
import { processTextWithSpaCy } from "../intelligence/AutoGPTSpaCyIntegration";
import { AllTypes } from "../typings/PropTypes";

interface BaseEntity {
  id: string | number;
  name?: string | undefined;
  description?: string | null | undefined;
  createdAt: string | Date | undefined;
  createdBy: string | undefined;
  updatedBy?: string;
  filePathOrUrl?: string;
  source?: string;
}


// Define a type for your entities
interface Entity extends BaseEntity {
 
  type?: AllTypes;  // Add more properties as needed
}

// Function to perform fuzzy matching with spaCy processing
export const fuzzyMatchEntities = async (
  query: string,
  entities: Entity[]
): Promise<Entity[]> => {
  try {
    // Get the authentication state from the context
    const { user } = useAuth();

    // Check if the user is logged in
    if (!user || !user.isLoggedIn) {
      return [];
    }

    // Get the app tree
    const appTree = await AppTreeService.getTree(); // Assuming getTree function is defined in AppTreeService

    // If there is no app tree, return an empty array
    if (!appTree) {
      return [];
    }

    // Convert the appTree to an array or use the expected type for processTextWithSpaCy
    const appTreeArray = Object.values(appTree);

    // Use spaCy to process the query for advanced NLP features
    const processedQuery = await processTextWithSpaCy(query, appTreeArray);

    // Perform fuzzy search on the processed query
    const results = fuzzysort.go(processedQuery, entities, { key: "name" });

    // Return the matched entities
    return results.map((result) => result.obj);
  } catch (error) {
    console.error(
      "Error performing fuzzy matching with spaCy processing:",
      error
    );
    return [];
  }
};

const entities: Entity[] = [
  {
    id: 1, name: "Apple Inc.", description: "Tech company", source: "local", type: "company",
    createdBy: undefined,
    createdAt: undefined
  },
  {
    id: 2, name: "Microsoft Corporation", description: "Tech company", source: "global", type: "company",
    createdBy: undefined,
    createdAt: undefined
  },
  {
    id: 3, name: "Project X", description: "Development project", source: "local", type: "project",
    createdBy: undefined,
    createdAt: undefined
  },
];

// Query for fuzzy matching with NLP processing
const query = "Microsft Corp"; // Intentional typo for demonstration

// Perform fuzzy matching with NLP processing
const matchedEntities = fuzzyMatchEntities(query, entities);
const filteredEntities = entities.filter((entity) => entity.type === "company");
console.log("Matched Entities:", matchedEntities, filteredEntities);
export type { BaseEntity, Entity };
