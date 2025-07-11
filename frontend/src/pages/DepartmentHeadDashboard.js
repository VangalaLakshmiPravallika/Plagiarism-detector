import React, { useState } from 'react';
import axios from 'axios';

function DepartmentHeadDashboard() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [uploadedCourses, setUploadedCourses] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setUploadedCourses([]);

    if (!file) {
      setMessage("❌ Please select a CSV file.");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API}/api/courses/upload-csv`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}` // ensure token is stored in login
          }
        }
      );

      setMessage(`✅ Uploaded ${res.data.inserted.length} courses successfully.`);
      setUploadedCourses(res.data.inserted);
    } catch (err) {
      console.error("Upload error:", err);
      setMessage('❌ Failed to upload. Please check file format or login status.');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: 'auto', padding: '20px' }}>
      <h2>📚 Department Head Dashboard</h2>

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input
          type="file"
          accept=".csv"
          onChange={e => setFile(e.target.files[0])}
          required
        />
        <br /><br />
        <button type="submit">Upload Courses CSV</button>
      </form>

      {message && (
        <p style={{ marginTop: '15px', fontWeight: 'bold' }}>{message}</p>
      )}

      {uploadedCourses.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>✅ Inserted Courses:</h3>
          <ul>
            {uploadedCourses.map(course => (
              <li key={course._id}>
                {course.courseCode} — {course.courseName}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default DepartmentHeadDashboard;
