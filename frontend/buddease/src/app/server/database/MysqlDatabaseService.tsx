import { BaseDatabaseService } from "@/app/server/database/DatabaseService";
import mysql, { Pool } from "mysql";
import { DatabaseConfig } from "@/server/database/DatabaseConfig";

export class MysqlDatabaseService extends BaseDatabaseService {
  private pool: Pool;

  constructor(config: DatabaseConfig) {
    super(config);
    this.pool = mysql.createPool(config);
  }

  async createDatabase(config: DatabaseConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      const tempPool = mysql.createPool({
        host: config.host,
        user: config.user,
        password: config.password
      });

      tempPool.getConnection((err, conn) => {
        if (err) return reject(err);

        conn.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\``, (error) => {
          conn.release();
          tempPool.end();

          if (error) return reject(error);

          console.log(`✅ MySQL Database "${config.database}" ensured`);
          resolve();
        });
      });
    });
  }
}
