// loadDraftFromDatabase.tsx
import { DatabaseConfig } from "@/app/configs/DatabaseConfig";
import { Client } from "pg";

const loadDraftFromDatabase = async (
  config: DatabaseConfig,
  draftId: string
): Promise<any> => {
  const client = new Client(config); // Create a new database client
  
  try {
    await client.connect(); // Connect to the database

    // Construct the query to load the draft from the database
    const query = `
      SELECT * 
      FROM drafts 
      WHERE id = $1
    `;
    
    // Execute the query with the draftId as a parameter
    const result = await client.query(query, [draftId]);

    // Return the loaded draft
    return result.rows[0]; // Assuming we only expect one draft with the given id
  } catch (error) {
    console.error("Error loading draft from database:", error);
    throw error;
  } finally {
    await client.end(); // Close the database connection
  }
};

export default loadDraftFromDatabase;
