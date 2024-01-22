//emitPanOffsetUpdate.ts
import socketIOClient from 'socket.io-client';

// Replace 'http://your-backend-endpoint' with your actual backend endpoint
const ENDPOINT = 'http://your-backend-endpoint';

// Create a socket instance
const socket = socketIOClient(ENDPOINT);

// Function to emit pan offset update to the server
const emitPanOffsetUpdate = (panOffset) => {
  // Emit the pan offset update to the server
  socket.emit('panOffsetUpdate', panOffset);
};

// Handle pan offset update received from the server
socket.on('panOffsetUpdate', (updatedPanOffset) => {
  // Handle the received pan offset update
  // Update your local state or perform other actions as needed
  handleReceivedPanOffsetUpdate(updatedPanOffset);
});

// Function to handle received pan offset update
const handleReceivedPanOffsetUpdate = (updatedPanOffset) => {
  // Update your local state or perform other actions with the received pan offset
  setPanOffset(updatedPanOffset);
};

export { emitPanOffsetUpdate, handleReceivedPanOffsetUpdate };
