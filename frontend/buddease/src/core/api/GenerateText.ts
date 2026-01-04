GenerateText.ts
generateText.ts

import { DocumentGenerator } from '@/core/server/ServerDocumentGenerator';
import fs from 'fs';
import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';

export default async function generateHandler(req: NextApiRequest, res: NextApiResponse) {
  const filePath = path.join(process.cwd(), 'templates', 'textTemplate.docx');
  const fileContent = await fs.promises.readFile(filePath);

  const generator = new DocumentGenerator();
  const result = await generator.createTextDocument('Text', { content: 'Hello!' }, fileContent);
  res.status(200).json({ message: result });
}