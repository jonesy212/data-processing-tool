// disconnectFromChatServer.ts

import FluenceConnection from "@/app/components/web3/fluenceProtocoIntegration/FluenceConnection";
import { AquaChat } from "../AquaChat";

/**
 * Disconnects from the chat server.
 * @param fluenceConnection - The FluenceConnection instance.
 * @param aquaChat - The AquaChat instance.
 */
const disconnectFromChatServer = (
  fluenceConnection: FluenceConnection,
  aquaChat: AquaChat

): void => {
  // Disconnect from Fluence server
  fluenceConnection.disconnect();

  // Disconnect from AquaChat service
  aquaChat.disconnect();

  console.log('Disconnected from the chat server.');
};

export default disconnectFromChatServer;
