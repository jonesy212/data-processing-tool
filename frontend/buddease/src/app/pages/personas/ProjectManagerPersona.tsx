import { Team } from "@/app/components/models/teams/Team";
import { Persona } from "./Persona";
import PersonaTypeEnum from "./PersonaBuilder";
import ProgressBar, { Progress } from "@/app/components/models/tracker/ProgresBar";
import TeamProgressBar from "@/app/components/projects/projectManagement/TeamProgressBar";

class ProjectManagerPersona extends Persona {
  // Specific properties for Project Manager Persona
  public projectCount: number;
  public teamCount: number;
  public tasksAssigned: number;
  public tasksCompleted: number;

  constructor() {
    super(PersonaTypeEnum.ProjectManager);
    // Initialize Project Manager Persona properties
    this.projectCount = 0;
    this.teamCount = 0;
    this.tasksAssigned = 0;
    this.tasksCompleted = 0;
  }

  // Specific methods for Project Manager Persona
  public assignTask(taskId: string, assignee: string) {
    // Logic to assign a task to a team member
  }

  public trackProgress(teams: Team[]): React.ReactNode {
    return (
      <div>
        <h2>Track Progress</h2>
        {teams.map((team, index) => (
          <div key={index}>
            <TeamProgressBar team={team} /> {/* Use TeamProgressBar component */}
            <ProgressBar progress={this.calculateProgress(team)} /> {/* Use ProgressBar component */}
          </div>
        ))}
      </div>
    );
  }

  private calculateProgress(team: Team): Progress | null {
    // Calculate progress based on team data and return Progress object
    return {
      value: team.progress,
      label: `${team.teamName} Progress`,
    };
  }
}


export type { ProjectManagerPersona };

