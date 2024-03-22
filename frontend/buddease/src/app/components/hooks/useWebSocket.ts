// useWebSocket.ts
import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { csrfToken } from '../security/csrfToken';

const useWebSocket = (endpoint: string, options?: any): { socket: Socket | null, lastMessage: any, sendMessage: (message: any) => void, readyState: number, error: string | null } => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [readyState, setReadyState] = useState<number>(WebSocket.CONNECTING); // Initialize readyState as CONNECTING
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const connectSocket = () => {
      const newSocket = io(endpoint, {
        secure: true, // Use secure WebSocket protocol (wss://)
        extraHeaders: {
          'X-CSRF-Token': csrfToken // Include CSRF token in headers
        },
        ...options, // Additional options
      });

      newSocket.on('message', (message: any) => {
        setLastMessage(message);
      });

      newSocket.on('connect', () => {
        setReadyState(WebSocket.OPEN);
        setError(null);
      });

      newSocket.on('disconnect', () => {
        setReadyState(WebSocket.CLOSED);
        setError('WebSocket connection closed unexpectedly.');
      });

      newSocket.on('connect_error', (err: any) => {
        setReadyState(WebSocket.CLOSED);
        setError('WebSocket connection error: ' + err.message);
      });

      // Update the socket state using setSocket
      setSocket(newSocket);
    };

    connectSocket(); // Establish initial WebSocket connection

    // Clean up function to disconnect the socket when component unmounts
    return () => {
      if (socket) {
        socket.disconnect();
        setSocket(null); // Set socket state to null when disconnecting
        setReadyState(WebSocket.CLOSED);
      }
    };
  }, [endpoint]); // Only re-establish the connection if the endpoint changes

  const sendMessage = (message: any) => {
    if (socket) {
      socket.emit('message', message);
    }
  };

  return { socket, lastMessage, sendMessage, readyState, error };
};

export default useWebSocket;
