// src/app/api/datasets/[id]/statistics/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dbConfig = { /* your config */ };
    const client = new DatabaseClient(dbConfig);
    await client.connect();
    
    // Get basic statistics
    const statsResult = await client.query(
      `SELECT 
         COUNT(*) as total_records,
         MIN(created_at) as first_upload,
         MAX(created_at) as last_updated
       FROM dataset_records WHERE dataset_id = $1`,
      [params.id]
    );
    
    return NextResponse.json({ statistics: statsResult.rows[0] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get statistics' }, { status: 500 });
  }
}