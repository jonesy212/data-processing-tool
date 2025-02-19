import Index from "@/app/pages";
import { PayloadAction } from "@reduxjs/toolkit";
import { makeAutoObservable } from "mobx";
import { useRouter } from "next/router";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { ApiProject } from "../../../api/ApiProject";
import { ProjectActions } from "../../actions/ProjectActions";
import Milestone from "../../calendar/CalendarSlice";
import { CommonData } from "../../models/CommonDetails";
import { Task } from "../../models/tasks/Task";
import { Product } from "../../products/Product";
import { Project } from "../../projects/Project";
import { StateType } from "../../typings/StateType";
import { User, VisualizationData } from "../../users/User";
import { WritableDraft } from "../redux/ReducerGenerator";
// Define the interface for ProjectManagerStore

const dispatch = useDispatch();
export interface ProjectManagerStore {
  project: Project | null;
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;

  // Add methods and properties as needed for managing projects
  fetchProjects: () => void;
  addProject: (project: Project) => void;
  updateProject: (projectId: string, updatedProject: Project) => void;
  deleteProject: (projectId: string) => void;
  assignTaskToProjectInAPI: (projectId: string, taskId: Task) => void;
  assignTaskToIdeationPhaseAPI: (
    projectId: string,
    taskId: Task,
    phaseId: string
  ) => void;
  assignTaskToCurrentUser: (
    projectId: string,
    taskId: Task,
    assignedTo: WritableDraft<User>
  ) => void;
  
}



// Implement useProjectManagerStore to create and initialize the ProjectManagerStore
const useProjectManagerStore = (): ProjectManagerStore => {
  // Initialize state for projects, loading status, and error message
  const [project, setProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter(); // Initialize useRouter hook

    const fetchProject = async (projectId: string) => {
      const response = await fetchProjectById(projectId);
      setProject(response);
      router.push(`/projects/${projectId}`);
    };
    
  // Define methods to manage projects
  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ApiProject.fetchProjectsAPI(); // Implement fetchProjectsFromAPI
      setProjects(response.data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectById = async (projectId: string) => { 
    setLoading(true);
    try {
      const response = await ApiProject.getProjectByIdAPI(projectId);
      return response.data;
    } catch(error: any) {
      setError(error.message);
    }
    finally {
      setLoading(false);
    }
  }

  const addProject = async (project: Project) => {
    setLoading(true);
    setError(null);
    try {
      const response = await ApiProject.addProjectAPI(project); // Implement addProjectToAPI
      setProjects([...projects, response.data]);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Define the analyzeData action creator
  const analyzeData = (
    state: StateType,
    action: PayloadAction<{
      projectId: string;
      productId: string;
      insights: Insight[];
    }>
  ) => {
    const { projectId, productId, insights } = action.payload;
    // Retrieve the project from state
    const updatedProject = state.projects.find(
      (project: Project) => project.id === projectId
    );
    if (updatedProject) {
      const projectIndex = state.projects.findIndex(
        (project: Project) => project.id === projectId
      );
      const productIndex = updatedProject.products.findIndex(
        (product: Product) => product.id === productId
      );

      // Filter out the insights with the provided insights
      updatedProject.products[productIndex].insights =
        updatedProject.products[productIndex].insights.concat(insights);

      // Ensure insights are unique
      const uniqueInsights = [
        ...new Set(
          updatedProject.products[productIndex].insights.map(
            (insight: Insight) => insight.id
          )
        ),
      ].map(
        (id) =>
          updatedProject.products[productIndex].insights.find(
            (insight: Insight) => insight.id === id
          )!
      );

      // Update state with unique insights only
      updatedProject.products[productIndex].insights = uniqueInsights;
      state.projects[projectIndex] = updatedProject;
    }
    return state;
  };

  // Define the launchProduct action creator
  const launchProduct = (
    state: StateType,
    action: PayloadAction<{
      projectId: string;
      productId: string;
      product: WritableDraft<Product>;
    }>
  ) => {
    const { projectId, productId, product } = action.payload;
    // Retrieve the project from state
    const updatedProject = state.projects.find(
      (project: Project) => project.id === projectId
    );
    if (updatedProject) {
      const projectIndex = state.projects.findIndex(
        (project: Project) => project.id === projectId
      );
      const productIndex = updatedProject.products.findIndex(
        (product: Product) => product.id === productId
      );
      if (productIndex !== -1) {
        updatedProject.products[productIndex].status = "launched";
        product.status = "launched";
        updatedProject.products[productIndex] = product;
        state.projects[projectIndex] = updatedProject;
      }
    }
  };

  // Define the deleteMilestone action creator
  const deleteMilestone = (
    state: StateType,
    action: PayloadAction<{
      projectId: string;
      milestoneId: string;
    }>
  ) => {
    const { projectId, milestoneId } = action.payload;

    // Retrieve the project from state
    const updatedProject = state.projects.find(
      (project: Project) => project.id === projectId
    );
    if (updatedProject) {
      const projectIndex = state.projects.findIndex(
        (project: Project) => project.id === projectId
      );

      // Filter out the milestone with the provided milestoneId
      updatedProject.milestones = updatedProject.milestones.filter(
        (milestone: Milestone) => milestone.id !== milestoneId
      );

      // Update the state with the modified project
      state.projects[projectIndex] = updatedProject;
    }
    return state;
  };

  const updateProject = async (projectId: string, updatedProject: Project) => {
    setLoading(true);
    setError(null);
    try {
      const response = await ApiProject.updateProjectAPI(
        projectId,
        updatedProject
      );
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
      await ApiProject.deleteProjectAPI(projectId); // Implement deleteProjectFromAPI
      const updatedProjects = projects.filter((p) => p.id !== projectId);
      setProjects(updatedProjects);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const assignTaskToIdeationPhaseAPI = async (
    projectId: string,
    taskId: Task,
    phaseId: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await ApiProject.assignTaskToIdeationPhaseAPI(
        projectId,
        taskId,
        phaseId
      );
      // Implement assignTaskToIdeationPhaseInAPI
      const updatedProject = projects.find(
        (project) => project.id === projectId
      );
      if (updatedProject) {
        const phaseIndex = updatedProject.ideationPhases.find;
        Index((phase: any) => phase.id === phaseId);
        if (phaseIndex !== -1) {
          updatedProject.ideationPhases[phaseIndex].tasks.push(taskId);
        }
        // Update state
        const updatedProjects = [...projects];
        const updatedProjectIndex = updatedProjects.findIndex(
          (project) => project.id === projectId
        );
        updatedProject.ideationPhases[phaseIndex].tasks.push(taskId);

        if (updatedProjectIndex !== -1) {
          updatedProjects[updatedProjectIndex] = updatedProject;
          setProjects(updatedProjects);
        }
      }
      return response;
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const assignTaskToCurrentUser = async (
    projectId: string,
    taskId: WritableDraft<Task>,
    assignedTo: WritableDraft<User>
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await ApiProject.assignTaskToCurrentUserAPI(
        projectId,
        await taskId,
        assignedTo
      );
      // Implement assignTaskToCurrentUserInAPI
      const updatedProject = projects.find(
        (project) => project.id === projectId
      );
      if (updatedProject) {
        const taskIndex = updatedProject.tasks.findIndex(
          (task) => task.id === taskId.id
        );
        if (taskIndex !== -1) {
          updatedProject.tasks[taskIndex].assignedTo = assignedTo;
        }
        const updatedProjects = [...projects];
        const updatedProjectIndex = updatedProjects.findIndex(
          (project) => project.id === projectId
        );
        if (updatedProjectIndex !== -1) {
          updatedProjects[updatedProjectIndex] = updatedProject;
          setProjects(updatedProjects);
        }
      }

      return response;
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const assignTaskToProjectInAPI = async (
    projectId: string,
    taskId: Task
  ) => {
    try {
      const response = await ApiProject.assignTaskToProjectInAPI(
        projectId,
        await taskId
      );
  
      // Update state
      const updatedProjects = projects.map((project) => {
        if (project.id !== projectId) {
          // If the project being updated is not the target project, return it as is
          return project;
        }
  
        // Check if the task is already assigned to the project
        if (project.tasks.includes(taskId)) {
          console.log(`Task ${taskId} is already assigned to project ${projectId}`);
          return project; // Return the project without changes
        }
  
        // Add the taskId to the project's tasks array
        project.tasks.push(taskId);
  
        // Log a message to notify that the task was assigned to the project
        console.log(`Task ${taskId} was assigned to project ${projectId}`);
  
        // Return the updated project
        return project;
      });
  
      // Update the state with the updated projects
      setProjects(updatedProjects);
    } catch (error) {
      // Handle any errors that occur during the API call
      console.error(`Error assigning task ${taskId} to project ${projectId}`, error);
      throw error;
    } finally {
      // Regardless of success or failure, set loading to false
      setLoading(false);
    }
  };
  


  const currentProject =
    projects.find((project) => project.id === router.query.projectId) || null;

  // Use makeAutoObservable to make the ProjectManagerStore reactive
  const useProjectStore = makeAutoObservable({
    project,
    projects,
    currentProject,
    loading,
    error,
    fetchProjects,
    addProject,
    updateProject,
    deleteProject,
    assignTaskToIdeationPhaseAPI,
    assignTaskToProjectInAPI,
    deleteMilestone,
    analyzeData,
    launchProduct,
    assignTaskToCurrentUser,
    fetchProjectById,

  });

  // Return the ProjectManagerStore
  return useProjectStore;
};

// Export the useProjectManagerStore function
export { useProjectManagerStore };

// Example of how to use the actions
dispatch(
  ProjectActions.performDataAnalysis({
    projectId: "projectId",
    productId: "productId",
    insights: [{ id: "1", description: "Insight description" }],
  })
);
dispatch(
  ProjectActions.launchProduct({
    projectId: "projectId",
    productId: "productId",
    product: {
      id: "productId",
      productName: "Product name",
      status: "draft",
      productId: "",
      productDescription: "",
      category: "",
      price: 0,
      inventory: 0,
      manufacturer: "",
      releaseDate: new Date(),
      dimensions: {
        width: 0,
        height: 0,
        depth: 0,
      },
      weight: 0,
      ratings: {
        averageRating: 0,
        numberOfRatings: 0,
      },
      reviews: [],
      features: [],
      images: [],
      relatedProducts: [],
      brainstormingDetails: {} as CommonData<VisualizationData[]>,
      launchDetails: {} as CommonData<VisualizationData[]>,
      snapshots: [],
    },
  })
);
dispatch(
  ProjectActions.deleteMilestone({
    projectId: "projectId",
    milestoneId: "milestoneId",
    project: {
      id: "projectId",
      name: "Project name",
      milestones: [],
    },
    milestone: {
      id: "milestoneId",
      name: "Milestone name",
    },
  })
);
