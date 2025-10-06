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
    const { action, tableName, data, query, params, conditions, updateData, id } = await request.json();
    
    switch (action) {
      case 'insert':
        const insertResult = await insertData(tableName, data);
        return NextResponse.json(insertResult);
      
      case 'query':
        const queryResult = await executeQuery(query, params);
        return NextResponse.json(queryResult);
      
      case 'select':
        const selectResult = await selectData(tableName, conditions, params);
        return NextResponse.json(selectResult);
      
      case 'update':
        const updateResult = await updateData(tableName, updateData, conditions, params);
        return NextResponse.json(updateResult);
      
      case 'delete':
        const deleteResult = await deleteData(tableName, conditions, params);
        return NextResponse.json(deleteResult);
      
      case 'remove':
        const removeResult = await removeData(tableName, id);
        return NextResponse.json(removeResult);
      
      case 'share':
        const shareResult = await shareData(tableName, data);
        return NextResponse.json(shareResult);
      
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Database API error:', error);
    return NextResponse.json({ error: 'Database operation failed' }, { status: 500 });
  }
}

// INSERT operation
async function insertData(tableName: string, data: any) {
  const columns = Object.keys(data).join(', ');
  const placeholders = Object.keys(data).map((_, index) => `$${index + 1}`).join(', ');
  const values = Object.values(data);
  
  const sql = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders}) RETURNING *`;
  const result = await pool.query(sql, values);
  return result.rows[0];
}

// SELECT operation
async function selectData(tableName: string, conditions?: string, params: any[] = []) {
  let sql = `SELECT * FROM ${tableName}`;
  if (conditions) {
    sql += ` WHERE ${conditions}`;
  }
  
  const result = await pool.query(sql, params);
  return result.rows;
}

// UPDATE operation
async function updateData(tableName: string, updateData: any, conditions?: string, params: any[] = []) {
  const setClause = Object.keys(updateData)
    .map((key, index) => `${key} = $${index + 1}`)
    .join(', ');
  
  const values = Object.values(updateData);
  let sql = `UPDATE ${tableName} SET ${setClause}`;
  
  if (conditions) {
    sql += ` WHERE ${conditions}`;
    // Add condition parameters after update values
    values.push(...params);
  }
  
  const result = await pool.query(sql, values);
  return { 
    success: true, 
    rowCount: result.rowCount,
    message: `${result.rowCount} row(s) updated`
  };
}

// DELETE operation with conditions
async function deleteData(tableName: string, conditions?: string, params: any[] = []) {
  let sql = `DELETE FROM ${tableName}`;
  if (conditions) {
    sql += ` WHERE ${conditions}`;
  }
  
  const result = await pool.query(sql, params);
  return {
    success: true,
    rowCount: result.rowCount,
    message: `${result.rowCount} row(s) deleted`
  };
}

// REMOVE operation (delete by ID)
async function removeData(tableName: string, id: number | string) {
  const sql = `DELETE FROM ${tableName} WHERE id = $1`;
  const result = await pool.query(sql, [id]);
  return {
    success: true,
    rowCount: result.rowCount,
    message: `${result.rowCount} row(s) removed`
  };
}

// SHARE operation (for data sharing functionality)
async function shareData(tableName: string, data: any) {
  // This could create a shared access record, update permissions, etc.
  // Example: Insert into a shares table or update a shared flag
  const { resourceId, userId, permissionLevel = 'read' } = data;
  
  const sql = `
    INSERT INTO data_shares (table_name, resource_id, user_id, permission_level, shared_at) 
    VALUES ($1, $2, $3, $4, NOW()) 
    RETURNING *
  `;
  
  const result = await pool.query(sql, [tableName, resourceId, userId, permissionLevel]);
  return {
    success: true,
    share: result.rows[0],
    message: 'Data shared successfully'
  };
}

// Generic query execution
async function executeQuery(query: string, params: any[] = []) {
  const result = await pool.query(query, params);
  return result.rows;
}