import { Project, ProjectData } from '@/app/components/projects/Project';
import DatabaseClient, { DatasetModel } from '@/app/components/todos/tasks/DataSetModel';
import { DatabaseService } from '@/app/configs/DatabaseConfig';

class ProjectModel {
  private readonly tableName: string = 'projects';
  private readonly dbClient: DatabaseClient;
  static dbClient: any;

  
  private static dbService: DatabaseService; // Database service instance
  
  
  
  constructor(dbClient: DatabaseClient) {
    this.dbClient = dbClient;
  }
  
  static tableName = "projects";
  static findOne(projectId: object): Promise<Project | null> {
    return this.dbClient
      .findOne(this.tableName, { id: projectId })
      .then((result: any) => result || null)
      .catch((error: any) => {
        console.error("Error finding project:", error);
        return null;
      });
  }
  
  
  static async update(projectData: ProjectData, whereClause: any): Promise<void> {
    // Use the database service to update the project with the provided whereClause
    await ProjectModel.dbService.update(projectData, whereClause);
  }

  static async create(projectData: ProjectData): Promise<void> {
    // Use the database service to create the project
    await ProjectModel.dbService.create(projectData);
  }

  static async findAll(): Promise<Project[]> {
    return await ProjectModel.dbService.findAll(ProjectModel.tableName);
  }
  static async insert(tableName: string, data: any): Promise<any> {
    return await ProjectModel.dbService.create(data);
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
