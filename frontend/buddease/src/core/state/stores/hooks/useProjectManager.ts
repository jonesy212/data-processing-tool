// useProjectManager.ts
// state/stores/hooks/useProjectManager.ts

import { projectManagerStore } from "@/core/state/hybrid/ProjectManagerStore";
import { useEffect } from "react";

/**
 * Custom React hook for accessing the ProjectManagerStore.
 *
 * This hook ensures that the projects are fetched from the API
 * if the store is currently empty. It returns the MobX store instance
 * for use in functional components, allowing components to reactively
 * observe project data, tasks, milestones, and other state.
 */
export const useProjectManager = () => {
  useEffect(() => {
    // On component mount, check if projects are loaded
    if (!projectManagerStore.projects.length) {
      // If the projects array is empty, fetch projects from the API
      projectManagerStore.fetchProjects();
    }
    // Empty dependency array ensures this runs only once when component mounts
  }, []);

  // Return the MobX store instance so components can use its state and actions
  return projectManagerStore;
};
