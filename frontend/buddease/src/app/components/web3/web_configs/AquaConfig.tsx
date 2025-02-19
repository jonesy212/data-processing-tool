import { endpoints } from "@/app/api/ApiEndpoints";
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { useEffect, useState } from "react";
import React from "react";

// Expanded AquaConfig with additional options
export interface AquaConfig {
  apiUrl: string;
  maxConnections: number;
  timeout: number; // Added timeout option in milliseconds
  secureConnection: boolean; // Added secure connection option
  reconnectAttempts: number; // Added number of reconnect attempts
  autoReconnect: boolean; // Added auto-reconnect option
  // Add more configuration options as needed
  appId: string; // Changed from "app-id"
  appSecret: string; // Changed from "app-secret"
  relayUrl: string; // Changed from "relay-url"
  relayToken: string; // Changed from "relay-token"
  chatToken: string; // Changed from "chat-token"
  chatUrl: string; // Changed from "chat-url"
  chatWebsocketUrl: string; // Changed from "chat-websocket-url"
  chatImageUploadUrl: string; // Changed from "chat-image-upload-url"
  chatImageUploadHeaders: Record<string, string>; // Changed from "chat-image-upload-headers"
  chatImageUploadParams: Record<string, string | number>; // Changed from "chat-image-upload-params"
  chatImageUploadUrlParams: Record<string, string | number>; // Changed from "chat-image-upload-url-params"
  chatImageDownloadUrl: string; // Changed from "chat-image-download-url"
  chatImageDownloadHeaders: Record<string, string>; // Changed from "chat-image-download-headers"
  chatImageDownloadParams: Record<string, string | number>; // Changed from "chat-image-download-params"
  chatImageDownloadUrlParams: Record<string, string | number>; // Changed from "chat-image-download-url-params"
  chatImageCacheUrl: string; // Changed from "chat-image-cache-url"
  chatImageCacheHeaders: Record<string, string>; // Changed from "chat-image-cache-headers"
  chatImageCacheParams: Record<string, string | number>; // Changed from "chat-image-cache-params"
}
const roomId: string = UniqueIDGenerator.generateRoomId();
// Example usage with expanded configuration options:
const aquaConfig: AquaConfig = {
  apiUrl: "https://example.com/aqua-api",
  maxConnections: 10,
  timeout: 5000, // Set a default timeout of 5000 milliseconds
  secureConnection: true, // Use a secure connection by default
  reconnectAttempts: 3, // Set a default of 3 reconnect attempts
  autoReconnect: true, // Enable auto-reconnect by default
  // Additional configuration options...
  appId: "app-id",
  appSecret: "app-secret",
  relayUrl: "relay-url",
  relayToken: "relay-token",
  chatToken: "chat-token",
  chatUrl: "chat-url",
  chatWebsocketUrl: "chat-websocket-url",
  chatImageUploadUrl: "chat-image-upload-url",
  chatImageUploadHeaders: {
    "Content-Type": "application/json",
  },
  chatImageUploadParams: {
    chat_id: roomId,
  },
  chatImageUploadUrlParams: {
    chat_id: roomId,
  },
  chatImageDownloadUrl: "chat-image-download-url",
  chatImageDownloadHeaders: {
    "Content-Type": "application/json",
  },
  chatImageDownloadParams: {
    chat_id: roomId,
  },
  chatImageDownloadUrlParams: {
    chat_id: roomId,
  },
  chatImageCacheUrl: "chat-image-cache-url",
  chatImageCacheHeaders: {
    "Content-Type": "application/json",
  },
  chatImageCacheParams: {
    chat_id: roomId,
  },
};

// Function component example using AquaConfig
const AquaConfigExample: React.FC = () => {
  const [aquaConfigState, setAquaConfigState] = useState<AquaConfig | null>(
    null
  );

  useEffect(() => {
    // Simulate fetching AquaConfig from an external source (e.g., API)
    const fetchAquaConfig = async () => {
      try {
        // Fetch AquaConfig from the aquaConfig endpoint
        const response = await fetch(endpoints.apiConfig.aquaConfig); // Use aquaConfig endpoint from endpoints object
        const fetchedAquaConfig: AquaConfig = await response.json();
        setAquaConfigState(fetchedAquaConfig);
      } catch (error) {
        console.error("Error fetching AquaConfig:", error);
      }
    };

    // Fetch AquaConfig when the component mounts
    fetchAquaConfig();
  }, []);

  // Use aquaConfigState instead of aquaConfig directly
  return (
    <div>
      <h2>AquaConfig Example</h2>
      {aquaConfigState && (
        <div>
          <p>API URL: {aquaConfigState.apiUrl}</p>
          <p>Max Connections: {aquaConfigState.maxConnections}</p>
          {/* Display other AquaConfig options as needed */}
        </div>
      )}
    </div>
  );
};

export default AquaConfigExample;
