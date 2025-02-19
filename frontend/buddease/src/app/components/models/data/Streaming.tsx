// StreamProcessor.ts
import readline from "readline";
import socketIOClient from "socket.io-client";
import { Readable } from "stream";
import { ENDPOINT } from "../../hooks/commHooks/useRealtimeData";
class StreamProcessor {
  processCSVStream(inputStream: Readable, onData: (data: any) => void): void {
    const socket = socketIOClient(ENDPOINT);

    const rl = readline.createInterface({
      input: inputStream,
      crlfDelay: Infinity,
    });

    rl.on("line", (line) => {
      // Process each line of the CSV stream
      const data = parseDocumentLine(line); // Implement logic for parsing various document formats
      onData(data);
    });

    rl.on("close", () => {
      // The entire stream has been read
      socket.disconnect();
    });
  }
}

function parseDocumentLine(line: string): any {
  const data = JSON.parse(line);

  // Send the parsed data to the frontend via WebSocket
  const socket = socketIOClient(ENDPOINT);
  socket.emit("updateData", data);

  return data;
}

export { parseDocumentLine };
export default StreamProcessor;
