// UseFluence.tsx
import LoadFluenceState from '@/app/components/dashboards/LoadFluenceState';
import createDynamicHook from '@/app/components/hooks/dynamicHooks/dynamicHookGenerator';
import { useEffect } from 'react';


const useFluence = createDynamicHook({
  condition: () => {
    // Your condition for Fluence activation  
    return true; // Example condition, modify as needed
  },
  asyncEffect: async () => {
    return useEffect( () => {
      // Your effect logic for Fluence here
      console.log('Fluence hook activated');

      // Load Fluence state or perform other Fluence-specific actions
      LoadFluenceState({})

      return () => {
        // Cleanup logic for Fluence
        console.log('Fluence hook cleanup');
      };
    }, []);
  }
});

 

export default useFluence;
