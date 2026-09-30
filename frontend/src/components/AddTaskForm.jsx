import React, { useState } from 'react';

export default function AddTaskForm({ onTaskAdded }) {
  // Local state for our form inputs
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Workshop requirement: reject empty or space-only input
    if (!title.trim()) {
      setError('Title cannot be empty or just spaces.');
      return;
    }

    // Clear any previous error before submitting
    setError('');

    try {
      // Connect to your local backend (port 5000)
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          priority: priority,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create task');
      }

      const newTask = await res.json();
      
      // Pass the saved task up to the parent list
      onTaskAdded(newTask);

      // Reset form fields
      setTitle('');
      setPriority('Medium');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
      <div>
        <input
          type="text"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ padding: '8px', marginRight: '8px', width: '240px' }}
        />

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          style={{ padding: '8px', marginRight: '8px' }}
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        <button type="submit" style={{ padding: '8px 16px', cursor: 'pointer' }}>
          Add Task
        </button>
      </div>

      {/* Show validation errors if any */}
      {error && <p style={{ color: 'red', marginTop: '6px', fontSize: '14px' }}>{error}</p>}
    </form>
  );
}