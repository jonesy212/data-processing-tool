import { useEffect } from 'react';

const useMessagingSystem = ({ onMessageReceived }: { onMessageReceived: (message: string) => void }) => {
  // Simulating a WebSocket connection
  useEffect(() => {
    // Subscribe to the messaging system or WebSocket events
    const socket = new WebSocket('wss://example.com'); // Replace with your WebSocket endpoint

    // Handle incoming messages
    socket.addEventListener('message', (event) => {
      const message = event.data;
      onMessageReceived(message);
    });

    // Clean up the WebSocket connection on unmount or when needed
    return () => {
      socket.close();
    };
  }, [onMessageReceived]);
};

export default useMessagingSystem;
