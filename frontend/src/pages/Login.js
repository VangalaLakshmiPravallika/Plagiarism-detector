import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const res = await axios.post(`${process.env.REACT_APP_API}/api/auth/login`, {
        email,
        password
      });

      const { token, user } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      if (user.role === 'student') navigate('/student');
      else if (user.role === 'faculty') navigate('/faculty');
      else if (user.role === 'departmentHead') navigate('/depthead');
      else navigate('/');
    } catch (err) {
      console.error(err.response?.data || err.message);
      setErrorMsg(err.response?.data?.msg || 'Login failed');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <h2>Login</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        <button type="submit">Login</button>

        {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
      </form>

      <p>
        Don’t have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}

export default Login;
