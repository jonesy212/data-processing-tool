generate.ts
generate.ts
import { ServerDocumentGenerator } from '@/core/server/ServerDocumentGenerator';
import { ServerFileSystem } from '@/core/server/serverFileSystem';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { documentType, data, template } = await request.json();
  
  // Document-specific logic:
  const generator = new ServerDocumentGenerator();
  const result = await generator.createFinancialReport(data, template);
  
  return NextResponse.json({ document: result });
}


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const fileSystem = new ServerFileSystem();
    // Handle document generation
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}