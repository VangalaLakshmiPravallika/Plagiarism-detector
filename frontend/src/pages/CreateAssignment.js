import React, { useState } from 'react';
import axios from 'axios';

function CreateAssignment() {
  const [form, setForm] = useState({
    courseCode: '',
    title: '',
    dueDate: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await axios.post(`${process.env.REACT_APP_API}/api/courses/create-assignment`, form);
      setMessage(' Assignment created for ' + res.data.course.courseCode);
    } catch (err) {
      console.error(err);
      setMessage(' Failed to create assignment');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto' }}>
      <h2> Create Assignment</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="courseCode"
          placeholder="Course Code"
          value={form.courseCode}
          onChange={handleChange}
          required
        />
        <br /><br />
        <input
          type="text"
          name="title"
          placeholder="Assignment Title"
          value={form.title}
          onChange={handleChange}
          required
        />
        <br /><br />
        <input
          type="date"
          name="dueDate"
          value={form.dueDate}
          onChange={handleChange}
          required
        />
        <br /><br />
        <button type="submit">Create</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default CreateAssignment;
