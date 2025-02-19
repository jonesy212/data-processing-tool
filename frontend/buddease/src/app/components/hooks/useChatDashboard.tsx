// hooks/useChatDashboard.ts
import { useEffect } from 'react';

import { ChatMessage } from '../communications';
import TypingAnimation from '../libraries/animations/text/TypingAnimation';
import createDynamicHook from './dynamicHooks/dynamicHookGenerator';


const useChatDashboard = createDynamicHook({
  condition: () => {
    // Your condition for activating the chat dashboard
    return true; // For demonstration, always activate the chat dashboard
  },
  asyncEffect: async () => {
    return useEffect(() => {
      // Your effect logic here
      console.log("useEffect triggered for ChatDashboard");

      // Example: Load additional dynamic components
      let chatMessage: ChatMessage; // Declare chatMessage as type ChatMessage
      TypingAnimation({} as typeof chatMessage); // Pass chatMessage to AnimatedComponent
      return () => {
        // Your cleanup logic here
        console.log("useEffect cleanup for ChatDashboard");
      };
    }, []);
  },
});




export default useChatDashboard;
