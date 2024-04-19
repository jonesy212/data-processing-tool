import { emitPanOffsetUpdate } from '@/app/utils/emitPanOffsetUpdate';
import React, { useEffect, useRef, useState } from 'react';
import io,{ Socket as SocketIOClientSocket } from "socket.io-client";
import { RootState } from '../state/redux/slices/RootSlice';
import { useDispatch, useSelector } from 'react-redux';
import { DrawingActions } from '../actions/DrawingActions';
import { setIsDrawing } from '../state/redux/slices/DrawingSlice';


const Whiteboard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [socket, setSocket] = useState<SocketIOClientSocket| null>(null);
  const isDrawing = useSelector((state: RootState) => state.drawingManager.isDrawing);
const dispatch = useDispatch()


 
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Initialize socket connection
    const newSocket =  io('http://localhost:3000'); // Replace with your server URL
    setSocket(newSocket);

    // Event listener for receiving drawing data from other users
    newSocket.on('draw', (data: any) => {
      drawLine(context, data);
    });

    // Cleanup function
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []); // Run only once on component mount



  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    dispatch(DrawingActions.startDrawing(event));
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.beginPath();
    context.moveTo(event.nativeEvent.offsetX, event.nativeEvent.offsetY);
  };

  const handleMouseUp = () => {
    dispatch(DrawingActions.stopDrawing());
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.lineTo(event.nativeEvent.offsetX, event.nativeEvent.offsetY);
    context.stroke();
    // Emit drawing data to the server, if needed
  };

  const handleClearDrawing = () => {
    dispatch(DrawingActions.clearDrawing());
  };





  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.beginPath();
    context.moveTo(event.nativeEvent.offsetX, event.nativeEvent.offsetY);
  };

  const finishDrawing = () => {
    setIsDrawing(false);
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.lineTo(event.nativeEvent.offsetX, event.nativeEvent.offsetY);
    context.stroke();
    const data = {
      startX: event.nativeEvent.offsetX,
      startY: event.nativeEvent.offsetY,
      endX: event.nativeEvent.offsetX,
      endY: event.nativeEvent.offsetY,
    };
    if (socket) {
      socket.emit('draw', data);
    }
  };

  const drawLine = (context: CanvasRenderingContext2D, data: any) => {
    context.beginPath();
    context.moveTo(data.startX, data.startY);
    context.lineTo(data.endX, data.endY);
    context.stroke();
  };

  // Function to handle pan offset update
  const handlePanOffsetUpdate = (panOffset: any) => {
    // Emit pan offset update to the server
    emitPanOffsetUpdate(panOffset);
  };

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      onMouseDown={startDrawing}
      onMouseUp={finishDrawing}
      onMouseMove={draw}
    ></canvas>
  );
};

export default Whiteboard;
