// DraggableDiv.tsx
import React from "react";

import { useState, useRef } from 'react';
import { useDrag } from 'react-dnd';
import { useMovementAnimations } from '../animations/movementAnimations/MovementAnimationActions';

export default function DraggableDiv() {
  const [text, setText] = useState('');
  const dragRef = useRef<HTMLDivElement>(null);
  const {  isDragging } = useMovementAnimations();

  const [, drag] = useDrag({
    type: 'div',
    item: { type: 'div' },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });
 
  function handleSend() {
    setTimeout(() => {
      alert('Sending: ' + text);
    }, 3000);
  }

  return (
    <>
      <input
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <div
        ref={dragRef}
        style={{
          border: "1px solid",
          margin: "8px",
          padding: "8px",
          opacity: isDragging ? 0.5 : 1,
          cursor: isDragging ? "grabbing" : "grab",
        }}
      >
        Drag me
      </div>
      <button
        onClick={handleSend}>
        Send
      </button>
    </>
  );
}
