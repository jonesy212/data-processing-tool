// DefaultCalendarEventViewingDetails.tsx
import { handleApiError } from '@/app/api/ApiLogs';
import ProjectService from "@/app/api/service/ProjectService";
import NOTIFICATION_MESSAGES from "@/app/features/support/NotificationMessages";
import { ButtonGenerator } from '@/app/generators/GenerateButtons';
import { Project } from '@/app/models/projects/Project';
import UpdatedProjectDetails from "@/app/projects/UpdateProjectDetails";
import { useNotification } from '@/app/state/context/NotificationContext';
import { handleAddComponent, handleUpdateComponent } from '@/app/libraries/ui/components/Component'
import { handleRemoveComponent } from '@/app/libraries/ui/components/Component'
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { CalendarEventViewingDetailsProps } from '@/app/components/calendar/CalendarEventViewingDetails'

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