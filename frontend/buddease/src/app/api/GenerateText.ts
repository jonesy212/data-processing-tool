// generateText.ts

import { DocumentGenerator } from '@/app/server/ServerDocumentGenerator';
import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function generateHandler(req: NextApiRequest, res: NextApiResponse) {
  const filePath = path.join(process.cwd(), 'templates', 'textTemplate.docx');
  const fileContent = await fs.promises.readFile(filePath);

  const generator = new DocumentGenerator();
  const result = await generator.createTextDocument('Text', { content: 'Hello!' }, fileContent);
  res.status(200).json({ message: result });
}