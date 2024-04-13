import { makeAutoObservable } from "mobx";
import { useState } from "react";
import { ApiProject } from '../../../api/ApiProject';
import { Project } from "../../projects/Project";
import { useRouter } from "next/router";
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
  currentProject: Project | null;
}

// Implement useProjectManagerStore to create and initialize the ProjectManagerStore
const useProjectManagerStore = (): ProjectManagerStore => {

  // Initialize state for projects, loading status, and error message
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter(); // Initialize useRouter hook

  // Define methods to manage projects
  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ApiProject.fetchProjects(); // Implement fetchProjectsFromAPI
      setProjects(response.data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const addProject = async (project: Project) => {
    setLoading(true);
    setError(null);
    try {
      const response = await ApiProject.addProject(project); // Implement addProjectToAPI
      setProjects([...projects, response.data]);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProject = async (projectId: string, updatedProject: Project) => {
    setLoading(true);
    setError(null);
    try {
      const response = await ApiProject.updateProject(
        projectId,
        updatedProject
      ); // Implement updateProjectInAPI
      const updatedProjects = projects.map((p) =>
        p.id === projectId ? response.data : p
      );
      setProjects(updatedProjects);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (projectId: string) => {
    setLoading(true);
    setError(null);
    try {
      await ApiProject.deleteProject(projectId); // Implement deleteProjectFromAPI
      const updatedProjects = projects.filter((p) => p.id !== projectId);
      setProjects(updatedProjects);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };


  const currentProject = projects.find(
    (project) => project.id === router.query.projectId
  ) || null;

  // Use makeAutoObservable to make the ProjectManagerStore reactive
 const useProjectStore=  makeAutoObservable({
    projects,
    loading,
    error,
    fetchProjects,
    addProject,
    updateProject,
   deleteProject,
   currentProject
  });

  // Return the ProjectManagerStore
  return useProjectStore;
};

// Export the useProjectManagerStore function
export { useProjectManagerStore };
