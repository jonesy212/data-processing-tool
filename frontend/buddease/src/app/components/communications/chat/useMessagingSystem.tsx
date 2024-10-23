import { useEffect } from 'react';

const useMessagingSystem = ({ onMessageReceived }: { onMessageReceived: (message: string) => void }) => {
  // Simulating a WebSocket connection
  useEffect(() => {
    // Subscribe to the messaging system or WebSocket events
    const socket = new WebSocket('wss://example.com'); //#todo// Replace with your WebSocket endpoint

    socket.addEventListener('open', () => {
      console.log('Connection established');
    })
    // Handle incoming messages
    socket.addEventListener('message', (event) => {
      const message = event.data;
      onMessageReceived(message);
    });

    // Clean up the WebSocket connection on unmount or when needed
    return () => {
      if (socket.readyState === WebSocket.OPEN
        || socket.readyState === WebSocket.CONNECTING) {
        socket.close();
      }
    };
  }, [onMessageReceived]);
};

export default useMessagingSystem;
