import React, { useEffect, useState } from 'react';
import axios from 'axios';

function FacultyDashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [comparisonResults, setComparisonResults] = useState([]);
  const [csvFile, setCsvFile] = useState(null);
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentDeadline, setAssignmentDeadline] = useState('');

  // Fetch all submissions
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API}/api/submissions/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      .then((res) => setSubmissions(res.data))
      .catch((err) => {
        console.error(err);
        alert('❌ Failed to fetch submissions');
      });
  }, []);

  const handleSelectCourse = (courseId) => {
    setSelectedCourse(courseId);
    setSelectedStudentId('');
    setComparisonResults([]);
    setCsvFile(null);
  };

  const handleSelectStudent = async (studentId) => {
    setSelectedStudentId(studentId);
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API}/api/submissions/similarity/${studentId}?course=${selectedCourse}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setComparisonResults(res.data.comparisons || []);
    } catch (err) {
      console.error(err);
      alert('❌ Failed to fetch similarity data');
    }
  };

  const handleFileChange = (e) => setCsvFile(e.target.files[0]);

  const handleStudentUpload = async () => {
  if (!csvFile || !selectedCourse) {
    alert("Please select a course and choose a CSV file.");
    return;
  }

  const formData = new FormData();
  formData.append("file", csvFile);
  formData.append("courseId", selectedCourse); // 👈 Match backend field

  try {
    const res = await axios.post(
      `${process.env.REACT_APP_API}/api/faculty/upload-students`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    alert(res.data.msg || "✅ Students uploaded successfully");
  } catch (err) {
    console.error(err.response?.data || err.message);
    alert("❌ Failed to upload students");
  }
};


  const handleCreateAssignment = async () => {
    if (!assignmentTitle || !assignmentDeadline) {
      alert("Please enter both title and deadline.");
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
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      alert(res.data.msg || "Assignment created");
      setAssignmentTitle('');
      setAssignmentDeadline('');
    } catch (err) {
      console.error(err);
      alert("❌ Failed to create assignment");
    }
  };


  // Extract unique courses
  const courses = Array.from(
    new Map(
      submissions
        .filter((s) => s.course && s.course._id)
        .map((s) => [s.course._id, s.course])
    ).values()
  );

  // Extract students in the selected course
  const studentsInCourse = Array.from(
    new Map(
      submissions
        .filter((s) => s.course && s.course._id === selectedCourse && s.student)
        .map((s) => [s.student._id, s.student])
    ).values()
  );

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>📘 Faculty Dashboard</h2>

      {/* Course Selector */}
      <div style={{ marginBottom: '15px' }}>
        <label><strong>Select Course:</strong> </label>
        <select value={selectedCourse} onChange={(e) => handleSelectCourse(e.target.value)}>
          <option value="">-- Choose a course --</option>
          {courses.map((course) => (
            <option key={course._id} value={course._id}>
              {course.courseCode} - {course.courseName}
            </option>
          ))}
        </select>
      </div>

      {/* Upload CSV for Students */}
      {selectedCourse && (
        <div style={{ marginBottom: '20px' }}>
          <h4>👥 Upload Registered Students (CSV)</h4>
          <input type="file" accept=".csv" onChange={handleFileChange} />
          <button onClick={handleStudentUpload} style={{ marginLeft: '10px' }}>
            Upload Students
          </button>
        </div>
      )}

      {/* Create Assignment */}
      {selectedCourse && (
        <div style={{ marginBottom: '30px' }}>
          <h4>📝 Create Assignment</h4>
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
      )}

      {/* Student Selector */}
      {selectedCourse && (
        <div style={{ marginBottom: '15px' }}>
          <label><strong>Select Student:</strong> </label>
          <select value={selectedStudentId} onChange={(e) => handleSelectStudent(e.target.value)}>
            <option value="">-- Choose a student --</option>
            {studentsInCourse.map((student) => (
              <option key={student._id} value={student._id}>
                {student.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Similarity Report */}
      {comparisonResults.length > 0 ? (
        <div>
          <h3>📊 Similarity Report</h3>
          <table border="1" cellPadding="8" style={{ marginTop: '10px', width: '100%' }}>
            <thead>
              <tr>
                <th>Other Student</th>
                <th>Similarity (%)</th>
                <th>Upload Time</th>
              </tr>
            </thead>
            <tbody>
              {comparisonResults.map((result, idx) => (
                <tr key={idx}>
                  <td>{result.name || 'Unknown'}</td>
                  <td>{(result.similarity || 0).toFixed(2)}%</td>
                  <td>
                    {result.uploadTime
                      ? new Date(result.uploadTime).toLocaleString()
                      : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : selectedStudentId ? (
        <p style={{ marginTop: '10px', color: 'gray' }}>No similarity records found.</p>
      ) : null}

      {/* Fallback if no submissions */}
      {!submissions.length && (
        <p style={{ marginTop: '20px', color: 'gray' }}>
          No submissions available yet.
        </p>
      )}
    </div>
  );
}

export default FacultyDashboard;
