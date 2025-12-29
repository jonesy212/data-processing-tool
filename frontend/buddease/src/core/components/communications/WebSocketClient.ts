// WebSocketClient.ts
const ws = new WebSocket('ws://localhost:8080');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'log') {
    // Handle log message in the frontend
    console.log(`[Frontend Log] ${data.message}`);
  }
};

// Example usage
// WebSocketClient.ts can be included in your main application file or module.
