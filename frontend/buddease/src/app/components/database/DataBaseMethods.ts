// DataBaseMethods.ts

import express from 'express';
import authService from '../auth/AuthService';
import { DatabasePool } from './DatabasePool';

const app = express();
const port = 3000;

// Database configuration
const dbConfig = {
  host: 'your-database-host',
  user: 'your-database-user',
  password: 'your-database-password',
  database: 'your-database-name',
  port: 5432, // Default port for PostgreSQL
};

// Create an instance of DatabasePool
const databasePool = new DatabasePool(dbConfig);

// Middleware for checking authentication
app.use(async (req, res, next) => {
  const accessToken = authService.getAccessToken();

  if (accessToken && authService.isAuthenticated()) {
    next();
  } else {
    res.status(401).send('Unauthorized');
  }
});

async function fetchTextContentFromDatabase(documentId: number): Promise<string> {
  try {
    await databasePool.connect();
    const result = await databasePool.query('SELECT content FROM documents WHERE id = $1', [documentId]);
    if (result.length > 0) {
      return result[0].content;
    } else {
      throw new Error('Document not found');
    }
  } catch (error: any) {
    console.error('Error fetching text content:', error.message);
    throw error;
  } finally {
    await databasePool.end();
  }
}

app.get('/document/:id', async (req, res) => {
  const documentId = parseInt(req.params.id, 10);

  if (isNaN(documentId)) {
    return res.status(400).send('Invalid document ID');
  }

  try {
    const content = await fetchTextContentFromDatabase(documentId);
    res.send(content);
  } catch (error) {
    res.status(500).send('Error fetching document content');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


export {fetchTextContentFromDatabase}