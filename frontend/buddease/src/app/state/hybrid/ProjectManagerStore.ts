// ProjectManagerStore.ts
import internalApiService from '@/app/api/ApiClient';
import { ApiProject } from "@/app/api/ApiProject";
import { DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { Project } from "@/app/models/projects/Project";
import { Task } from "@/app/models/tasks/Task";
import { Product } from "@/app/products/Product";
import { BaseDataEntity } from "@/app/snapshots/ValidationRule";
import { WritableDraft } from "@/app/state/redux/ReducerGenerator";
import {
  ProjectAttachment,
  ProjectEntity,
  ProjectExcludedFields,
  ProjectIncludedFields,
  ProjectK,
  ProjectMeta
} from '@/app/typings/entities/ProjectEntity';
import Milestone from "@/app/typings/milestoneTypes";
import { YourSettingsResponseType } from '@/app/typings/responseTypes';
import { StateType } from "@/app/typings/StateType";
import { User } from "@/app/users/User";
import { PayloadAction } from "@reduxjs/toolkit";
import { makeAutoObservable } from "mobx";
import { useRouter } from "next/router";
import { useState } from "react";
import { useDispatch } from "react-redux";

// state/hybrid/ProjectManagerStore.ts
/**
 * Project Manager Store
 * ---------------------
 * This store is designed as a hybrid pattern using:
 * - MobX (makeAutoObservable) for reactive, component-level state
 * - React state hooks for local temporary state (projects, project, loading, error)
 * - Redux action payloads (PayloadAction) for interoperability with global state
 *
 * Why this pattern:
 * 1. MobX makes `projects` and `currentProject` reactive so UI updates automatically.
 * 2. Redux actions are still used for complex state updates that may cross components or stores.
 * 3. React state hooks allow easy async updates during API calls without dispatching Redux every time.
 *
 * Developers should reference `project-structure-redux-and-mobx.md` for full architecture context.
 */

const dispatch = useDispatch();


type ProjType = Project<ProjectEntity, ProjectK, ProjectMeta, ProjectAttachment, ProjectExcludedFields, ProjectIncludedFields>;
type TaskType = Task<ProjectEntity, ProjectK, ProjectMeta, ProjectAttachment, ProjectExcludedFields, ProjectIncludedFields>;
type UserType = User<ProjectEntity, ProjectK, ProjectMeta, ProjectAttachment, ProjectExcludedFields, ProjectIncludedFields>;
type PhaseType = IdeationPhase<ProjectEntity, ProjectK, ProjectMeta, ProjectAttachment, ProjectExcludedFields, ProjectIncludedFields>;
type MilestoneType = Milestone
type ProductType = Product<ProjectEntity, ProjectK, ProjectMeta, ProjectAttachment, ProjectExcludedFields, ProjectIncludedFields>;
type InsightType = Insight


export interface ProjectManagerStore<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  project: Project<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  projects: Project<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  currentProject: Project<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  loading: boolean;
  error: string | null;

  fetchProjects: () => void;
  fetchProject: (projectId: string) => void;
  addProject: (project: Project<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  updateProject: (projectId: string, updatedProject: Project<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  deleteProject: (projectId: string) => void;

  addMilestone: (projectId: string, milestone: Milestone) => void;
  updateMilestone: (projectId: string, milestone: Milestone) => void;
  deleteMilestone: (projectId: string, milestoneId: string) => void;

  assignTaskToProjectInAPI: (projectId: string, task: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  assignTaskToIdeationPhaseAPI: (
    projectId: string,
    task: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    phaseId: string
  ) => void;
  assignTaskToCurrentUser: (
    projectId: string,
    task: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    assignedTo: WritableDraft<User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
  ) => void;

  analyzeData: (
    state: StateType,
    action: PayloadAction<{ projectId: string; productId: string; insights: any[] }>
  ) => void;

  launchProduct: (
    state: StateType,
    action: PayloadAction<{
      projectId: string;
      productId: string;
      product: WritableDraft<Product<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
    }>
  ) => void;

  calculateProgress: (projectId: string) => number;
}

const useProjectManagerStore = (): ProjectManagerStore => {
  const [project, setProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
    // Actual state initialization
  const [settings, setSettings] = useState<YourSettingsResponseType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchSettings = async () => {
    setIsLoading(true);
    setError(null);
    try {
        const response = await internalApiService.get("/settings");
        // ... actual API call logic
        setSettings(parsedData[0]);
    } catch (error: any) {
        setError(error.message);
    } finally {
        setIsLoading(false);
    }
  };
  
  // --- Projects ---
  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ApiProject.fetchProjectsAPI();
      setProjects(response.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProject = async (projectId: string) => {
    setLoading(true);
    try {
      const response = await ApiProject.getProjectByIdAPI(projectId);
      setProject(response.data);
      router.push(`/projects/${projectId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addProject = async (newProject: Project) => {
    setLoading(true);
    setError(null);
    try {
      const response = await ApiProject.addProjectAPI(newProject);
      setProjects([...projects, response.data]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProject = async (projectId: string, updatedProject: Project) => {
    setLoading(true);
    setError(null);
    try {
      const response = await ApiProject.updateProjectAPI(projectId, updatedProject);
      setProjects(projects.map(p => p.id === projectId ? response.data : p));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (projectId: string) => {
    setLoading(true);
    setError(null);
    try {
      await ApiProject.deleteProjectAPI(projectId);
      setProjects(projects.filter(p => p.id !== projectId));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Milestones ---
  const addMilestone = (projectId: string, milestone: Milestone) => {
    const proj = projects.find(p => p.id === projectId);
    if (proj) {
      proj.milestones.push(milestone);
      setProjects([...projects]);
    }
  };

  const updateMilestone = (projectId: string, milestone: Milestone) => {
    const proj = projects.find(p => p.id === projectId);
    if (proj) {
      const index = proj.milestones.findIndex(m => m.id === milestone.id);
      if (index !== -1) {
        proj.milestones[index] = milestone;
        setProjects([...projects]);
      }
    }
  };

  const deleteMilestone = (projectId: string, milestoneId: string) => {
    const proj = projects.find(p => p.id === projectId);
    if (proj) {
      proj.milestones = proj.milestones.filter(m => m.id !== milestoneId);
      setProjects([...projects]);
    }
  };

  // --- Tasks ---
  const assignTaskToProjectInAPI = async (projectId: string, task: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
    try {
      await ApiProject.assignTaskToProjectInAPI(projectId, task);
      const proj = projects.find(p => p.id === projectId);
      if (proj && !proj.tasks.includes(task)) {
        proj.tasks.push(task);
        setProjects([...projects]);
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

const assignTaskToIdeationPhaseAPI = async (
  projectId: string, 
  task: TaskType, 
  phaseId: string
) => {
  try {
    await ApiProject.assignTaskToIdeationPhaseAPI(projectId, task, phaseId);
    const proj = projects.find((p: ProjType) => p.id === projectId);
    if (proj) {
      const phase = proj.ideationPhases.find((ph: PhaseType) => ph.id === phaseId);
      if (phase) {
        phase.tasks.push(task);
        setProjects([...projects]);
      }
    }
  } catch (err) {
    setError((err as Error).message);
  }
};

  const assignTaskToCurrentUser = async (
    projectId: string,
    task: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    assignedTo: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => {
    try {
      await ApiProject.assignTaskToCurrentUserAPI(projectId, task, assignedTo);
      const proj = projects.find(p => p.id === projectId);
      if (proj) {
        const taskIndex = proj.tasks.findIndex(t => t.id === task.id);
        if (taskIndex !== -1) {
          proj.tasks[taskIndex].assignedTo = assignedTo;
          setProjects([...projects]);
        }
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // --- Product Actions ---
  const analyzeData = (
    state: StateType, 
    action: PayloadAction<{ projectId: string; productId: string; insights: any[] }>
  ) => {
    const { projectId, productId, insights } = action.payload;
    const proj = state.projects.find((p: ProjType) => p.id === projectId);
    
    if (proj) {
      const product = proj.products.find((p: ProductType) => p.id === productId);
      
      if (product) {
        product.insights = [...product.insights, ...insights];
        product.insights = Array.from(new Set(product.insights.map((i: InsightType) => i.id)))
          .map(id => product.insights.find((i: InsightType) => i.id === id)!);
      }
    }
    return state;
  };

  const launchProduct = (state: StateType, action: PayloadAction<{ projectId: string; productId: string; product: Product }>) => {
    const { projectId, productId, product } = action.payload;
    const proj = state.projects.find(p => p.id === projectId);
    if (proj) {
      const prodIndex = proj.products.findIndex((p: ProjType) => p.id === productId);
      if (prodIndex !== -1) {
        product.status = "launched";
        proj.products[prodIndex] = product;
      }
    }
  };

    // --- Progress calculation ---
  const calculateProgress = (projectId: string): number => {
    const proj = projects.find(p => p.id === projectId);
    if (!proj) return 0;
    
    const totalTasks = proj.tasks.length + 
      proj.milestones.reduce((acc: number, m: Milestone) => 
        acc + m.tasks.length, 0);
    
    const completedTasks = proj.tasks.filter((t: Task<ProjectEntity, ProjectK, ProjectMeta, ProjectAttachment, ProjectExcludedFields, ProjectIncludedFields>) => 
      t.isCompleted).length +
      proj.milestones.reduce((acc: number, m: Milestone) => 
        acc + m.tasks.filter((t: Task<ProjectEntity, ProjectK, ProjectMeta, ProjectAttachment, ProjectExcludedFields, ProjectIncludedFields>) => 
          t.completed).length, 0);
    
    return totalTasks ? (completedTasks / totalTasks) * 100 : 0;
  };

  const currentProject = projects.find(p => p.id === router.query.projectId) || null;

  const store = makeAutoObservable({
    project,
    projects,
    currentProject,
    loading,
    error,
    settings,       // Now reactive
    isLoading,      // Now reactive  
    makeAutoObservable,  // Bound methods
    fetchProjects,
    fetchProject,
    addProject,
    updateProject,
    deleteProject,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    assignTaskToProjectInAPI,
    assignTaskToIdeationPhaseAPI,
    assignTaskToCurrentUser,
    analyzeData,
    launchProduct,
    calculateProgress,
  });

  return store;
};

export { useProjectManagerStore };
