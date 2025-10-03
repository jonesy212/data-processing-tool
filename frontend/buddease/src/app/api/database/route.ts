import { NextRequest, NextResponse } from 'next/server';
import { Pool, PoolConfig } from 'pg';

const poolConfig: PoolConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
};

const pool = new Pool(poolConfig);

export async function POST(request: NextRequest) {
  try {
    const { action, tableName, data, query, params } = await request.json();
    
    switch (action) {
      case 'insert':
        const result = await insertData(tableName, data);
        return NextResponse.json(result);
      
      case 'query':
        const queryResult = await executeQuery(query, params);
        return NextResponse.json(queryResult);
      
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Database API error:', error);
    return NextResponse.json({ error: 'Database operation failed' }, { status: 500 });
  }
}

async function insertData(tableName: string, data: any) {
  const columns = Object.keys(data).join(', ');
  const placeholders = Object.keys(data).map((_, index) => `$${index + 1}`).join(', ');
  const values = Object.values(data);
  
  const sql = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders}) RETURNING *`;
  const result = await pool.query(sql, values);
  return result.rows[0];
}

async function executeQuery(query: string, params: any[] = []) {
  const result = await pool.query(query, params);
  return result.rows;
}