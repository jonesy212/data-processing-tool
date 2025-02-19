import React from 'react';
import ProjectManagementSection from './ProjectManagementSection';
import CommunicationSection from './CommunicationSection';
import IdeationSection from './IdeationSection';
import ContentCreationSection from './ContentCreationSection';
import PlanningSection from './PlanningSection';
import FileOrganizationSection from './FileOrganizationSection';
import { ResponsiveDesign } from '../../styling/ResponsiveDesign';

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
