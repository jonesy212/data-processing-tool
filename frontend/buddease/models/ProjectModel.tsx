import { Project } from '@/app/components/projects/Project';
import DatabaseClient, { DatasetModel } from '@/app/components/todos/tasks/DataSetModel';

class ProjectModel {
  private readonly tableName: string = 'projects';
  private readonly dbClient: DatabaseClient;
  static dbClient: any;

  constructor(dbClient: DatabaseClient) {
    this.dbClient = dbClient;
  }

  static async createProject(projectData: DatasetModel): Promise<DatasetModel | null> {
    try {
      // Insert project data into the database
      const result = await this.dbClient.insert(this.tableName, projectData);
      return result.rows[0] || null;
    } catch (error) {
      console.error("Error creating project:", error);
      return null;
    }
  }
  
  static tableName(tableName: any, projectData: DatasetModel) {
    throw new Error('Method not implemented.');
  }


  static getProjectById(projectId: number): Promise<Project | null> {
    try {
      const queryResult = (this.dbClient.query as any)(
        `SELECT * FROM ${this.tableName} WHERE id = $1`,
        [projectId]
      );
      return Promise.resolve(queryResult.rows[0] || null);
    } catch (error) {
      console.error("Error fetching project by ID:", error);
      return Promise.resolve(null);
    }
  }
  
  

  // Implement other CRUD methods for updating and deleting projects
}

export default ProjectModel;
