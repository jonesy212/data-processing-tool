// teamService.ts
// app/services/teamService.ts
import { Team } from '@/app/components/teams/Team';
import { Project } from '@/app/models/projects/Project';

export interface ReassignmentRecord {
  projectId: string;
  projectName: string;
  previousTeamId: string;
  previousTeamName: string;
  newTeamId: string;
  newTeamName: string;
  reassignmentDate: Date;
  reassignedBy?: string;
}

export interface AssignmentResponse {
  success: boolean;
  message: string;
  data?: any;
}

export class TeamService {
  private static baseUrl = '/api/teams';

  // Generic API call method to avoid code repetition
  private static async makeApiCall(
    endpoint: string, 
    method: 'POST' | 'PUT' | 'DELETE' | 'GET' = 'POST', 
    data?: any
  ): Promise<AssignmentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Main reassignProject method
  static async reassignProject(
    newTeam: Team,
    project: Project,
    previousTeam: Team,
    reassignmentDate: Date = new Date()
  ): Promise<AssignmentResponse> {
    const payload = {
      newTeamId: newTeam.id,
      projectId: project.id,
      previousTeamId: previousTeam.id,
      reassignmentDate: reassignmentDate.toISOString(),
      projectName: project.name,
      previousTeamName: previousTeam.teamName,
      newTeamName: newTeam.teamName
    };

    return await this.makeApiCall('/reassignProject', 'POST', payload);
  }

  // Assign project to team
  static async assignProject(team: Team, project: Project): Promise<AssignmentResponse> {
    const payload = {
      teamId: team.id,
      projectId: project.id,
      assignmentDate: new Date().toISOString(),
      teamName: team.teamName,
      projectName: project.name
    };

    return await this.makeApiCall('/assignProject', 'POST', payload);
  }

  // Unassign project from team
  static async unassignProject(team: Team, project: Project): Promise<AssignmentResponse> {
    const payload = {
      teamId: team.id,
      projectId: project.id,
      unassignmentDate: new Date().toISOString()
    };

    return await this.makeApiCall('/unassignProject', 'POST', payload);
  }

  // Get team progress
  static async getTeamProgress(teamId: string): Promise<number> {
    const response = await this.makeApiCall(`/progress?teamId=${teamId}`, 'GET');
    return response.data?.progress || 0;
  }

  // Update team progress
  static async updateTeamProgress(
    teamId: string, 
    projectUpdates?: Array<{
      projectId: string;
      status?: string;
      progress?: number;
    }>
  ): Promise<AssignmentResponse> {
    return await this.makeApiCall('/progress', 'POST', {
      teamId,
      projectUpdates
    });
  }

  // Bulk operations
  static async bulkAssignProjects(team: Team, projectIds: string[]): Promise<AssignmentResponse> {
    return await this.makeApiCall('/bulk-assign', 'POST', {
      teamId: team.id,
      projectIds,
      assignmentDate: new Date().toISOString()
    });
  }

  // Get reassignment history for a project
  static async getReassignmentHistory(projectId: string): Promise<ReassignmentRecord[]> {
    const response = await this.makeApiCall(`/reassignment-history?projectId=${projectId}`, 'GET');
    return response.data?.history || [];
  }
}