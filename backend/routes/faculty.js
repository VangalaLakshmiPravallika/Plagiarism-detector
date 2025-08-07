const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const Course = require('../models/Course');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');

const upload = multer({ dest: 'uploads/' });

function isFaculty(req, res, next) {
  if (req.user?.role !== 'faculty') {
    return res.status(403).json({ msg: 'Only faculty can perform this action.' });
  }
  next();
}

router.get('/courses', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'faculty') {
      return res.status(403).json({ msg: 'Access denied. Only faculty can view their courses.' });
    }

    const courses = await Course.find({ faculty: req.user._id });
    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error while fetching courses' });
  }
});

router.post(
  '/upload-students',
  authMiddleware,
  isFaculty,
  upload.single('file'),
  async (req, res) => {
    const courseId = req.body.courseId;
    if (!req.file || !courseId) {
      return res.status(400).json({ msg: 'File and courseId are required' });
    }

    const filePath = path.resolve(req.file.path);
    const results = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          console.log('Parsed CSV rows:', results);

          const course = await Course.findById(courseId);
          if (!course) return res.status(404).json({ msg: 'Course not found' });

          if (!Array.isArray(course.registeredStudents)) {
            course.registeredStudents = [];
          }

          let addedCount = 0;

          for (let row of results) {
            if (!row.email || !row.name) {
              console.warn('Skipping invalid row:', row);
              continue;
            }

            const email = row.email.trim();
            const name = row.name.trim();

            let student = await User.findOne({ email });

            if (!student) {
              const defaultPassword = 'student123';
              const hashedPassword = await bcrypt.hash(defaultPassword, 10);

              student = new User({
                name,
                email,
                role: 'student',
                password: hashedPassword,
              });

              await student.save();
              addedCount++;
            }

            if (!course.registeredStudents.includes(student._id)) {
              course.registeredStudents.push(student._id);
            }
          }

          await course.save();
          fs.unlinkSync(filePath); 
          res.json({
            msg: ' Students registered successfully',
            total: results.length,
            newlyCreated: addedCount,
          });

        } catch (err) {
          console.error('CSV processing error:', err);
          res.status(500).json({ msg: 'Failed to process CSV' });
        }
      });
  }
);

module.exports = router;
