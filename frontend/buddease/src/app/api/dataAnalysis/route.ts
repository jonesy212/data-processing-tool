// dataAnalysis/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  
  try {
    let query = 'SELECT * FROM data_analysis';
    let params: any[] = [];
    
    if (projectId) {
      query += ' WHERE project_id = $1';
      params = [projectId];
    }
    
    const result = await pool.query(query, params);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching data analysis:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { project_id, analysis_type, results, created_at } = data;
    
    const query = `
      INSERT INTO data_analysis (project_id, analysis_type, results, created_at) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *
    `;
    
    const result = await pool.query(query, [project_id, analysis_type, results, created_at]);
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error posting data analysis:', error);
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
}