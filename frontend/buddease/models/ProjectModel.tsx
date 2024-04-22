import DatabaseClient from './DatabaseClient';
import { Project } from './models/projects/Project'; // Assuming you have a Project interface

class ProjectModel {
  private readonly tableName: string = 'projects';
  private readonly dbClient: DatabaseClient;

  constructor(dbClient: DatabaseClient) {
    this.dbClient = dbClient;
  }

  async createProject(projectData: Project): Promise<Project | null> {
    try {
      // Insert project data into the database
      const result = await this.dbClient.insert(this.tableName, projectData);
      return result as Project;
    } catch (error) {
      console.error('Error creating project:', error);
      return null;
    }
  }

  async getProjectById(projectId: number): Promise<Project | null> {
    try {
      // Query the database to fetch project data by ID
      const queryResult = await this.dbClient.query<Project>(
        `SELECT * FROM ${this.tableName} WHERE id = $1`,
        [projectId]
      );
      return queryResult.rows[0] || null;
    } catch (error) {
      console.error('Error fetching project by ID:', error);
      return null;
    }
  }

  // Implement other CRUD methods for updating and deleting projects
}

export default ProjectModel;
