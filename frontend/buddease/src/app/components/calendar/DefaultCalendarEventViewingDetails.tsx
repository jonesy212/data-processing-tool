// DefaultCalendarEventViewingDetails.tsx
import { handleApiError } from '@/app/api/ApiLogs';
import ProjectService from "@/app/api/ProjectService";
import UpdatedProjectDetails from "@/app/projects/UpdateProjectDetails";
import {
  useNotification
} from "@/app/context/NotificationContext";
import NOTIFICATION_MESSAGES from "@/app/features/support/NotificationMessages";
import { ButtonGenerator } from '@/app/generators/GenerateButtons';
import { Project } from "@/app/projects/Project"; // Import ProjectDetails component
import { handleAddComponent, handleRemoveComponent, handleUpdateComponent } from '@/libraries/ui/components/Component';
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

// Import handleApiError and other dependencies here...

// Define the DefaultCalendarEventViewingDetails component
const DefaultCalendarEventViewingDetails: React.FC<CalendarEventViewingDetailsProps> = ({ None , eventId}) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { notify } = useNotification();
  const [currentProject, setCurrentProject] = useState<Project | null>(null); // Define currentProject state

  useEffect(() => {
    const projectService = new ProjectService();

    const fetchCurrentProject = async () => {
      try {
        const { projectId } = router.query;
        if (typeof projectId === "string") {
          const parsedProjectId = parseInt(projectId, 10);
          const project = await projectService.fetchProject(parsedProjectId);
          setCurrentProject(project);
        } else {
          console.error("Project ID is not a string:", projectId);
        }
      } catch (error: any) {
        handleApiError(error, NOTIFICATION_MESSAGES.Generic.ERROR);
      }
    };

    fetchCurrentProject(); // Call fetchCurrentProject when the component mounts
  }, []); // Empty dependency array ensures fetchCurrentProject is called only once

  // Define handleAddComponent, handleRemoveComponent, and handleUpdateComponent functions here...

  return (
    <div>
      <h1>Component Management</h1>
      <ButtonGenerator
        onSubmit={handleAddComponent}
        onReset={handleRemoveComponent}
        onCancel={handleUpdateComponent}
        // Pass other props as needed
      />
      {/* Render UpdatedProjectDetails only when currentProject is available */}
      {currentProject && <UpdatedProjectDetails projectDetails={currentProject} />}
    </div>
  );
};

export default DefaultCalendarEventViewingDetails;
