import React, { useState, useEffect } from 'react';
import AddTaskForm from './components/AddTaskForm';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Fetch tasks from backend
  const fetchTasks = async (priority = '') => {
    try {
      const url = priority 
        ? `${apiUrl}/api/tasks?priority=${priority}` 
        : `${apiUrl}/api/tasks`;
      const res = await fetch(url);
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    }
  };

  // Run on mount or when priority filter changes
  useEffect(() => {
    fetchTasks(filter);
  }, [filter]);

  // Append new task to list when form submits
  const handleTaskAdded = (newTask) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  // Toggle task complete / undo
  const toggleComplete = async (id) => {
    try {
      const res = await fetch(`${apiUrl}/api/tasks/${id}/complete`, {
        method: 'PUT',
      });
      if (res.ok) {
        const updatedTask = await res.json();
        setTasks((prev) =>
          prev.map((t) => (t._id === id ? updatedTask : t))
        );
      }
    } catch (err) {
      console.error('Error toggling task:', err);
    }
  };

  return (
    <div style={{ maxWidth: '550px', margin: '40px auto', fontFamily: 'Arial, sans-serif' }}>
      <h2>My Task Planner</h2>

      <AddTaskForm onTaskAdded={handleTaskAdded} />

      {/* Filter Dropdown */}
      <div style={{ marginBottom: '15px' }}>
        <label>Filter by Priority: </label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>

      {/* Task List */}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {tasks.length === 0 ? (
          <p style={{ color: '#777' }}>No tasks found.</p>
        ) : (
          tasks.map((task) => (
            <li
              key={task._id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 0',
                borderBottom: '1px solid #eee',
                textDecoration: task.completed ? 'line-through' : 'none',
                color: task.completed ? '#a0aec0' : '#ffffff',
              }}
            >
              <span>
                <strong>[{task.priority}]</strong> {task.title}
              </span>
              <button 
                onClick={() => toggleComplete(task._id)}
                style={{ padding: '4px 10px', cursor: 'pointer' }}
              >
                {task.completed ? 'Undo' : 'Complete'}
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}