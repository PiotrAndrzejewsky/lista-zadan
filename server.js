import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { existsSync } from 'fs';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const dbPath = './tasks.db';
const dbExists = existsSync(dbPath);

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error('Error opening database', err);
    return;
  }

  console.log('Connected to the SQLite database');
  
  if (!dbExists) {
    initializeDatabase();
  }
  else {
    console.log("Database already exists, skipping initialization");
    db.all('SELECT * FROM tasks', (err, rows) => {
      if (err) {
        console.error('Error fetching tasks:', err);
      }
      console.log(rows);
    });
  }
});

function initializeDatabase() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE columns (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        color TEXT NOT NULL
      )
    `);

    db.run(`
      CREATE TABLE tasks (
        id TEXT PRIMARY KEY,
        text TEXT NOT NULL,
        category TEXT NOT NULL,
        deadline TEXT NOT NULL,
        priority INTEGER NOT NULL,
        status TEXT NOT NULL,
        FOREIGN KEY (status) REFERENCES columns(id)
      )
    `);

    const defaultColumns = [
      { id: 'todo', title: 'Do zrobienia', color: '#ff7675' },
      { id: 'inprogress', title: 'W trakcie', color: '#fdcb6e' },
      { id: 'done', title: 'Gotowe', color: '#55efc4' }
    ];

    const stmt = db.prepare('INSERT INTO columns (id, title, color) VALUES (?, ?, ?)');
    defaultColumns.forEach(col => {
      stmt.run(col.id, col.title, col.color);
    });
    stmt.finalize();

    const defaultCategories = ['praca', 'dom', 'hobby'];
    defaultCategories.forEach(cat => {
      db.run(
        'INSERT INTO tasks (id, text, category, deadline, priority, status) VALUES (?, ?, ?, ?, ?, ?)',
        [`task-${Date.now()}-${cat}`, `Przykładowe zadanie ${cat}`, cat, new Date().toISOString(), 2, 'todo']
      );
    });

    console.log('Database initialized with default data');
  });
}

// API Routes

// Get all columns
app.get('/api/columns', (req, res) => {
  db.all('SELECT * FROM columns', (err, rows) => {
    if (err) {
      console.error('Error fetching columns:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get all tasks
app.get('/api/tasks', (req, res) => {
  db.all('SELECT * FROM tasks', (err, rows) => {
    if (err) {
      console.error('Error fetching tasks:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Add a new task
app.post('/api/tasks', (req, res) => {
  const { text, category, deadline, priority } = req.body;
  const id = `task-${Date.now()}`;
  const status = 'todo';

  db.run(
    'INSERT INTO tasks (id, text, category, deadline, priority, status) VALUES (?, ?, ?, ?, ?, ?)',
    [id, text, category, deadline, priority, status],
    function(err) {
      if (err) {
        console.error('Error adding task:', err);
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id, text, category, deadline, priority, status });
    }
  );
});

// Update task status
app.put('/api/tasks/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  db.run(
    'UPDATE tasks SET status = ? WHERE id = ?',
    [status, id],
    function(err) {
      if (err) {
        console.error('Error updating task status:', err);
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ success: true });
    }
  );
});

// Delete a task
app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM tasks WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Error deleting task:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ success: true });
  });
});

// Get all categories (distinct from tasks)
app.get('/api/categories', (req, res) => {
  db.all('SELECT DISTINCT category FROM tasks', (err, rows) => {
    if (err) {
      console.error('Error fetching categories:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    const categories = rows.map(row => row.category);
    res.json(categories);
  });
});

// Add a new category (by creating a task with that category)
app.post('/api/categories', (req, res) => {
  const { category } = req.body;

  // Verify the category doesn't already exist
  db.get('SELECT 1 FROM tasks WHERE category = ? LIMIT 1', [category], (err, row) => {
    if (err) {
      console.error('Error checking category:', err);
      res.status(500).json({ error: err.message });
      return;
    }

    if (row) {
      res.json({ success: true, message: 'Category already exists' });
      return;
    }

    // Add a sample task with the new category
    const id = `task-${Date.now()}`;
    db.run(
      'INSERT INTO tasks (id, text, category, deadline, priority, status) VALUES (?, ?, ?, ?, ?, ?)',
      [id, `Sample task for ${category}`, category, new Date().toISOString(), 2, 'todo'],
      function(err) {
        if (err) {
          console.error('Error adding category:', err);
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ success: true });
      }
    );
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});