ApiMarkdown.ts
pages/api/documents/load-markdown.ts (or app/api/documents/load-markdown/route.ts)
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';

export default async function ReadContentHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { filePath } = req.body;
      
      // Read the Markdown file (server-side only)
      const markdownContent = await fs.readFile(filePath, "utf-8");
      
      res.status(200).json({ content: markdownContent });
    } catch (error) {
      console.error("Error loading Markdown document content:", error);
      res.status(500).json({ error: 'Failed to load markdown content' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}