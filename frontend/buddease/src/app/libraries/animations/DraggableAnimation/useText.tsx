import { useCallback, useState } from 'react';

interface TextProps {
  onDragStart: () => void; // Define the type for onDragStart
  onDragMove: (dragX: number, dragY: number) => void;
  onDragEnd: () => void;
  TextType: string; // Define type for TextType
  text: string; // Change the type of 'text' to string
  onTextDragStart: () => void;
  onTextDragMove: (drawingId: string, dragX: number, dragY: number) => void;
  onTextDragEnd: (dragX: number, dragY: number) => Promise<void>
}

const useText = ({ onDragStart, onDragMove, onDragEnd }: TextProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const beginText = useCallback((event: any) => {
    setIsDragging(true);
    onDragStart();
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
  }, [onDragStart]);

  const handleDragMove = useCallback((event: any) => {
    if (isDragging) {
      const dragX = event.movementX;
      const dragY = event.movementY;
      onDragMove(dragX, dragY);
    }
  }, [isDragging, onDragMove]);

  const handleDragEnd = useCallback((event: any) => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
    onDragEnd();
  }, [handleDragMove, onDragEnd]);

  return { beginText };
};

export default useText;
export type { TextProps };
