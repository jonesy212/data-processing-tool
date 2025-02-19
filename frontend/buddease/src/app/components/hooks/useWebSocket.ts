// useWebSocket.ts
import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { csrfToken } from '../security/csrfToken';



// Define the type DefaultEventsMap
type DefaultEventsMap = {
  // Define the events map as per your application's requirements
  message: any;
  connect: () => void;
  disconnect: () => void;
  connect_error: (error: any) => void;
  // Add more events if needed
};


type WebSocketReturnType = {
  socket: Socket<DefaultEventsMap, DefaultEventsMap> | null;
  lastMessage: any;
  sendMessage: (message: any) => void;
  sendWebSocketMessage: (eventName: string, data?: any) => void; // Declare sendWebSocketMessage property
  readyState: number;
  error: string | null;
};


const useWebSocket = (endpoint: string, options?: any): WebSocketReturnType => {
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


  const sendWebSocketMessage = (eventName: string, data?: any) => {
    if (socket) {
      socket.emit(eventName, data);
    }
  };
  return { socket, lastMessage, sendMessage, sendWebSocketMessage, readyState, error };
};

export default useWebSocket;
export type {WebSocketReturnType}


// sendMessage:
// Use sendMessage when you want to send a generic message through the WebSocket connection.
// This function is suitable for sending any type of message, such as text, JSON objects, or binary data.
// Examples of usage include sending chat messages, notifications, or any custom data that doesn't require specific handling on the server side.


// sendWebSocketMessage:
// Use sendWebSocketMessage when you need to send a message that corresponds to a specific WebSocket event or action defined in your server-side WebSocket implementation.
// This function is ideal for sending messages that trigger predefined server-side actions or events.
// Examples of usage include subscribing to a channel, sending document changes, requesting data updates, or any other WebSocket-related actions that are part of your application's communication protocol.