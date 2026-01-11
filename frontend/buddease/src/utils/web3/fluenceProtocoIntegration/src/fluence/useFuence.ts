// UseFluence.tsx
import createDynamicHook from '@/core/hooks/dynamicHooks/dynamicHookGenerator';
import { useEffect } from 'react';


const useFluence = createDynamicHook({
  condition: async (idleTimeoutDuration: number) => {
    try {
      // Don't activate if user is actively interacting
      if (idleTimeoutDuration < 2000) { // Less than 2 seconds idle
        return false;
      }
      
      // Check user preferences
      const userPrefs = await getUserPreferences();
      if (!userPrefs?.features?.fluence) {
        return false;
      }
      
      // Check if we're on a capable device
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile && !userPrefs.allowHeavyFeaturesOnMobile) {
        return false;
      }
      
      // Check network - don't activate on slow connections
      const connection = (navigator as any).connection;
      if (connection) {
        const isSlowConnection = 
          connection.saveData || 
          connection.effectiveType === 'slow-2g' || 
          connection.effectiveType === '2g';
        
        if (isSlowConnection) {
          return false;
        }
      }
      
      // All checks passed
      return true;
    } catch (error) {
      console.error('Error checking Fluence condition:', error);
      return false; // Fail safe - don't activate on error
    }
  },
  
  asyncEffect: async ({ idleTimeoutId, startIdleTimeout }) => {
    console.log('🔄 Fluence hook activating...');
    
    let fluenceInstance: Fluence | null = null;
    let eventListeners: Array<() => void> = [];
    
    try {
      // Initialize Fluence
      fluenceInstance = await Fluence.initialize({
        apiKey: process.env.FLUENCE_API_KEY,
        environment: process.env.NODE_ENV,
      });
      
      // Set up event listeners
      const handleDataUpdate = (data: any) => {
        // Update your component state with Fluence data
        updateComponentState(data);
      };
      
      fluenceInstance.on('data', handleDataUpdate);
      eventListeners.push(() => fluenceInstance?.off('data', handleDataUpdate));
      
      // Start Fluence processes
      await fluenceInstance.start();
      
      console.log('✅ Fluence hook activated successfully');
      
    } catch (error) {
      console.error('❌ Failed to activate Fluence:', error);
    }
    
    // Return cleanup function
    return () => {
      console.log('🧹 Cleaning up Fluence hook...');
      
      // Remove all event listeners
      eventListeners.forEach(cleanup => cleanup());
      eventListeners = [];
      
      // Stop and dispose Fluence instance
      if (fluenceInstance) {
        fluenceInstance.stop().catch(console.error);
        fluenceInstance.dispose();
        fluenceInstance = null;
      }
      
      // Clear any intervals or timeouts
      if (idleTimeoutId) {
        clearTimeout(idleTimeoutId);
      }
      
      // Reset any local state
      resetFluenceState();
      
      console.log('✅ Fluence cleanup complete');
    };
  }
});

 

export default useFluence;
