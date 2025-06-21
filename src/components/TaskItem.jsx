import React from 'react';

const TaskItem = React.forwardRef(({ task, onDelete, dragProps = {} }, ref) => (
    <div className="task-item" ref={ref}>
        <button
            className="delete-btn"
            onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
            }}
        >
            &times;
        </button>

        <div
            className="task-content"
            {...dragProps.draggableProps}
            {...dragProps.dragHandleProps}
            style={{ flex: 1, cursor: 'grab' }}
        >
            <span className="task-text">{task.text}</span>
            <div className="task-meta">
                <span className="category">{task.category}</span>
                <span className="deadline">{new Date(task.deadline).toLocaleDateString()}</span>
            </div>
        </div>
    </div>
));



export default TaskItem;