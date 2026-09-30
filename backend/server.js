const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import the Task model we just created
const Task = require('./models/Task');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// --- ENDPOINT SLICES ---

// 1. POST /api/tasks (Create a task)
// Requirements: title cannot be empty/spaces, priority must be valid
app.post('/api/tasks', async (req, res) => {
  try {
    const { title, priority } = req.body;

    // Edge-case check: title missing or just empty spaces
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Title cannot be empty or only spaces' });
    }

    // Edge-case check: validate priority against allowed values
    if (priority && !['Low', 'Medium', 'High'].includes(priority)) {
      return res.status(400).json({ error: 'Priority must be Low, Medium, or High' });
    }

    const newTask = new Task({
      title: title.trim(),
      priority: priority || 'Medium',
    });

    const savedTask = await newTask.save();
    return res.status(201).json(savedTask);
  } catch (err) {
    console.error('Detailed POST error:', err);
    return res.status(500).json({ error: 'Server error creating task' });
  }
});

// 2. GET /api/tasks (Read all tasks with optional priority filtering)
app.get('/api/tasks', async (req, res) => {
  try {
    const { priority } = req.query;
    const filter = {};

    if (priority) {
      if (!['Low', 'Medium', 'High'].includes(priority)) {
        return res.status(400).json({ error: 'Invalid priority filter' });
      }
      filter.priority = priority;
    }

    // Newest tasks first
    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    return res.json(tasks);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// 3. PUT /api/tasks/:id/complete (Toggle task completion)
app.put('/api/tasks/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;

    // Edge-case check: invalid MongoDB ObjectId (prevents Mongoose CastError crash)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid task ID format' });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    task.completed = !task.completed; // Toggle status
    const updatedTask = await task.save();

    return res.json(updatedTask);
  } catch (err) {
    return res.status(500).json({ error: 'Server error updating task' });
  }
});

// --- SERVER LISTEN & DB CONNECTION ---
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
  });