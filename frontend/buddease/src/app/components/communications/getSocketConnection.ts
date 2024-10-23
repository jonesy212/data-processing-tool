// getSocketConnection.ts
import { RetryConfig } from "@/app/configs/ConfigurationService";
import { useEffect, useState } from "react";

const getSocketConnection = (roomId: any, retryConfig: RetryConfig) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [retryAttempts, setRetryAttempts] = useState(0);

  useEffect(() => {
    const connectWebSocket = () => {
      const newSocket = new WebSocket(`wss://example.com/chat/${roomId}`);

      newSocket.addEventListener("open", () => {
        // Connection established
        console.log("WebSocket connected");
        setRetryAttempts(0);
      });

      newSocket.addEventListener("close", (event) => {
        // Connection closed
        console.log("WebSocket disconnected:", event.reason);
        if (retryConfig.enabled && retryAttempts < retryConfig.maxRetries) {
          // Retry logic
          const delay = retryConfig.retryDelay || 0;
          setTimeout(() => {
            setRetryAttempts((prevAttempts) => prevAttempts + 1);
            connectWebSocket(); // Retry connection after a delay
          }, delay);
        } else {
          // Retry limit reached or retry is disabled
          console.error("WebSocket connection failed after max attempts");
          // Implement additional error handling or notify the user
        }
      });

      // Set the socket state
      setSocket((prevSocket) => newSocket);
    };

    connectWebSocket();
    // Cleanup
    return () => {
      if (
        socket &&
        (socket.readyState === WebSocket.OPEN ||
          socket.readyState === WebSocket.CONNECTING)
      ) {
        socket.close();
      }
    };
  }, [roomId, retryConfig]);

  return socket;
};

export default getSocketConnection;
