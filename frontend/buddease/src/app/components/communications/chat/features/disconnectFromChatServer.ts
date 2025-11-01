// disconnectFromChatServer.ts

import FluenceConnection from '@/app/utils/web3/fluenceProtocoIntegration/FluenceConnection';
import { AquaChat } from '@/app/components/communications/AquaChat';

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
