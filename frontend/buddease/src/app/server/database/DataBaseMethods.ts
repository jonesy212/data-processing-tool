// DataBaseMethods.ts
// src/server/database/DataBaseMethods.ts

import { DatabasePool } from '@/DatabasePool';

const dbConfig = {
  host: 'your-database-host',
  user: 'your-database-user',
  password: 'your-database-password',
  database: 'your-database-name',
  port: 5432,
};

const databasePool = new DatabasePool(dbConfig);

export async function fetchTextContentFromDatabase(documentId: number): Promise<string> {
  try {
    await databasePool.connect();
    const result = await databasePool.query('SELECT content FROM documents WHERE id = $1', [documentId]);
    if (result.rows?.length > 0) {
      return result.rows[0].content;
    }
    throw new Error('Document not found');
  } catch (error: any) {
    console.error('Error fetching text content:', error.message);
    throw error;
  } finally {
    await databasePool.end();
  }
}
