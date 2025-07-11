import React, { useEffect, useState } from 'react';
import axios from 'axios';

function StudentDashboard() {
  const user = JSON.parse(localStorage.getItem('user'));
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [file, setFile] = useState(null);
  const [responseMsg, setResponseMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch all courses this student has submitted or is enrolled in
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API}/api/submissions/courses`);
        setCourses(res.data);
      } catch (err) {
        console.error('Error fetching courses:', err);
      }
    };
    fetchCourses();
  }, []);

  // When a course is selected, fetch assignments
  useEffect(() => {
    const fetchAssignments = async () => {
      if (!selectedCourse) return;

      try {
        const res = await axios.get(`${process.env.REACT_APP_API}/api/courses/${selectedCourse}/assignments`);
        setAssignments(res.data.assignments || []);
      } catch (err) {
        console.error('Error fetching assignments:', err);
        setAssignments([]);
      }
    };
    fetchAssignments();
  }, [selectedCourse]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResponseMsg('');
    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('studentId', user.id || user._id);
    formData.append('course', selectedCourse);
    formData.append('assignmentTitle', selectedAssignment);

    try {
      const res = await axios.post(`${process.env.REACT_APP_API}/api/submissions/upload`, formData);
      const { score, matchedStudent } = res.data;

      setResponseMsg(`✅ Assignment submitted.\nPlagiarism Score: ${(score * 100).toFixed(2)}%.`);
    } catch (err) {
      console.error(err);
      setResponseMsg('❌ Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: 'auto', paddingTop: '40px' }}>
      <h2>Welcome, {user.name} (Student)</h2>

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <label>Select Course:</label>
        <select
          value={selectedCourse}
          onChange={(e) => {
            setSelectedCourse(e.target.value);
            setSelectedAssignment(''); // reset assignment when course changes
          }}
          required
        >
          <option value="">-- Choose a course --</option>
          {courses.map((course, idx) => (
            <option key={idx} value={course}>{course}</option>
          ))}
        </select>

        <br /><br />

        {assignments.length > 0 && (
          <>
            <label>Select Assignment:</label>
            <select
              value={selectedAssignment}
              onChange={(e) => setSelectedAssignment(e.target.value)}
              required
            >
              <option value="">-- Choose an assignment --</option>
              {assignments.map((a, idx) => (
                <option key={idx} value={a.title}>{a.title}</option>
              ))}
            </select>
            <br /><br />
          </>
        )}

        <label>Select File:</label>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          required
        />
        <br /><br />

        <button type="submit" disabled={loading || !selectedAssignment}>
          {loading ? 'Uploading...' : 'Submit Assignment'}
        </button>
      </form>

      {responseMsg && (
        <div style={{ marginTop: '20px', whiteSpace: 'pre-line', color: responseMsg.startsWith('❌') ? 'red' : 'green' }}>
          {responseMsg}
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;
