import { UnifiedMetaDataOptions } from '@/app/configs/database/MetaDataOptions';
import { Project, ProjectData } from '@/app/components/projects/Project';
import { DatasetModel } from '@/app/components/todos/tasks/DataSetModel';
import DatabaseClient from '@/app/components/todos/tasks/DatabaseClient';
import { DatabaseService } from '@/app/configs/DatabaseConfig';



// Define the generic types you need
type ProjectDataType = ProjectData; // Replace with the actual type you intend to use

class ProjectModel {
  // Remove the instance tableName property
  static tableName = "projects"; // Keep this as a static property

  private readonly dbClient: DatabaseClient; // Keep this as an instance property
  static dbClient: any;
  
  private static dbService: DatabaseService; // Database service instance
  
  constructor(dbClient: DatabaseClient) {
    this.dbClient = dbClient; // Instance property can use the dbClient passed in the constructor
  }
  
  // Update the method to accept an object with a `where` property
  static findOne(criteria: { tableName?: string; where: { id: string } }): Promise<Project | null> {
    return new Promise(async (resolve, reject) => {
      try {
        // Ensure the tableName is provided in the criteria or fall back to the default
        const tableName = criteria.tableName || ProjectModel.tableName;
        
        const result = await ProjectModel.dbService.findOne({
          tableName: tableName, // Use the tableName
          query: criteria.where  // Use the `where` condition from the criteria
        });
        
        resolve(result ? (result as Project) : null);
      } catch (error) {
        console.error("Error finding project:", error);
        resolve(null);
      }
    });
  }

  static async update(projectData: ProjectData, whereClause: any): Promise<void> {    // Use the database service to update the project with the provided whereClause
    await ProjectModel.dbService.update(projectData, whereClause);
  }

  static async create(projectData: ProjectData): Promise<void> {
    // Use the database service to create the project
    await ProjectModel.dbService.create(projectData);
  }

  static async findAll(): Promise<Project[]> {
    return await ProjectModel.dbService.findAll(ProjectModel.tableName); // Use static tableName
  }

  static insert(data: ProjectDataType): Promise<ProjectDataType | null> {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await ProjectModel.dbService.create(data);
        resolve(result ? (result as ProjectDataType) : null);
      } catch (error) {
        console.error("Error inserting project:", error);
        resolve(null);
      }
    });
  }

  static createProject(projectData: ProjectDataType): Promise<ProjectDataType | null> {
    return new Promise(async (resolve) => {
        try {
            const result = await ProjectModel.insert(projectData);
            resolve(result); // Resolve with the result
        } catch (error) {
            console.error("Error creating project:", error);
            resolve(null); // Resolve with null if there's an error
        }
    });
  }

  static getProjectById(projectId: number): Promise<Project | null> {
    return new Promise(async (resolve) => {
        try {
            const queryResult = await (this.dbClient.query as any)(
                `SELECT * FROM ${this.tableName} WHERE id = $1`, // Use static tableName
                [projectId]
            );
            resolve(queryResult.rows[0] || null); // Resolve with the found project or null
        } catch (error) {
            console.error("Error fetching project by ID:", error);
            resolve(null); // Resolve with null if there's an error
        }
    });
  }
}


export default ProjectModel;