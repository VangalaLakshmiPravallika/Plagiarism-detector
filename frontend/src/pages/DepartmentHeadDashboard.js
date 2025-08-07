import React, { useState } from 'react';
import axios from 'axios';
import styled, { keyframes } from 'styled-components';
import { FaUpload, FaFileCsv, FaBook, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { IoMdSchool } from 'react-icons/io';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(99, 102, 241, 0); }
  100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
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

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
`;

const HeaderIcon = styled.div`
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

const HeaderText = styled.div`
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

const FileUploadContainer = styled.div`
  position: relative;
  margin-bottom: 1.5rem;
`;

const FileUploadLabel = styled.label`
  display: block;
  padding: 2rem;
  border: 2px dashed #e5e7eb;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    border-color: #6366f1;
    background: #f9fafb;
  }
`;

const FileUploadContent = styled.div`
  svg {
    font-size: 2rem;
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

const FileInput = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
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
`;

const UploadIcon = styled(FaUpload)`
  margin-right: 0.5rem;
`;

const Message = styled.div`
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

const CoursesList = styled.div`
  margin-top: 2rem;
  animation: ${fadeIn} 0.6s ease-out;
`;

const CoursesTitle = styled.h3`
  color: #1f2937;
  font-size: 1.25rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 0.5rem;
    color: #10b981;
  }
`;

const CourseItem = styled.li`
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  
  &:last-child {
    border-bottom: none;
  }
  
  svg {
    margin-right: 0.75rem;
    color: #6366f1;
  }
`;

const CourseCode = styled.span`
  font-weight: 600;
  color: #1f2937;
  min-width: 80px;
  display: inline-block;
`;

function DepartmentHeadDashboard() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [message, setMessage] = useState('');
  const [uploadedCourses, setUploadedCourses] = useState([]);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setUploadedCourses([]);

    if (!file) {
      setMessage({
        text: "Please select a CSV file.",
        success: false
      });
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
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setMessage({
        text: `Uploaded ${res.data.inserted.length} courses successfully.`,
        success: true
      });
      setUploadedCourses(res.data.inserted);
    } catch (err) {
      console.error("Upload error:", err);
      setMessage({
        text: 'Failed to upload. Please check file format or login status.',
        success: false
      });
    }
  };

  return (
    <DashboardContainer>
      <DashboardCard>
        <Header>
          <HeaderIcon>
            <IoMdSchool />
          </HeaderIcon>
          <HeaderText>
            <h2>Department Head Dashboard</h2>
            <p>Manage course offerings and curriculum</p>
          </HeaderText>
        </Header>

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <FileUploadContainer>
            <FileUploadLabel htmlFor="csv-upload">
              <FileInput
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                required
              />
              <FileUploadContent>
                <FaFileCsv />
                <p>
                  {fileName ? (
                    <strong>{fileName}</strong>
                  ) : (
                    <>
                      <strong>Click to upload</strong> or drag and drop
                    </>
                  )}
                </p>
                {!fileName && <p>CSV files only (Max 10MB)</p>}
              </FileUploadContent>
            </FileUploadLabel>
          </FileUploadContainer>

          <SubmitButton type="submit">
            <UploadIcon /> Upload Courses CSV
          </SubmitButton>
        </form>

        {message && (
          <Message success={message.success}>
            {message.success ? <FaCheckCircle /> : <FaTimesCircle />}
            <div>{message.text}</div>
          </Message>
        )}

        {uploadedCourses.length > 0 && (
          <CoursesList>
            <CoursesTitle>
              <FaCheckCircle /> Inserted Courses
            </CoursesTitle>
            <ul>
              {uploadedCourses.map(course => (
                <CourseItem key={course._id}>
                  <FaBook />
                  <CourseCode>{course.courseCode}</CourseCode>
                  <span>{course.courseName}</span>
                </CourseItem>
              ))}
            </ul>
          </CoursesList>
        )}
      </DashboardCard>
    </DashboardContainer>
  );
}

export default DepartmentHeadDashboard;