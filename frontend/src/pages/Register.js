import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { FaUserGraduate, FaChalkboardTeacher, FaUserTie, FaEnvelope, FaLock, FaUser } from 'react-icons/fa';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(99, 102, 241, 0); }
  100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
`;

const Container = styled.div`
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  padding: 2rem;
`;

const FormCard = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  padding: 2.5rem;
  width: 100%;
  max-width: 450px;
  margin: auto;
  animation: ${fadeIn} 0.6s ease-out;
`;

const Title = styled.h2`
  color: #1e293b;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  text-align: center;
  position: relative;
  
  &:after {
    content: '';
    display: block;
    width: 60px;
    height: 4px;
    background: #6366f1;
    margin: 0.5rem auto 0;
    border-radius: 2px;
  }
`;

const InputGroup = styled.div`
  position: relative;
  margin-bottom: 1.5rem;
`;

const InputIcon = styled.div`
  position: absolute;
  top: 50%;
  left: 1rem;
  transform: translateY(-50%);
  color: #94a3b8;
`;

const InputField = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s;
  color: #1e293b;
  
  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
    
    + ${InputIcon} {
      color: #6366f1;
    }
  }
  
  &::placeholder {
    color: #94a3b8;
  }
`;

const SelectField = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  background-color: white;
  color: #1e293b;
  appearance: none;
  cursor: pointer;
  transition: all 0.3s;
  
  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
  }
`;

const RoleOption = styled.option`
  padding: 0.5rem;
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
`;

const ErrorMessage = styled.p`
  color: #ef4444;
  background: #fee2e2;
  padding: 0.75rem;
  border-radius: 8px;
  margin-top: 1rem;
  text-align: center;
  animation: ${fadeIn} 0.3s ease-out;
`;

const RoleLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
`;

function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  });

  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${process.env.REACT_APP_API}/api/auth/register`, form);
      alert(res.data.msg);
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.msg || "Registration failed. Please try again.";
      setErrorMsg(msg);
      console.error(msg);
    }
  };

  return (
    <Container>
      <FormCard>
        <Title>Create Your Account</Title>
        
        <form onSubmit={handleSubmit}>
          <InputGroup>
            <InputIcon>
              <FaUser />
            </InputIcon>
            <InputField
              name="name"
              type="text"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </InputGroup>
          
          <InputGroup>
            <InputIcon>
              <FaEnvelope />
            </InputIcon>
            <InputField
              name="email"
              type="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              required
            />
          </InputGroup>
          
          <InputGroup>
            <InputIcon>
              <FaLock />
            </InputIcon>
            <InputField
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              minLength="6"
            />
          </InputGroup>
          
          <RoleLabel>Select Your Role</RoleLabel>
          <SelectField name="role" value={form.role} onChange={handleChange}>
            <RoleOption value="student">
              <FaUserGraduate /> Student
            </RoleOption>
            <RoleOption value="faculty">
              <FaChalkboardTeacher /> Faculty
            </RoleOption>
            <RoleOption value="departmentHead">
              <FaUserTie /> Department Head
            </RoleOption>
          </SelectField>
          
          <SubmitButton type="submit">
            Register Now
          </SubmitButton>
          
          {errorMsg && <ErrorMessage>{errorMsg}</ErrorMessage>}
        </form>
      </FormCard>
    </Container>
  );
}

export default Register;