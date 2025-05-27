import { useState, useEffect } from 'react';
import { DndContext } from '@dnd-kit/core';
import Column from './components/Column';
import StatsPanel from './components/StatsPanel';
import CategoryManager from './components/CategoryManager';
import TaskForm from './components/TaskForm';
import './App.css';
import 'react-datepicker/dist/react-datepicker.css';


const STATUSES = [
  { id: 'todo', title: 'Do zrobienia', color: '#ff7675' },
  { id: 'inprogress', title: 'W trakcie', color: '#fdcb6e' },
  { id: 'done', title: 'Gotowe', color: '#55efc4' }
];

function App() {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState(['praca', 'dom', 'hobby']);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('tasks')) || [];
    console.log('Loaded tasks from localStorage:', saved);
    setTasks(saved);

    const cats = JSON.parse(localStorage.getItem('categories')) || categories;
    console.log('Loaded categories from localStorage:', cats);
    setCategories(cats);
  }, []);

  useEffect(() => {
    console.log('Saving tasks to localStorage:', tasks);
    localStorage.setItem('tasks', JSON.stringify(tasks));

    console.log('Saving categories to localStorage:', categories);
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [tasks, categories]);

  const addTask = (task) => {
    const newTask = {
      ...task,
      id: `task-${Date.now()}`, // Ensure id is a string
      status: 'todo',
    };
    console.log('Adding new task:', newTask);
    setTasks((prev) => [...prev, newTask]);
  };

  const addCategory = (name) => {
    if (name && !categories.includes(name)) {
      console.log('Adding new category:', name);
      setCategories(prev => [...prev, name]);
    }
  };

  const onDragEnd = (event) => {
    const { active, over } = event;

    if (!over) {
      console.log('Dropped outside a droppable area');
      return;
    }

    if (active.id === over.id) {
      console.log('Dropped in the same position');
      return;
    }

    setTasks((prev) => {
      const updatedTasks = [...prev];
      const taskIndex = updatedTasks.findIndex((task) => task.id === active.id);

      if (taskIndex !== -1) {
        updatedTasks[taskIndex].status = over.id; // Update the task's status to the new column
      }

      return updatedTasks;
    });
  };

  const onDelete = (id) => {
    console.log('Deleting task with id:', id);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="app-container">
      <h1>✨ Super Lista Zadań ✨</h1>
      <div className="top-row">
        <CategoryManager onAdd={addCategory} />
        <StatsPanel tasks={tasks} statuses={STATUSES} />
      </div>

      <TaskForm categories={categories} onAdd={addTask} />

<DndContext onDragEnd={onDragEnd}>
      <div className="columns">
        {STATUSES.map((status) => (
          <Column
            key={status.id}
            id={status.id}
            status={status}
            tasks={tasks.filter((t) => t.status === status.id)}
            onDelete={onDelete}
          />
        ))}
      </div>
    </DndContext>
    </div>
  );
}

export default App;