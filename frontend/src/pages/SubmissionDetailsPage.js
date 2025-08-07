import React, { useEffect, useState } from 'react';
import axios from 'axios';

function SubmissionDetailsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [comparisonResults, setComparisonResults] = useState([]);

  const token = localStorage.getItem('token');

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API}/api/submissions/all`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setSubmissions(res.data))
      .catch((err) => {
        console.error(err);
        alert(' Failed to fetch submissions');
      });
  }, []);

  useEffect(() => {
    if (!selectedCourse) {
      setAssignments([]);
      return;
    }

    axios
      .get(`${process.env.REACT_APP_API}/api/courses/${selectedCourse}/assignments`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setAssignments(res.data.assignments || []))
      .catch((err) => {
        console.error(err);
        setAssignments([]);
      });
  }, [selectedCourse]);

  const handleSelectCourse = (courseId) => {
    setSelectedCourse(courseId);
    setSelectedAssignmentId('');
    setSelectedStudentId('');
    setComparisonResults([]);
  };

  const handleSelectStudent = async (studentId) => {
    setSelectedStudentId(studentId);
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API}/api/submissions/similarity/${studentId}?assignmentId=${selectedAssignmentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setComparisonResults(res.data.comparisons || []);
    } catch (err) {
      console.error(err);
      alert(' Failed to fetch similarity data');
    }
  };

  const courses = Array.from(
    new Map(
      submissions
        .filter((s) => s.course && s.course._id)
        .map((s) => [s.course._id, s.course])
    ).values()
  );

  const studentsInAssignment = Array.from(
    new Map(
      submissions
        .filter(
          (s) =>
            s.course &&
            s.course._id === selectedCourse &&
            s.assignment &&
            s.assignment._id === selectedAssignmentId &&
            s.student
        )
        .map((s) => [s.student._id, s.student])
    ).values()
  );

  return (
    <div style={{ padding: '20px' }}>
      <h2> Submissions Check</h2>

      <label><strong>Select Course:</strong></label>
      <select value={selectedCourse} onChange={(e) => handleSelectCourse(e.target.value)}>
        <option value="">-- Choose a course --</option>
        {courses.map((c) => (
          <option key={c._id} value={c._id}>
            {c.courseCode} - {c.courseName}
          </option>
        ))}
      </select>

      {selectedCourse && (
        <>
          <div style={{ marginTop: '20px' }}>
            <label><strong>Select Assignment:</strong></label>
            <select
              value={selectedAssignmentId}
              onChange={(e) => {
                setSelectedAssignmentId(e.target.value);
                setSelectedStudentId('');
                setComparisonResults([]);
              }}
            >
              <option value="">-- Choose an assignment --</option>
              {assignments.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.title} — Due: {new Date(a.deadline).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>

          {selectedAssignmentId && (
            <div style={{ marginTop: '15px' }}>
              <label><strong>Select Student:</strong></label>
              <select
                value={selectedStudentId}
                onChange={(e) => handleSelectStudent(e.target.value)}
              >
                <option value="">-- Choose a student --</option>
                {studentsInAssignment.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </>
      )}

      {comparisonResults.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h3> Similarity Report</h3>
          <table border="1" cellPadding="8" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Compared With</th>
                <th>Similarity (%)</th>
                <th>Uploaded At</th>
              </tr>
            </thead>
            <tbody>
              {comparisonResults.map((r, idx) => (
                <tr key={idx}>
                  <td>{r.name || 'N/A'}</td>
                  <td>{(r.similarity * 100).toFixed(2)}%</td>
                  <td>{new Date(r.uploadTime).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedStudentId && comparisonResults.length === 0 && (
        <p style={{ marginTop: '10px', color: 'gray' }}>No similarity records found.</p>
      )}
    </div>
  );
}

export default SubmissionDetailsPage;
