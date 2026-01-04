server.ts
import authService from '@/core/server/auth/AuthService';
import { DatabasePool } from '@/core/server/database/DatabasePool';
import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

const app = express();
const server = createServer(app);
const port = 3001;

WebSocket server
const wss = new WebSocketServer({ server });

Database setup
const dbConfig = {
  host: 'your-database-host',
  user: 'your-database-user',
  password: 'your-database-password',
  database: 'your-database-name',
  port: 5432,
};

const databasePool = new DatabasePool(dbConfig);

Middleware for checking authentication
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
    if (result.rows && result.rows.length > 0) {
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

REST route
app.get('/document/:id', async (req: Request, res: Response) => {
  const documentId = parseInt(req.params.id, 10);
  if (isNaN(documentId)) return res.status(400).send('Invalid document ID');

  try {
    const content = await fetchTextContentFromDatabase(documentId);
    res.send(content);
  } catch (error) {
    res.status(500).send('Error fetching document content');
  }
});


app.post('/process',(req: Request, res: Response) => {
  // Handle your response here
  const data = req.body; // Assuming you're sending data in the body
  res.status(200).send({ result: data }); // Sending response with status code
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});