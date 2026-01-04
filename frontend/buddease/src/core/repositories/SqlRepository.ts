app/repositories/SqlRepository.ts
import { databaseConnection } from '@/core/config/databaseConnection'; // Your existing PostgreSQL config
import { DomainObject } from '@/core/typings/DomainObject';
import { Pool } from 'pg';

export class SqlRepository {
  private pool: Pool;

  constructor() {
    this.pool = new Pool(databaseConnection);
    this.initializeDatabase();
  }

  private async initializeDatabase(): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS domain_objects (
          id VARCHAR(255) PRIMARY KEY,
          type VARCHAR(100) NOT NULL,
          data JSONB NOT NULL,
          version INTEGER DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          metadata JSONB DEFAULT '{}'
        );

        CREATE INDEX IF NOT EXISTS idx_domain_objects_type ON domain_objects(type);
        CREATE INDEX IF NOT EXISTS idx_domain_objects_updated ON domain_objects(updated_at);
        
        -- Add sync status tracking table
        CREATE TABLE IF NOT EXISTS sync_status (
          entity_id VARCHAR(255) PRIMARY KEY REFERENCES domain_objects(id),
          synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          sync_error TEXT,
          retry_count INTEGER DEFAULT 0
        );
      `);
    } finally {
      client.release();
    }
  }

  async save(entity: DomainObject): Promise<void> {
    const client = await this.pool.connect();
    try {
      const existing = await this.get(entity.id);
      
      if (existing && existing.version !== entity.version) {
        throw new Error(`Version conflict for entity ${entity.id}`);
      }

      await client.query(
        `INSERT INTO domain_objects 
         (id, type, data, version, created_at, updated_at, metadata) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) 
         DO UPDATE SET 
           type = EXCLUDED.type,
           data = EXCLUDED.data,
           version = EXCLUDED.version + 1,
           updated_at = EXCLUDED.updated_at,
           metadata = EXCLUDED.metadata`,
        [
          entity.id,
          entity.type,
          JSON.stringify(entity.data),
          entity.version,
          entity.createdAt,
          new Date(),
          JSON.stringify(entity.metadata || {})
        ]
      );

      // Update sync status
      await client.query(
        `INSERT INTO sync_status (entity_id, synced_at, sync_error, retry_count)
         VALUES ($1, $2, NULL, 0)
         ON CONFLICT (entity_id) 
         DO UPDATE SET synced_at = EXCLUDED.synced_at, 
                       sync_error = NULL,
                       retry_count = 0`,
        [entity.id, new Date()]
      );
    } finally {
      client.release();
    }
  }

  async get(id: string): Promise<DomainObject | null> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM domain_objects WHERE id = $1',
        [id]
      );
      
      if (result.rows.length === 0) return null;

      const row = result.rows[0];
      return {
        id: row.id,
        type: row.type,
        data: row.data,
        version: row.version,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        metadata: row.metadata || {}
      };
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}