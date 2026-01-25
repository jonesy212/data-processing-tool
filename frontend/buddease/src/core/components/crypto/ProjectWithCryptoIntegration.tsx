// ProjectWithCryptoIntegration.tsx
import { useCryptoIntegration } from '@/core/hooks/useCryptoIntegration';
import { environmentAwareEndpointManager } from '@/core/config/endpoints/EnvironmentAwareEndpointManager';
import { useState } from 'react';
import type { 
  BaseDataEntity, 
  BaseDataRoot, 
  DefaultMeta, 
  Attachment,
  DefaultExcludedFields 
} from '@/core/config/BaseConfig';
import type { User } from '@/core/users/User';
import type { Project } from '@/core/models/projects/Project';

// Define type parameters that match your User and Project interfaces
type T = BaseDataRoot;
type K = T;
type Meta = DefaultMeta<T, K>;
type AttachmentType = Attachment;
type ExcludedFields = DefaultExcludedFields<T>;
type IncludedFields = keyof T;

// Define props for the component
interface ProjectWithCryptoIntegrationProps {
  currentUser: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
}

// Example usage in a React component
const ProjectWithCryptoIntegration: React.FC<ProjectWithCryptoIntegrationProps> = ({ currentUser }) => {
  const { portfolio, fundProjectPhase, isCryptoEnabled } = useCryptoIntegration(
    // Convert userId to number if needed - User interface doesn't show id field!
    // Assuming currentUser has an id property, but your User interface doesn't show it
    // You might need to adjust this
    Number(currentUser.id) || 0
  );
  
  const [currentProject, setCurrentProject] = useState<Project<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>(null);

  // Fund the ideation phase using Bitcoin
  const handleFundIdeationPhase = async () => {
    if (!currentProject) {
      alert('No project selected');
      return;
    }

    // Assuming phaseId should be a number from your Project phases array
    const ideationPhase = currentProject.phases.find(phase => 
      phase.name?.toLowerCase().includes('ideation') || 
      phase.type === 'ideation'
    );

    if (!ideationPhase) {
      alert('No ideation phase found in project');
      return;
    }

    try {
      await fundProjectPhase(
        currentProject.id, // Project ID is string according to your interface
        ideationPhase.id || 1, // Use phase ID or default to 1
        0.1, // 0.1 BTC
        'BTC'
      );
      
      // Show success message
      alert('Project phase funded successfully with Bitcoin!');
    } catch (error) {
      // Properly type the error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Handle environment-specific errors
      if (errorMessage.includes('not available in this environment')) {
        alert('Crypto funding is only available in development and staging environments during testing');
      } else if (errorMessage.includes('exceeds the limit')) {
        alert('Funding amount exceeds the limit for this environment. Please contact support.');
      } else {
        alert(`Funding failed: ${errorMessage}`);
      }
    }
  };

  // Function to select a project
  const handleSelectProject = (project: Project<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
    setCurrentProject(project);
  };

  return (
    <div>
      <h2>Project: {currentProject?.name || 'No project selected'}</h2>
      
      {/* Crypto Portfolio Section */}
      {isCryptoEnabled && portfolio && (
        <div className="crypto-dashboard">
          <h3>Your Crypto Portfolio: ${portfolio.totalValue.toLocaleString()}</h3>
          
          {currentProject ? (
            <button onClick={handleFundIdeationPhase}>
              Fund {currentProject.currentPhase?.name || 'Current'} Phase with Crypto
            </button>
          ) : (
            <p>Please select a project to fund</p>
          )}
        </div>
      )}
      
      {/* Environment Info */}
      <div className="environment-info">
        <small>
          Environment: {environmentAwareEndpointManager.getCurrentEnvironment().name}
          {!isCryptoEnabled && " (Crypto features disabled)"}
        </small>
      </div>

      {/* Project List (example) */}
      <div className="project-list">
        <h3>Available Projects</h3>
        {/* This would be populated with actual projects from your data */}
        <button onClick={() => handleSelectProject({
          id: 'project-1',
          name: 'Sample Project',
          description: 'A sample project for testing',
          members: [],
          tasks: [],
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          isActive: true,
          leader: currentUser,
          budget: 10000,
          phase: null,
          phases: [
            {
              id: 1,
              name: 'Ideation Phase',
              type: 'ideation',
              // ... other phase properties
            } as any // You'll need to properly type this
          ],
          type: 'development',
          status: 'active',
          currentPhase: null,
          done: false,
          currentTeam: undefined,
          reassignedProjects: [],
          commnetBy: undefined,
          data: undefined,
          customProperty: '',
          projectProgress: {} as any
        })}>
          Select Sample Project
        </button>
      </div>
    </div>
  );
};

export default ProjectWithCryptoIntegration;