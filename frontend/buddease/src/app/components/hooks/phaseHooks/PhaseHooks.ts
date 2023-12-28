// PhaseHooks.ts

import { useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import createDynamicHook from '../dynamicHooks/dynamicHookGenerator';

export interface PhaseHookConfig {
  name: string;
  condition: () => boolean;
  asyncEffect: () => Promise<() => void>;
}



export const createPhaseHook = (config: PhaseHookConfig) => {
    return createDynamicHook({
      condition: config.condition,
      asyncEffect: async () => {
        const cleanup = await config.asyncEffect();
        if (typeof cleanup === "function") {
          return cleanup();
        }
      },
    });
  };


  export default function usePhaseHooks({
    condition,
    asyncEffect,
  }: PhaseHookConfig): void {
    useEffect(() => {
      if (condition()) {
        asyncEffect().then((cleanup) => {
          if (typeof cleanup === 'function') {
            cleanup()
          }
        });
      }
    }, [condition, asyncEffect]);
  }



export const authenticationPhaseHook = createPhaseHook({
  condition: () => {
    const accessToken = localStorage.getItem('token');
    return !!accessToken;
  },
  asyncEffect: async () => {
    const { state, dispatch } = useAuth();
    return () => {
      console.log("Cleanup for Authentication");
      // Perform any cleanup logic here, if needed
    };
  },
  name: ''
});
  





export const jobSearchPhaseHook = createPhaseHook({
  condition: () => true, // Adjust the condition as needed
  asyncEffect: async () => {
    // Add your job search logic here
    console.log('useEffect triggered for JobSearch');
    return () => {
      console.log('Cleanup for JobSearch');
      // Perform any cleanup logic here, if needed
    };
  },
  name: ''
});
  
  export const recruiterDashboardPhaseHook = createPhaseHook({
    condition: () => true, // Adjust the condition as needed
    asyncEffect: async () => {
      // Add your recruiter dashboard logic here
      console.log('useEffect triggered for RecruiterDashboard');
      return () => {
        console.log('Cleanup for RecruiterDashboard');
        // Perform any cleanup logic here, if needed
      };
    },
    name: ''
  });



export const jobApplicationsPhaseHook = createPhaseHook({
  condition: () => true, // Adjust the condition as needed
  asyncEffect: async () => {
    // Add your job applications logic here
    console.log('useEffect triggered for JobApplications');
    return () => {
      console.log('Cleanup for JobApplications');
      // Perform any cleanup logic here, if needed
    };
  },
  name: ''
});

  




export const messagingSystemPhaseHook = createPhaseHook({
  condition: () => true, // Adjust the condition as needed
  asyncEffect: async () => {
    // Add your messaging system logic here
    console.log('useEffect triggered for MessagingSystem');
    return () => {
      console.log('Cleanup for MessagingSystem');
      // Perform any cleanup logic here, if needed
    };
  },
  name: ''
});

export const dataAnalysisToolsPhaseHook = createPhaseHook({
  condition: () => true, // Adjust the condition as needed
  asyncEffect: async () => {
    // Add your data analysis tools logic here
    console.log('useEffect triggered for DataAnalysisTools');
    return () => {
      console.log('Cleanup for DataAnalysisTools');
      // Perform any cleanup logic here, if needed
    };
  },
  name: ''
});

// Add more phase hooks as needed











