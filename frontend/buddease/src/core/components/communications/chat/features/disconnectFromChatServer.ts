disconnectFromChatServer.ts

import { AquaChat } from '@/core/components/communications/chat/AquaChat';
import FluenceConnection from '@/utils/web3/fluenceProtocoIntegration/FluenceConnection';

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
