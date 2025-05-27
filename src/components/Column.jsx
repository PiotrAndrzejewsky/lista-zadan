import { useDroppable, useDraggable } from '@dnd-kit/core';
import { useState } from 'react';
import TaskItem from './TaskItem';

const DraggableTask = ({ task, onDelete }) => {
    const [offset] = useState({ x: 0, y: 0 });

    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: task.id,
    });

    const dynamicStyle = {
        transform: transform
            ? `translate3d(${transform.x - offset.x}px, ${transform.y - offset.y}px, 0)`
            : undefined,
        zIndex: isDragging ? 1000 : 0,
        position: isDragging ? 'absolute' : 'relative',
        pointerEvents: isDragging ? 'none' : 'auto',
    };

    return (
        <div
            ref={setNodeRef}
            className={`draggable-task ${isDragging ? 'dragging' : ''}`}
            style={dynamicStyle}
            {...attributes}
            {...listeners}
        >
            <TaskItem
                task={task}
                onDelete={onDelete}
                dragProps={{ dragHandleProps: listeners, draggableProps: attributes }}
            />
        </div>
    );
};


const Column = ({ id, status, tasks, onDelete }) => {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div className={`column ${id}`}>
      <h2 style={{ color: status.color }}>{status.title}</h2>
      <div ref={setNodeRef} className="task-list">
        {tasks.map((task) => (
          <DraggableTask key={task.id} task={task} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
};

export default Column;