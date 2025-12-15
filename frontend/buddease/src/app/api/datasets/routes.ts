// routes.ts
// src/app/api/datasets/route.ts
import { NextRequest, NextResponse } from 'next/server';
import DatabaseClient from '@/app/api/DatabaseClient';

// GET /api/datasets - List all datasets
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const dbConfig = { /* your config */ };
    const client = new DatabaseClient(dbConfig);
    await client.connect();
    
    const result = await client.query(
      'SELECT * FROM datasets ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, (page - 1) * limit]
    );
    
    return NextResponse.json({ datasets: result.rows });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch datasets' }, { status: 500 });
  }
}

// POST /api/datasets - Create new dataset
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, file_url, metadata } = body;
    
    const dbConfig = { /* your config */ };
    const client = new DatabaseClient(dbConfig);
    await client.connect();
    
    const result = await client.query(
      `INSERT INTO datasets (name, description, file_url, metadata) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, description, file_url, metadata]
    );
    
    return NextResponse.json({ dataset: result.rows[0] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create dataset' }, { status: 500 });
  }
}

