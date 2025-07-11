const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const Course = require('../models/Course');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware'); // make sure this is imported

function isFaculty(req, res, next) {
  console.log("🔍 Checking faculty access. req.user =", req.user);

  if (!req.user) {
    return res.status(401).json({ msg: 'Unauthorized: No user info found' });
  }

  if (req.user.role !== 'faculty') {
    return res.status(403).json({ msg: `Access denied. Your role is '${req.user.role}', not 'faculty'.` });
  }

  next();
}

router.post('/create', authMiddleware, isFaculty, async (req, res) => {
  const { title, courseId, deadline } = req.body;
  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ msg: 'Course not found' });

    if (course.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: 'You are not the assigned faculty for this course.' });
    }

    const assignment = new Assignment({
      title,
      course: courseId,
      deadline,
      createdBy: req.user._id
    });

    await assignment.save();
    res.json({ msg: 'Assignment created successfully', assignment });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to create assignment' });
  }
});

router.get('/all', async (req, res) => {
  const { courseId, facultyId } = req.query;
  const filter = {};
  if (courseId) filter.course = courseId;
  if (facultyId) filter.createdBy = facultyId;

  try {
    const assignments = await Assignment.find(filter)
      .populate('createdBy', 'name email')
      .populate('course', 'courseCode courseName');
    res.json(assignments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error fetching assignments' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('course', 'courseCode courseName')
      .populate('submissions.student', 'name email');
    if (!assignment) return res.status(404).json({ msg: 'Assignment not found' });
    res.json(assignment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error fetching assignment' });
  }
});

module.exports = router;
