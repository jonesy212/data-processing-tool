CollaborationBoard.tsx
import { ResponsiveDesign } from '@/core/components/styling/ResponsiveDesign';
import CommunicationSection from '@/core/interfaces/features/CommunicationSection';
import ContentCreationSection from '@/core/interfaces/features/ContentCreationSection';
import FileOrganizationSection from '@/core/interfaces/features/FileOrganizationSection';
import IdeationSection from '@/core/interfaces/features/IdeationSection';
import PlanningSection from '@/core/interfaces/features/PlanningSection';
import ProjectManagementSection from '@/core/interfaces/features/ProjectManagementSection';

const CollaborationBoard = () => {
    return (
        <div>
            <h1>Collaboration Board</h1>
            {/* Render each section */}
            <ProjectManagementSection />
            <CommunicationSection />
            <IdeationSection />
            <ContentCreationSection />
            <PlanningSection />
            <FileOrganizationSection />
            {/* Render the ResponsiveDesign component */}
            <ResponsiveDesign collaborationBoardStore={collaborationBoardStore} />
              </div>
    );
}

export default CollaborationBoard;
