WebSocketServer.ts
import Logger from '@/core/logging/Logger';
import { WebSocketServer } from 'ws'; // Changed import

const wss = new WebSocketServer({ port: 8080 }); // Using WebSocketServer class

wss.on('connection', (ws) => {
  console.log('WebSocket connection established');

  // Example: Send log message to the frontend
  ws.send(JSON.stringify({ type: 'log', message: 'Backend log message' }));
});

// Your existing logging code
Logger.log('Info', 'Log message', 'uniqueID');
