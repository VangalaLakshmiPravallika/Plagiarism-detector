import React, { useState } from 'react';
import axios from 'axios';

function UploadStudentsPage() {
  const [csvFile, setCsvFile] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState('');

  const token = localStorage.getItem('token');

  const handleFileChange = (e) => setCsvFile(e.target.files[0]);

  const handleStudentUpload = async () => {
    if (!csvFile || !selectedCourse) {
      alert('Please select a course and choose a CSV file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', csvFile);
    formData.append('courseId', selectedCourse);

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API}/api/faculty/upload-students`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      alert(res.data.msg || 'Students uploaded successfully');
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert(' Failed to upload students');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>👥 Upload Registered Students</h2>

      <label><strong>Enter Course ID:</strong></label>
      <input
        type="text"
        value={selectedCourse}
        onChange={(e) => setSelectedCourse(e.target.value)}
        placeholder="Course ID"
        style={{ marginRight: '10px' }}
      />

      <br /><br />

      <input type="file" accept=".csv" onChange={handleFileChange} />
      <button onClick={handleStudentUpload}>Upload Students</button>
    </div>
  );
}

export default UploadStudentsPage;
