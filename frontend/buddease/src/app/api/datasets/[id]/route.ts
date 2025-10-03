// src/app/api/datasets/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import DatabaseClient from '@/app/lib/server/database/DatabaseClient';

// GET /api/datasets/[id] - Get specific dataset
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dbConfig = { /* your config */ };
    const client = new DatabaseClient(dbConfig);
    await client.connect();
    
    const result = await client.query(
      'SELECT * FROM datasets WHERE id = $1',
      [params.id]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Dataset not found' }, { status: 404 });
    }
    
    return NextResponse.json({ dataset: result.rows[0] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch dataset' }, { status: 500 });
  }
}

// PUT /api/datasets/[id] - Update dataset
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, description, metadata } = body;
    
    const dbConfig = { /* your config */ };
    const client = new DatabaseClient(dbConfig);
    await client.connect();
    
    const result = await client.query(
      `UPDATE datasets SET name = $1, description = $2, metadata = $3, updated_at = NOW() 
       WHERE id = $4 RETURNING *`,
      [name, description, metadata, params.id]
    );
    
    return NextResponse.json({ dataset: result.rows[0] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update dataset' }, { status: 500 });
  }
}

// DELETE /api/datasets/[id] - Delete dataset
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dbConfig = { /* your config */ };
    const client = new DatabaseClient(dbConfig);
    await client.connect();
    
    await client.query('DELETE FROM datasets WHERE id = $1', [params.id]);
    
    return NextResponse.json({ success: true, message: 'Dataset deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete dataset' }, { status: 500 });
  }
}