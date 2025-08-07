import React, { useState, useEffect } from 'react';
import axios from 'axios';

function StudentUpload() {
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API}/api/auth/faculty-courses`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      .then((res) => setCourses(res.data.courses))
      .catch((err) => {
        console.error(err);
        alert('Failed to load courses');
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file || !courseId) {
      alert('Please select a course and upload a CSV file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('courseId', courseId);

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API}/api/faculty/upload-students`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setMessage(res.data.msg);
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>👨‍🏫 Upload Student List for a Course</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Select Course: </label>
          <select value={courseId} onChange={(e) => setCourseId(e.target.value)} required>
            <option value="">-- Select --</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.courseCode} - {course.courseName}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Upload CSV File: </label>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
        </div>

        <button type="submit">Upload</button>
      </form>

      {message && (
        <div style={{ marginTop: '20px', color: 'green' }}>
          <strong>{message}</strong>
        </div>
      )}
    </div>
  );
}

export default StudentUpload;
