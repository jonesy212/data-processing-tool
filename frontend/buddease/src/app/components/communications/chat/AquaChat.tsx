import { useEffect, useState } from 'react';
import { AquaConfig } from '../../web3/web_configs/AquaConfig';

export class AquaChat {
  aquaConfig: AquaConfig;
  isConnected: boolean;

  constructor(aquaConfig: AquaConfig) {
    this.aquaConfig = aquaConfig;
    this.isConnected = false;
  }

  connect() {
    // Add logic to establish a connection with AquaChat service
    console.log('Connecting to AquaChat...'); 
    // Set isConnected status based on the success of the connection
    this.isConnected = true; // Replace with your actual connection logic
  }

  sendMessage(onmessage: string) {
    if (!this.isConnected) {
      console.error('AquaChat is not connected. Cannot send message.');
      return;
    }

    try {
      // Add logic to send a message through AquaChat
      console.log(`Sending message: ${onmessage}`);
      // Replace the following line with your actual message sending logic
      // this.aquaService.onmessage(onmessage); 
    } catch (error) {
      console.error('Error sending message:', error);
      // Handle the error appropriately, e.g., reconnect or show an error message
    }
  }

  disconnect() {
    // Add logic to disconnect from AquaChat service
    console.log('Disconnecting from AquaChat...');
    // Set isConnected status based on the success of disconnection 
    this.isConnected = false; // Replace with your actual disconnection logic
  }

}

const AquaChatComponent = ({ aquaConfig }: { aquaConfig: AquaConfig }) => {

  const [aquaChat, setAquaChat] = useState<AquaChat | null>(null);

  useEffect(() => {
    const initializeAquaChat = () => {
      const chat = new AquaChat(aquaConfig);
      chat.connect();
      setAquaChat(chat);
    };

    initializeAquaChat();

    return () => {
      if (aquaChat) {
        aquaChat.disconnect();
      }
    };
  }, [aquaConfig]);

  return {
    aquaChat,
  };

};

export default AquaChatComponent;
