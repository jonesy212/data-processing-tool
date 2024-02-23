import { makeAutoObservable } from "mobx";
import { useState } from "react";
import Project from "../../projects/Project";

// Define the interface for ProjectManagerStore
export interface ProjectManagerStore {
  projects: Project[];
  loading: boolean;
  error: string | null;

  // Add methods and properties as needed for managing projects
  fetchProjects: () => void;
  addProject: (project: Project) => void;
  updateProject: (projectId: string, updatedProject: Project) => void;
  deleteProject: (projectId: string) => void;
}

// Implement useProjectManagerStore to create and initialize the ProjectManagerStore
const useProjectManagerStore = (): ProjectManagerStore => {
  const { fetchProjects, addProject, updateProject, deleteProject } =  ProjectActions

  // Initialize state for projects, loading status, and error message
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Define methods to manage projects
  const fetchProjects = () => {
    setLoading(true);
    setError(null);
    // Add logic to fetch projects from API and update state
    fetchProjects()
      .then((response) => {
        setProjects(response.data);
      })
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const addProject = (project: Project) => {
    // Add logic to add a project
    setLoading(true);
    addProject(project)
      .then((response) => {
        setProjects([...projects, response.data]);
      })
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const updateProject = (projectId: string, updatedProject: Project) => {
    // Add logic to update a project
    setLoading(true);
    updateProject({ projectId, updatedProject })
      .then(() => {
        const updatedProjects = projects.map((p) =>
          p.id === projectId ? updatedProject : p
        );
        setProjects(updatedProjects);
      })
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const deleteProject = (projectId: string) => {
    // Add logic to delete a project
    setLoading(true);
    deleteProject(projectId)
      .then(() => {
        const updatedProjects = projects.filter((p) => p.id !== projectId);
        setProjects(updatedProjects);
      })
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Use makeAutoObservable to make the ProjectManagerStore reactive
  makeAutoObservable({
    projects,
    loading,
    error,
    fetchProjects,
    addProject,
    updateProject,
    deleteProject,
  });

  // Return the ProjectManagerStore
  return {
    projects,
    loading,
    error,
    fetchProjects,
    addProject,
    updateProject,
    deleteProject,
  };
};

// Export the useProjectManagerStore function
export { useProjectManagerStore };
