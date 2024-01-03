import { useEffect, useState } from 'react';

const connectToChatWebSocket = (roomId: any) => {
const [socket, setSocket] = useState<WebSocket | null>(null);


  useEffect(() => {
    // Establish WebSocket connection
    const newSocket = new WebSocket(`wss://example.com/chat/${roomId}`);

    // Event listeners and logic

    // Set the socket state
    setSocket((prevSocket) => newSocket);

    // Cleanup
    return () => {
      if (
        newSocket.readyState === WebSocket.OPEN ||
        newSocket.readyState === WebSocket.CONNECTING
      ) {
        newSocket.close();
      }
    };
  }, [roomId]);

  return socket;
};

export default connectToChatWebSocket;
