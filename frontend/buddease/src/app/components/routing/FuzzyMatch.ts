// FuzzyMatch.ts
import fuzzysort from 'fuzzysort';
import { processTextWithSpaCy } from '../Inteigents/AutoGPTSpaCyIntegration';
import { useAuth } from '../auth/AuthContext';

// Define a type for your entities
interface Entity {
  id: string;
    name: string;
    type: string;
  // Add more properties as needed
}

// Function to perform fuzzy matching with spaCy processing
export const fuzzyMatchEntities = async (
  query: string,
  entities: Entity[]
): Promise<Entity[]> => {
  try {

       // Get the authentication state from the context
       const { user } = useAuth()

       // Check if the user is logged in
       if (!user || !user.isLoggedIn) {
         return [];
       }
   
       // Get the app tree
       const appTree = await getTree(); // Assuming getTree function is defined in AppTreeService
   
       // If there is no app tree, return an empty array
       if (!appTree) {
         return [];
       }
   
       // Use spaCy to process the query for advanced NLP features
       const processedQuery = await processTextWithSpaCy(query, appTree);
   
       // Perform fuzzy search on the processed query
       const results = fuzzysort.go(processedQuery, entities, { key: 'name' });
   
    // Return the matched entities
    return results.map((result) => result.obj);
  } catch (error) {
    console.error('Error performing fuzzy matching with spaCy processing:', error);
    return [];
  }
};

// Assuming you have a list of entities
const entities: Entity[] = [
    { id: '1', name: 'Apple Inc.', type: 'company' },
    { id: '2', name: 'Microsoft Corporation', type: 'company' },
    { id: '3', name: 'Project X', type: 'project' },
   // Add more entities as needed
];

// Query for fuzzy matching with NLP processing
const query = 'Microsft Corp'; // Intentional typo for demonstration

// Perform fuzzy matching with NLP processing
const matchedEntities = await fuzzyMatchEntities(query, entities);
const filteredEntities = entities.filter((entity) => entity.type === 'company');
console.log('Matched Entities:', matchedEntities, filteredEntities);
