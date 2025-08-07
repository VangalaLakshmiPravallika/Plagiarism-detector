import React, { useState } from 'react';
import axios from 'axios';

function CreateAssignmentPage() {
  const [selectedCourse, setSelectedCourse] = useState('');
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentDeadline, setAssignmentDeadline] = useState('');

  const token = localStorage.getItem('token');

  const handleCreateAssignment = async () => {
    if (!assignmentTitle || !assignmentDeadline) {
      alert('Please enter both title and deadline.');
      return;
    }

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API}/api/assignments/create`,
        {
          title: assignmentTitle,
          courseId: selectedCourse,
          deadline: assignmentDeadline,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.msg || 'Assignment created');
      setAssignmentTitle('');
      setAssignmentDeadline('');
    } catch (err) {
      console.error(err);
      alert(' Failed to create assignment');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2> Create Assignment</h2>

      <label><strong>Enter Course ID:</strong></label>
      <input
        type="text"
        value={selectedCourse}
        onChange={(e) => setSelectedCourse(e.target.value)}
        placeholder="Course ID"
        style={{ marginRight: '10px' }}
      />

      <br /><br />

      <input
        type="text"
        placeholder="Assignment Title"
        value={assignmentTitle}
        onChange={(e) => setAssignmentTitle(e.target.value)}
        style={{ marginRight: '10px' }}
      />

      <input
        type="datetime-local"
        value={assignmentDeadline}
        onChange={(e) => setAssignmentDeadline(e.target.value)}
        style={{ marginRight: '10px' }}
      />

      <button onClick={handleCreateAssignment}>Create</button>
    </div>
  );
}

export default CreateAssignmentPage;
