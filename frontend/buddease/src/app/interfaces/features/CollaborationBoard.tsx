// CollaborationBoard.tsx
import React from 'react';
import ProjectManagementSection from '@/app/interfaces/features/ProjectManagementSection'
import CommunicationSection from '@/app/interfaces/features/CommunicationSection';
import IdeationSection from '@/app/interfaces/features/IdeationSection';
import ContentCreationSection from '@/app/interfaces/features/ContentCreationSection';
import PlanningSection from '@/app/interfaces/features/PlanningSection';
import FileOrganizationSection from '@/app/interfaces/features/FileOrganizationSection';
import { ResponsiveDesign } from '@/app/components/styling/ResponsiveDesign';

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
