// route.ts
// Dataset Analysis & Hypothesis Testing
// // upload.ts
// src/app/api/datasets/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import DatabaseClient from '@/app/lib/server/database/DatabaseClient';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    // Process file upload (save to storage, cloud, etc.)
    const fileUrl = await processFileUpload(file);
    
    const dbConfig = { /* your config */ };
    const client = new DatabaseClient(dbConfig);
    await client.connect();
    
    const result = await client.query(
      `INSERT INTO datasets (name, description, file_url, file_size, mime_type) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, description, fileUrl, file.size, file.type]
    );
    
    return NextResponse.json({ 
      success: true, 
      dataset: result.rows[0],
      message: 'Dataset uploaded successfully' 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

async function processFileUpload(file: File): Promise<string> {
  // Implement your file storage logic here
  // This could be local storage, S3, Cloud Storage, etc.
  return `/uploads/${Date.now()}-${file.name}`;
}