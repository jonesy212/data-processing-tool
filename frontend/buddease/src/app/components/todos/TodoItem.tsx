import React, { useRef } from 'react';
import { DropTargetMonitor, useDrag, useDrop } from 'react-dnd';
import { Todo } from './Todo'; // Adjust import path based on your file structure
import { ItemTypes } from '../models/content/ItemTypes';

interface DragItem {
  type: string;
  id: string;
  index: number;
}

interface TodoItemProps {
  todo: Todo;
  index: number;
  moveTodo: (dragIndex: number, hoverIndex: number) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, index, moveTodo }) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.TODO_ITEM, 
    item: { id: todo.id, type: ItemTypes.TODO_ITEM },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemTypes.TODO_ITEM,
    hover: (item: DragItem, monitor: DropTargetMonitor) => {
        if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();

      if (!clientOffset) {
        return;
      }

      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveTodo(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  const opacity = isDragging ? 0.5 : 1;

  // Handle drop events
  const handleDrop = () => {
    // Implement drop logic here
  };

  // Handle drag over events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    // Implement drag over logic here
  };

  return (
    <div
      ref={ref}
      style={{ opacity }}
      draggable
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div>
        <h2>{todo.title}</h2>
        <p>{todo.description}</p>
        {/* Render other details */}
      </div>
    </div>
  );
};

export default TodoItem;
