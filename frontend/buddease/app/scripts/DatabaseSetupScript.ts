// scripts/DatabaseSetupScript.ts
import fs from 'fs';
import path from 'path';
import { ProjectConfig, DatabaseConfig } from '@/app/config/ProjectConfig';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class DatabaseSetupScript {
  async execute(projectConfig: ProjectConfig): Promise<void> {
    console.log('🗄️ Starting database setup...');
    
    if (!projectConfig.features.database) {
      console.log('⏭️ Database feature disabled, skipping setup');
      return;
    }

    try {
      // Create database configuration
      await this.createDatabaseConfig(projectConfig);
      
      // Setup database schema and migrations
      await this.setupDatabaseSchema(projectConfig);
      
      // Generate database client/ORM
      await this.generateDatabaseClient(projectConfig);
      
      // Create seed data if needed
      await this.createSeedData(projectConfig);
      
      console.log('✅ Database setup completed successfully!');
    } catch (error) {
      console.error('❌ Database setup failed:', error);
      throw error;
    }
  }

  private async createDatabaseConfig(projectConfig: ProjectConfig): Promise<void> {
    const configDir = path.join(projectConfig.projectPath, 'config');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    let configContent = '';
    
    switch (projectConfig.database) {
      case 'postgresql':
        configContent = this.generatePostgresConfig(projectConfig.databaseConfig);
        break;
      case 'mongodb':
        configContent = this.generateMongoConfig(projectConfig.databaseConfig);
        break;
      case 'mysql':
        configContent = this.generateMySQLConfig(projectConfig.databaseConfig);
        break;
      default:
        configContent = this.generateSQLiteConfig();
    }

    const configPath = path.join(configDir, 'database.ts');
    fs.writeFileSync(configPath, configContent);
    console.log('📄 Created database configuration');
  }

  private generateMySQLConfig(dbConfig?: DatabaseConfig): string {
  return `import mysql from 'mysql2/promise';

export const databaseConfig = {
  host: '${dbConfig?.host || 'localhost'}',
  port: ${dbConfig?.port || 3306},
  database: '${dbConfig?.database || 'app_database'}',
  user: '${dbConfig?.username || 'root'}',
  password: '${dbConfig?.password || 'password'}',
  charset: 'utf8mb4',
  timezone: '+00:00',
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
};

export const createPool = () => mysql.createPool(databaseConfig);

export const connectDB = async () => {
  try {
    const pool = createPool();
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL database');
    connection.release();
    return pool;
  } catch (error) {
    console.error('❌ MySQL connection failed:', error);
    throw error;
  }
};

// Utility functions for common operations
export const query = async (sql: string, params: any[] = []) => {
  const pool = createPool();
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } finally {
    await pool.end();
  }
};

export const transaction = async (callback: (connection: any) => Promise<void>) => {
  const pool = createPool();
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  
  try {
    await callback(connection);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
};`;
}

private generateSQLiteConfig(): string {
  return `import sqlite3 from 'sqlite3';
  import { open, Database } from 'sqlite';

  const dbPath = process.env.SQLITE_PATH || path.join(process.cwd(), 'database.sqlite');

  export interface SQLiteConfig {
    filename: string;
    driver: typeof sqlite3.Database;
  }

  export const databaseConfig: SQLiteConfig = {
    filename: dbPath,
    driver: sqlite3.Database
  };

  let dbInstance: Database | null = null;

  export const connectDB = async (): Promise<Database> => {
    if (dbInstance) {
      return dbInstance;
    }

    try {
      dbInstance = await open({
        filename: dbPath,
        driver: sqlite3.Database
      });

      // Enable foreign keys and better performance
      await dbInstance.exec(\`
        PRAGMA foreign_keys = ON;
        PRAGMA journal_mode = WAL;
        PRAGMA synchronous = NORMAL;
        PRAGMA cache_size = -64000;
        PRAGMA temp_store = memory;
      \`);

      console.log('✅ Connected to SQLite database');
      return dbInstance;
    } catch (error) {
      console.error('❌ SQLite connection failed:', error);
      throw error;
    }
  };

  // Utility functions for common operations
  export const query = async (sql: string, params: any[] = []) => {
    const db = await connectDB();
    try {
      return await db.all(sql, params);
    } catch (error) {
      throw error;
    }
  };

  export const run = async (sql: string, params: any[] = []) => {
    const db = await connectDB();
    try {
      return await db.run(sql, params);
    } catch (error) {
      throw error;
    }
  };

  export const get = async (sql: string, params: any[] = []) => {
    const db = await connectDB();
    try {
      return await db.get(sql, params);
    } catch (error) {
      throw error;
    }
  };

  export const transaction = async (callback: (db: Database) => Promise<void>) => {
    const db = await connectDB();
    try {
      await db.run('BEGIN TRANSACTION');
      await callback(db);
      await db.run('COMMIT');
    } catch (error) {
      await db.run('ROLLBACK');
      throw error;
    }
  };

  // Initialize database with basic tables
  export const initializeDatabase = async () => {
    const db = await connectDB();
    
    await db.exec(\`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    \`);

    console.log('✅ Database tables initialized');
  };`;
}

  private generatePostgresConfig(dbConfig?: DatabaseConfig): string {
    return `import { Pool } from 'pg';

    export const databaseConfig = {
      host: '${dbConfig?.host || 'localhost'}',
      port: ${dbConfig?.port || 5432},
      database: '${dbConfig?.database || 'app_database'}',
      user: '${dbConfig?.username || 'postgres'}',
      password: '${dbConfig?.password || 'password'}',
      ssl: ${dbConfig?.ssl || false},
    };

    export const pool = new Pool(databaseConfig);

    export const connectDB = async () => {
      try {
        const client = await pool.connect();
        console.log('✅ Connected to PostgreSQL database');
        return client;
      } catch (error) {
        console.error('❌ Database connection failed:', error);
        throw error;
      }
    };`;
  }

    private generateMongoConfig(dbConfig?: DatabaseConfig): string {
      return `import mongoose from 'mongoose';

    const MONGODB_URI = process.env.MONGODB_URI || 
      'mongodb://${dbConfig?.username || 'username'}:${dbConfig?.password || 'password'}@${dbConfig?.host || 'localhost'}:${dbConfig?.port || 27017}/${dbConfig?.database || 'app_database'}';

    export const connectDB = async (): Promise<void> => {
      try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB database');
      } catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        throw error;
      }
    };

    export default mongoose;`;
  }

  private async setupDatabaseSchema(projectConfig: ProjectConfig): Promise<void> {
    const schemasDir = path.join(projectConfig.projectPath, 'models');
    if (!fs.existsSync(schemasDir)) {
      fs.mkdirSync(schemasDir, { recursive: true });
    }

    // Create basic user schema
    const userSchema = `import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
  },
  { timestamps: true }
);

export const User = model<IUser>('User', UserSchema);`;

    fs.writeFileSync(path.join(schemasDir, 'User.ts'), userSchema);
    console.log('📄 Created database schemas');
  }

  private async generateDatabaseClient(projectConfig: ProjectConfig): Promise<void> {
    if (projectConfig.database === 'postgresql') {
      // Initialize Prisma for PostgreSQL
      await execAsync('npx prisma init', { cwd: projectConfig.projectPath });
      console.log('🔧 Initialized Prisma ORM');
    }
  }

  private async createSeedData(projectConfig: ProjectConfig): Promise<void> {
    const seedsDir = path.join(projectConfig.projectPath, 'seeds');
    if (!fs.existsSync(seedsDir)) {
      fs.mkdirSync(seedsDir, { recursive: true });
    }

    const seedScript = `// Database seed data
export const seedData = async () => {
  console.log('🌱 Seeding database...');
  // Add your seed data here
  console.log('✅ Database seeded successfully');
};

if (require.main === module) {
  seedData().catch(console.error);
}`;

    fs.writeFileSync(path.join(seedsDir, 'index.ts'), seedScript);
    console.log('🌱 Created seed data script');
  }
}