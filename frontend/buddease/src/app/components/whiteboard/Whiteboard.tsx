import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import io, { Socket as SocketIOClientSocket } from "socket.io-client";
import { DrawingActions } from "../actions/DrawingActions";
import { setIsDrawing } from "../state/redux/slices/DrawingSlice";
import { RootState } from "../state/redux/slices/RootSlice";



interface Whiteboard {
  id: string; // Assuming id is a string, adjust if it's a different type
  // Add other properties if needed
}


interface CanvasProps extends React.CanvasHTMLAttributes<HTMLCanvasElement> {
  id: string;
  onPan: (offsetX: number, offsetY: number) => void;
}

const WhiteboardCanvas: React.FC<CanvasProps> = ({ onPan, id }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [socket, setSocket] = useState<SocketIOClientSocket | null>(null);
  const isDrawing = useSelector(
    (state: RootState) => state.drawingManager.isDrawing
  );
  const dispatch = useDispatch();
  const [singleCanvasMode, setSingleCanvasMode] = useState(true); // Toggle between single canvas and multiple canvases

  useEffect(() => {
    const newSocket = io("http://localhost:3000"); // Replace with your server URL
    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  const handleCanvasDraw = (
    canvas: HTMLCanvasElement,
    event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    if (!isDrawing) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.lineTo(event.nativeEvent.offsetX, event.nativeEvent.offsetY);
    context.stroke();

    // Emit drawing data to the server, if needed
    if (socket) {
      const data = {
        startX: event.nativeEvent.offsetX,
        startY: event.nativeEvent.offsetY,
        endX: event.nativeEvent.offsetX,
        endY: event.nativeEvent.offsetY,
      };
      socket.emit("draw", data);
    }

    // Call drawLine function
    drawLine(context, {
      startX: event.nativeEvent.offsetX,
      startY: event.nativeEvent.offsetY,
      endX: event.nativeEvent.offsetX,
      endY: event.nativeEvent.offsetY,
    });
  };


  const toggleCanvasMode = () => {
    setSingleCanvasMode(!singleCanvasMode);
  };

  const renderCanvases = () => {
    const canvasCount = singleCanvasMode ? 1 : 4;
    const canvases = [];

    for (let i = 0; i < canvasCount; i++) {
      canvases.push(
        <canvas
          key={`canvas-${i}`}
          className="whiteboard-canvas"
          width={800}
          height={600}
          onMouseDown={(e) => handleCanvasDraw(e.currentTarget, e)}
          onMouseMove={(e) => handleCanvasDraw(e.currentTarget, e)}
        ></canvas>
      );
    }

    return canvases;
  };

  const handleMouseDown = (
    event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    dispatch(DrawingActions.startDrawing(event));
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.beginPath();
    context.moveTo(event.nativeEvent.offsetX, event.nativeEvent.offsetY);
  };

  const handleMouseUp = () => {
    dispatch(DrawingActions.stopDrawing());
    finishDrawing(); // Call finishDrawing when mouse is released
  };

  const handleMouseMove = (
    event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.lineTo(event.nativeEvent.offsetX, event.nativeEvent.offsetY);
    context.stroke();
    // Emit drawing data to the server, if needed
  };

  const handleClearDrawing = () => {
    dispatch(DrawingActions.clearDrawing());
  };

  const startDrawing = (
    event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.beginPath();
    context.moveTo(event.nativeEvent.offsetX, event.nativeEvent.offsetY);
  };

  const finishDrawing = () => {
    setIsDrawing(false);
  };

  const drawLine = (context: CanvasRenderingContext2D, data: any) => {
    context.beginPath();
    context.moveTo(data.startX, data.startY);
    context.lineTo(data.endX, data.endY);
    context.stroke();
  };

  return (
    <div className="whiteboard-container">
      {/* Toggle button to switch between single canvas and multiple canvases */}
      <button onClick={toggleCanvasMode}>
        {singleCanvasMode
          ? "Switch to Multiple Canvases"
          : "Switch to Single Canvas"}
      </button>
      {/* Render canvases based on mode */}
      {renderCanvases()}
      {/* Single canvas mode */}
      {singleCanvasMode && (
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          onMouseDown={(e) => handleMouseDown(e)}
          onMouseUp={handleMouseUp}
          onMouseMove={(e) => handleMouseMove(e)}
          onClick={handleClearDrawing}
        ></canvas>
      )}
    </div>
  );
};

export default WhiteboardCanvas;
export type { CanvasProps, Whiteboard };
