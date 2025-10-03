// src/app/api/datasets/search/route.ts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const tags = searchParams.get('tags');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    
    const dbConfig = { /* your config */ };
    const client = new DatabaseClient(dbConfig);
    await client.connect();
    
    let sql = 'SELECT * FROM datasets WHERE 1=1';
    const params = [];
    let paramCount = 0;
    
    if (query) {
      paramCount++;
      sql += ` AND (name ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      params.push(`%${query}%`);
    }
    
    if (dateFrom) {
      paramCount++;
      sql += ` AND created_at >= $${paramCount}`;
      params.push(dateFrom);
    }
    
    if (dateTo) {
      paramCount++;
      sql += ` AND created_at <= $${paramCount}`;
      params.push(dateTo);
    }
    
    sql += ' ORDER BY created_at DESC';
    
    const result = await client.query(sql, params);
    
    return NextResponse.json({ datasets: result.rows });
  } catch (error) {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}