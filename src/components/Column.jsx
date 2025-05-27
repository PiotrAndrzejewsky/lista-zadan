import { useDroppable, useDraggable } from '@dnd-kit/core';
import TaskItem from './TaskItem';

const DraggableTask = ({ task, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });

  const style = {
    transform: transform
        ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
        : undefined,
    zIndex: isDragging ? 1000 : 'auto',
    position: isDragging ? 'fixed' : 'relative',
    cursor: isDragging ? 'grabbing' : 'grab',
    width: isDragging ? '31%' : 'auto', // ✅ Preserve width while dragging
  };


  return (
      <div ref={setNodeRef} style={style}>
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