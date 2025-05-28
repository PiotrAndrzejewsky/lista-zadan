import { useState, useEffect } from 'react';
import { DndContext, TouchSensor, MouseSensor, useSensor, useSensors } from '@dnd-kit/core';
import Column from './components/Column';
import StatsPanel from './components/StatsPanel';
import CategoryManager from './components/CategoryManager.jsx';
import TaskForm from './components/TaskForm.jsx';
import './App.css';
import 'react-datepicker/dist/react-datepicker.css';

const withPort = (path) => {
  const url = new URL(window.location.origin);
  url.port = 5000;
  url.pathname = path;
  return url.toString();
};

function App() {
  const sensors = useSensors(
      useSensor(MouseSensor),
      useSensor(TouchSensor, {
        activationConstraint: {
          delay: 0,
          tolerance: 5,
        },
      })
  );

  const [tasks, setTasks] = useState([]);
  const [columns, setColumns] = useState([]);
  const [categories, setCategories] = useState(['praca', 'dom', 'hobby']);

  useEffect(() => {
    fetchColumns();
    fetchTasks();
    fetchCategories();
  }, []);

  const fetchColumns = async () => {
    try {
      const response = await fetch(withPort('/api/columns'));
      const data = await response.json();
      setColumns(data);
    } catch (error) {
      console.error('Error fetching columns:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch(withPort('/api/tasks'));
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(withPort('/api/categories'));
      const data = await response.json();
      if (data.length > 0) {
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const addTask = async (task) => {
    try {
      const response = await fetch(withPort('/api/tasks'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
      });
      const newTask = await response.json();
      setTasks((prev) => [...prev, newTask]);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const addCategory = async (name) => {
    if (name && !categories.includes(name)) {
      try {
        await fetch(withPort('/api/categories'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ category: name }),
        });
        setCategories((prev) => [...prev, name]);
      } catch (error) {
        console.error('Error adding category:', error);
      }
    }
  };

  const onDragEnd = async (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    try {
      await fetch(withPort(`/api/tasks/${active.id}/status`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: over.id }),
      });

      setTasks((prev) =>
          prev.map((task) => (task.id === active.id ? { ...task, status: over.id } : task))
      );
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const onDelete = async (id) => {
    try {
      await fetch(withPort(`/api/tasks/${id}`), {
        method: 'DELETE',
      });
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  return (
      <div className="app-container">
        <h1>✨ Super Lista Zadań ✨</h1>
        <div className="top-row">
          <CategoryManager onAdd={addCategory} />
          <StatsPanel tasks={tasks} statuses={columns} />
        </div>

        <TaskForm categories={categories} onAdd={addTask} />

        <DndContext sensors={sensors} onDragEnd={onDragEnd}>
          <div className="columns">
            {columns.map((column) => (
                <Column
                    key={column.id}
                    id={column.id}
                    status={column}
                    tasks={tasks.filter((t) => t.status === column.id)}
                    onDelete={onDelete}
                />
            ))}
          </div>
        </DndContext>
      </div>
  );
}

export default App;
