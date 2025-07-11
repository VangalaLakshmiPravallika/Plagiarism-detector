const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const Course = require('../models/Course');
const User = require('../models/User');

// File upload config
const upload = multer({ dest: 'uploads/' });

// Middleware to ensure faculty
function isFaculty(req, res, next) {
  if (req.user?.role !== 'faculty') {
    return res.status(403).json({ msg: 'Only faculty can perform this action.' });
  }
  next();
}

// POST /api/faculty/upload-students
router.post('/upload-students', isFaculty, upload.single('file'), async (req, res) => {
  const courseId = req.body.courseId;
  if (!req.file || !courseId) {
    return res.status(400).json({ msg: 'File and courseId are required' });
  }

  const filePath = path.resolve(req.file.path);
  const results = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => {
      results.push(data);
    })
    .on('end', async () => {
      try {
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ msg: 'Course not found' });

        for (let row of results) {
          if (!row.email || !row.name) continue;

          let student = await User.findOne({ email: row.email.trim() });
          if (!student) {
            student = new User({
              name: row.name.trim(),
              email: row.email.trim(),
              role: 'student',
            });
            await student.save();
          }

          if (!course.students.includes(student._id)) {
            course.students.push(student._id);
          }
        }

        await course.save();
        fs.unlinkSync(filePath); // Clean up file
        res.json({ msg: 'Students registered successfully', count: results.length });

      } catch (err) {
        console.error('CSV processing error:', err);
        res.status(500).json({ msg: 'Failed to process CSV' });
      }
    });
});

module.exports = router;
