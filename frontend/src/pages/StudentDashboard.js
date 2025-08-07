import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styled, { keyframes } from 'styled-components';
import { FaBook, FaTasks, FaUpload, FaUserGraduate, FaSpinner } from 'react-icons/fa';
import { IoMdCheckmarkCircle, IoMdCloseCircle } from 'react-icons/io';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(99, 102, 241, 0); }
  100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const DashboardContainer = styled.div`
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  min-height: 100vh;
  padding: 2rem;
`;

const DashboardCard = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  padding: 2.5rem;
  max-width: 800px;
  margin: 0 auto;
  animation: ${fadeIn} 0.6s ease-out;
`;

const WelcomeHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
`;

const UserIcon = styled.div`
  background: #6366f1;
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  font-size: 1.5rem;
`;

const WelcomeText = styled.div`
  h2 {
    color: #1f2937;
    font-size: 1.75rem;
    margin: 0;
    font-weight: 600;
  }
  
  p {
    color: #6b7280;
    margin: 0.25rem 0 0;
    font-size: 0.9rem;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const FormLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #374151;
  font-weight: 500;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 0.5rem;
    color: #6366f1;
  }
`;

const SelectField = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  background-color: white;
  color: #1f2937;
  appearance: none;
  cursor: pointer;
  transition: all 0.3s;
  
  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
  }
`;

const FileInputContainer = styled.div`
  position: relative;
  margin-top: 0.5rem;
`;

const FileInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px dashed #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  color: #6b7280;
  transition: all 0.3s;
  
  &:hover {
    border-color: #6366f1;
    background: #f9fafb;
  }
  
  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
  }
`;

const FileInputLabel = styled.label`
  display: block;
  padding: 2rem 1rem;
  text-align: center;
  cursor: pointer;
  
  svg {
    font-size: 1.5rem;
    color: #6366f1;
    margin-bottom: 0.5rem;
  }
  
  p {
    margin: 0;
    color: #6b7280;
  }
  
  strong {
    color: #6366f1;
    font-weight: 600;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #4f46e5;
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:focus {
    outline: none;
    animation: ${pulse} 1.5s infinite;
  }
  
  &:disabled {
    background: #d1d5db;
    cursor: not-allowed;
    transform: none;
  }
`;

const Spinner = styled(FaSpinner)`
  animation: ${spin} 1s linear infinite;
  margin-right: 0.5rem;
`;

const ResponseMessage = styled.div`
  margin-top: 1.5rem;
  padding: 1rem;
  border-radius: 8px;
  background: ${props => props.success ? '#ecfdf5' : '#fee2e2'};
  color: ${props => props.success ? '#065f46' : '#b91c1c'};
  display: flex;
  align-items: center;
  animation: ${fadeIn} 0.3s ease-out;
  
  svg {
    font-size: 1.5rem;
    margin-right: 0.75rem;
    flex-shrink: 0;
  }
`;

const DueDateBadge = styled.span`
  background: ${props => {
    const dueDate = new Date(props.dueDate);
    const now = new Date();
    return dueDate < now ? '#fee2e2' : '#fef3c7';
  }};
  color: ${props => {
    const dueDate = new Date(props.dueDate);
    const now = new Date();
    return dueDate < now ? '#b91c1c' : '#92400e';
  }};
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  margin-left: 0.5rem;
  font-weight: 500;
`;

function StudentDashboard() {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [responseMsg, setResponseMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API}/api/submissions/courses`,
          axiosConfig
        );
        setCourses(res.data);
      } catch (err) {
        console.error('Error fetching courses:', err);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!selectedCourse) return;

      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API}/api/courses/${selectedCourse}/assignments`,
          axiosConfig
        );
        setAssignments(res.data.assignments || []);
      } catch (err) {
        console.error('Error fetching assignments:', err);
        setAssignments([]);
      }
    };
    fetchAssignments();
  }, [selectedCourse]);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResponseMsg('');
    setLoading(true);

    const formData = new FormData();
    formData.append('assignmentId', selectedAssignment); 
    formData.append('studentId', user._id); 
    formData.append('file', file);

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API}/api/submissions/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const { score, matchedStudent } = res.data;
      setResponseMsg({
        text: `Assignment submitted successfully.\nPlagiarism Score: ${(score * 100).toFixed(2)}%${matchedStudent ? `\nSimilar to: ${matchedStudent.name}'s submission` : ''}`,
        success: true
      });
    } catch (err) {
      console.error(err);
      setResponseMsg({
        text: 'Submission failed. Please try again.',
        success: false
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardContainer>
      <DashboardCard>
        <WelcomeHeader>
          <UserIcon>
            <FaUserGraduate />
          </UserIcon>
          <WelcomeText>
            <h2>Welcome back, {user.name}</h2>
            <p>Student Dashboard</p>
          </WelcomeText>
        </WelcomeHeader>

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <FormGroup>
            <FormLabel>
              <FaBook /> Select Course
            </FormLabel>
            <SelectField
              value={selectedCourse}
              onChange={(e) => {
                setSelectedCourse(e.target.value);
                setSelectedAssignment('');
              }}
              required
            >
              <option value="">-- Choose a course --</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.courseName} ({course.courseCode})
                </option>
              ))}
            </SelectField>
          </FormGroup>

          {assignments.length > 0 && (
            <FormGroup>
              <FormLabel>
                <FaTasks /> Select Assignment
              </FormLabel>
              <SelectField
                value={selectedAssignment}
                onChange={(e) => setSelectedAssignment(e.target.value)}
                required
              >
                <option value="">-- Choose an assignment --</option>
                {assignments.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.title}
                    <DueDateBadge dueDate={a.deadline}>
                      Due: {new Date(a.deadline).toLocaleDateString()}
                    </DueDateBadge>
                  </option>
                ))}
              </SelectField>
            </FormGroup>
          )}

          <FormGroup>
            <FormLabel>
              <FaUpload /> Upload Assignment
            </FormLabel>
            <FileInputContainer>
              <FileInputLabel>
                <input
                  type="file"
                  onChange={handleFileChange}
                  required
                  style={{ display: 'none' }}
                  id="fileInput"
                />
                <FaUpload />
                <p>
                  {fileName ? (
                    <strong>{fileName}</strong>
                  ) : (
                    <>
                      <strong>Click to upload</strong> or drag and drop
                    </>
                  )}
                </p>
                {!fileName && <p>PDF, DOCX, or TXT (Max 10MB)</p>}
              </FileInputLabel>
            </FileInputContainer>
          </FormGroup>

          <SubmitButton type="submit" disabled={loading || !selectedAssignment}>
            {loading ? (
              <>
                <Spinner /> Uploading...
              </>
            ) : (
              'Submit Assignment'
            )}
          </SubmitButton>
        </form>

        {responseMsg && (
          <ResponseMessage success={responseMsg.success}>
            {responseMsg.success ? (
              <IoMdCheckmarkCircle />
            ) : (
              <IoMdCloseCircle />
            )}
            <div>{responseMsg.text}</div>
          </ResponseMessage>
        )}
      </DashboardCard>
    </DashboardContainer>
  );
}

export default StudentDashboard;