const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const Course = require('../models/Course'); // ✅ Add this


const router = express.Router();

// ✅ Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ msg: 'All fields are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed, role });
    await user.save();

    res.json({ msg: 'Registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ✅ Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/faculty-courses', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'faculty') {
      return res.status(403).json({ msg: 'Only faculty can access this' });
    }

    console.log("Authenticated user:", req.user); // 🔍 Log user

    const courses = await Course.find({ faculty: req.user._id });
    res.json({ courses });
  } catch (err) {
    console.error("Error in /faculty-courses:", err); // 🔍 Log full error
    res.status(500).json({ msg: 'Server error', error: err.message }); // Optional: include err.message
  }
});


// ✅ Get current logged-in user
router.get('/me', authMiddleware, (req, res) => {
  res.json(req.user);
});

module.exports = router;
