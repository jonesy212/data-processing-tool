// WebSocketServer.ts
import Logger from '@/app/components/logging/Logger';
import WebSocket from 'ws';

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('WebSocket connection established');

  // Example: Send log message to the frontend
  ws.send(JSON.stringify({ type: 'log', message: 'Backend log message' }));
});

// Your existing logging code
Logger.log('Info', 'Log message', 'uniqueID');
