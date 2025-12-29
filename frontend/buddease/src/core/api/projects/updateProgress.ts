// updateProgress.ts
// /src/app/api/teams/update-progress/route.ts
import DatabaseClient from '@/core/api/DatabaseClient';
import { databaseConnection } from '@/core/config/databaseConnection'; // Import the renamed config
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { teamId, projectUpdates } = await request.json();
    
    if (!teamId) {
      return NextResponse.json(
        { error: 'Team ID is required' },
        { status: 400 }
      );
    }

    const dbClient = new DatabaseClient(databaseConnection);
    await dbClient.connect();

    try {
      // Get current team data
      const team = await dbClient.findOne("teams", { id: teamId });
      
      if (!team) {
        return NextResponse.json(
          { error: 'Team not found' },
          { status: 404 }
        );
      }

      // Get all projects assigned to this team
      const teamProjects = team.projects || [];
      
      if (teamProjects.length === 0) {
        // No projects assigned, set progress to 0
        const zeroProgress = {
          id: teamId,
          current: 0,
          max: 100,
          min: 0,
          percentage: 0,
          value: 0,
          description: "No projects assigned",
          done: false
        };

        await dbClient.update("teams", teamId, { 
          progress: zeroProgress,
          updatedAt: new Date()
        });

        return NextResponse.json({ 
          success: true, 
          progress: zeroProgress 
        });
      }

      // Calculate progress based on project statuses
      const totalProjects = teamProjects.length;
      
      // Count completed projects (you might need to query project statuses)
      const projectIds = teamProjects.map((p: any) => p.projectId || p.id);
      const projects = await dbClient.find("projects", { 
        id: { $in: projectIds } 
      });

      const completedProjects = projects.filter((project: any) => 
        project.status === 'completed' || 
        project.status === 'done' ||
        project.progress === 100
      ).length;

      // Calculate progress percentage
      const progressPercentage = totalProjects > 0 
        ? Math.round((completedProjects / totalProjects) * 100)
        : 0;

      // Update team progress
      const updatedProgress = {
        id: teamId,
        name: team.name || team.teamName || "Team Progress",
        current: progressPercentage,
        max: 100,
        min: 0,
        percentage: progressPercentage,
        value: progressPercentage,
        label: `${progressPercentage}% completed`,
        description: `${completedProjects} of ${totalProjects} projects completed`,
        done: progressPercentage === 100,
        color: progressPercentage === 100 ? "green" : 
               progressPercentage >= 75 ? "blue" :
               progressPercentage >= 50 ? "yellow" : "red",
        lastUpdated: new Date()
      };

      // Update team in database
      await dbClient.update("teams", teamId, { 
        progress: updatedProgress,
        updatedAt: new Date()
      });

      // If projectUpdates provided, update specific projects
      if (projectUpdates && Array.isArray(projectUpdates)) {
        for (const update of projectUpdates) {
          if (update.projectId && update.status) {
            await dbClient.update("projects", update.projectId, {
              status: update.status,
              progress: update.progress,
              updatedAt: new Date()
            });
          }
        }
      }

      return NextResponse.json({ 
        success: true, 
        progress: updatedProgress,
        stats: {
          totalProjects,
          completedProjects,
          inProgress: totalProjects - completedProjects
        }
      });

    } finally {
      await dbClient.close();
    }

  } catch (error) {
    console.error('Update team progress error:', error);
    return NextResponse.json(
      { error: 'Failed to update team progress' },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to fetch current progress
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');

    if (!teamId) {
      return NextResponse.json(
        { error: 'Team ID is required' },
        { status: 400 }
      );
    }

    const dbClient = new DatabaseClient(databaseConnection);
    await dbClient.connect();

    try {
      const team = await dbClient.findOne("teams", { id: teamId });
      
      if (!team) {
        return NextResponse.json(
          { error: 'Team not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        progress: team.progress || {
          id: teamId,
          current: 0,
          max: 100,
          min: 0,
          percentage: 0,
          value: 0,
          description: "Progress not calculated",
          done: false
        },
        lastUpdated: team.updatedAt
      });

    } finally {
      await dbClient.close();
    }

  } catch (error) {
    console.error('Get team progress error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team progress' },
      { status: 500 }
    );
  }
}