DefaultCalendarEventViewingDetails.tsx
import { handleApiError } from '@/core/api/ApiLogs';
import ProjectService from "@/core/api/service/ProjectService";
import { CalendarEventViewingDetailsProps } from '@/core/components/calendar/CalendarEventViewingDetails';
import NOTIFICATION_MESSAGES from "@/core/features/support/NotificationMessages";
import { ButtonGenerator } from '@/core/generators/GenerateButtons';
import { handleAddComponent, handleUpdateComponent } from '@/core/libraries/ui/components/Component';
import { Project } from '@/core/models/projects/Project';
import UpdatedProjectDetails from "@/core/projects/UpdateProjectDetails";
import { useNotification } from '@/core/state/context/NotificationContext';
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

const DefaultCalendarEventViewingDetails: React.FC<CalendarEventViewingDetailsProps> = ({ None, eventId }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { notify } = useNotification();
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projectId, setProjectId] = useState<number | null>(null);

  useEffect(() => {
    const projectService = new ProjectService();

    const fetchCurrentProject = async () => {
      try {
        const { projectId } = router.query;
        if (typeof projectId === "string") {
          const parsedProjectId = parseInt(projectId, 10);
          setProjectId(parsedProjectId); // Store projectId
          const project = await projectService.fetchProject(parsedProjectId);
          setCurrentProject(project);
        } else {
          console.error("Project ID is not a string:", projectId);
        }
      } catch (error: any) {
        handleApiError(error, NOTIFICATION_MESSAGES.Generic.ERROR);
      }
    };

    fetchCurrentProject();
  }, [router.query]);

  return (
    <div>
      <h1>Component Management</h1>
      <ButtonGenerator
        onSubmit={handleAddComponent}
        onReset={handleRemoveComponent}
        onCancel={handleUpdateComponent}
      />
      {/* Check both projectId and currentProject exist */}
      {currentProject && projectId && (
        <UpdatedProjectDetails 
          projectId={projectId}
          projectDetails={currentProject} 
        />
      )}
    </div>
  );
};

export default DefaultCalendarEventViewingDetails;