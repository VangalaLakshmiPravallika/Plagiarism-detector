import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import DepartmentHeadDashboard from './pages/DepartmentHeadDashboard';
import StudentUpload from './pages/StudentUpload';
import CreateAssignment from './pages/CreateAssignment';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/faculty" element={<FacultyDashboard />} />
        <Route path="/depthead" element={<DepartmentHeadDashboard />} />
        <Route path="/faculty/upload-students" element={<StudentUpload />} />
        <Route path="/faculty/create-assignment" element={<CreateAssignment />} />
      </Routes>
    </Router>
  );
}

export default App;